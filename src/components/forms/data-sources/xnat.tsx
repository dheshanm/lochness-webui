"use client"
import * as React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
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
    api_token: z.string().min(1, "API Token is required"),
    endpoint_url: z.string().url("Endpoint URL must be a valid URL"),
    subject_id_variable: z.string().min(1, "Subject ID Variable is required"),
    optional_variables_dictionary: z.array(z.object({ variable_name: z.string().min(1) })).optional(),
});

export type XnatFormSchema = z.infer<typeof formSchema>;

export default function XnatForm({ project_id, site_id, instance_name }: { project_id: string, site_id: string, instance_name: string | null }) {
    const form = useForm<XnatFormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            api_token: "",
            endpoint_url: "",
            subject_id_variable: "",
            optional_variables_dictionary: [],
        },
    });
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "optional_variables_dictionary",
    });

    async function onSubmit(values: XnatFormSchema) {
        try {
            const body = {
                data_source_name: values.subject_id_variable, // Use subject_id_variable as instance name (or choose a better unique field if needed)
                data_source_is_active: true,
                site_id: site_id,
                project_id: project_id,
                data_source_type: "xnat",
                data_source_metadata: {
                    api_token: values.api_token,
                    endpoint_url: values.endpoint_url,
                    subject_id_variable: values.subject_id_variable,
                    optional_variables_dictionary: values.optional_variables_dictionary || [],
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
                toast.error("Error creating XNAT data source", { description: errorData.error || response.statusText });
                return;
            }
            toast.success("XNAT data source created successfully");
            window.location.href = `/config/projects/${project_id}/sites/${site_id}/data-sources/xnat/${values.subject_id_variable}`;
        } catch (error) {
            toast.error("Error creating XNAT data source", { description: (error as Error).message });
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="api_token"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>API Token</FormLabel>
                            <FormControl>
                                <Input placeholder="XNAT API token" {...field} />
                            </FormControl>
                            <FormDescription>
                                XNAT API token for authentication.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="endpoint_url"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Endpoint URL</FormLabel>
                            <FormControl>
                                <Input placeholder="https://xnat.example.com" {...field} />
                            </FormControl>
                            <FormDescription>
                                XNAT server endpoint URL.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="subject_id_variable"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Subject ID Variable</FormLabel>
                            <FormControl>
                                <Input placeholder="subject_id" {...field} />
                            </FormControl>
                            <FormDescription>
                                Variable name for subject ID in XNAT.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div>
                    <label className="block font-medium mb-2">Optional Variables</label>
                    {fields.map((item, index) => (
                        <div key={item.id} className="flex gap-2 mb-2">
                            <Input {...form.register(`optional_variables_dictionary.${index}.variable_name` as const)} placeholder="Variable Name" />
                            <Button type="button" variant="destructive" onClick={() => remove(index)}>Remove</Button>
                        </div>
                    ))}
                    <Button type="button" variant="secondary" onClick={() => append({ variable_name: "" })}>Add Variable</Button>
                </div>
                <Button type="submit">Create XNAT Data Source</Button>
            </form>
        </Form>
    );
} 