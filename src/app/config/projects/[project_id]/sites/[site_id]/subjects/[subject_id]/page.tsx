"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DataSource } from "@/types/data-sources";
import { DataPush } from "@/types/data-pushes";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
} from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

const ReactJson = dynamic(() => import("react-json-view"), { ssr: false });

interface Params {
  project_id: string;
  site_id: string;
  subject_id: string;
}

export default function SubjectDetailPage({ params }: { params: Params }) {
  const { project_id, site_id, subject_id } = params;
  const [subject, setSubject] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();
  const [dataSources, setDataSources] = React.useState<DataSource[]>([]);
  const [dataPushes, setDataPushes] = React.useState<DataPush[]>([]);
  const [dataPulls, setDataPulls] = React.useState<any[]>([]);
  const [files, setFiles] = React.useState<any[]>([]);
  const [statusLoading, setStatusLoading] = React.useState(true);
  const [filter, setFilter] = React.useState("");
  const [logs, setLogs] = React.useState<any[]>([]);
  const [logsLoading, setLogsLoading] = React.useState(true);
  const [logFilter, setLogFilter] = React.useState("");
  const [logSorting, setLogSorting] = React.useState<SortingState>([]);

  React.useEffect(() => {
    async function fetchSubject() {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/projects/${project_id}/sites/${site_id}/subjects`);
        const data = await res.json();
        const found = Array.isArray(data)
          ? data.find((s) => s.subject_id === subject_id)
          : null;
        setSubject(found || null);
      } catch (e) {
        setSubject(null);
      } finally {
        setLoading(false);
      }
    }
    fetchSubject();
  }, [project_id, site_id, subject_id]);

  React.useEffect(() => {
    async function fetchStatus() {
      setStatusLoading(true);
      try {
        const [dsRes, pushRes, pullRes, filesRes] = await Promise.all([
          fetch(`/api/v1/projects/${project_id}/sites/${site_id}/sources`),
          fetch(`/api/v1/projects/${project_id}/sites/${site_id}/data-pushes`),
          fetch(`/api/v1/projects/${project_id}/sites/${site_id}/data-pulls`),
          fetch(`/api/v1/projects/${project_id}/sites/${site_id}/files`),
        ]);
        setDataSources(await dsRes.json());
        setDataPushes((await pushRes.json()).data_pushes || []);
        setDataPulls((await pullRes.json()).data_pulls || []);
        setFiles((await filesRes.json()).files || []);
      } catch (e) {
        setDataSources([]);
        setDataPushes([]);
        setDataPulls([]);
        setFiles([]);
      } finally {
        setStatusLoading(false);
      }
    }
    fetchStatus();
  }, [project_id, site_id, subject_id]);

  React.useEffect(() => {
    async function fetchLogs() {
      setLogsLoading(true);
      try {
        const res = await fetch(`/api/v1/logs?project_id=${project_id}&site_id=${site_id}&limit=500`);
        const data = await res.json();
        setLogs(data.rows || []);
      } catch (e) {
        setLogs([]);
      } finally {
        setLogsLoading(false);
      }
    }
    fetchLogs();
  }, [project_id, site_id, subject_id]);

  // Helpers for this subject
  function getPushesForDS(dsName: string) {
    return dataPushes.filter(
      (push) => push.subject_id === subject_id && push.data_source_name === dsName
    );
  }
  function getLastPushForDS(dsName: string) {
    const pushes = getPushesForDS(dsName);
    if (pushes.length === 0) return null;
    return pushes.reduce((latest, curr) =>
      new Date(curr.push_timestamp) > new Date(latest.push_timestamp) ? curr : latest
    );
  }
  function getPullsForDS(dsName: string) {
    return dataPulls.filter(
      (pull) => pull.subject_id === subject_id && pull.data_source_name === dsName
    );
  }
  function getLastPullForDS(dsName: string) {
    const pulls = getPullsForDS(dsName);
    if (pulls.length === 0) return null;
    return pulls.reduce((latest, curr) =>
      new Date(curr.pull_timestamp) > new Date(latest.pull_timestamp) ? curr : latest
    );
  }
  function getFilesForDS(dsName: string) {
    return files.filter(
      (file) => file.subject_id === subject_id && file.data_source_name === dsName
    );
  }
  function getLastFileForDS(dsName: string) {
    const subjectFiles = getFilesForDS(dsName);
    if (subjectFiles.length === 0) return null;
    return subjectFiles.reduce((latest, curr) =>
      new Date(curr.m_time) > new Date(latest.m_time) ? curr : latest
    );
  }
  const filteredDataSources = dataSources.filter(
    (ds) =>
      ds.data_source_name.toLowerCase().includes(filter.toLowerCase()) ||
      ds.data_source_type.toLowerCase().includes(filter.toLowerCase())
  );

  // Filter logs for this subject
  const subjectLogs = logs.filter(
    (log) => log.extended_log_format && log.extended_log_format.includes(subject_id)
  ).filter(
    (log) => log.extended_log_format.toLowerCase().includes(logFilter.toLowerCase())
  );

  // Parse logs for table display (match LogsViewer style)
  function parseLogRow(row: any) {
    // Example: 2025-07-12 11:53:04 [INFO] {"event": ...}
    const match = row.extended_log_format?.match(/^([\d-]+ [\d:]+) \[(\w+)\] (.*)$/);
    if (!match) return { timestamp: '', level: '', message: row.extended_log_format };
    const [, timestamp, level, jsonStr] = match;
    let json: any = {};
    try {
      json = JSON.parse(jsonStr);
    } catch {
      json = { message: jsonStr };
    }
    return { timestamp, level, ...json };
  }
  const parsedSubjectLogs = subjectLogs.map(parseLogRow);

  // Add refresh handler for logs
  const handleRefreshLogs = async () => {
    setLogsLoading(true);
    try {
      const res = await fetch(`/api/v1/logs?project_id=${project_id}&site_id=${site_id}&limit=500`);
      const data = await res.json();
      setLogs(data.rows || []);
    } catch (e) {
      setLogs([]);
    } finally {
      setLogsLoading(false);
    }
  };

  // react-table columns for logs
  const logColumns: ColumnDef<any>[] = [
    {
      accessorKey: "timestamp",
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 font-semibold"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Timestamp
          <ArrowUpDown className="h-3 w-3" />
        </button>
      ),
      cell: info => <span className="font-mono text-xs">{info.getValue() as string}</span>,
    },
    {
      accessorKey: "level",
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 font-semibold"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Level
          <ArrowUpDown className="h-3 w-3" />
        </button>
      ),
      cell: info => <Badge variant={info.getValue() === "INFO" ? "secondary" : "default"}>{info.getValue() as string}</Badge>,
    },
    {
      accessorKey: "event",
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 font-semibold"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Event
          <ArrowUpDown className="h-3 w-3" />
        </button>
      ),
    },
    {
      accessorKey: "message",
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 font-semibold"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Message
          <ArrowUpDown className="h-3 w-3" />
        </button>
      ),
      cell: info => <span className="break-words whitespace-pre-wrap text-xs">{info.getValue() as string}</span>,
    },
    {
      accessorKey: "data_source_name",
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 font-semibold"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Data Source
          <ArrowUpDown className="h-3 w-3" />
        </button>
      ),
    },
  ];

  const logTable = useReactTable({
    data: parsedSubjectLogs,
    columns: logColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: { sorting: logSorting },
    onSortingChange: setLogSorting,
  });

  return (
    <div className="container mx-auto p-6 max-w-3xl flex flex-col">
      <div className="flex items-center mb-4">
        <Button variant="ghost" asChild size="sm" className="mr-2">
          <Link href={`/config/projects/${project_id}/sites/${site_id}`}
            className="flex items-center">
            <ChevronLeft />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Subject: {subject_id}</h1>
      </div>
      {loading ? (
        <Skeleton className="h-32 w-full" />
      ) : subject ? (
        <Card>
          <CardContent className="p-6">
            <div className="mb-4">
              <div className="text-lg font-semibold">Subject ID: <span className="font-mono">{subject.subject_id}</span></div>
              <div className="text-md text-gray-500">Site: {site_id} | Project: {project_id}</div>
            </div>
            <div className="mb-2 font-semibold">Metadata</div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded p-2 mb-6">
              <ReactJson
                src={subject.subject_metadata || {}}
                name={false}
                theme="rjv-default"
                collapsed={2}
                enableClipboard={true}
                displayDataTypes={false}
                style={{ fontSize: "14px", borderRadius: "8px", padding: "8px", background: "none" }}
              />
            </div>
            {/* Status Table */}
            <div className="mb-2 font-semibold">Data Source Status</div>
            <div className="mb-2 flex items-center gap-2">
              <Input
                placeholder="Filter by data source name or type..."
                value={filter}
                onChange={e => setFilter(e.target.value)}
                className="w-64"
              />
              <Badge variant="secondary">{filteredDataSources.length} of {dataSources.length}</Badge>
            </div>
            <div className="rounded-md border overflow-x-auto">
              {statusLoading ? (
                <Skeleton className="h-32 w-full" />
              ) : (
                <table className="w-full caption-bottom text-sm">
                  <thead className="[&_tr]:border-b">
                    <tr>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Data Source Name</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Type</th>
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
                    {filteredDataSources.map((ds) => {
                      const pulls = getPullsForDS(ds.data_source_name);
                      const lastPull = getLastPullForDS(ds.data_source_name);
                      const pushes = getPushesForDS(ds.data_source_name);
                      const lastPush = getLastPushForDS(ds.data_source_name);
                      const subjectFiles = getFilesForDS(ds.data_source_name);
                      const lastFile = getLastFileForDS(ds.data_source_name);
                      return (
                        <tr key={ds.data_source_name} className="border-b hover:bg-muted/50">
                          <td className="p-4 font-mono font-medium">{ds.data_source_name}</td>
                          <td className="p-4 uppercase">{ds.data_source_type}</td>
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
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center text-gray-500">Subject not found.</div>
      )}
      {/* Subject Logs Section */}
      <div className="mt-8">
        <div className="mb-2 font-semibold">Logs for Subject: <span className="font-mono">{subject_id}</span></div>
        <div className="mb-2 flex items-center gap-2">
          <Input
            placeholder="Filter logs..."
            value={logFilter}
            onChange={e => setLogFilter(e.target.value)}
            className="w-64"
          />
          <Button onClick={handleRefreshLogs} disabled={logsLoading} size="sm" variant="outline">Refresh</Button>
          <Badge variant="secondary">{parsedSubjectLogs.length} log entries</Badge>
        </div>
        <div className="rounded-md border overflow-x-auto bg-card">
          <table className="min-w-full text-xs">
            <thead>
              {logTable.getHeaderGroups().map(headerGroup => (
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
              {logsLoading ? (
                <tr><td colSpan={logColumns.length} className="text-center py-8">Loading logs...</td></tr>
              ) : logTable.getRowModel().rows.length === 0 ? (
                <tr><td colSpan={logColumns.length} className="text-center py-8">No logs found for this subject.</td></tr>
              ) : (
                logTable.getRowModel().rows
                  .filter(row =>
                    logFilter === '' ||
                    Object.values(row.original).some(val => (val || '').toString().toLowerCase().includes(logFilter.toLowerCase()))
                  )
                  .map(row => (
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
    </div>
  );
} 