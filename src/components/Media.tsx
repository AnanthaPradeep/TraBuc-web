import { useState } from 'react'
import { ContourArt } from './ContourArt'

interface Props { src?: string; alt: string; seed: number; credit?: string }

/** Shows a photo when available; falls back to generated artwork if it is missing or fails. */
export function Media({ src, alt, seed, credit }: Props) {
  const [failed, setFailed] = useState(false)
  return (
    <div className="media">
      {src && !failed ? (
        <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />
      ) : (
        <ContourArt seed={seed} label={`Generated map artwork for ${alt}`} />
      )}
      {credit && src && !failed ? <span className="media-credit">{credit}</span> : null}
    </div>
  )
}
