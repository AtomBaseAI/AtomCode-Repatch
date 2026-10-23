// @ts-nocheck
import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"

import authConfig from "@/auth.config"
import { db } from "./lib/db"
export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  callbacks: {
    async session({token,session}){
      if (token.sub && session.user) {
        session.user.id = token.sub;
        // console.log({UID : session.user.id})
      }
      return session
    },
    async jwt({ token }) {
      // console.log({token})
      return token;
    },
  },
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  ...authConfig,
})