import { useId, type ReactNode } from 'react'

interface FieldProps {
  label: string
  error?: string
  hint?: string
  children: (props: { id: string; 'aria-describedby'?: string; 'aria-invalid'?: boolean }) => ReactNode
}

export function Field({ label, error, hint, children }: FieldProps) {
  const id = useId()
  const msgId = `${id}-msg`
  const hasMsg = Boolean(error || hint)
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children({ id, 'aria-describedby': hasMsg ? msgId : undefined, 'aria-invalid': error ? true : undefined })}
      {hasMsg ? <p id={msgId} className={error ? 'field-error' : 'field-hint'}>{error ?? hint}</p> : null}
    </div>
  )
}
