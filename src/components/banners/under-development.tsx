"use client"
import { Info, X } from "lucide-react"
import { useState } from "react"
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert"

export default function UnderDevelopment() {
    const [isVisible, setIsVisible] = useState(true)

    if (!isVisible) return null

    return (
        <Alert className="relative">
            <Info className="h-4 w-4" />
            <AlertTitle>Under Development</AlertTitle>
            <AlertDescription className="text-xs">
                This page is currently under development. Please check back later for updates.
            </AlertDescription>
            <button 
                onClick={() => setIsVisible(false)}
                className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100"
                aria-label="Dismiss"
            >
                <X className="h-3 w-3" />
            </button>
        </Alert>
    )
}
