"use client"
import * as React from 'react';
import { Pencil, ChevronLeft, Trash } from "lucide-react"
import Link from 'next/link'
import { toast } from "sonner";
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

import RedcapForm from '@/components/forms/data-sources/redcap';
import useProtectPage from "@/hooks/protectPage"

type Params = Promise<{ project_id: string, site_id: string, instance_name: string }>

export default function AddRedcapDataSource({
    params,
}: {
    params: Params
}) {
    useProtectPage();
    const [projectId, setProjectId] = React.useState<string | null>(null);
    const [siteId, setSiteId] = React.useState<string | null>(null);
    const [instanceName, setInstanceName] = React.useState<string | null>(null);

    const [isDeleting, setIsDeleting] = React.useState<boolean>(false);

    const router = useRouter()

    React.useEffect(() => {
        const getProjectId = async () => {
            const { project_id } = await params;
            setProjectId(decodeURIComponent(project_id))
        };

        const getSiteId = async () => {
            const { site_id } = await params;
            setSiteId(decodeURIComponent(site_id));
        };

        const getInstanceName = async () => {
            const { instance_name } = await params;
            setInstanceName(decodeURIComponent(instance_name));
        };

        getProjectId();
        getSiteId();
        getInstanceName();
    }, [params]);


    const handleDeletion = async () => {
        if (!projectId || !siteId || !instanceName || isDeleting) {
            return; // Prevent deletion if IDs are missing or already deleting
        }

        setIsDeleting(true);
        try {
            const response = await fetch(`/api/v1/projects/${projectId}/sites/${siteId}/sources/${instanceName}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                // Deletion successful, redirect to the site page
                toast.success(`Data source ${instanceName} deleted successfully.`);
                router.push(`/config/projects/${projectId}/sites/${siteId}`);
                // Optionally show a success notification
            } else {
                // Handle error response
                const errorData = await response.json();
                toast.error(`Failed to delete data source: ${errorData.message || response.statusText}`);
            }
        } catch (error) {
            console.error('Error during deletion request:', error);
            toast.error('An error occurred while trying to delete the data source.');
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
                            <Button
                                variant="ghost"
                                asChild
                                size="sm"
                                className="mr-2"
                            >
                                <Link href={`/config/projects/${projectId}/sites/${siteId}/data-sources/redcap/${instanceName}`} className="flex items-center">
                                    <ChevronLeft />
                                </Link>
                            </Button>

                            <Breadcrumb>
                                <BreadcrumbList>
                                    <BreadcrumbItem>
                                        {projectId ? (
                                            <BreadcrumbLink
                                                href={`/config/projects/${projectId}`}
                                            >
                                                {projectId}
                                            </BreadcrumbLink>
                                        ) : (
                                            <Skeleton className="h-4 w-[150px] bg-gray-200 dark:bg-gray-700" />
                                        )}
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                        {(projectId && siteId) ? (
                                            <BreadcrumbLink
                                                href={`/config/projects/${projectId}/sites/${siteId}`}
                                            >
                                                {siteId}
                                            </BreadcrumbLink>
                                        ) : (
                                            <Skeleton className="h-4 w-[150px] bg-gray-200 dark:bg-gray-700" />
                                        )}
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                        <BreadcrumbLink>
                                            Data Sources
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                        {instanceName ? (
                                            <BreadcrumbLink>
                                                {instanceName}
                                            </BreadcrumbLink>
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
                                            Are you sure you want to delete the data source `{instanceName}`? This action cannot be undone.
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
                    <Image src="/logo/redcap.jpeg" alt="REDCap" width={32} height={32} className="rounded" />
                    <h1 className="text-2xl font-semibold">Update REDCap Data Source</h1>
                </div>
                <div className="flex-grow overflow-auto mt-4">
                    {projectId && siteId && instanceName && <RedcapForm project_id={projectId} site_id={siteId} instance_name={instanceName} />}
                </div>
            </div>
        </>

    )
}