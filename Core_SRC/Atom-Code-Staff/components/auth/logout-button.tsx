"use client"
import { logout } from "@/actions/logout";
import { Power } from 'lucide-react'

const LogoutButton = () => {
    const handleLogout = () => {
        logout()
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