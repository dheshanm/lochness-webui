import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getConnection } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const body = await request.json();
        const {
            job_type,
            project_id,
            site_id,
            data_source_name,
            data_sink_name,
            job_metadata
        } = body;
        const requested_by = session.user?.email || null;
        if (!job_type || !project_id || !site_id) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }
        const connection = getConnection();
        const query = `
            INSERT INTO jobs (
                job_type, project_id, site_id, data_source_name, data_sink_name, requested_by, status, job_metadata
            ) VALUES (
                $1, $2, $3, $4, $5, $6, 'pending', $7
            ) RETURNING job_id;
        `;
        const values = [
            job_type,
            project_id,
            site_id,
            data_source_name || null,
            data_sink_name || null,
            requested_by,
            job_metadata ? JSON.stringify(job_metadata) : null,
        ];
        const result = await connection.query(query, values);
        return NextResponse.json({ job_id: result.rows[0].job_id });
    } catch (error) {
        console.error('Error creating job:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const url = new URL(request.url);
        const project_id = url.searchParams.get('project_id');
        const site_id = url.searchParams.get('site_id');
        const job_type = url.searchParams.get('job_type');
        const status = url.searchParams.get('status');
        const data_source_name = url.searchParams.get('data_source_name');
        const limit = parseInt(url.searchParams.get('limit') || '100', 10);
        const offset = parseInt(url.searchParams.get('offset') || '0', 10);

        const connection = getConnection();
        let query = `SELECT * FROM jobs`;
        const filters: string[] = [];
        const values: any[] = [];
        let idx = 1;
        if (project_id) { filters.push(`project_id = $${idx++}`); values.push(project_id); }
        if (site_id) { filters.push(`site_id = $${idx++}`); values.push(site_id); }
        if (job_type) { filters.push(`job_type = $${idx++}`); values.push(job_type); }
        if (status) { filters.push(`status = $${idx++}`); values.push(status); }
        if (data_source_name) { filters.push(`data_source_name = $${idx++}`); values.push(data_source_name); }
        if (filters.length > 0) {
            query += ' WHERE ' + filters.join(' AND ');
        }
        query += ` ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
        values.push(limit, offset);
        const result = await connection.query(query, values);
        return NextResponse.json({ jobs: result.rows });
    } catch (error) {
        console.error('Error fetching jobs:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 