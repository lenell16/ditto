/** Local-only credentials for Agent Browser verification against pglite dev DBs. */
export const DEV_BROWSER_AUTH = {
  vaultProfile: 'ditto',
  email: 'agent@memoria.local',
  password: 'local-dev-password',
  name: 'Browser Agent',
} as const

export const DEV_BROWSER_LOGIN_SELECTORS = {
  username: '#email',
  password: '#password',
  submit: 'button[type="submit"]',
} as const
