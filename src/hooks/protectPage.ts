import { authClient } from "@/lib/auth-client";
import { useRouter, usePathname } from "next/navigation";
import React from "react";
import { toast } from "sonner";


interface ProtectPageOptions {
    redirectTo?: string;
    message?: string;
    description?: string;
    afterLogin?: string;
}

const useProtectPage = ({
    redirectTo = "/auth/login",
    message = "You must be logged in to view this page",
    description = "Redirecting to login page...",
    afterLogin: afterLoginProp
}: ProtectPageOptions = {}) => {
    const router = useRouter();
    const pathname = usePathname();
    const { data: session } = authClient.useSession();

    const afterLogin = afterLoginProp ?? pathname;

    React.useEffect(() => {
        if (!session?.user?.email) {
            toast.error(message, {
                duration: 5000,
                description,
            });

            const redirectPath = `${redirectTo}?afterLogin=${encodeURIComponent(afterLogin)}`

            const timer = setTimeout(() => {
                router.push(redirectPath);
            }, 100); // Add a 100ms delay before redirecting

            // Cleanup function to clear the timeout if the component unmounts
            // or dependencies change before the timeout finishes
            return () => clearTimeout(timer);
        }
    }, [session, message, description, redirectTo, afterLogin, router]);
};

export default useProtectPage;
