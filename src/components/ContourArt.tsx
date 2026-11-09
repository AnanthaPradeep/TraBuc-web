import { useMemo } from 'react'

function rng(seed: number) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => (s = (s * 16807) % 2147483647) / 2147483647
}

/** Generated contour-map artwork. Used as the fallback whenever a photo is missing. */
export function ContourArt({ seed, label }: { seed: number; label: string }) {
  const rings = useMemo(() => {
    const r = rng(seed)
    const cx = 120 + r() * 160
    const cy = 90 + r() * 120
    const squash = 0.6 + r() * 0.3
    const phase = r() * 6
    return Array.from({ length: 11 }, (_, i) => {
      const radius = 22 + i * 24
      const pts = Array.from({ length: 36 }, (_, k) => {
        const a = (k / 36) * Math.PI * 2
        const wobble = 1 + 0.12 * Math.sin(a * 3 + phase + i * 0.4) + 0.06 * Math.cos(a * 5 + i)
        return [cx + Math.cos(a) * radius * wobble, cy + Math.sin(a) * radius * wobble * squash] as const
      })
      return pts.map(([x, y], k) => `${k ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join('') + 'Z'
    })
  }, [seed])
  return (
    <svg className="art" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" role="img" aria-label={label}>
      <rect width="400" height="300" className="art-bg" />
      {rings.map((d, i) => (
        <path key={i} d={d} className={i % 4 === 0 ? 'art-line art-line-major' : 'art-line'} fill="none" />
      ))}
    </svg>
  )
}
