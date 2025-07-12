import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { Subjects } from '@/lib/models/subjects';

export async function GET(
    request: NextRequest,
    context: { params: { project_id: string; site_id: string } }
) {
    // Await params in case it's a Promise (Next.js dynamic API route requirement)
    const { project_id, site_id } = await context.params;
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        try {
            const subjects = await Subjects.getSiteSubjects(project_id, site_id);
            return NextResponse.json(subjects);
        } catch (dbError) {
            console.error('Database error fetching subjects:', dbError);
            return NextResponse.json(
                { error: 'Failed to fetch subjects from database' },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Error fetching subjects:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 