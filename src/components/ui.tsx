import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export function PageHeader({ title, intro, actions }: { title: string; intro?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="page-header">
      <div>
        <h1>{title}</h1>
        {intro ? <p className="lede">{intro}</p> : null}
      </div>
      {actions ? <div className="page-header-actions">{actions}</div> : null}
    </header>
  )
}

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'preview' | 'sample' }) {
  return <span className={`badge badge-${tone}`}>{children}</span>
}

export const PreviewBadge = () => <Badge tone="preview">Preview</Badge>
export const SampleBadge = () => <Badge tone="sample">Sample data</Badge>

export function Notice({ tone = 'info', title, children }: { tone?: 'info' | 'warn' | 'error' | 'success'; title?: string; children: ReactNode }) {
  return (
    <div className={`notice notice-${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      {title ? <strong>{title}</strong> : null}
      <div>{children}</div>
    </div>
  )
}

export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="empty">
      <h2>{title}</h2>
      {children ? <p>{children}</p> : null}
      {action}
    </div>
  )
}

export function Spinner({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="spinner-wrap" role="status">
      <span className="spinner" aria-hidden="true" />
      <span>{label}…</span>
    </div>
  )
}

export function ButtonLink({ to, children, variant = 'primary' }: { to: string; children: ReactNode; variant?: 'primary' | 'secondary' | 'ghost' }) {
  return <Link className={`btn btn-${variant}`} to={to}>{children}</Link>
}

export function ComingSoonButton({ children }: { children: ReactNode }) {
  return (
    <button type="button" className="btn btn-secondary" disabled aria-disabled="true" title="Coming soon">
      {children} <span className="btn-note">(coming soon)</span>
    </button>
  )
}
