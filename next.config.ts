import type { NextConfig } from 'next';

// next inlines anything prefixed with NEXT_PUBLIC_ into the browser bundle, so
// the key ends up public in the export no matter what -- the HTTP referrer
// restriction on the domain is what actually protects it.
//
// Which file wins depends on NODE_ENV. `next build` reads .env.production (the
// domain-restricted key); `next dev` reads .env.development.local (the
// local-only key, gitignored). Note .env.local would outrank BOTH, which is why
// the local key doesn't live there -- it would leak into production builds.
if (!process.env.NEXT_PUBLIC_GCP_MAPS_API) {
    throw new Error(
        'NEXT_PUBLIC_GCP_MAPS_API is missing -- expected it in .env.production (builds) or .env.development.local (dev), or the build ships key=undefined'
    );
}

const nextConfig: NextConfig = {
    // Static site: `next build` writes the whole thing to out/.
    output: 'export',

    // There's a stray lockfile in a parent directory; without this turbopack
    // infers that as the workspace root.
    turbopack: {
        root: import.meta.dirname,
    },

    compiler: {
        styledComponents: true,
    },

    productionBrowserSourceMaps: true,
};

export default nextConfig;
