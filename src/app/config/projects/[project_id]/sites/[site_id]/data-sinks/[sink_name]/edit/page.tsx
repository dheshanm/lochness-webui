"use client"
import * as React from 'react';
import { Pencil, ChevronLeft, Trash } from "lucide-react";
import Link from 'next/link';
import { toast } from "sonner";
import { useRouter } from 'next/navigation';

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Params = Promise<{ project_id: string, site_id: string, sink_name: string }>;

export default function EditDataSinkPage({ params }: { params: Params }) {
    const [projectId, setProjectId] = React.useState<string | null>(null);
    const [siteId, setSiteId] = React.useState<string | null>(null);
    const [sinkName, setSinkName] = React.useState<string | null>(null);
    const [isDeleting, setIsDeleting] = React.useState<boolean>(false);
    const [sinkType, setSinkType] = React.useState<string>("minio");
    const [keystoreName, setKeystoreName] = React.useState<string>("");
    const [endpoint, setEndpoint] = React.useState<string>("");
    const [bucket, setBucket] = React.useState<string>("");
    const [dataSinkName, setDataSinkName] = React.useState<string>("");
    const [loading, setLoading] = React.useState<boolean>(true);
    const router = useRouter();

    React.useEffect(() => {
        const getProjectId = async () => {
            const { project_id } = await params;
            setProjectId(decodeURIComponent(project_id));
        };
        const getSiteId = async () => {
            const { site_id } = await params;
            setSiteId(decodeURIComponent(site_id));
        };
        const getSinkName = async () => {
            const { sink_name } = await params;
            setSinkName(decodeURIComponent(sink_name));
        };
        getProjectId();
        getSiteId();
        getSinkName();
    }, [params]);

    React.useEffect(() => {
        const fetchDataSink = async () => {
            if (projectId && siteId && sinkName) {
                setLoading(true);
                const response = await fetch(`/api/v1/projects/${projectId}/sites/${siteId}/sinks/${sinkName}`);
                const data = await response.json();
                setDataSinkName(data.data_sink_name || "");
                setSinkType(data.data_sink_metadata?.type || "minio");
                setKeystoreName(data.data_sink_metadata?.keystore_name || "");
                setEndpoint(data.data_sink_metadata?.endpoint || "");
                setBucket(data.data_sink_metadata?.bucket || "");
                setLoading(false);
            }
        };
        fetchDataSink();
    }, [projectId, siteId, sinkName]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!projectId || !siteId || !sinkName) return;
        // Build metadata based on sink type
        let data_sink_metadata: Record<string, any> = { keystore_name: keystoreName };
        if (sinkType === "minio") {
            data_sink_metadata.endpoint = endpoint;
            data_sink_metadata.bucket = bucket;
        }
        // Add more sink types as needed
        const response = await fetch(`/api/v1/projects/${projectId}/sites/${siteId}/sinks/${sinkName}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data_sink_metadata })
        });
        if (response.ok) {
            toast.success("Data sink updated successfully");
            router.push(`/config/projects/${projectId}/sites/${siteId}/data-sinks/${sinkName}`);
        } else {
            const errorData = await response.json();
            toast.error(`Failed to update data sink: ${errorData.error || response.statusText}`);
        }
    };

    const handleDeletion = async () => {
        if (!projectId || !siteId || !sinkName || isDeleting) return;
        setIsDeleting(true);
        try {
            const response = await fetch(`/api/v1/projects/${projectId}/sites/${siteId}/sinks/${sinkName}`, { method: 'DELETE' });
            if (response.ok) {
                toast.success(`Data sink ${sinkName} deleted successfully.`);
                router.push(`/config/projects/${projectId}/sites/${siteId}`);
            } else {
                const errorData = await response.json();
                toast.error(`Failed to delete data sink: ${errorData.message || response.statusText}`);
            }
        } catch (error) {
            console.error('Error during deletion request:', error);
            toast.error('An error occurred while trying to delete the data sink.');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <div className="p-4 md:p-4 border-b">
                <div className="max-w-screen-xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <Button variant="ghost" asChild size="sm" className="mr-2">
                                <Link href={`/config/projects/${projectId}/sites/${siteId}/data-sinks/${sinkName}`} className="flex items-center">
                                    <ChevronLeft />
                                </Link>
                            </Button>
                            <Breadcrumb>
                                <BreadcrumbList>
                                    <BreadcrumbItem>
                                        {projectId ? (
                                            <BreadcrumbLink href={`/config/projects/${projectId}`}>{projectId}</BreadcrumbLink>
                                        ) : (
                                            <Skeleton className="h-4 w-[150px] bg-gray-200 dark:bg-gray-700" />
                                        )}
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                        {(projectId && siteId) ? (
                                            <BreadcrumbLink href={`/config/projects/${projectId}/sites/${siteId}`}>{siteId}</BreadcrumbLink>
                                        ) : (
                                            <Skeleton className="h-4 w-[150px] bg-gray-200 dark:bg-gray-700" />
                                        )}
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                        <BreadcrumbLink>Data Sinks</BreadcrumbLink>
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                        {sinkName ? (
                                            <BreadcrumbLink>{sinkName}</BreadcrumbLink>
                                        ) : (
                                            <Skeleton className="h-4 w-[150px] bg-gray-200 dark:bg-gray-700" />
                                        )}
                                    </BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center bg-amber-100 text-amber-800 px-2.5 py-1 rounded-md text-sm font-medium">
                                <Pencil className="h-4 w-4 mr-1.5" />
                                Editing
                            </div>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                        <Trash className="h-4 w-4" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Confirm Deletion</DialogTitle>
                                        <DialogDescription>
                                            Are you sure you want to delete the data sink `{sinkName}`? This action cannot be undone.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button variant="outline">Cancel</Button>
                                        </DialogClose>
                                        <Button
                                            variant="destructive"
                                            onClick={handleDeletion}
                                            disabled={isDeleting}
                                        >
                                            {isDeleting ? 'Deleting...' : 'Delete'}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </div>
            </div>
            <div className="container mx-auto p-6 max-w-5xl flex flex-col h-full">
                <div className="flex items-center gap-2 mb-4">
                    <h1 className="text-2xl font-semibold">Update Data Sink</h1>
                </div>
                <div className="flex-grow overflow-auto mt-4">
                    {loading ? (
                        <Skeleton className="h-32 w-full bg-gray-200 dark:bg-gray-700" />
                    ) : (
                        <form onSubmit={handleUpdate} className="space-y-4 max-w-2xl">
                            <div>
                                <label className="block text-sm font-medium mb-1">Name</label>
                                <Input value={dataSinkName} disabled />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Sink Type</label>
                                <Select value={sinkType} onValueChange={setSinkType} defaultValue={sinkType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select sink type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="minio">MinIO</SelectItem>
                                        <SelectItem value="sharepoint">SharePoint</SelectItem>
                                        {/* Add more sink types as needed */}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Keystore Name</label>
                                <Input value={keystoreName} onChange={e => setKeystoreName(e.target.value)} placeholder="e.g., minio_prod_creds" />
                                <p className="text-xs text-gray-500 mt-1">Reference a secret stored in the keystore.</p>
                            </div>
                            {/* MinIO fields */}
                            {sinkType === "minio" && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Endpoint</label>
                                        <Input value={endpoint} onChange={e => setEndpoint(e.target.value)} placeholder="e.g., https://minio.example.com" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Bucket</label>
                                        <Input value={bucket} onChange={e => setBucket(e.target.value)} placeholder="e.g., my-bucket" />
                                    </div>
                                </>
                            )}
                            {/* Add more sink type fields as needed */}
                            <Button type="submit" variant="default">Update Data Sink</Button>
                        </form>
                    )}
                </div>
            </div>
        </>
    );
} 