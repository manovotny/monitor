module.exports = {
    experimental: {
        images: {
            remotePatterns: [
                {
                    hostname: 'is*-ssl.mzstatic.com',
                    protocol: 'https',
                },
            ],
        },
    },
};
