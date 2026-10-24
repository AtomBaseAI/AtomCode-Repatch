import { z } from "zod"
import { getAllQuestions } from "@/data/questions"
import { QuestionTableSchema } from "@/schemas/question-schema"
import { QuestionDataTable } from "@/components/question/question-table/q-data-table"
import { columns } from "@/components/question/question-table/q-columns"
import AddQuestion from "@/components/question/question-add-form"

async function fetchQuestions() {
  const questions = await getAllQuestions()
  // console.log(questions)
  return z.array(QuestionTableSchema).parse(questions)
}

export default async function QuestionsData() {
  const question = await fetchQuestions()
  // console.log(question)
  return (
    <>
      <div className="flex h-full flex-1 flex-col space-y-2 p-4 md:p-8 w-full">
        <div className="flex flex-wrap items-center justify-between gap-2 space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Questions</h2>
            <p className="text-muted-foreground">
              All Questions
            </p>
          </div>
          <div className="flex justify-center items-center gap-x-4">
            <AddQuestion />
          </div>
        </div>
        <QuestionDataTable data={question} columns={columns} />
      </div>
    </>
  )
}