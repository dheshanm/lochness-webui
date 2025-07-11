import { DataSinks } from "@/lib/models/data-sinks";
import { DataSink } from "@/types/data-sinks";

export async function GET(
    request: Request,
    props: { params: Promise<{ project_id: string; site_id: string; sink_name: string }> }
): Promise<Response> {
    const params = await props.params;
    const project_id = params.project_id;
    const site_id = params.site_id;
    const sink_name = params.sink_name;

    if (!project_id || !site_id || !sink_name) {
        return new Response(JSON.stringify({ error: "Missing project_id, site_id, or sink_name parameter" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    const dataSink = await DataSinks.getDataSinkByName(project_id, site_id, sink_name);
    if (!dataSink) {
        return new Response(JSON.stringify({ error: "Data sink not found" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
        });
    }
    return new Response(JSON.stringify(dataSink), {
        headers: { "Content-Type": "application/json" },
    });
}

export async function PUT(
    request: Request,
    props: { params: Promise<{ project_id: string; site_id: string; sink_name: string }> }
): Promise<Response> {
    const params = await props.params;
    const project_id = params.project_id;
    const site_id = params.site_id;
    const sink_name = params.sink_name;

    if (!project_id || !site_id || !sink_name) {
        return new Response(JSON.stringify({ error: "Missing project_id, site_id, or sink_name parameter" }), {
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
        data_sink_name: sink_name,
        site_id: site_id,
        project_id: project_id,
        data_sink_metadata: dataSinkData.data_sink_metadata,
    };

    const result = await DataSinks.createOrUpdateDataSink(dataSink);
    if (!result) {
        return new Response(JSON.stringify({ error: "Failed to update data sink" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
    return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
}

export async function DELETE(
    request: Request,
    props: { params: Promise<{ project_id: string; site_id: string; sink_name: string }> }
): Promise<Response> {
    const params = await props.params;
    const project_id = params.project_id;
    const site_id = params.site_id;
    const sink_name = params.sink_name;

    if (!project_id || !site_id || !sink_name) {
        return new Response(JSON.stringify({ error: "Missing project_id, site_id, or sink_name parameter" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    const result = await DataSinks.deleteDataSink(project_id, site_id, sink_name);
    if (!result) {
        return new Response(JSON.stringify({ error: "Failed to delete data sink" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
    return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
} 