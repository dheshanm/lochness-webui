import { getConnection } from "@/lib/db";

export interface Subject {
    subject_id: string;
    site_id: string;
    project_id: string;
    subject_metadata: Record<string, any>;
}

export class Subjects {
    /**
     * Fetches all subjects for a given site and project from the database.
     *
     * @param {string} projectId - The ID of the project.
     * @param {string} siteId - The ID of the site.
     * @returns {Promise<Subject[]>} - A promise that resolves to an array of Subject objects.
     */
    static async getSiteSubjects(projectId: string, siteId: string): Promise<Subject[]> {
        const connection = getConnection();
        const query = `
            SELECT subject_id, site_id, project_id, subject_metadata
            FROM subjects 
            WHERE site_id = $1 AND project_id = $2
            ORDER BY subject_id
        `;
        const values = [siteId, projectId];
        
        try {
            const { rows } = await connection.query(query, values);
            const subjects: Subject[] = rows.map((row: any) => ({
                subject_id: row.subject_id,
                site_id: row.site_id,
                project_id: row.project_id,
                subject_metadata: row.subject_metadata || {},
            }));
            return subjects;
        } catch (error) {
            console.error('Error fetching subjects:', error);
            throw new Error('Failed to fetch subjects from database');
        }
    }
} 