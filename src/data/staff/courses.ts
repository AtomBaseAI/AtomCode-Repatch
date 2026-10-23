import { db } from "@/lib/db";

interface CourseWithCounts {
    modulescount: number;
    assessmentscount: number;
}

interface CourseWithMetadata {
    coursetitle: string;
    startdate: Date;
    enddate: Date;
    studentscount: number;
    modulescount: number;
    referencescount: number;
    feedbackscount: number;
}
export const getAllStaffCourses = async (sid: string): Promise<CourseWithCounts[]> => {
    try {
        const courses = await db.course.findMany({
            where: {
                staffCourses: {
                    some: {
                        staffId: sid,
                    },
                },
            },
            include: {
                modules: true,
                assessments: true,
            },
        });

        const coursesWithCounts: CourseWithCounts[] = courses.map((course) => {
            return {
                ...course,
                modulescount: course.modules.length,
                assessmentscount: course.assessments.length,
            };
        });

        return coursesWithCounts;
    } catch (error) {
        console.error("Error fetching courses:", error);
        throw error;
    }
};

export const getCourseById = async (id: string) => {
    try {
        const course = await db.course.findUnique({ where: { id } })
        return course
    }
    catch {
        return null
    }
}

export const getCoursesCount = () => {
    try {
        const ccount = db.course.count()
        return ccount
    }
    catch {
        return null
    }
}



export const getCoursesWithMetadata = async (staffId: string): Promise<CourseWithMetadata[]> => {
    try {
        const courses = await db.course.findMany({
            where: {
                staffCourses: {
                    some: {
                        staffId,
                    },
                },
            },
            include: {
                userCourses: true, // To count students
                modules: {
                    include: {
                        reference: true, // To count references
                    },
                },
                feedbacks: true, // To count feedbacks
            },
        });

        const coursesWithMetadata: CourseWithMetadata[] = courses.map((course) => {
            const studentscount = course.userCourses.length;
            const modulescount = course.modules.length;
            const referencescount = course.modules.reduce(
                (total, module) => total + module.reference.length,
                0
            );
            const feedbackscount = course.feedbacks.length;

            return {
                coursetitle: course.title,
                startdate: course.startdate,
                enddate: course.enddate,
                studentscount,
                modulescount,
                referencescount,
                feedbackscount,
            };
        });

        return coursesWithMetadata;
    } catch (error) {
        console.error("Error fetching courses with metadata:", error);
        throw error;
    }
};

interface CourseModuleData {
    courseId: string;
    courseTitle: string;
    modules: {
        moduleId: string;
        moduleTitle: string;
    }[];
}
export const getAllCoursesModules = async (staffID: string): Promise<CourseModuleData[]> => {
    try {
        const courses = await db.course.findMany({
            where: {
                staffCourses: {
                    some: {
                        staffId: staffID,
                    },
                },
            },
            select: {
                id: true,
                title: true,
                modules: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
            },
        });

        const coursesModules: CourseModuleData[] = courses.map((course) => ({
            courseId: course.id,
            courseTitle: course.title,
            modules: course.modules.map((module) => ({
                moduleId: module.id,
                moduleTitle: module.title,
            })),
        }));

        return coursesModules;
    } catch (error) {
        console.error("Error fetching course modules:", error);
        throw error;
    }
};