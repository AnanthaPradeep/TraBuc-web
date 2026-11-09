import { useState } from 'react'
import { Link } from 'react-router-dom'
import logoLight from '../assets/brand/logo-horizontal-light.svg'
import logoDark from '../assets/brand/logo-horizontal-dark.svg'

/**
 * TRABUC logo linking home. Two files are rendered and CSS shows the one that matches the theme
 * (tokens.css sets --logo-light-display / --logo-dark-display), so it follows both the system
 * preference and the data-theme override. If the image fails to load, the text name is shown instead.
 */
export function Logo() {
  const [failed, setFailed] = useState(false)
  return (
    <Link to="/" className="logo" aria-label="TRABUC home">
      {failed ? (
        <span className="logo-text" aria-hidden="true">TRABUC</span>
      ) : (
        <>
          <img className="logo-img logo-img-light" src={logoLight} alt="" width="136" height="36" loading="lazy" onError={() => setFailed(true)} />
          <img className="logo-img logo-img-dark" src={logoDark} alt="" width="136" height="36" loading="lazy" onError={() => setFailed(true)} />
        </>
      )}
    </Link>
  )
}
