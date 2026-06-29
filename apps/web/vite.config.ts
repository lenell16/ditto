import { defineConfig } from 'vite-plus'
import { devtools } from '@tanstack/devtools-vite'
import { workflow } from 'workflow/vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

const config = defineConfig(({ mode }) => {
  const isTest = mode === 'test'

  return {
    resolve: { tsconfigPaths: true },
    // Listen on IPv4 loopback; default ::1 breaks portless, which proxies to 127.0.0.1.
    server: { host: '127.0.0.1' },
    plugins: [
      ...(isTest
        ? []
        : [
            workflow(),
            devtools(),
            nitro({ rollupConfig: { external: [/^@sentry\//] } }),
            tailwindcss(),
            tanstackStart(),
          ]),
      viteReact(),
    ],
    test: {
      include: ['src/**/*.test.ts'],
    },
    run: {
      tasks: {
        build: {
          command: 'vp build',
          env: ['NODE_ENV'],
          input: [
            { auto: true },
            '.env*',
            '!.output/**',
            '!node_modules/.nitro/**',
          ],
        },
      },
    },
  }
})

export default config
