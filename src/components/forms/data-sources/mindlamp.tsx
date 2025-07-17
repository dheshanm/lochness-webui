"use client"
import * as React from 'react';
import { useEffect, useState } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = z.object({
    keystore_name: z.string().min(1, "Keystore Name is required"),
});

export type MindlampFormSchema = z.infer<typeof formSchema>;

export default function MindlampForm({ project_id, site_id, instance_name }: { project_id: string, site_id: string, instance_name: string | null }) {
    const [keystoreOptions, setKeystoreOptions] = useState<string[]>([]);
    const form = useForm<MindlampFormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            keystore_name: "",
        },
    });

    useEffect(() => {
        // Fetch available mindlamp keystore entries for this project
        async function fetchKeystoreOptions() {
            try {
                const res = await fetch(`/api/v1/keystore?project_id=${project_id}&key_type=mindlamp`);
                if (res.ok) {
                    const data = await res.json();
                    setKeystoreOptions(data.keystore_names || []);
                } else {
                    setKeystoreOptions([]);
                }
            } catch {
                setKeystoreOptions([]);
            }
        }
        fetchKeystoreOptions();
    }, [project_id]);

    async function onSubmit(values: MindlampFormSchema) {
        try {
            const body = {
                data_source_name: values.keystore_name, // Use keystore_name as instance name
                data_source_is_active: true,
                site_id: site_id,
                project_id: project_id,
                data_source_type: "mindlamp",
                data_source_metadata: {
                    keystore_name: values.keystore_name,
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
            window.location.href = `/config/projects/${project_id}/sites/${site_id}/data-sources/mindlamp/${values.keystore_name}`;
        } catch (error) {
            toast.error("Error creating MindLAMP data source", { description: (error as Error).message });
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
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select MindLAMP keystore entry" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {keystoreOptions.map((name) => (
                                            <SelectItem key={name} value={name}>{name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormDescription>
                                Select the keystore entry containing MindLAMP credentials for this project.
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