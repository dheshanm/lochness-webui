import { Settings } from "lucide-react";

import { Heading } from '@/components/heading';

import ProjectsList from '@/components/lists/projects';
// import SitesListPlaceholder from "@/components/placeholders/config/sites"


export default function ConfigPage() {
    return (
        <div className="container mx-auto p-6 max-w-5xl">
            <Heading icon={< Settings className="h-8 w-8" />} title="Configuration" />

            <div className="space-y-6 min-w-[320px]">

                <ProjectsList />

                {/* <SitesListPlaceholder /> */}

            </div>
        </div>
    )
}