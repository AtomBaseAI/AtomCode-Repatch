"use server"
import { db } from "@/lib/db"
import * as z from 'zod'
import { revalidatePath } from "next/cache"
export const getstudentsbycourseid = async (courseId: string) => {
    try {
        const courseStudents = await db.userCourse.findMany({
            where: { courseId },
            include: { user: true }
        });

        if (!courseStudents) {
            return null;
        }

        return courseStudents.map(courseStudent => courseStudent.user);
    } catch (error) {
        console.error("Error fetching users by course ID:", error);
        return null;
    }
};
