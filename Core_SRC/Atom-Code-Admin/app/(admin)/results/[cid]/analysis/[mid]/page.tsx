import BackBtn from "@/components/backbtn"
import { columns } from "@/components/results/analysis/analysis-students/mas-columns"
import { ResultAnalysisStudentsDataTable } from "@/components/results/analysis/analysis-students/mas-data-table"
import { getStudentsDataByCourseIdByModule } from "@/data/analysis"
import { getCourseModuleTitlesByModuleId } from "@/data/modules"
import { ResultAnalysisStudentSchema } from "@/schemas/result-analysis-schema"
import { z } from "zod"

async function fetchResultAnalysisStudents(cid: string, mid: string) {
    const resultdata = await getStudentsDataByCourseIdByModule(cid, mid)
    // console.log(resultdata)
    return z.array(ResultAnalysisStudentSchema).parse(resultdata)
}
const ResultAnalysisStudents = async ({ params }: { params: any }) => {
    const { cid, mid } = params
    // const moduleId = parseInt(mid, 10);
    // const courseId = parseInt(cid, 10);
    const ResultAnalysisStudentsData = await fetchResultAnalysisStudents(cid, mid)
    // console.log(ResultAnalysisStudentsData)
    const titles = await getCourseModuleTitlesByModuleId(mid);
    return (
        <>
            <div className="hidden h-full flex-1 flex-col space-y-2 p-8 md:flex w-full">
                <div className="flex items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            {titles?.moduleTitle}
                        </h2>
                        <p className="text-muted-foreground">
                            {titles?.courseTitle}
                        </p>
                    </div>
                    <div className="flex justify-center items-center gap-x-4">
                        <BackBtn />
                    </div>
                </div>
                <ResultAnalysisStudentsDataTable data={ResultAnalysisStudentsData} columns={columns} />
            </div>
        </>
    )
}

export default ResultAnalysisStudents