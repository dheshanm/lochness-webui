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
import LogsViewer from '@/components/logs-viewer';

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
} from "@tanstack/react-table";
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

    // --- Data Sync Table State ---
    const [syncSubjects, setSyncSubjects] = React.useState<any[]>([]);
    const [syncDataSources, setSyncDataSources] = React.useState<any[]>([]);
    const [syncDataPushes, setSyncDataPushes] = React.useState<any[]>([]);
    const [syncDataPulls, setSyncDataPulls] = React.useState<any[]>([]);
    const [syncFiles, setSyncFiles] = React.useState<any[]>([]);
    const [syncLoading, setSyncLoading] = React.useState(true);
    const [syncFilter, setSyncFilter] = React.useState("");
    const [syncSorting, setSyncSorting] = React.useState<SortingState>([]);

    // --- Logs Table State ---
    const [logs, setLogs] = React.useState<any[]>([]);
    const [logsLoading, setLogsLoading] = React.useState(true);
    const [logFilter, setLogFilter] = React.useState("");
    const [logSorting, setLogSorting] = React.useState<SortingState>([]);

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

    // --- Data Sync Table Fetch ---
    React.useEffect(() => {
      async function fetchSyncData() {
        if (!projectId || !siteId) return;
        setSyncLoading(true);
        try {
          const [subjectsRes, dataSourcesRes, pushesRes, pullsRes, filesRes] = await Promise.all([
            fetch(`/api/v1/projects/${projectId}/sites/${siteId}/subjects`),
            fetch(`/api/v1/projects/${projectId}/sites/${siteId}/sources`),
            fetch(`/api/v1/projects/${projectId}/sites/${siteId}/data-pushes`),
            fetch(`/api/v1/projects/${projectId}/sites/${siteId}/data-pulls`),
            fetch(`/api/v1/projects/${projectId}/sites/${siteId}/files`),
          ]);
          setSyncSubjects(await subjectsRes.json());
          setSyncDataSources(await dataSourcesRes.json());
          setSyncDataPushes((await pushesRes.json()).data_pushes || []);
          setSyncDataPulls((await pullsRes.json()).data_pulls || []);
          setSyncFiles((await filesRes.json()).files || []);
        } catch {
          setSyncSubjects([]);
          setSyncDataSources([]);
          setSyncDataPushes([]);
          setSyncDataPulls([]);
          setSyncFiles([]);
        } finally {
          setSyncLoading(false);
        }
      }
      fetchSyncData();
    }, [projectId, siteId]);

    // --- Logs Table Fetch ---
    React.useEffect(() => {
      async function fetchLogs() {
        if (!projectId || !siteId) return;
        setLogsLoading(true);
        try {
          const res = await fetch(`/api/v1/logs?project_id=${projectId}&site_id=${siteId}&limit=1000`);
          const data = await res.json();
          setLogs(data.rows || []);
        } catch {
          setLogs([]);
        } finally {
          setLogsLoading(false);
        }
      }
      fetchLogs();
    }, [projectId, siteId]);

    // --- Data Sync Table Logic ---
    const syncRows = React.useMemo(() => {
      // One row per subject x data source
      const rows: any[] = [];
      for (const subject of syncSubjects) {
        for (const ds of syncDataSources) {
          // Pulls, Pushes, Files for this subject+ds
          const pulls = syncDataPulls.filter(
            (pull) => pull.subject_id === subject.subject_id && pull.data_source_name === ds.data_source_name
          );
          const lastPull = pulls.length > 0 ? pulls.reduce((latest, curr) => new Date(curr.pull_timestamp) > new Date(latest.pull_timestamp) ? curr : latest) : null;
          const pushes = syncDataPushes.filter(
            (push) => push.subject_id === subject.subject_id && push.data_source_name === ds.data_source_name
          );
          const lastPush = pushes.length > 0 ? pushes.reduce((latest, curr) => new Date(curr.push_timestamp) > new Date(latest.push_timestamp) ? curr : latest) : null;
          const files = syncFiles.filter(
            (file) => file.subject_id === subject.subject_id && file.data_source_name === ds.data_source_name
          );
          const lastFile = files.length > 0 ? files.reduce((latest, curr) => new Date(curr.m_time) > new Date(latest.m_time) ? curr : latest) : null;
          rows.push({
            subject_id: subject.subject_id,
            data_source_name: ds.data_source_name,
            data_source_type: ds.data_source_type,
            metadata_count: Object.keys(subject.subject_metadata || {}).length,
            pull_status: pulls.length > 0 ? 'Success' : 'None',
            last_pull: lastPull ? new Date(lastPull.pull_timestamp).toLocaleString() : '-',
            pull_file_count: pulls.length,
            files_count: files.length,
            last_file: lastFile ? new Date(lastFile.m_time).toLocaleString() : '-',
            push_status: pushes.length > 0 ? 'Success' : 'None',
            last_push: lastPush ? new Date(lastPush.push_timestamp).toLocaleString() : '-',
            push_file_count: pushes.length,
          });
        }
      }
      return rows;
    }, [syncSubjects, syncDataSources, syncDataPulls, syncDataPushes, syncFiles]);

    const syncColumns: ColumnDef<any>[] = [
      {
        accessorKey: 'subject_id',
        header: ({ column }) => (
          <button className="flex items-center gap-1 font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Subject ID<ArrowUpDown className="h-3 w-3" /></button>
        ),
        cell: info => <span className="font-mono">{info.getValue() as string}</span>,
      },
      {
        accessorKey: 'data_source_name',
        header: ({ column }) => (
          <button className="flex items-center gap-1 font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Data Source<ArrowUpDown className="h-3 w-3" /></button>
        ),
      },
      {
        accessorKey: 'data_source_type',
        header: ({ column }) => (
          <button className="flex items-center gap-1 font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Type<ArrowUpDown className="h-3 w-3" /></button>
        ),
      },
      {
        accessorKey: 'metadata_count',
        header: ({ column }) => (
          <button className="flex items-center gap-1 font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Metadata Count<ArrowUpDown className="h-3 w-3" /></button>
        ),
        cell: info => <Badge variant={info.getValue() > 0 ? 'default' : 'secondary'}>{info.getValue()}</Badge>,
      },
      {
        accessorKey: 'pull_status',
        header: ({ column }) => (
          <button className="flex items-center gap-1 font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Pull Status<ArrowUpDown className="h-3 w-3" /></button>
        ),
        cell: info => info.getValue() === 'Success' ? <Badge variant="default" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">Success</Badge> : <Badge variant="secondary">None</Badge>,
      },
      { accessorKey: 'last_pull', header: 'Last Pull' },
      { accessorKey: 'pull_file_count', header: 'Pull File Count' },
      { accessorKey: 'files_count', header: 'Files' },
      { accessorKey: 'last_file', header: 'Last File' },
      {
        accessorKey: 'push_status',
        header: ({ column }) => (
          <button className="flex items-center gap-1 font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Push Status<ArrowUpDown className="h-3 w-3" /></button>
        ),
        cell: info => info.getValue() === 'Success' ? <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Success</Badge> : <Badge variant="secondary">None</Badge>,
      },
      { accessorKey: 'last_push', header: 'Last Push' },
      { accessorKey: 'push_file_count', header: 'Push File Count' },
    ];

    const syncTable = useReactTable({
      data: syncRows.filter(row =>
        syncFilter === '' ||
        Object.values(row).some(val => (val || '').toString().toLowerCase().includes(syncFilter.toLowerCase()))
      ),
      columns: syncColumns,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      state: { sorting: syncSorting },
      onSortingChange: setSyncSorting,
    });

    // --- Logs Table Logic ---
    function parseLogRow(row: any) {
      const match = row.extended_log_format?.match(/^([\d-]+ [\d:]+) \[(\w+)\] (.*)$/);
      if (!match) return { timestamp: '', level: '', message: row.extended_log_format };
      const [, timestamp, level, jsonStr] = match;
      let json: any = {};
      try { json = JSON.parse(jsonStr); } catch { json = { message: jsonStr }; }
      return { timestamp, level, ...json };
    }
    const parsedLogs = logs.map(parseLogRow);
    const logColumns: ColumnDef<any>[] = [
      {
        accessorKey: "timestamp",
        header: ({ column }) => (
          <button className="flex items-center gap-1 font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Timestamp<ArrowUpDown className="h-3 w-3" /></button>
        ),
        cell: info => <span className="font-mono text-xs">{info.getValue() as string}</span>,
      },
      {
        accessorKey: "level",
        header: ({ column }) => (
          <button className="flex items-center gap-1 font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Level<ArrowUpDown className="h-3 w-3" /></button>
        ),
        cell: info => <Badge variant={info.getValue() === "INFO" ? "secondary" : "default"}>{info.getValue() as string}</Badge>,
      },
      {
        accessorKey: "event",
        header: ({ column }) => (
          <button className="flex items-center gap-1 font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Event<ArrowUpDown className="h-3 w-3" /></button>
        ),
      },
      {
        accessorKey: "message",
        header: ({ column }) => (
          <button className="flex items-center gap-1 font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Message<ArrowUpDown className="h-3 w-3" /></button>
        ),
        cell: info => <span className="break-words whitespace-pre-wrap text-xs">{info.getValue() as string}</span>,
      },
      {
        accessorKey: "data_source_name",
        header: ({ column }) => (
          <button className="flex items-center gap-1 font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Data Source<ArrowUpDown className="h-3 w-3" /></button>
        ),
      },
    ];
    const logTable = useReactTable({
      data: parsedLogs.filter(row =>
        logFilter === '' ||
        Object.values(row).some(val => (val || '').toString().toLowerCase().includes(logFilter.toLowerCase()))
      ),
      columns: logColumns,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      state: { sorting: logSorting },
      onSortingChange: setLogSorting,
    });


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
                    <TabsContent value="syncs" className="mt-4">
                        <div className="p-4 border rounded-md bg-card text-card-foreground">
                            <div className="mb-2 font-semibold">Data Sync Table</div>
                            <div className="mb-2 flex items-center gap-2">
                              <Input
                                placeholder="Filter..."
                                value={syncFilter}
                                onChange={e => setSyncFilter(e.target.value)}
                                className="w-64"
                              />
                              <Badge variant="secondary">{syncTable.getRowModel().rows.length} rows</Badge>
                            </div>
                            <div className="rounded-md border overflow-x-auto bg-card">
                              <table className="min-w-full text-xs">
                                <thead>
                                  {syncTable.getHeaderGroups().map(headerGroup => (
                                    <tr key={headerGroup.id}>
                                      {headerGroup.headers.map(header => (
                                        <th key={header.id} className="px-2 py-2 text-left font-semibold bg-muted">
                                          {<>{flexRender(header.column.columnDef.header, header.getContext())}</>}
                                        </th>
                                      ))}
                                    </tr>
                                  ))}
                                </thead>
                                <tbody>
                                  {syncLoading ? (
                                    <tr><td colSpan={syncColumns.length} className="text-center py-8">Loading...</td></tr>
                                  ) : syncTable.getRowModel().rows.length === 0 ? (
                                    <tr><td colSpan={syncColumns.length} className="text-center py-8">No data found.</td></tr>
                                  ) : (
                                    syncTable.getRowModel().rows.map(row => (
                                      <tr key={row.id} className="border-b hover:bg-muted/50">
                                        {row.getVisibleCells().map(cell => (
                                          <td key={cell.id} className="px-2 py-1 align-top">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                          </td>
                                        ))}
                                      </tr>
                                    ))
                                  )}
                                </tbody>
                              </table>
                            </div>
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
                        <div className="p-4 border rounded-md bg-card text-card-foreground">
                          <div className="mb-2 font-semibold">Logs</div>
                          <div className="mb-2 flex items-center gap-2">
                            <Input
                              placeholder="Filter logs..."
                              value={logFilter}
                              onChange={e => setLogFilter(e.target.value)}
                              className="w-64"
                            />
                            <Badge variant="secondary">{logTable.getRowModel().rows.length} log entries</Badge>
                          </div>
                          <div className="rounded-md border overflow-x-auto bg-card">
                            <table className="min-w-full text-xs">
                              <thead>
                                {logTable.getHeaderGroups().map(headerGroup => (
                                  <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                      <th key={header.id} className="px-2 py-2 text-left font-semibold bg-muted">
                                        {<>{flexRender(header.column.columnDef.header, header.getContext())}</>}
                                      </th>
                                    ))}
                                  </tr>
                                ))}
                              </thead>
                              <tbody>
                                {logsLoading ? (
                                  <tr><td colSpan={logColumns.length} className="text-center py-8">Loading logs...</td></tr>
                                ) : logTable.getRowModel().rows.length === 0 ? (
                                  <tr><td colSpan={logColumns.length} className="text-center py-8">No logs found.</td></tr>
                                ) : (
                                  logTable.getRowModel().rows.map(row => (
                                    <tr key={row.id} className="border-b hover:bg-muted/50">
                                      {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} className="px-2 py-1 align-top">
                                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                      ))}
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </>
    )
}

