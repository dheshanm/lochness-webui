"use client"
import SubjectsTable from './subjects-table';

interface SubjectsListProps {
    project_id: string;
    site_id: string;
}

export default function SubjectsList({ project_id, site_id }: SubjectsListProps) {
    return <SubjectsTable project_id={project_id} site_id={site_id} />;
} 