import {dirname} from 'path';
import {fileURLToPath} from 'url';
import {FlatCompat} from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      indent: ['error', 2],
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
      'space-infix-ops': 'error',
      'keyword-spacing': 'error',
      'eol-last': 'error',

      'comma-dangle': ['error', {
        arrays: 'never',
        objects: 'only-multiline',
        imports: 'never',
        exports: 'never',
        functions: 'never',
      }],

      'object-curly-spacing': 'error',
      'space-before-function-paren': ['error', 'always'],
      'space-before-blocks': ['error', 'always'],
      'arrow-spacing': 'error',
    }
  }
];

export default eslintConfig;
