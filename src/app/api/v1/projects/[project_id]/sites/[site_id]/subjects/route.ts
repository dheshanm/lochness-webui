import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { Subjects } from '@/lib/models/subjects';

export async function GET(
    request: NextRequest,
    { params }: { params: { project_id: string; site_id: string } }
) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { project_id, site_id } = params;

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