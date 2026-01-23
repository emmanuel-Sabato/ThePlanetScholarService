import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import ScholarshipCard from '../components/ScholarshipCard'
import ApplicationWizard from '../components/ApplicationWizard'
import { Calendar, MapPin, GraduationCap, CheckCircle2, ArrowLeft, Loader2, FileText, Award } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL;

export default function ScholarshipDetailPage() {
  const { id } = useParams()
  const [scholarships, setScholarships] = useState([])
  const [loading, setLoading] = useState(true)
  const [isWizardOpen, setIsWizardOpen] = useState(false)

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

  const scholarship = scholarships.find((s) => s.id === id || s._id === id)

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-sky-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading scholarship details...</p>
        </div>
      </div>
    )
  }

  if (!scholarship) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="section-container">
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto">
            <Award className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Scholarship Not Found</h2>
            <p className="text-slate-600 mb-6">The scholarship you're looking for doesn't exist or has been removed.</p>
            <Link to="/scholarships" className="btn-primary inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Directory
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const related = scholarships.filter(
    (s) => (s.id !== scholarship.id && s._id !== scholarship._id) && (s.country === scholarship.country || s.field === scholarship.field)
  )

  const isExpired = (() => {
    if (!scholarship.deadline) return false
    const d = new Date(scholarship.deadline)
    d.setHours(23, 59, 59, 999)
    return d < new Date()
  })()

  const checklistItems = [
    'Verified transcripts',
    'Recommendation letters',
    'Personal statement',
    'Proof of language proficiency',
  ]

  return (
    <div className="bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="section-container py-4">
          <Link
            to="/scholarships"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-sky-600 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Scholarships
          </Link>
        </div>
      </div>

      <div className="section-container py-12">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Main Content */}
          <article className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>{scholarship.country}</span>
                    <span>•</span>
                    <span>{scholarship.field}</span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
                    {scholarship.name || scholarship.title}
                  </h1>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 bg-sky-50 text-sky-700 px-3 py-1 rounded-full text-sm font-semibold">
                      <GraduationCap className="w-4 h-4" />
                      {scholarship.degree}
                    </span>
                    {isExpired && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-rose-100 text-rose-700">
                        CLOSED
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-lg text-slate-700 leading-relaxed mb-6">
                {scholarship.description}
              </p>

              {/* Key Info Cards */}
              <div className="grid gap-4 md:grid-cols-3 mb-6">
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div className="flex items-center gap-2 text-slate-500 mb-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs font-medium">Deadline</span>
                  </div>
                  <p className="text-lg font-semibold text-slate-900">
                    {scholarship.deadline ? new Date(scholarship.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Not specified'}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div className="flex items-center gap-2 text-slate-500 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span className="text-xs font-medium">Location</span>
                  </div>
                  <p className="text-lg font-semibold text-slate-900">{scholarship.country}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div className="flex items-center gap-2 text-slate-500 mb-2">
                    <FileText className="w-4 h-4" />
                    <span className="text-xs font-medium">Field</span>
                  </div>
                  <p className="text-lg font-semibold text-slate-900">{scholarship.field}</p>
                </div>
              </div>

              {/* Eligibility Section */}
              {scholarship.eligibility && (
                <section className="mb-6">
                  <h2 className="text-xl font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    Eligibility Requirements
                  </h2>
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <p className="text-slate-700 leading-relaxed">{scholarship.eligibility}</p>
                  </div>
                </section>
              )}

              {/* Benefits Section */}
              {scholarship.benefits && (
                <section className="mb-6">
                  <h2 className="text-xl font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5 text-emerald-600" />
                    Benefits
                  </h2>
                  <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                    <p className="text-slate-700 leading-relaxed">{scholarship.benefits}</p>
                  </div>
                </section>
              )}

              {/* Apply Button */}
              {isExpired ? (
                <div className="bg-slate-100 border border-slate-200 text-slate-500 rounded-xl p-4 text-center font-bold">
                  This scholarship program has ended and is no longer accepting applications.
                </div>
              ) : (
                <button
                  onClick={() => setIsWizardOpen(true)}
                  className="btn-primary w-full md:w-auto px-8 py-3 text-base inline-flex items-center justify-center gap-2"
                >
                  Apply Now
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </button>
              )}

              <ApplicationWizard
                scholarshipName={scholarship.name || scholarship.title}
                isOpen={isWizardOpen}
                onClose={() => setIsWizardOpen(false)}
              />
            </div>
          </article>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Application Checklist */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Application Checklist</h3>
              <ul className="space-y-3 mb-6">
                {checklistItems.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
              <Link to="/services" className="btn-secondary w-full inline-flex items-center justify-center gap-2">
                Get Expert Guidance
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </Link>
            </div>

            {/* Related Scholarships */}
            {related.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Related Scholarships</h3>
                <div className="space-y-4">
                  {related.slice(0, 3).map((item) => (
                    <ScholarshipCard key={item._id || item.id} scholarship={item} />
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}

