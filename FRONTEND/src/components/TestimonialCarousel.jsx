import { useState, useEffect } from 'react'

const API_URL = 'http://localhost:3000/api/testimonials'

export default function TestimonialCarousel() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [items, setItems] = useState([])

  useEffect(() => {
    fetch(API_URL)
      .then(r => r.json())
      .then(data => setItems(data))
      .catch(err => console.error(err))
  }, [])

  useEffect(() => {
    if (items.length === 0) return
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [items.length])

  if (items.length === 0) return null

  const next = () => setActiveIndex((prev) => (prev + 1) % items.length)
  const prev = () => setActiveIndex((prev) => (prev - 1 + items.length) % items.length)

  const active = items[activeIndex]

  return (
    <div className="card-surface p-6 md:p-8 relative overflow-hidden">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-emerald-600 font-semibold">Success stories</p>
          <h3 className="text-xl font-semibold text-slate-900">Students who trusted us</h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={prev}
            aria-label="Previous testimonial"
            className="h-10 w-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-700 hover:text-sky-600"
          >
            ←
          </button>
          <button
            onClick={next}
            aria-label="Next testimonial"
            className="h-10 w-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-700 hover:text-sky-600"
          >
            →
          </button>
        </div>
      </div>

      <blockquote className="mt-6 text-lg text-slate-800 leading-relaxed">"{active.quote}"</blockquote>
      <p className="mt-4 font-semibold text-slate-900">
        {active.name} <span className="text-slate-500">· {active.country}</span>
      </p>

      <div className="mt-6 flex gap-2">
        {items.map((_, idx) => (
          <span
            key={idx}
            aria-label={`Slide ${idx + 1}`}
            className={`h-2 w-8 rounded-full transition ${activeIndex === idx ? 'bg-sky-600' : 'bg-slate-200'
              }`}
          />
        ))}
      </div>
    </div>
  )
}
