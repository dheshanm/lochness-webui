"use client"
import * as React from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner";
import { Pencil, Plus, Trash, Copy, EyeOff, Eye } from "lucide-react"

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

import { DataSource } from '@/types/data-sources'

const redcapSchema = z.object({
    site_id: z.string().min(1, {
        message: "Site ID is required",
    }),
    project_id: z.string().min(1, {
        message: "Project ID is required",
    }),
    start_activated: z.boolean(),
    // RedCAP instance name
    name: z.string().min(1, {
        message: "RedCAP instance name is required",
    }),
    endpoint_url: z.string().min(1, {
        message: "RedCAP endpoint URL is required",
    }),
    api_token: z.string().min(1, {
        message: "RedCAP API token is required",
    }),
    // Variable to search for subject ID
    subject_id_variable: z.string().min(1, {
        message: "Subject ID variable is required",
    }),
    // Optional Variables to pull for each subject and their description
    optional_variables_dictionary: z.array(
        z.object({
            variable_name: z.string().min(1, { message: "Variable name is required" }),
            variable_description: z.string().min(1, { message: "Description is required" }),
        })
    ).optional(),
})

export type RedcapFormSchema = z.infer<typeof redcapSchema>

export interface RedcapFormProps {
    site_id: string
    project_id: string
    instance_name: string | null
}

export default function RedcapForm(
    props: RedcapFormProps
) {
    const { site_id, project_id, instance_name } = props
    const [loading, setLoading] = React.useState(false)

    const [ dataSource, setDataSource ] = React.useState<DataSource | null>(null)
    const [ editMode, setEditMode ] = React.useState(false)

    const [showToken, setShowToken] = React.useState(false);

    const form = useForm<RedcapFormSchema>({
        resolver: zodResolver(redcapSchema),
        defaultValues: {
            site_id,
            project_id,
            start_activated: true,
            name: instance_name || "",
            endpoint_url: "",
            api_token: "",
            subject_id_variable: "",
            optional_variables_dictionary: [], // Initialize as empty array
        },
    })

    React.useEffect(() => {
        const fetchDataSource = async () => {
            try {
                const response = await fetch(`/api/v1/projects/${project_id}/sites/${site_id}/sources/${instance_name}`)
                if (!response.ok) {
                    throw new Error("Failed to fetch data source")
                }
                const data = await response.json()
                setDataSource(data)
            }
            catch (error) {
                console.error("Error fetching data source:", error)
            }
        }

        if (instance_name) {
            fetchDataSource()
        }
    }, [instance_name, project_id, site_id])


    React.useEffect(() => {
        if (dataSource) {
            form.reset({
                site_id: dataSource.site_id,
                project_id: dataSource.project_id,
                start_activated: dataSource.data_source_is_active,
                name: dataSource.data_source_name,
                endpoint_url: dataSource.data_source_metadata.endpoint_url,
                api_token: dataSource.data_source_metadata.api_token,
                subject_id_variable: dataSource.data_source_metadata.subject_id_variable,
                optional_variables_dictionary: dataSource.data_source_metadata.optional_variables_dictionary || [],
            })

            setEditMode(true)
        }
    }, [dataSource, form])

    // Initialize useFieldArray for optional_variables_dictionary
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "optional_variables_dictionary",
    })

    async function onSubmit(data: RedcapFormSchema) {
        setLoading(true)
        try {
            const body = {
                data_source_name: data.name,
                data_source_is_active: data.start_activated,
                site_id: site_id,
                project_id: project_id,
                data_source_type: "redcap",
                data_source_metadata: {
                    endpoint_url: data.endpoint_url,
                    api_token: data.api_token,
                    subject_id_variable: data.subject_id_variable,
                    optional_variables_dictionary: data.optional_variables_dictionary || [],
                },
            }
            console.log("Submitting data:", data)

            const response = await fetch(`/api/v1/projects/${project_id}/sites/${site_id}/sources`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            })

            if (!response.ok) {
                const errorData = await response.json()
                console.error("Error creating redcap data source:", errorData)
                toast.error("Error creating redcap data source")
                return
            }

            const result = await response.json()
            console.log("RedCAP data source created successfully:", result)
            toast.success(editMode ? "RedCAP data source updated successfully" : "RedCAP data source created successfully")

            // Redirect to the data sources page
            // http://pnl-lochness-dev.partners.org:3000/config/projects/PRESCIENT/sites/JE/sources/TEST
            // http://pnl-lochness-dev.partners.org:3000/config/projects/PRESCIENT/sites/JE/data-sources/redcap/TEST
            window.location.href = `/config/projects/${project_id}/sites/${site_id}/data-sources/redcap/${data.name}`
        } catch (error) {
            console.error("Error creating redcap data source", error)
            toast.error(editMode ? "Error updating redcap data source" : "Error creating redcap data source")
        }
        finally {
            setLoading(false)
        }
    }

    const optionalVariablesPlaceholders = [
        ["e.g., age_at_visit", "Age of subject at time of visit"],
        ["e.g., visit_date", "Date of the visit"],
        ["e.g., lab_results", "Lab results for the visit"],
        ["e.g., medication_list", "List of medications taken"],
        ["e.g., adverse_events", "Adverse events reported"],
        ["e.g., family_history", "Family history of diseases"],
        ["e.g., social_history", "Social history of the subject"],
        ["e.g., allergies", "Allergies reported by the subject"],
    ]

    return (
        <Form {...form}>
            <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8" // Increased spacing between sections
            >
            {/* Basic Information Section */}
            <div className="space-y-4 rounded-md border p-4 shadow-sm">
                <h3 className="text-lg font-medium leading-6 text-foreground">Basic Information</h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                    control={form.control}
                    name="site_id"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Site ID</FormLabel>
                        <FormControl>
                        <Input
                            placeholder="Site ID"
                            {...field}
                            disabled
                            value={site_id}
                            className="bg-muted text-muted-foreground" // Style disabled input
                        />
                        </FormControl>
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
                            value={project_id}
                            className="bg-muted text-muted-foreground" // Style disabled input
                        />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                </div>
                <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>RedCAP Instance Name</FormLabel>
                    <FormControl>
                        <Input
                        placeholder="e.g., Main Hospital REDCap"
                        {...field}
                        disabled={!!editMode} // Disable if instance_name is provided
                        className={!!editMode ? "bg-muted text-muted-foreground" : ""} // Style disabled input
                        />
                    </FormControl>
                    {/* <FormDescription>
                        A descriptive name for this REDCap connection.
                    </FormDescription> */}
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="start_activated"
                render={({ field }) => (
                    <FormItem>
                        <div className="flex items-center space-x-2">
                            <FormControl>
                                <Checkbox
                                    id="start_activated_checkbox"
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <FormLabel
                                htmlFor="start_activated_checkbox"
                                className="!mt-0 font-normal"
                            >
                                Start Activated
                            </FormLabel>
                        </div>
                        <FormDescription className="pl-6">
                            {field.value
                                ? "This REDCap data source will be activated immediately upon creation."
                                : "This REDCap data source will be created but remain inactive."}
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
                />
            </div>

            {/* API Configuration Section */}
            <div className="space-y-4 rounded-md border p-4 shadow-sm">
                <h3 className="text-lg font-medium leading-6 text-foreground">API Configuration</h3>
                <FormField
                control={form.control}
                name="endpoint_url"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>RedCAP API Endpoint URL</FormLabel>
                    <FormControl>
                        <Input
                        type="url" // Use URL type for better semantics/validation
                        placeholder="https://redcap.example.com/api/"
                        {...field}
                        />
                    </FormControl>
                    {/* <FormDescription>
                        The URL of your REDCap instance's API endpoint.
                    </FormDescription> */}
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="api_token"
                render={({ field }) => {
                    // // Moved to Top
                    // const [showToken, setShowToken] = React.useState(false);

                    const handleCopyToken = async () => {
                        if (!navigator.clipboard) {
                            console.error("Clipboard API not available. Ensure you are using HTTPS or localhost.");
                            toast.error("Clipboard access requires a secure connection (HTTPS).");
                            return;
                        }
                        try {
                            await navigator.clipboard.writeText(field.value);
                            toast.success("API Token copied to clipboard!");
                        } catch (err) {
                            console.error("Failed to copy token: ", err);
                            toast.error("Failed to copy API Token.");
                        }
                    };

                    return (
                    <FormItem>
                        <FormLabel>RedCAP API Token</FormLabel>
                        <div className="relative flex items-center">
                            <FormControl>
                                <Input
                                type={showToken ? "text" : "password"}
                                placeholder="Enter your REDCap API Token"
                                {...field}
                                className="pr-20" // Add padding to prevent text overlap with buttons
                                />
                            </FormControl>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-1">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setShowToken(!showToken)}
                                    aria-label={showToken ? "Hide token" : "Show token"}
                                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                >
                                    {showToken ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleCopyToken}
                                    disabled={!field.value}
                                    aria-label="Copy token"
                                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        {/* <FormDescription>
                            Your project-specific API token generated in REDCap. Keep this secure.
                        </FormDescription> */}
                        <FormMessage />
                    </FormItem>
                    );
                }}
                />
                <FormField
                control={form.control}
                name="subject_id_variable"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Subject ID Variable</FormLabel>
                    <FormControl>
                        <Input
                        placeholder="e.g., record_id or subject_identifier"
                        {...field}
                        />
                    </FormControl>
                    <FormDescription>
                        The REDCap variable name used to uniquely identify subjects (often the record ID field).
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>

            {/* Optional Variables Dictionary Section */}
            <div className="space-y-4 rounded-md border p-4 shadow-sm">
                <div className="flex items-center justify-between">
                <div>
                    <FormLabel className="text-lg font-medium">Optional Variables</FormLabel>
                    <FormDescription className="mt-1">
                    Define additional REDCap variables to fetch and their descriptions (optional).
                    </FormDescription>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ variable_name: "", variable_description: "" })}
                    className="flex items-center"
                >
                    <Plus className="mr-2 h-4 w-4" /> Add Variable
                </Button>
                </div>
                <FormMessage>
                {/* Display array-level errors if any */}
                {form.formState.errors.optional_variables_dictionary?.root?.message}
                </FormMessage>
                <div className="space-y-4">
                {fields.map((fieldItem, index) => (
                    <div
                    key={fieldItem.id}
                    className="flex flex-col gap-4 rounded-md border bg-muted/50 p-4 sm:flex-row sm:items-start" // Added background tint
                    >
                    <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2">
                        <FormField
                        control={form.control}
                        name={`optional_variables_dictionary.${index}.variable_name` as const}
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Variable Name {index + 1}</FormLabel>
                            <FormControl>
                                <Input
                                placeholder={optionalVariablesPlaceholders[index % optionalVariablesPlaceholders.length][0]}
                                {...field}
                                />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name={`optional_variables_dictionary.${index}.variable_description` as const}
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Description {index + 1}</FormLabel>
                            <FormControl>
                                <Input
                                placeholder={optionalVariablesPlaceholders[index % optionalVariablesPlaceholders.length][1]}
                                {...field}
                                />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    </div>
                    <Button
                        type="button"
                        variant="ghost" // Use ghost for less emphasis
                        size="icon"
                        onClick={() => remove(index)}
                        className="mt-2 self-end text-destructive hover:bg-destructive/10 sm:mt-6 sm:self-start" // Adjusted margin and alignment
                        aria-label={`Remove variable ${index + 1}`}
                    >
                        <Trash className="h-4 w-4" />
                    </Button>
                    </div>
                ))}

                {fields.length === 0 && (
                    <p className="text-sm text-muted-foreground">No optional variables added yet.</p>
                )}
                { fields.length > 0 && (
                    <p className="text-sm text-muted-foreground">{`${fields.length} optional variables defined.`}</p>
                )}

                {/* Add button at the bottom for better mobile UX */}
                {fields.length > 0 && (
                    <div className="flex justify-end pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => append({ variable_name: "", variable_description: "" })}
                            className="flex items-center"
                        >
                            <Plus className="mr-2 h-4 w-4" /> Add Another Variable
                        </Button>
                    </div>
                )}
                </div>
            </div>

            <Button
                type="submit"
                className="w-full"
                disabled={loading}
                variant="default"
                size="lg"
            >
                {loading ? (
                <>
                    {/* Consider adding a spinner icon here */}
                    {editMode ? "Updating..." : "Creating..."}
                </>
                ) : (
                <>
                    {editMode ? (
                        <Pencil className="mr-2 h-5 w-5" />
                    ) : (
                        <Plus className="mr-2 h-5 w-5" />
                    )}
                    {editMode ? "Update RedCAP Data Source" : "Create RedCAP Data Source"}
                </>
                )}
            </Button>
            </form>
        </Form>
    )
}