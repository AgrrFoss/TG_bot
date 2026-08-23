// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      // 2. Утихомириваем проверки "unsafe" операций с any (самые раздражающие правила)
      '@typescript-eslint/no-unsafe-assignment': 'off', // <- Убирает ошибку "Unsafe assignment of an any value"
      '@typescript-eslint/no-unsafe-member-access': 'off', // <- Разрешает читать свойства у any (например, body.type)
      '@typescript-eslint/no-unsafe-call': 'off', // <- Разрешает вызывать методы у any
      '@typescript-eslint/no-unsafe-return': 'off', // <- Разрешает возвращать any из функций

      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
    },
  },
);