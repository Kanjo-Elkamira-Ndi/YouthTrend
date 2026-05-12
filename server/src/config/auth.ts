import { betterAuth }      from 'better-auth';
import { Pool }            from 'pg';
import { PostgresDialect } from 'kysely';
import { env }             from './env';
import { EmailService }    from '../services/email.service';

const dialect = new PostgresDialect({
  pool: new Pool({ connectionString: env.DATABASE_URL }),
});

type SocialProviders = Parameters<typeof betterAuth>[0]['socialProviders'];
const socialProviders: SocialProviders = {};

if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  socialProviders.google = { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET };
  console.log('[Auth] Google OAuth: enabled');
}
if (env.FACEBOOK_APP_ID && env.FACEBOOK_APP_SECRET) {
  socialProviders.facebook = { clientId: env.FACEBOOK_APP_ID, clientSecret: env.FACEBOOK_APP_SECRET };
  console.log('[Auth] Facebook OAuth: enabled');
}
if (env.APPLE_CLIENT_ID && env.APPLE_CLIENT_SECRET) {
  socialProviders.apple = { clientId: env.APPLE_CLIENT_ID, clientSecret: env.APPLE_CLIENT_SECRET };
  console.log('[Auth] Apple OAuth: enabled');
}
if (env.X_CLIENT_ID && env.X_CLIENT_SECRET) {
  socialProviders.twitter = { clientId: env.X_CLIENT_ID, clientSecret: env.X_CLIENT_SECRET };
  console.log('[Auth] X (Twitter) OAuth: enabled');
}

export const auth = betterAuth({
  secret:  env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,

  database: {
    dialect,
    type: 'postgres',
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }: { user: { email: string; name: string }; url: string }) => {
      await EmailService.sendPasswordResetEmail({ to: user.email, name: user.name, url });
    },
  },

  emailVerification: {
    sendOnSignUp:                true,
    sendOnSignIn:                true,
    autoSignInAfterVerification: true,
    expiresIn:                   60 * 60 * 24,
    sendVerificationEmail: async ({ user, url }: { user: { email: string; name: string }; url: string }) => {
      await EmailService.sendVerificationEmail({ to: user.email, name: user.name, url });
    },
  },

  socialProviders,

  session: {
    expiresIn:  60 * 60 * 24 * 7,
    updateAge:  60 * 60 * 24,
    cookieCache: { enabled: true, maxAge: 60 * 5 },
  },

  trustedOrigins: env.CORS_ORIGIN.split(',').map((o: string) => o.trim()),

  // NOTE: campusId and ytRole are added to the "user" table via raw SQL
  // in run-better-auth-migrations.mjs — not via additionalFields here.
  // This avoids a Kysely column type resolution bug with additionalFields
  // in Better Auth v1.6.x on Node v24.

  advanced: {
    defaultCookieAttributes: {
      sameSite: 'lax',
      secure:   env.NODE_ENV === 'production',
    },
  },
});

export type Auth = typeof auth;
