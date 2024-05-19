import { prisma } from "~/server/db";
import logger from "~/server/logger";
import { Agent, fetch } from "undici";
import type { DepartmentInfo, DepartmentResponse } from "~/server/api/types";
import { Department } from "~/server/api/DepartmentInfo";
import pMap from "p-map";
import { groupBy } from "lodash-es";
import { spotsAvailableEmail } from "~/emails/processors/spotsAvailableEmail";
import { sendMessage } from "~/server/Twilio";
import { getSemester } from "~/utils/semester";
import { validDepartments } from "~/utils/validDepartments";

const ONE_SECOND_MS = 1000;
const timeout = 5 * 60 * ONE_SECOND_MS;

async function parseCourses(departmentInfo: DepartmentInfo) {
  try {
    /*Object key checks for returned JSON - the Schedule of Classes API is a bit finicky and not very reliable*/
    if (!(departmentInfo && departmentInfo.Dept_Info && departmentInfo.Dept_Info.abbreviation)) {
      logger.error("Courses error: " + JSON.stringify(departmentInfo));
      return;
    }

    const semester = getSemester();
    const department = new Department(departmentInfo);
    const departmentsSectionNumbers = department.getSectionNumbersWithAvailability();

    const watchedSections = await prisma.section.findMany({
      where: {
        sectionNumber: { in: departmentsSectionNumbers },
        semester,
        // notified: false,
        student: {
          validAccount: true,
        },
      },
      select: {
        id: true,
        sectionNumber: true,
        student: { select: { id: true, email: true, phone: true, verificationKey: true } },
        isPaid: true,
      },
    });
    const grouped = groupBy(watchedSections, "sectionNumber");
    for (const [sectionNumber, sections] of Object.entries(grouped)) {
      const course = department.getSection(sectionNumber);
      if (course && course.available > 0) {
        const numberOfStudentsWatching = sections.length;
        const paidSections = sections.filter((s) => s.isPaid);
        const spotText = course.available === 1 ? "spot" : "spots";
        const verbText = course.available === 1 ? "is" : "are";
        const otherPeople = `${numberOfStudentsWatching} others ${verbText} watching this section.`;

        for (const section of paidSections) {
          if (section.student.phone) {
            await sendMessage({
              to: section.student.phone,
              message: `${course.available} ${spotText} available for section ${course.sectionNumber} in class ${course.courseID}. ${otherPeople}`,
            });
          }
        }

        for (const section of sections) {
          await spotsAvailableEmail({
            sectionEntry: course,
            email: section.student.email,
            key: section.student.verificationKey,
            numberOfStudentsWatching,
            section,
            student: section.student,
          });
        }

        await prisma.section.updateMany({
          where: {
            id: {
              in: sections.map((s) => s.id),
            },
          },
          data: {
            lastNotified: new Date(),
            notified: true,
          },
        });
      }
    }
  } catch (e: any) {
    logger.error("Error parsing returned JSON: ");
    logger.error(e.message); // error in the above string (in this case, yes)!
  }
}
const refreshDepartment = async (
  department: string,
  withoutHardRefresh: boolean = false,
  semester = getSemester(),
): Promise<null | DepartmentInfo> => {
  const suffix = withoutHardRefresh ? "" : "?refresh=Mary4adAL1ttleLamp";

  const body = await fetch(`http://web-app.usc.edu/web/soc/api/classes/${department}/${semester}${suffix}`, {
    headers: {
      DNT: "1",
      "User-Agent": "https://jldc.me/soc/ Class Refresher",
      "Cache-Control": "max-age=0",
    },
    dispatcher: new Agent({
      bodyTimeout: timeout,
      headersTimeout: timeout,
    }),
  });
  const isValid = body.status === 200;
  if (!isValid) {
    if (withoutHardRefresh) {
      logger.error(`Failed to refresh department ${department} without hard refresh`);
      return null;
    }
    return refreshDepartment(department, true, semester);
  }
  const data = (await body.json()) as DepartmentResponse;
  if (data && "error" in data) {
    console.error(data.error);
    return null;
  }
  return data;
};

const checkForAvailabilityForDepartment = async (department: string) => {
  const data = await refreshDepartment(department);
  if (data) {
    await parseCourses(data);
  }
};

export const runRefresh = async () => {
  const currentSemester = getSemester();
  await checkForAvailabilityForDepartment("CSCI");

  const departments = await prisma.$queryRawUnsafe<{ department: string }[]>(
    `SELECT DISTINCT department FROM "Section" WHERE semester = '${currentSemester}' and notified = false`,
  );

  await pMap(
    departments,
    async (department) => {
      await checkForAvailabilityForDepartment(department.department);
    },
    {
      concurrency: 5,
      stopOnError: false,
    },
  );
};

export const createClassInfo = async () => {
  await refreshDepartment("CSCI");

  await pMap(
    validDepartments,
    async (department) => {
      const currentSemester = getSemester();

      const data = await refreshDepartment(department, true, currentSemester);
      if (!data) {
        return;
      }
      if (!(data && data.Dept_Info && data.Dept_Info.abbreviation)) {
        logger.error("Courses error: " + JSON.stringify(data));
        return;
      }

      const departmentInfo = new Department(data);
      const sectionNumbers = departmentInfo.getSectionNumbers();
      for (const sectionNumber of sectionNumbers) {
        const course = departmentInfo.getSection(sectionNumber);
        if (course) {
          const sectionInfo = {
            department,
            section: sectionNumber,
            courseNumber: course.courseID,
            courseTitle: course.courseName,
            semester: currentSemester,
            instructor: course.instructor ? `${course.instructor.first_name} ${course.instructor.last_name}` : null,
          };
          await prisma.classInfo.upsert({
            where: {
              section_semester: { section: sectionNumber, semester: currentSemester },
            },
            create: sectionInfo,
            update: sectionInfo,
          });
        }
      }
    },
    {
      concurrency: 5,
      stopOnError: false,
    },
  );
};
