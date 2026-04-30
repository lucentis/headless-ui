import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'

export default defineConfig({
    plugins: [vue()],
    // resolve: {
    //     alias: {
    //         '@lucentis/headless-ui-core': resolve(__dirname, '../core/src/index.ts'),
    //     },
    // },
})