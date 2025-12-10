import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ScholarshipCard from '../components/ScholarshipCard'
import TestimonialCarousel from '../components/TestimonialCarousel'
import { FileEdit, Target, Plane } from 'lucide-react'

const API_URL = 'http://localhost:3000/api/scholarships'

export default function HomePage() {
  const [scholarships, setScholarships] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchScholarships()
  }, [])

  async function fetchScholarships() {
    try {
      const response = await fetch(API_URL)
      const data = await response.json()
      setScholarships(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching scholarships:', error)
      setLoading(false)
    }
  }

  const featured = scholarships.slice(0, 3)

  return (
    <div>
      <section
        id="hero"
        className="relative overflow-hidden bg-gradient-to-br from-sky-50 via-white to-emerald-50"
      >
        <div className="section-container py-16 md:py-24 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
          <div>
            <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wide">
              Trusted by students in 50+ countries
            </p>
            <h1 className="mt-4 text-3xl md:text-5xl font-bold text-slate-900 leading-tight">
              Find Scholarships Worldwide
            </h1>
            <p className="mt-4 text-lg text-slate-700">
              Discover curated scholarships, application guidance, and visa support to help you secure funding for your
              academic journey.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/scholarships" className="btn-primary">
                Browse Scholarships
              </Link>
              <Link to="/contact" className="btn-secondary">
                Apply Now
              </Link>
            </div>

            <div className="mt-10 card-surface p-4">
              <form className="grid gap-3 md:grid-cols-4 md:items-center">
                <input
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-sky-500 focus:outline-none"
                  type="text"
                  name="country"
                  placeholder="Country"
                  aria-label="Search by country"
                />
                <input
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-sky-500 focus:outline-none"
                  type="text"
                  name="field"
                  placeholder="Field of study"
                  aria-label="Search by field of study"
                />
                <input
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-sky-500 focus:outline-none"
                  type="text"
                  name="degree"
                  placeholder="Degree level"
                  aria-label="Search by degree level"
                />
                <button type="button" className="btn-primary w-full">
                  Search
                </button>
              </form>
            </div>
          </div>

          <div className="card-surface p-6 lg:p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-100/60 to-emerald-100/40 pointer-events-none" />
            <div className="relative space-y-4">
              <p className="text-sm font-semibold text-slate-900">Why students choose us</p>
              <ul className="space-y-3 text-slate-700">
                <li className="flex items-start gap-3">
                  <span className="text-emerald-600 mt-1">✓</span>
                  <span>Curated scholarships verified for deadlines and eligibility.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-600 mt-1">✓</span>
                  <span>Application guidance, essay feedback, and interview prep.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-600 mt-1">✓</span>
                  <span>Visa tips and checklists for smooth travel planning.</span>
                </li>
              </ul>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="card-surface p-3 text-center">
                  <p className="text-2xl font-bold text-slate-900">2,500+</p>
                  <p className="text-xs text-slate-500">Scholarships tracked</p>
                </div>
                <div className="card-surface p-3 text-center">
                  <p className="text-2xl font-bold text-slate-900">92%</p>
                  <p className="text-xs text-slate-500">Client satisfaction</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-container py-12">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-emerald-600 font-semibold">Featured</p>
            <h2 className="text-2xl font-bold text-slate-900">Scholarships you’ll love</h2>
            <p className="text-sm text-slate-600">Handpicked opportunities with upcoming deadlines.</p>
          </div>
          <Link to="/scholarships" className="btn-secondary">
            View all
          </Link>
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((scholarship) => (
            <ScholarshipCard key={scholarship.id} scholarship={scholarship} />
          ))}
        </div>
      </section>

      <section className="section-container py-12">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] items-center">
          <div>
            <p className="text-xs uppercase tracking-wide text-emerald-600 font-semibold">Services</p>
            <h2 className="text-2xl font-bold text-slate-900">We guide you from search to visa</h2>
            <p className="mt-3 text-sm text-slate-600">
              Application strategies, essay polish, interview prep, and visa checklists—our advisors make every step clear.
            </p>
            <div className="mt-5 flex gap-3">
              <Link to="/services" className="btn-primary">
                Explore services
              </Link>
              <Link to="/contact" className="btn-secondary">
                Book a consult
              </Link>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="card-surface p-4">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-sky-100 to-emerald-100 flex items-center justify-center mb-2">
                <FileEdit className="h-5 w-5 text-sky-700" strokeWidth={2} />
              </div>
              <h3 className="mt-2 font-semibold text-slate-900">Essay coaching</h3>
              <p className="text-sm text-slate-600">Tell your story with clarity and impact.</p>
            </div>
            <div className="card-surface p-4">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-sky-100 to-emerald-100 flex items-center justify-center mb-2">
                <Target className="h-5 w-5 text-sky-700" strokeWidth={2} />
              </div>
              <h3 className="mt-2 font-semibold text-slate-900">Application strategy</h3>
              <p className="text-sm text-slate-600">Deadlines, documents, and recommendation plans.</p>
            </div>
            <div className="card-surface p-4">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-sky-100 to-emerald-100 flex items-center justify-center mb-2">
                <Plane className="h-5 w-5 text-sky-700" strokeWidth={2} />
              </div>
              <h3 className="mt-2 font-semibold text-slate-900">Visa prep</h3>
              <p className="text-sm text-slate-600">Interview practice and document reviews.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-container py-12">
        <TestimonialCarousel />
      </section>
    </div>
  )
}

