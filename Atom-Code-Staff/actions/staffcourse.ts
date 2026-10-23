"use server"
import { db } from "@/lib/db"
import * as z from 'zod'
import { revalidatePath } from "next/cache"


export const getstaffsbycourseid = async (courseId: string) => {
    try {
        const courseStaffs = await db.staffCourse.findMany({
            where: { courseId },
            include: { staff: true }
        });

        if (!courseStaffs) {
            return null;
        }

        return courseStaffs.map(courseStaff => courseStaff.staff);
    } catch (error) {
        console.error("Error fetching staffs by course ID:", error);
        return null;
    }
};
