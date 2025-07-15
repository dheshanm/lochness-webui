"use client"
import * as React from 'react';
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
} from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

interface Job {
    job_id: number;
    job_type: string;
    project_id: string;
    site_id: string;
    data_source_name?: string;
    data_sink_name?: string;
    requested_by?: string;
    status: string;
    created_at?: string;
    started_at?: string;
    finished_at?: string;
    result?: string;
}

interface JobsListProps {
    project_id: string;
    site_id: string;
    data_source_name?: string;
}

export default function JobsList({ project_id, site_id, data_source_name }: JobsListProps) {
    const [jobs, setJobs] = React.useState<Job[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [sorting, setSorting] = React.useState<SortingState>([]);

    React.useEffect(() => {
        const fetchJobs = async () => {
            setLoading(true);
            let url = `/api/v1/jobs?project_id=${project_id}&site_id=${site_id}`;
            if (data_source_name) {
                url += `&data_source_name=${encodeURIComponent(data_source_name)}`;
            }
            const response = await fetch(url);
            if (!response.ok) {
                setJobs([]);
                setLoading(false);
                return;
            }
            const data = await response.json();
            setJobs(data.jobs || []);
            setLoading(false);
        };
        fetchJobs();
    }, [project_id, site_id, data_source_name]);

    // react-table columns
    const columns: ColumnDef<Job>[] = [
        {
            accessorKey: "job_id",
            header: ({ column }) => (
                <button className="flex items-center gap-1 font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Job ID<ArrowUpDown className="h-3 w-3" /></button>
            ),
            cell: info => <span className="font-mono">{info.getValue() as string}</span>,
        },
        {
            accessorKey: "job_type",
            header: ({ column }) => (
                <button className="flex items-center gap-1 font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Type<ArrowUpDown className="h-3 w-3" /></button>
            ),
        },
        {
            accessorKey: "data_source_name",
            header: ({ column }) => (
                <button className="flex items-center gap-1 font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Data Source<ArrowUpDown className="h-3 w-3" /></button>
            ),
        },
        {
            accessorKey: "data_sink_name",
            header: ({ column }) => (
                <button className="flex items-center gap-1 font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Data Sink<ArrowUpDown className="h-3 w-3" /></button>
            ),
        },
        {
            accessorKey: "requested_by",
            header: ({ column }) => (
                <button className="flex items-center gap-1 font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Requested By<ArrowUpDown className="h-3 w-3" /></button>
            ),
        },
        {
            accessorKey: "status",
            header: ({ column }) => (
                <button className="flex items-center gap-1 font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Status<ArrowUpDown className="h-3 w-3" /></button>
            ),
            cell: info => <Badge variant={info.getValue() === 'success' ? 'default' : info.getValue() === 'error' ? 'destructive' : 'secondary'}>{info.getValue() as string}</Badge>,
        },
        {
            accessorKey: "created_at",
            header: ({ column }) => (
                <button className="flex items-center gap-1 font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Created<ArrowUpDown className="h-3 w-3" /></button>
            ),
            cell: info => <span className="font-mono">{info.getValue() ? new Date(info.getValue() as string).toLocaleString() : '-'}</span>,
        },
        {
            accessorKey: "started_at",
            header: ({ column }) => (
                <button className="flex items-center gap-1 font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Started<ArrowUpDown className="h-3 w-3" /></button>
            ),
            cell: info => <span className="font-mono">{info.getValue() ? new Date(info.getValue() as string).toLocaleString() : '-'}</span>,
        },
        {
            accessorKey: "finished_at",
            header: ({ column }) => (
                <button className="flex items-center gap-1 font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Finished<ArrowUpDown className="h-3 w-3" /></button>
            ),
            cell: info => <span className="font-mono">{info.getValue() ? new Date(info.getValue() as string).toLocaleString() : '-'}</span>,
        },
        {
            accessorKey: "result",
            header: ({ column }) => (
                <button className="flex items-center gap-1 font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Result<ArrowUpDown className="h-3 w-3" /></button>
            ),
            cell: info => <span className="break-all whitespace-pre-wrap">{info.getValue() as string || '-'}</span>,
        },
    ];

    const table = useReactTable({
        data: jobs,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        state: { sorting },
        onSortingChange: setSorting,
    });

    const PAGE_SIZE = 20;
    const [page, setPage] = React.useState(0);
    const pageCount = Math.ceil(table.getRowModel().rows.length / PAGE_SIZE);
    const pagedRows = table.getRowModel().rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    if (loading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                    ))}
                </div>
            </div>
        );
    }

    if (jobs.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                        No jobs found
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center">
                        {data_source_name 
                            ? `Jobs will appear here when data pulls, pushes, or other tasks are triggered for this data source.`
                            : `Jobs will appear here when data pulls, pushes, or other tasks are triggered for this site.`
                        }
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                    {data_source_name ? 'Data Source Jobs' : 'Site Jobs'}
                </h3>
                <Badge variant="secondary">{jobs.length} jobs</Badge>
            </div>
            <div className="rounded-md border overflow-x-auto">
                <table className="w-full text-xs">
                    <thead>
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id} className="border-b bg-muted/50">
                                {headerGroup.headers.map(header => (
                                    <th key={header.id} className="p-2 text-left">
                                        {<>{flexRender(header.column.columnDef.header, header.getContext())}</>}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {pagedRows.map(row => (
                            <tr key={row.id} className="border-b hover:bg-muted/50">
                                {row.getVisibleCells().map(cell => (
                                    <td key={cell.id} className="p-2 align-top">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-between items-center mt-2">
                <button
                    className="px-3 py-1 rounded border bg-muted text-xs disabled:opacity-50"
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                >
                    Previous
                </button>
                <span className="text-xs">
                    Page {page + 1} of {pageCount}
                </span>
                <button
                    className="px-3 py-1 rounded border bg-muted text-xs disabled:opacity-50"
                    onClick={() => setPage(p => Math.min(pageCount - 1, p + 1))}
                    disabled={page >= pageCount - 1}
                >
                    Next
                </button>
            </div>
        </div>
    );
} 