import { useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useToast } from '../context/ToastContext'
import logo from '../assets/Thep2s.png'

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Scholarships', to: '/scholarships' },
  { label: 'Services', to: '/services' },
  { label: 'About', to: '/about' },
  { label: 'Blog', to: '/blog' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { addToast } = useToast()

  const isDashboard = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin/dashboard')

  const handleLinkClick = (e, to) => {
    if (isDashboard) {
      // Allow only logout or dashboard sub-links if any exist. 
      // For now, blocking all public links.
      e.preventDefault()
      addToast('error', 'You have to Logout first in orther to keep security for your data!')
    } else {
      setOpen(false)
    }
  }

  return (
    <header className="fixed top-4 left-0 right-0 z-50 px-4">
      <div className="mx-auto max-w-7xl glass rounded-2xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.1)] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-3">
          <Link
            to="/"
            onClick={(e) => handleLinkClick(e, '/')}
            className="flex items-center gap-3 transition hover:opacity-90"
          >
            <img src={logo} alt="The Planet Scholer Service Logo" className="h-10 w-10 object-contain rounded-lg bg-white/50 p-1" />
            <div className="hidden sm:block">
              <p className="text-base font-bold text-slate-900 leading-tight">The Planet Scholar</p>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">Global Opportunities</p>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-2 bg-slate-100/50 p-1 rounded-xl">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={(e) => handleLinkClick(e, item.to)}
                className={({ isActive }) =>
                  `px-4 py-1.5 text-sm font-semibold rounded-lg transition-all ${isActive
                    ? 'bg-white text-sky-600 shadow-sm'
                    : 'text-slate-600 hover:text-sky-600 hover:bg-white/50'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <Link
              to="/login"
              onClick={(e) => handleLinkClick(e, '/login')}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-sky-600 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/contact"
              onClick={(e) => handleLinkClick(e, '/contact')}
              className="btn-primary py-2 shadow-md"
            >
              Contact Us
            </Link>
          </div>

          <button
            className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/50 text-slate-700 hover:bg-slate-50 transition"
            onClick={() => setOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
          >
            <span className="text-xl leading-none">{open ? '✕' : '☰'}</span>
          </button>
        </div>

        {open && (
          <div className="lg:hidden border-t border-slate-100 bg-white/80 backdrop-blur-md">
            <div className="flex flex-col p-4 gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={(e) => handleLinkClick(e, item.to)}
                  className={({ isActive }) =>
                    `px-4 py-2.5 text-sm font-semibold rounded-xl transition ${isActive ? 'bg-sky-50 text-sky-700' : 'text-slate-700 hover:bg-slate-50'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-slate-100">
                <Link
                  to="/login"
                  onClick={(e) => handleLinkClick(e, '/login')}
                  className="flex items-center justify-center gap-2 p-3 text-slate-700 hover:bg-slate-50 rounded-xl transition font-semibold"
                >
                  Sign In
                </Link>
                <Link
                  to="/contact"
                  onClick={(e) => handleLinkClick(e, '/contact')}
                  className="btn-primary w-full text-center"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
