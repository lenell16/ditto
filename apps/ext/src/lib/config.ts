export const WEB_APP_URL =
  import.meta.env.VITE_WEB_APP_URL ?? 'https://memoria.localhost'

export const WEB_APP_ORIGIN = new URL(WEB_APP_URL).origin
