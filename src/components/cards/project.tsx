import * as React from "react"
import Link from "next/link"
import { formatDistance } from 'date-fns'
import { View } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"

import { Project } from "@/types/projects"

export type ProjectCardProps = {
    project: Project
    showActions?: boolean 
}

export default function ProjectCard({ project }: ProjectCardProps) {
    const { project_id, project_name, project_metadata } = project

    const description = project_metadata.description || null

    const created_at = project_metadata.created_at
        ? new Date(project_metadata.created_at).toISOString()
        : null;
    const formattedCreatedAt = created_at
        ? new Date(created_at).toLocaleDateString()
        : null;

    const createdAtDistance = created_at
        ? formatDistance(new Date(created_at), new Date(), { addSuffix: true })
        : null;

    return (
        <Card className="w-[320px] bg-white dark:bg-slate-800/70 shadow-sm border border-gray-200 dark:border-emerald-900/30 transition-all hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-800">
            <CardHeader className="pb-1">
                <CardTitle className="text-xl font-medium truncate" title={project_name}>{project_name}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                    Project ID: {project_id}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                <div>
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">Description</Label>
                    {description ? (
                        <p className="mt-1 text-sm truncate overflow-hidden text-ellipsis max-w-4/5">{description}</p>
                    ) : (
                        <p className="mt-1 text-sm italic">No description available</p>
                    )}
                </div>
                <div>
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">Created</Label>
                    <p className="mt-1 text-sm flex items-center whitespace-nowrap overflow-hidden">
                        <span className="truncate">{formattedCreatedAt}</span>
                        {createdAtDistance && (
                            <span className="ml-2 text-xs text-muted-foreground shrink-0">
                                ({createdAtDistance})
                            </span>
                        )}
                    </p>
                </div>
            </CardContent>
            <CardFooter className="pt-2 border-t text-sm text-muted-foreground dark:border-emerald-900/30">
                <Button asChild variant="link" className="text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300">
                    <Link href={`/projects/${project_id}`}>
                    <View className="h-4 w-4" />
                        View Project
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    )
}
