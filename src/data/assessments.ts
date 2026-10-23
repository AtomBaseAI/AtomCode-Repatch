
import { db } from "@/lib/db";

export const getAllAssessmentsByCourseId = async (courseId: string) => {
    try {
        const assessmentsData = await db.assessments.findMany({
            where: { courseId },
            include: {
                mcqQuestions: true,
                questions: true
            }
        });

        const assessments = assessmentsData.map(assessment => {
            // Extract HH:MM from the date
            const dateObj = new Date(assessment.date);
            const hours = String(dateObj.getHours()).padStart(2, '0');
            const minutes = String(dateObj.getMinutes()).padStart(2, '0');
            const starttime = `${hours}:${minutes}`;

            return {
                ...assessment,
                mcqcount: assessment.mcqQuestions.length,
                codecount: assessment.questions.length,
                starttime // Add the new field
            };
        });
        // console.log(assessments)
        return assessments;
    } catch (error) {
        console.error("Error fetching assessments:", error);
        return [];
    }
};

// Get a single assessment by its ID
export const getAssessmentById = async (id: string) => {
    try {
        const assessment = await db.assessments.findUnique({
            where: { id }
        });
        if (!assessment) return null;

        // Convert date to 12-hour format HH:MM AM/PM
        const dateObj = new Date(assessment.date);
        let hours = dateObj.getHours();
        const minutes = String(dateObj.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';

        // Convert to 12-hour format
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        const starttime = `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
        return {
            ...assessment,
            starttime
        };
    } catch (error) {
        console.error("Error fetching assessment by ID:", error);
        return null;
    }
};

// Get coding questions for an assessment
export const getAssessmentCodeQuestionsById = async (assessmentId: string) => {
    try {
        const assessment = await db.assessments.findUnique({
            where: { id: assessmentId },
            include: { questions: true }
        });

        return assessment?.questions ?? null;
    } catch (error) {
        console.error("Error fetching code questions:", error);
        return null;
    }
};

// Get MCQ questions for an assessment
export const getAssessmentMcqQuestionsById = async (assessmentId: string) => {
    try {
        const assessment = await db.assessments.findUnique({
            where: { id: assessmentId },
            include: { mcqQuestions: true }
        });

        return assessment?.mcqQuestions ?? null;
    } catch (error) {
        console.error("Error fetching MCQ questions:", error);
        return null;
    }
};

// Get course and assessment titles (like module titles)
export const getCourseAssessmentTitlesByAssessmentId = async (assessmentId: string) => {
    try {
        const assessment = await db.assessments.findUnique({
            where: { id: assessmentId },
            select: {
                title: true,
                course: {
                    select: {
                        title: true
                    }
                }
            }
        });

        if (assessment) {
            return {
                courseTitle: assessment.course.title,
                assessmentTitle: assessment.title
            };
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching assessment and course titles:", error);
        return null;
    }
};
