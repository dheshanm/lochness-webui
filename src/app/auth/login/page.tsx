"use client"
import { LogIn } from "lucide-react"

import LoginForm from '@/components/forms/auth/login'

export default function LoginPage() {
    return (
        <div className="container mx-auto p-6 max-w-5xl flex flex-col h-full">
            <h1 className="text-2xl font-bold mb-4 text-center">
                <LogIn className="h-8 w-8 inline-block mr-2" />
                Login
            </h1>
            <div className="flex-grow overflow-auto mt-4">
                <LoginForm />
            </div>
        </div>

    )
}