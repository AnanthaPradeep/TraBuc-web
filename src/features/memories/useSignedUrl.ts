import { useCallback, useEffect, useRef, useState } from 'react'
import { getSignedUrl } from './memoriesApi'

export const URL_TTL_SECONDS = 600
const MAX_ERROR_REFRESHES = 2

/**
 * Signed URL for a private photo. Refreshes itself before it expires, and `onImageError` fetches a
 * new one (at most twice) in case the image failed because the URL had already expired.
 */
export function useSignedUrl(path: string | undefined) {
  const [state, setState] = useState<{ path: string; url: string } | null>(null)
  const [nonce, setNonce] = useState(0)
  const errorRefreshes = useRef({ path, count: 0 })

  useEffect(() => {
    if (!path) return
    let active = true
    getSignedUrl(path, URL_TTL_SECONDS)
      .then((url) => { if (active) setState({ path, url }) })
      .catch(() => { if (active) setState(null) })
    const timer = setTimeout(() => setNonce((n) => n + 1), URL_TTL_SECONDS * 0.8 * 1000)
    return () => { active = false; clearTimeout(timer) }
  }, [path, nonce])

  const onImageError = useCallback(() => {
    if (errorRefreshes.current.path !== path) errorRefreshes.current = { path, count: 0 }
    if (errorRefreshes.current.count >= MAX_ERROR_REFRESHES) return
    errorRefreshes.current.count += 1
    setNonce((n) => n + 1)
  }, [path])

  return { url: state && state.path === path ? state.url : undefined, onImageError }
}
