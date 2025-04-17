import * as React from 'react';

import { Terminal } from "lucide-react"

import { Heading } from '@/components/heading';
import UnderDevelopment from '@/components/banners/under-development';
import LogsViewer from '@/components/logs-viewer';

export default function LogsPage() {
    const logsIcon = <Terminal className="h-8 w-8" />;
    return (
        <div className="container mx-auto p-6 max-w-5xl flex flex-col h-full">
            <div>
                <Heading icon={logsIcon} title="Logs" />
                <UnderDevelopment />
            </div>

            <div className="flex-grow overflow-auto mt-4">
                <LogsViewer />
            </div>
        </div>
    );
}
