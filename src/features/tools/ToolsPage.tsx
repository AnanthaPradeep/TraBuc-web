import { Banknote, Languages } from 'lucide-react'
import { Badge, ComingSoonButton, Notice, PageHeader } from '../../components/ui'

export function ToolsPage() {
  return (
    <div className="container section">
      <PageHeader title="Travel tools" intro="Helpers for the practical parts of a trip. Both are previews and are not connected to any live service." />
      <div className="tool-grid">
        <section className="tool-card" aria-labelledby="t-lang">
          <Languages aria-hidden="true" />
          <h2 id="t-lang">Language help <Badge tone="preview">Preview</Badge></h2>
          <p>Type a phrase and get a translation, with common travel phrases saved for offline use.</p>
          <form className="form" onSubmit={(e) => e.preventDefault()}>
            <div className="field"><label htmlFor="phrase">Phrase</label>
              <textarea id="phrase" rows={3} disabled placeholder="Translation is not available yet" /></div>
            <div className="form-row">
              <div className="field"><label htmlFor="from">From</label><select id="from" disabled><option>English</option></select></div>
              <div className="field"><label htmlFor="to">To</label><select id="to" disabled><option>Choose language</option></select></div>
            </div>
            <ComingSoonButton>Translate</ComingSoonButton>
          </form>
        </section>
        <section className="tool-card" aria-labelledby="t-cur">
          <Banknote aria-hidden="true" />
          <h2 id="t-cur">Currency help <Badge tone="preview">Preview</Badge></h2>
          <p>Convert prices into your home currency using up-to-date exchange rates.</p>
          <form className="form" onSubmit={(e) => e.preventDefault()}>
            <div className="field"><label htmlFor="amount">Amount</label><input id="amount" disabled placeholder="Rates are not connected yet" /></div>
            <div className="form-row">
              <div className="field"><label htmlFor="cfrom">From</label><select id="cfrom" disabled><option>Choose currency</option></select></div>
              <div className="field"><label htmlFor="cto">To</label><select id="cto" disabled><option>Choose currency</option></select></div>
            </div>
            <ComingSoonButton>Convert</ComingSoonButton>
          </form>
        </section>
      </div>
      <Notice tone="info">No translations or exchange rates are shown because none are connected. We will not display made-up values.</Notice>
    </div>
  )
}
