import { MapPinned } from "lucide-react"

import { Heading } from '@/components/heading'

import SitesListPlaceholder from "@/components/placeholders/config/sites"


export default function ConfigPage() {
    return (
        <div className="container mx-auto p-6 max-w-5xl">
            <Heading icon={<MapPinned className="h-8 w-8" />} title="Sites" />

            <div className="space-y-6 min-w-[320px]">
                <SitesListPlaceholder />
            </div>
        </div>
    )
}