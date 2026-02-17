/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable the app router and server components; this is the default in Next.js 14.
  experimental: {
    serverComponentsExternalPackages: ["@supabase/supabase-js", "@supabase/auth-helpers-nextjs"],
  },
  typescript: {
    // Set to true to avoid build failures when first setting up the project.
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;