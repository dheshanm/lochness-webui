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
import Link from "next/link";
import { usePathname } from "next/navigation";

function ActiveProjectsSidebarList() {
    const [projects, setProjects] = React.useState([]);
    const pathname = usePathname();
    React.useEffect(() => {
        fetch("/api/v1/projects?limit=100&offset=0")
            .then(res => res.json())
            .then(data => {
                setProjects((data.rows || []).filter((p: any) => p.project_is_active));
            });
    }, []);
    if (!projects.length) return null;
    return (
        <div className="mt-6">
            <div className="text-xs font-semibold text-muted-foreground px-3 mb-1">Active Projects</div>
            <ul className="space-y-1 px-2">
                {projects.map((project: any) => {
                    const isActive = pathname === `/config/projects/${project.project_id}`;
                    return (
                        <li key={project.project_id}>
                            <Link
                                href={`/config/projects/${project.project_id}`}
                                className={`block rounded px-2 py-1 text-sm truncate transition-colors ${isActive ? "bg-accent text-accent-foreground font-semibold" : "hover:bg-accent hover:text-accent-foreground"}`}
                                aria-current={isActive ? "page" : undefined}
                            >
                                {project.project_name}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

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
        <Sidebar collapsible="icon" {...props}>
            <AppSidebarHeader />
            <SidebarContent>
                <NavMain items={navData.navMain} />
                <ActiveProjectsSidebarList />
                <NavSecondary items={navData.navSecondary} className="mt-auto" />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={userData} signOutHandler={signOutHandler} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}