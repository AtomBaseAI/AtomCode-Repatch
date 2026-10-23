
import React from 'react'
import { getAllQuestionsByLang } from "@/data/questions"
import BackBtn from "@/components/backbtn"
import { AssessmentQuestionTableSchema } from "@/schemas/assessment-schema"
import { getAssessmentById, getAssessmentCodeQuestionsById } from "@/data/assessments"
import { AQuestionAddDataTable } from '@/components/assessment-questions/assessment-question-add-table/aqa-data-table'
import { columns } from '@/components/assessment-questions/assessment-question-add-table/aqa-columns'

async function fetchAssessment(aid: string) {
    const assessmentz = await getAssessmentById(aid)
    const assessmentWithQuestions = {
        ...assessmentz,
        questions: []
    }
    return AssessmentQuestionTableSchema.parse(assessmentWithQuestions);
}
async function fetchassessmentquestions(aid: string) {
    const assessmentzQuestions = await getAssessmentCodeQuestionsById(aid);
    return assessmentzQuestions
}
async function fetchQestoinbyLang(lang: string) {
    const langquestions = await getAllQuestionsByLang(lang)
    return langquestions;
}
const AddAssessmentQuestions = async ({ params }: { params: Promise<{ cid: string; aid: string}> }) => {
    const { cid, aid } = await params
    const assessmentz = await fetchAssessment(aid)
    const assessmentq = await fetchassessmentquestions(aid)
    const questionsLang = await fetchQestoinbyLang(assessmentz.language)

    if (questionsLang === null) {
        return <p>No questions available for this language.</p>;
    }

    const filteredQuestions = questionsLang.filter(question => {
        return !assessmentq?.some(assessmentQuestion => assessmentQuestion.id === question.id);
    });
    // console.log(filteredQuestions)
    return (
        <>
            <div className="hidden h-full flex-1 flex-col space-y-2 p-8 md:flex w-full">
                <div className="flex items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            {assessmentz?.title}
                        </h2>
                        <p className="text-muted-foreground flex items-center justify-center">
                            Add new Questions
                        </p>
                    </div>
                    <div className="flex justify-center items-center gap-x-4">
                        <BackBtn />
                    </div>
                </div>

                <AQuestionAddDataTable data={filteredQuestions} columns={columns} aid={aid} />
            </div>
        </>
    )
}

export default AddAssessmentQuestions