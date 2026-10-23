import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { LoginSchema } from "@/schemas/auth-schema";
import { getUserByEmail } from "@/data/user";
// import bcrypt from 'bcryptjs'
import { compare } from 'bcrypt-ts';
export default {
    providers: [Credentials({
        async authorize(credentials) {
            const validatedFields = LoginSchema.safeParse(credentials)
            if (validatedFields.success) {
                const { email, password } = validatedFields.data

                const user = await getUserByEmail(email);
                if (!user) return null

                // const passwordMatch = await bcrypt.compare(
                //     password, user.password
                // )
                const passwordMatch = await compare(password, user.password);
                if (passwordMatch) return user;
            }
            return null;
        }
    })]
} satisfies NextAuthConfig