const withPWA = require('next-pwa')({
    dest: "public",
})

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "lemmy.**"
            }
        ]
    },
    reactStrictMode: false
}

module.exports = withPWA( nextConfig ) 
