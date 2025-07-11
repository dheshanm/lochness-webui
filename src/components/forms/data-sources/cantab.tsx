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
    api_endpoint: z.string().url("API Endpoint must be a valid URL"),
});

export type CantabFormSchema = z.infer<typeof formSchema>;

export default function CantabForm({ project_id, site_id, instance_name }: { project_id: string, site_id: string, instance_name: string | null }) {
    const form = useForm<CantabFormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            keystore_name: "",
            api_endpoint: "",
        },
    });

    async function onSubmit(values: CantabFormSchema) {
        try {
            const body = {
                data_source_name: values.keystore_name, // Use keystore_name as instance name
                data_source_is_active: true,
                site_id: site_id,
                project_id: project_id,
                data_source_type: "cantab",
                data_source_metadata: {
                    keystore_name: values.keystore_name,
                    api_endpoint: values.api_endpoint,
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
                toast.error("Error creating CANTAB data source", { description: errorData.error || response.statusText });
                return;
            }
            toast.success("CANTAB data source created successfully");
            window.location.href = `/config/projects/${project_id}/sites/${site_id}/data-sources/cantab/${values.keystore_name}`;
        } catch (error) {
            toast.error("Error creating CANTAB data source", { description: (error as Error).message });
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
                                <Input placeholder="cantab_prod" {...field} />
                            </FormControl>
                            <FormDescription>
                                Name of the keystore entry for CANTAB credentials.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="api_endpoint"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>API Endpoint</FormLabel>
                            <FormControl>
                                <Input placeholder="https://app.cantab.com/api" {...field} />
                            </FormControl>
                            <FormDescription>
                                CANTAB API endpoint URL.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit">Create CANTAB Data Source</Button>
            </form>
        </Form>
    );
} 