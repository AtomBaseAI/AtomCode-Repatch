
import Image from "next/image"
import Link from "next/link"
// import { UserAuthForm } from "@/components/user-auth"
import { ThemeToggle } from "@/components/theme-toggle"
import { LoginForm } from "@/components/auth/login-form"
export default function Login() {
    return (
        <>
            <div className="container relative hidden h-screen flex-col items-center justify-center md:grid ">
                <div className="absolute right-4 top-4 md:right-8 md:top-8">

                    <ThemeToggle />
                </div>
               
                <div className="lg:p-8">
                    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                        <div className="flex flex-col space-y-2 text-center">
                            <h1 className="text-2xl font-semibold tracking-tight">
                               [ ATOM Admin ]
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Enter your email & password below to login your account
                            </p>
                        </div>
                        {/* <UserAuthForm /> */}
                        <LoginForm/>
                    </div>
                </div>
            </div>
        </>
    )
}