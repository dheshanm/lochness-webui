"use client"
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { SubjectsForDataSourceTable } from '@/components/lists/subjects-table';
import { useParams } from "next/navigation";

interface Params {
    project_id: string;
    site_id: string;
    instance_name: string;
}

interface DataSource {
    data_source_name: string;
    data_source_is_active: boolean;
    data_source_type: string;
    data_source_metadata: {
        keystore_name: string;
        api_url: string;
    };
}

export default function ShowMindlampDataSource() {
    const params = useParams();
    const projectId = params.project_id as string;
    const siteId = params.site_id as string;
    const instanceName = params.instance_name as string;
    const [dataSource, setDataSource] = React.useState<DataSource | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchDataSource = async () => {
            if (projectId && siteId && instanceName) {
                const response = await fetch(`/api/v1/projects/${projectId}/sites/${siteId}/sources/${instanceName}`);
                const data = await response.json();
                setDataSource(data);
            }
            setLoading(false);
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
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">MindLAMP Data Source</h1>
                                <p className="text-muted-foreground">
                                    View details for {instanceName}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant={dataSource?.data_source_is_active ? "default" : "secondary"}>
                                {dataSource?.data_source_is_active ? "Active" : "Inactive"}
                            </Badge>
                        </div>
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
                                        <Image src="/logo/mindLAMP.png" alt="MindLAMP" width={48} height={48} className="rounded" />
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
                                <Separator />
                                <div className="p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Keystore Name</p>
                                            <p className="mt-1 font-medium">{dataSource.data_source_metadata.keystore_name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">API URL</p>
                                            <p className="mt-1 font-medium break-all">{dataSource.data_source_metadata.api_url}</p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : loading ? (
                            <div className="p-4">
                                <div className="animate-pulse">
                                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4">
                                <p className="text-gray-500">Data source not found</p>
                            </div>
                        )}
                    </div>
                    <div className="border-t my-6 w-full" />
                    <div className="flex justify-center w-full px-4">
                        <SubjectsForDataSourceTable project_id={projectId} site_id={siteId} data_source_name={instanceName} />
                    </div>
                </div>
            </div>
        </>
    );
} 