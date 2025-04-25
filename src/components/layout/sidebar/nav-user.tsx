"use client"
import Link from 'next/link'
import {
    BadgeCheck,
    Bell,
    ChevronsUpDown,
    LogOut,
    LogIn,
    UserRoundPlus,
    Hand
} from "lucide-react"

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    // DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import React from "react"

export function NavUser({
    user,
    signOutHandler,
}: {
    user: {
        name: string
        email: string
        avatar: string
    },
    signOutHandler: () => void;
}) {
    const { isMobile } = useSidebar()

    const userFirstLetter = user.name.charAt(0).toUpperCase()

    const userElement: React.ReactNode = user.email !== "" ? (
        <>
            <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">{userFirstLetter}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
            </div>
        </>
    ) : (
        <>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <LogIn className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Not Logged In</span>
            </div>
        </>
    )

    // Dynamically construct DropDownMenu
    const contextMenu: React.ReactNode = user.email !== "" ? (
        <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
        >
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    {userElement}
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {/* <DropdownMenuGroup>
                <DropdownMenuItem>
                    <BadgeCheck />
                    Account
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Bell />
                    Notifications
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator /> */}
            <DropdownMenuItem onClick={signOutHandler}>
                <LogOut />
                Log out
            </DropdownMenuItem>
        </DropdownMenuContent>
    ) : (
        <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
        >
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        <Hand className="size-4" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">Hello!</span>
                        <span className="truncate text-xs">Please log in!</span>
                    </div>
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link href="/auth/login">
                <DropdownMenuItem>
                    <LogIn />
                    Log in
                </DropdownMenuItem>
            </Link>
            <Link href="/auth/register">
                <DropdownMenuItem>
                    <UserRoundPlus />
                    Register
                </DropdownMenuItem>
            </Link>
        </DropdownMenuContent>
    )

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            {userElement}
                            <ChevronsUpDown className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    {contextMenu}
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
