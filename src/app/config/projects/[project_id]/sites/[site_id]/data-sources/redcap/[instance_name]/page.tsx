"use client"
import React from "react";
import { ChevronLeft } from "lucide-react"
import { toast } from "sonner";
import Link from 'next/link'
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { Button } from "@/components/ui/button"

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Skeleton } from "@/components/ui/skeleton"

import { Pencil, Trash } from "lucide-react"

import { DataSource } from "@/types/data-sources";
import ReactJson from 'react-json-view';

type Params = Promise<{ project_id: string, site_id: string, instance_name: string }>;

export default function ShowRedcapDataSource({
    params,
}: {
    params: Params
}) {
    const [projectId, setProjectId] = React.useState<string | null>(null);
    const [siteId, setSiteId] = React.useState<string | null>(null);
    const [instanceName, setInstanceName] = React.useState<string | null>(null);

    const [ dataSource, setDataSource ] = React.useState<DataSource | null>(null);

    const router = useRouter();
    const handleDeleteDataSource = async () => {
        if (!instanceName) return; // Ensure data source is available

        // Optional: Add a confirmation dialog before deleting
        if (!confirm(`Are you sure you want to delete data source ${instanceName}?`)) {
            return;
        }

        try {
            const response = await fetch(`/api/v1/projects/${projectId}/sites/${siteId}/sources/${instanceName}`, {
                method: 'DELETE',
                // You might need to include headers for authentication here,
                // e.g., 'Authorization': `Bearer ${yourAuthToken}` or session cookies
            });

            if (response.ok) {
                toast.success(`Data source ${instanceName} deleted successfully.`);
                router.push(`/config/projects/${projectId}/sites/${siteId}`); // Redirect to site page after deletion
            } else {
                const errorData = await response.json();
                toast.error(`Failed to delete data source: ${errorData.error || response.statusText}`);
            }
        } catch (error) {
            console.error('Error deleting data source:', error);
            toast.error('An unexpected error occurred during deletion.');
        }
    };

    React.useEffect(() => {
        const getProjectId = async () => {
            const { project_id } = await params;
            setProjectId(decodeURIComponent(project_id))
        };

        const getSiteId = async () => {
            const { site_id } = await params;
            setSiteId(decodeURIComponent(site_id));
        };

        const getInstanceName = async () => {
            const { instance_name } = await params;
            setInstanceName(decodeURIComponent(instance_name));
        };

        getProjectId();
        getSiteId();
        getInstanceName();
    }, [params]);

    React.useEffect(() => {
        const fetchDataSource = async () => {
            if (projectId && siteId && instanceName) {
                const response = await fetch(`/api/v1/projects/${projectId}/sites/${siteId}/sources/${instanceName}`);
                const data = await response.json();
                setDataSource(data);
            }
        };

        fetchDataSource();
    }, [projectId, siteId, instanceName]);

    return (
        <>
            {/* Header */}
            <div className="p-4 md:p-4 border-b">
                <div className="max-w-screen-xl mx-auto">
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
                                        {projectId ? (
                                            <BreadcrumbLink
                                                href={`/config/projects/${projectId}`}
                                            >
                                                {projectId}
                                            </BreadcrumbLink>
                                        ) : (
                                            <Skeleton className="h-4 w-[150px] bg-gray-200 dark:bg-gray-700" />
                                        )}
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                        {(projectId && siteId) ? (
                                            <BreadcrumbLink
                                                href={`/config/projects/${projectId}/sites/${siteId}`}
                                            >
                                                {siteId}
                                            </BreadcrumbLink>
                                        ) : (
                                            <Skeleton className="h-4 w-[150px] bg-gray-200 dark:bg-gray-700" />
                                        )}
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                        {(projectId && siteId) ? (
                                            <BreadcrumbLink href={`/config/projects/${projectId}/sites/${siteId}`}>
                                                Data Sources
                                            </BreadcrumbLink>
                                        ) : (
                                            <Skeleton className="h-4 w-[150px] bg-gray-200 dark:bg-gray-700" />
                                        )}
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                        {instanceName ? (
                                            <BreadcrumbLink>
                                                {instanceName}
                                            </BreadcrumbLink>
                                        ) : (
                                            <Skeleton className="h-4 w-[150px] bg-gray-200 dark:bg-gray-700" />
                                        )}
                                    </BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb>
                        </div>

                        <div className="flex items-center gap-2">

                        </div>
                    </div>
                </div>
            </div>

            {/* Data Source Details */}
            <div className="container mx-auto p-6 max-w-5xl flex flex-col">
                <div className="space-y-6">
                    <div className="overflow-hidden border rounded-lg">
                        {dataSource ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Image and Name Section */}
                                    <div className="p-4 border-b md:border-b-0 md:border-r flex items-center gap-4 col-span-1 md:col-span-2">
                                        {/* Conditionally render image based on type */}
                                        {dataSource.data_source_type === 'redcap' && (
                                            <Image src="/logo/redcap.jpeg" alt="REDCap" width={48} height={48} className="rounded" />
                                        )}
                                        {/* Add other conditions for different types if needed */}
                                        {/* <Image src={getDataSourceLogo(dataSource.data_source_type)} alt={`${dataSource.data_source_type} logo`} width={48} height={48} /> */}
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Data Source Name</p>
                                            <p className="mt-1 font-medium">{dataSource.data_source_name}</p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500 uppe">Type: <span className="uppercase">{dataSource.data_source_type}</span></p>
                                        </div>
                                    </div>
                                    {/* Status Section */}
                                    <div className="p-4 col-span-1">
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Status</p>
                                        <p className={`mt-1 font-medium ${dataSource.data_source_is_active ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                            {dataSource.data_source_is_active ? 'Active' : 'Inactive'}
                                        </p>
                                    </div>
                                </div>
                                {/* Metadata Section */}
                                <div className="p-4 border-t">
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Configuration Details</p>
                                        {/* Edit Button */}
                                        {(projectId && siteId && instanceName) && (
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/config/projects/${projectId}/sites/${siteId}/data-sources/redcap/${instanceName}/edit`}>
                                                    <Pencil className="h-4 w-4" />
                                                    <span>Edit</span>
                                                </Link>
                                            </Button>
                                        )}
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            className="flex items-center gap-2"
                                            onClick={handleDeleteDataSource} // Call handleDelete on click
                                        >
                                            <Trash className="h-4 w-4" />
                                            <span className="hidden sm:inline">Delete</span>
                                        </Button>
                                    </div>
                                    <div className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">
                                        <ReactJson
                                            src={{
                                                ...dataSource.data_source_metadata,
                                                api_token: dataSource.data_source_metadata?.api_token ? '••••••••••••••••••••' : undefined
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
                            // Skeleton Loader
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Skeleton for Image and Name */}
                                    <div className="p-4 border-b md:border-b-0 md:border-r flex items-center gap-4 col-span-1 md:col-span-2">
                                        <Skeleton className="h-12 w-12 rounded bg-gray-200 dark:bg-gray-700" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-24 bg-gray-200 dark:bg-gray-700" />
                                            <Skeleton className="h-6 w-40 bg-gray-200 dark:bg-gray-700" />
                                            <Skeleton className="h-3 w-20 bg-gray-200 dark:bg-gray-700" />
                                        </div>
                                    </div>
                                    {/* Skeleton for Status */}
                                    <div className="p-4 col-span-1">
                                        <Skeleton className="h-4 w-16 mb-2 bg-gray-200 dark:bg-gray-700" />
                                        <Skeleton className="h-6 w-20 bg-gray-200 dark:bg-gray-700" />
                                    </div>
                                </div>
                                {/* Skeleton for Metadata */}
                                <div className="p-4 border-t">
                                    <div className="flex justify-between items-center mb-2">
                                        <Skeleton className="h-4 w-32 bg-gray-200 dark:bg-gray-700" />
                                        <Skeleton className="h-8 w-16 bg-gray-200 dark:bg-gray-700" /> {/* Skeleton for Edit button */}
                                    </div>
                                    <Skeleton className="h-20 w-full bg-gray-200 dark:bg-gray-700" />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    )

}
