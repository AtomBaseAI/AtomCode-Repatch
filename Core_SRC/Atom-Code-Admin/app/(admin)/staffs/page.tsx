
import { z } from "zod"

// import { columns } from "@/components/student/student-table/s-columns"
import AddStaff from "@/components/staff/staff-add-form"
import { getAllStaffs } from "@/data/staffs"
import { StaffTableSchema } from "@/schemas/staff-schema"
import { StaffDataTable } from "@/components/staff/staff-table/stf-data-table"
import { columns } from "@/components/staff/staff-table/stf-columns"

async function fetchStaffs() {
  const staffs = await getAllStaffs()
  return z.array(StaffTableSchema).parse(staffs)
}

export default async function StaffsData() {
  const staffs = await fetchStaffs()

  return (
    <>
      <div className="hidden h-full flex-1 flex-col space-y-2 p-8 md:flex w-full">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Staffs</h2>
            <p className="text-muted-foreground">
              All Staffs
            </p>
          </div>
          <div className="flex justify-center items-center gap-x-4">
            <AddStaff />
          </div>
        </div>
        <StaffDataTable data={staffs} columns={columns} />
      </div>
    </>
  )
}