import { Link } from 'react-router-dom'

export default function ScholarshipCard({ scholarship }) {
  return (
    <article className="card-surface p-5 flex flex-col justify-between h-full">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">{scholarship.country}</p>
          <h3 className="mt-1 text-lg font-semibold text-slate-900">{scholarship.title}</h3>
        </div>
        <span className="badge">{scholarship.degree}</span>
      </div>
      <p className="mt-3 text-sm text-slate-600 line-clamp-3">{scholarship.description}</p>
      <div className="mt-4 flex items-center text-sm text-slate-700">
        <span className="flex items-center gap-2">
          <span className="text-slate-500">Deadline:</span>
          <strong>{new Date(scholarship.deadline).toLocaleDateString()}</strong>
        </span>
      </div>
    </article>
  )
}

