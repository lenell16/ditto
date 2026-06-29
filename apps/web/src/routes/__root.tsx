import {
  HeadContent,
  Scripts,
  createRootRoute,
  redirect,
} from '@tanstack/react-router'
import { TooltipProvider } from '@workspace/ui/components/tooltip'

import appCss from '@workspace/ui/globals.css?url'

import { EmbedProvider } from '@/components/embed-provider'
import { isEmbeddedLoad } from '@/lib/embed/detect'
import { getSession } from '@/server/auth'

export const Route = createRootRoute({
  beforeLoad: async ({ location }) => {
    const session = await getSession()
    const embedded = isEmbeddedLoad()

    if (!session && !embedded && location.pathname !== '/login') {
      throw redirect({ to: '/login' })
    }
    return { session, embedded }
  },
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'TanStack Start Starter',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  notFoundComponent: () => (
    <main className="container mx-auto p-4 pt-16">
      <h1>404</h1>
      <p>The requested page could not be found.</p>
    </main>
  ),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        <TooltipProvider>
          <EmbedProvider>{children}</EmbedProvider>
        </TooltipProvider>
        <Scripts />
      </body>
    </html>
  )
}
