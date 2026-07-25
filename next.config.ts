import type { NextConfig } from 'next';

// next loads .env.local automatically now, and inlines anything prefixed with
// NEXT_PUBLIC_ into the browser bundle. The key is public either way once this
// is exported -- what protects it is the HTTP referrer restriction on the
// domain. Keeping it in .env.local just keeps it out of this public repo.
if (!process.env.NEXT_PUBLIC_GCP_MAPS_API) {
    throw new Error(
        'NEXT_PUBLIC_GCP_MAPS_API is missing -- set it in .env.local or in the Vercel project environment, or the build ships key=undefined'
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
