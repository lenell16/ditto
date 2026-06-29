import { defineConfig } from 'vite-plus'

const skillIgnorePatterns = [
  '.agents/skills/**',
  '.claude/skills/**',
  '.cursor/skills/**',
]
const aiElementsIgnorePatterns = [
  'apps/web/src/components/ai-elements/**',
  'src/components/ai-elements/**',
]

export default defineConfig({
  staged: {
    '*': 'vp check --fix',
  },
  fmt: {
    endOfLine: 'lf',
    semi: false,
    singleQuote: true,
    tabWidth: 2,
    trailingComma: 'es5',
    printWidth: 80,
    sortTailwindcss: {
      stylesheet: 'packages/ui/src/styles/globals.css',
      functions: ['cn', 'cva'],
    },
    sortPackageJson: false,
    ignorePatterns: [
      '.nitro/',
      '.tanstack/',
      '.vinxi/',
      'pnpm-lock.yaml',
      '**/routeTree.gen.ts',
      ...skillIgnorePatterns,
      ...aiElementsIgnorePatterns,
    ],
  },
  lint: {
    plugins: ['typescript', 'import', 'node'],
    jsPlugins: [{ name: 'vite-plus', specifier: 'vite-plus/oxlint-plugin' }],
    options: { typeAware: true, typeCheck: true },
    rules: {
      'no-shadow': 'warn',
      'vite-plus/prefer-vite-plus-imports': 'error',

      'typescript/array-type': [
        'error',
        { default: 'generic', readonly: 'generic' },
      ],
      'typescript/ban-ts-comment': [
        'error',
        {
          'ts-expect-error': false,
          'ts-ignore': 'allow-with-description',
        },
      ],
      'typescript/consistent-type-imports': [
        'error',
        { prefer: 'type-imports' },
      ],
      'typescript/no-inferrable-types': ['error', { ignoreParameters: true }],
      'typescript/no-namespace': 'error',
      'typescript/no-unnecessary-condition': 'error',
      'typescript/prefer-for-of': 'warn',

      'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
      'import/first': 'error',
      'import/no-commonjs': 'error',
      'import/no-duplicates': 'error',

      'unicorn/prefer-node-protocol': 'error',
    },
    ignorePatterns: [
      '**/.nx/**',
      '**/.svelte-kit/**',
      '**/.tanstack/**',
      '**/.turbo/**',
      '**/.output/**',
      '**/routeTree.gen.ts',
      '**/vite.config.*.timestamp-*.*',
      ...skillIgnorePatterns,
      ...aiElementsIgnorePatterns,
    ],
  },
})
