import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import ScholarshipCard from '../components/ScholarshipCard'

const API_URL = 'http://localhost:3000/api/scholarships'

export default function ScholarshipDetailPage() {
  const { id } = useParams()
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

  const scholarship = scholarships.find((s) => s.id === id)

  if (!scholarship) {
    return (
      <div className="section-container py-12">
        <div className="card-surface p-6 text-center">
          <p className="text-lg font-semibold text-slate-900">Scholarship not found</p>
          <Link to="/scholarships" className="btn-primary mt-4 inline-flex">
            Back to directory
          </Link>
        </div>
      </div>
    )
  }

  const related = scholarships.filter(
    (s) => s.id !== scholarship.id && (s.country === scholarship.country || s.field === scholarship.field)
  )

  return (
    <div className="section-container py-12 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <article className="card-surface p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500">{scholarship.country} · {scholarship.field}</p>
            <h1 className="text-3xl font-bold text-slate-900">{scholarship.title}</h1>
          </div>
          <span className="badge">{scholarship.degree}</span>
        </div>
        <p className="text-slate-700">{scholarship.description}</p>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="card-surface p-3 text-center">
            <p className="text-xs text-slate-500">Deadline</p>
            <p className="text-lg font-semibold text-slate-900">
              {new Date(scholarship.deadline).toLocaleDateString()}
            </p>
          </div>
          <div className="card-surface p-3 text-center">
            <p className="text-xs text-slate-500">Country</p>
            <p className="text-lg font-semibold text-slate-900">{scholarship.country}</p>
          </div>
          <div className="card-surface p-3 text-center">
            <p className="text-xs text-slate-500">Field</p>
            <p className="text-lg font-semibold text-slate-900">{scholarship.field}</p>
          </div>
        </div>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">Eligibility</h2>
          <p className="mt-2 text-slate-700">{scholarship.eligibility}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">Benefits</h2>
          <p className="mt-2 text-slate-700">{scholarship.benefits}</p>
        </section>

        <Link to="/contact" className="btn-primary inline-flex">Apply Now</Link>
      </article>

      <aside className="space-y-4">
        <div className="card-surface p-5">
          <h3 className="text-lg font-semibold text-slate-900">Application checklist</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>✓ Verified transcripts</li>
            <li>✓ Recommendation letters</li>
            <li>✓ Personal statement</li>
            <li>✓ Proof of language proficiency</li>
          </ul>
          <Link to="/services" className="btn-secondary mt-4 inline-flex">Get guidance</Link>
        </div>

        <div className="card-surface p-5">
          <h3 className="text-lg font-semibold text-slate-900">Related scholarships</h3>
          <div className="mt-4 space-y-4">
            {related.slice(0, 3).map((item) => (
              <ScholarshipCard key={item.id} scholarship={item} />
            ))}
            {related.length === 0 && (
              <p className="text-sm text-slate-600">No related scholarships yet.</p>
            )}
          </div>
        </div>
      </aside>
    </div>
  )
}

