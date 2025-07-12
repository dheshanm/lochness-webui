"use client"
import * as React from 'react';
import { toast } from "sonner";
import { formatDistance } from 'date-fns'
import Link from 'next/link'
import { useRouter } from 'next/navigation';

import { Pencil, Activity, Trash } from "lucide-react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
import { DataSink } from '@/types/data-sinks';

import UnderDevelopment from "@/components/banners/under-development"
import DataSourcesList from '@/components/lists/data-sources';
import { Heading } from '@/components/heading';

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

    const [dataSinks, setDataSinks] = React.useState<DataSink[]>([]);
    const [loadingSinks, setLoadingSinks] = React.useState<boolean>(true);

    const router = useRouter();

    const handleDeleteSite = async () => {
        if (!site) return; // Ensure site data is available

        // Optional: Add a confirmation dialog before deleting
        if (!confirm(`Are you sure you want to delete site ${site.site_id}?`)) {
            return;
        }

        try {
            const response = await fetch(`/api/v1/projects/${projectId}/sites/${site.site_id}`, {
                method: 'DELETE',
                // You might need to include headers for authentication here,
                // e.g., 'Authorization': `Bearer ${yourAuthToken}` or session cookies
            });

            if (response.ok) {
                toast.success(`Site ${site.site_id} deleted successfully.`);
                router.push(`/config/projects/${projectId}`); // Redirect to projects list after deletion
            } else {
                const errorData = await response.json();
                toast.error(`Failed to delete site: ${errorData.error || response.statusText}`);
            }
        } catch (error) {
            console.error('Error deleting site:', error);
            toast.error('An unexpected error occurred during deletion.');
        }
    };

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

                    const createdAtRaw = data.site_metadata?.created_at;
                    const createdAtDate = createdAtRaw ? new Date(createdAtRaw) : null;
                    if (createdAtDate && !isNaN(createdAtDate.getTime())) {
                        setCreatedAt(createdAtDate.toLocaleDateString());
                        setCreatedAtDistance(formatDistance(createdAtDate, new Date(), { addSuffix: true }));
                    } else {
                        setCreatedAt("No date");
                        setCreatedAtDistance(null);
                    }
                } catch (error) {
                    console.error(error);
                    toast.error("Failed to fetch site data", {
                        description: "Redirecting to the project page.",
                    });
                    setTimeout(() => {
                        router.push(`/config/projects/${projectId}`);
                    }
                        , 2000);
                }
            }
        }

        fetchSite();
    }, [siteId]);

    React.useEffect(() => {
        if (projectId && siteId) {
            setLoadingSinks(true);
            fetch(`/api/v1/projects/${projectId}/sites/${siteId}/sinks`)
                .then(res => res.json())
                .then(data => setDataSinks(data))
                .catch(() => setDataSinks([]))
                .finally(() => setLoadingSinks(false));
        }
    }, [projectId, siteId]);


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
                            <Button
                                variant="destructive"
                                size="sm"
                                className="flex items-center gap-2"
                                onClick={handleDeleteSite} // Call handleDelete on click
                            >
                                <Trash className="h-4 w-4" />
                                <span className="hidden sm:inline">Delete</span>
                            </Button>
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

            <div className="flex justify-center w-full px-4">
                <Tabs defaultValue="sources" className="w-full max-w-5xl">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="sources">Data Sources</TabsTrigger>
                        <TabsTrigger value="sinks">Data Sinks</TabsTrigger>
                        <TabsTrigger value="logs">Logs</TabsTrigger>
                    </TabsList>
                    <TabsContent value="sources" className="mt-4">
                        <div className="p-4 border rounded-md bg-card text-card-foreground">
                            {projectId && siteId && (
                                <DataSourcesList project_id={projectId} site_id={siteId} />
                            )}
                        </div>
                    </TabsContent>
                    <TabsContent value="sinks" className="mt-4">
                        <div className="p-4 border rounded-md bg-card text-card-foreground">
                            <div className="flex justify-between items-center mb-4">
                                <Heading title="Data Sinks" />
                                {projectId && siteId && (
                                    <Button asChild variant="outline">
                                        <Link href={`/config/projects/${projectId}/sites/${siteId}/data-sinks/new`}>
                                            Add Data Sink
                                        </Link>
                                    </Button>
                                )}
                            </div>
                            {loadingSinks ? (
                                <Skeleton className="h-8 w-full bg-gray-200 dark:bg-gray-700" />
                            ) : dataSinks.length === 0 ? (
                                <p className="text-gray-500">No data sinks found.</p>
                            ) : (
                                <div className="space-y-4">
                                    {dataSinks.map((sink) => (
                                        <div key={sink.data_sink_name} className="border rounded p-4 bg-muted">
                                            <Link href={`/config/projects/${projectId}/sites/${siteId}/data-sinks/${sink.data_sink_name}`} className="font-medium text-primary hover:underline">
                                                {sink.data_sink_name}
                                            </Link>
                                            <pre className="text-xs mt-2 bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">
                                                {JSON.stringify(sink.data_sink_metadata, null, 2)}
                                            </pre>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </TabsContent>
                    <TabsContent value="logs" className="mt-4">
                        <div className="p-4 border rounded-md bg-card text-card-foreground">
                            <UnderDevelopment dismissable={false} />
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </>
    )
}

