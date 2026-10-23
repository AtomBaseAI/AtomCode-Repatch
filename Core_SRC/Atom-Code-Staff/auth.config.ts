import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { LoginSchema } from "@/schemas/auth-schema";
import { getStaffByEmail } from './data/staffs';
// import bcrypt from 'bcryptjs'
import { compare } from 'bcrypt-ts';
export default {
    providers: [Credentials({
        async authorize(credentials) {
            const validatedFields = LoginSchema.safeParse(credentials)
            if (validatedFields.success) {
                const { email, password } = validatedFields.data

                const staff = await getStaffByEmail(email);
                if (!staff) return null

                const passwordMatch = await compare(password, staff.password);
               
                if (passwordMatch) return staff;
            }
            return null;
        }
    })],
} satisfies NextAuthConfig