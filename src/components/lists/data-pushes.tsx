"use client"
import * as React from 'react';
import { toast } from "sonner";
import { formatDistance } from 'date-fns';
import { FileText, Clock, Database, Hash, CheckCircle, User, Database as DataSourceIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import { DataPush } from '@/types/data-pushes';

interface DataPushesListProps {
    project_id: string;
    site_id: string;
}

export default function DataPushesList({ project_id, site_id }: DataPushesListProps) {
    const [dataPushes, setDataPushes] = React.useState<DataPush[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchDataPushes = async () => {
            try {
                const response = await fetch(`/api/v1/projects/${project_id}/sites/${site_id}/data-pushes`);
                if (!response.ok) {
                    throw new Error('Failed to fetch data pushes');
                }
                const data = await response.json();
                setDataPushes(data.data_pushes || []);
            } catch (error) {
                console.error(error);
                toast.error('Failed to fetch data pushes');
            } finally {
                setLoading(false);
            }
        };

        fetchDataPushes();
    }, [project_id, site_id]);

    const getDataSinkType = (metadata: any) => {
        if (metadata?.bucket) return 'MinIO';
        if (metadata?.endpoint) return 'Object Store';
        return 'Generic';
    };

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-8 w-48" />
                </div>
                <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                    ))}
                </div>
            </div>
        );
    }

    if (dataPushes.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                    <Database className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                        No data syncs
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center">
                        Data syncs will appear here when files are pushed to data sinks.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold">Data Syncs</h3>
                    <p className="text-sm text-gray-500">Recent file uploads to data sinks</p>
                </div>
                <Badge variant="secondary">{dataPushes.length} syncs</Badge>
            </div>

            <div className="rounded-md border">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b bg-muted/50">
                                <th className="text-left p-4 font-medium">File</th>
                                <th className="text-left p-4 font-medium">Subject</th>
                                <th className="text-left p-4 font-medium">Data Source</th>
                                <th className="text-left p-4 font-medium">Data Sink</th>
                                <th className="text-left p-4 font-medium">Status</th>
                                <th className="text-left p-4 font-medium">Duration</th>
                                <th className="text-left p-4 font-medium">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dataPushes.map((push) => (
                                <tr key={push.data_push_id} className="border-b hover:bg-muted/50">
                                    <td className="p-4">
                                        <div className="flex items-center space-x-2">
                                            <FileText className="h-4 w-4 text-gray-500" />
                                            <div>
                                                <div className="font-medium">
                                                    {push.file_path.split('/').pop() || push.file_path}
                                                </div>
                                                <div className="text-xs text-gray-500 truncate max-w-xs">
                                                    {push.file_path}
                                                </div>
                                                <div className="text-xs text-gray-400 flex items-center">
                                                    <Hash className="h-3 w-3 mr-1" />
                                                    {push.file_md5.substring(0, 8)}...
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {push.subject_id ? (
                                            <div className="flex items-center space-x-2">
                                                <User className="h-4 w-4 text-gray-500" />
                                                <span className="font-medium">{push.subject_id}</span>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 text-sm">Unknown</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        {push.data_source_name ? (
                                            <div className="flex items-center space-x-2">
                                                <DataSourceIcon className="h-4 w-4 text-gray-500" />
                                                <span className="font-medium">{push.data_source_name}</span>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 text-sm">Unknown</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <div>
                                            <div className="font-medium">
                                                {push.data_sink_name || `Sink ${push.data_sink_id}`}
                                            </div>
                                            <Badge variant="outline" className="text-xs mt-1">
                                                {getDataSinkType(push.data_sink_metadata)}
                                            </Badge>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                            <CheckCircle className="h-3 w-3 mr-1" />
                                            Success
                                        </Badge>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center space-x-1">
                                            <Clock className="h-3 w-3 text-gray-500" />
                                            <span className="text-sm">{push.push_time_s}s</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-sm">
                                            {new Date(push.push_timestamp).toLocaleDateString()}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {formatDistance(new Date(push.push_timestamp), new Date(), { addSuffix: true })}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
} 