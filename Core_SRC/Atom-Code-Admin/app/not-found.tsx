import { Button } from "@/components/ui/button"
import { CircleSlash } from "lucide-react"
import Link from "next/link"


const NotFound = () => {
    return (
        <div className="w-full h-screen flex flex-col gap-2 justify-center items-center">
            <div className=" shadow-lg rounded-md overflow-hidden w-[20rem] order-first lg:order-none border hover:border-red-500" >
                <div className="py-5 px-6 sm:px-8 flex flex-col justify-center items-center gap-4">
                    <CircleSlash className="h-10 w-10 text-red-400" />
                    Page Not Found !
                </div>
            </div>
            <Link href='/dashboard' className=" w-[20rem] bg-primary hover:bg-primary/80 h-9 rounded-md text-white font-semibold flex justify-center items-center"> Home </Link>
        </div>
    )
}

export default NotFound