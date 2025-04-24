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
import ProjectCard from "@/components/cards/project_v2"
import { SkeletonCard } from "@/components/placeholders/card"


export default function ProjectsList() {
    const [projects, setProjects] = React.useState<Project[]>([])
    const [loading, setLoading] = React.useState(true)

    const [projectsCount, setProjectsCount] = React.useState<number>(0)
    const [activeProjectsCount, setActiveProjectsCount] = React.useState<number>(0)

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
                    project_is_active: project.project_is_active,
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

    React.useEffect(() => {
        const totalProjects = projects.length
        const activeProjects = projects.filter((project) => project.project_is_active).length
        setProjectsCount(totalProjects)
        setActiveProjectsCount(activeProjects)
    }, [projects])

    return (
        <div className="space-y-6 min-w-[320px]">
            <div className="">
                <div className="flex justify-between items-center mb-5">
                    <h2 className="text-xl font-medium text-gray-800 dark:text-emerald-50 flex items-center gap-2">
                        <FolderOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        Active Projects V2
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

                <div className="flex justify-center items-center w-full">
                    {projects && projects.length > 0 ? (
                        <Carousel className="w-full relative px-12">
                            <CarouselContent className="-ml-1">
                                {projects.map((project, index) => (
                                    <CarouselItem key={index} className="basis-full sm:basis-1/2 md:basis-1/2 lg:basis-1/3">
                                        <ProjectCard project={project} />
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious className="bg-emerald-100/70 hover:bg-emerald-200/80 text-emerald-800 -left-3 sm:left-0 h-8 w-8 sm:h-10 sm:w-10 backdrop-blur-sm" />
                            <CarouselNext className="bg-emerald-100/70 hover:bg-emerald-200/80 text-emerald-800 -right-3 sm:right-0 h-8 w-8 sm:h-10 sm:w-10 backdrop-blur-sm" />
                        </Carousel>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-[240px] w-full rounded-lg border border-dashed border-gray-300/70 dark:border-gray-700/50 bg-gray-50/50 dark:bg-slate-800/30">
                            <p className="text-gray-500 dark:text-gray-400 mb-2">No Projects found</p>
                        </div>
                    )}
                </div>

                <div className="mt-6">
                    {loading ? (
                        <Skeleton className="h-4 w-32 bg-gray-200 dark:bg-gray-700" />
                    ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Found {activeProjectsCount} (of {projectsCount}) active project.
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}