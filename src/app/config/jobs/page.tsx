"use client"
import * as React from 'react';
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";

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

export default function JobsPage() {
    const [jobs, setJobs] = React.useState<Job[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchJobs = async () => {
            setLoading(true);
            const response = await fetch('/api/v1/jobs');
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
    }, []);

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
                        Jobs will appear here when data pulls, pushes, or other tasks are triggered.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Jobs</h3>
                <div className="flex items-center gap-2">
                    <Badge variant="secondary">{jobs.length} jobs</Badge>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center gap-2"
                        onClick={() => {
                            // For now, just show a message. In a real app, this would open a dialog
                            toast.info('Job creation dialog would open here. Use the data source detail pages to create specific jobs.');
                        }}
                    >
                        <Plus className="h-4 w-4" />
                        <span>Create Job</span>
                    </Button>
                </div>
            </div>
            <div className="rounded-md border overflow-x-auto">
                <table className="w-full text-xs">
                    <thead>
                        <tr className="border-b bg-muted/50">
                            <th className="p-2 text-left">Job ID</th>
                            <th className="p-2 text-left">Type</th>
                            <th className="p-2 text-left">Project</th>
                            <th className="p-2 text-left">Site</th>
                            <th className="p-2 text-left">Data Source</th>
                            <th className="p-2 text-left">Data Sink</th>
                            <th className="p-2 text-left">Requested By</th>
                            <th className="p-2 text-left">Status</th>
                            <th className="p-2 text-left">Created</th>
                            <th className="p-2 text-left">Started</th>
                            <th className="p-2 text-left">Finished</th>
                            <th className="p-2 text-left">Result</th>
                        </tr>
                    </thead>
                    <tbody>
                        {jobs.map(job => (
                            <tr key={job.job_id} className="border-b hover:bg-muted/50">
                                <td className="p-2 font-mono">{job.job_id}</td>
                                <td className="p-2">{job.job_type}</td>
                                <td className="p-2">{job.project_id}</td>
                                <td className="p-2">{job.site_id}</td>
                                <td className="p-2">{job.data_source_name || '-'}</td>
                                <td className="p-2">{job.data_sink_name || '-'}</td>
                                <td className="p-2">{job.requested_by || '-'}</td>
                                <td className="p-2">
                                    <Badge variant={job.status === 'success' ? 'default' : job.status === 'error' ? 'destructive' : 'secondary'}>
                                        {job.status}
                                    </Badge>
                                </td>
                                <td className="p-2 font-mono">{job.created_at ? new Date(job.created_at).toLocaleString() : '-'}</td>
                                <td className="p-2 font-mono">{job.started_at ? new Date(job.started_at).toLocaleString() : '-'}</td>
                                <td className="p-2 font-mono">{job.finished_at ? new Date(job.finished_at).toLocaleString() : '-'}</td>
                                <td className="p-2 break-all whitespace-pre-wrap">{job.result || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
} 