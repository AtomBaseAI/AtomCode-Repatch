"use server"

import { db } from "@/lib/db"
import * as z from 'zod'
import { revalidatePath } from "next/cache"
import {
  AddAssessmentSchema,
  DeleteAssessmentSchema,
  UpdateAssessmentSchema,
} from "@/schemas/assessment-schema"

// Add Assessment
export const addassessment = async (values: z.infer<typeof AddAssessmentSchema>) => {
  await db.assessments.create({
    data: {
      ...values,
    },
  })

  revalidatePath("/courses")
  return { success: "Assessment Added!" }
}

// Delete Assessment
export const deleteassessment = async (values: z.infer<typeof DeleteAssessmentSchema>) => {
  const aid = values.id
  await db.assessments.delete({
    where: {
      id: aid,
    },
  })

  revalidatePath("/courses")
  return { success: "Assessment Deleted!" }
}

// Update Assessment
export const updateassessment = async (values: z.infer<typeof UpdateAssessmentSchema>) => {
  const aid = values.id
  await db.assessments.update({
    where: {
      id: aid,
    },
    data: {
      ...values,
    },
  })

  revalidatePath("/courses")
  return { success: "Assessment Updated!" }
}

// Optional: Add Questions to Assessment
export const addassessmentquestions = async (assessmentId: string, questionIds: string[]) => {
  await db.assessments.update({
    where: {
      id: assessmentId,
    },
    data: {
      questions: {
        connect: questionIds.map((id) => ({ id })),
      },
    },
  })

  revalidatePath("/courses")
  return { success: "Questions added to assessment successfully!" }
}

// Optional: Remove Question from Assessment
export const deleteassessmentquestion = async (questionId: string, assessmentId: string) => {
  await db.assessments.update({
    where: {
      id: assessmentId,
    },
    data: {
      questions: {
        disconnect: { id: questionId },
      },
    },
  })

  revalidatePath("/courses")
  return { success: "Question removed from assessment successfully!" }
}
