"use client"
import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = z.object({
    data_sink_name: z.string().min(1, "Name is required"),
    sink_type: z.string().min(1, "Sink type is required"),
    keystore_name: z.string().min(1, "Keystore name is required"),
    endpoint: z.string().optional(),
    bucket: z.string().optional(),
    // Add more fields as needed for other sink types
});

type FormSchema = z.infer<typeof formSchema>;

type Params = Promise<{ project_id: string, site_id: string }>;

export default function AddDataSinkPage({ params }: { params: Params }) {
    const [projectId, setProjectId] = React.useState<string | null>(null);
    const [siteId, setSiteId] = React.useState<string | null>(null);
    const form = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            data_sink_name: "",
            sink_type: "minio",
            keystore_name: "",
            endpoint: "",
            bucket: "",
        },
    });

    React.useEffect(() => {
        params.then(({ project_id, site_id }) => {
            setProjectId(project_id);
            setSiteId(site_id);
        });
    }, [params]);

    async function onSubmit(values: FormSchema) {
        if (!projectId || !siteId) return;
        // Build metadata based on sink type
        let data_sink_metadata: Record<string, any> = { keystore_name: values.keystore_name };
        if (values.sink_type === "minio") {
            data_sink_metadata.endpoint = values.endpoint;
            data_sink_metadata.bucket = values.bucket;
        }
        // Add more sink types as needed
        const body = {
            data_sink_name: values.data_sink_name,
            site_id: siteId,
            project_id: projectId,
            data_sink_metadata,
        };
        try {
            const response = await fetch(`/api/v1/projects/${projectId}/sites/${siteId}/sinks`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            if (!response.ok) {
                const errorData = await response.json();
                toast.error("Error creating data sink", { description: errorData.error || response.statusText });
                return;
            }
            toast.success("Data sink created successfully");
            window.location.href = `/config/projects/${projectId}/sites/${siteId}`;
        } catch (error) {
            toast.error("Error creating data sink", { description: (error as Error).message });
        }
    }

    return (
        <div className="container mx-auto p-6 max-w-2xl flex flex-col h-full">
            <h1 className="text-2xl font-semibold mb-4">Add Data Sink</h1>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div>
                    <label className="block font-medium mb-1">Name</label>
                    <Input {...form.register("data_sink_name")} placeholder="e.g., minio_sink" />
                </div>
                <div>
                    <label className="block font-medium mb-1">Sink Type</label>
                    <Select {...form.register("sink_type")} onValueChange={val => form.setValue("sink_type", val)} defaultValue={form.getValues("sink_type") || "minio"}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select sink type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="minio">MinIO</SelectItem>
                            <SelectItem value="sharepoint">SharePoint</SelectItem>
                            {/* Add more sink types as needed */}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <label className="block font-medium mb-1">Keystore Name</label>
                    <Input {...form.register("keystore_name")} placeholder="e.g., minio_prod_creds" />
                    <p className="text-xs text-gray-500 mt-1">Reference a secret stored in the keystore.</p>
                </div>
                {/* MinIO fields */}
                {form.watch("sink_type") === "minio" && (
                    <>
                        <div>
                            <label className="block font-medium mb-1">Endpoint</label>
                            <Input {...form.register("endpoint")} placeholder="e.g., https://minio.example.com" />
                        </div>
                        <div>
                            <label className="block font-medium mb-1">Bucket</label>
                            <Input {...form.register("bucket")} placeholder="e.g., my-bucket" />
                        </div>
                    </>
                )}
                {/* Add more sink type fields as needed */}
                <div className="flex gap-2">
                    <Button type="submit">Create Data Sink</Button>
                    <Button type="button" variant="secondary" asChild>
                        <Link href={projectId && siteId ? `/config/projects/${projectId}/sites/${siteId}` : "#"}>Cancel</Link>
                    </Button>
                </div>
            </form>
        </div>
    );
} 