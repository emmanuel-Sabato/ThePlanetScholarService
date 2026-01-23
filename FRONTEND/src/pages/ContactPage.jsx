import { useState } from 'react'
import FAQAccordion from '../components/FAQAccordion'
import { faqs } from '../data/mockData'
import { Mail, Phone, Instagram, Send, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

export default function ContactPage() {
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setStatus('')
    setIsSuccess(false)

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
        setStatus('Message sent successfully! We will reply within 1 business day.')
        setIsSuccess(true)
        event.target.reset()
      } else {
        setStatus('Failed to send message. Please try again.')
        setIsSuccess(false)
      }
    } catch (error) {
      console.error('Error:', error)
      setStatus('Network error. Please check your connection and try again.')
      setIsSuccess(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-slate-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-sky-50 via-white to-slate-50 py-12 md:py-16">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs uppercase tracking-wide text-sky-600 font-semibold mb-2">Contact</p>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              We're Here to Help
            </h1>
            <p className="text-lg text-slate-600">
              Ask about scholarships, application support, or visa prep. Our advisors reply quickly.
            </p>
          </div>
        </div>
      </section>

      <div className="section-container py-12 md:py-16">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-start">
          {/* Contact Form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2" htmlFor="name">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  required
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none transition-colors"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2" htmlFor="email">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none transition-colors"
                  placeholder="you@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2" htmlFor="subject">
                  Subject
                </label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  required
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none transition-colors"
                  placeholder="What can we help you with?"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2" htmlFor="message">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  required
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none transition-colors resize-none"
                  placeholder="Tell us how we can support you..."
                />
              </div>
              <button
                type="submit"
                className="btn-primary w-full flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Message
                  </>
                )}
              </button>
              {status && (
                <div
                  className={`flex items-start gap-3 p-4 rounded-lg ${
                    isSuccess
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {isSuccess ? (
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  )}
                  <p className="text-sm">{status}</p>
                </div>
              )}
            </form>
          </div>

          {/* Contact Info & FAQs */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Get in Touch</h2>
              <div className="space-y-4">
                <a
                  href="mailto:iradukundagasangwa18@gmail.com"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center group-hover:bg-sky-200 transition-colors">
                    <Mail className="w-5 h-5 text-sky-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Email</p>
                    <p className="text-sm font-medium text-slate-900">iradukundagasangwa18@gmail.com</p>
                  </div>
                </a>
                <a
                  href="tel:+250781306944"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center group-hover:bg-sky-200 transition-colors">
                    <Phone className="w-5 h-5 text-sky-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Phone</p>
                    <p className="text-sm font-medium text-slate-900">+250 781 306 944</p>
                  </div>
                </a>
                <a
                  href="https://www.instagram.com/thep2s_apply_ltd/"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center group-hover:bg-sky-200 transition-colors">
                    <Instagram className="w-5 h-5 text-sky-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Instagram</p>
                    <p className="text-sm font-medium text-slate-900">@thep2s_apply_ltd</p>
                  </div>
                </a>
              </div>
            </div>

            {/* FAQs */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Frequently Asked Questions</h2>
              <FAQAccordion items={faqs} id="faqs" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

