import Image from "next/image"
import { ThemeToggle } from "@/components/theme-toggle"
import { RegisterForm } from "@/components/auth/register-form"
export default function Register() {
    return (
        <>
            <div className="container relative hidden h-screen flex-col items-center justify-center md:grid ">
                <div className="absolute right-4 top-4 md:right-8 md:top-8 z-10">
                    <ThemeToggle />
                </div>

                <div className="lg:p-8">
                    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                        <div className="flex flex-col space-y-2 text-center">
                            <h1 className="text-2xl font-semibold tracking-tight">
                                [ ATOM Admin ]
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Register
                            </p>
                        </div>
                        <RegisterForm/>
                    </div>
                </div>
                
            </div>
        </>
    )
}