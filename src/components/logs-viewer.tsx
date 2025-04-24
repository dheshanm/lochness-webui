"use client"
import { LazyLog } from "@melloware/react-logviewer";
import * as React from 'react';
import { toast } from "sonner";

import { ListOrdered, Search, WrapText } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    ToggleGroup,
    ToggleGroupItem,
} from "@/components/ui/toggle-group";

export default function LogsViewer() {
    const [showSearch, setShowSearch] = React.useState(false);
    const [wrapLines, setWrapLines] = React.useState(true);
    const [autoRefresh, setAutoRefresh] = React.useState(true);
    const [showLineNumbers, setShowLineNumbers] = React.useState(true);

    const [logs, setLogs] = React.useState("");

    const fetchLogs = async () => {
        const response = await fetch('/api/v1/logs?limit=1000&offset=0');
        if (!response.ok) {
            toast.error('Failed to fetch logs');
            throw new Error('Failed to fetch logs');
        }

        const data = await response.json();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const logsData = data.rows.map((log: any) => {
            return log.extended_log_format;
        }).join('\n');
        setLogs(logsData);
    }

    React.useEffect(() => {
        if (autoRefresh) {
            const interval = setInterval(() => {
                toast.info('Refreshing logs...');
                fetchLogs();
            }, 5000); // Fetch logs every 5 seconds
            return () => clearInterval(interval);
        }
        fetchLogs();
    }, [autoRefresh]);

    React.useEffect(() => {
        fetchLogs();
    }, []);

    return (
        <div className='h-full min-h-[400px] flex-grow overflow-hidden'>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <Label htmlFor="auto-refresh">Auto Refresh</Label>
                    <Switch id="auto-refresh" checked={autoRefresh} onCheckedChange={setAutoRefresh} />
                </div>

                <ToggleGroup type="multiple" value={[
                    wrapLines ? 'wrap' : '',
                    showSearch ? 'search' : '',
                    showLineNumbers ? 'line-numbers' : ''
                ].filter(Boolean)}>
                    <ToggleGroupItem value='line-numbers' onClick={() => setShowLineNumbers(!showLineNumbers)} className="flex items-center gap-2">
                        <ListOrdered className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value='wrap' onClick={() => setWrapLines(!wrapLines)} className="flex items-center gap-2">
                        <WrapText className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value='search' onClick={() => setShowSearch(!showSearch)} className="flex items-center gap-2">
                        <Search className="h-4 w-4" />
                    </ToggleGroupItem>
                </ToggleGroup>
            </div>

            <div className="h-full flex-grow overflow-hidden rounded-2xl">
                <LazyLog
                    caseInsensitive
                    enableLineNumbers={showLineNumbers}
                    enableSearch={showSearch}
                    selectableLines
                    extraLines={5}
                    wrapLines={wrapLines}
                    text={logs}
                    // url="https://gist.githubusercontent.com/helfi92/96d4444aa0ed46c5f9060a789d316100/raw/ba0d30a9877ea5cc23c7afcd44505dbc2bab1538/typical-live_backing.log"
                    follow={true}
                />
            </div>
        </div>
    )
}