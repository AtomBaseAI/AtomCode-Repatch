import { getModuleById } from '@/data/modules'
import React from 'react'
import BackBtn from '@/components/backbtn'
import { getAssessmentMCQsByAssessmentId } from '@/data/mcq'
import { MCQDataTable } from '@/components/mcq/mcq-table/mc-data-table'
import { columns } from '@/components/mcq/mcq-table/mc-columns'
import AddMCQForm from '@/components/mcq/mcq-add-form'
import MExport from '@/export/module-export/module-export-button'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { UploadCloud } from 'lucide-react'
import { getAssessmentById } from '@/data/assessments'

async function fetchAssessment(aid: string) {
  const assessmentz = await getAssessmentById(aid)
  return assessmentz
}
async function fetchAssessmentMCQs(aid: string) {
  const assessmentx = await getAssessmentMCQsByAssessmentId(aid)
  return assessmentx
}

const AssessmentMCQ = async ({ params }: { params: any }) => {
  const { cid, aid, mid } = params
  // const moduleId = parseInt(mid, 10);
  const assessmentz = await fetchAssessment(aid)
  const assessmentx = await fetchAssessmentMCQs(aid)

  const mcqData = assessmentx?.map(mcq => ({
    ...mcq,
    referenceimg: mcq.referenceimg || undefined,
    codesnippet: mcq.codesnippet || undefined,
    topic: mcq.topic || undefined,
    subtopic: mcq.subtopic || undefined
  })) || [];
  console.log(mcqData)
  return (
    <>
      <div className="hidden h-full flex-1 flex-col space-y-2 p-8 md:flex w-full">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {assessmentz?.title}
            </h2>
            <p className="text-muted-foreground">
              Assessment MCQs : {assessmentx?.length}
            </p>
          </div>
          <div className="flex justify-center items-center gap-x-4">
            {/* <Button className="bg-green-500 hover:bg-green-700 text-white"> <Puzzle className="mr-2" /> Add MCQ</Button> */}
            <Link href={`/courses/${cid}/assessments/${aid}/mcq/import`}>
              <Button>
                <UploadCloud className="mr-2" />
                Bulk Upload
              </Button>
            </Link>
            <AddMCQForm mid={mid} aid={aid} mcqtype={'assessment'} />
            <MExport data={mcqData} fileName={`${assessmentz?.title}-MCQ.csv`} />
            <BackBtn />
          </div>
        </div>
        <MCQDataTable data={mcqData} columns={columns} />
      </div>
    </>
  )
}

export default AssessmentMCQ
