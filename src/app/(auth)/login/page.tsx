import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";
import { LoginForm } from "@/components/auth/login-form";
import {
  APP_STATUS,
  CLIENT_BANNER,
  CLIENT_NAME,
  POWEREDBY_NAME,
  POWEREDBY_STATUS,
  POWEREDBY_URL,
  VENDOR_LOGO,
  VENDOR_NAME,
} from "@/config/branding";

export default function Login() {
  return (
    <>
      <div className="container relative hidden h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="absolute right-4 top-4 md:right-8 md:top-8">
          <ThemeToggle />
        </div>
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
          <div className="absolute inset-0 bg-zinc-900" />
          <div className="relative z-20 flex items-center text-lg font-medium">
            <Image
              src={VENDOR_LOGO}
              alt="logo mini"
              height={20}
              width={20}
              className="mr-2"
            />
            {VENDOR_NAME}
          </div>
          <div className="relative w-full h-full flex justify-center items-center">
            <Image
              src={CLIENT_BANNER}
              width={500}
              height={500}
              alt="Authentication"
              className="block"
            />
          </div>
          {POWEREDBY_STATUS && (
            <div className="relative z-20 mt-auto">
              <blockquote className="space-y-2">
                <p className="text-lg">
                  Powered by{" "}
                  <span className="text-blue-600 font-bold">
                    <a
                      href={POWEREDBY_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {POWEREDBY_NAME}
                    </a>
                  </span>
                </p>
              </blockquote>
            </div>
          )}
        </div>
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                {CLIENT_NAME}
              </h1>
              <p className="text-sm text-muted-foreground">
                Enter your email &amp; password below to login your account
              </p>
            </div>

            {APP_STATUS === "true" ? (
              <LoginForm />
            ) : (
              <div>
                <p className="text-center text-yellow-600">
                  The application is currently under Maintenance !{" "}
                </p>
                <br />
                <p className="text-center">Please try again later.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
