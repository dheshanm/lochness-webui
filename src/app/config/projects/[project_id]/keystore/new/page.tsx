"use client"
import * as React from 'react';
import { Heading } from '@/components/heading';
import KeystoreForm from '@/components/forms/keystore';

type Params = Promise<{ project_id: string }>;

export default function NewKeystorePage({ params }: { params: Params }) {
    const [projectId, setProjectId] = React.useState<string | null>(null);

    React.useEffect(() => {
        const getProjectId = async () => {
            const { project_id } = await params;
            setProjectId(decodeURIComponent(project_id));
        };
        getProjectId();
    }, [params]);

    if (!projectId) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container mx-auto p-6 max-w-2xl">
            <Heading title="Add Keystore Entry" />
            <KeystoreForm project_id={projectId} />
        </div>
    );
} 