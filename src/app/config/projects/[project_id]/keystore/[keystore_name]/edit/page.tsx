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
    const [accessKeyEntry, setAccessKeyEntry] = React.useState<any>(null);
    const [secretKeyEntry, setSecretKeyEntry] = React.useState<any>(null);
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
                // Fetch main entry
                const response = await fetch(`/api/v1/keystore/${decodedKeystoreName}?project_id=${decodedProjectId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch keystore entry');
                }
                const data = await response.json();
                setEntry(data.entry);

                // Always fetch MinIO access and secret key entries
                const accessKeyResp = await fetch(`/api/v1/keystore/${decodedKeystoreName}_access_key?project_id=${decodedProjectId}`);
                const secretKeyResp = await fetch(`/api/v1/keystore/${decodedKeystoreName}_secret_key?project_id=${decodedProjectId}`);
                setAccessKeyEntry(accessKeyResp.ok ? (await accessKeyResp.json()).entry : null);
                setSecretKeyEntry(secretKeyResp.ok ? (await secretKeyResp.json()).entry : null);
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
                key_value={entry.key_value} // Pass key_value
                key_metadata={entry.key_metadata ? JSON.stringify(entry.key_metadata) : ""}
                minio_access_key={accessKeyEntry ? accessKeyEntry.key_value : ''}
                minio_secret_key={secretKeyEntry ? secretKeyEntry.key_value : ''}
            />
        </div>
    );
} 