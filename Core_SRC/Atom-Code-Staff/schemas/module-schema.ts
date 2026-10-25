import * as z from "zod"
import { QuestionTableSchema } from './question-schema';

export const AddModuleSchema = z.object({
    courseId: z.string(),
    title: z.string().min(1, {
        message: "Module Name is required"
    }),
    moduledate: z.date(),
    modulestatus: z.string().min(1, {
        message: "Module Status is required"
    }),
    maxscore: z.coerce.number(),
    language: z.string()
});

export const DeleteModuleSchema = z.object({
    id: z.string()
})

export const ModuleTableSchema = z.object({
    id: z.string(),
    courseId: z.string(),
    title: z.string(),
    moduledate: z.date(),
    modulestatus: z.string(),
    questionscount: z.number(),
    mcqcount: z.number(),
    maxscore: z.number()
})
export const ModuleQuestionTableSchema = z.object({
    id: z.string(),
    title: z.string(),
    moduledate: z.date(),
    modulestatus: z.string(),
    language: z.string(),
    questions: z.array(QuestionTableSchema)
})

export const ModuleQuestionTableQuestionSchema = z.object({
    id: z.string(),
    title: z.string(),
    maxscore: z.number(),
    difficulty: z.string(),
    lang: z.string()
})


export const ModuleUpdateSchema = z.object({
    id: z.string(),
    courseId: z.string(),
    title: z.string(),
    moduledate: z.date(),
    modulestatus: z.string(),
    maxscore: z.coerce.number(),
})

export const DeleteModuleQuestionSchema = z.object({
    id: z.string(),
    mid: z.string()
})

export type ModuleTableType = z.infer<typeof ModuleTableSchema>
export type ModuleQuestionTableType = z.infer<typeof ModuleQuestionTableSchema>
export type ModuleQuestionTableQuestionType = z.infer<typeof ModuleQuestionTableQuestionSchema>

