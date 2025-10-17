import { prisma } from "@/server/db";
import logger from "@/server/logger";
import pMap from "p-map";
import { groupBy, uniq } from "lodash-es";
import { spotsAvailableEmail } from "@/emails/processors/spotsAvailableEmail";
import { sendMessage } from "@/server/Twilio";
import { getValidSemesters } from "@/utils/semester";
import { getCurrentAvailableCourses, searchClasses } from "@/server/api/usc-api.ts";
import type { Prisma } from "@app/prisma";
import type { Course } from "@/server/api/types.ts";
import { isProd } from "@/constants.ts";

const checkForAvailabilityForDepartment = async (department: string, semester: string) => {
  try {
    const departmentCourses = await searchClasses({
      searchTerm: department,
      semester,
    });

    const sectionToCourseMap: Record<string, Course> = {};
    const sectionsWithAvailability: string[] = [];
    if (departmentCourses && departmentCourses.courses) {
      for (const course of departmentCourses.courses) {
        if (course.sections) {
          for (const section of course.sections) {
            sectionToCourseMap[section.sisSectionId] = course;
            const availableSpots = section.totalSeats - section.registeredSeats;
            if (availableSpots && availableSpots > 0) {
              sectionsWithAvailability.push(section.sisSectionId);
            }
          }
        }
      }
    }
    if (!sectionsWithAvailability.length) {
      return;
    }

    const watchedSections = await prisma.watchedSection.findMany({
      where: {
        section: { in: sectionsWithAvailability },
        semester,
        notified: false,
        student: {
          validAccount: true,
        },
      },
      select: {
        id: true,
        section: true,
        student: { select: { id: true, email: true, phone: true, verificationKey: true } },
        isPaid: true,
        phoneOverride: true,
      },
    });
    const grouped = groupBy(watchedSections, "section");

    for (const [sectionNumber, sections] of Object.entries(grouped)) {
      const course = sectionToCourseMap[sectionNumber];
      const correspondingSection = course.sections?.find((s) => s.sisSectionId === sectionNumber);
      if (!correspondingSection) {
        continue;
      }
      const availableSpots = correspondingSection.totalSeats - correspondingSection.registeredSeats;

      if (availableSpots) {
        const numberOfStudentsWatching = sections.length;
        const paidSections = sections.filter((s) => s.isPaid);
        const spotText = availableSpots === 1 ? "spot" : "spots";
        const verbText = availableSpots === 1 ? "is" : "are";
        const otherPeople = `${numberOfStudentsWatching} others ${verbText} watching this section.`;

        for (const section of paidSections) {
          const phoneNumber = section.phoneOverride || section.student.phone;
          if (phoneNumber) {
            await sendMessage({
              to: phoneNumber,
              message: `${availableSpots} ${spotText} available for section ${correspondingSection.sisSectionId} in class ${course.fullCourseName}. ${otherPeople}`,
            });
          }
        }

        for (const section of sections) {
          await spotsAvailableEmail({
            sectionEntry: correspondingSection,
            course,
            email: section.student.email,
            key: section.student.verificationKey,
            numberOfStudentsWatching,
            section,
            student: section.student,
            sectionId: section.id,
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
  } catch (e) {
    console.error(e);
  }
};

export const runRefresh = async () => {
  const semesters = getValidSemesters();

  for (const semester of semesters) {
    try {
      await refreshSemester(semester);
    } catch (e: any) {
      console.error(`Error refreshing semester ${semester}: ${e}`);
    }
  }
};

const refreshSemester = async (semester: string) => {
  const departments = await prisma.$queryRawUnsafe<{ department: string }[]>(
    `select distinct coalesce(prefix, department) as department from "ClassInfo" where section in (SELECT DISTINCT section FROM "WatchedSection" WHERE semester = '${semester}' and notified = false) and semester='${semester}'`,
  );

  if (!departments.length) {
    return;
  }
  await pMap(
    departments,
    async (department) => {
      await checkForAvailabilityForDepartment(department.department, semester);
    },
    {
      concurrency: 5,
      stopOnError: false,
    },
  );
};

export const createClassInfo = async () => {
  const semesters = new Set<string>(getValidSemesters().filter(Boolean) as string[]);

  for (const semester of semesters) {
    try {
      const courses = await getCurrentAvailableCourses({ semester });
      if (!courses) {
        continue;
      }
      const departments = uniq(courses.courses.map((course) => course.prefix));

      await pMap(
        departments,
        async (department) => {
          try {
            const searchResults = await searchClasses({
              searchTerm: department,
              semester,
            });
            // now iterate over the classes, and create class info entries for each section in the department
            if (!searchResults || !searchResults.courses) {
              console.error(`No search results for department ${department} in semester ${semester}`);
              return;
            }
            const departmentCourses = searchResults.courses.filter((c) => c.prefix === department);
            for (const course of departmentCourses) {
              if (!course.sections) {
                continue;
              }
              for (const section of course.sections) {
                try {
                  const sectionNumber = section.sisSectionId;
                  const instructorNames = (section.instructors || [])
                    .map((inst) => [inst.firstName, inst.lastName].filter(Boolean).join(" "))
                    .join(", ");
                  const sectionInfo = {
                    department: course.prefix,
                    section: String(sectionNumber),
                    courseNumber:
                      course.scheduledCourseCode?.courseHyphen ||
                      course.publishedCourseCode?.courseHyphen ||
                      course.fullCourseName ||
                      "",
                    courseTitle: course.name,
                    prefix: course.prefix,
                    semester,
                    instructor: instructorNames,
                    type: section.rnrMode,
                    units: (section.units || []).join("-"),
                    day: (section.schedule || [])
                      .map((l) => l.dayCode)
                      .filter(Boolean)
                      .join(""),
                    location: uniq((section.schedule || []).map((l) => l.location).filter(Boolean)).join(", "),
                    hasDClearance: Boolean(section.hasDClearance),
                  } satisfies Prisma.ClassInfoCreateInput;

                  await prisma.classInfo.upsert({
                    where: {
                      section_semester: { section: sectionNumber, semester },
                    },
                    create: sectionInfo,
                    update: sectionInfo,
                    select: {
                      id: true,
                    },
                  });
                } catch (e) {
                  console.error(
                    `Error processing section ${section.sisSectionId} for course ${course.fullCourseName} in department ${department} for semester ${semester}: ${e}`,
                  );
                }
              }
            }

            console.log(`Finished ${semester} - ${department}`);
          } catch (e: any) {
            console.error(`Error creating class info for ${department} in ${semester}: ${e.message}`);
          }
        },
        {
          concurrency: isProd ? 4 : 1,
          stopOnError: false,
        },
      );
    } catch (e) {
      console.error(e);
    }
  }
  logger.info("Finished creating class info");
};
