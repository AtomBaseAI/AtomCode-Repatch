import * as z from "zod"

export const CourseTableSchema = z.object({
    id: z.string(),
    title: z.string(),
    startdate: z.date(),
    enddate: z.date(),
    language: z.string(),
    modulescount:z.number()
})
