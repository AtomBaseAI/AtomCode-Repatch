"use server"
import { RegisterSchema } from "@/schemas/auth-schema"
import { db } from "@/lib/db"
// import bcrypt from 'bcryptjs'
import * as z from 'zod'
import { genSaltSync, hashSync } from 'bcrypt-ts';
// import { getStringFromBuffer } from "@/lib/utils"

export const register = async (values: z.infer<typeof RegisterSchema>) => {
    const validatedFields = RegisterSchema.safeParse(values)
    if (!validatedFields.success) {
        return { error: "Invalid email/password" }
    }
    const { email, password, name } = validatedFields.data;
    const salt = genSaltSync(10);
    const hashedPassword = hashSync(password, salt);

    //old
    // const hashedPassword = await bcrypt.hash(password, 10)



    const existingUser = await db.admin.findUnique({
        where: {
            email
        }
    })
    if (existingUser) {
        return { error: "Email already exists !" }
    }

    await db.admin.create({
        data: {
            name,
            email,
            password: hashedPassword
        }
    })

    return { success: "Registeration Completed !" }
}