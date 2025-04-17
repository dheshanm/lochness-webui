import Link from 'next/link'

import { GalleryHorizontal, Plus, MapPinPlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { SkeletonCard } from "@/components/placeholders/card"


export default function SitesListPlaceholder() {
    return (

        <div className="space-y-6 min-w-[320px]">
            <div className="bg-gray-50 dark:bg-slate-800/70 rounded-lg shadow p-6 transition-all border border-gray-200 dark:border-purple-900/30">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-medium text-gray-800 dark:text-purple-100 flex items-center gap-2">
                        <span><MapPinPlus className="h-6 w-6" /></span> Active Sites
                    </h2>
                    <div className="flex space-x-2">
                        <Button asChild variant="outline" size="sm" className="flex items-center gap-2 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 hover:bg-purple-100/50 dark:hover:bg-purple-900/30">
                            <Link href="/config/sites" className="flex items-center gap-2">
                                <GalleryHorizontal className="h-4 w-4" />
                                <span className="hidden sm:inline">View All Sites</span>
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm" className="flex items-center gap-2 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 hover:bg-purple-100/50 dark:hover:bg-purple-900/30">
                            <Link href="#" className="flex items-center gap-2">
                                <Plus className="h-4 w-4" />
                                <span className="hidden sm:inline">Add Site</span>
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </div>
            </div>
        </div>
    )
}