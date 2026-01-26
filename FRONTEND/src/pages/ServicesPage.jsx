import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Target, FileEdit, Plane, Palette, Smartphone, CheckCircle2, ArrowRight, Loader2, Clock, Users, Award } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL ||
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api'
    : '/api');

const ICON_MAP = {
  Target,
  FileEdit,
  Plane,
  Palette,
  Smartphone
}

const processSteps = [
  {
    icon: Users,
    title: 'Discovery Call',
    description: 'Map your profile and target scholarships that match your goals.',
  },
  {
    icon: Clock,
    title: 'Timeline Planning',
    description: 'Deadlines, document list, and recommendation strategy.',
  },
  {
    icon: FileEdit,
    title: 'Essay Coaching',
    description: 'Sessions with edits and reviewer feedback.',
  },
  {
    icon: Plane,
    title: 'Visa Preparation',
    description: 'Documentation review and interview rehearsal.',
  },
]

export default function ServicesPage() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchServices()
  }, [])

  async function fetchServices() {
    try {
      const response = await fetch(`${API_URL}/services`)
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-rose-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading services...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-sky-50 via-white to-slate-50 py-16 md:py-20">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <p className="text-xs uppercase tracking-wide text-sky-600 font-semibold">Services</p>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
              Everything You Need to Secure Funding
            </h1>
            <p className="text-lg text-slate-600">
              From the first search to your visa interview, our advisors keep you organized, confident, and on-time.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <a href="#guidance" className="btn-primary inline-flex items-center gap-2">
                See How It Works
                <ArrowRight className="w-4 h-4" />
              </a>
              <Link to="/contact" className="btn-secondary">
                Book a Call
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="section-container py-12 md:py-16">
        {services.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => {
              const IconComponent = ICON_MAP[service.icon] || Target
              return (
                <div
                  key={service.id}
                  className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-sky-100 to-emerald-100 flex items-center justify-center mb-4">
                    <IconComponent className="h-7 w-7 text-sky-600" strokeWidth={2} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{service.title}</h3>
                  <p className="text-sm text-slate-600 mb-4 leading-relaxed">{service.description}</p>
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 text-sky-600 font-semibold text-sm hover:text-sky-700 transition-colors"
                  >
                    Talk to an expert
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <Award className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">Services information coming soon.</p>
          </div>
        )}
      </section>

      {/* Process Section */}
      <section id="guidance" className="section-container py-12 md:py-16">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-12 shadow-sm">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-semibold mb-4">
                <CheckCircle2 className="w-4 h-4" />
                Our Process
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                A Clear Path From Search to Submission
              </h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
                We guide you through every step of your scholarship journey with expert advice and personalized support.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {processSteps.map((step, index) => {
                const Icon = step.icon
                return (
                  <div key={index} className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-sky-100 to-emerald-100 mb-4">
                      <Icon className="w-8 h-8 text-sky-600" />
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2">{step.title}</h3>
                    <p className="text-sm text-slate-600">{step.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Additional Services */}
      <section className="section-container py-12 md:py-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">What We Offer</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Comprehensive support for every aspect of your scholarship application journey.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: 'Application Guidance',
              description: 'Tailored plan aligned to each award\'s criteria with weekly check-ins.',
              icon: Target,
            },
            {
              title: 'Essay Writing Help',
              description: 'Narrative development, outline creation, and detailed edits.',
              icon: FileEdit,
            },
            {
              title: 'Visa Support',
              description: 'Document review, interview prep, and travel planning guidance.',
              icon: Plane,
            },
          ].map((service, index) => {
            const Icon = service.icon
            return (
              <div
                key={index}
                className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-lg bg-sky-100 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-sky-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{service.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{service.description}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-container py-12 md:py-16">
        <div className="bg-gradient-to-r from-sky-600 to-emerald-500 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-sky-50 mb-8 max-w-2xl mx-auto">
            Book a consultation with our experts and take the first step towards securing your scholarship.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/contact"
              className="btn-cta-white"
            >
              Book a Consultation
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/scholarships"
              className="bg-emerald-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-emerald-700 transition-colors border-2 border-white/20"
            >
              Browse Scholarships
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

