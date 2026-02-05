import pluginPrettier from 'eslint-config-prettier';
import pluginJest from 'eslint-plugin-jest';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  tseslint.configs.recommended,
  pluginPrettier,
  {
    languageOptions: {
        ecmaVersion: 2024,
    },
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: { jest: pluginJest },
  },
);
