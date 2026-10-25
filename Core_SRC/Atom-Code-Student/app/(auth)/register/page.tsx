import Image from "next/image"
import { ThemeToggle } from "@/components/theme-toggle"
import { RegisterForm } from "@/components/auth/register-form"
export default function Login() {
    return (
        <>

            <div className="container relative hidden h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
                <div className="absolute right-4 top-4 md:right-8 md:top-8 z-10">
                    <ThemeToggle />
                </div>

                <div className="lg:p-8">
                    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                        <div className="flex flex-col space-y-2 text-center">
                            <h1 className="text-2xl font-semibold tracking-tight">
                                {process.env.NEXT_PUBLIC_VENDOR_NAME !== '' ? process.env.NEXT_PUBLIC_VENDOR_NAME : 'Atom Code'}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Register
                            </p>
                        </div>
                        <RegisterForm />
                    </div>
                </div>
                <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r -z-10">
                    <div className="absolute inset-0 bg-zinc-900" />
                    <div className="relative z-20 flex items-center text-lg font-medium">
                        <Image src={(process.env.NEXT_PUBLIC_VENDOR_LOGO !== '' && process.env.NEXT_PUBLIC_VENDOR_LOGO) ? process.env.NEXT_PUBLIC_VENDOR_LOGO : 'https://ik.imagekit.io/atominc/academy-mini.webp'} alt="logo mini" height={20} width={20} className="mr-2" />
                        {process.env.NEXT_PUBLIC_VENDOR_NAME !== '' ? process.env.NEXT_PUBLIC_VENDOR_NAME : 'Atom Code Dev'}
                    </div>
                    <div className="relative w-full h-full flex justify-center items-center">
                        <Image
                            src={process.env.NEXT_PUBLIC_CLIENT_BANNER || 'https://ik.imagekit.io/atominc/ATOMCODE/banner.webp'}
                            width={500}
                            height={500}
                            alt="Authentication"
                            className="block "
                        />
                    </div>
                    {process.env.NEXT_PUBLIC_POWEREDBY_STATUS === "true" && (
                        <div className="relative z-20 mt-auto">
                            <blockquote className="space-y-2">
                                <p className="text-lg">
                                    Powered by <span className="text-blue-600 font-bold">
                                        <a href={process.env.NEXT_PUBLIC_POWEREDBY_URL} target="_blank" rel="noopener noreferrer">
                                            {process.env.NEXT_PUBLIC_POWEREDBY_NAME}
                                        </a>
                                    </span>
                                </p>
                            </blockquote>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}