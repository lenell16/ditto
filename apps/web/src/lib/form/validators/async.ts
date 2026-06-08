const TAKEN_SLUGS = new Set(['alpha', 'beta', 'memoria', 'starter'])

function delay(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(resolve, ms)
    signal.addEventListener(
      'abort',
      () => {
        window.clearTimeout(timer)
        reject(new DOMException('Aborted', 'AbortError'))
      },
      { once: true }
    )
  })
}

export async function checkSlugAvailability(
  slug: string,
  signal: AbortSignal
): Promise<{ available: boolean }> {
  await delay(650, signal)
  return { available: !TAKEN_SLUGS.has(slug.trim().toLowerCase()) }
}
