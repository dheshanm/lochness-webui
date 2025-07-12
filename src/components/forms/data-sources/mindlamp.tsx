"use client"
import * as React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
    api_url: z.string().url("API URL must be a valid URL"),
    keystore_name: z.string().min(1, "Keystore name is required"),
    project_id: z.string().min(1, "Project ID is required"),
});

export type MindlampFormSchema = z.infer<typeof formSchema>;

export default function MindlampForm({ project_id, site_id, instance_name }: { project_id: string, site_id: string, instance_name: string | null }) {
    const form = useForm<MindlampFormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            api_url: "",
            keystore_name: "",
            project_id: project_id || "",
        },
    });

    async function onSubmit(values: MindlampFormSchema) {
        try {
            const body = {
                data_source_name: values.project_id, // Use project_id as instance name
                data_source_is_active: true,
                site_id: site_id,
                project_id: project_id,
                data_source_type: "mindlamp",
                data_source_metadata: {
                    api_url: values.api_url,
                    keystore_name: values.keystore_name,
                    project_id: values.project_id,
                },
            };
            const response = await fetch(`/api/v1/projects/${project_id}/sites/${site_id}/sources`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });
            if (!response.ok) {
                const errorData = await response.json();
                toast.error("Error creating MindLAMP data source", { description: errorData.error || response.statusText });
                return;
            }
            toast.success("MindLAMP data source created successfully");
            window.location.href = `/config/projects/${project_id}/sites/${site_id}/data-sources/mindlamp/${values.project_id}`;
        } catch (error) {
            toast.error("Error creating MindLAMP data source", { description: (error as Error).message });
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="api_url"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>API URL</FormLabel>
                            <FormControl>
                                <Input placeholder="https://api.mindlamp.com" {...field} />
                            </FormControl>
                            <FormDescription>
                                MindLAMP API URL.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="keystore_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Keystore Name</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., mindlamp_prod_key" {...field} />
                            </FormControl>
                            <FormDescription>
                                Enter the name of the secret as stored in the keystore.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="project_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Project ID</FormLabel>
                            <FormControl>
                                <Input placeholder="MindLAMP Project ID" {...field} />
                            </FormControl>
                            <FormDescription>
                                MindLAMP Project ID.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit">Create MindLAMP Data Source</Button>
            </form>
        </Form>
    );
} 