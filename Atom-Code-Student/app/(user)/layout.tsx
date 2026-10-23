import { auth } from "@/auth";
import Sidebar from "@/components/sidebar";
import Topbar from "@/components/topbar";
export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return (
    <main className="flex min-h-screen min-w-screen flex-row">
      <Sidebar />
      <div className="w-full h-full flex flex-col items-center justify-center flex-grow">
        <Topbar name={session?.user?.name as string} email={session?.user?.email as string} image={session?.user?.image as string} />
        <div className="h-full w-full flex flex-col m-4 items-center ">
          {children}
        </div>
      </div>
    </main>
  )
}