// @ts-check

import eslint from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import tseslint from 'typescript-eslint'
import eslintConfigPrettier from 'eslint-config-prettier/flat'

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  eslintConfigPrettier,
  globalIgnores(['dist/**', 'dev-dist/**', 'node_modules/**'])
)
