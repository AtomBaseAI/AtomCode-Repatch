"use server"
import { db } from "@/lib/db"
// import bcrypt from 'bcryptjs'
import * as z from 'zod'
import { StaffPasswordResetSchema } from "@/schemas/staff-schema"
import { genSaltSync, hashSync } from 'bcrypt-ts';
export const resetpasswordstaff = async (
    values: z.infer<typeof StaffPasswordResetSchema>
) => {
    const uid = values.id;
    const password = values.password;
    // const hashedPassword = await bcrypt.hash(password, 10)
    const salt = genSaltSync(10);
    const hashedPassword = hashSync(password, salt);
    await db.staff.update({
        where: {
            id: uid
        },
        data: {
            password: hashedPassword
        }
    })
    return { success: "Password Updated !" }
}