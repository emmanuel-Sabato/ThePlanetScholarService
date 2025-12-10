export default function FilterBar({ filters, options, onChange }) {
  const handleChange = (key) => (event) => {
    onChange({ ...filters, [key]: event.target.value })
  }

  return (
    <div className="card-surface p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-col gap-2 md:flex-row md:gap-3 w-full">
        <select
          value={filters.country}
          onChange={handleChange('country')}
          className="w-full md:w-auto rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-sky-500 focus:outline-none"
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
          className="w-full md:w-auto rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-sky-500 focus:outline-none"
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
          className="w-full md:w-auto rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-sky-500 focus:outline-none"
        >
          <option value="">All Fields</option>
          {options.fields.map((field) => (
            <option key={field} value={field}>
              {field}
            </option>
          ))}
        </select>
      </div>
      <button
        onClick={() => onChange({ country: '', degree: '', field: '' })}
        className="btn-secondary w-full md:w-auto"
      >
        Reset Filters
      </button>
    </div>
  )
}

