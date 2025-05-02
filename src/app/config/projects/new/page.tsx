"use client"
import { Sprout } from "lucide-react"

import { Heading } from '@/components/heading'

import ProjectForm from "@/components/forms/project"
import useProtectPage from "@/hooks/protectPage"

export default function NewProjectPage() {
    useProtectPage();

    return (
        <div className="container mx-auto p-6 max-w-5xl flex flex-col h-full">
            <Heading icon={<Sprout className="h-8 w-8" />} title="New Project" />
            <div className="flex-grow overflow-auto mt-4">
                <ProjectForm project_id={null} />
            </div>
        </div>
    )
}