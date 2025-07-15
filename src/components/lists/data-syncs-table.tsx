"use client"
import * as React from 'react';
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  OnChangeFn,
} from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

interface DataSyncRow {
  subject_id: string;
  data_source_name: string;
  data_source_type: string;
  metadata_count: number;
  pull_status: string;
  last_pull: string;
  pull_file_count: number;
  files_count: number;
  last_file: string;
  push_status: string;
  last_push: string;
  push_file_count: number;
  [key: string]: any;
}

interface DataSyncsTableProps {
  rows: DataSyncRow[];
  loading: boolean;
  filter: string;
  setFilter: (v: string) => void;
  sorting: SortingState;
  setSorting: OnChangeFn<SortingState>;
  page: number;
  setPage: (p: number) => void;
  pageSize?: number;
}

export default function DataSyncsTable({ rows, loading, filter, setFilter, sorting, setSorting, page, setPage, pageSize = 20 }: DataSyncsTableProps) {
  const columns: ColumnDef<DataSyncRow>[] = [
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

  const table = useReactTable({
    data: rows.filter(row =>
      filter === '' ||
      Object.values(row).some(val => (val || '').toString().toLowerCase().includes(filter.toLowerCase()))
    ),
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
    onSortingChange: setSorting,
  });

  const pageCount = Math.ceil(table.getRowModel().rows.length / pageSize);
  const pagedRows = table.getRowModel().rows.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Data Sync Table</h3>
        <Badge variant="secondary">{table.getRowModel().rows.length} rows</Badge>
      </div>
      <div className="mb-2 flex items-center gap-2">
        <Input
          placeholder="Filter..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="w-64"
        />
      </div>
      <div className="rounded-md border overflow-x-auto bg-card">
        <table className="min-w-full text-xs">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
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
            {loading ? (
              <tr><td colSpan={columns.length} className="text-center py-8">Loading...</td></tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr><td colSpan={columns.length} className="text-center py-8">No data found.</td></tr>
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