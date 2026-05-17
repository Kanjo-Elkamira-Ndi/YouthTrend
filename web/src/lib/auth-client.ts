import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

export const { signIn, signUp, signOut, useSession } = authClient;
