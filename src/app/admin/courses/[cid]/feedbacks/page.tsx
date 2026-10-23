import { z } from "zod"
import { getCourseById } from "@/data/courses"
import BackBtn from "@/components/backbtn"
import { FeedbackTableSchema } from "@/schemas/feedback-schema"
import { getAllFeedbacksByCourseId } from "@/data/feedbacks"
import AddFeedback from "@/components/feedbacks/feedback-add-form"
import { FeedbackDataTable } from "@/components/feedbacks/feedbacks-table/f-data-table"
import { columns } from "@/components/feedbacks/feedbacks-table/f-columns"

async function fetchFeedbacks(cid: string) {
    const feedbacks = await getAllFeedbacksByCourseId(cid)
    return z.array(FeedbackTableSchema).parse(feedbacks)
}
export default async function CourseFeedback({ params }: { params: Promise<{ cid: string> } }) {
    const { cid } = await params
    const feedbacks = await fetchFeedbacks(cid)
    const course = await getCourseById(cid)

    // console.log(feedbacks)
    return (
        <>
            <div className="hidden h-full flex-1 flex-col space-y-2 p-8 md:flex w-full">
                <div className="flex items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">{course?.title}</h2>
                        <p className="text-muted-foreground">
                            All Feedbacks : {feedbacks.length}
                        </p>
                    </div>
                    <div className="flex justify-center items-center gap-x-4">
                        <AddFeedback cid={cid} />
                        <BackBtn />
                    </div>
                </div>
                <FeedbackDataTable data={feedbacks} columns={columns} />
            </div>
        </>
    )
}