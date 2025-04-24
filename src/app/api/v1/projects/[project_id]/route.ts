import { Projects } from "@/lib/models/projects";

export async function GET(
    request: Request,
    props: { params: Promise<{ project_id: string }> }
): Promise<Response> {
    const params = await props.params;
    const project_id = params.project_id;

    if (!project_id) {
        return new Response(JSON.stringify({ error: 'Missing project_id parameter' }), {
            status: 400,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    const project = await Projects.getProjectById(project_id);

    if (!project) {
        return new Response(JSON.stringify({ error: 'Project not found' }), {
            status: 404,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    return new Response(JSON.stringify(project), {
        headers: {
            'Content-Type': 'application/json',
        },
    });


}