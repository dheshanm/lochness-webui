"use client"
import { UserRoundPlus } from "lucide-react"

import RegisterForm from '@/components/forms/auth/register'

export default function RegisterPage() {
    return (
        <div className="container mx-auto p-6 max-w-5xl flex flex-col h-full">
            <h1 className="text-2xl font-bold mb-4 text-center">
                <UserRoundPlus className="h-8 w-8 inline-block mr-2" />
                Register
            </h1>
            <div className="flex-grow overflow-auto mt-4">
                <RegisterForm />
            </div>
        </div>

    )
}