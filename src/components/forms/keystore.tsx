"use client"
import * as React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Eye, EyeOff, Copy } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const keystoreSchema = z.object({
    keystore_name: z.string().min(1, "Keystore name is required"),
    key_value: z.string().optional(),
    key_type: z.string().min(1, "Key type is required"),
    project_id: z.string().min(1, "Project ID is required"),
    key_metadata: z.string().optional(),
    minio_access_key: z.string().optional(),
    minio_secret_key: z.string().optional(),
}).superRefine((data, ctx) => {
    if (data.key_type === "minio") {
        if (!data.minio_access_key || data.minio_access_key.length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["minio_access_key"],
                message: "MinIO Access Key is required",
            });
        }
        if (!data.minio_secret_key || data.minio_secret_key.length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["minio_secret_key"],
                message: "MinIO Secret Key is required",
            });
        }
    } else {
        if (!data.key_value || data.key_value.length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["key_value"],
                message: "Secret value is required",
            });
        }
    }
});

export type KeystoreFormSchema = z.infer<typeof keystoreSchema>;

export interface KeystoreFormProps {
    project_id: string;
    keystore_name?: string;
    key_type?: string;
    key_value?: string; // Add key_value prop
    key_metadata?: string;
    minio_access_key?: string;
    minio_secret_key?: string;
}

const KEY_TYPES = [
    { value: "redcap", label: "REDCap API Token" },
    { value: "xnat", label: "XNAT API Token" },
    { value: "mindlamp", label: "MindLAMP API Key" },
    { value: "minio", label: "MinIO Credentials" },
    { value: "sharepoint", label: "SharePoint Credentials" },
    { value: "cantab", label: "CANTAB Credentials" },
    { value: "generic", label: "Generic Secret" },
];

export default function KeystoreForm({
    project_id,
    keystore_name,
    key_type,
    key_value, // Destructure key_value
    key_metadata,
    minio_access_key,
    minio_secret_key,
}: KeystoreFormProps) {
    const [loading, setLoading] = React.useState(false);
    const [showSecret, setShowSecret] = React.useState(false);
    const [editMode, setEditMode] = React.useState(false);
    const [selectedKeyType, setSelectedKeyType] = React.useState(key_type || "");

    const form = useForm<KeystoreFormSchema>({
        resolver: zodResolver(keystoreSchema),
        defaultValues: {
            keystore_name: keystore_name || "",
            key_value: key_value || "", // Initialize with key_value
            key_type: key_type || "",
            project_id: project_id,
            key_metadata: key_metadata || "",
            minio_access_key: minio_access_key || "",
            minio_secret_key: minio_secret_key || "",
        },
    });

    React.useEffect(() => {
        if (keystore_name) {
            setEditMode(true);
            // If in edit mode and key_type is minio, parse key_value for minio_access_key and minio_secret_key
            if (key_type === "minio" && key_value) {
                try {
                    const parsedKeyValue = JSON.parse(key_value);
                    form.setValue("minio_access_key", parsedKeyValue.access_key || "");
                    form.setValue("minio_secret_key", parsedKeyValue.secret_key || "");
                } catch (e) {
                    console.error("Error parsing MinIO key_value:", e);
                    toast.error("Error parsing MinIO credentials");
                }
            }
        }
    }, [keystore_name, key_type, key_value, form]);

    const handleCopySecret = async () => {
        const secretValue = form.getValues("key_value");
        if (!navigator.clipboard) {
            console.error("Clipboard API not available");
            toast.error("Clipboard access requires a secure connection (HTTPS)");
            return;
        }
        try {
            await navigator.clipboard.writeText(secretValue);
            toast.success("Secret copied to clipboard!");
        } catch (err) {
            console.error("Failed to copy secret: ", err);
            toast.error("Failed to copy secret");
        }
    };

    async function onSubmit(values: KeystoreFormSchema) {
        setLoading(true);
        try {
            let body: any;
            let url: string;
            let method: string;

            if (values.key_type === "minio") {
                // For MinIO, the key_value is a JSON string of access_key and secret_key
                body = {
                    keystore_name: values.keystore_name,
                    key_value: JSON.stringify({
                        access_key: values.minio_access_key,
                        secret_key: values.minio_secret_key,
                        ...(values.key_metadata ? JSON.parse(values.key_metadata) : {})
                    }),
                    key_type: values.key_type,
                    project_id: values.project_id,
                    key_metadata: values.key_metadata ? JSON.parse(values.key_metadata) : {},
                };
                const url = editMode
                    ? `/api/v1/keystore/${encodeURIComponent(values.keystore_name)}`
                    : `/api/v1/keystore`;
                const method = editMode ? "PUT" : "POST";

                const response = await fetch(url, {
                    method,
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(body),
                });
                let errorData: any = {};
                if (!response.ok) {
                    const text = await response.text();
                    try {
                        errorData = text ? JSON.parse(text) : {};
                    } catch {
                        errorData = { error: text };
                    }
                    if (response.status === 400 && errorData.error && errorData.error.includes('Missing required fields')) {
                        toast.error('Missing required fields for MinIO entry. Please fill all required fields.');
                    } else {
                        toast.error("Error saving MinIO keystore entry", {
                            description: errorData.error || response.statusText
                        });
                    }
                    setLoading(false);
                    return;
                }
                toast.success(
                    editMode
                        ? "MinIO keystore entry updated successfully"
                        : "MinIO keystore entry created successfully"
                );
                window.location.href = `/config/projects/${values.project_id}`;

            } else {
                // Default: single entry (non-MinIO)
                body = {
                    keystore_name: values.keystore_name,
                    key_value: values.key_value,
                    key_type: values.key_type,
                    project_id: values.project_id,
                    key_metadata: values.key_metadata ? JSON.parse(values.key_metadata) : {},
                };
                const url = editMode
                    ? `/api/v1/keystore/${encodeURIComponent(values.keystore_name)}`
                    : `/api/v1/keystore`;
                const method = editMode ? "PUT" : "POST";

                const response = await fetch(url, {
                    method,
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(body),
                });
                if (!response.ok) {
                    let errorData: any = {};
                    const text = await response.text();
                    try {
                        errorData = text ? JSON.parse(text) : {};
                    } catch {
                        errorData = { error: text };
                    }
                    if (response.status === 400 && errorData.error && errorData.error.includes('Missing required fields')) {
                        toast.error('Missing required fields. Please fill all required fields.');
                    } else {
                        toast.error("Error saving keystore entry", {
                            description: errorData.error || response.statusText
                        });
                    }
                    return;
                }
                toast.success(
                    editMode
                        ? "Keystore entry updated successfully"
                        : "Keystore entry created successfully"
                );
                window.location.href = `/config/projects/${values.project_id}`;
            }
        } catch (error) {
            console.error("Error saving keystore entry", error);
            toast.error("Error saving keystore entry");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4 rounded-md border p-4 shadow-sm">
                    <h3 className="text-lg font-medium leading-6 text-foreground">
                        {editMode ? "Update Keystore Entry" : "Add Keystore Entry"}
                    </h3>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="keystore_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Keystore Name</FormLabel>
                                    <FormControl>
                                        <Input 
                                            placeholder="e.g., redcap_prod_token" 
                                            {...field}
                                            disabled={editMode}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        A unique name to identify this secret in the keystore.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="key_type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Key Type</FormLabel>
                                    <Select {...field} onValueChange={val => { field.onChange(val); setSelectedKeyType(val); }} value={selectedKeyType}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select key type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {KEY_TYPES.map(type => (
                                                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {/* For MinIO, show two fields for access and secret key */}
                        {selectedKeyType === "minio" ? (
                            <>
                                <FormField
                                    control={form.control}
                                    name="minio_access_key"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>MinIO Access Key</FormLabel>
                                            <FormControl>
                                                <Input placeholder="MinIO Access Key" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="minio_secret_key"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>MinIO Secret Key</FormLabel>
                                            <FormControl>
                                                <Input placeholder="MinIO Secret Key" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </>
                        ) : (
                            <FormField
                                control={form.control}
                                name="key_value"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Secret Value</FormLabel>
                                        <FormControl>
                                            <Input 
                                                type={showSecret ? "text" : "password"}
                                                placeholder="Enter secret value"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                        <FormField
                            control={form.control}
                            name="key_metadata"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Metadata (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder='{"description": "Production REDCap token", "created_by": "admin"}'
                                            {...field}
                                            rows={4}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Optional JSON metadata about this secret (description, tags, etc.).
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit" disabled={loading}>
                            {loading ? "Saving..." : (editMode ? "Update Entry" : "Create Entry")}
                        </Button>
                        <Button 
                            type="button" 
                            variant="secondary" 
                            onClick={() => window.history.back()}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </form>
        </Form>
    );
} 