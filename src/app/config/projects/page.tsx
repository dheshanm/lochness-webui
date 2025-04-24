"use client"
import { FolderDot } from "lucide-react";

import { Heading } from '@/components/heading';
import ProjectsList from '@/components/lists/projects';


export default function ProjectsPage() {
    return (
        <div className="container mx-auto p-6 max-w-5xl">
            <Heading icon={<FolderDot className="h-8 w-8" />} title="Projects" />

            <div className="space-y-6 min-w-[320px]">
                <ProjectsList />
            </div>

            {/* <div className="mt-6">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Manage your projects here. You can add, edit, or delete projects as needed.
                </p>
            </div> */}

        </div>
    )
}