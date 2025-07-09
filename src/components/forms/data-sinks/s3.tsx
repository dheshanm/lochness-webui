"use client"
import * as React from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner";
import Link from 'next/link'

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

import { DataSink } from '@/types/data-sinks'

const storageSchema = z.object({
    name: z.string().min(2).max(100),
    description: z.string().max(500).optional(),
    bucket: z
        .string()
        .min(3, "Bucket names must be at least 3 chars")
        .max(63, "Bucket names can be at most 63 chars"),
    prefix: z.string().max(256).optional(),  // replacing `path` with `prefix`
    tags: z.array(z.string()).optional(),
    //   format: z.enum(["json", "csv"]),
    //   compression: z.enum(["none", "gzip", "zip"]).default("none"),
});

const authSchema = z.object({
    accessKeyId: z.string().nonempty(),
    secretAccessKey: z.string().nonempty(),
});

const connectionSchema = z
    .object({
        provider: z.enum(["aws", "generic"]),
        endpoint: z.string().url().or(z.literal("")).optional(),        // for MinIO / DO Spaces / B2
        region: z.string().optional(),                // for AWS or AWS‐compatible regions
        port: z.coerce.number().int().min(1).max(65_535).optional(),
    })
    .refine(
        (d) =>
            // you must supply at least a region (for AWS) OR a custom endpoint (MinIO, generic)
            !!(d.region || d.endpoint),
        {
            message: "You must specify either a region (for AWS) or a custom endpoint",
            path: ["region", "endpoint"],
        }
    );

const S3ConfigSchema = z.object({
    storage: storageSchema,
    auth: authSchema,
    connection: connectionSchema,
});

export type S3ConfigFormSchema = z.infer<typeof S3ConfigSchema>;

export interface S3FormProps {
    site_id: string;
    project_id: string;
}

export default function S3Form(
    props: S3FormProps
) {
    const { site_id, project_id } = props;
    const [loading, setLoading] = React.useState(false);

    const form = useForm<S3ConfigFormSchema>({
        resolver: zodResolver(S3ConfigSchema),
        defaultValues: {
            storage: {
                name: undefined,
                description: undefined,
                bucket: undefined,
                prefix: undefined,
                tags: [],
            },
            auth: {
                accessKeyId: undefined,
                secretAccessKey: undefined,
            },
            connection: {
                provider: "aws",
                endpoint: undefined,
                region: undefined,
                port: undefined
            },
        },
    });

    async function onSubmit(data: S3ConfigFormSchema) {
        setLoading(true);
        try {
            // const response = await fetch(`/api/v1/projects/${project_id}/sites/${site_id}/sinks/s3`, {
            //     method: "POST",
            //     headers: {
            //         "Content-Type": "application/json",
            //     },
            //     body: JSON.stringify(data),
            // });

            // if (!response.ok) {
            //     throw new Error("Failed to create S3 data sink");
            // }

            // const result = await response.json();
            // toast.success("S3 data sink created successfully");

            console.log("S3 data sink:", data);

        } catch (error) {
            console.error(error);
            toast.error("Error creating S3 data sink");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="mx-auto max-w-3xl space-y-6">
            {/* <div className="text-center space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight">Create S3 Data Sink</h2>
                <p className="text-muted-foreground">Configure your S3-compatible storage destination</p>
            </div> */}

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4 rounded-xl border bg-card/50 p-6">
                        <div className="space-y-1">
                            <h3 className="font-medium">Basic Information</h3>
                            <p className="text-sm text-muted-foreground">Name and describe your data sink</p>
                        </div>

                        <div className="grid gap-4">
                            <FormField
                                control={form.control}
                                name="storage.name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="My S3 Data Sink"
                                                {...field}
                                                disabled={loading}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="storage.description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description <span className="text-muted-foreground">(optional)</span></FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Describe the purpose of this data sink..."
                                                {...field}
                                                disabled={loading}
                                                className="min-h-[80px] resize-none"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    {/* Connection Configuration */}
                    <div className="space-y-4 rounded-xl border bg-card/50 p-6">
                        <div className="space-y-1">
                            <h3 className="font-medium">Connection</h3>
                            <p className="text-sm text-muted-foreground">Configure your S3 service connection</p>
                        </div>
                        <div className="grid gap-4">
                            <FormField
                                control={form.control}
                                name="connection.provider"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Provider</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            disabled={loading}
                                        >
                                            <FormControl>
                                                <SelectTrigger className='w-full'>
                                                    <SelectValue placeholder="Select provider" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="aws">AWS S3</SelectItem>
                                                <SelectItem value="generic">S3-Compatible Storage</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="connection.forcePathStyle"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border bg-background/50 p-3">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-sm">Force Path Style</FormLabel>
                                                <FormDescription className="text-xs">
                                                    Required for MinIO and some providers.{" "}
                                                    <Link
                                                        href="https://docs.aws.amazon.com/AmazonS3/latest/userguide/VirtualHosting.html"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-primary hover:underline"
                                                    >
                                                        Learn more
                                                    </Link>
                                                </FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                    disabled={loading}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div> */}

                            {form.watch("connection.provider") === "aws" && (
                                <FormField
                                    control={form.control}
                                    name="connection.region"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Region</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="us-west-2"
                                                    {...field}
                                                    disabled={loading}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            {form.watch("connection.provider") === "generic" && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="connection.endpoint"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Custom Endpoint</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="https://s3.example.com"
                                                        {...field}
                                                        disabled={loading}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="connection.port"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Port <span className="text-muted-foreground">(optional)</span></FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        placeholder="443"
                                                        {...field}
                                                        disabled={loading}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Storage Configuration */}
                    <div className="space-y-4 rounded-xl border bg-card/50 p-6">
                        <div className="space-y-1">
                            <h3 className="font-medium">Storage</h3>
                            <p className="text-sm text-muted-foreground">Configure bucket and path settings</p>
                        </div>

                        <div className="grid gap-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-2">
                                    <FormField
                                        control={form.control}
                                        name="storage.bucket"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Bucket Name</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="my-data-bucket"
                                                        {...field}
                                                        disabled={loading}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="storage.prefix"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Prefix <span className="text-muted-foreground">(optional)</span></FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="data/exports/"
                                                    {...field}
                                                    disabled={loading}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="storage.tags"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tags <span className="text-muted-foreground">(optional)</span></FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="production, analytics, exports"
                                                {...field}
                                                disabled={loading}
                                            />
                                        </FormControl>
                                        <FormDescription className="text-xs">
                                            Comma-separated tags for organization
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    {/* Authentication */}
                    <div className="space-y-4 rounded-xl border bg-card/50 p-6">
                        <div className="space-y-1">
                            <h3 className="font-medium">Authentication</h3>
                            <p className="text-sm text-muted-foreground">Provide your access credentials</p>
                        </div>


                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="auth.accessKeyId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Access Key ID</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="AKIAIOSFODNN7EXAMPLE"
                                                {...field}
                                                disabled={loading}
                                                className="font-mono text-sm"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="auth.secretAccessKey"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Secret Access Key</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="••••••••••••••••••••"
                                                {...field}
                                                disabled={loading}
                                                className="font-mono text-sm"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end pt-2">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="min-w-[140px]"
                            size="lg"
                        >
                            {loading ? "Creating..." : "Create Data Sink"}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}