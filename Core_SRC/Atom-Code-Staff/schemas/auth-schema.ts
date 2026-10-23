import * as z from "zod"

export const LoginSchema = z.object({
    email:z.string().email({
        message:"Email is required"
    }),
    password:z.string().min(1,{
        message: "Password is required"
    })
});

export const RegisterSchema = z.object({
    name:z.string().min(1,{
        message:"Name is required"
    }),
    email:z.string().email({
        message:"Email is required"
    }),
    password:z.string().min(6,{
        message: "Minimum 6 characters required"
    }),
    staffnumber: z.string().min(1, {
        message: "Rollnumber is required"
    }),
    department: z.string().min(1, {
        message: "Departmnet is required"
    }),
    phone: z.string().min(1, {
        message: "Phone is required"
    })
    // name,
    // email,
    // department,
    // staffnumber,
    // phone,
});

