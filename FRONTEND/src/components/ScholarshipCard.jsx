import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Calendar, Clock, GraduationCap, Globe, Info, Building2, Bookmark, BookmarkCheck, CheckCircle2, ArrowRight } from 'lucide-react'

const getRandomImage = (id) => {
  const images = [
    "https://images.unsplash.com/photo-1541339907198-e08756ebafe1?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1521587760476-6c12a7104b6b?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1000"
  ]
  return images[id?.charCodeAt(id.length - 1) % images.length] || images[0]
}

const getUniversityLogo = (universityName) => {
  // Extract initials for logo
  const initials = universityName
    ?.split(' ')
    .map(word => word[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'UN'

  return initials
}

const getDuration = (degree) => {
  if (degree?.toLowerCase().includes('bachelor')) return '4 years'
  if (degree?.toLowerCase().includes('master')) return '2 years'
  if (degree?.toLowerCase().includes('phd') || degree?.toLowerCase().includes('doctorate')) return '3-5 years'
  if (degree?.toLowerCase().includes('associate')) return '2 years'
  return '2-4 years'
}

export default function ScholarshipCard({ scholarship, isPromoted = false, onBookmark, showFastTrack = false }) {
  const [isBookmarked, setIsBookmarked] = useState(false)
  const getIsExpired = (deadline) => {
    if (!deadline) return false
    const d = new Date(deadline)
    d.setHours(23, 59, 59, 999)
    return d < new Date()
  }

  const isExpired = getIsExpired(scholarship.deadline)
  const universityName = scholarship.university || scholarship.institution || scholarship.name?.split(' ')[0] + ' University' || 'University'
  const programTitle = scholarship.name || scholarship.title || 'Scholarship Program'
  const location = scholarship.location || `${scholarship.country || 'Location'}`

  // Determine if this scholarship should show fast-track badge (can be based on data or random)
  const hasFastTrack = showFastTrack || scholarship.fastTrack || Math.random() > 0.7

  const handleBookmark = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsBookmarked(!isBookmarked)
    if (onBookmark) {
      onBookmark(scholarship, !isBookmarked)
    }
  }

  const truncateDescription = (text, maxLength = 150) => {
    if (!text) return "The scholarship program aims to support outstanding international students in their academic journey. You will study how this program can help you achieve your educational goals..."
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength).trim() + '...'
  }

  const [imgError, setImgError] = useState(false)
  const brokenId = "photo-1523050854058-8df90110c9f1"

  const imageUrl = (!imgError && scholarship.image && scholarship.image !== 'None' && !scholarship.image.includes(brokenId))
    ? scholarship.image
    : getRandomImage(scholarship._id || scholarship.id)

  return (
    <div className={`relative bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 group ${isExpired ? 'opacity-80' : ''}`}>
      {/* Promoted Badge */}
      {isPromoted && !isExpired && (
        <div className="absolute top-4 right-4 z-10 flex items-center gap-1 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-md shadow-sm">
          <span className="text-xs font-semibold text-slate-700">Promoted</span>
          <Info className="w-3.5 h-3.5 text-slate-400" />
        </div>
      )}

      {/* Bookmark Button */}
      {!isExpired && (
        <button
          onClick={handleBookmark}
          className="absolute top-4 right-4 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm hover:bg-white transition-colors"
          style={isPromoted ? { right: '100px' } : {}}
          aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
        >
          {isBookmarked ? (
            <BookmarkCheck className="w-4 h-4 text-rose-600 fill-rose-600" />
          ) : (
            <Bookmark className="w-4 h-4 text-slate-400 hover:text-rose-600" />
          )}
        </button>
      )}

      <div className="flex flex-col md:flex-row">
        {/* Left Image Side */}
        <div className="relative w-full md:w-64 h-48 md:h-auto shrink-0 overflow-hidden bg-slate-100">
          <img
            src={imageUrl}
            alt={programTitle}
            onError={() => setImgError(true)}
            className={`w-full h-full object-cover transition-transform duration-500 ${!isExpired && 'group-hover:scale-105'} ${isExpired ? 'grayscale' : ''}`}
          />
          {/* University Logo Overlay */}
          <div className="absolute top-3 left-3 bg-white px-3 py-2 rounded-md shadow-md">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${isExpired ? 'bg-slate-400' : 'bg-gradient-to-br from-rose-500 to-rose-700'}`}>
                {getUniversityLogo(universityName)}
              </div>
              <span className="text-xs font-bold text-slate-800 whitespace-nowrap max-w-[120px] truncate">
                {universityName}
              </span>
            </div>
          </div>
        </div>

        {/* Right Content Side */}
        <div className="flex-1 p-6 flex flex-col">
          {/* University Name with Fast-track Badge */}
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h4 className="text-sm font-semibold text-slate-900">
              {universityName}
            </h4>
            {hasFastTrack && !isExpired && (
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                <CheckCircle2 className="w-3 h-3" />
                Fast-track counseling
              </span>
            )}
          </div>

          {/* Program Title */}
          <h3 className={`text-xl font-bold mb-2 leading-tight transition-colors ${isExpired ? 'text-slate-500' : 'text-rose-700 group-hover:text-rose-800'}`}>
            {programTitle}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-slate-600 mb-4">
            <MapPin className="w-4 h-4 text-slate-400" />
            <span className="text-sm">{location}</span>
          </div>

          {/* Metadata Row with Icons */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600 mb-4">
            <div className="flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-slate-400" />
              <span>{scholarship.degree || 'Degree'}</span>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Full time</span>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>{scholarship.deadline ? new Date(scholarship.deadline).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : getDuration(scholarship.degree)}</span>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-slate-400" />
              <span>On-Campus</span>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-slate-400" />
              <span>English</span>
            </div>
          </div>

          {/* Description Snippet */}
          <p className="text-sm text-slate-600 mb-4 line-clamp-2 leading-relaxed">
            {truncateDescription(scholarship.description)}
          </p>

          {/* Apply Now Link */}
          <div className="mt-auto pt-2">
            {isExpired ? (
              <div className="inline-flex items-center gap-2 bg-slate-200 text-slate-500 px-4 py-2 rounded-lg font-semibold text-sm cursor-not-allowed">
                Scholarship Closed
              </div>
            ) : (
              <Link
                to={`/register?scholarshipId=${scholarship._id || scholarship.id}`}
                className="inline-flex items-center gap-2 bg-rose-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-rose-700 transition-colors shadow-sm hover:shadow-md"
              >
                Apply Now
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Status Badge (if expired) */}
      {isExpired && (
        <div className="absolute top-4 right-4 bg-red-100 text-red-600 text-xs font-bold px-3 py-1.5 rounded-lg border border-red-200 z-10 shadow-sm">
          CLOSED
        </div>
      )}
    </div>
  )
}
