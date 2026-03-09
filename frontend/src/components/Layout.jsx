import { useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import Chatbot from './Chatbot'

export default function Layout({ children }) {
  const location = useLocation()
  const isDashboard = location.pathname.startsWith('/dashboard') ||
    location.pathname.startsWith('/admin/dashboard') ||
    location.pathname.startsWith('/apply')

  useEffect(() => {
    const titles = {
      '/': 'The Planet Scholar Service - Home',
      '/scholarships': 'Browse Scholarships - The Planet Scholar Service',
      '/services': 'Our Services - The Planet Scholar Service',
      '/about': 'About Us - The Planet Scholar Service',
      '/contact': 'Contact Us - The Planet Scholar Service',
      '/blog': 'Blog & Updates - The Planet Scholar Service',
      '/login': 'Login - The Planet Scholar Service',
      '/register': 'Register - The Planet Scholar Service',
    }

    const currentTitle = titles[location.pathname] || 'The Planet Scholar Service'
    document.title = currentTitle
  }, [location.pathname])

  return (
    <div className="min-h-screen flex flex-col">
      {!isDashboard && <Navbar />}
      <main className={`flex-1 ${!isDashboard ? 'pt-24' : ''}`}>{children}</main>
      {!isDashboard && <Footer />}
      {!isDashboard && <Chatbot />}
    </div>
  )
}


