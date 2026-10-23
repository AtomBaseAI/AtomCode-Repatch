"use client"
import { Button } from '@/components/ui/button'
import { Book, Laptop, LayoutDashboard, Settings, Sun, Moon, FlaskConical } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const Sidebar = () => {
  const pathname = usePathname()
  const router = useRouter()
  const { setTheme, theme } = useTheme()
  const isActive = (path: string) => pathname.startsWith(path)
  return (
    <aside className="sticky top-0 left-0 z-50 hidden sm:flex sm:flex-col w-20 h-screen border-r border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-lg">
      <div className="flex-grow flex flex-col justify-between">
        <nav className="flex flex-col my-4 space-y-4">
          <Link href='/student/dashboard' className={`inline-flex items-center justify-center py-3 transition-colors cursor-pointer ${isActive('/student/dashboard') ? 'text-primary border-l-4 border-primary' : ''}`} >
            <LayoutDashboard fill='none' className='h-6 w-6' />
          </Link>
          <TooltipProvider>
            <Tooltip >
              <TooltipTrigger asChild>
                <Link href="/student/courses" className={`inline-flex items-center justify-center py-3 transition-colors cursor-pointer ${isActive('/student/courses') ? 'text-primary border-l-4 border-primary' : ''}`} >
                  <Book fill='none' className='h-6 w-6' />
                </Link>
              </TooltipTrigger>
              <TooltipContent side='right' className='mb-0'>
                <p className='z-50'>Courses</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip >
              <TooltipTrigger asChild>
                <Link href="/student/lab" className={`inline-flex items-center justify-center py-3 transition-colors cursor-pointer ${isActive('/student/lab') ? 'text-primary border-l-4 border-primary' : ''}`} >
                  <Laptop fill='none' className='h-6 w-6' />
                </Link>
              </TooltipTrigger>
              <TooltipContent side='right' className='mb-0'>
                <p className='z-50'>Labs</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip >
              <TooltipTrigger asChild>
                <Link href="/student/assessments" className={`inline-flex items-center justify-center py-3 transition-colors cursor-pointer ${isActive('/student/assessments') ? 'text-primary border-l-4 border-primary' : ''}`} >
                  <FlaskConical fill='none' className='h-6 w-6' />
                </Link>
              </TooltipTrigger>
              <TooltipContent side='right' className='mb-0'>
                <p className='z-50'>Assessments</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>


        </nav>
        <div className="inline-flex flex-col items-center justify-center h-30 w-20 ">
          <TooltipProvider>
            <Tooltip >
              <TooltipTrigger asChild>
                <Button
                  className="hover:text-primary bg-transparent text-black dark:text-white hover:bg-transparent my-4 border-0 shadow-none  cursor-pointer"
                  size="icon"
                  onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
                  <Sun className="h-6 w-6 dark:hidden" />
                  <Moon className="hidden h-6 w-6 dark:block" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side='right' className='mb-0 ml-5'>
                <p className='z-50'>Theme</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip >
              <TooltipTrigger asChild>
                <Link href='/student/settings' className={`w-full inline-flex items-center justify-center py-3 transition-colors cursor-pointer ${isActive('/student/settings') ? 'text-primary border-l-4 border-primary' : ''}`} >
                  <Settings fill='none' className='h-6 w-6' />
                </Link>
              </TooltipTrigger>
              <TooltipContent side='right' className='mb-0'>
                <p className='z-50'>Settings</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

        </div>
      </div>
    </aside>

  )
}

export default Sidebar