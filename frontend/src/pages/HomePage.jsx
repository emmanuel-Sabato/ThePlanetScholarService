import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ScholarshipCard from '../components/ScholarshipCard'
import TestimonialCarousel from '../components/TestimonialCarousel'
import { FileEdit, Target, Plane, Search, ArrowRight, CheckCircle2, Users, Globe, Award, TrendingUp, Loader2 } from 'lucide-react'
import logo from '../assets/Thep2s.png'

const API_URL = import.meta.env.VITE_API_URL ||
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api'
    : '/api');

export default function HomePage() {
  const navigate = useNavigate()
  const [scholarships, setScholarships] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchForm, setSearchForm] = useState({ country: '', field: '', degree: '' })

  useEffect(() => {
    fetchScholarships()
  }, [])

  async function fetchScholarships() {
    try {
      const response = await fetch(`${API_URL}/scholarships`)
      const data = await response.json()
      setScholarships(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching scholarships:', error)
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchForm.country) params.append('country', searchForm.country)
    if (searchForm.field) params.append('field', searchForm.field)
    if (searchForm.degree) params.append('degree', searchForm.degree)
    navigate(`/scholarships?${params.toString()}`)
  }

  const featured = scholarships.slice(0, 3)
  const stats = [
    { value: '2,500+', label: 'Scholarships Tracked', icon: Award },
    { value: '50+', label: 'Countries', icon: Globe },
    { value: '92%', label: 'Success Rate', icon: TrendingUp },
    { value: '10K+', label: 'Students Helped', icon: Users },
  ]

  return (
    <div className="bg-slate-50">
      {/* Hero Section */}
      <section
        id="hero"
        className="relative overflow-hidden bg-gradient-to-br from-sky-50 via-white to-slate-50 min-h-[80vh] flex items-center"
      >
        {/* Animated Backdrop */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
          {/* Large blurred logo top right */}
          <div className="absolute -top-[10%] -right-[10%] w-[500px] h-[500px] opacity-[0.08] blur-2xl animate-pulse-soft">
            <img src={logo} alt="" className="w-full h-full object-contain rotate-12" />
          </div>

          {/* Floating logos with varying sizes and speeds */}
          <div className="absolute top-[20%] left-[5%] w-32 h-32 opacity-[0.12] blur-[1px] animate-float">
            <img src={logo} alt="" className="w-full h-full object-contain" />
          </div>

          <div className="absolute bottom-[20%] right-[10%] w-48 h-48 opacity-[0.1] blur-[0.5px] animate-float-slow">
            <img src={logo} alt="" className="w-full h-full object-contain" />
          </div>

          <div className="absolute top-[60%] left-[15%] w-24 h-24 opacity-[0.08] blur-[1.5px] animate-float" style={{ animationDelay: '-2s' }}>
            <img src={logo} alt="" className="w-full h-full object-contain -rotate-12" />
          </div>

          <div className="absolute top-[10%] left-[40%] w-40 h-40 opacity-[0.06] blur-[3px] animate-pulse-soft">
            <img src={logo} alt="" className="w-full h-full object-contain" />
          </div>

          {/* Subtle gradient blobs for extra depth */}
          <div className="absolute top-[40%] right-[30%] w-[400px] h-[400px] bg-sky-400/10 rounded-full blur-[100px] animate-float-slow"></div>
          <div className="absolute bottom-[10%] left-[20%] w-[300px] h-[300px] bg-emerald-400/10 rounded-full blur-[80px] animate-float" style={{ animationDelay: '-4s' }}></div>
        </div>

        <div className="section-container relative z-10 py-16 md:py-20 lg:py-24 w-full">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <p className="text-sm font-semibold text-sky-600 uppercase tracking-wide mb-4">
              Trusted by students in 50+ countries
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
              Find Your Perfect Scholarship
              <span className="block text-emerald-600 mt-2">Start Your Journey Today</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-8">
              Discover curated scholarships, get expert application guidance, and secure funding for your academic journey worldwide.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <Link to="/scholarships" className="btn-primary text-base px-6 py-3">
                Browse Scholarships
                <ArrowRight className="w-4 h-4 ml-2 inline" />
              </Link>
              <Link to="/services" className="btn-secondary text-base px-6 py-3">
                Get Expert Help
              </Link>
            </div>

            {/* Search Form */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 md:p-8">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 bg-white text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none transition-colors"
                      type="text"
                      placeholder="Country"
                      value={searchForm.country}
                      onChange={(e) => setSearchForm({ ...searchForm, country: e.target.value })}
                      aria-label="Search by country"
                    />
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 bg-white text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none transition-colors"
                      type="text"
                      placeholder="Field of study"
                      value={searchForm.field}
                      onChange={(e) => setSearchForm({ ...searchForm, field: e.target.value })}
                      aria-label="Search by field of study"
                    />
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 bg-white text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none transition-colors"
                      type="text"
                      placeholder="Degree level"
                      value={searchForm.degree}
                      onChange={(e) => setSearchForm({ ...searchForm, degree: e.target.value })}
                      aria-label="Search by degree level"
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn-primary w-full text-base py-3 flex items-center justify-center"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-12">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl border border-slate-200 p-6 text-center hover:shadow-md transition-shadow"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-sky-100 text-sky-600 mb-3">
                    <Icon className="w-6 h-6" />
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">{stat.value}</p>
                  <p className="text-xs md:text-sm text-slate-600">{stat.label}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="section-container py-12 md:py-16">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-12 shadow-sm">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 text-center mb-8">
              Why Students Choose Us
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: CheckCircle2,
                  title: 'Verified Scholarships',
                  description: 'Curated scholarships verified for deadlines and eligibility requirements.',
                },
                {
                  icon: FileEdit,
                  title: 'Expert Guidance',
                  description: 'Application guidance, essay feedback, and interview preparation support.',
                },
                {
                  icon: Plane,
                  title: 'Visa Support',
                  description: 'Visa tips and checklists for smooth travel planning and documentation.',
                },
              ].map((feature, index) => {
                const Icon = feature.icon
                return (
                  <div key={index} className="text-center p-4">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-sky-100 text-sky-600 mb-4">
                      <Icon className="w-7 h-7" />
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2">{feature.title}</h3>
                    <p className="text-sm text-slate-600">{feature.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Scholarships Section */}
      <section className="section-container py-12 md:py-16">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <p className="text-xs uppercase tracking-wide text-rose-600 font-semibold mb-2">Featured</p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              Scholarships You'll Love
            </h2>
            <p className="text-slate-600">Handpicked opportunities with upcoming deadlines.</p>
          </div>
          <Link
            to="/scholarships"
            className="btn-secondary inline-flex items-center gap-2 whitespace-nowrap"
          >
            View all
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
          </div>
        ) : featured.length > 0 ? (
          <div className="space-y-4">
            {featured.map((scholarship, index) => (
              <ScholarshipCard
                key={scholarship._id || scholarship.id}
                scholarship={scholarship}
                isPromoted={index < 2}
                showFastTrack={index === 0}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <p className="text-slate-600">No featured scholarships available at the moment.</p>
          </div>
        )}
      </section>

      {/* Services Section */}
      <section className="section-container py-12 md:py-16">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-wide text-rose-600 font-semibold mb-2">Services</p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            We Guide You From Search to Visa
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Application strategies, essay polish, interview prep, and visa checklists—our advisors make every step clear.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          {[
            {
              icon: FileEdit,
              title: 'Essay Coaching',
              description: 'Tell your story with clarity and impact. Get expert feedback on your personal statements and essays.',
              color: 'from-sky-100 to-blue-100',
              iconColor: 'text-sky-600',
            },
            {
              icon: Target,
              title: 'Application Strategy',
              description: 'Deadlines, documents, and recommendation plans. We help you stay organized and on track.',
              color: 'from-emerald-100 to-teal-100',
              iconColor: 'text-emerald-600',
            },
            {
              icon: Plane,
              title: 'Visa Preparation',
              description: 'Interview practice and document reviews. Navigate the visa process with confidence.',
              color: 'from-cyan-100 to-sky-100',
              iconColor: 'text-cyan-600',
            },
          ].map((service, index) => {
            const Icon = service.icon
            return (
              <div
                key={index}
                className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-4`}>
                  <Icon className={`h-7 w-7 ${service.iconColor}`} strokeWidth={2} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{service.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{service.description}</p>
              </div>
            )
          })}
        </div>

        <div className="text-center">
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/services" className="btn-primary text-base px-6 py-3">
              Explore All Services
              <ArrowRight className="w-4 h-4 ml-2 inline" />
            </Link>
            <Link to="/contact" className="btn-secondary text-base px-6 py-3">
              Book a Consultation
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section-container py-12 md:py-16">
        <div className="text-center mb-8">
          <p className="text-xs uppercase tracking-wide text-rose-600 font-semibold mb-2">Testimonials</p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            What Our Students Say
          </h2>
        </div>
        <TestimonialCarousel />
      </section>

      {/* CTA Section */}
      <section className="section-container py-12 md:py-16">
        <div className="bg-gradient-to-r from-sky-600 to-emerald-500 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Your Scholarship Journey?
          </h2>
          <p className="text-lg md:text-xl text-sky-50 mb-8 max-w-2xl mx-auto">
            Join thousands of students who have successfully secured scholarships with our guidance.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/scholarships" className="btn-cta-white">
              Browse Scholarships
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/scholarships" className="border-white text-white hover:bg-white hover:text-sky-900 border-2 px-6 py-3 rounded-full font-semibold transition-colors">
              Get Started Free
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

