"use client"
import * as React from 'react';
import { toast } from "sonner";
// import Image from 'next/image';
import Link from 'next/link';

import { Plus, Database } from "lucide-react"

import EmptyBox from '@/components/placeholders/empty';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"

import { DataSink } from '@/types/data-sinks';

interface DataSinkProps {
    project_id: string;
    site_id: string;
}

export default function DataSinksList(
    props: DataSinkProps
) {
    const { project_id, site_id } = props;

    const [dataSinks, setDataSinks] = React.useState<DataSink[]>([])
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        const fetchDataSinks = async () => {
            try {
                const response = await fetch(`/api/v1/projects/${project_id}/sites/${site_id}/sinks`)
                if (!response.ok) {
                    throw new Error('Failed to fetch data sinks')
                }
                const data = await response.json()
                setDataSinks(data)
            } catch (error) {
                console.error(error)
                toast.error('Failed to fetch data sinks')
            } finally {
                setLoading(false)
            }
        }

        fetchDataSinks()
    }, [project_id, site_id])

    return (
        <div className="w-full p-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold">Data Sinks</h2>

                {/* Add Data Sink Dialog */}
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Data Sink
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Add New Data Sink</DialogTitle>
                            <DialogDescription>
                                Select the type of data sink you want to add.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <Button asChild variant="outline">
                                <Link href={`/config/projects/${project_id}/sites/${site_id}/data-sinks/s3/new`}>
                                    {/* <Image src="/logo/s3.jpeg" alt="S3" width={24} height={24} className="rounded" /> */}
                                    <Database className="mr-2 h-4 w-4" />
                                    S3
                                </Link>
                            </Button>
                        </div>
                        <DialogFooter>
                            <p className="text-sm text-muted-foreground text-center w-full">
                                More data sink types coming soon.
                            </p>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Content Area */}
            <div className="flex justify-center items-center min-h-[200px]"> {/* Added min-height for better loading/empty state */}
                {loading ? (
                    <EmptyBox message='Loading data sinks...' />
                ) : dataSinks && dataSinks.length > 0 ? (
                    <Carousel
                        opts={{
                            align: "start",
                        }}
                        className="w-full max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-6xl"
                    >
                        <CarouselContent className="-ml-4">
                            {dataSinks.map((dataSink: DataSink) => (
                                <CarouselItem key={dataSink.data_sink_name} className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                                    {/* Link wraps the entire card content for better clickability */}
                                    <Link
                                        href={`/config/projects/${project_id}/sites/${site_id}/data-sinks/${dataSink.data_sink_metadata.type}/${dataSink.data_sink_name}`}
                                        passHref
                                        className="block h-full" // Ensure link takes full height
                                    >
                                        <div className="p-1 h-full">
                                            <div className="border rounded-lg p-4 h-full flex flex-col justify-start items-start relative hover:shadow-md transition-shadow duration-200 ease-in-out group bg-card text-card-foreground">
                                                {/* Status Dot with Tooltip */}
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div className={`absolute top-3 right-3 w-3 h-3 rounded-full ${
                                                                dataSink.data_sink_metadata.is_active ? 'bg-green-500' : 'bg-gray-400'
                                                            }`}>
                                                                <span className="sr-only">{dataSink.data_sink_metadata.is_active ? 'Active' : 'Inactive'}</span>
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>{dataSink.data_sink_metadata.is_active ? 'Active' : 'Inactive'}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>

                                                {/* Logo based on type */}
                                                <div className="mb-3">
                                                    {(() => {
                                                        const lowerCaseType = dataSink.data_sink_metadata?.type?.toLowerCase();
                                                        switch (lowerCaseType) {
                                                            case 's3':
                                                                // return <Image src="/logo/s3.png" alt="S3" width={32} height={32} className="rounded" />;
                                                                return <Database className="w-8 h-8 text-muted-foreground" />;
                                                            default:
                                                                // Placeholder for unknown types
                                                                return <div className="w-8 h-8 bg-muted rounded flex items-center justify-center text-muted-foreground text-lg font-bold">?</div>;
                                                        }
                                                    })()}
                                                </div>

                                                {/* Text Content */}
                                                <div className="flex-grow"> {/* Allow text to take available space */}
                                                    <p className="font-semibold text-base mb-1 line-clamp-2 group-hover:text-primary transition-colors"> {/* Truncate long names, change color on hover */}
                                                        {dataSink.data_sink_name}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground uppercase">
                                                        {dataSink.data_sink_metadata.type || 'Unknown Type'}
                                                    </p>
                                                </div>

                                                {/* Optional: Interaction hint */}
                                                <div className="mt-auto pt-2 w-full text-right opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                    <span className="text-xs text-primary font-medium">View &rarr;</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="absolute left-[-50px] top-1/2 -translate-y-1/2 hidden sm:flex" />
                        <CarouselNext className="absolute right-[-50px] top-1/2 -translate-y-1/2 hidden sm:flex" />
                    </Carousel>
                ) : (
                    <EmptyBox message='No data sources configured.' />
                )}
            </div>
        </div>
    )
}