"use client"
import * as React from 'react';
import Link from 'next/link';
import { toast } from "sonner";
import { Eye, Pencil, Trash, Plus, Key } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export interface KeystoreEntry {
    keystore_name: string;
    key_type: string;
    project_id: string;
    key_metadata?: {
        description?: string;
        created_by?: string;
        created_at?: string;
    };
}

interface KeystoreListProps {
    project_id: string;
}

export default function KeystoreList({ project_id }: KeystoreListProps) {
    const [entries, setEntries] = React.useState<KeystoreEntry[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchKeystoreEntries = async () => {
            try {
                const response = await fetch(`/api/v1/keystore?project_id=${project_id}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch keystore entries');
                }
                const data = await response.json();
                setEntries(data.entries || []);
            } catch (error) {
                console.error(error);
                toast.error('Failed to fetch keystore entries');
            } finally {
                setLoading(false);
            }
        };

        fetchKeystoreEntries();
    }, [project_id]);

    const handleDelete = async (keystoreName: string) => {
        if (!confirm(`Are you sure you want to delete the keystore entry "${keystoreName}"?`)) {
            return;
        }

        try {
            const response = await fetch(`/api/v1/keystore/${keystoreName}?project_id=${project_id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                toast.error("Error deleting keystore entry", { 
                    description: errorData.error || response.statusText 
                });
                return;
            }

            toast.success("Keystore entry deleted successfully");
            // Refresh the list
            setEntries(entries.filter(entry => entry.keystore_name !== keystoreName));
        } catch (error) {
            console.error("Error deleting keystore entry", error);
            toast.error("Error deleting keystore entry");
        }
    };

    const getKeyTypeLabel = (keyType: string) => {
        const typeMap: Record<string, string> = {
            'redcap': 'REDCap API Token',
            'xnat': 'XNAT API Token',
            'mindlamp': 'MindLAMP API Key',
            'minio': 'MinIO Credentials',
            'sharepoint': 'SharePoint Credentials',
            'cantab': 'CANTAB Credentials',
            'generic': 'Generic Secret',
        };
        return typeMap[keyType] || keyType;
    };

    const getKeyTypeColor = (keyType: string) => {
        const colorMap: Record<string, string> = {
            'redcap': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
            'xnat': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
            'mindlamp': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
            'minio': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
            'sharepoint': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
            'cantab': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
            'generic': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
        };
        return colorMap[keyType] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    };

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-32 w-full" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {entries.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-8">
                        <Key className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                            No keystore entries
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center">
                            Get started by adding your first keystore entry to securely store API keys and tokens.
                        </p>
                        <Button asChild>
                            <Link href={`/config/projects/${project_id}/keystore/new`}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add First Entry
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className="flex justify-end mb-4">
                        <Button asChild>
                            <Link href={`/config/projects/${project_id}/keystore/new`}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Key Store
                            </Link>
                        </Button>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {entries.map((entry) => (
                            <Card key={entry.keystore_name} className="hover:shadow-md transition-shadow">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="text-base font-medium truncate">
                                                {entry.keystore_name}
                                            </CardTitle>
                                            <Badge className={`mt-2 ${getKeyTypeColor(entry.key_type)}`}>
                                                {getKeyTypeLabel(entry.key_type)}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    {entry.key_metadata?.description && (
                                        <CardDescription className="text-sm mb-4">
                                            {entry.key_metadata.description}
                                        </CardDescription>
                                    )}
                                    <div className="flex items-center justify-between">
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {entry.key_metadata?.created_by && (
                                                <span>Created by {entry.key_metadata.created_by}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                asChild
                                            >
                                                <Link href={`/config/projects/${project_id}/keystore/${entry.keystore_name}/edit`}>
                                                    <Pencil className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(entry.keystore_name)}
                                                className="text-destructive hover:text-destructive"
                                            >
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
} 