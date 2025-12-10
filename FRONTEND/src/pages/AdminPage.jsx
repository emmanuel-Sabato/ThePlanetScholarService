import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2, Plus, Edit2, BookOpen, Users, Briefcase, MessageSquare, HelpCircle, GraduationCap, Star, LogOut, Settings } from 'lucide-react'

const API_URL = 'http://localhost:3000/api'

const ICON_MAP = {
    Target: 'Target',
    FileEdit: 'FileEdit',
    Plane: 'Plane',
    Palette: 'Palette',
    Smartphone: 'Smartphone'
}

export default function AdminPage() {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('scholarships')
    const [loading, setLoading] = useState(false)

    // Check authentication
    useEffect(() => {
        const isAuthenticated = localStorage.getItem('adminAuth')
        if (!isAuthenticated) {
            navigate('/admin')
        }
    }, [navigate])

    // Data states
    const [scholarships, setScholarships] = useState([])
    const [services, setServices] = useState([])
    const [mission, setMission] = useState({ title: '', content: '' })
    const [team, setTeam] = useState([])
    const [blog, setBlog] = useState([])
    const [faqs, setFaqs] = useState([])
    const [testimonials, setTestimonials] = useState([])

    // Form states
    const [scholarshipForm, setScholarshipForm] = useState({ title: '', country: '', degree: '', field: '', deadline: '', description: '', eligibility: '', benefits: '' })
    const [serviceForm, setServiceForm] = useState({ title: '', icon: 'Target', description: '' })
    const [missionForm, setMissionForm] = useState({ title: '', content: '' })
    const [teamForm, setTeamForm] = useState({ name: '', role: '', bio: '', image: '' })
    const [blogForm, setBlogForm] = useState({ title: '', excerpt: '', author: '', date: '', content: '' })
    const [faqForm, setFaqForm] = useState({ question: '', answer: '' })
    const [testimonialForm, setTestimonialForm] = useState({ name: '', country: '', quote: '' })
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
    const [passwordMessage, setPasswordMessage] = useState('')

    useEffect(() => {
        fetchAll()
    }, [])

    function handleLogout() {
        localStorage.removeItem('adminAuth')
        navigate('/admin')
    }

    function handleChangePassword(e) {
        e.preventDefault()
        setPasswordMessage('')

        const storedPassword = localStorage.getItem('adminPassword') || 'admin123'

        if (passwordForm.currentPassword !== storedPassword) {
            setPasswordMessage('Current password is incorrect')
            return
        }

        if (passwordForm.newPassword.length < 6) {
            setPasswordMessage('New password must be at least 6 characters')
            return
        }

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordMessage('New passwords do not match')
            return
        }

        localStorage.setItem('adminPassword', passwordForm.newPassword)
        setPasswordMessage('Password changed successfully!')
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })

        setTimeout(() => setPasswordMessage(''), 3000)
    }

    async function fetchAll() {
        setLoading(true)
        try {
            const [scholarshipsData, servicesData, missionData, teamData, blogData, faqsData, testimonialsData] = await Promise.all([
                fetch(`${API_URL}/scholarships`).then(r => r.json()),
                fetch(`${API_URL}/services`).then(r => r.json()),
                fetch(`${API_URL}/mission`).then(r => r.json()),
                fetch(`${API_URL}/team`).then(r => r.json()),
                fetch(`${API_URL}/blog`).then(r => r.json()),
                fetch(`${API_URL}/faqs`).then(r => r.json()),
                fetch(`${API_URL}/testimonials`).then(r => r.json()),
            ])
            setScholarships(scholarshipsData)
            setServices(servicesData)
            setMission(missionData)
            setMissionForm(missionData)
            setTeam(teamData)
            setBlog(blogData)
            setFaqs(faqsData)
            setTestimonials(testimonialsData)
        } catch (error) {
            console.error('Error fetching data:', error)
        }
        setLoading(false)
    }

    // Generic handlers
    async function handleAdd(endpoint, data, resetForm) {
        try {
            const response = await fetch(`${API_URL}/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            if (response.ok) {
                await fetchAll()
                resetForm()
                alert('Added successfully!')
            }
        } catch (error) {
            console.error('Error adding:', error)
            alert('Failed to add')
        }
    }

    async function handleDelete(endpoint, id) {
        if (!confirm('Are you sure you want to delete this item?')) return
        try {
            const response = await fetch(`${API_URL}/${endpoint}/${id}`, { method: 'DELETE' })
            if (response.ok) {
                await fetchAll()
                alert('Deleted successfully!')
            }
        } catch (error) {
            console.error('Error deleting:', error)
            alert('Failed to delete')
        }
    }

    async function handleUpdateMission() {
        try {
            const response = await fetch(`${API_URL}/mission`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(missionForm)
            })
            if (response.ok) {
                setMission(missionForm)
                alert('Mission updated successfully!')
            }
        } catch (error) {
            console.error('Error updating mission:', error)
            alert('Failed to update mission')
        }
    }

    const tabs = [
        { id: 'scholarships', label: 'Scholarships', icon: GraduationCap },
        { id: 'services', label: 'Services', icon: Briefcase },
        { id: 'mission', label: 'Mission', icon: BookOpen },
        { id: 'team', label: 'Team', icon: Users },
        { id: 'blog', label: 'Blog', icon: Edit2 },
        { id: 'faqs', label: 'FAQs', icon: HelpCircle },
        { id: 'testimonials', label: 'Success Stories', icon: Star },
        { id: 'settings', label: 'Settings', icon: Settings },
    ]

    if (loading) {
        return (
            <div className="section-container py-12 text-center">
                <p className="text-slate-600">Loading...</p>
            </div>
        )
    }

    return (
        <div className="section-container py-12 space-y-6">
            <div className="text-center space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex-1" />
                    <div className="flex-1 text-center">
                        <p className="text-xs uppercase tracking-wide text-emerald-600 font-semibold">Admin Panel</p>
                        <h1 className="text-3xl font-bold text-slate-900">Content Management</h1>
                        <p className="text-sm text-slate-600">Manage all website content from here</p>
                    </div>
                    <div className="flex-1 flex justify-end">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                            <LogOut className="h-4 w-4" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="card-surface p-2">
                <div className="flex overflow-x-auto gap-2">
                    {tabs.map(tab => {
                        const Icon = tab.icon
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${activeTab === tab.id
                                    ? 'bg-sky-600 text-white'
                                    : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                            >
                                <Icon className="h-4 w-4" />
                                {tab.label}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Scholarships Tab */}
            {activeTab === 'scholarships' && (
                <div className="space-y-6">
                    <div className="card-surface p-6">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <Plus className="h-5 w-5 text-emerald-600" />
                            Add New Scholarship
                        </h2>
                        <form onSubmit={(e) => { e.preventDefault(); handleAdd('scholarships', scholarshipForm, () => setScholarshipForm({ title: '', country: '', degree: '', field: '', deadline: '', description: '', eligibility: '', benefits: '' })) }} className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <input type="text" required placeholder="Title" value={scholarshipForm.title} onChange={(e) => setScholarshipForm({ ...scholarshipForm, title: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
                                <input type="text" required placeholder="Country" value={scholarshipForm.country} onChange={(e) => setScholarshipForm({ ...scholarshipForm, country: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
                                <input type="text" required placeholder="Degree" value={scholarshipForm.degree} onChange={(e) => setScholarshipForm({ ...scholarshipForm, degree: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
                                <input type="text" required placeholder="Field" value={scholarshipForm.field} onChange={(e) => setScholarshipForm({ ...scholarshipForm, field: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
                                <input type="date" required value={scholarshipForm.deadline} onChange={(e) => setScholarshipForm({ ...scholarshipForm, deadline: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
                            </div>
                            <textarea required rows="3" placeholder="Description" value={scholarshipForm.description} onChange={(e) => setScholarshipForm({ ...scholarshipForm, description: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
                            <textarea required rows="2" placeholder="Eligibility" value={scholarshipForm.eligibility} onChange={(e) => setScholarshipForm({ ...scholarshipForm, eligibility: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
                            <textarea required rows="2" placeholder="Benefits" value={scholarshipForm.benefits} onChange={(e) => setScholarshipForm({ ...scholarshipForm, benefits: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
                            <button type="submit" className="btn-primary">Add Scholarship</button>
                        </form>
                    </div>

                    <div className="card-surface p-6">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">All Scholarships ({scholarships.length})</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Title</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Country</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Degree</th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold text-slate-900">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {scholarships.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 text-sm text-slate-900">{item.title}</td>
                                            <td className="px-4 py-3 text-sm text-slate-600">{item.country}</td>
                                            <td className="px-4 py-3 text-sm text-slate-600">{item.degree}</td>
                                            <td className="px-4 py-3 text-right">
                                                <button onClick={() => handleDelete('scholarships', item.id)} className="inline-flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition">
                                                    <Trash2 className="h-4 w-4" /> Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Services Tab */}
            {activeTab === 'services' && (
                <div className="space-y-6">
                    <div className="card-surface p-6">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <Plus className="h-5 w-5 text-emerald-600" />
                            Add New Service
                        </h2>
                        <form onSubmit={(e) => { e.preventDefault(); handleAdd('services', serviceForm, () => setServiceForm({ title: '', icon: 'Target', description: '' })) }} className="space-y-4">
                            <input type="text" required placeholder="Service Title" value={serviceForm.title} onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
                            <select required value={serviceForm.icon} onChange={(e) => setServiceForm({ ...serviceForm, icon: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500">
                                <option value="Target">Target (🎯)</option>
                                <option value="FileEdit">FileEdit (📝)</option>
                                <option value="Plane">Plane (✈️)</option>
                                <option value="Palette">Palette (🎨)</option>
                                <option value="Smartphone">Smartphone (📱)</option>
                            </select>
                            <textarea required rows="3" placeholder="Description" value={serviceForm.description} onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
                            <button type="submit" className="btn-primary">Add Service</button>
                        </form>
                    </div>

                    <div className="card-surface p-6">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">All Services ({services.length})</h2>
                        <div className="space-y-3">
                            {services.map((item) => (
                                <div key={item.id} className="flex items-start justify-between p-4 bg-slate-50 rounded-lg">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-slate-900">{item.title}</h3>
                                        <p className="text-sm text-slate-600 mt-1">{item.description}</p>
                                        <p className="text-xs text-slate-500 mt-1">Icon: {item.icon}</p>
                                    </div>
                                    <button onClick={() => handleDelete('services', item.id)} className="inline-flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:bg-red-100 rounded-lg transition">
                                        <Trash2 className="h-4 w-4" /> Delete
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Mission Tab */}
            {activeTab === 'mission' && (
                <div className="card-surface p-6">
                    <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <Edit2 className="h-5 w-5 text-emerald-600" />
                        Edit Mission Statement
                    </h2>
                    <div className="space-y-4">
                        <input type="text" required placeholder="Mission Title" value={missionForm.title} onChange={(e) => setMissionForm({ ...missionForm, title: e.target.value })} className="w-full px-3 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
                        <textarea required rows="5" placeholder="Mission Content" value={missionForm.content} onChange={(e) => setMissionForm({ ...missionForm, content: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
                        <button onClick={handleUpdateMission} className="btn-primary">Update Mission</button>
                    </div>
                    <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                        <h3 className="font-semibold text-slate-900">{mission.title}</h3>
                        <p className="text-sm text-slate-600 mt-2">{mission.content}</p>
                    </div>
                </div>
            )}

            {/* Team Tab */}
            {activeTab === 'team' && (
                <div className="space-y-6">
                    <div className="card-surface p-6">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <Plus className="h-5 w-5 text-emerald-600" />
                            Add Team Member
                        </h2>
                        <form onSubmit={(e) => { e.preventDefault(); handleAdd('team', teamForm, () => setTeamForm({ name: '', role: '', bio: '', image: '' })) }} className="space-y-4">
                            <input type="text" required placeholder="Name" value={teamForm.name} onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
                            <input type="text" required placeholder="Role" value={teamForm.role} onChange={(e) => setTeamForm({ ...teamForm, role: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
                            <textarea required rows="2" placeholder="Bio" value={teamForm.bio} onChange={(e) => setTeamForm({ ...teamForm, bio: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
                            <input type="text" placeholder="Image filename (optional)" value={teamForm.image} onChange={(e) => setTeamForm({ ...teamForm, image: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
                            <button type="submit" className="btn-primary">Add Team Member</button>
                        </form>
                    </div>

                    <div className="card-surface p-6">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">Team Members ({team.length})</h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            {team.map((item) => (
                                <div key={item.id} className="p-4 bg-slate-50 rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold text-slate-900">{item.name}</h3>
                                            <p className="text-sm text-emerald-700">{item.role}</p>
                                            <p className="text-sm text-slate-600 mt-1">{item.bio}</p>
                                            {item.image && <p className="text-xs text-slate-500 mt-1">Image: {item.image}</p>}
                                        </div>
                                        <button onClick={() => handleDelete('team', item.id)} className="text-red-600 hover:bg-red-100 p-2 rounded-lg transition">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Blog Tab */}
            {activeTab === 'blog' && (
                <div className="space-y-6">
                    <div className="card-surface p-6">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <Plus className="h-5 w-5 text-emerald-600" />
                            Add Blog Post
                        </h2>
                        <form onSubmit={(e) => { e.preventDefault(); handleAdd('blog', blogForm, () => setBlogForm({ title: '', excerpt: '', author: '', date: '', content: '' })) }} className="space-y-4">
                            <input type="text" required placeholder="Title" value={blogForm.title} onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
                            <input type="text" required placeholder="Excerpt" value={blogForm.excerpt} onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
                            <div className="grid gap-4 md:grid-cols-2">
                                <input type="text" required placeholder="Author" value={blogForm.author} onChange={(e) => setBlogForm({ ...blogForm, author: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
                                <input type="date" required value={blogForm.date} onChange={(e) => setBlogForm({ ...blogForm, date: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
                            </div>
                            <textarea required rows="5" placeholder="Content" value={blogForm.content} onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
                            <button type="submit" className="btn-primary">Add Blog Post</button>
                        </form>
                    </div>

                    <div className="card-surface p-6">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">Blog Posts ({blog.length})</h2>
                        <div className="space-y-3">
                            {blog.map((item) => (
                                <div key={item.id} className="p-4 bg-slate-50 rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-slate-900">{item.title}</h3>
                                            <p className="text-sm text-slate-600 mt-1">{item.excerpt}</p>
                                            <p className="text-xs text-slate-500 mt-2">By {item.author} • {item.date}</p>
                                        </div>
                                        <button onClick={() => handleDelete('blog', item.id)} className="text-red-600 hover:bg-red-100 p-2 rounded-lg transition">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* FAQs Tab */}
            {activeTab === 'faqs' && (
                <div className="space-y-6">
                    <div className="card-surface p-6">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <Plus className="h-5 w-5 text-emerald-600" />
                            Add FAQ
                        </h2>
                        <form onSubmit={(e) => { e.preventDefault(); handleAdd('faqs', faqForm, () => setFaqForm({ question: '', answer: '' })) }} className="space-y-4">
                            <input type="text" required placeholder="Question" value={faqForm.question} onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
                            <textarea required rows="3" placeholder="Answer" value={faqForm.answer} onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
                            <button type="submit" className="btn-primary">Add FAQ</button>
                        </form>
                    </div>

                    <div className="card-surface p-6">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">FAQs ({faqs.length})</h2>
                        <div className="space-y-3">
                            {faqs.map((item) => (
                                <div key={item.id} className="p-4 bg-slate-50 rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-slate-900">{item.question}</h3>
                                            <p className="text-sm text-slate-600 mt-1">{item.answer}</p>
                                        </div>
                                        <button onClick={() => handleDelete('faqs', item.id)} className="text-red-600 hover:bg-red-100 p-2 rounded-lg transition">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Success Stories / Testimonials Tab */}
            {activeTab === 'testimonials' && (
                <div className="space-y-6">
                    <div className="card-surface p-6">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <Plus className="h-5 w-5 text-emerald-600" />
                            Add Success Story
                        </h2>
                        <form onSubmit={(e) => { e.preventDefault(); handleAdd('testimonials', testimonialForm, () => setTestimonialForm({ name: '', country: '', quote: '' })) }} className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <input type="text" required placeholder="Name" value={testimonialForm.name} onChange={(e) => setTestimonialForm({ ...testimonialForm, name: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
                                <input type="text" required placeholder="Country" value={testimonialForm.country} onChange={(e) => setTestimonialForm({ ...testimonialForm, country: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
                            </div>
                            <textarea required rows="3" placeholder="Success Story / Quote" value={testimonialForm.quote} onChange={(e) => setTestimonialForm({ ...testimonialForm, quote: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
                            <button type="submit" className="btn-primary">Add Success Story</button>
                        </form>
                    </div>

                    <div className="card-surface p-6">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">Success Stories ({testimonials.length})</h2>
                        <div className="space-y-3">
                            {testimonials.map((item) => (
                                <div key={item.id} className="p-4 bg-slate-50 rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-slate-900">{item.name}</h3>
                                                <span className="text-sm text-slate-500">• {item.country}</span>
                                            </div>
                                            <p className="text-sm text-slate-600 mt-2 italic">"{item.quote}"</p>
                                        </div>
                                        <button onClick={() => handleDelete('testimonials', item.id)} className="text-red-600 hover:bg-red-100 p-2 rounded-lg transition">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
                <div className="space-y-6">
                    <div className="card-surface p-6">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <Settings className="h-5 w-5 text-emerald-600" />
                            Change Password
                        </h2>
                        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                                <input
                                    type="password"
                                    required
                                    placeholder="Enter current password"
                                    value={passwordForm.currentPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                                <input
                                    type="password"
                                    required
                                    placeholder="Enter new password (min 6 characters)"
                                    value={passwordForm.newPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
                                <input
                                    type="password"
                                    required
                                    placeholder="Re-enter new password"
                                    value={passwordForm.confirmPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                                />
                            </div>
                            {passwordMessage && (
                                <p className={`text-sm ${passwordMessage.includes('success') ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {passwordMessage}
                                </p>
                            )}
                            <button type="submit" className="btn-primary">
                                Change Password
                            </button>
                        </form>
                    </div>

                    <div className="card-surface p-6">
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">Security Information</h3>
                        <div className="space-y-2 text-sm text-slate-600">
                            <p>• Password must be at least 6 characters long</p>
                            <p>• Password is stored in browser localStorage</p>
                            <p>• Default password: <code className="px-2 py-1 bg-slate-100 rounded">admin123</code></p>
                            <p>• Change password regularly for better security</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
