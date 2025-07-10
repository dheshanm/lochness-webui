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

export async function DELETE(
    request: Request,
    props: { params: { project_id: string } }
): Promise<Response> {
    const project_id = props.params.project_id;

    if (!project_id) {
        return new Response(JSON.stringify({ error: 'Missing project_id parameter' }), {
            status: 400,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    try {
        const deleted = await Projects.deleteProject(project_id);
        if (deleted) {
            return new Response(JSON.stringify({ message: 'Project deleted successfully' }), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        } else {
            return new Response(JSON.stringify({ error: 'Project not found or could not be deleted' }), {
                status: 404,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }
    } catch (error) {
        console.error("Error deleting project:", error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}
