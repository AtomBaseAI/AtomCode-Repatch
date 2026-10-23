"use server";

import { auth, signIn } from "@/auth";
import { LoginSchema } from "@/schemas/auth-schema";
import * as z from "zod";
import { AuthError } from "next-auth";
import { roleHome } from "@/routes";
import { db } from "@/lib/db";

/**
 * Role-aware login. The unified authorize() already detects which table
 * (admin / staff / student) the email belongs to; here we resolve the
 * role first so each role lands on its own dashboard after sign-in.
 */
export const login = async (values: z.infer<typeof LoginSchema>) => {
  const validatedFields = LoginSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid email/password" };
  }
  const { email, password } = validatedFields.data;

  const findRole = async () => {
    if (await db.admin.findUnique({ where: { email } })) return "admin";
    if (await db.staff.findUnique({ where: { email } })) return "staff";
    if (await db.user.findUnique({ where: { email } })) return "user";
    return null;
  };

  try {
    const role = await findRole();
    if (!role) return { error: "Invalid Credentials" };

    await signIn("credentials", {
      email,
      password,
      redirectTo: roleHome(role),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid Credentials" };
        default:
          return { error: "Something went wrong" };
      }
    }
    throw error;
  }
};

export const currentUser = async () => {
  const session = await auth();
  return session?.user;
};
