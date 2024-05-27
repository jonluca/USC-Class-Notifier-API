import mongoose from "mongoose";
import { prisma } from "@/server/db";
import pMap from "p-map";
import { chunk, groupBy, uniq } from "lodash-es";
import { getSemester } from "@/utils/semester";
import { v4 as uuid } from "uuid";
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
const fixDepartmentsAndNames = async () => {
  const skip = 0;
  await prisma.$queryRawUnsafe(`UPDATE "WatchedSection" ws
SET "classInfoId" = ci.id
FROM "ClassInfo" ci
WHERE ws."classInfoId" is null and ws.section = ci.section AND ws.semester = ci.semester;`);
};

// iterate over all the students in the student model and create it in prisma if it doesn't exist
const updatePrisma = async () => {
  await connPromise;
  const students = await studentModel.find({});
  const grouped = groupBy(students, (e) => e.email.trim());
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
    const phone = toCreate.find((s) => s.phoneOverride);
    if (!newStudent.phone && phone) {
      await prisma.student.update({
        where: {
          id: newStudent.id,
        },
        data: {
          phone: phone.phoneOverride,
        },
      });
    }
    if (toCreate.length) {
      const created = await prisma.watchedSection.createMany({
        data: toCreate,
        skipDuplicates: true,
      });
      console.log(`Created ${created.count} sections for ${newStudent.email}`);
    }
  };
  const dedupedStudents = doubleEmails.flatMap((dupStudent) => {
    const email = dupStudent[0].email.trim();
    const phone = dupStudent.find((s) => s.phone)?.phone;
    const verificationKey = dupStudent.find((s) => s.verificationKey)?.verificationKey;

    const sections = dupStudent.flatMap((s) => s.sectionsWatching);
    const validAccount = dupStudent.some((s) => s.validAccount);

    return {
      ...dupStudent[0],
      sectionsWatching: sections,
      phone,
      email,
      validAccount,
      verificationKey: verificationKey || uuid(),
    };
  });
  await pMap(
    dedupedStudents,
    async (student) => {
      // @ts-ignore
      await processStudent(student);
    },
    { concurrency: 10 },
  );
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
  await fixDepartmentsAndNames();
  console.log("Finished updating prisma");
  process.exit(0);
};
updatePrisma();
