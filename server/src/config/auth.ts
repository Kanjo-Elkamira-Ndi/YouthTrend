/**
 * Better Auth configuration for YouthTrend.
 *
 * Handles:
 *   - Email + password (primary method)
 *   - Social OAuth: Google, Facebook, Apple, X
 *   - Email verification on signup
 *   - Password reset via email
 *   - Session management (cookie-based)
 *
 * Social providers are enabled only when their env vars are present,
 * so the server starts cleanly in development without any OAuth keys.
 *
 * Database: uses Kysely PostgresDialect wrapping the same pg pool
 * that the rest of the app uses.
 */

import { betterAuth } from 'better-auth';
import { Pool } from 'pg';
import { PostgresDialect } from 'kysely';
import { env } from './env';

// ── Kysely dialect wrapping our pg pool ───────────────────────────────────────
const dialect = new PostgresDialect({
  pool: new Pool({ connectionString: env.DATABASE_URL }),
});

// ── Email service stub (temporary until fully implemented) ────────────────────
// Replace with actual EmailService import when ready
const EmailService = {
  sendVerificationEmail: async ({ to, name, url }: { to: string; name: string; url: string }) => {
    console.log(`[Email Stub] Send verification email to ${to}: ${url}`);
    // In development, just log the URL
    if (env.NODE_ENV === 'development') {
      console.log(`[Email Stub] Verification URL: ${url}`);
    }
  },
  sendPasswordResetEmail: async ({ to, name, url }: { to: string; name: string; url: string }) => {
    console.log(`[Email Stub] Send password reset email to ${to}: ${url}`);
  },
};

// ── Social provider config (conditionally included) ───────────────────────────
type SocialProviders = Parameters<typeof betterAuth>[0]['socialProviders'];

const socialProviders: SocialProviders = {};

if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  socialProviders.google = {
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
  };
  console.log('[Auth] Google OAuth: enabled');
} else {
  console.log('[Auth] Google OAuth: disabled (missing credentials)');
}

if (env.FACEBOOK_APP_ID && env.FACEBOOK_APP_SECRET) {
  socialProviders.facebook = {
    clientId: env.FACEBOOK_APP_ID,
    clientSecret: env.FACEBOOK_APP_SECRET,
  };
  console.log('[Auth] Facebook OAuth: enabled');
} else {
  console.log('[Auth] Facebook OAuth: disabled (missing credentials)');
}

if (env.APPLE_CLIENT_ID && env.APPLE_CLIENT_SECRET) {
  socialProviders.apple = {
    clientId: env.APPLE_CLIENT_ID,
    clientSecret: env.APPLE_CLIENT_SECRET,
  };
  console.log('[Auth] Apple OAuth: enabled');
} else {
  console.log('[Auth] Apple OAuth: disabled (missing credentials)');
}

if (env.X_CLIENT_ID && env.X_CLIENT_SECRET) {
  socialProviders.twitter = {
    clientId: env.X_CLIENT_ID,
    clientSecret: env.X_CLIENT_SECRET,
  };
  console.log('[Auth] X (Twitter) OAuth: enabled');
} else {
  console.log('[Auth] X (Twitter) OAuth: disabled (missing credentials)');
}

// ── Better Auth instance ──────────────────────────────────────────────────────

export const auth = betterAuth({
  // ── Identity ───────────────────────────────────────────────────────────────
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,

  // ── Database ───────────────────────────────────────────────────────────────
  database: {
    dialect,
    type: 'postgresql',
  },

  // ── Email + password ───────────────────────────────────────────────────────
  emailAndPassword: {
    enabled: true,

    // Temporarily disable email verification in development
    // Change to true when email service is ready
    requireEmailVerification: env.NODE_ENV === 'production',

    // Called by Better Auth when it needs to send a verification email
    sendVerificationEmail: async ({ user, url }: { user: { email: string; name: string }; url: string }) => {
      await EmailService.sendVerificationEmail({
        to: user.email,
        name: user.name,
        url,
      });
    },

    // Called when a password reset is requested
    sendResetPassword: async ({ user, url }: { user: { email: string; name: string }; url: string }) => {
      await EmailService.sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        url,
      });
    },
  },

  // ── Email verification config ──────────────────────────────────────────────
  emailVerification: {
    sendOnSignUp: env.NODE_ENV === 'production', // Only send in production
    autoSignInAfterVerification: true,
    expiresIn: 60 * 60 * 24, // 24 hours
  },

  // ── Social providers (only those with credentials) ────────────────────────
  socialProviders,

  // ── Session ────────────────────────────────────────────────────────────────
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh if accessed and > 1 day old
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes client-side cache
    },
  },

  // ── Trusted origins (CORS) ────────────────────────────────────────────────
  trustedOrigins: env.CORS_ORIGIN.split(',').map((o) => o.trim()),

  // ── IMPORTANT: Don't use additionalFields if you have a custom users table
  // Instead, let Better Auth use your existing users table via modelName
  user: {
    // Tell Better Auth to use your existing 'users' table instead of creating its own
    modelName: 'users',
    
    // Map Better Auth's expected fields to your actual column names
    fields: {
      id: 'id',
      name: 'name',
      email: 'email',
      emailVerified: 'email_verified', // or 'emailVerified' if camelCase
      image: 'avatar',
      createdAt: 'created_at', // or 'createdAt'
      updatedAt: 'updated_at', // or 'updatedAt'
    },
  },

  advanced: {
    // Use 'lax' so cookies work with cross-origin OAuth redirects
    // but are still protected against CSRF for same-site requests.
    crossSubDomainCookies: { enabled: false },
    defaultCookieAttributes: {
      sameSite: 'lax',
      secure: env.NODE_ENV === 'production',
    },
  },
});

export type Auth = typeof auth;