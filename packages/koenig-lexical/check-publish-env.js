import 'dotenv/config';

// The Sentry auth token is only consumed when building a shipping bundle
// (IS_SHIPPING enables sentryVitePlugin, which uploads source maps). CI
// publishes that don't set IS_SHIPPING never use the token, so only enforce
// it when a shipping build would actually need it — otherwise the version
// bump (preversion hook) blocks every auto-publish in CI.
if (process.env.IS_SHIPPING && !process.env.VITE_SENTRY_AUTH_TOKEN) {
    throw new Error('VITE_SENTRY_AUTH_TOKEN is not set in your .env file - this is required when publishing a shipping (IS_SHIPPING) build');
}
