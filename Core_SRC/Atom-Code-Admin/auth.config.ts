import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { LoginSchema } from "@/schemas/auth-schema";
import { getAdminByEmail } from "@/data/admin";
// import bcrypt from 'bcryptjs'
import { compare } from 'bcrypt-ts';
export default {
    providers: [Credentials({
        async authorize(credentials) {
            const validatedFields = LoginSchema.safeParse(credentials)
            if (validatedFields.success) {
                const { email, password } = validatedFields.data

                const admin = await getAdminByEmail(email);
                if (!admin) return null

                // const passwordMatch = await bcrypt.compare(
                //     password, admin.password
                // )
                const passwordMatch = await compare(password, admin.password);
                if(passwordMatch) return admin;
            }
            return null;
        }
    })],
} satisfies NextAuthConfig