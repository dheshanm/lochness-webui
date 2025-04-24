// CREATE TABLE public.sites (
// 	site_id text NOT NULL,
// 	project_id text NOT NULL,
// 	site_name text NOT NULL,
// 	site_is_active bool DEFAULT true NOT NULL,
// 	site_metadata jsonb NOT NULL,
// 	CONSTRAINT sites_pkey PRIMARY KEY (project_id, site_id),
// 	CONSTRAINT sites_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(project_id)
// );

export type Site = {
    site_id: string;
    project_id: string;
    site_name: string;
    site_is_active: boolean;
    site_metadata: {
        [key: string]: any;
    };
};
