import { db } from "@/lib/db";
export const getQuestionById = async (id: string) => {
    try {
        const question = await db.question.findUnique({ where: { id } })
        return question
    }
    catch {
        return null
    }
}