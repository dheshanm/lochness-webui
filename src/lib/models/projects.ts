import { getConnection } from "@/lib/db";

import { DBUpdateResult } from "@/types/dbUpdateResult";
import { Project } from "@/types/projects";

/**
 * Projects class provides static methods for managing project data in the database.
 */
export class Projects {
    /**
     * Fetches all projects from the database with pagination.
     *
     * @param {number} limit - The maximum number of projects to fetch (default is 100).
     * @param {number} offset - The number of projects to skip before starting to fetch (default is 0).
     * @returns {Promise<Project[]>} - A promise that resolves to an array of Project objects.
     */
    static async getAllProjects(limit: number = 100, offset: number = 0): Promise<Project[]> {
        const connection = getConnection();
        const query = `SELECT * FROM projects ORDER BY project_id LIMIT $1 OFFSET $2`;
        const values = [limit, offset];
        const { rows } = await connection.query(query, values);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const projects: Project[] = rows.map((row: any) => ({
            project_id: row.project_id,
            project_name: row.project_name,
            project_is_active: row.project_is_active,
            project_metadata: row.project_metadata,
        }));

        return projects;
    }

    /**
     * Fetches the total count of projects in the database.
     *
     * @returns {Promise<number>} - A promise that resolves to the total count of projects.
     */
    static async getProjectsCount(): Promise<number> {
        const connection = getConnection();
        const query = `SELECT COUNT(*) FROM projects`;

        const { rows } = await connection.query(query);
        return parseInt(rows[0].count, 10);
    }

    /**
     * Fetches a project by its ID from the database.
     *
     * @param {string} projectId - The ID of the project to fetch.
     * @returns {Promise<Project | null>} - A promise that resolves to the Project object or null if not found.
     */
    static async getProjectById(projectId: string): Promise<Project | null> {
        const connection = getConnection();
        const query = `SELECT * FROM projects WHERE project_id = $1`;
        const { rows } = await connection.query(query, [projectId]);
        if (rows.length === 0) {
            return null;
        }
        const project: Project = {
            project_id: rows[0].project_id,
            project_name: rows[0].project_name,
            project_is_active: rows[0].project_is_active,
            project_metadata: rows[0].project_metadata,
        };
        return project;
    }

    /**
     * Creates or updates a project in the database.
     *
     * @param {Project} project - The project object to create or update.
     * @returns {Promise<DBUpdateResult>} - A promise that resolves to the result of the database update operation.
     */
    static async createOrUpdateProject(project: Project): Promise<DBUpdateResult> {
        const connection = getConnection();
        const query = `
            INSERT INTO projects (project_id, project_name, project_is_active, project_metadata)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (project_id) DO UPDATE
            SET project_name = EXCLUDED.project_name,
                project_metadata = EXCLUDED.project_metadata,
                project_is_active = EXCLUDED.project_is_active;
        `;
        const values = [
            project.project_id,
            project.project_name,
            project.project_is_active,
            project.project_metadata,
        ];
        const result = await connection.query(query, values);
        const dbUpdateResult: DBUpdateResult = {
            updatedRowCount: result.rowCount || 0,
            query: query,
        };
        return dbUpdateResult;
    }
}