import { useState, useEffect, useMemo } from 'react'
import { Search, ChevronDown, Loader2, BookmarkCheck, ArrowUp } from 'lucide-react'
import FilterBar from '../components/FilterBar'
import ScholarshipCard from '../components/ScholarshipCard'

const API_URL = import.meta.env.VITE_API_URL ||
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api'
    : 'https://backend-tau-lime-64.vercel.app/api');
const PAGE_SIZE = 10

const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'newest', label: 'Newest First' },
  { value: 'deadline', label: 'Deadline Soonest' },
  { value: 'deadline-desc', label: 'Deadline Latest' },
  { value: 'title', label: 'Title A-Z' },
]

export default function DirectoryPage() {
  const [scholarships, setScholarships] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ country: '', degree: '', field: '' })
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('recommended')
  const [page, setPage] = useState(1)
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [bookmarked, setBookmarked] = useState(new Set())
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    fetchScholarships()
    // Load bookmarks from localStorage
    const savedBookmarks = localStorage.getItem('bookmarkedScholarships')
    if (savedBookmarks) {
      try {
        setBookmarked(new Set(JSON.parse(savedBookmarks)))
      } catch (e) {
        console.error('Error loading bookmarks:', e)
      }
    }

    // Handle scroll to top button visibility
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
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
    const countries = [...new Set(scholarships.map((s) => s.country).filter(Boolean))]
    const degrees = [...new Set(scholarships.map((s) => s.degree).filter(Boolean))]
    const fields = [...new Set(scholarships.map((s) => s.field).filter(Boolean))]
    return { countries, degrees, fields }
  }, [scholarships])

  const filteredAndSorted = useMemo(() => {
    let result = [...scholarships]

    // Apply bookmarks filter
    if (showBookmarksOnly) {
      result = result.filter((s) => bookmarked.has(s._id || s.id))
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter((s) => {
        const title = (s.name || s.title || '').toLowerCase()
        const description = (s.description || '').toLowerCase()
        const university = (s.university || s.institution || '').toLowerCase()
        const country = (s.country || '').toLowerCase()
        const field = (s.field || '').toLowerCase()
        return title.includes(query) || description.includes(query) || university.includes(query) || country.includes(query) || field.includes(query)
      })
    }

    // Apply filters
    result = result.filter((s) => {
      const matchCountry = filters.country ? s.country === filters.country : true
      const matchDegree = filters.degree ? s.degree === filters.degree : true
      const matchField = filters.field ? s.field === filters.field : true
      return matchCountry && matchDegree && matchField
    })

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0)
          const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0)
          return dateB - dateA
        })
        break
      case 'deadline':
        result.sort((a, b) => {
          const dateA = a.deadline ? new Date(a.deadline) : new Date('9999-12-31')
          const dateB = b.deadline ? new Date(b.deadline) : new Date('9999-12-31')
          return dateA - dateB
        })
        break
      case 'deadline-desc':
        result.sort((a, b) => {
          const dateA = a.deadline ? new Date(a.deadline) : new Date('9999-12-31')
          const dateB = b.deadline ? new Date(b.deadline) : new Date('9999-12-31')
          return dateB - dateA
        })
        break
      case 'title':
        result.sort((a, b) => {
          const titleA = (a.name || a.title || '').toLowerCase()
          const titleB = (b.name || b.title || '').toLowerCase()
          return titleA.localeCompare(titleB)
        })
        break
      case 'recommended':
      default:
        // Keep original order or prioritize promoted/bookmarked
        result.sort((a, b) => {
          const aBookmarked = bookmarked.has(a._id || a.id)
          const bBookmarked = bookmarked.has(b._id || b.id)
          if (aBookmarked && !bBookmarked) return -1
          if (!aBookmarked && bBookmarked) return 1
          return 0
        })
        break
    }

    return result
  }, [scholarships, searchQuery, filters, sortBy, bookmarked, showBookmarksOnly])

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / PAGE_SIZE))
  const pageItems = filteredAndSorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleBookmark = (scholarship, isBookmarked) => {
    const id = scholarship._id || scholarship.id
    const newBookmarked = new Set(bookmarked)

    if (isBookmarked) {
      newBookmarked.add(id)
    } else {
      newBookmarked.delete(id)
    }

    setBookmarked(newBookmarked)
    localStorage.setItem('bookmarkedScholarships', JSON.stringify([...newBookmarked]))
  }

  const handleSortChange = (value) => {
    setSortBy(value)
    setShowSortMenu(false)
    setPage(1)
  }

  // Mark some scholarships as promoted (for demo purposes)
  const isPromoted = (scholarship, index) => {
    // Mark first 2-3 items as promoted
    return index < 3
  }

  // Show fast-track for some scholarships
  const showFastTrack = (scholarship, index) => {
    // Show fast-track for some items (can be based on data or random)
    return index % 4 === 0 || scholarship.fastTrack
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-sky-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading scholarships...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="section-container py-8 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              Scholarship Directory
            </h1>
            <p className="text-slate-600">
              Discover {filteredAndSorted.length} scholarship opportunities worldwide
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Bookmarks Toggle */}
            {bookmarked.size > 0 && (
              <button
                onClick={() => {
                  setShowBookmarksOnly(!showBookmarksOnly)
                  setPage(1)
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${showBookmarksOnly
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'bg-white border border-slate-200 text-slate-700 hover:border-sky-300 hover:text-sky-700'
                  }`}
              >
                <BookmarkCheck className={`w-4 h-4 ${showBookmarksOnly ? 'fill-white' : ''}`} />
                <span>Bookmarks ({bookmarked.size})</span>
              </button>
            )}

            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-700 hover:border-slate-300 transition-colors shadow-sm"
              >
                <span>{SORT_OPTIONS.find(opt => opt.value === sortBy)?.label || 'Recommended'}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showSortMenu ? 'rotate-180' : ''}`} />
              </button>

              {showSortMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowSortMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-20">
                    {SORT_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleSortChange(option.value)}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors ${sortBy === option.value
                          ? 'bg-sky-50 text-sky-700 font-medium'
                          : 'text-slate-700'
                          } ${option.value === SORT_OPTIONS[0].value ? 'rounded-t-lg' : ''} ${option.value === SORT_OPTIONS[SORT_OPTIONS.length - 1].value ? 'rounded-b-lg' : ''
                          }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search scholarships by title, university, country, or field..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setPage(1)
            }}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent text-slate-700 placeholder-slate-400 shadow-sm"
          />
        </div>

        {/* Filter Bar */}
        <FilterBar
          filters={filters}
          options={options}
          onChange={(next) => {
            setFilters(next)
            setPage(1)
          }}
        />

        {/* Results Count */}
        {filteredAndSorted.length > 0 && (
          <div className="text-sm text-slate-600">
            Showing {((page - 1) * PAGE_SIZE) + 1}-{Math.min(page * PAGE_SIZE, filteredAndSorted.length)} of {filteredAndSorted.length} scholarships
          </div>
        )}

        {/* Scholarship Cards List */}
        <div className="space-y-4">
          {pageItems.length > 0 ? (
            pageItems.map((scholarship, index) => (
              <ScholarshipCard
                key={scholarship._id || scholarship.id}
                scholarship={scholarship}
                isPromoted={isPromoted(scholarship, index)}
                showFastTrack={showFastTrack(scholarship, index)}
                onBookmark={handleBookmark}
              />
            ))
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <div className="max-w-md mx-auto">
                <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No scholarships found</h3>
                <p className="text-slate-600 mb-4">
                  {searchQuery || Object.values(filters).some(f => f)
                    ? "Try adjusting your search or filters to find more results."
                    : "No scholarships available at the moment."}
                </p>
                {(searchQuery || Object.values(filters).some(f => f)) && (
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setFilters({ country: '', degree: '', field: '' })
                      setPage(1)
                    }}
                    className="text-rose-600 hover:text-rose-700 font-medium text-sm"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-6 border-t border-slate-200">
            <button
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (page <= 3) {
                  pageNum = i + 1
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = page - 2 + i
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${page === pageNum
                      ? 'bg-sky-600 text-white'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                      }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>
            <p className="text-sm text-slate-600 hidden md:block">
              Page {page} of {totalPages}
            </p>
            <button
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        )}

        {/* Scroll to Top Button */}
        {showScrollTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-8 right-8 z-50 p-3 bg-sky-600 text-white rounded-full shadow-lg hover:bg-sky-700 transition-all hover:scale-110"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  )
}

