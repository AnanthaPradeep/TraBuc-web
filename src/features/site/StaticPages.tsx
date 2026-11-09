import { Link } from 'react-router-dom'
import { Badge, ComingSoonButton, Notice, PageHeader } from '../../components/ui'
import { Field } from '../../components/Field'

export function AboutPage() {
  return (
    <div className="container section prose-page">
      <PageHeader title="About TRABUC" intro="TRABUC is a travel companion that is being built in stages." />
      <div className="prose">
        <p>The goal is simple: help people find places worth going to, plan the trip without juggling five apps, and keep the memories afterwards.</p>
        <h2>What exists today</h2>
        <p>This first phase is a working interface with sample content, plus account sign-in. You can search destinations, sketch trips in your browser, and explore how bookings, tools and stories will work.</p>
        <h2>What is coming</h2>
        <ul className="check-list">
          <li>Live camping and stay booking with payments</li>
          <li>Trip saving and sync across devices</li>
          <li>AI-assisted itineraries</li>
          <li>Translation and currency conversion</li>
          <li>Story publishing and photo memories</li>
        </ul>
        <p>Native mobile apps may follow once the web experience is solid.</p>
        <p><Link to="/discover">Start exploring</Link></p>
      </div>
    </div>
  )
}

const faqs = [
  { q: 'Can I book a stay or campsite?', a: 'Not yet. Listings are samples and checkout is not connected. Nothing you see can be reserved or paid for.' },
  { q: 'Are my trips saved?', a: 'Not yet. Trips exist only in your open browser tab and clear when you refresh. Saving to your account is planned.' },
  { q: 'Is the destination information accurate?', a: 'It is sample content for this preview. Always check current entry rules, safety advice and seasonal conditions with official sources.' },
  { q: 'Why can I not sign in?', a: 'Accounts need the site owner to connect a Supabase project. If you see a notice on the sign-in page, that setup has not been done yet.' },
]

export function HelpPage() {
  return (
    <div className="container section prose-page">
      <PageHeader title="Contact and help" intro="Answers to common questions about this early preview." />
      <h2>Common questions</h2>
      <div className="faq">
        {faqs.map((f) => <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}
      </div>
      <h2>Send a message <Badge tone="preview">Coming soon</Badge></h2>
      <Notice tone="info">The contact form is not connected to an inbox yet, so it cannot send anything. A support address will be added here once one exists.</Notice>
      <form className="form" onSubmit={(e) => e.preventDefault()}>
        <Field label="Your email">{(p) => <input {...p} type="email" disabled />}</Field>
        <Field label="Message">{(p) => <textarea {...p} rows={4} disabled />}</Field>
        <ComingSoonButton>Send message</ComingSoonButton>
      </form>
    </div>
  )
}

export function NotFoundPage() {
  return (
    <div className="container section prose-page">
      <PageHeader title="Page not found" intro="That address does not match anything on TRABUC." />
      <p><Link className="btn btn-primary" to="/">Go to the home page</Link></p>
    </div>
  )
}
