"use client"
import * as React from 'react';
import { toast } from "sonner";
import { formatDistance } from 'date-fns'
import Link from 'next/link'

import { Pencil, Activity } from "lucide-react"

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

import { Site } from '@/types/sites';

type Params = Promise<{ project_id: string, site_id: string }>

export default function SitePage({
    params,
}: {
    params: Params
}) {
    const [projectId, setProjectId] = React.useState<string | null>(null);
    const [siteId, setSiteId] = React.useState<string | null>(null);

    const [site, setSite] = React.useState<Site | null>(null);

    const [created_at, setCreatedAt] = React.useState<string | null>(null);
    const [createdAtDistance, setCreatedAtDistance] = React.useState<string | null>(null);

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
    }, []);

    React.useEffect(() => {
        const fetchSite = async () => {
            if (projectId && siteId) {
                try {
                    const response = await fetch(`/api/v1/projects/${projectId}/sites/${siteId}`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch site');
                    }
                    const data = await response.json();
                    setSite(data);

                    setCreatedAt(new Date(data.site_metadata.created_at).toLocaleDateString());
                    setCreatedAtDistance(formatDistance(new Date(data.site_metadata.created_at), new Date(), { addSuffix: true }));
                } catch (error) {
                    console.error(error);
                    toast.error('Failed to fetch site');
                }
            }
        }

        fetchSite();
    }, [siteId]);


    return (
        <>
            <div className="p-4 md:p-4 border-b">
                <div className="max-w-screen-xl mx-auto">
                    <div className="flex items-center justify-between">
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink
                                        href={`/config/projects/${projectId}`}
                                    >
                                        {projectId ? projectId : <Skeleton className="h-4 w-20 bg-gray-200 dark:bg-gray-700" />}
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage className="font-semibold">
                                        {siteId ? siteId : <Skeleton className="h-4 w-20 bg-gray-200 dark:bg-gray-700" />}
                                    </BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>

                        <div className="flex items-center gap-2">
                            <Button asChild variant="outline" size="sm" className="flex items-center gap-2">
                                <Link href={`/config/projects/${projectId}/sites/${siteId}/edit`} className="flex items-center gap-2">
                                    <Pencil className="h-4 w-4" />
                                    <span className="hidden sm:inline">Edit</span>
                                </Link>
                            </Button>

                            <Button
                                size="sm"
                                variant={site?.site_is_active ? "outline" : "secondary"}
                                className="flex items-center gap-2"
                            >
                                <div className="flex items-center gap-2">
                                    <Activity className="h-4 w-4" />
                                    <span className="hidden sm:inline">
                                        {site?.site_is_active ? 'Active' : 'Inactive'}
                                    </span>
                                    <div className={`h-2 w-2 rounded-full ${site?.site_is_active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                </div>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto p-6 max-w-5xl flex flex-col">
                {site ? (
                    <div className="space-y-6">
                        <div className="overflow-hidden">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4">
                                    <p className="text-sm text-gray-500 font-medium">Site Information</p>
                                    <p className="mt-2 font-medium">{site.site_name}</p>
                                    <p className="text-xs text-gray-400">ID: {site.site_id}</p>
                                </div>
                                <div className="p-4">
                                    <p className="text-sm text-gray-500 font-medium">Created At</p>
                                    <p className="mt-2 font-medium">{created_at || "No date"}</p>
                                    {createdAtDistance && <p className="text-xs text-gray-400">{createdAtDistance}</p>}
                                </div>
                            </div>
                            <div className="p-4">
                                <p className="text-sm text-gray-500 font-medium">Description</p>
                                <p className="mt-2 font-medium">{site.site_metadata.description || "No description"}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="overflow-hidden">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 space-y-2">
                                    <p className="text-sm text-gray-500 font-medium">Site Information</p>
                                    {/* Use a slightly darker background for better visibility */}
                                    <Skeleton className="h-5 w-48 bg-gray-200 dark:bg-gray-700" /> {/* Site Name */}
                                    <Skeleton className="h-3 w-40 bg-gray-200 dark:bg-gray-700" /> {/* Site ID */}
                                </div>
                                <div className="p-4 space-y-2">
                                    <p className="text-sm text-gray-500 font-medium">Created At</p>
                                    <Skeleton className="h-5 w-32 bg-gray-200 dark:bg-gray-700" /> {/* Date */}
                                    <Skeleton className="h-3 w-24 bg-gray-200 dark:bg-gray-700" /> {/* Relative Time */}
                                </div>
                            </div>
                            <div className="p-4 space-y-2">
                                <p className="text-sm text-gray-500 font-medium">Description</p>
                                <Skeleton className="h-4 w-full bg-gray-200 dark:bg-gray-700" />
                                <Skeleton className="h-4 w-5/6 bg-gray-200 dark:bg-gray-700" />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="border-t my-6 w-full" />

        </>
    )
}