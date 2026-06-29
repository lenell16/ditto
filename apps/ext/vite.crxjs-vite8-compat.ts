import type { Plugin } from 'vite-plus'

/** Strip Rolldown-only options before CRXJS passes build.rollupOptions to Rollup 2.x. */
export function crxjsVite8Compat(): Plugin {
  return {
    name: 'crxjs-vite8-compat',
    configResolved(config) {
      const rollupOptions = config.build.rollupOptions
      if ('platform' in rollupOptions) {
        const { platform: _platform, ...rest } =
          rollupOptions as typeof rollupOptions & {
            platform?: unknown
          }
        config.build.rollupOptions = rest
      }
    },
  }
}
