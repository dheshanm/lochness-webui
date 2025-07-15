"use client"
import * as React from 'react';
import dynamic from 'next/dynamic';
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import Link from 'next/link';

// Dynamically import react-json-view with ssr: false
const ReactJson = dynamic(() => import('react-json-view'), { ssr: false });

interface Subject {
    subject_id: string;
    site_id: string;
    project_id: string;
    subject_metadata: Record<string, any>;
}

interface SubjectsTableProps {
    project_id: string;
    site_id: string;
}

export default function SubjectsTable({ project_id, site_id }: SubjectsTableProps) {
    const [subjects, setSubjects] = React.useState<Subject[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});

    React.useEffect(() => {
        const fetchSubjects = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/v1/projects/${project_id}/sites/${site_id}/subjects`);
                
                if (!response.ok) {
                    throw new Error('Failed to fetch subjects');
                }
                
                const data = await response.json();
                setSubjects(data);
            } catch (error) {
                console.error('Error fetching subjects:', error);
                toast.error('Failed to fetch subjects');
                setSubjects([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSubjects();
    }, [project_id, site_id]);

    const columns: ColumnDef<Subject>[] = [
        {
            accessorKey: "subject_id",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="h-8 px-2 font-semibold"
                    >
                        Subject ID
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => (
                <div className="font-mono font-medium">
                    <Link
                        href={`/config/projects/${row.original.project_id}/sites/${row.original.site_id}/subjects/${row.original.subject_id}`}
                        className="text-blue-600 hover:underline"
                    >
                        {row.getValue("subject_id")}
                    </Link>
                </div>
            ),
        },
        {
            accessorKey: "metadata_count",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="h-8 px-2 font-semibold"
                    >
                        Metadata Count
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => {
                const metadataCount = Object.keys(row.original.subject_metadata || {}).length;
                return (
                    <Badge variant={metadataCount > 0 ? "default" : "secondary"}>
                        {metadataCount}
                    </Badge>
                );
            },
            sortingFn: (rowA, rowB) => {
                const countA = Object.keys(rowA.original.subject_metadata || {}).length;
                const countB = Object.keys(rowB.original.subject_metadata || {}).length;
                return countA - countB;
            },
        },
        {
            accessorKey: "subject_metadata",
            header: "Metadata",
            cell: ({ row }) => {
                const metadata = row.getValue("subject_metadata") as Record<string, any>;
                const metadataCount = Object.keys(metadata || {}).length;
                
                if (metadataCount === 0) {
                    return (
                        <span className="text-muted-foreground text-sm">
                            No metadata
                        </span>
                    );
                }

                // Only render ReactJson on the client
                return (
                    <div className="max-w-xs">
                        <ReactJson
                            src={metadata}
                            name={false}
                            theme="tomorrow"
                            style={{
                                backgroundColor: 'transparent',
                                fontSize: '0.75rem',
                            }}
                            displayDataTypes={false}
                            displayObjectSize={false}
                            enableClipboard={false}
                            collapsed={1}
                        />
                    </div>
                );
            },
        },
    ];

    const table = useReactTable({
        data: subjects,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    });

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-10 w-64" />
                </div>
                <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">Subjects</h3>
                    <Badge variant="secondary">
                        {table.getFilteredRowModel().rows.length} of {subjects.length}
                    </Badge>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search subjects..."
                            value={(table.getColumn("subject_id")?.getFilterValue() as string) ?? ""}
                            onChange={(event) =>
                                table.getColumn("subject_id")?.setFilterValue(event.target.value)
                            }
                            className="pl-8 w-64"
                        />
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                                <Filter className="h-4 w-4 mr-2" />
                                Columns
                                <ChevronDown className="h-4 w-4 ml-2" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => {
                                    return (
                                        <DropdownMenuItem
                                            key={column.id}
                                            className="capitalize"
                                            onSelect={(e) => e.preventDefault()}
                                        >
                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={column.getIsVisible()}
                                                    onChange={column.getToggleVisibilityHandler()}
                                                />
                                                {column.id}
                                            </label>
                                        </DropdownMenuItem>
                                    );
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {table.getFilteredRowModel().rows.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500">No subjects found.</p>
                </div>
            ) : (
                <div className="rounded-md border">
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                            <thead className="[&_tr]:border-b">
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <tr
                                        key={headerGroup.id}
                                        className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                                    >
                                        {headerGroup.headers.map((header) => (
                                            <th
                                                key={header.id}
                                                className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0"
                                            >
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                          header.column.columnDef.header,
                                                          header.getContext()
                                                      )}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <tr
                                            key={row.id}
                                            data-state={row.getIsSelected() && "selected"}
                                            className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                                        >
                                            {row.getVisibleCells().map((cell) => (
                                                <td
                                                    key={cell.id}
                                                    className="p-4 align-middle [&:has([role=checkbox])]:pr-0"
                                                >
                                                    {flexRender(
                                                        cell.column.columnDef.cell,
                                                        cell.getContext()
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={columns.length}
                                            className="h-24 text-center"
                                        >
                                            No results.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
} 

// New: SubjectsForDataSourceTable
import { DataPush } from '@/types/data-pushes';

// Add types for pulls and files
interface DataPull {
    data_pull_id: number;
    subject_id: string;
    data_source_name: string;
    site_id: string;
    project_id: string;
    file_path: string;
    file_md5: string;
    pull_time_s: number;
    pull_timestamp: string;
    pull_metadata: Record<string, any>;
}
interface FileRow {
    file_path: string;
    file_md5: string;
    file_size_mb: number;
    m_time: string;
    subject_id?: string;
    data_source_name?: string;
}

interface SubjectsForDataSourceTableProps {
    project_id: string;
    site_id: string;
    data_source_name: string;
}

export function SubjectsForDataSourceTable({ project_id, site_id, data_source_name }: SubjectsForDataSourceTableProps) {
    const [subjects, setSubjects] = React.useState<Subject[]>([]);
    const [dataPushes, setDataPushes] = React.useState<DataPush[]>([]);
    const [dataPulls, setDataPulls] = React.useState<DataPull[]>([]);
    const [files, setFiles] = React.useState<FileRow[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        async function fetchAll() {
            setLoading(true);
            try {
                const [subjectsRes, pushesRes, pullsRes, filesRes] = await Promise.all([
                    fetch(`/api/v1/projects/${project_id}/sites/${site_id}/subjects`),
                    fetch(`/api/v1/projects/${project_id}/sites/${site_id}/data-pushes`),
                    fetch(`/api/v1/projects/${project_id}/sites/${site_id}/data-pulls`),
                    fetch(`/api/v1/projects/${project_id}/sites/${site_id}/files`),
                ]);
                const subjectsData = await subjectsRes.json();
                const pushesData = await pushesRes.json();
                const pullsData = await pullsRes.json();
                const filesData = await filesRes.json();
                setSubjects(subjectsData);
                setDataPushes(pushesData.data_pushes || []);
                setDataPulls(pullsData.data_pulls || []);
                setFiles(filesData.files || []);
            } catch (e) {
                setSubjects([]);
                setDataPushes([]);
                setDataPulls([]);
                setFiles([]);
            } finally {
                setLoading(false);
            }
        }
        fetchAll();
    }, [project_id, site_id, data_source_name]);

    // Helpers for push
    function getPushesForSubject(subject_id: string) {
        return dataPushes.filter(
            (push) => push.subject_id === subject_id && push.data_source_name === data_source_name
        );
    }
    function getLastPushForSubject(subject_id: string) {
        const pushes = getPushesForSubject(subject_id);
        if (pushes.length === 0) return null;
        return pushes.reduce((latest, curr) =>
            new Date(curr.push_timestamp) > new Date(latest.push_timestamp) ? curr : latest
        );
    }
    // Helpers for pull
    function getPullsForSubject(subject_id: string) {
        return dataPulls.filter(
            (pull) => pull.subject_id === subject_id && pull.data_source_name === data_source_name
        );
    }
    function getLastPullForSubject(subject_id: string) {
        const pulls = getPullsForSubject(subject_id);
        if (pulls.length === 0) return null;
        return pulls.reduce((latest, curr) =>
            new Date(curr.pull_timestamp) > new Date(latest.pull_timestamp) ? curr : latest
        );
    }
    // Helpers for files
    function getFilesForSubject(subject_id: string) {
        return files.filter(
            (file) => file.subject_id === subject_id && file.data_source_name === data_source_name
        );
    }
    function getLastFileForSubject(subject_id: string) {
        const subjectFiles = getFilesForSubject(subject_id);
        if (subjectFiles.length === 0) return null;
        return subjectFiles.reduce((latest, curr) =>
            new Date(curr.m_time) > new Date(latest.m_time) ? curr : latest
        );
    }

    if (loading) {
        return <div className="space-y-4"><Skeleton className="h-6 w-32" /><Skeleton className="h-10 w-64" />
            {[...Array(5)].map((_, i) => (<Skeleton key={i} className="h-12 w-full" />))}
        </div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">Subjects & Status</h3>
                <Badge variant="secondary">{subjects.length}</Badge>
            </div>
            <div className="rounded-md border">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                        <thead className="[&_tr]:border-b">
                            <tr>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Subject ID</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Metadata Count</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Pull Status</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Last Pull</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Pull File Count</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Files</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Last File</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Push Status</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Last Push</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Push File Count</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subjects.map((subject) => {
                                // Pull
                                const pulls = getPullsForSubject(subject.subject_id);
                                const lastPull = getLastPullForSubject(subject.subject_id);
                                // Push
                                const pushes = getPushesForSubject(subject.subject_id);
                                const lastPush = getLastPushForSubject(subject.subject_id);
                                // Files
                                const subjectFiles = getFilesForSubject(subject.subject_id);
                                const lastFile = getLastFileForSubject(subject.subject_id);
                                return (
                                    <tr key={subject.subject_id} className="border-b hover:bg-muted/50">
                                        {/* Subject ID and Metadata Count */}
                                        <td className="p-4 font-mono font-medium">{subject.subject_id}</td>
                                        <td className="p-4"><Badge variant={Object.keys(subject.subject_metadata || {}).length > 0 ? 'default' : 'secondary'}>{Object.keys(subject.subject_metadata || {}).length}</Badge></td>
                                        {/* Pull */}
                                        <td className="p-4">
                                            {pulls.length > 0 ? (
                                                <Badge variant="default" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">Success</Badge>
                                            ) : (
                                                <Badge variant="secondary">None</Badge>
                                            )}
                                        </td>
                                        <td className="p-4">{lastPull ? new Date(lastPull.pull_timestamp).toLocaleString() : '-'}</td>
                                        <td className="p-4">{pulls.length}</td>
                                        {/* Files */}
                                        <td className="p-4">{subjectFiles.length}</td>
                                        <td className="p-4">{lastFile ? new Date(lastFile.m_time).toLocaleString() : '-'}</td>
                                        {/* Push */}
                                        <td className="p-4">
                                            {pushes.length > 0 ? (
                                                <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Success</Badge>
                                            ) : (
                                                <Badge variant="secondary">None</Badge>
                                            )}
                                        </td>
                                        <td className="p-4">{lastPush ? new Date(lastPush.push_timestamp).toLocaleString() : '-'}</td>
                                        <td className="p-4">{pushes.length}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
} 