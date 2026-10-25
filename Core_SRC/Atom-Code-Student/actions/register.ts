"use server"
import { RegisterSchema } from "@/schemas/auth-schema"
import { db } from "@/lib/db"
// import bcrypt from 'bcryptjs'

import { genSaltSync, hashSync } from 'bcrypt-ts';
import * as z from 'zod'

export const register = async (values: z.infer<typeof RegisterSchema>) => {
    const validatedFields = RegisterSchema.safeParse(values)
    if (!validatedFields.success) {
        return { error: "Invalid email/password" }
    }
    const { email, password, name, rollnumber, department, batch, section } = validatedFields.data;
    // const hashedPassword = await bcrypt.hash(password, 10)
    const salt = genSaltSync(10);
    const hashedPassword = hashSync(password, salt);
    const existingUser = await db.user.findUnique({
        where: {
            email
        }
    })
    if (existingUser) {
        return { error: "Email already exists !" }
    }

    await db.user.create({
        data: {
            name,
            email,
            department,
            rollnumber,
            batch,
            section,
            isTwoFactorEnabled: false,
            password: hashedPassword
        }
    })

    return { success: "Registeration Completed !" }
}