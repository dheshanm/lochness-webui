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

interface LogRow {
  timestamp: string;
  level: string;
  event?: string;
  message?: string;
  data_source_name?: string;
  [key: string]: any;
}

interface LogsTableProps {
  logs: LogRow[];
  loading: boolean;
  filter: string;
  setFilter: (v: string) => void;
  sorting: SortingState;
  setSorting: OnChangeFn<SortingState>;
  page: number;
  setPage: (p: number) => void;
  pageSize?: number;
}

export default function LogsTable({ logs, loading, filter, setFilter, sorting, setSorting, page, setPage, pageSize = 20 }: LogsTableProps) {
  const columns: ColumnDef<LogRow>[] = [
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

  const table = useReactTable({
    data: logs.filter(row =>
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
        <h3 className="text-lg font-semibold">Logs</h3>
        <Badge variant="secondary">{table.getRowModel().rows.length} log entries</Badge>
      </div>
      <div className="mb-2 flex items-center gap-2">
        <Input
          placeholder="Filter logs..."
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
              <tr><td colSpan={columns.length} className="text-center py-8">Loading logs...</td></tr>
            ) : table.getRowModel().rows.length === 0 ? (
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