import { useState, useEffect } from 'react'
import shamiImage from '../assets/My-Image.jpg'

const API_URL = 'http://localhost:3000/api'

// Map image filenames to imported images
const imageMap = {
  'My-Image.jpg': shamiImage,
}

const stats = [
  { label: 'Countries served', value: '50+' },
  { label: 'Scholarships tracked', value: '2,500+' },
  { label: 'Essays reviewed', value: '1,200+' },
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
      <div className="section-container py-12 text-center">
        <p className="text-slate-600">Loading...</p>
      </div>
    )
  }

  return (
    <div className="section-container py-12 space-y-10">
      <div className="text-center space-y-3">
        <p className="text-xs uppercase tracking-wide text-emerald-600 font-semibold">About us</p>
        <h1 className="text-3xl font-bold text-slate-900">Mission-driven scholarship guidance</h1>
        <p className="text-sm text-slate-600 max-w-2xl mx-auto">
          We believe access to education should be global. Our team brings admissions, scholarship, and visa expertise
          together so you can focus on presenting your best story.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {stats.map((item) => (
          <div key={item.label} className="card-surface p-6 text-center">
            <p className="text-3xl font-bold text-slate-900">{item.value}</p>
            <p className="text-sm text-slate-600">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="card-surface p-6 md:p-8">
        <h2 className="text-xl font-semibold text-slate-900">{mission.title || 'Our mission'}</h2>
        <p className="mt-2 text-slate-700">
          {mission.content || 'Loading...'}
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">Team and partners</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {teamMembers.map((member) => (
            <div key={member.name} className="card-surface p-5 space-y-2">
              {member.image && imageMap[member.image] ? (
                <img
                  src={imageMap[member.image]}
                  alt={member.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-sky-600 to-emerald-500 text-white flex items-center justify-center text-lg font-semibold">
                  {member.name.charAt(0)}
                </div>
              )}
              <p className="text-lg font-semibold text-slate-900">{member.name}</p>
              <p className="text-sm text-emerald-700">{member.role}</p>
              <p className="text-sm text-slate-600">{member.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

