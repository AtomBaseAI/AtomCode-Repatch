"use client"
import { logout } from "@/actions/logout";
import { Power } from 'lucide-react'

const LogoutButton = () => {
    const reloadCallback = () => {
        window.location.reload();
    }
    const handleLogout = async () => {
        await logout();
        reloadCallback()
    }
    return (
        <button className="relative p-2 text-gray-400 hover:bg-red-500 hover:text-white focus:bg-gray-100 focus:text-gray-600 rounded-full"
            onClick={handleLogout}>
            <span className='h-6 w-6'>
                <Power fill='none' />
            </span>
        </button>
    )
}

export default LogoutButton