import { useState } from 'react'
import FAQAccordion from '../components/FAQAccordion'
import { faqs } from '../data/mockData'

export default function ContactPage() {
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setStatus('')

    const formData = {
      name: event.target.name.value,
      email: event.target.email.value,
      subject: event.target.subject.value,
      message: event.target.message.value
    }

    try {
      const response = await fetch('https://backend-tau-lime-64.vercel.app/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setStatus('✅ Message sent successfully! We will reply within 1 business day.')
        event.target.reset()
      } else {
        setStatus('❌ Failed to send message. Please try again.')
      }
    } catch (error) {
      console.error('Error:', error)
      setStatus('❌ Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="section-container py-12 space-y-8">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-start">
        <div className="card-surface p-6 md:p-8 space-y-4">
          <p className="text-xs uppercase tracking-wide text-emerald-600 font-semibold">Contact</p>
          <h1 className="text-3xl font-bold text-slate-900">We’re here to help</h1>
          <p className="text-sm text-slate-600">
            Ask about scholarships, application support, or visa prep. Our advisors reply quickly.
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-sm font-semibold text-slate-800" htmlFor="name">Name</label>
              <input
                id="name"
                name="name"
                required
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-sky-500 focus:outline-none"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-800" htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-sky-500 focus:outline-none"
                placeholder="you@email.com"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-800" htmlFor="subject">Subject</label>
              <input
                id="subject"
                name="subject"
                type="text"
                required
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-sky-500 focus:outline-none"
                placeholder="What can we help you with?"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-800" htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                rows="4"
                required
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-sky-500 focus:outline-none"
                placeholder="Tell us how we can support you"
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Sending...' : 'Send message'}
            </button>
            {status && <p className={`text-sm ${status.includes('✅') ? 'text-emerald-700' : 'text-red-600'}`}>{status}</p>}
          </form>
        </div>

        <div className="space-y-6">
          <div className="card-surface p-6">
            <h2 className="text-lg font-semibold text-slate-900">Support</h2>
            <div className="mt-3 flex flex-col gap-2 text-sm text-slate-600">
              <a className="hover:text-sky-600 flex items-center gap-2" href="https://www.instagram.com/thep2s_apply_ltd/" target="_blank" rel="noreferrer">
                <span className="font-semibold">IG:</span> @thep2s_apply_ltd
              </a>
              <a className="hover:text-sky-600 flex items-center gap-2" href="tel:+250781306944">
                <span className="font-semibold">Call & Message:</span> 0781306944
              </a>
              <a className="hover:text-sky-600 flex items-center gap-2" href="mailto:iradukundagasangwa18@gmail.com">
                <span className="font-semibold">Email:</span> iradukundagasangwa18@gmail.com
              </a>
            </div>
          </div>

          <div className="card-surface p-6">
            <h2 className="text-lg font-semibold text-slate-900">FAQs</h2>
            <FAQAccordion items={faqs} id="faqs" />
          </div>
        </div>
      </div>
    </div>
  )
}

