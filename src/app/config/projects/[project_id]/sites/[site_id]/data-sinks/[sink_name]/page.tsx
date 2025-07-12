"use client"
import React from "react";
import { ChevronLeft, Pencil, Trash } from "lucide-react";
import { toast } from "sonner";
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from "@/components/ui/button";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import ReactJson from 'react-json-view';

type Params = Promise<{ project_id: string, site_id: string, sink_name: string }>;

export default function ShowDataSink({ params }: { params: Params }) {
    const [projectId, setProjectId] = React.useState<string | null>(null);
    const [siteId, setSiteId] = React.useState<string | null>(null);
    const [sinkName, setSinkName] = React.useState<string | null>(null);
    const [dataSink, setDataSink] = React.useState<any | null>(null);
    const router = useRouter();

    const handleDeleteDataSink = async () => {
        if (!sinkName) return;
        if (!confirm(`Are you sure you want to delete data sink ${sinkName}?`)) return;
        try {
            const response = await fetch(`/api/v1/projects/${projectId}/sites/${siteId}/sinks/${sinkName}`, { method: 'DELETE' });
            if (response.ok) {
                toast.success(`Data sink ${sinkName} deleted successfully.`);
                router.push(`/config/projects/${projectId}/sites/${siteId}`);
            } else {
                const errorData = await response.json();
                toast.error(`Failed to delete data sink: ${errorData.error || response.statusText}`);
            }
        } catch (error) {
            console.error('Error deleting data sink:', error);
            toast.error('An unexpected error occurred during deletion.');
        }
    };

    React.useEffect(() => {
        const getProjectId = async () => {
            const { project_id } = await params;
            setProjectId(decodeURIComponent(project_id));
        };
        const getSiteId = async () => {
            const { site_id } = await params;
            setSiteId(decodeURIComponent(site_id));
        };
        const getSinkName = async () => {
            const { sink_name } = await params;
            setSinkName(decodeURIComponent(sink_name));
        };
        getProjectId();
        getSiteId();
        getSinkName();
    }, [params]);

    React.useEffect(() => {
        const fetchDataSink = async () => {
            if (projectId && siteId && sinkName) {
                const response = await fetch(`/api/v1/projects/${projectId}/sites/${siteId}/sinks/${sinkName}`);
                const data = await response.json();
                setDataSink(data);
            }
        };
        fetchDataSink();
    }, [projectId, siteId, sinkName]);

    return (
        <>
            <div className="p-4 md:p-4 border-b">
                <div className="max-w-screen-xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <Button variant="ghost" asChild size="sm" className="mr-2">
                                <Link href={`/config/projects/${projectId}/sites/${siteId}`} className="flex items-center">
                                    <ChevronLeft />
                                </Link>
                            </Button>
                            <Breadcrumb>
                                <BreadcrumbList>
                                    <BreadcrumbItem>
                                        {projectId ? (
                                            <BreadcrumbLink href={`/config/projects/${projectId}`}>{projectId}</BreadcrumbLink>
                                        ) : (
                                            <Skeleton className="h-4 w-[150px] bg-gray-200 dark:bg-gray-700" />
                                        )}
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                        {(projectId && siteId) ? (
                                            <BreadcrumbLink href={`/config/projects/${projectId}/sites/${siteId}`}>{siteId}</BreadcrumbLink>
                                        ) : (
                                            <Skeleton className="h-4 w-[150px] bg-gray-200 dark:bg-gray-700" />
                                        )}
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                        {(projectId && siteId) ? (
                                            <BreadcrumbLink href={`/config/projects/${projectId}/sites/${siteId}#sinks`}>
                                                Data Sinks
                                            </BreadcrumbLink>
                                        ) : (
                                            <Skeleton className="h-4 w-[150px] bg-gray-200 dark:bg-gray-700" />
                                        )}
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                        {sinkName ? (
                                            <BreadcrumbLink>{sinkName}</BreadcrumbLink>
                                        ) : (
                                            <Skeleton className="h-4 w-[150px] bg-gray-200 dark:bg-gray-700" />
                                        )}
                                    </BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb>
                        </div>
                        <div className="flex items-center gap-2">
                            {(projectId && siteId && sinkName) && (
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/config/projects/${projectId}/sites/${siteId}/data-sinks/${sinkName}/edit`}>
                                        <Pencil className="h-4 w-4" />
                                        <span>Edit</span>
                                    </Link>
                                </Button>
                            )}
                            <Button variant="destructive" size="sm" className="flex items-center gap-2" onClick={handleDeleteDataSink}>
                                <Trash className="h-4 w-4" />
                                <span className="hidden sm:inline">Delete</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="container mx-auto p-6 max-w-5xl flex flex-col">
                <div className="space-y-6">
                    <div className="overflow-hidden border rounded-lg">
                        {dataSink ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="p-4 border-b md:border-b-0 md:border-r flex items-center gap-4 col-span-1 md:col-span-2">
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Data Sink Name</p>
                                            <p className="mt-1 font-medium">{dataSink.data_sink_name}</p>
                                        </div>
                                    </div>
                                    <div className="p-4 col-span-1">
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Project</p>
                                        <p className="mt-1 font-medium">{dataSink.project_id}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-2">Site</p>
                                        <p className="mt-1 font-medium">{dataSink.site_id}</p>
                                    </div>
                                </div>
                                <div className="p-4 border-t">
                                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-2">Data Sink Metadata</p>
                                    {dataSink.data_sink_metadata?.keystore_name && (
                                        <div className="mb-2">
                                            <span className="font-medium">Keystore Reference:</span> <span className="text-blue-700 dark:text-blue-300">{dataSink.data_sink_metadata.keystore_name}</span>
                                        </div>
                                    )}
                                    <div className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">
                                        <ReactJson
                                            src={{
                                                ...dataSink.data_sink_metadata,
                                                // Mask any known sensitive fields if needed
                                            }}
                                            name={false}
                                            collapsed={2}
                                            enableClipboard={true}
                                            displayDataTypes={false}
                                            theme="rjv-default"
                                            style={{ fontSize: '14px', borderRadius: '8px', padding: '8px', background: 'none' }}
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="p-4">Loading...</div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
} 