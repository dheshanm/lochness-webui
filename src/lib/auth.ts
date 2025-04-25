// Reference:
// https://www.better-auth.com/docs/installation
// https://www.better-auth.com/docs/authentication/email-password

import { betterAuth } from "better-auth";

import { getConnection } from "@/lib/db";

export const auth = betterAuth({
    database: getConnection(),
    emailAndPassword: {
        enabled: true,
        minPasswordLength: 2,
        autoSignIn: false,
    },
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.NEXTAUTH_URL,
})
