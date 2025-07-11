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

const formSchema = z.object({
    data_sink_name: z.string().min(1, "Name is required"),
    data_sink_metadata: z.string().min(2, "Metadata (JSON) is required"),
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
            data_sink_metadata: "{}",
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
        let metadataObj;
        try {
            metadataObj = JSON.parse(values.data_sink_metadata);
        } catch (e) {
            toast.error("Metadata must be valid JSON");
            return;
        }
        const body = {
            data_sink_name: values.data_sink_name,
            site_id: siteId,
            project_id: projectId,
            data_sink_metadata: metadataObj,
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
                    <label className="block font-medium mb-1">Metadata (JSON)</label>
                    <Textarea {...form.register("data_sink_metadata")} rows={6} placeholder='{"type": "minio", "endpoint": "..."}' />
                    <p className="text-xs text-gray-500 mt-1">Enter additional configuration as JSON.</p>
                </div>
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