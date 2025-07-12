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
    key_value: z.string().min(1, "Secret value is required"),
    key_type: z.string().min(1, "Key type is required"),
    project_id: z.string().min(1, "Project ID is required"),
    key_metadata: z.string().optional(),
});

export type KeystoreFormSchema = z.infer<typeof keystoreSchema>;

export interface KeystoreFormProps {
    project_id: string;
    keystore_name?: string;
    key_type?: string;
    key_metadata?: string;
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
    key_metadata,
}: KeystoreFormProps) {
    const [loading, setLoading] = React.useState(false);
    const [showSecret, setShowSecret] = React.useState(false);
    const [editMode, setEditMode] = React.useState(false);

    const form = useForm<KeystoreFormSchema>({
        resolver: zodResolver(keystoreSchema),
        defaultValues: {
            keystore_name: keystore_name || "",
            key_value: "",
            key_type: key_type || "",
            project_id: project_id,
            key_metadata: key_metadata || "",
        },
    });

    React.useEffect(() => {
        if (keystore_name) {
            setEditMode(true);
        }
    }, [keystore_name]);

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
            const body = {
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
                const errorData = await response.json();
                toast.error("Error saving keystore entry", { 
                    description: errorData.error || response.statusText 
                });
                return;
            }

            toast.success(
                editMode 
                    ? "Keystore entry updated successfully" 
                    : "Keystore entry created successfully"
            );

            // Redirect back to the project page
            window.location.href = `/config/projects/${project_id}`;
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
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select key type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {KEY_TYPES.map((type) => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    {type.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        The type of secret being stored.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="key_value"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Secret Value</FormLabel>
                                <div className="relative">
                                    <FormControl>
                                        <Input
                                            type={showSecret ? "text" : "password"}
                                            placeholder="Enter the secret value"
                                            {...field}
                                            className="pr-20"
                                        />
                                    </FormControl>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-1">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setShowSecret(!showSecret)}
                                            aria-label={showSecret ? "Hide secret" : "Show secret"}
                                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                        >
                                            {showSecret ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={handleCopySecret}
                                            disabled={!field.value}
                                            aria-label="Copy secret"
                                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <FormDescription>
                                    The secret value (API key, token, etc.) that will be encrypted and stored.
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
                                    <Input
                                        placeholder="Project ID"
                                        {...field}
                                        disabled
                                        className="bg-muted text-muted-foreground"
                                    />
                                </FormControl>
                                <FormDescription>
                                    The project this secret belongs to.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

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
            </form>
        </Form>
    );
} 