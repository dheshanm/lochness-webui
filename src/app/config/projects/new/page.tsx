import { Sprout } from "lucide-react"

import { Heading } from '@/components/heading'

import NewProjectForm from "@/components/forms/new-project"

export default function NewProjectPage() {
    return (
        <div className="container mx-auto p-6 max-w-5xl flex flex-col h-full">
            <Heading icon={<Sprout className="h-8 w-8" />} title="New Project" />
            <div className="flex-grow overflow-auto mt-4">
                <NewProjectForm />
            </div>
        </div>
    )
}