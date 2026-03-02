import { X } from 'lucide-react'

export default function FilterBar({ filters, options, onChange }) {
  const handleChange = (key) => (event) => {
    onChange({ ...filters, [key]: event.target.value })
  }

  const hasActiveFilters = filters.country || filters.degree || filters.field

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2 md:flex-row md:gap-3 w-full">
          <select
            value={filters.country}
            onChange={handleChange('country')}
            className="w-full md:w-auto rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none transition-colors hover:border-slate-300"
          >
            <option value="">All Countries</option>
            {options.countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>

          <select
            value={filters.degree}
            onChange={handleChange('degree')}
            className="w-full md:w-auto rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none transition-colors hover:border-slate-300"
          >
            <option value="">All Degrees</option>
            {options.degrees.map((degree) => (
              <option key={degree} value={degree}>
                {degree}
              </option>
            ))}
          </select>

          <select
            value={filters.field}
            onChange={handleChange('field')}
            className="w-full md:w-auto rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none transition-colors hover:border-slate-300"
          >
            <option value="">All Fields</option>
            {options.fields.map((field) => (
              <option key={field} value={field}>
                {field}
              </option>
            ))}
          </select>
        </div>
        
        {hasActiveFilters && (
          <button
            onClick={() => onChange({ country: '', degree: '', field: '' })}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors whitespace-nowrap"
          >
            <X className="w-4 h-4" />
            Clear filters
          </button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-2">
          {filters.country && (
            <span className="inline-flex items-center gap-1.5 bg-sky-50 text-sky-700 px-3 py-1 rounded-full text-xs font-medium">
              {filters.country}
              <button
                onClick={() => onChange({ ...filters, country: '' })}
                className="hover:text-sky-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.degree && (
            <span className="inline-flex items-center gap-1.5 bg-sky-50 text-sky-700 px-3 py-1 rounded-full text-xs font-medium">
              {filters.degree}
              <button
                onClick={() => onChange({ ...filters, degree: '' })}
                className="hover:text-sky-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.field && (
            <span className="inline-flex items-center gap-1.5 bg-sky-50 text-sky-700 px-3 py-1 rounded-full text-xs font-medium">
              {filters.field}
              <button
                onClick={() => onChange({ ...filters, field: '' })}
                className="hover:text-sky-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  )
}

