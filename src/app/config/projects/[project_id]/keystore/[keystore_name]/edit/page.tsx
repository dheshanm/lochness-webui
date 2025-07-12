"use client"
import * as React from 'react';
import { Heading } from '@/components/heading';
import KeystoreForm from '@/components/forms/keystore';
import { toast } from "sonner";

type Params = Promise<{ project_id: string; keystore_name: string }>;

export default function EditKeystorePage({ params }: { params: Params }) {
    const [projectId, setProjectId] = React.useState<string | null>(null);
    const [keystoreName, setKeystoreName] = React.useState<string | null>(null);
    const [entry, setEntry] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const getParams = async () => {
            const { project_id, keystore_name } = await params;
            const decodedProjectId = decodeURIComponent(project_id);
            const decodedKeystoreName = decodeURIComponent(keystore_name);
            
            setProjectId(decodedProjectId);
            setKeystoreName(decodedKeystoreName);

            // Fetch the keystore entry
            try {
                const response = await fetch(`/api/v1/keystore/${decodedKeystoreName}?project_id=${decodedProjectId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch keystore entry');
                }
                const data = await response.json();
                setEntry(data.entry);
            } catch (error) {
                console.error('Error fetching keystore entry:', error);
                toast.error('Failed to fetch keystore entry');
            } finally {
                setLoading(false);
            }
        };
        getParams();
    }, [params]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!projectId || !keystoreName || !entry) {
        return <div>Error: Missing required data</div>;
    }

    return (
        <div className="container mx-auto p-6 max-w-2xl">
            <Heading title="Edit Keystore Entry" />
            <KeystoreForm 
                project_id={projectId}
                keystore_name={entry.keystore_name}
                key_type={entry.key_type}
                key_metadata={entry.key_metadata ? JSON.stringify(entry.key_metadata) : ""}
            />
        </div>
    );
} 