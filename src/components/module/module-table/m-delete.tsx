import *as z from 'zod'
import { Button } from '@/components/ui/button'
import { LoaderIcon, Trash } from 'lucide-react'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useTransition } from 'react'
import { FormError } from '@/components/auth/form-error'
import { FormSuccess } from '@/components/auth/form-success'
import { DeleteModuleSchema } from '@/schemas/module-schema'
import { deletemodule } from '@/actions/module'

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

const DeleteModule = ({ mid }: { mid: string }) => {
    const form = useForm<z.infer<typeof DeleteModuleSchema>>({
        resolver: zodResolver(DeleteModuleSchema),
        defaultValues: {
            id: mid
        }
    })
    const [isLoading, startTransition] = useTransition()
    const [open, setOpen] = useState(false)
    const [error, setError] = useState<string | undefined>("")
    const [success, setSuccess] = useState<string | undefined>("")
    const handleSubmit = (values: z.infer<typeof DeleteModuleSchema>) => {
        setError("")
        setSuccess("")
        startTransition(() => {
            deletemodule(values)
                .then((data) => {
                    setSuccess(data.success)
                    if (data.success) {
                        setTimeout(() => {
                            setSuccess("")
                            setOpen(false)
                            form.reset()
                        }, 3000)
                    }
                })
                .catch(() => setError("Something went wrong!"));
        })
    }
    return (
        <>
            <Dialog open={open} onOpenChange={setOpen} >
                <DialogTrigger asChild>
                    {/* <TooltipProvider>
                        <Tooltip >
                            <TooltipTrigger asChild> */}
                                <Button variant='outline' size='icon' className="border-destructive bg-transparent hover:bg-red-700/10">
                                    <Trash className="h-7 w-7 p-1 bg-transparent text-destructive" />
                                </Button>
                            {/* </TooltipTrigger>
                            <TooltipContent side='top' className='bg-red-500'>
                                <p className='z-50'>Delete Module</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider> */}
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Delete Module</DialogTitle>
                    </DialogHeader>
                    <DialogDescription>
                        This action is irreversable, Are you sure want to delete ?
                    </DialogDescription>
                    <div className="grid gap-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleSubmit)}>
                                <div className="grid gap-2">
                                    <div className="grid gap-1">
                                        <FormField
                                            control={form.control}
                                            name="id"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            type="hidden"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <FormError message={error} />
                                    <FormSuccess message={success} />
                                    <span className='w-full flex flex-grow gap-2'>
                                        <DialogClose asChild>
                                            <Button className='w-full'>
                                                Cancel
                                            </Button>
                                        </DialogClose>
                                        <Button disabled={isLoading} variant='destructive' className='w-full'>
                                            {isLoading && (
                                                <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                                            )}
                                            Delete
                                        </Button>
                                    </span>
                                </div>
                            </form>
                        </Form>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default DeleteModule