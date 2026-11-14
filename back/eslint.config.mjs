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
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      curly: ['error', 'all'],
      'no-console': 'error',
      'max-lines': [
        'error',
        { max: 400, skipBlankLines: true, skipComments: true },
      ],
      '@typescript-eslint/consistent-type-assertions': [
        'error',
        { assertionStyle: 'never' },
      ],
      '@typescript-eslint/no-non-null-assertion': 'error',
      'no-restricted-globals': [
        'error',
        {
          name: 'setTimeout',
          message: 'React to the event that justifies the delay.',
        },
        {
          name: 'setInterval',
          message: 'React to the event that justifies the repetition.',
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSSatisfiesExpression',
          message: 'Annotate what receives the value.',
        },
        {
          selector:
            'TSTypeReference[typeName.name=/^(Partial|Omit|Pick|Record)$/]',
          message: 'Declare the shape, or use an enum and a switch.',
        },
        {
          selector: 'TSMappedType',
          message: 'Declare the shape, or use an enum and a switch.',
        },
        {
          selector: 'TSConditionalType',
          message: 'Declare the shape, or use function overloads.',
        },
        {
          selector: 'TSUnionType > TSLiteralType > Literal[raw=/^["\']/]',
          message: 'Declare an enum.',
        },
      ],
    },
  },
);
