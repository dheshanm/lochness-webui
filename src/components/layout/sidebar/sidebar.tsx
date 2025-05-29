"use client"
// Reference:
// https://ui.shadcn.com/blocks/sidebar
import * as React from "react"

import {
    Sidebar,
    SidebarContent,
    SidebarRail,
    SidebarFooter,
} from "@/components/ui/sidebar"

import { NavMain } from "@/components/layout/sidebar/nav-main"
import { NavSecondary } from "@/components/layout/sidebar/nav-secondary"
import { NavUser } from "@/components/layout/sidebar/nav-user"
import { navData } from "@/components/layout/routes"

import { AppSidebarHeader } from "@/components/layout/sidebar/header"

import { authClient } from "@/lib/auth-client"


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { data: session } = authClient.useSession()
    const userData = React.useMemo(() => {
        if (session?.user) {
            const { name, email, image } = session.user
            return {
                name: name || "Lochness User",
                email: email || "",
                avatar: image || "",
            }
        }
        return {
            name: "Log In",
            email: "",
            avatar: "",
        }
    }, [session])

    const signOutHandler = React.useCallback(() => {
        authClient.signOut()
    }, [])


    return (
        <Sidebar 
            collapsible="icon"
            {...props}
        >
            <AppSidebarHeader />
            <SidebarContent>
                <NavMain items={navData.navMain} />
                <NavSecondary items={navData.navSecondary} className="mt-auto" />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={userData} signOutHandler={signOutHandler} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}