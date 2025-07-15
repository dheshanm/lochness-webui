"use client"
import * as React from 'react';
import { toast } from "sonner";
import { formatDistance } from 'date-fns'
import Link from 'next/link'
import { useRouter } from 'next/navigation';

import { Pencil, Activity, Trash, Download } from "lucide-react"

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
import SubjectsList from '@/components/lists/subjects';
import DataPushesList from '@/components/lists/data-pushes';
import JobsList from '@/components/lists/jobs';
import { Heading } from '@/components/heading';
import LogsTable from '@/components/lists/logs-table';
import DataSyncsTable from '@/components/lists/data-syncs-table';
import DataSinksList from '@/components/lists/data-sinks';


import { SortingState } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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

    // --- Logs Table State ---
    const [logs, setLogs] = React.useState<any[]>([]);
    const [logsLoading, setLogsLoading] = React.useState(true);
    const [logFilter, setLogFilter] = React.useState("");
    const [logSorting, setLogSorting] = React.useState<SortingState>([]);
    const [logsPage, setLogsPage] = React.useState(0);

    // --- Data Syncs Table State ---
    const [dataSyncRows, setDataSyncRows] = React.useState<any[]>([]);
    const [dataSyncsLoading, setDataSyncsLoading] = React.useState(true);
    const [dataSyncFilter, setDataSyncFilter] = React.useState("");
    const [dataSyncSorting, setDataSyncSorting] = React.useState<SortingState>([]);
    const [dataSyncPage, setDataSyncPage] = React.useState(0);

    function parseLogRow(row: any) {
      const match = row.extended_log_format?.match(/^([\d-]+ [\d:]+) \[(\w+)\] (.*)$/);
      if (!match) return { timestamp: '', level: '', message: row.extended_log_format };
      const [, timestamp, level, jsonStr] = match;
      let json: any = {};
      try { json = JSON.parse(jsonStr); } catch { json = { message: jsonStr }; }
      return { timestamp, level, ...json };
    }
    const parsedLogs = logs.map(parseLogRow);

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

    React.useEffect(() => {
        async function fetchLogs() {
            if (!projectId || !siteId) return;
            setLogsLoading(true);
            try {
                const res = await fetch(`/api/v1/logs?project_id=${projectId}&site_id=${siteId}&limit=1000`);
                const data = await res.json();
                console.log('Fetched logs:', data); // Debugging line
                setLogs(data.logs || data.rows || []);
            } catch {
                setLogs([]);
            } finally {
                setLogsLoading(false);
            }
        }
        fetchLogs();
    }, [projectId, siteId]);

    React.useEffect(() => {
        async function fetchDataPushes() {
            if (!projectId || !siteId) return;
            setDataSyncsLoading(true);
            try {
                const response = await fetch(`/api/v1/projects/${projectId}/sites/${siteId}/data-pushes`);
                const data = await response.json();
                // Map DataPush[] to DataSyncRow[]
                const rows = (data.data_pushes || []).map((push: any) => ({
                    subject_id: push.subject_id || '',
                    data_source_name: push.data_source_name || '',
                    data_source_type: push.data_sink_metadata?.type || '',
                    metadata_count: 0, // Not available in DataPush, set to 0 or fetch if needed
                    pull_status: 'Success', // Not available, set to 'Success' for now
                    last_pull: '', // Not available
                    pull_file_count: 0, // Not available
                    files_count: 1, // Each push is one file
                    last_file: push.file_path.split('/').pop() || push.file_path,
                    push_status: 'Success', // Always success for a push
                    last_push: push.push_timestamp,
                    push_file_count: 1,
                }));
                setDataSyncRows(rows);
            } catch (error) {
                setDataSyncRows([]);
            } finally {
                setDataSyncsLoading(false);
            }
        }
        fetchDataPushes();
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
                            {/* Pull All Data Button */}
                            {(projectId && siteId) && (
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="flex items-center gap-2"
                                    onClick={async () => {
                                        try {
                                            // First, check if we can access the jobs endpoint (authentication test)
                                            const authTestResponse = await fetch('/api/v1/jobs?limit=1', {
                                                credentials: 'include'
                                            });
                                            if (!authTestResponse.ok) {
                                                if (authTestResponse.status === 401) {
                                                    toast.error('Please log in to create jobs');
                                                    return;
                                                }
                                                toast.error('Authentication error. Please try logging in again.');
                                                return;
                                            }
                                            
                                            // First, get all data sources for this site
                                            const sourcesResponse = await fetch(`/api/v1/projects/${projectId}/sites/${siteId}/sources`, {
                                                credentials: 'include'
                                            });
                                            if (!sourcesResponse.ok) {
                                                const errorText = await sourcesResponse.text();
                                                console.error('Failed to fetch data sources:', errorText);
                                                toast.error('Failed to fetch data sources');
                                                return;
                                            }
                                            const dataSources = await sourcesResponse.json();
                                            console.log('Data sources fetched:', dataSources);
                                            
                                            if (!Array.isArray(dataSources) || dataSources.length === 0) {
                                                toast.error('No data sources found for this site');
                                                return;
                                            }
                                            
                                            // Create jobs for each data source
                                            let successCount = 0;
                                            let errorCount = 0;
                                            
                                            for (const dataSource of dataSources) {
                                                try {
                                                    console.log('Creating job for data source:', dataSource);
                                                    const jobResponse = await fetch('/api/v1/jobs', {
                                                        method: 'POST',
                                                        headers: {
                                                            'Content-Type': 'application/json',
                                                        },
                                                        credentials: 'include',
                                                        body: JSON.stringify({
                                                            job_type: 'data_pull',
                                                            project_id: projectId,
                                                            site_id: siteId,
                                                            data_source_name: dataSource.data_source_name,
                                                            job_metadata: {
                                                                data_source_type: dataSource.data_source_type
                                                            }
                                                        })
                                                    });
                                                    
                                                    if (jobResponse.ok) {
                                                        const jobResult = await jobResponse.json();
                                                        console.log('Job created successfully:', jobResult);
                                                        successCount++;
                                                    } else {
                                                        const errorData = await jobResponse.json();
                                                        console.error('Failed to create job:', errorData);
                                                        errorCount++;
                                                    }
                                                } catch (error) {
                                                    console.error('Error creating job for data source:', dataSource, error);
                                                    errorCount++;
                                                }
                                            }
                                            
                                            if (errorCount === 0) {
                                                toast.success(`Created ${successCount} data pull jobs successfully`);
                                            } else {
                                                toast.success(`Created ${successCount} jobs, ${errorCount} failed`);
                                            }
                                        } catch (error) {
                                            console.error('Error creating jobs:', error);
                                            toast.error('Failed to create data pull jobs');
                                        }
                                    }}
                                >
                                    <Download className="h-4 w-4" />
                                    <span>Pull All Data</span>
                                </Button>
                            )}
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
                    <TabsList className="grid w-full grid-cols-6">
                        <TabsTrigger value="sources">Data Sources</TabsTrigger>
                        <TabsTrigger value="sinks">Data Sinks</TabsTrigger>
                        <TabsTrigger value="syncs">Data Syncs</TabsTrigger>
                        <TabsTrigger value="subjects">Subjects</TabsTrigger>
                        <TabsTrigger value="jobs">Jobs</TabsTrigger>
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
                            {projectId && siteId && (
                                <DataSinksList project_id={projectId} site_id={siteId} />
                            )}
                        </div>
                    </TabsContent>
                    <TabsContent value="syncs" className="mt-4">
                        <div className="p-4 border rounded-md bg-card text-card-foreground">
                            {projectId && siteId && (
                                <DataSyncsTable
                                    rows={dataSyncRows}
                                    loading={dataSyncsLoading}
                                    filter={dataSyncFilter}
                                    setFilter={setDataSyncFilter}
                                    sorting={dataSyncSorting}
                                    setSorting={setDataSyncSorting}
                                    page={dataSyncPage}
                                    setPage={setDataSyncPage}
                                    pageSize={20}
                                />
                            )}
                        </div>
                    </TabsContent>
                    <TabsContent value="subjects" className="mt-4">
                        <div className="p-4 border rounded-md bg-card text-card-foreground">
                            {projectId && siteId && (
                                <SubjectsList project_id={projectId} site_id={siteId} />
                            )}
                        </div>
                    </TabsContent>
                    <TabsContent value="jobs" className="mt-4">
                        <div className="p-4 border rounded-md bg-card text-card-foreground">
                            {projectId && siteId && (
                                <JobsList project_id={projectId} site_id={siteId} />
                            )}
                        </div>
                    </TabsContent>
                    <TabsContent value="logs" className="mt-4">
                        <LogsTable
                            logs={parsedLogs}
                            loading={logsLoading}
                            filter={logFilter}
                            setFilter={setLogFilter}
                            sorting={logSorting}
                            setSorting={setLogSorting}
                            page={logsPage}
                            setPage={setLogsPage}
                            pageSize={20}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </>
    )
}

