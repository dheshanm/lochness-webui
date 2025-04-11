import Link from 'next/link'

import { ArrowBigLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4 text-center">
            <div className="mb-8">
                <h1 className="text-9xl font-extrabold text-foreground">404</h1>
                <p className="text-2xl font-semibold text-muted-foreground mt-2">Page Not Found</p>
            </div>

            <p className="text-muted-foreground mb-8 max-w-md">
                Sorry, we could not find the resource you were looking for.
            </p>

            <Button asChild size="lg" className="mb-4">
                <Link href="/">
                    <ArrowBigLeft className="mr-2" /> Return Home
                </Link>
            </Button>
        </div>
    )
}