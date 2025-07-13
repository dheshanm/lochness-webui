import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getConnection } from '@/lib/db';

export async function GET(request: Request, props: { params: Promise<{ keystore_name: string }> }) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const params = await props.params;
        const keystore_name = decodeURIComponent(params.keystore_name);

        const { searchParams } = new URL(request.url);
        const project_id = searchParams.get('project_id');

        if (!project_id) {
            return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
        }

        const connection = getConnection();
        // Fetch keystore entry (excluding encrypted key_value)
        const query = `
            SELECT key_name, key_type, project_id, key_metadata
            FROM key_store 
            WHERE key_name = $1 AND project_id = $2
        `;
        const values = [keystore_name, project_id];
        
        try {
            const { rows } = await connection.query(query, values);
            if (rows.length === 0) {
                return NextResponse.json({ error: 'Keystore entry not found' }, { status: 404 });
            }
            
            const entry = {
                keystore_name: rows[0].key_name,
                key_type: rows[0].key_type,
                project_id: rows[0].project_id,
                key_metadata: rows[0].key_metadata,
            };
            return NextResponse.json({ entry });
        } catch (dbError) {
            console.error('DB error fetching keystore entry:', dbError);
            return NextResponse.json({ error: 'Database error fetching keystore entry' }, { status: 500 });
        }
    } catch (error) {
        console.error('Error fetching keystore entry:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { keystore_name: string } }
) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { key_value, key_type, project_id, key_metadata } = body;

        // Validate required fields
        if (!key_value || !key_type || !project_id) {
            return NextResponse.json({ 
                error: 'Missing required fields: key_value, key_type, project_id' 
            }, { status: 400 });
        }

        const keystore_name = decodeURIComponent(params.keystore_name);

        // Get encryption passphrase from env
        const passphrase = process.env.KEYSTORE_PASSPHRASE;
        if (!passphrase) {
            return NextResponse.json({ error: 'Encryption passphrase not set in environment (KEYSTORE_PASSPHRASE)' }, { status: 500 });
        }

        const connection = getConnection();
        // Update keystore entry with encrypted value
        const query = `
            UPDATE key_store 
            SET key_value = pgp_sym_encrypt($1, $2), key_type = $3, key_metadata = $4
            WHERE key_name = $5 AND project_id = $6
        `;
        const values = [
            key_value,
            passphrase,
            key_type,
            key_metadata ? JSON.stringify(key_metadata) : null,
            keystore_name,
            project_id,
        ];
        try {
            const result = await connection.query(query, values);
            if (result.rowCount === 0) {
                return NextResponse.json({ error: 'Keystore entry not found' }, { status: 404 });
            }
        } catch (dbError) {
            console.error('DB error updating keystore entry:', dbError);
            return NextResponse.json({ error: 'Database error updating keystore entry' }, { status: 500 });
        }

        return NextResponse.json({ 
            message: 'Keystore entry updated successfully',
            keystore_name 
        });
    } catch (error) {
        console.error('Error updating keystore entry:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { keystore_name: string } }
) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const project_id = searchParams.get('project_id');

        if (!project_id) {
            return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
        }

        const keystore_name = decodeURIComponent(params.keystore_name);

        const connection = getConnection();
        // Delete keystore entry
        const query = `DELETE FROM key_store WHERE key_name = $1 AND project_id = $2`;
        const values = [keystore_name, project_id];
        try {
            const result = await connection.query(query, values);
            if (result.rowCount === 0) {
                return NextResponse.json({ error: 'Keystore entry not found' }, { status: 404 });
            }
        } catch (dbError) {
            console.error('DB error deleting keystore entry:', dbError);
            return NextResponse.json({ error: 'Database error deleting keystore entry' }, { status: 500 });
        }

        return NextResponse.json({ 
            message: 'Keystore entry deleted successfully',
            keystore_name 
        });
    } catch (error) {
        console.error('Error deleting keystore entry:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 