import { useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

export default function Layout({ children }) {
  const location = useLocation()
  const isDashboard = location.pathname.startsWith('/dashboard') ||
    location.pathname.startsWith('/admin/dashboard') ||
    location.pathname.startsWith('/apply')

  return (
    <div className="min-h-screen flex flex-col">
      {!isDashboard && <Navbar />}
      <main className={`flex-1 ${!isDashboard ? 'pt-24' : ''}`}>{children}</main>
      {!isDashboard && <Footer />}
    </div>
  )
}

