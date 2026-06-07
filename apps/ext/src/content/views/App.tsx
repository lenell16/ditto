import Logo from '@/assets/crx.svg'
import { Button } from '@workspace/ui/components/button'
import { useState } from 'react'

function App() {
  const [show, setShow] = useState(false)
  const toggle = () => setShow(!show)

  return (
    <div className="fixed right-0 bottom-0 z-100 m-5 flex items-end font-sans leading-none select-none">
      {show && (
        <div className="mr-2 rounded-lg border bg-card px-4 py-2 text-card-foreground shadow-md">
          <h1 className="font-semibold">HELLO CRXJS</h1>
        </div>
      )}
      <Button
        type="button"
        size="icon-lg"
        className="rounded-full"
        onClick={toggle}
      >
        <img src={Logo} alt="CRXJS logo" className="size-6" />
      </Button>
    </div>
  )
}

export default App
