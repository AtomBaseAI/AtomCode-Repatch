import { db } from "@/lib/db";

export const getAllModulesByCourseId = async (id: string) => {
    try {
        const modulesdata = await db.module.findMany({
            where: { courseId: id },
            include: { questions: true, mcqQuestions: true }
        })
        const modules = modulesdata.map(module => ({
            ...module,
            questionscount: module.questions.length,
            mcqcount: module.mcqQuestions.length
        }));

        return modules
    }
    catch {
        return null
    }
}
export const getModuleById = async (id: string) => {
    try {
        const modulex = await db.module.findUnique({ where: { id } })
        return modulex
    }
    catch {
        return null
    }
}
export const getModuleQuestionsByModuleId = async (id: string) => {
    try {
        const moduleWithQuestions = await db.module.findUnique({
            where: { id },
            include: { questions: true }
        });

        if (moduleWithQuestions) {
            return moduleWithQuestions.questions;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching module questions:", error);
        return null;
    }
};

export const getCourseModuleTitlesByModuleId = async (moduleId: string) => {
    try {
        const moduleData = await db.module.findUnique({
            where: { id: moduleId },
            select: {
                title: true,
                course: {
                    select: {
                        title: true,
                    }
                }
            }
        });

        if (moduleData) {
            return {
                courseTitle: moduleData.course.title,
                moduleTitle: moduleData.title
            };
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching course and module titles:", error);
        return null;
    }
};