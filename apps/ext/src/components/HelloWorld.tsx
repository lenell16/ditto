import { Button } from '@workspace/ui/components/button'
import { useState } from 'react'

export default function HelloWorld(props: { msg: string }) {
  const [count, setCount] = useState(0)

  return (
    <>
      <h1 className="text-3xl font-semibold">{props.msg}</h1>

      <div className="p-8">
        <Button type="button" onClick={() => setCount(count + 1)}>
          count is {count}
        </Button>
        <p className="mt-4">
          Edit <code className="text-sm">src/components/HelloWorld.tsx</code> to
          test HMR
        </p>
      </div>

      <p>
        Check out{' '}
        <a
          href="https://github.com/crxjs/create-crxjs"
          target="_blank"
          rel="noreferrer"
          className="text-primary underline-offset-4 hover:underline"
        >
          create-crxjs
        </a>
        , the official starter
      </p>

      <p className="text-muted-foreground">
        Click on the Vite, React and CRXJS logos to learn more
      </p>
    </>
  )
}
