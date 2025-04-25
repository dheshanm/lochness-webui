"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from 'next/link'
import * as React from 'react'
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"

import { Input } from "@/components/ui/input"

import { authClient } from "@/lib/auth-client"

const formSchema = z.object({
    name: z.string()
        .min(1, "Name is required")
        .max(256, "Name must be less than 256 characters long"),
    email: z.string()
        .min(1, "Email is required")
        .email("Email must be a valid email address"),
    password: z.string()
        .min(2, "Password must be at least 2 characters long")
        .max(128, "Password must be less than 128 characters long")
})

export type FormSchema = z.infer<typeof formSchema>

export default function RegisterForm() {
    const [isLoading, setIsLoading] = React.useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
        }
    })

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        setIsLoading(true)
        const { name, email, password } = data;

        // Create a promise to handle the sign-up process
        const signUpPromise = new Promise((resolve, reject) => {
            authClient.signUp.email({
                email,
                password,
                name,
            }, {
                onRequest: () => {
                    setIsLoading(true)
                },
                onResponse: (response) => {
                    console.log({ response })

                    resolve(response)
                    setIsLoading(false)
                },
                onError: (error) => {
                    console.log({ error })

                    reject(error)
                    setIsLoading(false)
                }
            })
        })

        toast.promise(signUpPromise, {
            loading: "Registering...",
            success: () => {
                return `Registration successful!`
            },
            error: () => {
                return `Registration failed!`
            }
        })
    }

    return (
        <div className="container mx-auto p-6 max-w-2xl">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="Email" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder="Password" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading ? "Registering..." : "Register"}
                    </Button>

                    <div className="text-sm text-center text-gray-500 pt-2">
                        Already have an account?{' '}

                        <Button asChild variant="link" type="button" className="p-0 h-auto font-medium text-blue-500 hover:underline">
                            <Link href="/auth/login">
                                Login
                            </Link>
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}