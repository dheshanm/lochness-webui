import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";


interface ProtectPageOptions {
    redirectTo?: string;
    message?: string;
    description?: string;
}

const useProtectPage = ({
    redirectTo = "/auth/login",
    message = "You must be logged in to view this page",
    description = "Redirecting to login page...",
}: ProtectPageOptions = {}) => {
    const router = useRouter();
    const { data: session } = authClient.useSession();

    React.useEffect(() => {
        if (!session?.user?.email) {
            toast.error(message, {
                duration: 5000,
                description,
            });
            router.push(redirectTo);
        }
    }, [session, message, description, redirectTo, router]);
};

export default useProtectPage;
