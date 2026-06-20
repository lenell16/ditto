import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'

import { listMemories } from '@/server/memories'

export const Route = createFileRoute('/')({
  loader: () => listMemories(),
  component: App,
})

function App() {
  const memories = Route.useLoaderData()

  return (
    <div className="flex min-h-svh p-6">
      <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
        <div>
          <h1 className="font-medium">Project ready!</h1>
          <p>You may now add components and start building.</p>
          <p>We&apos;ve already added the button component for you.</p>
          <Button className="mt-2">Button</Button>
          <Link to="/chat">
            <Button className="mt-2">Open chat</Button>
          </Link>
          <Link to="/durable-chat">
            <Button className="mt-2" variant="outline">
              Durable chat
            </Button>
          </Link>
          <Link to="/durable-chat-multi">
            <Button className="mt-2" variant="outline">
              Multi-turn durable chat
            </Button>
          </Link>
          <Link to="/data-grid">
            <Button className="mt-2" variant="outline">
              Data grid demo
            </Button>
          </Link>
          <Link to="/forms">
            <Button className="mt-2" variant="outline">
              Forms demo
            </Button>
          </Link>
          <p className="mt-4 text-muted-foreground">
            {memories.length === 0
              ? 'No memories yet.'
              : `${memories.length} memor${memories.length === 1 ? 'y' : 'ies'} loaded.`}
          </p>
        </div>
      </div>
    </div>
  )
}
