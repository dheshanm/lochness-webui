"use client"
import { ChevronLeft, Sprout } from "lucide-react";
import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";

import RedcapForm from '@/components/forms/data-sources/redcap';
import useProtectPage from "@/hooks/protectPage";

type Params = Promise<{ project_id: string, site_id: string }>

export default function AddRedcapDataSource({
    params,
}: {
    params: Params
}) {
    useProtectPage();
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
                                            <BreadcrumbSeparator className="hidden md:flex" />
                                            <BreadcrumbItem className="hidden md:flex">
                                                <BreadcrumbPage className="font-semibold">
                                                    New REDCap Data Source
                                                </BreadcrumbPage>
                                            </BreadcrumbItem>
                                        </BreadcrumbList>
                                    </Breadcrumb>
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
                <div className="flex items-center gap-2 mb-4">
                    <Image src="/logo/redcap.jpeg" alt="REDCap" width={32} height={32} className="rounded" />
                    <h1 className="text-2xl font-semibold">Add REDCap Data Source</h1>
                </div>

                <div className="flex-grow overflow-auto mt-4">
                    {projectId && siteId && <RedcapForm project_id={projectId} site_id={siteId} instance_name={null} />}
                </div>
            </div>
        </>

    )
}