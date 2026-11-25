import type { NextConfig } from 'next';
const nextConfig: NextConfig={output:'standalone',outputFileTracingExcludes:{'*':['./data/**/*','./.env*']},outputFileTracingIncludes:{'/*':['./node_modules/next/dist/**/*']},serverExternalPackages:['node:sqlite','pg'],async headers(){return [{source:'/:path*',headers:[{key:'X-Content-Type-Options',value:'nosniff'},{key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},{key:'X-Frame-Options',value:'DENY'}]}];}};
export default nextConfig;
