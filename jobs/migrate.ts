import mongoose from "mongoose";
import { prisma } from "~/server/db";
import pMap from "p-map";
import { chunk, groupBy, uniq } from "lodash-es";
import { getSemester } from "~/utils/semester";
const connPromise = mongoose.connect("mongodb://127.0.0.1/admin");
const db = mongoose.connection;
mongoose.connection.on("error", console.error.bind(console, "connection error:"));
mongoose.connection.on("open", () => {
  console.info("Mongo Connected");
});

//Update every semester to only query the current reg
const section = {
  sectionNumber: {
    type: String,
  },
  department: {
    type: String,
  },
  notified: {
    type: Boolean,
    default: false,
  },
  phone: {
    type: String,
    default: "",
  },
  rand: {
    type: String,
    default: "",
  },
  fullCourseId: {
    type: String,
  },
  semester: {
    type: String,
    default: () => getSemester(),
  },
  date: {
    type: Date,
    default: new Date().toISOString(),
  },
};
//Main schema. One entry per section per user
const student = new mongoose.Schema({
  email: {
    type: String,
    lowercase: true,
    required: true,
  },
  sectionsWatching: [section],
  verificationKey: String,
  phone: String,
  validAccount: {
    type: Boolean,
    default: false,
  },
  deleted: {
    type: Boolean,
    default: false,
  },
  ip: String,
  uscID: String,
  date: {
    type: Date,
    default: new Date().toISOString(),
  },
});

const studentModel = db.model("students", student);
//Main schema. One entry per section per user
const paidId = new mongoose.Schema({
  semester: {
    type: String,
    default: () => {
      return getSemester();
    },
  },
  paidId: String,
  date: {
    type: Date,
    default: new Date().toISOString(),
  },
});
const paidIdModel = db.model("paidIds", paidId);
// iterate over all the students in the student model and create it in prisma if it doesn't exist
const updatePrisma = async () => {
  await connPromise;
  const students = await studentModel.find({});
  const grouped = groupBy(students, "email");
  const toParse = Object.values(grouped)
    .filter((student) => student.length === 1)
    .flat();

  const doubleEmails = Object.values(grouped).filter((student) => student.length > 1);

  const processStudent = async (student: (typeof toParse)[number]) => {
    const email = student.email.trim();
    let newStudent = await prisma.student.findUnique({
      where: {
        email,
      },
    });
    if (!newStudent) {
      newStudent = await prisma.student.create({
        data: {
          createdAt: student.date,
          email,
          phone: student.phone,
          verificationKey: student.verificationKey!,
          validAccount: student.validAccount,
          deleted: student.deleted,
          uscID: student.uscID,
        },
      });
    }
    // now we need to create the sectionsWatching
    const toCreate = student.sectionsWatching
      .filter((s) => s.department)
      .map((section) => {
        return {
          section: section.sectionNumber!.trim(),
          semester: section.semester,
          notified: section.notified,
          phoneOverride: section.phone,
          paidId: section.rand,
          studentId: newStudent.id,
          createdAt: section.date,
        };
      });
    if (toCreate.length) {
      const created = await prisma.watchedSection.createMany({
        data: toCreate,
        skipDuplicates: true,
      });
      console.log(`Created ${created.count} sections for ${newStudent.email}`);
    }
  };
  for (const student of doubleEmails.flat()) {
    await processStudent(student);
  }
  await pMap(toParse, processStudent, { concurrency: 50, stopOnError: false });
  console.log(`Finished parsing ${toParse.length} students`);
  console.log(`Found ${doubleEmails.length} students with multiple entries`);

  const paidIds = await paidIdModel.find({});
  const ids = uniq(paidIds.map((id) => id.paidId)).filter(Boolean) as string[];
  for (const c of chunk(ids, 250)) {
    await prisma.watchedSection.updateMany({
      where: {
        paidId: {
          in: c,
        },
      },
      data: {
        isPaid: true,
      },
    });
  }
  console.log(`Updated ${ids.length} sections with paid status`);
};
updatePrisma();
const fixDepartmentsAndNames = async () => {
  const skip = 0;
  await prisma.$queryRawUnsafe(`UPDATE "WatchedSection" ws
SET "classInfoId" = ci.id
FROM "ClassInfo" ci
WHERE ws.section = ci.section AND ws.semester = ci.semester;`);
};
