// eslint.config.js
import eslintJs from '@eslint/js';
import nPlugin from 'eslint-plugin-n'; // Changed from eslint-plugin-node
import promisePlugin from 'eslint-plugin-promise';
import importPlugin from 'eslint-plugin-import';
import globals from 'globals';

export default [
    {
        files: ['**/*.js'],
        languageOptions: {
            ecmaVersion: 2021,
            sourceType: 'commonjs',
            globals: {
                ...globals.node
            }
        },
        ...eslintJs.configs.recommended,
        plugins: {
            n: nPlugin, // Changed from node
            promise: promisePlugin,
            import: importPlugin
        },
        rules: {
            ...nPlugin.configs.recommended.rules, // Changed from nodePlugin
            ...promisePlugin.configs.recommended.rules,
            ...importPlugin.configs.recommended.rules,
            'indent': ['error', 2, { SwitchCase: 1 }],
            'linebreak-style': ['error', 'unix'],
            'quotes': ['error', 'single', { avoidEscape: true }],
            'semi': ['error', 'always'],
            'no-console': 'warn',
            'eqeqeq': ['error', 'always'],
            'curly': ['error', 'all'],
            'brace-style': ['error', '1tbs', { allowSingleLine: true }],
            'comma-dangle': ['error', 'never'],
            'space-before-function-paren': ['error', 'always'],
            'arrow-parens': ['error', 'always'],
            'object-curly-spacing': ['error', 'always'],
            'array-bracket-spacing': ['error', 'never'],
            'no-trailing-spaces': 'error',
            'eol-last': ['error', 'always'],
            'n/no-unsupported-features/es-syntax': 'off', // Updated prefix
            'n/no-missing-require': 'error', // Updated prefix
            'promise/always-return': 'error',
            'promise/no-return-wrap': 'error',
            'promise/catch-or-return': 'error',
            'import/order': [
                'error',
                {
                    groups: [['builtin', 'external'], 'internal', ['parent', 'sibling', 'index']],
                    'newlines-between': 'always',
                    alphabetize: { order: 'asc', caseInsensitive: true }
                }
            ],
            'import/no-unresolved': 'error'
        },
        settings: {
            'import/resolver': {
                node: {
                    extensions: ['.js']
                }
            }
        }
    }
];