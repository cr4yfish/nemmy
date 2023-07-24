const withPWA = require('next-pwa')({
    dest: "public",
    register: true,
    mode: "production"
})

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "lemmy.**"
            },
            {
                protocol: "https",
                hostname: "**.**" // match everything, is this a good idea? One way to find out I guess
            }
        ]
    },
    reactStrictMode: false
}

module.exports = withPWA( nextConfig ) 
