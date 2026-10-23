"use server"
import { RegisterSchema } from "@/schemas/auth-schema"
import { db } from "@/lib/db"
// import bcrypt from 'bcryptjs'
import { genSaltSync, hashSync } from 'bcrypt-ts';

import { compare } from 'bcrypt-ts';
import * as z from 'zod'

export const register = async (values: z.infer<typeof RegisterSchema>) => {
    const validatedFields = RegisterSchema.safeParse(values)
    if (!validatedFields.success) {
        return { error: "Invalid email/password" }
    }
    const { email, password, name, department, staffnumber, phone } = validatedFields.data;
    // const hashedPassword = await bcrypt.hash(password, 10)
    const salt = genSaltSync(10);
    const hashedPassword = hashSync(password, salt);
    const existingUser = await db.staff.findUnique({
        where: {
            email
        }
    })
    if (existingUser) {
        return { error: "Email already exists !" }
    }

    await db.staff.create({
        data: {
            name,
            email,
            department,
            staffnumber,
            phone,
            password: hashedPassword
        }
    })

    return { success: "Registeration Completed !" }
}