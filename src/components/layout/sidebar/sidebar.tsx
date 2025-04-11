"use client"
// Reference:
// https://ui.shadcn.com/blocks/sidebar
import * as React from "react"

import {
    Sidebar,
    SidebarContent,
    SidebarRail,
} from "@/components/ui/sidebar"

import { NavMain } from "@/components/layout/sidebar/nav-main"
import { NavSecondary } from "@/components/layout/sidebar/nav-secondary"
import { navData } from "@/components/layout/routes"

import { AppSidebarHeader } from "@/components/layout/sidebar/header"


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar collapsible="icon" {...props}>
            <AppSidebarHeader />
            <SidebarContent>
                <NavMain items={navData.navMain} />
                <NavSecondary items={navData.navSecondary} className="mt-auto" />
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    )
}