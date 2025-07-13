import { DataSinks } from "@/lib/models/data-sinks";
import { DataSink } from "@/types/data-sinks";

export async function GET(
    request: Request,
    props: { params: Promise<{ project_id: string; site_id: string }> }
): Promise<Response> {
    const params = await props.params;
    const project_id = params.project_id;
    const site_id = params.site_id;

    if (!project_id || !site_id) {
        return new Response(JSON.stringify({ error: "Missing project_id or site_id parameter" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    const dataSinks = await DataSinks.getSiteDataSinks(project_id, site_id);
    return new Response(JSON.stringify(dataSinks), {
        headers: { "Content-Type": "application/json" },
    });
}

export async function POST(
    request: Request,
    props: { params: Promise<{ project_id: string; site_id: string }> }
): Promise<Response> {
    try {
        const params = await props.params;
        const project_id = params.project_id;
        const site_id = params.site_id;

        if (!project_id || !site_id) {
            return new Response(JSON.stringify({ error: "Missing project_id or site_id parameter" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const dataSinkData = await request.json();
        if (!dataSinkData) {
            return new Response(JSON.stringify({ error: "Missing data sink data" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const dataSink: DataSink = {
            data_sink_name: dataSinkData.data_sink_name,
            site_id: site_id,
            project_id: project_id,
            data_sink_metadata: dataSinkData.data_sink_metadata,
        };

        const result = await DataSinks.createOrUpdateDataSink(dataSink);
        if (!result) {
            // Log the error for debugging
            console.error("Failed to create or update data sink", { dataSink });
            return new Response(JSON.stringify({ error: "Failed to create or update data sink" }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            });
        }
        return new Response(JSON.stringify(result), {
            status: 201,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error: any) {
        // Log the error stack for debugging
        console.error("Error in POST /sinks:", error, error?.stack);
        return new Response(JSON.stringify({ error: "Internal server error", details: error?.message || String(error) }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
} 