"use client"
import * as React from 'react';
import { Pencil, ChevronLeft } from "lucide-react"
import Link from 'next/link'

import { Button } from "@/components/ui/button"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

// import NewProjectSiteForm from "@/components/forms/new-project-site"
import SiteForm from "@/components/forms/site"

type Params = Promise<{ project_id: string, site_id: string }>

export default function AddProjectSite({
    params,
}: {
    params: Params
}) {
    const [projectId, setProjectId] = React.useState<string | null>(null);
    const [siteId, setSiteId] = React.useState<string | null>(null);

    React.useEffect(() => {
        const getProjectId = async () => {
            const { project_id } = await params;
            setProjectId(project_id);
        };

        const getSiteId = async () => {
            const { site_id } = await params;
            setSiteId(site_id);
        };

        getProjectId();
        getSiteId();
    }, [params]);

    return (
        <>
            <div className="p-4 md:p-4 border-b">
                <div className="max-w-screen-xl mx-auto">
                    {projectId && siteId && (
                        <>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Button
                                        variant="ghost"
                                        asChild
                                        size="sm"
                                        className="mr-2"
                                    >
                                        <Link href={`/config/projects/${projectId}/sites/${siteId}`} className="flex items-center">
                                            <ChevronLeft />
                                        </Link>
                                    </Button>

                                    <Breadcrumb>
                                        <BreadcrumbList>
                                            <BreadcrumbItem>
                                                <BreadcrumbLink
                                                    href={`/config/projects/${projectId}`}
                                                >
                                                    {projectId}
                                                </BreadcrumbLink>
                                            </BreadcrumbItem>
                                            <BreadcrumbSeparator />
                                            <BreadcrumbItem>
                                                <BreadcrumbLink
                                                    href={`/config/projects/${projectId}/sites/${siteId}`}
                                                >
                                                    {siteId}
                                                </BreadcrumbLink>
                                            </BreadcrumbItem>
                                        </BreadcrumbList>
                                    </Breadcrumb>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="flex items-center bg-amber-100 text-amber-800 px-2.5 py-1 rounded-md text-sm font-medium">
                                        <Pencil className="h-4 w-4 mr-1.5" />
                                        Editing
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
            <div className="container mx-auto p-6 max-w-5xl flex flex-col h-full">
                <div className="flex-grow overflow-auto mt-4">
                    {projectId && <SiteForm project_id={projectId} site_id={siteId} />}
                </div>
            </div>
        </>

    )
}