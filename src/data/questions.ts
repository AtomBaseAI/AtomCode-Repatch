import { db } from "@/lib/db";

export const getAllQuestions = () => {
    try {
        const questions = db.codeQuestion.findMany()
        return questions
    }
    catch {
        return null
    }
}
export const getAllQuestionsByLang = (lang: string) => {
    try {
        const langquestions = db.codeQuestion.findMany({ where: { lang } })
        return langquestions
    }
    catch {
        return null
    }
}
export const getQuestionById = async (id: string) => {
    try {
        const question = await db.codeQuestion.findUnique({ where: { id } })
        return question
    }
    catch {
        return null
    }
}
export const getQuestionsCount = () => {
    try {
        const qcount = db.codeQuestion.count()
        return qcount
    }
    catch {
        return null
    }
}