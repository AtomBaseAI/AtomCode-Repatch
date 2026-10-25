import { db } from "@/lib/db";

export const getAllQuestionDataByUserIdModuleId = async (userId: string, moduleId: string) => {
  try {
    const questionData = await db.userQuestionData.findMany({
      where: {
        userId: userId,
        moduleId: moduleId
      }
    });

    if (questionData.length > 0) {
      const totalScores = questionData.reduce((acc, data) => acc + data.score, 0);
      const totalCompiles = questionData.reduce((acc, data) => acc + data.compiles, 0);
      const totalErrors = questionData.reduce((acc, data) => acc + data.errors, 0);
      const totalDuration = questionData.reduce((acc, data) => acc + (data.duration ? parseInt(data.duration) : 0), 0);
      const questionsCount = questionData.length;
      return {
        totalScores,
        totalCompiles,
        totalErrors,
        totalDuration,
        questionsCount
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching UserQuestionData:", error);
    return null;
  }
};
