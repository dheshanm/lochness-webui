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
    keystore_name: z.string().min(1, "Keystore Name is required"),
    site_url: z.string().url("Site URL must be a valid URL"),
    form_id: z.string().min(1, "Form ID is required"),
});

export type SharepointFormSchema = z.infer<typeof formSchema>;

export default function SharepointForm({ project_id, site_id, instance_name }: { project_id: string, site_id: string, instance_name: string | null }) {
    const form = useForm<SharepointFormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            keystore_name: "",
            site_url: "",
            form_id: "",
        },
    });

    async function onSubmit(values: SharepointFormSchema) {
        try {
            const body = {
                data_source_name: values.keystore_name, // Use keystore_name as instance name
                data_source_is_active: true,
                site_id: site_id,
                project_id: project_id,
                data_source_type: "sharepoint",
                data_source_metadata: {
                    keystore_name: values.keystore_name,
                    site_url: values.site_url,
                    form_id: values.form_id,
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
                toast.error("Error creating SharePoint data source", { description: errorData.error || response.statusText });
                return;
            }
            toast.success("SharePoint data source created successfully");
            // Redirect to the details page for the new data source
            window.location.href = `/config/projects/${project_id}/sites/${site_id}/data-sources/sharepoint/${values.keystore_name}`;
        } catch (error) {
            toast.error("Error creating SharePoint data source", { description: (error as Error).message });
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="keystore_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Keystore Name</FormLabel>
                            <FormControl>
                                <Input placeholder="sharepoint_prod" {...field} />
                            </FormControl>
                            <FormDescription>
                                Name of the keystore entry for SharePoint credentials.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="site_url"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Site URL</FormLabel>
                            <FormControl>
                                <Input placeholder="https://yourcompany.sharepoint.com/sites/YourSite" {...field} />
                            </FormControl>
                            <FormDescription>
                                URL of the SharePoint site.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="form_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Form ID</FormLabel>
                            <FormControl>
                                <Input placeholder="GUID of the SharePoint List (form) ID" {...field} />
                            </FormControl>
                            <FormDescription>
                                GUID of the SharePoint List (form) ID.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit">Create SharePoint Data Source</Button>
            </form>
        </Form>
    );
} 