import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";

interface RedirectFromAuthOptions {
    redirectTo?: string;
    message?: string;
    description?: string;
}

/**
 * Custom hook to redirect authenticated users away from certain pages (e.g., login, signup).
 * If a user session exists (checked via `authClient.useSession`), it displays a toast notification
 * indicating the user is already logged in and redirects them to the specified route.
 * The toast notification includes an action button to log out.
 *
 * @param {RedirectFromAuthOptions} [options] - Optional configuration for the redirect behavior.
 * @param {string} [options.redirectTo="/"] - The path to redirect the user to if they are authenticated. Defaults to "/".
 * @param {string} [options.message="Already logged in"] - The main message displayed in the toast notification. Defaults to "Already logged in".
 * @param {string} [options.description="Redirecting to home page..."] - The description displayed in the toast notification. Defaults to "Redirecting to home page...".
 *
 * @example
 * ```tsx
 * // In a login page component
 * import { useAuthRedirect } from '@/hooks/useAuthRedirect';
 *
 * const LoginPage = () => {
 *   useAuthRedirect({ redirectTo: '/dashboard' });
 *
 *   // Render login form
 *   return (
 *     // ... login form JSX
 *   );
 * };
 * ```
 */
const useAuthRedirect = ({
    redirectTo = "/",
    message = "Already logged in",
    description = "Redirecting to home page...",
}: RedirectFromAuthOptions = {}) => {
    const router = useRouter();
    const { data: session } = authClient.useSession();

    React.useEffect(() => {
        if (session?.user?.email) {
            toast.message(message, {
                duration: 5000,
                description,
                action: {
                    label: "Logout",
                    onClick: () => {
                        authClient.signOut().catch((error) => {
                            console.error("Logout failed:", error);
                            toast.error("Failed to log out.");
                        });
                    },
                },
            });
            router.push(redirectTo);
        }
    }, [session, router, message, description, redirectTo]);
};

export default useAuthRedirect;