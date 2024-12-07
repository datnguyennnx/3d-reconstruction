module.exports = {
    webpack(config) {
        // Grab the existing rule that handles SVG imports
        const fileLoaderRule = config.module.rules.find((rule) => rule.test?.test?.('.svg'))

        config.module.rules.push(
            // Reapply the existing rule, but only for svg imports ending in ?url
            {
                ...fileLoaderRule,
                test: /\.svg$/i,
                resourceQuery: /url/, // *.svg?url
            },
            // Convert all other *.svg imports to React components
            {
                test: /\.svg$/i,
                issuer: fileLoaderRule.issuer,
                resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] }, // exclude if *.svg?url
                use: ['@svgr/webpack'],
            },
        )

        // Modify the file loader rule to ignore *.svg, since we have it handled now.
        fileLoaderRule.exclude = /\.svg$/i

        return config
    },
    transpilePackages: ['three'],

    env: {
        NEXT_PUBLIC_API_URL: 'http://localhost:8000',
        NEXT_PUBLIC_3D_MODEL_API_ENDPOINT: 'https://0d00-2405-4802-9019-5ea0-85ed-7fea-cab5-4fdb.ngrok-free.app/predict'
    },

    // ...other config
}
