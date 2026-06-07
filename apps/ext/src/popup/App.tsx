import crxLogo from '@/assets/crx.svg'
import reactLogo from '@/assets/react.svg'
import viteLogo from '@/assets/vite.svg'
import HelloWorld from '@/components/HelloWorld'

const logoClass =
  'h-24 p-6 transition-[filter] duration-300 will-change-[filter]'

export default function App() {
  return (
    <div className="mx-auto max-w-5xl min-w-[450px] p-8 text-center">
      <div className="flex items-center justify-center">
        <a href="https://vite.dev" target="_blank" rel="noreferrer">
          <img
            src={viteLogo}
            className={`${logoClass} hover:drop-shadow-[0_0_2em_#646cffaa]`}
            alt="Vite logo"
          />
        </a>
        <a href="https://reactjs.org/" target="_blank" rel="noreferrer">
          <img
            src={reactLogo}
            className={`${logoClass} animate-[spin_20s_linear_infinite] hover:drop-shadow-[0_0_2em_#61dafbaa] motion-reduce:animate-none`}
            alt="React logo"
          />
        </a>
        <a
          href="https://crxjs.dev/vite-plugin"
          target="_blank"
          rel="noreferrer"
        >
          <img
            src={crxLogo}
            className={`${logoClass} hover:drop-shadow-[0_0_2em_#f2bae4aa]`}
            alt="crx logo"
          />
        </a>
      </div>
      <HelloWorld msg="Vite + React + CRXJS" />
    </div>
  )
}
