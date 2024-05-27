import { prisma } from "@/server/db";
import logger from "@/server/logger";
import { Agent, fetch } from "undici";
import type { DepartmentElement, DepartmentInfo, DepartmentList, DepartmentResponse } from "@/server/api/types";
import { Department } from "@/server/api/DepartmentInfo";
import pMap from "p-map";
import { groupBy } from "lodash-es";
import { spotsAvailableEmail } from "@/emails/processors/spotsAvailableEmail";
import { sendMessage } from "@/server/Twilio";
import { getNextSemester, getPreviousSemester, getSemester } from "@/utils/semester";

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

    const watchedSections = await prisma.watchedSection.findMany({
      where: {
        section: { in: departmentsSectionNumbers },
        semester,
        // notified: false,
        student: {
          validAccount: true,
        },
      },
      select: {
        id: true,
        section: true,
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

        await prisma.watchedSection.updateMany({
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
  try {
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
    const text = await body.text();
    const data = JSON.parse(text) as DepartmentResponse;
    if (data && "error" in data) {
      console.error(data.error);
      return null;
    }
    return data as DepartmentInfo;
  } catch (e) {
    if (withoutHardRefresh) {
      return null;
    }
    return refreshDepartment(department, true, semester);
  }
};

const getListOfDepartments = async (semester = getSemester()): Promise<null | DepartmentList> => {
  for (let i = 0; i < 3; i++) {
    try {
      const body = await fetch(`https://web-app.usc.edu/web/soc/api/depts/${semester}`, {
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
        return null;
      }
      const data = (await body.json()) as DepartmentList;
      if (data && "error" in data) {
        console.error(data.error);
        return null;
      }
      return data;
    } catch (e) {
      console.error(e);
    }
  }
  return null;
};

const checkForAvailabilityForDepartment = async (department: string) => {
  try {
    const data = await refreshDepartment(department);
    if (data) {
      await parseCourses(data);
    }
  } catch (e) {
    console.error(e);
  }
};

export const runRefresh = async () => {
  const currentSemester = getSemester();

  const departments = await prisma.$queryRawUnsafe<{ department: string }[]>(
    `select distinct coalesce(prefix, department) as department from "ClassInfo" where section in (SELECT DISTINCT section FROM "WatchedSection" WHERE semester = '${currentSemester}' and notified = false) and semester='${currentSemester}'`,
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

const createDepartmentInfo = async (department: string, semester: string) => {
  const data = await refreshDepartment(department, true, semester);
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
      const instructor =
        typeof course.instructor === "string"
          ? course.instructor
          : typeof course.instructor === "object"
            ? [course.instructor.first_name, course.instructor.last_name].filter(Boolean).join(" ")
            : null;
      const sectionInfo = {
        department,
        section: sectionNumber,
        courseNumber: course.courseID,
        courseTitle: course.courseName,
        prefix: course.prefix,
        semester,
        instructor: instructor || null,
        isDistanceLearning: course.isDistanceLearning,
        location: typeof course.location === "string" ? course.location : null,
        session: course.session,
        type: course.type,
        units: course.units,
        day: course.day,
      };
      await prisma.classInfo.upsert({
        where: {
          section_semester: { section: sectionNumber, semester },
        },
        create: sectionInfo,
        update: sectionInfo,
      });
    }
  }
};
export const createClassInfo = async (full = false) => {
  const semesters = new Set<string>(
    [getSemester(), getNextSemester(), getPreviousSemester()].filter(Boolean) as string[],
  );
  if (full) {
    // get the class list from 2009 until now
    const start = 2009;
    const end = new Date().getFullYear();
    for (let i = start; i <= end; i++) {
      semesters.add(`${i}1`);
      semesters.add(`${i}2`);
      semesters.add(`${i}3`);
    }
  }
  for (const semester of semesters) {
    try {
      const departments = await getListOfDepartments(semester);
      if (!departments) {
        continue;
      }
      const departmentCodes = new Set<string>();

      function parseDepartments(dept: DepartmentElement | DepartmentList) {
        if (Array.isArray(dept.department)) {
          for (const department of dept.department) {
            departmentCodes.add(department.code);
            if (department.department) {
              parseDepartments(department);
            }
          }
        } else {
          if (dept.department) {
            departmentCodes.add(dept.department.code);
          }
        }
      }
      parseDepartments(departments);
      console.log(`Found ${departmentCodes.size} departments for ${semester}`);

      await pMap(
        [...departmentCodes],
        async (department) => {
          try {
            await createDepartmentInfo(department, semester);
            console.log(`Finished ${semester} - ${department}`);
          } catch (e: any) {
            console.error(`Error creating class info for ${department} in ${semester}: ${e.message}`);
          }
        },
        {
          concurrency: 25,
          stopOnError: false,
        },
      );
    } catch (e) {
      console.error(e);
    }
  }
};
