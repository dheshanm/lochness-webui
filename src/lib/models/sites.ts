import { getConnection } from "@/lib/db";

import { Site } from "@/types/sites";
import { DBUpdateResult } from "@/types/dbUpdateResult";

/**
 * Sites class provides static methods for managing site data in the database.
*/
export class Sites {
    /**
     * Fetches all sites for a given project from the database with pagination.
     *
     * @param {string} projectId - The ID of the project to fetch sites for.
     * @returns {Promise<Site[]>} - A promise that resolves to an array of Site objects.
     */
    static async getProjectSites(projectId: string): Promise<Site[]> {
        const connection = getConnection();
        const query = `SELECT * FROM sites WHERE project_id = $1 ORDER BY site_id`;
        const values = [projectId];
        const { rows } = await connection.query(query, values);
        const sites: Site[] = rows.map((row: any) => ({
            site_id: row.site_id,
            project_id: row.project_id,
            site_name: row.site_name,
            site_is_active: row.site_is_active,
            site_metadata: row.site_metadata,
        }));

        return sites;
    }

    /**
     * Fetches the total count of sites for a given project in the database.
     *
     * @param {string} projectId - The ID of the project to fetch sites for.
     * @returns {Promise<number>} - A promise that resolves to the total count of sites.
     */
    static async getProjectSitesCount(projectId: string): Promise<number> {
        const connection = getConnection();
        const query = `SELECT COUNT(*) FROM sites WHERE project_id = $1`;
        const { rows } = await connection.query(query, [projectId]);
        return parseInt(rows[0].count, 10);
    }

    /**
     * Fetches a site by its ID from the database.
     *
     * @param {string} projectId - The ID of the project the site belongs to.
     * @param {string} siteId - The ID of the site to fetch.
     * @returns {Promise<Site | null>} - A promise that resolves to the Site object or null if not found.
     */
    static async getSiteById(projectId: string, siteId: string): Promise<Site | null> {
        const connection = getConnection();
        const query = `SELECT * FROM sites WHERE project_id = $1 AND site_id = $2`;
        const { rows } = await connection.query(query, [projectId, siteId]);
        if (rows.length === 0) {
            return null;
        }
        const site: Site = {
            site_id: rows[0].site_id,
            project_id: rows[0].project_id,
            site_name: rows[0].site_name,
            site_is_active: rows[0].site_is_active,
            site_metadata: rows[0].site_metadata,
        };

        return site;
    }

    /**
     * Creates a new site or updates an existing site in the database.
     *
     * @param {Site} site - The Site object to create.
     * @returns {Promise<Site>} - A promise that resolves to the created Site object.
     */
    static async createOrUpdateSite(site: Site): Promise<DBUpdateResult> {
        const connection = getConnection();
        const query = `
            INSERT INTO sites (site_id, project_id, site_name, site_is_active, site_metadata)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (project_id, site_id) DO UPDATE
            SET site_name = EXCLUDED.site_name,
                site_is_active = EXCLUDED.site_is_active,
                site_metadata = EXCLUDED.site_metadata;;
        `;
        const values = [
            site.site_id,
            site.project_id,
            site.site_name,
            site.site_is_active,
            site.site_metadata,
        ];
        const result = await connection.query(query, values);

        const updateResult: DBUpdateResult = {
            updatedRowCount: result.rowCount || 0,
            query: query,
        };
        return updateResult;
    }
}