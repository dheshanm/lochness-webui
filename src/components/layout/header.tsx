"use client"
import * as React from "react"
import { useEffect, useMemo, useState } from "react"

import {
    SidebarTrigger
} from "@/components/ui/sidebar"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { usePathname } from "next/navigation"
import { navData } from "@/components/layout/routes"
import { ModeToggle } from "@/components/layout/themeTogge"

interface Breadcrumb {
    title: string;
    url: string;
    isActive: boolean;
}

export default function AppHeader() {
    const { navMain } = navData
    const pathname = usePathname() || ''
    const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([])

    // Generate breadcrumbs based on the current path using useMemo
    const generateBreadcrumbs = useMemo(() => {
        const result: Breadcrumb[] = []

        // Add home as the first breadcrumb
        result.push({
            title: "Home",
            url: "/",
            isActive: pathname === "/"
        })

        // Find matching nav items for the current path
        for (const section of navMain) {
            if (pathname.includes(section.url) || section.url === "#") {
                if (section.url !== "#") {
                    result.push({
                        title: section.title,
                        url: section.url,
                        isActive: pathname === section.url
                    })
                }

                // Check for matching sub-items
                if (section.items) {
                    for (const item of section.items) {
                        if (pathname.includes(item.url)) {
                            if (section.url == "#") {
                                result.push({
                                    title: section.title,
                                    url: section.url,
                                    isActive: pathname === section.url
                                })
                            }
                            result.push({
                                title: item.title,
                                url: item.url,
                                isActive: pathname === item.url
                            })
                        }
                    }
                }
            }
        }

        return result
    }, [pathname, navMain])

    // Update breadcrumbs when pathname changes
    useEffect(() => {
        setBreadcrumbs(generateBreadcrumbs)
    }, [generateBreadcrumbs])

    return (
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-background">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
                <BreadcrumbList>
                    {breadcrumbs.map((crumb, index) => (
                        <React.Fragment key={crumb.url}>
                            <BreadcrumbItem className={index === 0 ? "hidden md:block" : ""}>
                                {crumb.isActive ? (
                                    <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink href={crumb.url}>
                                        {crumb.title}
                                    </BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                            {index < breadcrumbs.length - 1 && (
                                <BreadcrumbSeparator className={index === 0 ? "hidden md:block" : ""} />
                            )}
                        </React.Fragment>
                    ))}
                </BreadcrumbList>
            </Breadcrumb>
            <div className="ml-auto flex items-center gap-2">
                <ModeToggle />
            </div>
        </header>
    )
}
