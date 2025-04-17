"use client"
import * as React from 'react'
import Link from 'next/link'
import { toast } from "sonner";

import { GalleryHorizontal, Plus, FolderOpen } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import { Skeleton } from "@/components/ui/skeleton"

import { Project } from "@/types/projects"
import ProjectCard from "@/components/cards/project"
import { SkeletonCard } from "@/components/placeholders/card"


export default function ProjectsList() {
    const [projects, setProjects] = React.useState<Project[]>([])
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await fetch('/api/v1/projects?limit=100&offset=0')
                if (!response.ok) {
                    throw new Error('Failed to fetch projects')
                }
                const data = await response.json()
                const projects = data.rows.map((project: Project) => ({
                    project_id: project.project_id,
                    project_name: project.project_name,
                    project_metadata: {
                        ...project.project_metadata,
                        // Ensure created_at is properly formatted if it exists
                        ...(project.project_metadata.created_at && {
                            created_at: new Date(project.project_metadata.created_at).toISOString()
                        })
                    }
                }))
                setProjects(projects)
            } catch (error) {
                console.error(error)
                toast.error('Failed to fetch projects')
            } finally {
                setLoading(false)
            }
        }

        fetchProjects()
    }, [])

    return (
        <div className="space-y-6 min-w-[320px]">
            <div className="bg-gray-50/80 dark:bg-slate-800/60 rounded-xl shadow-sm p-6 transition-all border border-gray-200/80 dark:border-emerald-900/20 backdrop-blur-sm">
                <div className="flex justify-between items-center mb-5">
                    <h2 className="text-xl font-medium text-gray-800 dark:text-emerald-50 flex items-center gap-2">
                        <FolderOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        Active Projects
                    </h2>

                    <div className="flex space-x-2">
                        <Button asChild variant="ghost" size="sm" className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/30">
                            <Link href="/config/projects">
                                <GalleryHorizontal className="h-4 w-4" />
                                <span className="hidden sm:inline">View All</span>
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm" className="flex items-center gap-2 border-emerald-200 dark:border-emerald-800/70 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/50">
                            <Link href="/config/projects/new">
                                <Plus className="h-4 w-4" />
                                <span className="hidden sm:inline">New Project</span>
                            </Link>
                        </Button>
                    </div>
                </div>

                <Carousel className="w-full">
                    <CarouselContent className="-ml-2 md:-ml-4">
                        {projects.length > 0 ? (
                            projects.map((project) => (
                                <CarouselItem key={project.project_id} className="basis-full sm:basis-1/2 md:basis-1/3 pl-2 md:pl-4">
                                    <div className="h-full flex items-center justify-center p-1">
                                        <ProjectCard project={project} />
                                    </div>
                                </CarouselItem>
                            ))
                        ) : loading ? (
                            Array(3).fill(0).map((_, i) => (
                                <CarouselItem key={`skeleton-${i}`} className="basis-full sm:basis-1/2 md:basis-1/3 pl-2 md:pl-4">
                                    <div className="h-full flex items-center justify-center p-1">
                                        <SkeletonCard />
                                    </div>
                                </CarouselItem>
                            ))
                        ) : (
                            <CarouselItem className="pl-2 md:pl-4 basis-full">
                                <div className="flex flex-col items-center justify-center h-[240px] rounded-lg border border-dashed border-gray-300/70 dark:border-gray-700/50 bg-gray-50/50 dark:bg-slate-800/30">
                                    <p className="text-gray-500 dark:text-gray-400 mb-2">No projects found</p>
                                    <Button asChild variant="outline" size="sm" className="mt-2">
                                        <Link href="/config/projects/new">
                                            <Plus className="h-4 w-4 mr-1" />
                                            Create Project
                                        </Link>
                                    </Button>
                                </div>
                            </CarouselItem>
                        )}
                    </CarouselContent>

                    {projects.length > 1 && (
                        <>
                            <CarouselPrevious className="left-1 shadow-sm opacity-70 hover:opacity-100" />
                            <CarouselNext className="right-1 shadow-sm opacity-70 hover:opacity-100" />
                        </>
                    )}
                </Carousel>

                <div className="mt-6">
                    {loading ? (
                        <Skeleton className="h-4 w-32 bg-gray-200 dark:bg-gray-700" />
                    ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Found {projects.length} active projects.
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}