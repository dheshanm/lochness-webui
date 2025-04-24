"use client"
import * as React from 'react';
import { toast } from "sonner";

import SiteCard from '@/components/cards/site';
import EmptyBox from '@/components/placeholders/empty';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";

import { Site } from '@/types/sites';

export type SitesListProps = {
    project_id: string;
}

export default function SitesList(
    props: SitesListProps
) {
    const { project_id } = props;

    const [sites, setSites] = React.useState<Site[]>([])
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        const fetchSites = async () => {
            try {
                const response = await fetch(`/api/v1/projects/${project_id}/sites`)
                if (!response.ok) {
                    throw new Error('Failed to fetch sites')
                }
                const data = await response.json()
                setSites(data)
            } catch (error) {
                console.error(error)
                toast.error('Failed to fetch sites')
            } finally {
                setLoading(false)
            }
        }

        fetchSites()
    }, [project_id])

    return (
        <div className="flex justify-center items-center w-full">
            {loading ? (
                <EmptyBox message='Loading sites...' />
            ) : sites && sites.length > 0 ? (
            <Carousel className="w-full relative px-12">
                <CarouselContent className="-ml-1">
                {sites.map((site, index) => (
                    <CarouselItem key={index} className="basis-full sm:basis-1/2 md:basis-1/2 lg:basis-1/3">
                    <SiteCard site={site} />
                    </CarouselItem>
                ))}
                </CarouselContent>
                <CarouselPrevious className="bg-purple-100/70 hover:bg-purple-200/80 text-purple-800 -left-3 sm:left-0 h-8 w-8 sm:h-10 sm:w-10 backdrop-blur-sm" />
                <CarouselNext className="bg-purple-100/70 hover:bg-purple-200/80 text-purple-800 -right-3 sm:right-0 h-8 w-8 sm:h-10 sm:w-10 backdrop-blur-sm" />
            </Carousel>
            ) : (
                <EmptyBox message='No sites found' />
            )}
        </div>
    )

}
