import { db } from "@/lib/db";
export const getAllAdmins = () => {
    try {
        const admins = db.admin.findMany()
        return admins
    }
    catch {
        return null
    }
}
export const getAdminByEmail = async (email: string) => {
    try {
        const admin = await db.admin.findUnique({ where: { email } })
        return admin
    }
    catch {
        return null
    }
}
export const getAdminById = async (id: string) => {
    try {
        const admin = await db.admin.findUnique({ where: { id } })
        return admin
    }
    catch {
        return null
    }
}