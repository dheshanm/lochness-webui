// CREATE TABLE public.projects (
// 	project_id text NOT NULL,
// 	project_name text NOT NULL,
// 	project_metadata jsonb NOT NULL,
// 	CONSTRAINT projects_pkey PRIMARY KEY (project_id)
// );

export type Project = {
    project_id: string;
    project_name: string;
    project_metadata: {
        [key: string]: any;
    };
};

