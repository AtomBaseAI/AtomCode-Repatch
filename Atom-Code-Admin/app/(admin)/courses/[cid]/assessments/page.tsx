import { z } from "zod"
import { getCourseById } from "@/data/courses"


import BackBtn from "@/components/backbtn"
import { AssessmentTableSchema } from "@/schemas/assessment-schema"
import { getAllAssessmentsByCourseId } from "@/data/assessments"
import AddAssessment from "@/components/assessment/assessment-add-form"
import { AssessmentDataTable } from "@/components/assessment/assessment-table/a-data-table"
import { columns } from "@/components/assessment/assessment-table/a-columns"

async function fetchAssessments(cid: string) {
    const assessments = await getAllAssessmentsByCourseId(cid)
    return z.array(AssessmentTableSchema).parse(assessments)
}
export default async function AssessmentsData({ params }: { params: any }) {
    const { cid } = params
    const assessments = await fetchAssessments(cid)
    const course = await getCourseById(cid)
    const courseData = {
        cid: course?.id || '',
        lang: course?.language || ''
    }
    // console.log(assessments)
    return (
        <>
            <div className="hidden h-full flex-1 flex-col space-y-2 p-8 md:flex w-full">
                <div className="flex items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">{course?.title}</h2>
                        <p className="text-muted-foreground">
                            All Assessments : {assessments.length}
                        </p>
                    </div>
                    <div className="flex justify-center items-center gap-x-4">
                        <AddAssessment cdata={courseData} />
                        <BackBtn />
                    </div>
                </div>
                <AssessmentDataTable data={assessments} columns={columns} />
            </div>
        </>
    )
}