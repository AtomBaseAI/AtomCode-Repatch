import { z } from "zod"
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import React from 'react'
import { Users } from "lucide-react"
import BackBtn from '@/components/backbtn'
import { getCourseById } from '@/data/courses'
import { CourseStudentDataTable } from '@/components/course-student/course-student-table/cs-data-table'
import { columns } from '@/components/course-student/course-student-table/cs-columns'
import { StudentTableSchema } from '@/schemas/student-schema'
import { getstudentsbycourseid } from "@/actions/usercourse"

async function fetchStudents(cid: string) {
  const students = await getstudentsbycourseid(cid)
  if (!students) {
    return [];
  }
  return z.array(StudentTableSchema).parse(students);
}

const CourseStudents = async ({ params }: any) => {
  const { cid } = params
  // const courseId = parseInt(cid, 10);
  const studentsdata = await fetchStudents(cid)
  const course = await getCourseById(cid)
  return (
    <>
      <div className="hidden h-full flex-1 flex-col space-y-2 p-8 md:flex w-full">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {course?.title}
            </h2>
            <p className="text-muted-foreground">
              Course Students : {studentsdata?.length}
            </p>
          </div>
          <div className="flex justify-center items-center gap-x-4">
            <Link href={`/courses/${cid}/students/add`}>
              <Button className="bg-green-500 hover:bg-green-700 text-white"> <Users className="mr-2" /> Assign Students</Button>
            </Link>
            <BackBtn />
          </div>
        </div>
        <CourseStudentDataTable data={studentsdata} columns={columns} />
      </div>
    </>
  )
}

export default CourseStudents