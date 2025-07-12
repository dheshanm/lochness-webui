"use client"
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { useRouter } from 'next/navigation';

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

export default function EditMindlampDataSource({ params }: { params: Params }) {
    const { project_id: projectId, site_id: siteId, instance_name: instanceName } = params;
    const [dataSource, setDataSource] = React.useState<DataSource | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);
    const router = useRouter();

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

    const handleSave = async () => {
        if (!dataSource) return;
        
        setSaving(true);
        try {
            const response = await fetch(`/api/v1/projects/${projectId}/sites/${siteId}/sources/${instanceName}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataSource),
            });

            if (response.ok) {
                toast.success('Data source updated successfully');
                router.push(`/config/projects/${projectId}/sites/${siteId}/data-sources/mindlamp/${instanceName}`);
            } else {
                const errorData = await response.json();
                toast.error('Failed to update data source', { description: errorData.error || response.statusText });
            }
        } catch (error) {
            toast.error('An unexpected error occurred');
        } finally {
            setSaving(false);
        }
    };

    const handleToggleActive = () => {
        if (dataSource) {
            setDataSource({
                ...dataSource,
                data_source_is_active: !dataSource.data_source_is_active
            });
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
            </div>
        );
    }

    if (!dataSource) {
        return (
            <div className="container mx-auto p-6">
                <p className="text-gray-500">Data source not found</p>
            </div>
        );
    }

    return (
        <>
            <div className="p-4 md:p-4 border-b">
                <div className="max-w-screen-xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <Button variant="ghost" asChild size="sm" className="mr-2">
                                <Link href={`/config/projects/${projectId}/sites/${siteId}/data-sources/mindlamp/${instanceName}`} className="flex items-center">
                                    <ChevronLeft />
                                </Link>
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">Edit MindLAMP Data Source</h1>
                                <p className="text-muted-foreground">
                                    Update configuration for {instanceName}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant={dataSource.data_source_is_active ? "default" : "secondary"}>
                                {dataSource.data_source_is_active ? "Active" : "Inactive"}
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto p-6 max-w-5xl flex flex-col">
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Configuration</CardTitle>
                            <CardDescription>
                                Update the MindLAMP data source configuration
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Keystore Name</label>
                                    <input
                                        type="text"
                                        value={dataSource.data_source_metadata.keystore_name}
                                        onChange={(e) => setDataSource({
                                            ...dataSource,
                                            data_source_metadata: {
                                                ...dataSource.data_source_metadata,
                                                keystore_name: e.target.value
                                            }
                                        })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">API URL</label>
                                    <input
                                        type="url"
                                        value={dataSource.data_source_metadata.api_url}
                                        onChange={(e) => setDataSource({
                                            ...dataSource,
                                            data_source_metadata: {
                                                ...dataSource.data_source_metadata,
                                                api_url: e.target.value
                                            }
                                        })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Status</label>
                                    <p className="text-sm text-gray-500">Enable or disable this data source</p>
                                </div>
                                <Button
                                    variant={dataSource.data_source_is_active ? "default" : "secondary"}
                                    onClick={handleToggleActive}
                                >
                                    {dataSource.data_source_is_active ? "Active" : "Inactive"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" asChild>
                            <Link href={`/config/projects/${projectId}/sites/${siteId}/data-sources/mindlamp/${instanceName}`}>
                                Cancel
                            </Link>
                        </Button>
                        <Button onClick={handleSave} disabled={saving}>
                            {saving ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
} 