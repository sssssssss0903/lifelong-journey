import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['dist'] },

  // 前端配置
  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },

  //  后端 Node.js 配置
  {
    files: ['server/**/*.js'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.node, //  启用 Node.js 全局变量 (process, require 等)
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'commonjs', // 后端代码用 require，所以用 commonjs
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': 'warn', // 后端调试时 console 和变量常见，设为 warn
      'no-console': 'off',      // 允许 console.log
    },
  },
]
