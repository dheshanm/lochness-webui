"use client"
import * as React from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner";

import { Plus, Eraser, Pencil } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"

import { Site } from '@/types/sites'

const newProjectSiteFormSchemaSchema = z.object({
    project_id: z.string()
        .min(1, "Project ID is required")
        .regex(/^[a-zA-Z0-9_-]+$/, "Project ID must contain only letters, numbers, underscores, and hyphens"),
    site_id: z.string()
        .min(1, "Site ID is required")
        .regex(/^[a-zA-Z0-9_-]+$/, "Site ID must contain only letters, numbers, underscores, and hyphens"),
    site_name: z.string().min(1, "Site Name is required"),
    site_is_active: z.boolean(),
    site_description: z.string()
        .max(500, "Site Description must be less than 500 characters")
})

export type NewProjectSiteFormSchema = z.infer<typeof newProjectSiteFormSchemaSchema>

export type SiteFormProps = {
    project_id: string,
    site_id: string | null
}

export default function SiteForm({
    project_id,
    site_id
}: SiteFormProps) {

    const [site, setSite] = React.useState<Site | null>(null)

    const form = useForm<z.infer<typeof newProjectSiteFormSchemaSchema>>({
        resolver: zodResolver(newProjectSiteFormSchemaSchema),
        defaultValues: {
            project_id: project_id,
            site_id: "",
            site_name: "",
            site_is_active: true,
            site_description: ""
        }
    })

    React.useEffect(() => {
        const fetchSite = async () => {
            try {
                const response = await fetch(`/api/v1/projects/${project_id}/sites/${site_id}`)
                if (!response.ok) {
                    throw new Error("Network response was not ok")
                }
                const data = await response.json()
                setSite(data)
            } catch (error) {
                console.error("Error fetching site:", error)
            }
        }

        if (site_id) {
            fetchSite()
        }
    }, [site_id, project_id])

    React.useEffect(() => {
        if (site) {
            form.reset({
                project_id: project_id,
                site_id: site.site_id,
                site_name: site.site_name,
                site_is_active: site.site_is_active,
                site_description: site.site_metadata.description,
            })
        }
    }, [site, form, project_id])


    function handleFormSubmit(values: z.infer<typeof newProjectSiteFormSchemaSchema>) {
        const formData = {
            ...values,
        }

        const body = {
            project_id: project_id,
            site_id: formData.site_id,
            site_name: formData.site_name,
            site_is_active: formData.site_is_active,
            site_metadata: {
                description: formData.site_description,
                created_at: new Date().toISOString(),
            }
        }

        if (site) {
            body.site_metadata.created_at = site?.site_metadata.created_at
        }

        fetch(`/api/v1/projects/${project_id}/sites`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then(() => {
                if (site) {
                    toast.success("Site updated successfully");
                } else {
                    toast.success("Site created successfully");
                }
                // Navigate to Site Page
                window.location.href = `/config/projects/${project_id}/sites/${formData.site_id}`;
            })
            .catch((error) => {
                if (site) {
                    toast.error("Failed to update site");
                } else {
                    toast.error("Failed to create site");
                }
                console.error("Error:", error);
            });
    }

    return (
        <div className="container mx-auto p-6 max-w-2xl">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
                    <div className="sm:border sm:rounded-lg sm:p-6 sm:bg-slate-50 sm:dark:bg-slate-900 sm:shadow-sm">
                        {/* <h2 className="text-xl font-semibold mb-6 text-slate-800 dark:text-slate-200 border-b pb-3 border-slate-200 dark:border-slate-700 flex items-center gap-2"><Plus className="w-5 h-5" /> Create New Project</h2> */}

                        <div className="space-y-6">
                            <FormField
                                control={form.control}
                                name="project_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-medium">Project ID</FormLabel>
                                        <FormControl>
                                            <Input disabled placeholder="Enter Project ID" {...field} className="bg-white dark:bg-slate-800" />
                                        </FormControl>
                                        <FormDescription className="text-xs">
                                            Project to add this site to.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="site_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-medium">Site ID</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter Site ID" {...field} className="bg-white dark:bg-slate-800" />
                                        </FormControl>
                                        <FormDescription className="text-xs">
                                            A unique identifier for the Site (e.g., ME, LA)
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="site_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-medium">Site Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter site name" {...field} className="bg-white dark:bg-slate-800" />
                                        </FormControl>
                                        <FormDescription className="text-xs">
                                            A descriptive name for your site
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="site_is_active"
                                render={({ field }) => (
                                    <FormItem className="flex items-center space-x-2">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                className="h-4 w-4"
                                            />
                                        </FormControl>
                                        <FormLabel className="font-medium">Is Active</FormLabel>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="site_description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-medium">Site Description</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Enter site description (Optional)" {...field} className="bg-white dark:bg-slate-800 h-32" />
                                        </FormControl>
                                        <FormDescription className="text-xs">
                                            A brief description of the site (max 500 characters)
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 items-center justify-end">
                        <Button type="button" variant="outline" onClick={() => form.reset()}>
                            <Eraser /> Reset
                        </Button>
                        <Button type="submit" variant="default" className="px-8">
                            {site ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                            {site ? "Update Site" : "Create Site"}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}