"use server"
import { db } from "@/lib/db";
import { startUserAssessmentDataSchema, upateUserAllAssessmentSchemaCode, upateUserAssessmentSchemaMCQ, UserQuestionAssessmentDataSchema } from "@/schemas/student/assessment-schema";
import { revalidatePath } from "next/cache";

import * as z from 'zod';


export const startAssessment = async (data: z.infer<typeof startUserAssessmentDataSchema>) => {
  const newrecord = await db.userAssessmentData.create({
    data: {
      userId: data.userId,
      courseId: data.courseId,
      assessmentId: data.assessmentId,
      totalmcqscore: data.totalmcqscore,
      totalquestionscore: data.totalquestionscore,
      assessmentmaxscore: data.assessmentmaxscore,
      assessmentstarttime: data.assessmentstarttime,
      userassessmentstarttime: data.userassessmentstarttime,
      usertabswitches: data.usertabswitches,
      maxtabswitches: data.maxtabswitches,
      maxtime: data.maxtime,
      status: data.status
    }
  });

  revalidatePath('/student/assessments');
  return { success: true, uaid: newrecord.id };
};

export const mcqdataUpdateAssessment = async (data: z.infer<typeof upateUserAssessmentSchemaMCQ>) => {
  const checkdata = await db.userAssessmentData.findUnique({
    where: {
      id: data.id
    }
  })
  if (checkdata === null) {
    return { error: "Invalid Submission" };
  }
  await db.userAssessmentData.update({
    where: {
      id: data.id
    },
    data: {
      mcqtime: data.mcqtime,
      mcqstatus: data.mcqstatus,
      usermcqscore: data.usermcqscore,
    }
  }),
    revalidatePath('/student/assessment');
  return { success: "MCQ's Submitted" };
}


//code submit userassessmentcode
export const submitassessmentquestion = async (values: z.infer<typeof UserQuestionAssessmentDataSchema>) => {
  const validatedFields = UserQuestionAssessmentDataSchema.safeParse(values)
  if (!validatedFields.success) {
    return { error: "Invalid Submission" }
  }
  const {
    userId,
    questionId,
    assessmentId,
    score,
    compiles,
    errors,
    submissiontype,
    status,
    usercode,
    duration,
    testcase1status,
    testcase2status,
    testcase3status,
  } = validatedFields.data;
  const existingrecord = await db.userAssessmentCodeData.findUnique({
    where: {
      userId_questionId: {
        userId: userId,
        questionId: questionId
      },
    },
  })
  if (existingrecord && existingrecord.status === 'retake') {
    await db.userAssessmentCodeData.update({
      where: {
        id: existingrecord.id
      },
      data: {
        score,
        compiles,
        errors,
        status,
        usercode,
        duration,
        testcase1status,
        testcase2status,
        testcase3status,
      }
    })

    await revalidatePath('/student/assessment');
    return { success: "Code Retake Submitted !" }
  } else if (existingrecord?.status === 'submitted') {
    return { error: "Code already Submitted !" }
  }
  await db.userAssessmentCodeData.create({
    data: {
      userId,
      questionId,
      assessmentId,
      score,
      compiles,
      errors,
      submissiontype,
      status,
      usercode,
      duration,
      testcase1status,
      testcase2status,
      testcase3status,
    }
  })

  await revalidatePath('/student/assessment');
  return { success: "Code Submitted !" }
}

//submit all questions




export const submitassessmentallquestions = async (data: z.infer<typeof upateUserAllAssessmentSchemaCode>) => {
  const existingrecords = await db.userAssessmentCodeData.findMany({
    where: {
      userId: data.userId,
      assessmentId: data.assessmentId
    },

  })

  // score,
  // compiles,
  // errors,
  // duration,
  const totalquestionscore = existingrecords.reduce((total, record) => total + record.score, 0);
  const totalcompiles = existingrecords.reduce((total, record) => total + record.compiles, 0);
  const totalerrors = existingrecords.reduce((total, record) => total + record.errors, 0);
  const totalquestiontime = existingrecords.reduce((total, record) => total + parseInt(record?.duration || '0'), 0);
  // console.log(totalcompiles)
  const checkdata = await db.userAssessmentData.findUnique({
    where: {
      id: data.id
    }
  })
  if (checkdata === null) {
    return { error: "Invalid Submission" };
  }
  await db.userAssessmentData.update({
    where: {
      id: data.id
    },
    data: {
      questiontime: totalquestiontime,
      questionstatus: 'submitted',
      userquestionscore: totalquestionscore,
      errors: totalerrors,
      compiles: totalcompiles,
    }
  }),
    revalidatePath('/student/assessment');
  return { success: "Code Submitted" };
}


