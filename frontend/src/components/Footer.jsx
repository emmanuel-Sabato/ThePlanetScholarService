import { Link, useLocation } from 'react-router-dom'
import { useToast } from '../context/ToastContext'
import logo from '../assets/Thep2s.png'

export default function Footer() {
  const location = useLocation()
  const { addToast } = useToast()

  const isDashboard = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin/dashboard')

  const handleLinkClick = (e, to) => {
    if (isDashboard) {
      e.preventDefault()
      addToast('error', 'You have to Logout first in orther to keep security for your data!')
    }
  }

  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="section-container py-12 grid gap-8 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <img src={logo} alt="The Planet Scholer Service Logo" className="h-10 w-20 object-contain" />
            <span className="text-lg font-bold text-slate-900">The Planet Scholer Service</span>
          </div>
          <p className="mt-4 text-slate-600 text-sm leading-relaxed">
            We connect students to trusted scholarships worldwide, providing guidance on applications,
            essays, and visa preparation.
          </p>
          <div className="mt-4 flex flex-col gap-2 text-sm text-slate-600">
            <a
              className="hover:text-sky-600 flex items-center gap-2"
              href="https://www.instagram.com/thep2s_apply_ltd/"
              target="_blank"
              rel="noreferrer"
              onClick={(e) => handleLinkClick(e)}
            >
              <span className="font-semibold">IG:</span> @thep2s_apply_ltd
            </a>
            <a
              className="hover:text-sky-600 flex items-center gap-2"
              href="tel:+250781306944"
              onClick={(e) => handleLinkClick(e)}
            >
              <span className="font-semibold">Call & Message:</span> 0781306944
            </a>
            <a
              className="hover:text-sky-600 flex items-center gap-2"
              href="mailto:iradukundagasangwa18@gmail.com"
              onClick={(e) => handleLinkClick(e)}
            >
              <span className="font-semibold">Email:</span> iradukundagasangwa18@gmail.com
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-900">Company</h3>
          <div className="mt-3 flex flex-col gap-2 text-sm text-slate-600">
            <Link to="/about" onClick={(e) => handleLinkClick(e, '/about')} className="hover:text-sky-600">About</Link>
            <Link to="/services" onClick={(e) => handleLinkClick(e, '/services')} className="hover:text-sky-600">Services</Link>
            <Link to="/blog" onClick={(e) => handleLinkClick(e, '/blog')} className="hover:text-sky-600">Blog</Link>
            <Link to="/contact" onClick={(e) => handleLinkClick(e, '/contact')} className="hover:text-sky-600">Contact</Link>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-900">Resources</h3>
          <div className="mt-3 flex flex-col gap-2 text-sm text-slate-600">
            <Link to="/scholarships" onClick={(e) => handleLinkClick(e, '/scholarships')} className="hover:text-sky-600">Scholarship Directory</Link>
            <a href="#faqs" onClick={(e) => handleLinkClick(e)} className="hover:text-sky-600">FAQs</a>
            <a href="#hero" onClick={(e) => handleLinkClick(e)} className="hover:text-sky-600">Back to top</a>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-200 py-4">
        <div className="section-container flex flex-col gap-2 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} The Planet Scholer Service. All rights reserved.</p>
          <div className="flex gap-3">
            <a className="hover:text-sky-600" href="#" onClick={(e) => handleLinkClick(e)}>Privacy</a>
            <a className="hover:text-sky-600" href="#" onClick={(e) => handleLinkClick(e)}>Terms</a>
            <a className="hover:text-sky-600" href="#" onClick={(e) => handleLinkClick(e)}>Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

