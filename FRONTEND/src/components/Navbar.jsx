import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import logo from '../assets/Thep2s.png'
import { WifiZero } from 'lucide-react'

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Scholarships', to: '/scholarships' },
  { label: 'Services', to: '/services' },
  { label: 'About', to: '/about' },
  { label: 'Blog', to: '/blog' },
  { label: 'Contact', to: '/contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  const renderLink = (item) => (
    <NavLink
      key={item.to}
      to={item.to}
      onClick={() => setOpen(false)}
      className={({ isActive }) =>
        `px-3 py-2 text-sm font-semibold transition ${isActive ? 'text-sky-700' : 'text-slate-700 hover:text-sky-600'
        }`
      }
    >
      {item.label}
    </NavLink>
  )

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-100">
      <div className="section-container flex items-center justify-between py-3">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="The Planet Scholer Service Logo" className="h-10 w-20 object-contain" />
          <div>
            <p className="text-base font-bold text-slate-900">The Planet Scholer Service</p>
            <p className="text-xs text-slate-500">Find scholarships worldwide</p>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">{navItems.map(renderLink)}</nav>

        <div className="hidden lg:flex items-center gap-2">
          <Link to="/contact" className="btn-primary">Apply Now</Link>
          <Link
            to="/admin"
            className="p-2 text-slate-400 hover:text-sky-600 transition"
            aria-label="Admin"
          >
            <WifiZero className="h-5 w-5" />
          </Link>
        </div>

        <button
          className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:text-sky-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
        >
          <span className="text-xl">{open ? '✕' : '☰'}</span>
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-slate-100 bg-white">
          <div className="section-container flex flex-col py-4 gap-2">
            {navItems.map(renderLink)}
            <div className="flex flex-col gap-2 pt-2">
              <Link to="/contact" className="btn-primary w-full text-center">Apply Now</Link>
              <Link
                to="/admin"
                className="flex items-center justify-center gap-2 p-2 text-slate-400 hover:text-sky-600 transition"
                onClick={() => setOpen(false)}
              >
                <WifiZero className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

