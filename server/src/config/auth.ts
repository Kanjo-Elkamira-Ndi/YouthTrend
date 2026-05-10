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

import { betterAuth }      from 'better-auth';
import { Pool }            from 'pg';
import { PostgresDialect } from 'kysely';
import { env }             from './env';
import { EmailService }    from '../services/email.service';

// ── Kysely dialect wrapping our pg pool ───────────────────────────────────────
const dialect = new PostgresDialect({
  pool: new Pool({ connectionString: env.DATABASE_URL }),
});

// ── Social provider config (conditionally included) ───────────────────────────

type SocialProviders = Parameters<typeof betterAuth>[0]['socialProviders'];

const socialProviders: SocialProviders = {};

if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  socialProviders.google = {
    clientId:     env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
  };
  console.log('[Auth] Google OAuth: enabled');
}

if (env.FACEBOOK_APP_ID && env.FACEBOOK_APP_SECRET) {
  socialProviders.facebook = {
    clientId:     env.FACEBOOK_APP_ID,
    clientSecret: env.FACEBOOK_APP_SECRET,
  };
  console.log('[Auth] Facebook OAuth: enabled');
}

if (env.APPLE_CLIENT_ID && env.APPLE_CLIENT_SECRET) {
  socialProviders.apple = {
    clientId:     env.APPLE_CLIENT_ID,
    clientSecret: env.APPLE_CLIENT_SECRET,
  };
  console.log('[Auth] Apple OAuth: enabled');
}

if (env.X_CLIENT_ID && env.X_CLIENT_SECRET) {
  socialProviders.twitter = {
    clientId:     env.X_CLIENT_ID,
    clientSecret: env.X_CLIENT_SECRET,
  };
  console.log('[Auth] X (Twitter) OAuth: enabled');
}

// ── Better Auth instance ──────────────────────────────────────────────────────

export const auth = betterAuth({
  // ── Identity ───────────────────────────────────────────────────────────────
  secret:  env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,

  // ── Database ───────────────────────────────────────────────────────────────
  database: {
    dialect,
    type: 'postgresql',
  },

  // ── Email + password ───────────────────────────────────────────────────────
  emailAndPassword: {
    enabled: true,

    // Require email verification before the account is usable
    requireEmailVerification: true,

    // Called by Better Auth when it needs to send a verification email
    sendVerificationEmail: async ({ user, url }: { user: { email: string; name: string }; url: string }) => {
      await EmailService.sendVerificationEmail({
        to:   user.email,
        name: user.name,
        url,
      });
    },

    // Called when a password reset is requested
    sendResetPassword: async ({ user, url }: { user: { email: string; name: string }; url: string }) => {
      await EmailService.sendPasswordResetEmail({
        to:   user.email,
        name: user.name,
        url,
      });
    },
  },

  // ── Email verification config ──────────────────────────────────────────────
  emailVerification: {
    sendOnSignUp:           true,          // send automatically on register
    autoSignInAfterVerification: true,     // sign in immediately after verifying
    expiresIn:              60 * 60 * 24,  // 24 hours
  },

  // ── Social providers (only those with credentials) ────────────────────────
  socialProviders,

  // ── Session ────────────────────────────────────────────────────────────────
  session: {
    expiresIn:          60 * 60 * 24 * 7,   // 7 days
    updateAge:          60 * 60 * 24,        // refresh if accessed and > 1 day old
    cookieCache: {
      enabled: true,
      maxAge:  60 * 5,                       // 5 minutes client-side cache
    },
  },

  // ── Trusted origins (CORS) ────────────────────────────────────────────────
  trustedOrigins: env.CORS_ORIGIN.split(',').map((o) => o.trim()),

  // ── Additional user fields persisted by Better Auth ───────────────────────
  // These extend the built-in "user" table with app-specific columns.
  user: {
    additionalFields: {
      // We store the YouthTrend campus and role here so the frontend
      // can read them from the session without an extra API call.
      campusId: {
        type:     'string',
        required: false,
        defaultValue: null,
        input:    true,    // client may supply on signup
      },
      ytRole: {
        type:         'string',
        required:     false,
        defaultValue: 'reader',
        input:        false,   // set server-side only
      },
    },
  },

  advanced: {
    // Use 'lax' so cookies work with cross-origin OAuth redirects
    // but are still protected against CSRF for same-site requests.
    crossSubDomainCookies: { enabled: false },
    defaultCookieAttributes: {
      sameSite: 'lax',
      secure:   env.NODE_ENV === 'production',
    },
  },
});

export type Auth = typeof auth;