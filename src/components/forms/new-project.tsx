"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner";

import { Plus, Eraser } from "lucide-react"

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
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"

const formSchema = z.object({
    project_id: z.string()
        .min(1, "Project ID is required")
        .regex(/^[a-zA-Z0-9_-]+$/, "Project ID must contain only letters, numbers, underscores, and hyphens"),
    project_name: z.string().min(1, "Project Name is required"),
    project_description: z.string()
        .max(500, "Project Description must be less than 500 characters")
        .optional()
})

export type FormSchema = z.infer<typeof formSchema>

export default function NewProjectForm() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            project_id: "",
            project_name: "",
            project_description: ""
        }
    })

    function handleFormSubmit(values: z.infer<typeof formSchema>) {
        const formData = {
            ...values,
        }

        const body = {
            project_id: formData.project_id,
            project_name: formData.project_name,
            project_metadata: {
                description: formData.project_description,
                created_at: new Date().toISOString(),
            }
        }

        fetch(`/api/v1/projects`, {
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
                toast.success("Added Project successfully");
            })
            .catch((error) => {
                toast.error("Failed to add project");
                console.error("Error:", error);
            });
    }

    return (
        <div className="container mx-auto p-6 max-w-2xl">
            <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
                <div className="border rounded-lg p-6 bg-slate-50 dark:bg-slate-900 shadow-sm">
                {/* <h2 className="text-xl font-semibold mb-6 text-slate-800 dark:text-slate-200 border-b pb-3 border-slate-200 dark:border-slate-700 flex items-center gap-2"><Plus className="w-5 h-5" /> Create New Project</h2> */}
                
                <div className="space-y-6">
                    <FormField
                    control={form.control}
                    name="project_id"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="font-medium">Project ID</FormLabel>
                        <FormControl>
                            <Input placeholder="Enter project ID" {...field} className="bg-white dark:bg-slate-800" />
                        </FormControl>
                        <FormDescription className="text-xs">
                            A unique identifier for the project (e.g., PRESCIENT, ProNET)
                        </FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                    />

                    <FormField
                    control={form.control}
                    name="project_name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="font-medium">Project Name</FormLabel>
                        <FormControl>
                            <Input placeholder="Enter project name" {...field} className="bg-white dark:bg-slate-800" />
                        </FormControl>
                        <FormDescription className="text-xs">
                            A descriptive name for your project
                        </FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    
                    <FormField
                    control={form.control}
                    name="project_description"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="font-medium">Project Description</FormLabel>
                        <FormControl>
                            <Textarea placeholder="Enter project description (Optional)" {...field} className="bg-white dark:bg-slate-800 h-32" />
                        </FormControl>
                        <FormDescription className="text-xs">
                            A brief description of the project (max 500 characters)
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
                    <Plus /> Create Project
                </Button>
                </div>
            </form>
            </Form>
        </div>
    )
}