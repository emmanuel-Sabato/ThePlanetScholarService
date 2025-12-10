import { useState, useEffect } from 'react'
import { Target, FileEdit, Plane, Palette, Smartphone } from 'lucide-react'

const API_URL = 'https://backend-tau-lime-64.vercel.app/api/services'

const ICON_MAP = {
  Target,
  FileEdit,
  Plane,
  Palette,
  Smartphone
}

export default function ServicesPage() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchServices()
  }, [])

  async function fetchServices() {
    try {
      const response = await fetch(API_URL)
      const data = await response.json()
      setServices(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching services:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="section-container py-12 text-center">
        <p className="text-slate-600">Loading...</p>
      </div>
    )
  }

  return (
    <div className="section-container py-12 space-y-10">
      <div className="text-center space-y-3">
        <p className="text-xs uppercase tracking-wide text-emerald-600 font-semibold">Services</p>
        <h1 className="text-3xl font-bold text-slate-900">Everything you need to secure funding</h1>
        <p className="text-sm text-slate-600 max-w-2xl mx-auto">
          From the first search to your visa interview, our advisors keep you organized, confident, and on-time.
        </p>
        <div className="flex justify-center gap-3">
          <a href="#guidance" className="btn-primary">See how it works</a>
          <a href="/contact" className="btn-secondary">Book a call</a>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {services.map((service) => {
          const IconComponent = ICON_MAP[service.icon] || Target
          return (
            <div key={service.id} className="card-surface p-6 space-y-3">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-sky-100 to-emerald-100 flex items-center justify-center">
                <IconComponent className="h-6 w-6 text-sky-700" strokeWidth={2} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">{service.title}</h3>
              <p className="text-sm text-slate-600">{service.description}</p>
              <button className="btn-secondary w-fit">Talk to an expert</button>
            </div>
          )
        })}
      </div>

      <div id="guidance" className="card-surface p-6 md:p-8 grid gap-6 md:grid-cols-2 items-center">
        <div className="space-y-3">
          <p className="badge bg-emerald-50 text-emerald-700">Process</p>
          <h2 className="text-2xl font-bold text-slate-900">A clear path from search to submission</h2>
          <ul className="space-y-3 text-sm text-slate-700">
            <li>✓ Discovery call to map your profile and target scholarships.</li>
            <li>✓ Timeline with deadlines, document list, and recommendation strategy.</li>
            <li>✓ Essay coaching sessions with edits and reviewer feedback.</li>
            <li>✓ Visa documentation review and interview rehearsal.</li>
          </ul>
        </div>
        <div className="grid gap-4">
          <div className="card-surface p-4">
            <h3 className="font-semibold text-slate-900">Application Guidance</h3>
            <p className="text-sm text-slate-600">
              Tailored plan aligned to each award’s criteria with weekly check-ins.
            </p>
          </div>
          <div className="card-surface p-4">
            <h3 className="font-semibold text-slate-900">Essay Writing Help</h3>
            <p className="text-sm text-slate-600">Narrative development, outline creation, and detailed edits.</p>
          </div>
          <div className="card-surface p-4">
            <h3 className="font-semibold text-slate-900">Visa Support</h3>
            <p className="text-sm text-slate-600">Document review, interview prep, and travel planning guidance.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

