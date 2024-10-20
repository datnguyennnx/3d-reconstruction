import { vitePlugin as remix } from '@remix-run/dev'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import svgr from 'vite-plugin-svgr'

export default defineConfig({
    plugins: [
        remix(),
        tsconfigPaths(),
        svgr({
            svgrOptions: {
                exportType: 'named',
                ref: true,
                svgo: false,
                titleProp: true,
            },
            include: '**/*.svg',
        }),
    ],
    css: {
        postcss: {
            plugins: [tailwindcss, autoprefixer],
        },
    },
    optimizeDeps: {
        include: ['react-syntax-highlighter'],
    },
})
