import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
    globalIgnores(['**/dist/**', '**/node_modules/**']),

    js.configs.recommended,
    tseslint.configs.recommended,
    pluginVue.configs['flat/essential'],

    {
        files: ['**/*.vue'],
        languageOptions: {
            parserOptions: { parser: tseslint.parser },
        },
    },

    {
        rules: {
            // TypeScript already reports undefined identifiers
            'no-undef': 'off',
            // `interface XApi extends ComponentApi<...> {}` is the library convention
            '@typescript-eslint/no-empty-object-type': ['error', { allowInterfaces: 'with-single-extends' }],
        },
    },
])