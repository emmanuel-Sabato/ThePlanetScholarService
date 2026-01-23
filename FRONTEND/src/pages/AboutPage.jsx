import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Globe, Award, FileText, Users, Target, Heart, Loader2, ArrowRight } from 'lucide-react'
import shamiImage from '../assets/My-Image.jpg'

const API_URL = 'https://backend-tau-lime-64.vercel.app/api'

const imageMap = {
  'My-Image.jpg': shamiImage,
}

  const stats = [
    { label: 'Countries served', value: '50+', icon: Globe, color: 'from-sky-100 to-blue-100', iconColor: 'text-sky-600' },
    { label: 'Scholarships tracked', value: '2,500+', icon: Award, color: 'from-emerald-100 to-teal-100', iconColor: 'text-emerald-600' },
    { label: 'Essays reviewed', value: '1,200+', icon: FileText, color: 'from-cyan-100 to-sky-100', iconColor: 'text-cyan-600' },
    { label: 'Students helped', value: '10K+', icon: Users, color: 'from-blue-100 to-indigo-100', iconColor: 'text-blue-600' },
  ]

export default function AboutPage() {
  const [mission, setMission] = useState({ title: '', content: '' })
  const [teamMembers, setTeamMembers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [missionData, teamData] = await Promise.all([
        fetch(`${API_URL}/mission`).then(r => r.json()),
        fetch(`${API_URL}/team`).then(r => r.json()),
      ])
      setMission(missionData)
      setTeamMembers(teamData)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching data:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-rose-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-sky-50 via-white to-slate-50 py-16 md:py-20">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <p className="text-xs uppercase tracking-wide text-sky-600 font-semibold">About Us</p>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
              Mission-Driven Scholarship Guidance
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              We believe access to education should be global. Our team brings admissions, scholarship, and visa expertise together so you can focus on presenting your best story.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section-container py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {stats.map((item, index) => {
            const Icon = item.icon
            return (
              <div
                key={index}
                className="bg-white rounded-xl border border-slate-200 p-6 text-center hover:shadow-md transition-shadow"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br ${item.color} mb-3`}>
                  <Icon className={`w-6 h-6 ${item.iconColor}`} />
                </div>
                <p className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">{item.value}</p>
                <p className="text-xs md:text-sm text-slate-600">{item.label}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Mission Section */}
      <section className="section-container py-12 md:py-16">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-12 shadow-sm">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center">
                <Target className="w-6 h-6 text-sky-600" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
                {mission.title || 'Our Mission'}
              </h2>
            </div>
            <p className="text-lg text-slate-700 leading-relaxed">
              {mission.content || 'We are dedicated to making quality education accessible to students worldwide by providing comprehensive scholarship guidance, application support, and visa assistance. Our mission is to empower students to achieve their academic dreams through expert advice and personalized support.'}
            </p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="section-container py-12 md:py-16">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart className="w-6 h-6 text-emerald-600" />
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Our Team</h2>
          </div>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Meet the experts dedicated to helping you succeed in your scholarship journey.
          </p>
        </div>

        {teamMembers.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {teamMembers.map((member) => (
              <div
                key={member.name}
                className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start gap-4 mb-4">
                  {member.image && imageMap[member.image] ? (
                    <img
                      src={imageMap[member.image]}
                      alt={member.name}
                      className="h-16 w-16 rounded-full object-cover border-2 border-sky-100"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-sky-500 to-emerald-500 text-white flex items-center justify-center text-xl font-semibold border-2 border-sky-100">
                      {member.name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-lg font-semibold text-slate-900">{member.name}</p>
                    <p className="text-sm text-sky-600 font-medium">{member.role}</p>
                  </div>
                </div>
                {member.bio && (
                  <p className="text-sm text-slate-600 leading-relaxed">{member.bio}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">Team information coming soon.</p>
          </div>
        )}
      </section>

      {/* CTA Section */} 
      <section className="section-container py-12 md:py-16">
        <div className="bg-gradient-to-r from-sky-600 to-emerald-500 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-lg text-sky-50 mb-8 max-w-2xl mx-auto">
            Join thousands of students who have successfully secured scholarships with our guidance.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/scholarships" className="btn-cta-white">
              Browse Scholarships
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/contact" className="bg-emerald-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-emerald-700 transition-colors border-2 border-white/20">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

