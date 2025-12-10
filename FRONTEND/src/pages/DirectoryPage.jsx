import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import FilterBar from '../components/FilterBar'
import ScholarshipCard from '../components/ScholarshipCard'

const API_URL = 'http://localhost:3000/api/scholarships'
const PAGE_SIZE = 4

export default function DirectoryPage() {
  const [scholarships, setScholarships] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ country: '', degree: '', field: '' })
  const [page, setPage] = useState(1)

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

  const options = useMemo(() => {
    const countries = [...new Set(scholarships.map((s) => s.country))]
    const degrees = [...new Set(scholarships.map((s) => s.degree))]
    const fields = [...new Set(scholarships.map((s) => s.field))]
    return { countries, degrees, fields }
  }, [scholarships])

  const filtered = scholarships.filter((s) => {
    const matchCountry = filters.country ? s.country === filters.country : true
    const matchDegree = filters.degree ? s.degree === filters.degree : true
    const matchField = filters.field ? s.field === filters.field : true
    return matchCountry && matchDegree && matchField
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="section-container py-12 space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-emerald-600 font-semibold">Directory</p>
          <h1 className="text-3xl font-bold text-slate-900">Scholarship Directory</h1>
          <p className="text-sm text-slate-600">Filter by country, degree, or field to find your best fit.</p>
        </div>
        <span className="badge">Updated weekly</span>
      </div>

      <FilterBar
        filters={filters}
        options={options}
        onChange={(next) => {
          setFilters(next)
          setPage(1)
        }}
      />

      <div className="grid gap-6 md:grid-cols-2">
        {pageItems.map((scholarship) => (
          <ScholarshipCard key={scholarship.id} scholarship={scholarship} />
        ))}
        {pageItems.length === 0 && (
          <div className="col-span-full card-surface p-6 text-center text-slate-600">
            No scholarships match these filters yet. Try adjusting your selection.
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button
          className="btn-secondary disabled:opacity-50"
          disabled={page === 1}
          onClick={() => {
            setPage((p) => Math.max(1, p - 1))
          }}
        >
          Previous
        </button>
        <p className="text-sm text-slate-700">
          Page {page} of {totalPages}
        </p>
        <button
          className="btn-secondary disabled:opacity-50"
          disabled={page === totalPages}
          onClick={() => {
            setPage((p) => Math.min(totalPages, p + 1))
          }}
        >
          Next
        </button>
      </div>
    </div>
  )
}

