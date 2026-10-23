import { db } from "@/lib/db";

export const getUserMCQDataByUserIdModuleId = async (userId: string, moduleId: string) => {
  try {
    const userMCQData = await db.userMCQData.findFirst({
      where: {
        userId: userId,
        moduleId: moduleId
      }
    });

    if (userMCQData) {
      return userMCQData;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching UserMCQData:", error);
    return null;
  }
};
