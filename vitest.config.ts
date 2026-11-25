import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'

export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@lucentis/headless-ui-core': resolve(__dirname, 'packages/core/src/index.ts'),
        },
    },
    test: {
        environment: 'happy-dom',
        include: ['packages/*/src/**/*.test.ts'],
    },
})
