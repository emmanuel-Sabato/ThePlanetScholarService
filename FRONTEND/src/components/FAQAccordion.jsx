import { useState, useEffect } from 'react'

const API_URL = 'https://backend-tau-lime-64.vercel.app/api/faqs'

export default function FAQAccordion() {
  const [open, setOpen] = useState(null)
  const [items, setItems] = useState([])

  useEffect(() => {
    fetch(API_URL)
      .then(r => r.json())
      .then(data => setItems(data))
      .catch(err => console.error(err))
  }, [])

  return (
    <div className="space-y-2">
      {items.map((item, idx) => {
        const isOpen = open === idx
        return (
          <div key={item.id || idx} className="card-surface p-4">
            <button
              onClick={() => setOpen(isOpen ? -1 : idx)}
              className="flex w-full items-center justify-between text-left"
              aria-expanded={isOpen}
            >
              <span className="font-semibold text-slate-900">{item.question}</span>
              <span className="text-sky-600 text-xl">{isOpen ? '−' : '+'}</span>
            </button>
            {isOpen && <p className="mt-3 text-sm text-slate-600">{item.answer}</p>}
          </div>
        )
      })}
    </div>
  )
}
