"use client"
import * as React from 'react';
import Link from 'next/link'
import { Sprout, ChevronLeft } from "lucide-react"

import SiteForm from "@/components/forms/site"

import { Button } from "@/components/ui/button"

type Params = Promise<{ project_id: string }>

export default function AddProjectSite({
    params,
}: {
    params: Params
}) {
    const [projectId, setProjectId] = React.useState<string | null>(null);

    React.useEffect(() => {
        const getProjectId = async () => {
            const { project_id } = await params;
            setProjectId(project_id);
        };
        getProjectId();
    }, []);

    return (
        <>
            <div className="p-4 md:p-4 border-b">
                <div className="max-w-screen-xl mx-auto">
                    {projectId && (
                        <>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Button
                                        variant="ghost"
                                        asChild
                                        size="sm"
                                        className="mr-2"
                                    >
                                        <Link href={`/config/projects/${projectId}`} className="flex items-center">
                                            <ChevronLeft />
                                        </Link>
                                    </Button>

                                    <div>
                                        <h1 className="font-semibold text-lg">Adding Site for {projectId}</h1>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="flex items-center bg-purple-100 text-purple-800 px-2.5 py-1 rounded-md text-sm font-medium">
                                        <Sprout className="h-4 w-4 mr-1.5" />
                                        Creating
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
            <div className="container mx-auto p-6 max-w-5xl flex flex-col h-full">
                <div className="flex-grow overflow-auto mt-4">
                    {projectId && <SiteForm project_id={projectId} site_id={null} />}
                </div>
            </div>
        </>

    )
}