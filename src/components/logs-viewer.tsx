"use client"
import * as React from 'react';
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
    SortingState,
    ColumnFiltersState,
} from "@tanstack/react-table";

interface LogsViewerProps {
    projectId?: string;
    siteId?: string;
}

interface LogRow {
    timestamp: string;
    level: string;
    event?: string;
    message?: string;
    site_id?: string;
    project_id?: string;
    data_source_name?: string;
    [key: string]: any;
}

export default function LogsViewer({ projectId, siteId }: LogsViewerProps) {
    const [logs, setLogs] = React.useState<LogRow[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [search, setSearch] = React.useState('');
    const [page, setPage] = React.useState(0);
    const pageSize = 20;

    const fetchLogs = async () => {
        setLoading(true);
        const params = new URLSearchParams();
        params.set('limit', '1000');
        params.set('offset', '0');
        if (projectId) params.set('project_id', projectId);
        if (siteId) params.set('site_id', siteId);
        const response = await fetch(`/api/v1/logs?${params.toString()}`);
        if (!response.ok) {
            toast.error('Failed to fetch logs');
            setLoading(false);
            return;
        }
        const data = await response.json();
        // Parse each log line into timestamp, level, and JSON fields
        const parsed: LogRow[] = data.rows.map((row: any) => {
            // Example: 2025-07-12 11:53:04 [INFO] {"event": ...}
            const match = row.extended_log_format.match(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) \[(\w+)\] (.*)$/);
            if (!match) return { timestamp: '', level: '', message: row.extended_log_format };
            const [, timestamp, level, jsonStr] = match;
            let json: any = {};
            try {
                json = JSON.parse(jsonStr);
            } catch {
                json = { message: jsonStr };
            }
            return { timestamp, level, ...json };
        });
        setLogs(parsed);
        setLoading(false);
    };

    React.useEffect(() => {
        fetchLogs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectId, siteId]);

    const columns: ColumnDef<LogRow>[] = [
        {
            accessorKey: 'timestamp',
            header: 'Timestamp',
            cell: info => <span className="font-mono text-xs">{info.getValue() as string}</span>,
        },
        {
            accessorKey: 'level',
            header: 'Level',
            cell: info => <Badge variant={info.getValue() === 'INFO' ? 'secondary' : 'default'}>{info.getValue() as string}</Badge>,
        },
        {
            accessorKey: 'event',
            header: 'Event',
        },
        {
            accessorKey: 'message',
            header: 'Message',
            cell: info => <span className="break-words whitespace-pre-wrap text-xs">{info.getValue() as string}</span>,
        },
        {
            accessorKey: 'site_id',
            header: 'Site',
        },
        {
            accessorKey: 'project_id',
            header: 'Project',
        },
        {
            accessorKey: 'data_source_name',
            header: 'Data Source',
        },
    ];

    const table = useReactTable({
        data: logs,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        state: {
            sorting,
            columnFilters,
        },
    });

    // Filtered and paginated rows
    const filteredRows = table.getRowModel().rows.filter(row =>
        search === '' ||
        Object.values(row.original).some(val => (val || '').toString().toLowerCase().includes(search.toLowerCase()))
    );
    const pageCount = Math.ceil(filteredRows.length / pageSize);
    const pagedRows = filteredRows.slice(page * pageSize, (page + 1) * pageSize);

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <Input
                    placeholder="Search logs..."
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(0); }}
                    className="w-64"
                />
                <Button onClick={fetchLogs} disabled={loading} size="sm" variant="outline">Refresh</Button>
            </div>
            <div className="overflow-x-auto border rounded-md bg-card">
                <table className="min-w-full text-xs">
                    <thead>
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th key={header.id} className="px-2 py-2 text-left font-semibold bg-muted">
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={columns.length} className="text-center py-8">Loading logs...</td></tr>
                        ) : filteredRows.length === 0 ? (
                            <tr><td colSpan={columns.length} className="text-center py-8">No logs found.</td></tr>
                        ) : (
                            pagedRows.map(row => (
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
            <div className="flex justify-between items-center mt-2">
                <button
                    className="px-3 py-1 rounded border bg-muted text-xs disabled:opacity-50"
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                >
                    Previous
                </button>
                <span className="text-xs">
                    Page {page + 1} of {pageCount}
                </span>
                <button
                    className="px-3 py-1 rounded border bg-muted text-xs disabled:opacity-50"
                    onClick={() => setPage(Math.min(pageCount - 1, page + 1))}
                    disabled={page >= pageCount - 1}
                >
                    Next
                </button>
            </div>
        </div>
    );
}