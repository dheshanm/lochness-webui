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
import { Pencil, Trash, RefreshCw } from "lucide-react"
import { DataSource } from "@/types/data-sources";
import { SubjectsForDataSourceTable } from '@/components/lists/subjects-table';

type Params = Promise<{ project_id: string, site_id: string, instance_name: string }>;

export default function ShowXnatDataSource({ params }: { params: Params }) {
    const [projectId, setProjectId] = React.useState<string | null>(null);
    const [siteId, setSiteId] = React.useState<string | null>(null);
    const [instanceName, setInstanceName] = React.useState<string | null>(null);
    const [dataSource, setDataSource] = React.useState<DataSource | null>(null);
    const router = useRouter();

    const handleDeleteDataSource = async () => {
        if (!instanceName) return;
        if (!confirm(`Are you sure you want to delete data source ${instanceName}?`)) return;
        try {
            const response = await fetch(`/api/v1/projects/${projectId}/sites/${siteId}/sources/${instanceName}`, { method: 'DELETE' });
            if (response.ok) {
                toast.success(`Data source ${instanceName} deleted successfully.`);
                router.push(`/config/projects/${projectId}/sites/${siteId}`);
            } else {
                const errorData = await response.json();
                toast.error(`Failed to delete data source: ${errorData.error || response.statusText}`);
            }
        } catch (error) {
            toast.error('An unexpected error occurred during deletion.');
        }
    };

    React.useEffect(() => {
        const getProjectId = async () => { const { project_id } = await params; setProjectId(decodeURIComponent(project_id)); };
        const getSiteId = async () => { const { site_id } = await params; setSiteId(decodeURIComponent(site_id)); };
        const getInstanceName = async () => { const { instance_name } = await params; setInstanceName(decodeURIComponent(instance_name)); };
        getProjectId(); getSiteId(); getInstanceName();
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
                                    <BreadcrumbItem>{projectId ? (<BreadcrumbLink href={`/config/projects/${projectId}`}>{projectId}</BreadcrumbLink>) : (<Skeleton className="h-4 w-[150px] bg-gray-200 dark:bg-gray-700" />)}</BreadcrumbItem>
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>{(projectId && siteId) ? (<BreadcrumbLink href={`/config/projects/${projectId}/sites/${siteId}`}>{siteId}</BreadcrumbLink>) : (<Skeleton className="h-4 w-[150px] bg-gray-200 dark:bg-gray-700" />)}</BreadcrumbItem>
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                        {(projectId && siteId) ? (
                                            <BreadcrumbLink href={`/config/projects/${projectId}/sites/${siteId}`}>
                                                Data Sources
                                            </BreadcrumbLink>
                                        ) : (
                                            <span>Data Sources</span>
                                        )}
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>{instanceName ? (<BreadcrumbLink>{instanceName}</BreadcrumbLink>) : (<Skeleton className="h-4 w-[150px] bg-gray-200 dark:bg-gray-700" />)}</BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb>
                        </div>
                        <div className="flex items-center gap-2"></div>
                    </div>
                </div>
            </div>
            <div className="container mx-auto p-6 max-w-5xl flex flex-col">
                <div className="space-y-6">
                    <div className="overflow-hidden border rounded-lg">
                        {dataSource ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="p-4 border-b md:border-b-0 md:border-r flex items-center gap-4 col-span-1 md:col-span-2">
                                        <Image src="/logo/xnat.jpeg" alt="XNAT" width={48} height={48} className="rounded" />
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Data Source Name</p>
                                            <p className="mt-1 font-medium">{dataSource.data_source_name}</p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500 uppe">Type: <span className="uppercase">{dataSource.data_source_type}</span></p>
                                        </div>
                                    </div>
                                    <div className="p-4 col-span-1">
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Status</p>
                                        <p className={`mt-1 font-medium ${dataSource.data_source_is_active ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{dataSource.data_source_is_active ? 'Active' : 'Inactive'}</p>
                                    </div>
                                </div>
                                <div className="p-4 border-t">
                                    <div className="mb-2 font-semibold">XNAT Configuration</div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div><span className="font-medium">API Token:</span> <span className="font-mono">••••••••••••••••••••</span></div>
                                        <div><span className="font-medium">Endpoint URL:</span> <span className="font-mono">{dataSource.data_source_metadata?.endpoint_url}</span></div>
                                        <div><span className="font-medium">Subject ID Variable:</span> <span className="font-mono">{dataSource.data_source_metadata?.subject_id_variable}</span></div>
                                        {Array.isArray(dataSource.data_source_metadata?.optional_variables_dictionary) && dataSource.data_source_metadata.optional_variables_dictionary.length > 0 && (
                                            <div className="col-span-2"><span className="font-medium">Optional Variables:</span> <span className="font-mono">{dataSource.data_source_metadata.optional_variables_dictionary.map((v: any) => v.variable_name).join(', ')}</span></div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2 p-4 border-t">
                                    <Button variant="outline" asChild size="sm"><Link href={`/config/projects/${projectId}/sites/${siteId}/data-sources/xnat/${instanceName}/edit`}><Pencil className="w-4 h-4 mr-1" />Edit</Link></Button>
                                    <Button variant="destructive" size="sm" onClick={handleDeleteDataSource}><Trash className="w-4 h-4 mr-1" />Delete</Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex items-center gap-2"
                                        onClick={async () => {
                                            try {
                                                const response = await fetch('/api/v1/jobs', {
                                                    method: 'POST',
                                                    headers: {
                                                        'Content-Type': 'application/json',
                                                    },
                                                    credentials: 'include',
                                                    body: JSON.stringify({
                                                        job_type: 'data_pull',
                                                        project_id: projectId,
                                                        site_id: siteId,
                                                        data_source_name: instanceName,
                                                        job_metadata: {
                                                            data_source_type: 'xnat'
                                                        }
                                                    })
                                                });
                                                if (response.ok) {
                                                    const result = await response.json();
                                                    toast.success(`Data pull job created successfully (Job ID: ${result.job_id})`);
                                                } else {
                                                    const errorData = await response.json();
                                                    toast.error(`Failed to create data pull job: ${errorData.error || response.statusText}`);
                                                }
                                            } catch (error) {
                                                toast.error('An unexpected error occurred while creating the data pull job.');
                                            }
                                        }}
                                    >
                                        <RefreshCw className="w-4 h-4 mr-1" /> Pull Data
                                    </Button>
                                </div>
                            </>
                        ) : (<div className="p-4 text-center text-gray-500">Loading...</div>)}
                    </div>
                    <div className="border-t my-6 w-full" />
                    <div className="flex justify-center w-full px-4">
                        <SubjectsForDataSourceTable project_id={projectId || ''} site_id={siteId || ''} data_source_name={instanceName || ''} />
                    </div>
                </div>
            </div>
        </>
    );
} 