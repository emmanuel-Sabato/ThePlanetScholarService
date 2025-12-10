import { Link } from 'react-router-dom'
import logo from '../assets/Thep2s.png'

export default function Footer() {
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
          <div className="mt-4 flex gap-3 text-slate-500">
            <a className="hover:text-sky-600" href="mailto:support@scholarshipworld.com">support@scholarshipworld.com</a>
            <span aria-hidden="true">·</span>
            <a className="hover:text-sky-600" href="https://www.linkedin.com" target="_blank" rel="noreferrer">LinkedIn</a>
            <a className="hover:text-sky-600" href="https://twitter.com" target="_blank" rel="noreferrer">X</a>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-900">Company</h3>
          <div className="mt-3 flex flex-col gap-2 text-sm text-slate-600">
            <Link to="/about" className="hover:text-sky-600">About</Link>
            <Link to="/services" className="hover:text-sky-600">Services</Link>
            <Link to="/blog" className="hover:text-sky-600">Blog</Link>
            <Link to="/contact" className="hover:text-sky-600">Contact</Link>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-900">Resources</h3>
          <div className="mt-3 flex flex-col gap-2 text-sm text-slate-600">
            <Link to="/scholarships" className="hover:text-sky-600">Scholarship Directory</Link>
            <a href="#faqs" className="hover:text-sky-600">FAQs</a>
            <a href="#hero" className="hover:text-sky-600">Back to top</a>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-200 py-4">
        <div className="section-container flex flex-col gap-2 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} The Planet Scholer Service. All rights reserved.</p>
          <div className="flex gap-3">
            <a className="hover:text-sky-600" href="#">Privacy</a>
            <a className="hover:text-sky-600" href="#">Terms</a>
            <a className="hover:text-sky-600" href="#">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

