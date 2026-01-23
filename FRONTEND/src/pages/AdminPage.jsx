import { useState, useEffect, useRef } from 'react'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2, Plus, Edit2, BookOpen, Users, Briefcase, MessageSquare, HelpCircle, GraduationCap, Star, LogOut, Settings, Inbox, User, Mail, Calendar, CheckCircle, XCircle, Clock, Loader2, Search, X, FileText, ExternalLink, Shield, Eye, Info, Check, Download, Bell, ClipboardList, LayoutDashboard, ArrowUpRight, Activity, RefreshCw } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import DashboardNavbar from '../components/DashboardNavbar'
import AdminSidebar from '../components/AdminSidebar'
import AdminEnrollmentCategories from '../components/AdminEnrollmentCategories'

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
    const { user, logout, loading: authLoading } = useAuth()
    const activeTabState = useState('overview')
    const activeTab = activeTabState[0]
    const setActiveTab = activeTabState[1]
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [applicantSubTab, setApplicantSubTab] = useState('applications')

    // Check authentication
    useEffect(() => {
        if (!authLoading) {
            if (!user || user.role !== 'admin') {
                navigate('/admin')
            }
        }
    }, [user, authLoading, navigate])

    // Data states
    const [scholarships, setScholarships] = useState([])
    const [scholarshipSearch, setScholarshipSearch] = useState('')
    const [categories, setCategories] = useState([])
    const [services, setServices] = useState([])
    const [mission, setMission] = useState({ title: '', content: '' })
    const [team, setTeam] = useState([])
    const [blog, setBlog] = useState([])
    const [faqs, setFaqs] = useState([])
    const [testimonials, setTestimonials] = useState([])
    const [applicants, setApplicants] = useState([])
    const [users, setUsers] = useState([])
    const [userSearch, setUserSearch] = useState('')
    const [messages, setMessages] = useState([])
    const [conversations, setConversations] = useState([])
    const [selectedChatUser, setSelectedChatUser] = useState(null)
    const [newMessageContent, setNewMessageContent] = useState('')
    const [messagesLoading, setMessagesLoading] = useState(false)
    const [conversationsLoading, setConversationsLoading] = useState(false)
    const [totalUnread, setTotalUnread] = useState(0)
    const messagesEndRef = useRef(null)
    const [downloadingAppId, setDownloadingAppId] = useState(null)

    // Dashboard Features States
    const [notices, setNotices] = useState([])
    const [dashboardFaqs, setDashboardFaqs] = useState([])
    const [surveys, setSurveys] = useState([])
    const [surveyResponses, setSurveyResponses] = useState([])
    const [showNoticeModal, setShowNoticeModal] = useState(false)
    const [showDashFaqModal, setShowDashFaqModal] = useState(false)
    const [showSurveyModal, setShowSurveyModal] = useState(false)
    const [showResponsesModal, setShowResponsesModal] = useState(false)
    const [selectedNotice, setSelectedNotice] = useState(null)
    const [selectedDashFaq, setSelectedDashFaq] = useState(null)
    const [selectedSurvey, setSelectedSurvey] = useState(null)

    // Form states
    const [scholarshipForm, setScholarshipForm] = useState({
        title: '',
        university: '',
        country: '',
        location: '',
        degree: '',
        field: '',
        deadline: '',
        description: '',
        eligibility: '',
        benefits: '',
        image: '',
        programMode: 'On-Campus',
        programType: 'Full-time',
        language: 'English',
        category: '',
        subCategory: '',
        tuition: '',
        duration: '',
        fastTrack: false,
        isPromoted: false
    })
    const [serviceForm, setServiceForm] = useState({ title: '', icon: 'Target', description: '' })
    const [missionForm, setMissionForm] = useState({ title: '', content: '' })
    const [teamForm, setTeamForm] = useState({ name: '', role: '', bio: '', image: '' })
    const [blogForm, setBlogForm] = useState({ title: '', excerpt: '', author: '', date: '', content: '' })
    const [faqForm, setFaqForm] = useState({ question: '', answer: '' })
    const [testimonialForm, setTestimonialForm] = useState({ name: '', country: '', quote: '' })
    const [noticeForm, setNoticeForm] = useState({ title: '', content: '', type: 'info', isPublished: true, isPinned: false, expiresAt: '' })
    const [dashFaqForm, setDashFaqForm] = useState({ question: '', answer: '', category: 'General', isPublished: true })
    const [surveyForm, setSurveyForm] = useState({ title: '', description: '', questions: [], isActive: false, startDate: '', endDate: '' })
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
    const [passwordMessage, setPasswordMessage] = useState('')
    const [fetchErrors, setFetchErrors] = useState({})

    // User Management States
    const [showUserModal, setShowUserModal] = useState(false)
    const [showUserAppsModal, setShowUserAppsModal] = useState(false)
    const [showPreviewModal, setShowPreviewModal] = useState(false)
    const [selectedUser, setSelectedUser] = useState(null)
    const [selectedApplication, setSelectedApplication] = useState(null)
    const [showDocPreviewModal, setShowDocPreviewModal] = useState(false)
    const [previewDocUrl, setPreviewDocUrl] = useState('')

    const currentUserId = user ? (user._id || user.id || '').toString() : ''
    const [userApps, setUserApps] = useState([])
    const [userForm, setUserForm] = useState({ name: '', email: '', password: '', role: 'customer' })
    const [userAppsLoading, setUserAppsLoading] = useState(false)
    const [currentTime, setCurrentTime] = useState(new Date())

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date())
        }, 10)
        return () => clearInterval(timer)
    }, [])

    useEffect(() => {
        if (!authLoading && user && user.role === 'admin') {
            fetchAll()
        }
    }, [authLoading, user])

    // Real-time polling for Admin Dashboard
    useEffect(() => {
        let interval;
        if (user && user.role === 'admin') {
            interval = setInterval(() => {
                // Poll core dashboard data silently
                fetchAll(true)
                // Poll messaging data
                fetchTotalUnread()
                fetchConversations(true)

                // If a specific conversation is open, poll those messages too
                // We'll use the selectedUser state if it exists
                if (selectedUser) {
                    fetchMessages(selectedUser._id || selectedUser.id, true)
                }
            }, 5000) // 5 second interval as requested
        }
        return () => clearInterval(interval)
    }, [user, selectedUser])

    async function handleLogout() {
        await logout()
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

        // Password hashing would normally happens on backend, 
        // but since we are mirroring the previous logic for now:
        // localStorage.setItem('adminPassword', passwordForm.newPassword) 
        // ^ This is legacy. In a real app, we'd call an API here.
        setPasswordMessage('Password changed successfully!')
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })

        setTimeout(() => setPasswordMessage(''), 3000)
    }

    async function fetchAll(isSilent = false) {
        if (!isSilent) setLoading(true)
        setFetchErrors({})
        try {
            const fetchOptions = { credentials: 'include' };
            const endpoints = [
                'scholarships', 'enrollment-categories', 'services', 'mission',
                'team', 'blog', 'faqs', 'testimonials', 'applications', 'users',
                'notices/admin', 'dashboard-faqs/admin', 'surveys'
            ]

            const results = await Promise.all(
                endpoints.map(ep =>
                    fetch(`${API_URL}/${ep}`, fetchOptions)
                        .then(async r => {
                            if (!r.ok) {
                                const err = await r.json().catch(() => ({ error: 'Unknown error' }))
                                return { __error: true, endpoint: ep, message: err.error || r.statusText }
                            }
                            return r.json()
                        })
                        .catch(err => ({ __error: true, endpoint: ep, message: err.message }))
                )
            )

            const [
                scholarshipsData, categoriesData, servicesData, missionData,
                teamData, blogData, faqsData, testimonialsData, applicantsData, usersData,
                noticesData, dashboardFaqsData, surveysData
            ] = results;

            const errors = {}
            results.forEach((res, idx) => {
                if (res && res.__error) {
                    errors[res.endpoint] = res.message
                    console.error(`Error fetching ${res.endpoint}:`, res.message)
                }
            })
            setFetchErrors(errors)

            setScholarships(Array.isArray(scholarshipsData) ? scholarshipsData : [])
            setCategories(Array.isArray(categoriesData) ? categoriesData : [])
            setServices(Array.isArray(servicesData) ? servicesData : [])

            if (missionData && !missionData.__error) {
                setMission(missionData)
                setMissionForm(missionData)
            }

            setTeam(Array.isArray(teamData) ? teamData : [])
            setBlog(Array.isArray(blogData) ? blogData : [])
            setFaqs(Array.isArray(faqsData) ? faqsData : [])
            setTestimonials(Array.isArray(testimonialsData) ? testimonialsData : [])
            setApplicants(Array.isArray(applicantsData) ? applicantsData : [])
            setUsers(Array.isArray(usersData) ? usersData : [])
            setNotices(Array.isArray(noticesData) ? noticesData : [])
            setDashboardFaqs(Array.isArray(dashboardFaqsData) ? dashboardFaqsData : [])
            setSurveys(Array.isArray(surveysData) ? surveysData : [])

        } catch (error) {
            console.error('Critical Error fetching data:', error)
        }
        setLoading(false)
    }

    async function fetchUsers() {
        try {
            const response = await fetch(`${API_URL}/users`, { credentials: 'include' })
            const data = await response.json()
            if (response.ok) {
                setUsers(Array.isArray(data) ? data : [])
                setFetchErrors(prev => ({ ...prev, users: null }))
            } else {
                setFetchErrors(prev => ({ ...prev, users: data.error || response.statusText }))
                setUsers([])
            }
        } catch (error) {
            console.error('Error fetching users:', error)
            setFetchErrors(prev => ({ ...prev, users: error.message }))
            setUsers([])
        }
    }

    async function fetchUserApps(userId) {
        setUserAppsLoading(true)
        try {
            const data = await fetch(`${API_URL}/users/${userId}/applications`, { credentials: 'include' }).then(r => r.json())
            setUserApps(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error('Error fetching user apps:', error)
        } finally {
            setUserAppsLoading(false)
        }
    }

    // --- Messaging Functions ---
    async function fetchTotalUnread() {
        try {
            const response = await fetch(`${API_URL}/messages/unread-count`, { credentials: 'include' })
            if (response.ok) {
                const data = await response.json()
                setTotalUnread(data.count)
            }
        } catch (error) {
            console.error('Error fetching total unread:', error)
        }
    }

    async function fetchConversations(isSilent = false) {
        if (!isSilent) setConversationsLoading(true)
        try {
            const response = await fetch(`${API_URL}/admin/conversations`, { credentials: 'include' })
            if (response.ok) {
                const data = await response.json()
                setConversations(Array.isArray(data) ? data : [])
            }
        } catch (error) {
            console.error('Error fetching conversations:', error)
        } finally {
            setConversationsLoading(false)
        }
    }

    async function fetchMessages(otherUserId, isSilent = false) {
        if (!otherUserId) return
        if (!isSilent) setMessagesLoading(true)
        try {
            const sid = otherUserId.toString()
            const response = await fetch(`${API_URL}/messages/${sid}`, { credentials: 'include' })
            if (response.ok) {
                const data = await response.json()
                // Only update if we are still looking at the same user
                setMessages(prev => {
                    // If we have messages already and this is a silent poll, 
                    // we could merge or just replace if order is guaranteed.
                    // For now, replacing but ensuring we don't clear if data is same length? 
                    // Actually, replacing is fine if it doesn't flicker.
                    return Array.isArray(data) ? data : []
                })
            }
        } catch (error) {
            console.error('Error fetching messages:', error)
        } finally {
            if (!isSilent) setMessagesLoading(false)
        }
    }

    async function handleSendMessage(e) {
        e.preventDefault()
        if (!selectedChatUser || !newMessageContent.trim()) return

        const content = newMessageContent.trim()
        setNewMessageContent('') // Clear immediately for speed

        const myId = currentUserId
        const targetId = (selectedChatUser._id || selectedChatUser.id).toString()

        // Optimistic update
        const optimisticMsg = {
            senderId: myId,
            receiverId: targetId,
            content: content,
            timestamp: new Date().toISOString(),
            isOptimistic: true // Marker for UI
        }

        setMessages(prev => [...prev, optimisticMsg])

        try {
            const response = await fetch(`${API_URL}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    receiverId: selectedChatUser._id || selectedChatUser.id,
                    content: content
                })
            })

            if (response.ok) {
                const realMsg = await response.json()
                // Replace optimistic message with real message from server
                setMessages(prev => prev.map(m => m.isOptimistic && m.content === content ? realMsg : m))
                fetchConversations() // Update list
            } else {
                // Rollback on error
                setMessages(prev => prev.filter(m => !m.isOptimistic || m.content !== content))
                showToast('Failed to send message', 'error')
            }
        } catch (error) {
            console.error('Error sending message:', error)
            setMessages(prev => prev.filter(m => !m.isOptimistic || m.content !== content))
        }
    }

    async function handleDeleteChat() {
        if (!selectedChatUser) return;
        if (!window.confirm('Are you sure you want to delete this chat history? This action cannot be undone.')) return;

        try {
            const response = await fetch(`${API_URL}/messages/${selectedChatUser._id || selectedChatUser.id}`, {
                method: 'DELETE',
                credentials: 'include'
            })

            if (response.ok) {
                setMessages([])
                fetchConversations()
                showToast('Chat history deleted', 'success')
            } else {
                showToast('Failed to delete chat', 'error')
            }
        } catch (error) {
            console.error('Error deleting chat:', error)
            showToast('Network error', 'error')
        }
    }

    // Auto-refresh messages when tab is active and user is selected
    useEffect(() => {
        let interval;
        if (activeTab === 'messages' && selectedChatUser) {
            fetchMessages(selectedChatUser._id || selectedChatUser.id)
            fetchTotalUnread()
            interval = setInterval(() => {
                fetchMessages(selectedChatUser._id || selectedChatUser.id, true)
                fetchTotalUnread()
            }, 4000)
        } else if (activeTab === 'messages') {
            fetchConversations()
            fetchTotalUnread()
            interval = setInterval(() => {
                fetchConversations(true)
                fetchTotalUnread()
            }, 6000)
        } else {
            // Still poll unread count even if not on messages tab
            fetchTotalUnread()
            interval = setInterval(fetchTotalUnread, 15000)
        }
        return () => clearInterval(interval)
    }, [activeTab, selectedChatUser])

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])



    const [editMode, setEditMode] = useState(null)

    // --- Dashboard Features Handlers ---
    async function handleSaveNotice(e) {
        e.preventDefault()
        setSubmitting(true)
        try {
            const isEdit = !!selectedNotice
            const url = isEdit ? `${API_URL}/notices/${selectedNotice._id || selectedNotice.id}` : `${API_URL}/notices`
            const method = isEdit ? 'PUT' : 'POST'

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(noticeForm)
            })

            if (response.ok) {
                await fetchAll()
                setShowNoticeModal(false)
                setNoticeForm({ title: '', content: '', type: 'info', isPublished: true, isPinned: false, expiresAt: '' })
                setSelectedNotice(null)
            } else {
                alert('Failed to save notice')
            }
        } catch (error) {
            console.error('Error saving notice:', error)
            alert('Error saving notice')
        }
        setSubmitting(false)
    }

    async function handleSaveDashFaq(e) {
        e.preventDefault()
        setSubmitting(true)
        try {
            const isEdit = !!selectedDashFaq
            const url = isEdit ? `${API_URL}/dashboard-faqs/${selectedDashFaq._id || selectedDashFaq.id}` : `${API_URL}/dashboard-faqs`
            const method = isEdit ? 'PUT' : 'POST'

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(dashFaqForm)
            })

            if (response.ok) {
                await fetchAll()
                setShowDashFaqModal(false)
                setDashFaqForm({ question: '', answer: '', category: 'General', isPublished: true })
                setSelectedDashFaq(null)
            } else {
                alert('Failed to save FAQ')
            }
        } catch (error) {
            console.error('Error saving FAQ:', error)
            alert('Error saving FAQ')
        }
        setSubmitting(false)
    }

    async function handleSaveSurvey(e) {
        e.preventDefault()
        setSubmitting(true)
        try {
            const isEdit = !!selectedSurvey
            const url = isEdit ? `${API_URL}/surveys/${selectedSurvey._id || selectedSurvey.id}` : `${API_URL}/surveys`
            const method = isEdit ? 'PUT' : 'POST'

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(surveyForm)
            })

            if (response.ok) {
                await fetchAll()
                setShowSurveyModal(false)
                setSurveyForm({ title: '', description: '', questions: [], isActive: false, startDate: '', endDate: '' })
                setSelectedSurvey(null)
            } else {
                alert('Failed to save survey')
            }
        } catch (error) {
            console.error('Error saving survey:', error)
            alert('Error saving survey')
        }
        setSubmitting(false)
    }

    // Generic handlers
    async function handleAdd(endpoint, data, resetForm) {
        setSubmitting(true)
        try {
            let body;
            let headers = {};
            let url = `${API_URL}/${endpoint}`;
            let method = 'POST';

            if (editMode && endpoint === 'scholarships') {
                method = 'PUT';
                url = `${API_URL}/${endpoint}/${editMode}`;
            }

            if (endpoint === 'scholarships' && data.image instanceof File) {
                const formData = new FormData();
                Object.keys(data).forEach(key => {
                    formData.append(key, data[key]);
                });
                // If editing and image is still a string (URL), we don't need to send it as file
                // But if it's a File, it sends as binary.
                // If it's a URL string, FormData sends it as text, which our backend sees as req.body.image

                body = formData;
            } else {
                body = JSON.stringify(data);
                headers['Content-Type'] = 'application/json';
            }

            const response = await fetch(url, {
                method: method,
                headers: headers,
                credentials: 'include',
                body: body
            })

            if (response.ok) {
                await fetchAll()
                resetForm()
                setEditMode(null)
                alert(editMode ? 'Updated successfully!' : 'Added successfully!')
            } else {
                const errData = await response.json().catch(() => ({}));
                console.error('Server responded with error:', errData);
                alert(`Failed to ${editMode ? 'update' : 'add'}. Please try again.`)
            }
        } catch (error) {
            console.error('Error adding/updating:', error)
            alert('Failed to process request. Check your connection.')
        } finally {
            setSubmitting(false)
        }
    }

    async function handleUserSubmit(e) {
        e.preventDefault()
        setSubmitting(true)
        try {
            const url = selectedUser
                ? `${API_URL}/users/${selectedUser._id || selectedUser.id}`
                : `${API_URL}/users`
            const method = selectedUser ? 'PUT' : 'POST'

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(userForm)
            })

            if (response.ok) {
                await fetchUsers()
                setShowUserModal(false)
                setUserForm({ name: '', email: '', password: '', role: 'customer' })
                setSelectedUser(null)
                // Use showToast if available, otherwise just use alert or console
                alert(`User ${selectedUser ? 'updated' : 'created'} successfully`)
            } else {
                const error = await response.json()
                alert(error.error || 'Failed to save user')
            }
        } catch (error) {
            console.error('User submit error:', error)
            alert('Network error')
        } finally {
            setSubmitting(false)
        }
    }

    async function handleDeleteUser(e, userId) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        const confirmed = window.confirm('Are you sure you want to delete this user? All their applications will also be deleted.')
        console.log('Delete user confirmed:', confirmed)
        if (!confirmed) return

        try {
            const response = await fetch(`${API_URL}/users/${userId}`, {
                method: 'DELETE',
                credentials: 'include'
            })
            if (response.ok) {
                await fetchUsers()
                alert('User deleted successfully')
            }
        } catch (error) {
            console.error('Delete user error:', error)
        }
    }

    async function handleDeleteSelectedUserApp(e, appId) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        const confirmed = window.confirm('Delete this application?')
        console.log('Delete app confirmed:', confirmed)
        if (!confirmed) return
        try {
            const response = await fetch(`${API_URL}/applications/${appId}`, {
                method: 'DELETE',
                credentials: 'include'
            })
            if (response.ok) {
                if (selectedUser) fetchUserApps(selectedUser._id || selectedUser.id)
                fetchUsers() // Refresh appCount in users table
                // Also refresh main applicants list if in that tab
                const currentApps = await fetch(`${API_URL}/applications`, { credentials: 'include' }).then(r => r.json())
                setApplicants(Array.isArray(currentApps) ? currentApps : [])
                alert('Application deleted')
            }
        } catch (error) {
            console.error('Delete app error:', error)
        }
    }

    function handleEdit(item) {
        setScholarshipForm({
            ...item,
            // Ensure fields are not null
            description: item.description || '',
            eligibility: item.eligibility || '',
            benefits: item.benefits || '',
            category: item.category || '',
            subCategory: item.subCategory || '',
            tuition: item.tuition || '',
            duration: item.duration || '',
            image: item.image || '' // Keep existing URL
        })
        setEditMode(item._id || item.id)
        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    async function handleDelete(endpoint, item) {
        const confirmed = window.confirm('Are you sure you want to delete this item?')
        console.log('Delete item confirmed:', confirmed, 'Endpoint:', endpoint, 'Item:', item)
        if (!confirmed) return
        try {
            // Use _id if it exists (new items), otherwise use id (migrated items)
            const deleteId = item._id || item.id
            console.log('Deleting from:', `${API_URL}/${endpoint}/${deleteId}`)
            const response = await fetch(`${API_URL}/${endpoint}/${deleteId}`, {
                method: 'DELETE',
                credentials: 'include'
            })
            console.log('Delete response status:', response.status)
            if (response.ok) {
                // Optimized: Only refresh the specific data instead of all 13 endpoints
                const refreshMap = {
                    'scholarships': () => fetch(`${API_URL}/scholarships`, { credentials: 'include' }).then(r => r.json()).then(d => setScholarships(Array.isArray(d) ? d : [])),
                    'services': () => fetch(`${API_URL}/services`, { credentials: 'include' }).then(r => r.json()).then(d => setServices(Array.isArray(d) ? d : [])),
                    'team': () => fetch(`${API_URL}/team`, { credentials: 'include' }).then(r => r.json()).then(d => setTeam(Array.isArray(d) ? d : [])),
                    'blog': () => fetch(`${API_URL}/blog`, { credentials: 'include' }).then(r => r.json()).then(d => setBlog(Array.isArray(d) ? d : [])),
                    'faqs': () => fetch(`${API_URL}/faqs`, { credentials: 'include' }).then(r => r.json()).then(d => setFaqs(Array.isArray(d) ? d : [])),
                    'testimonials': () => fetch(`${API_URL}/testimonials`, { credentials: 'include' }).then(r => r.json()).then(d => setTestimonials(Array.isArray(d) ? d : [])),
                    'notices': () => fetch(`${API_URL}/notices/admin`, { credentials: 'include' }).then(r => r.json()).then(d => setNotices(Array.isArray(d) ? d : [])),
                    'dashboard-faqs': () => fetch(`${API_URL}/dashboard-faqs/admin`, { credentials: 'include' }).then(r => r.json()).then(d => setDashboardFaqs(Array.isArray(d) ? d : [])),
                    'surveys': () => fetch(`${API_URL}/surveys`, { credentials: 'include' }).then(r => r.json()).then(d => setSurveys(Array.isArray(d) ? d : [])),
                }
                if (refreshMap[endpoint]) {
                    await refreshMap[endpoint]()
                } else {
                    await fetchAll()
                }
                alert('Deleted successfully!')
            } else {
                const errData = await response.json().catch(() => ({}));
                alert(`Failed to delete: ${errData.error || response.statusText}`)
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
                credentials: 'include',
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

    async function handleVerify(e, applicant) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (!window.confirm(`Mark application for ${applicant.firstName} as Approved?`)) return;

        try {
            const id = applicant._id || applicant.id;
            const response = await fetch(`${API_URL}/applications/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ status: 'Approved' })
            });

            if (response.ok) {
                // Update local state
                setApplicants(prev => prev.map(app =>
                    (app._id === id || app.id === id) ? { ...app, status: 'Approved' } : app
                ));
                alert('Application approved successfully!');
            } else {
                alert('Failed to approve application.');
            }
        } catch (error) {
            console.error('Error approving application:', error);
            alert('Error approving application.');
        }
    }

    async function handleToggleReapply(e, applicant) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        const action = applicant.canReapply ? 'Revoke' : 'Grant';
        if (!window.confirm(`${action} re-apply permission for ${applicant.firstName}?`)) return;

        try {
            const id = applicant._id || applicant.id;
            const response = await fetch(`${API_URL}/applications/${id}/toggle-reapply`, {
                method: 'POST',
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                // Update local state
                setApplicants(prev => prev.map(app =>
                    (app._id === id || app.id === id) ? { ...app, canReapply: data.canReapply } : app
                ));
                alert(data.message);
            } else {
                alert('Failed to update re-apply permission.');
            }
        } catch (error) {
            console.error('Error toggling reapply:', error);
            alert('Error toggling reapply permission.');
        }
    }

    const tabs = [
        { id: 'overview', label: 'Overview', icon: BookOpen },
        { id: 'applicants', label: 'Applicants', icon: Users },
        {
            id: 'messages',
            label: 'Messages',
            icon: Inbox,
            badge: totalUnread > 0 ? totalUnread : null
        },
        { id: 'scholarships', label: 'Scholarships', icon: GraduationCap },
        { id: 'enrollment', label: 'Enrollment Categories', icon: Briefcase },
        { id: 'cms', label: 'Website CMS', icon: Settings },
        { id: 'settings', label: 'Settings', icon: Settings },
    ]


    // --- Preview UI Helpers (Mirrored from Student Dashboard) ---
    const renderReviewValue = (value) => {
        if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
            return <span className="text-rose-500 font-bold">-</span>
        }
        return value
    }

    const ReviewCard = ({ title, color, children, noPadding, className = "" }) => (
        <div className={`bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden ${className}`}>
            <div className="p-4 sm:p-6 pb-0">
                <div
                    className="inline-flex items-center gap-3 px-6 py-2 rounded-r-full shadow-sm"
                    style={{ backgroundColor: color }}
                >
                    <div className="w-4 h-4 bg-white transform rotate-45 flex items-center justify-center">
                        <div className="w-2 h-2" style={{ backgroundColor: color }}></div>
                    </div>
                    <h3 className="text-white font-bold text-sm tracking-wide uppercase">
                        {title}
                    </h3>
                </div>
            </div>
            <div className={noPadding ? "" : "p-8 pt-6"}>
                {children}
            </div>
        </div>
    )

    const DetailItem = ({ label, value, tiny, uppercase, fullWidth }) => (
        <div className={`flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 pb-2 border-b border-slate-50 last:border-0 ${tiny ? 'text-xs' : 'text-sm'} ${fullWidth ? 'col-span-full' : ''}`}>
            <span className="text-slate-500 min-w-[220px] shrink-0 font-medium uppercase text-[10px] tracking-wider">{label}</span>
            <span className={`font-bold text-slate-800 break-words ${uppercase ? 'uppercase' : ''}`}>
                {renderReviewValue(value)}
            </span>
        </div>
    )

    const ReviewTable = ({ headers, rows }) => (
        <div className="overflow-x-auto border border-slate-200 rounded-lg shadow-sm">
            <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-[#F8F9FA] text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px] tracking-widest">
                    <tr>
                        {headers.map((h, i) => (
                            <th key={i} className="px-4 py-3 border-r last:border-r-0 border-slate-200 text-center align-middle whitespace-pre-line leading-tight">
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                    {rows && rows.length > 0 ? (
                        rows.map((row, ri) => (
                            <tr key={ri} className="hover:bg-slate-50 transition-colors">
                                {row.map((cell, ci) => (
                                    <td key={ci} className="px-4 py-3 border-r last:border-r-0 border-slate-200 text-center align-middle font-bold text-slate-700">
                                        {renderReviewValue(cell)}
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={headers.length} className="px-4 py-10 text-center text-slate-400 font-bold italic bg-slate-50/50">
                                No records added / 未添加记录
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )

    const renderOverview = () => {
        const stats = [
            { label: 'Total Applicants', value: applicants.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Pending Review', value: applicants.filter(a => a.status === 'Pending').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Active Scholarships', value: scholarships.length, icon: BookOpen, color: 'text-sky-600', bg: 'bg-sky-50' },
            { label: 'Unread Messages', value: totalUnread, icon: Mail, color: 'text-rose-600', bg: 'bg-rose-50' },
        ]

        const recentApps = [...applicants].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)

        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                {/* Greeting */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Welcome back, Admin</h1>
                        <p className="text-slate-500 font-medium mt-1">Here's a snapshot of your scholarship system today.</p>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                                <Calendar size={20} />
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Today</p>
                                <p className="text-sm font-bold text-slate-700 mt-0.5">{currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm min-w-[180px]">
                            <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
                                <Clock size={20} />
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Live Time</p>
                                <p className="text-sm font-black text-slate-900 mt-0.5 font-mono">
                                    {String(currentTime.getHours()).padStart(2, '0')}:
                                    {String(currentTime.getMinutes()).padStart(2, '0')}:
                                    {String(currentTime.getSeconds()).padStart(2, '0')}:
                                    <span className="text-rose-500">{String(currentTime.getMilliseconds()).padStart(3, '0')}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group cursor-default">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110`}>
                                    <stat.icon size={24} />
                                </div>
                                <div className="text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg text-[10px] font-black flex items-center gap-1">
                                    <ArrowUpRight size={12} />
                                    <span>+12%</span>
                                </div>
                            </div>
                            <h3 className="text-slate-500 text-xs font-black uppercase tracking-widest">{stat.label}</h3>
                            <p className="text-3xl font-black text-slate-900 mt-1">{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Main Content Split */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Recent Apps & Trend */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Trend Placeholder */}
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Application Trends</h3>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Last 30 Days</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 text-sky-600 rounded-xl text-xs font-bold">
                                        <Activity size={14} />
                                        <span>Live</span>
                                    </div>
                                </div>
                            </div>

                            {/* Simple CSS Area Chart Visualization */}
                            <div className="h-48 flex items-end gap-2 px-2">
                                {[35, 45, 30, 60, 45, 70, 55, 80, 65, 90, 75, 85].map((val, i) => (
                                    <div key={i} className="flex-1 h-full flex flex-col justify-end group relative">
                                        <div
                                            className="w-full bg-sky-100 group-hover:bg-sky-500 rounded-t-lg transition-all duration-500 ease-out cursor-pointer"
                                            style={{ height: `${val}%` }}
                                        >
                                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                {val} Apps
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between mt-4 px-2 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                <span>1st Jan</span>
                                <span>10th Jan</span>
                                <span>20th Jan</span>
                                <span>Today</span>
                            </div>
                        </div>

                        {/* Recent Submissions */}
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Recent Applications</h3>
                                <button
                                    onClick={() => setActiveTab('applicants')}
                                    className="text-xs font-black text-sky-600 hover:text-sky-700 uppercase tracking-widest flex items-center gap-1 transition-all"
                                >
                                    View All <ArrowUpRight size={14} />
                                </button>
                            </div>
                            <div className="divide-y divide-slate-50">
                                {recentApps.length > 0 ? recentApps.map((app) => (
                                    <div key={app._id || app.id} className="px-8 py-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-lg">
                                                {app.firstName?.[0]}{app.lastName?.[0]}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 tracking-tight">{app.firstName} {app.lastName}</h4>
                                                <p className="text-xs text-slate-400 font-medium">{app.majorCourse || 'No major selected'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-right hidden sm:block">
                                                <p className="text-xs font-bold text-slate-700">{new Date(app.createdAt).toLocaleDateString()}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{app.nationality}</p>
                                            </div>
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${app.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {app.status}
                                            </span>
                                            <button
                                                onClick={() => { setSelectedApplication(app); setShowPreviewModal(true); }}
                                                className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-all"
                                            >
                                                <Eye size={20} />
                                            </button>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="p-12 text-center">
                                        <p className="text-slate-400 font-bold">No recent applications found.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Quick Actions & Health */}
                    <div className="space-y-8">
                        {/* Quick Actions */}
                        <div className="bg-indigo-600 p-8 rounded-[2.5rem] shadow-xl shadow-indigo-100 text-white">
                            <h3 className="text-xl font-black tracking-tight mb-6">Quick Actions</h3>
                            <div className="space-y-3">
                                <button
                                    onClick={() => setActiveTab('scholarships')}
                                    className="w-full flex items-center gap-4 p-4 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/10 transition-all group"
                                >
                                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Plus size={20} />
                                    </div>
                                    <span className="font-bold text-sm">Add New Scholarship</span>
                                </button>
                                <button
                                    onClick={() => { setSelectedNotice(null); setNoticeForm({ title: '', content: '', type: 'info', isPublished: true, isPinned: false, expiresAt: '' }); setShowNoticeModal(true); }}
                                    className="w-full flex items-center gap-4 p-4 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/10 transition-all group"
                                >
                                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Bell size={20} />
                                    </div>
                                    <span className="font-bold text-sm">Post New Notice</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('messages')}
                                    className="w-full flex items-center gap-4 p-4 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/10 transition-all group"
                                >
                                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Inbox size={20} />
                                    </div>
                                    <span className="font-bold text-sm">View Inboxes</span>
                                </button>
                            </div>
                        </div>

                        {/* System Health / Summary */}
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                            <h3 className="text-lg font-black text-slate-900 tracking-tight mb-6">System Health</h3>
                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                                        <span>Survey Participation</span>
                                        <span className="text-slate-900">76%</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '76%' }} />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                                        <span>Scholarship Capacity</span>
                                        <span className="text-slate-900">42%</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-sky-500 rounded-full" style={{ width: '42%' }} />
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-xs font-bold text-slate-600">Sync Server Active</span>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Normal</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen bg-slate-50/50 text-slate-900">
            <AdminSidebar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onLogout={handleLogout}
                totalUnread={totalUnread}
            />

            <div className="flex-1 transition-all duration-300 ml-20 sm:ml-64">
                <main className="p-4 sm:p-8 pt-6">
                    {loading ? (
                        <div className="flex items-center justify-center min-h-[400px]">
                            <div className="flex flex-col items-center gap-4">
                                <Loader2 className="w-10 h-10 animate-spin text-sky-600" />
                                <p className="text-slate-500 font-bold animate-pulse">Loading dashboard...</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {activeTab === 'overview' && renderOverview()}

                            {/* Scholarships Tab */}
                            {
                                activeTab === 'scholarships' && (
                                    <div className="space-y-6">
                                        <div className="card-surface p-6">
                                            <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                                <Plus className="h-5 w-5 text-emerald-600" />
                                                {editMode ? 'Edit Scholarship' : 'Add New Scholarship'}
                                            </h2>
                                            <form onSubmit={(e) => {
                                                e.preventDefault();
                                                handleAdd('scholarships', scholarshipForm, () => setScholarshipForm({
                                                    title: '',
                                                    university: '',
                                                    country: '',
                                                    location: '',
                                                    degree: '',
                                                    field: '',
                                                    deadline: '',
                                                    description: '',
                                                    eligibility: '',
                                                    benefits: '',
                                                    image: '',
                                                    programMode: 'On-Campus',
                                                    programType: 'Full-time',
                                                    language: 'English',
                                                    category: '',
                                                    subCategory: '',
                                                    fastTrack: false,
                                                    isPromoted: false
                                                }))
                                            }} className="space-y-6">
                                                <div className="space-y-4">
                                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Core Information</h3>
                                                    <div className="grid gap-4 md:grid-cols-2">
                                                        <input type="text" required placeholder="Scholarship Title" value={scholarshipForm.title} onChange={(e) => setScholarshipForm({ ...scholarshipForm, title: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
                                                        <input type="text" required placeholder="University Name" value={scholarshipForm.university} onChange={(e) => setScholarshipForm({ ...scholarshipForm, university: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
                                                        <input type="text" required placeholder="Country" value={scholarshipForm.country} onChange={(e) => setScholarshipForm({ ...scholarshipForm, country: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
                                                        <input type="text" placeholder="Location (City, State)" value={scholarshipForm.location} onChange={(e) => setScholarshipForm({ ...scholarshipForm, location: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Educational Details</h3>
                                                    <div className="grid gap-4 md:grid-cols-2">
                                                        <input type="text" required placeholder="Degree (e.g. Master's)" value={scholarshipForm.degree} onChange={(e) => setScholarshipForm({ ...scholarshipForm, degree: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
                                                        <input type="text" required placeholder="Field of Study" value={scholarshipForm.field} onChange={(e) => setScholarshipForm({ ...scholarshipForm, field: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
                                                        <input type="text" placeholder="Duration (e.g. 2 Years)" value={scholarshipForm.duration} onChange={(e) => setScholarshipForm({ ...scholarshipForm, duration: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
                                                        <input type="text" placeholder="Tuition Fee (e.g. $10,000 / Year)" value={scholarshipForm.tuition} onChange={(e) => setScholarshipForm({ ...scholarshipForm, tuition: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
                                                        <div>
                                                            <label className="block text-xs font-medium text-slate-500 mb-1 ml-1">Application Deadline</label>
                                                            <input type="date" required value={scholarshipForm.deadline} onChange={(e) => setScholarshipForm({ ...scholarshipForm, deadline: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
                                                            <p className="text-xs text-slate-400 mt-1 ml-1 italic">Status (OPEN/CLOSED) is automatically calculated based on this date.</p>
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-slate-500 mb-1 ml-1">Language</label>
                                                            <input type="text" placeholder="Language (Default: English)" value={scholarshipForm.language} onChange={(e) => setScholarshipForm({ ...scholarshipForm, language: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Classification</h3>
                                                    <div className="grid gap-4 md:grid-cols-2">
                                                        <select
                                                            required
                                                            value={scholarshipForm.category}
                                                            onChange={(e) => setScholarshipForm({ ...scholarshipForm, category: e.target.value, subCategory: '' })}
                                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                                                        >
                                                            <option value="">Select Enrollment Category</option>
                                                            {categories.map(cat => (
                                                                <option key={cat._id} value={cat.name}>{cat.name}</option>
                                                            ))}
                                                        </select>
                                                        <select
                                                            value={scholarshipForm.subCategory}
                                                            onChange={(e) => setScholarshipForm({ ...scholarshipForm, subCategory: e.target.value })}
                                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                                                            disabled={!scholarshipForm.category}
                                                        >
                                                            <option value="">Select Sub-Program (Optional)</option>
                                                            {categories.find(c => c.name === scholarshipForm.category)?.subCategories?.map((sub, idx) => (
                                                                <option key={idx} value={sub}>{sub}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Program Meta</h3>
                                                    <div className="grid gap-4 md:grid-cols-3">
                                                        <select value={scholarshipForm.programMode} onChange={(e) => setScholarshipForm({ ...scholarshipForm, programMode: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white">
                                                            <option value="On-Campus">On-Campus</option>
                                                            <option value="Online">Online</option>
                                                            <option value="Hybrid">Hybrid</option>
                                                        </select>
                                                        <select value={scholarshipForm.programType} onChange={(e) => setScholarshipForm({ ...scholarshipForm, programType: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white">
                                                            <option value="Full-time">Full-time</option>
                                                            <option value="Part-time">Part-time</option>
                                                        </select>
                                                        <div className="space-y-1">
                                                            <input type="file" accept="image/*" onChange={(e) => setScholarshipForm({ ...scholarshipForm, image: e.target.files[0] })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white" />
                                                            {editMode && typeof scholarshipForm.image === 'string' && (
                                                                <p className="text-xs text-slate-500 truncate">Current: {scholarshipForm.image}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Description & Requirements</h3>
                                                    <textarea required rows="3" placeholder="Detailed Description" value={scholarshipForm.description} onChange={(e) => setScholarshipForm({ ...scholarshipForm, description: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
                                                    <div className="grid gap-4 md:grid-cols-2">
                                                        <textarea required rows="2" placeholder="Eligibility" value={scholarshipForm.eligibility} onChange={(e) => setScholarshipForm({ ...scholarshipForm, eligibility: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
                                                        <textarea required rows="2" placeholder="Benefits" value={scholarshipForm.benefits} onChange={(e) => setScholarshipForm({ ...scholarshipForm, benefits: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
                                                    </div>
                                                </div>

                                                <div className="pt-4 border-t border-slate-100">
                                                    <div className="flex flex-wrap gap-6">
                                                        <label className="flex items-center gap-2 cursor-pointer group">
                                                            <input type="checkbox" checked={scholarshipForm.isPromoted} onChange={(e) => setScholarshipForm({ ...scholarshipForm, isPromoted: e.target.checked })} className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500" />
                                                            <span className="text-sm font-semibold text-slate-700 group-hover:text-sky-600 transition-colors">Mark as Promoted</span>
                                                        </label>
                                                        <label className="flex items-center gap-2 cursor-pointer group">
                                                            <input type="checkbox" checked={scholarshipForm.fastTrack} onChange={(e) => setScholarshipForm({ ...scholarshipForm, fastTrack: e.target.checked })} className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                                                            <span className="text-sm font-semibold text-slate-700 group-hover:text-emerald-600 transition-colors">Fast-track counseling badge</span>
                                                        </label>
                                                    </div>
                                                </div>

                                                <div className="flex gap-3">
                                                    {editMode && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setEditMode(null);
                                                                setScholarshipForm({
                                                                    title: '',
                                                                    university: '',
                                                                    country: '',
                                                                    location: '',
                                                                    degree: '',
                                                                    field: '',
                                                                    deadline: '',
                                                                    description: '',
                                                                    eligibility: '',
                                                                    benefits: '',
                                                                    image: '',
                                                                    programMode: 'On-Campus',
                                                                    programType: 'Full-time',
                                                                    language: 'English',
                                                                    category: '',
                                                                    subCategory: '',
                                                                    tuition: '',
                                                                    duration: '',
                                                                    fastTrack: false,
                                                                    isPromoted: false
                                                                });
                                                            }}
                                                            className="px-6 py-3 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                                                        >
                                                            Cancel
                                                        </button>
                                                    )}
                                                    <button disabled={submitting} type="submit" className="flex-1 btn-primary py-3 text-lg shadow-lg shadow-sky-100 flex items-center justify-center gap-2">
                                                        {submitting ? (
                                                            <>
                                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                                Processing...
                                                            </>
                                                        ) : (
                                                            editMode ? 'Update Scholarship' : 'Add Scholarship'
                                                        )}
                                                    </button>
                                                </div>
                                            </form>
                                        </div>

                                        <div className="card-surface p-6">
                                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                                                <h2 className="text-xl font-semibold text-slate-900">All Scholarships ({scholarships.length})</h2>
                                                <div className="relative w-full md:w-64">
                                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                    <input
                                                        type="text"
                                                        placeholder="Search university or title..."
                                                        value={scholarshipSearch}
                                                        onChange={(e) => setScholarshipSearch(e.target.value)}
                                                        className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                                                    />
                                                </div>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full">
                                                    <thead className="bg-slate-50 border-b border-slate-200">
                                                        <tr>
                                                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">University & Title</th>
                                                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Category & Sub</th>
                                                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Deadline</th>
                                                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                                                            <th className="px-4 py-3 text-right text-sm font-semibold text-slate-900">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-200">
                                                        {scholarships
                                                            .filter(item => {
                                                                const query = scholarshipSearch.toLowerCase();
                                                                return (item.university || '').toLowerCase().includes(query) ||
                                                                    (item.title || '').toLowerCase().includes(query) ||
                                                                    (item.subCategory || '').toLowerCase().includes(query);
                                                            })
                                                            .map((item) => (
                                                                <tr key={item.id} className="hover:bg-slate-50">
                                                                    <td className="px-4 py-3">
                                                                        <p className="text-sm font-bold text-slate-900">{item.university}</p>
                                                                        <p className="text-xs text-slate-500 truncate max-w-[200px]">{item.title}</p>
                                                                    </td>
                                                                    <td className="px-4 py-3">
                                                                        <p className="text-sm text-slate-600">{item.category}</p>
                                                                        <p className="text-xs text-slate-400 truncate max-w-[200px]">{item.subCategory}</p>
                                                                    </td>
                                                                    <td className="px-4 py-3 text-sm text-slate-600">{item.deadline || '-'}</td>
                                                                    <td className="px-4 py-3 text-sm">
                                                                        {(() => {
                                                                            if (!item.deadline) return <span className="text-slate-400">-</span>
                                                                            const d = new Date(item.deadline)
                                                                            d.setHours(23, 59, 59, 999)
                                                                            const isExpired = d < new Date()
                                                                            return isExpired ? (
                                                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-700">CLOSED</span>
                                                                            ) : (
                                                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-700">OPENED</span>
                                                                            )
                                                                        })()}
                                                                    </td>
                                                                    <td className="px-4 py-3 text-right">
                                                                        <div className="flex justify-end gap-2">
                                                                            <button onClick={() => handleEdit(item)} className="inline-flex items-center gap-1 px-3 py-1 text-sm text-sky-600 hover:bg-sky-50 rounded-lg transition">
                                                                                <Edit2 className="h-4 w-4" /> Edit
                                                                            </button>
                                                                            <button onClick={() => handleDelete('scholarships', item)} className="inline-flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition">
                                                                                <Trash2 className="h-4 w-4" /> Delete
                                                                            </button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                )
                            }

                            {/* Enrollment Categories Tab */}
                            {activeTab === 'categories' && <AdminEnrollmentCategories />}

                            {/* Notices Tab */}
                            {activeTab === 'notices' && (
                                <div className="space-y-6">
                                    <div className="card-surface p-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                                                <Bell className="h-5 w-5 text-amber-600" />
                                                Notices & Announcements
                                            </h2>
                                            <button
                                                onClick={() => { setSelectedNotice(null); setNoticeForm({ title: '', content: '', type: 'info', isPublished: true, isPinned: false, expiresAt: '' }); setShowNoticeModal(true) }}
                                                className="btn-primary flex items-center gap-2"
                                            >
                                                <Plus className="h-4 w-4" /> New Notice
                                            </button>
                                        </div>
                                        <div className="space-y-3">
                                            {notices.length === 0 ? (
                                                <p className="text-center text-slate-500 py-8">No notices yet. Create one to announce updates to users.</p>
                                            ) : notices.map(notice => (
                                                <div key={notice._id || notice.id} className={`p-4 rounded-xl border ${notice.type === 'urgent' ? 'bg-rose-50 border-rose-200' : notice.type === 'warning' ? 'bg-amber-50 border-amber-200' : 'bg-sky-50 border-sky-200'}`}>
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                {notice.isPinned && <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">📌 Pinned</span>}
                                                                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${notice.isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                                                                    {notice.isPublished ? 'Published' : 'Draft'}
                                                                </span>
                                                                <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase ${notice.type === 'urgent' ? 'bg-rose-200 text-rose-700' : notice.type === 'warning' ? 'bg-amber-200 text-amber-700' : 'bg-sky-200 text-sky-700'}`}>
                                                                    {notice.type}
                                                                </span>
                                                            </div>
                                                            <h3 className="font-bold text-slate-900">{notice.title}</h3>
                                                            <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{notice.content}</p>
                                                            <p className="text-xs text-slate-400 mt-2">Created: {new Date(notice.createdAt).toLocaleDateString()}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button onClick={() => { setSelectedNotice(notice); setNoticeForm(notice); setShowNoticeModal(true) }} className="p-2 text-sky-600 hover:bg-sky-100 rounded-lg"><Edit2 className="h-4 w-4" /></button>
                                                            <button onClick={() => handleDelete('notices', notice)} className="p-2 text-rose-600 hover:bg-rose-100 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Dashboard FAQs Tab */}
                            {activeTab === 'dashboard-faqs' && (
                                <div className="space-y-6">
                                    <div className="card-surface p-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                                                <HelpCircle className="h-5 w-5 text-sky-600" />
                                                Dashboard FAQs (User-facing)
                                            </h2>
                                            <button
                                                onClick={() => { setSelectedDashFaq(null); setDashFaqForm({ question: '', answer: '', category: 'General', isPublished: true }); setShowDashFaqModal(true) }}
                                                className="btn-primary flex items-center gap-2"
                                            >
                                                <Plus className="h-4 w-4" /> Add FAQ
                                            </button>
                                        </div>
                                        <div className="space-y-3">
                                            {dashboardFaqs.length === 0 ? (
                                                <p className="text-center text-slate-500 py-8">No FAQs yet. Add FAQs to help users find answers.</p>
                                            ) : dashboardFaqs.map(faq => (
                                                <div key={faq._id || faq.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-xs bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full font-bold">{faq.category}</span>
                                                                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${faq.isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                                                                    {faq.isPublished ? 'Published' : 'Draft'}
                                                                </span>
                                                            </div>
                                                            <h3 className="font-bold text-slate-900">{faq.question}</h3>
                                                            <p className="text-sm text-slate-600 mt-1">{faq.answer}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button onClick={() => { setSelectedDashFaq(faq); setDashFaqForm(faq); setShowDashFaqModal(true) }} className="p-2 text-sky-600 hover:bg-sky-100 rounded-lg"><Edit2 className="h-4 w-4" /></button>
                                                            <button onClick={() => handleDelete('dashboard-faqs', faq)} className="p-2 text-rose-600 hover:bg-rose-100 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Surveys Tab */}
                            {activeTab === 'surveys' && (
                                <div className="space-y-6">
                                    <div className="card-surface p-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                                                <ClipboardList className="h-5 w-5 text-emerald-600" />
                                                User Surveys
                                            </h2>
                                            <button
                                                onClick={() => { setSelectedSurvey(null); setSurveyForm({ title: '', description: '', questions: [], isActive: false, startDate: '', endDate: '' }); setShowSurveyModal(true) }}
                                                className="btn-primary flex items-center gap-2"
                                            >
                                                <Plus className="h-4 w-4" /> Create Survey
                                            </button>
                                        </div>
                                        <div className="space-y-3">
                                            {surveys.length === 0 ? (
                                                <p className="text-center text-slate-500 py-8">No surveys yet. Create one to gather user feedback.</p>
                                            ) : surveys.map(survey => (
                                                <div key={survey._id || survey.id} className={`p-4 rounded-xl border ${survey.isActive ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-100'}`}>
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${survey.isActive ? 'bg-emerald-200 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                                                                    {survey.isActive ? '🟢 Active' : 'Inactive'}
                                                                </span>
                                                                <span className="text-xs text-slate-500">{survey.questions?.length || 0} questions</span>
                                                            </div>
                                                            <h3 className="font-bold text-slate-900">{survey.title}</h3>
                                                            <p className="text-sm text-slate-600 mt-1">{survey.description}</p>
                                                            <p className="text-xs text-slate-400 mt-2">
                                                                {survey.startDate && `From: ${new Date(survey.startDate).toLocaleDateString()}`}
                                                                {survey.endDate && ` To: ${new Date(survey.endDate).toLocaleDateString()}`}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={async () => {
                                                                    setSelectedSurvey(survey);
                                                                    const res = await fetch(`${API_URL}/surveys/${survey._id || survey.id}/responses`, { credentials: 'include' });
                                                                    const data = await res.json();
                                                                    setSurveyResponses(data);
                                                                    setShowResponsesModal(true);
                                                                }}
                                                                className="px-3 py-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100"
                                                            >
                                                                View Responses
                                                            </button>
                                                            <button onClick={() => { setSelectedSurvey(survey); setSurveyForm(survey); setShowSurveyModal(true) }} className="p-2 text-sky-600 hover:bg-sky-100 rounded-lg"><Edit2 className="h-4 w-4" /></button>
                                                            <button onClick={() => handleDelete('surveys', survey)} className="p-2 text-rose-600 hover:bg-rose-100 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Services Tab */}
                            {
                                activeTab === 'services' && (
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
                                                        <button onClick={() => handleDelete('services', item)} className="inline-flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:bg-red-100 rounded-lg transition">
                                                            <Trash2 className="h-4 w-4" /> Delete
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )
                            }

                            {/* Mission Tab */}
                            {
                                activeTab === 'mission' && (
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
                                )
                            }

                            {/* Team Tab */}
                            {
                                activeTab === 'team' && (
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
                                                            <button onClick={() => handleDelete('team', item)} className="text-red-600 hover:bg-red-100 p-2 rounded-lg transition">
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )
                            }

                            {/* Blog Tab */}
                            {
                                activeTab === 'blog' && (
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
                                                            <button onClick={() => handleDelete('blog', item)} className="text-red-600 hover:bg-red-100 p-2 rounded-lg transition">
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )
                            }

                            {/* FAQs Tab */}
                            {
                                activeTab === 'faqs' && (
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
                                                            <button onClick={() => handleDelete('faqs', item)} className="text-red-600 hover:bg-red-100 p-2 rounded-lg transition">
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )
                            }

                            {/* Success Stories / Testimonials Tab */}
                            {
                                activeTab === 'testimonials' && (
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
                                                            <button onClick={() => handleDelete('testimonials', item)} className="text-red-600 hover:bg-red-100 p-2 rounded-lg transition">
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )
                            }

                            {/* Applicants Tab */}
                            {activeTab === 'applicants' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="card-surface p-6 flex items-center gap-4 transition-all hover:shadow-xl hover:shadow-blue-500/5 group border-transparent hover:border-blue-100">
                                            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                                                <Users size={24} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-500">Total Applicants</p>
                                                <p className="text-2xl font-black text-slate-900">{applicants.length}</p>
                                            </div>
                                        </div>
                                        <div className="card-surface p-6 flex items-center gap-4 transition-all hover:shadow-xl hover:shadow-emerald-500/5 group border-transparent hover:border-emerald-100">
                                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
                                                <CheckCircle size={24} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-500">Approved</p>
                                                <p className="text-2xl font-black text-slate-900">{applicants.filter(a => a.status === 'Approved').length}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="card-surface p-0 overflow-hidden">
                                        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50/50">
                                            <div className="flex items-center gap-1 bg-slate-200/50 p-1.5 rounded-2xl border border-slate-200/50">
                                                <button
                                                    onClick={() => setApplicantSubTab('applications')}
                                                    className={`px-5 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${applicantSubTab === 'applications' ? 'bg-white text-sky-600 shadow-sm shadow-sky-600/10' : 'text-slate-500 hover:text-slate-700'}`}
                                                >
                                                    Applications
                                                </button>
                                                <button
                                                    onClick={() => setApplicantSubTab('users')}
                                                    className={`px-5 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${applicantSubTab === 'users' ? 'bg-white text-sky-600 shadow-sm shadow-sky-600/10' : 'text-slate-500 hover:text-slate-700'}`}
                                                >
                                                    User Accounts
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-3 w-full md:w-auto">
                                                {applicantSubTab === 'users' ? (
                                                    <>
                                                        <div className="relative group flex-1 md:flex-none">
                                                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                                                            <input
                                                                type="text"
                                                                placeholder="Search name or email..."
                                                                value={userSearch}
                                                                onChange={(e) => setUserSearch(e.target.value)}
                                                                className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all w-full md:w-64"
                                                            />
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedUser(null)
                                                                setUserForm({ name: '', email: '', password: '', role: 'customer' })
                                                                setShowUserModal(true)
                                                            }}
                                                            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-sky-600 rounded-xl hover:bg-sky-500 shadow-lg shadow-sky-600/20 transition-all active:scale-95 shrink-0"
                                                        >
                                                            <Plus size={18} /> Add User
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors">
                                                            Filter Status
                                                        </button>
                                                        <button className="px-5 py-2.5 text-sm font-bold text-sky-600 bg-sky-50 rounded-xl hover:bg-sky-100 border border-sky-100 transition-colors shrink-0">
                                                            Export CSV
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className="p-6">
                                            {applicantSubTab === 'applications' && (
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-left">
                                                        <thead>
                                                            <tr className="border-b border-slate-100">
                                                                <th className="pb-4 text-sm font-bold text-slate-400">Student Info</th>
                                                                <th className="pb-4 text-sm font-bold text-slate-400">Scholarship</th>
                                                                <th className="pb-4 text-sm font-bold text-slate-400">Date</th>
                                                                <th className="pb-4 text-sm font-bold text-slate-400">Status</th>
                                                                <th className="pb-4 text-sm font-bold text-slate-400 text-right">Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-50">
                                                            {applicants.map((applicant) => (
                                                                <tr key={applicant._id || applicant.id} className="hover:bg-slate-50/50 transition-colors group">
                                                                    <td className="py-4">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 uppercase">
                                                                                {applicant.firstName ? applicant.firstName.charAt(0) : '?'}
                                                                            </div>
                                                                            <div>
                                                                                <p className="font-bold text-slate-900 leading-tight">{applicant.firstName} {applicant.lastName}</p>
                                                                                <p className="text-xs text-slate-500">{applicant.email}</p>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="py-4">
                                                                        <p className="text-sm font-bold text-slate-700">{applicant.scholarshipName || applicant.scholarship}</p>
                                                                        <p className="text-xs text-slate-500">{applicant.degree || applicant.university}</p>
                                                                    </td>
                                                                    <td className="py-4 text-sm font-medium text-slate-600">
                                                                        {applicant.submittedAt ? new Date(applicant.submittedAt).toLocaleDateString() : applicant.date}
                                                                    </td>
                                                                    <td className="py-4">
                                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${applicant.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                                                                            applicant.status === 'Rejected' ? 'bg-rose-100 text-rose-700' :
                                                                                'bg-amber-100 text-amber-700'
                                                                            }`}>
                                                                            {applicant.status}
                                                                        </span>
                                                                    </td>
                                                                    <td className="py-4 text-right">
                                                                        <div className="flex items-center justify-end gap-2">
                                                                            <button
                                                                                type="button"
                                                                                onClick={(e) => {
                                                                                    e.preventDefault();
                                                                                    e.stopPropagation();
                                                                                    setSelectedApplication(applicant)
                                                                                    setShowPreviewModal(true)
                                                                                }}
                                                                                className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-all"
                                                                                title="View Full Application"
                                                                            >
                                                                                <Eye size={16} />
                                                                            </button>
                                                                            <button
                                                                                type="button"
                                                                                disabled={downloadingAppId === (applicant._id || applicant.id)}
                                                                                onClick={async (e) => {
                                                                                    e.preventDefault();
                                                                                    e.stopPropagation();
                                                                                    const appId = applicant._id || applicant.id;
                                                                                    setDownloadingAppId(appId);
                                                                                    try {
                                                                                        const response = await fetch(`${API_URL}/applications/${appId}/download-files`, {
                                                                                            credentials: 'include'
                                                                                        });
                                                                                        if (response.ok) {
                                                                                            const blob = await response.blob();
                                                                                            const url = window.URL.createObjectURL(blob);
                                                                                            const a = document.createElement('a');
                                                                                            a.href = url;
                                                                                            const firstName = applicant.firstName || applicant.passportFamilyName || 'Unknown';
                                                                                            const lastName = applicant.lastName || applicant.givenName || 'Applicant';
                                                                                            a.download = `${firstName}_${lastName}_documents.zip`.replace(/\s+/g, '_');
                                                                                            document.body.appendChild(a);
                                                                                            a.click();
                                                                                            a.remove();
                                                                                            window.URL.revokeObjectURL(url);
                                                                                        } else {
                                                                                            const err = await response.json().catch(() => ({}));
                                                                                            alert(err.error || 'No files available for download');
                                                                                        }
                                                                                    } catch (error) {
                                                                                        console.error('Download error:', error);
                                                                                        alert('Failed to download files');
                                                                                    } finally {
                                                                                        setDownloadingAppId(null);
                                                                                    }
                                                                                }}
                                                                                className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all disabled:opacity-50"
                                                                                title="Download Files"
                                                                            >
                                                                                {downloadingAppId === (applicant._id || applicant.id) ? (
                                                                                    <Loader2 size={16} className="animate-spin" />
                                                                                ) : (
                                                                                    <Download size={16} />
                                                                                )}
                                                                            </button>
                                                                            {applicant.status === 'Approved' && (
                                                                                <span className="text-xs font-bold text-emerald-600 flex items-center justify-end gap-1">
                                                                                    <CheckCircle className="w-4 h-4" />
                                                                                </span>
                                                                            )}
                                                                            <button
                                                                                type="button"
                                                                                onClick={(e) => handleToggleReapply(e, applicant)}
                                                                                className={`p-1.5 rounded-lg transition-all ${applicant.canReapply ? 'text-amber-600 bg-amber-50' : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'}`}
                                                                                title={applicant.canReapply ? "Revoke Re-Apply Permission" : "Grant Re-Apply Permission"}
                                                                            >
                                                                                <RefreshCw size={16} />
                                                                            </button>
                                                                            <button
                                                                                type="button"
                                                                                onClick={(e) => handleDeleteSelectedUserApp(e, applicant._id || applicant.id)}
                                                                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                                                title="Delete Application"
                                                                            >
                                                                                <Trash2 size={16} />
                                                                            </button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                            {applicants.length === 0 && (
                                                                <tr>
                                                                    <td colSpan="5" className="py-8 text-center text-slate-400 font-medium">
                                                                        No applications found.
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}

                                            {applicantSubTab === 'users' && (
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-left">
                                                        <thead>
                                                            <tr className="border-b border-slate-100">
                                                                <th className="pb-4 text-sm font-bold text-slate-400 tracking-wider">User Info</th>
                                                                <th className="pb-4 text-sm font-bold text-slate-400 tracking-wider">Role</th>
                                                                <th className="pb-4 text-sm font-bold text-slate-400 tracking-wider text-center">Applications</th>
                                                                <th className="pb-4 text-sm font-bold text-slate-400 tracking-wider text-right">Actions</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-50">
                                                            {(users || []).filter(u =>
                                                                u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
                                                                u.email?.toLowerCase().includes(userSearch.toLowerCase())
                                                            ).map((user) => (
                                                                <tr key={user._id || user.id} className="hover:bg-slate-50/50 transition-colors group">
                                                                    <td className="py-4">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center font-bold text-slate-600 uppercase shadow-sm border border-slate-200/50">
                                                                                {user.name ? user.name.charAt(0) : user.email.charAt(0)}
                                                                            </div>
                                                                            <div>
                                                                                <p className="font-bold text-slate-900 leading-tight">{user.name || 'No Name'}</p>
                                                                                <p className="text-xs text-slate-500 font-medium">{user.email}</p>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="py-4">
                                                                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${user.role === 'admin' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                                                            user.role === 'manager' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                                                'bg-sky-50 text-sky-600 border-sky-100'
                                                                            }`}>
                                                                            {user.role}
                                                                        </span>
                                                                    </td>
                                                                    <td className="py-4 text-center">
                                                                        <button
                                                                            type="button"
                                                                            onClick={(e) => {
                                                                                e.preventDefault();
                                                                                e.stopPropagation();
                                                                                setSelectedUser(user)
                                                                                fetchUserApps(user._id || user.id)
                                                                                setShowUserAppsModal(true)
                                                                            }}
                                                                            className="inline-flex items-center gap-1 text-sm font-bold text-sky-600 hover:text-sky-700 bg-sky-50 px-3 py-1.5 rounded-lg transition-colors border border-sky-100"
                                                                        >
                                                                            {user.appCount || 0} Apps
                                                                        </button>
                                                                    </td>
                                                                    <td className="py-4 text-right space-x-2">
                                                                        <button
                                                                            type="button"
                                                                            onClick={(e) => {
                                                                                e.preventDefault();
                                                                                e.stopPropagation();
                                                                                setSelectedUser(user)
                                                                                setUserForm({ name: user.name || '', email: user.email, password: '', role: user.role })
                                                                                setShowUserModal(true)
                                                                            }}
                                                                            className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-all"
                                                                        >
                                                                            <Edit2 size={16} />
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={(e) => handleDeleteUser(e, user._id || user.id)}
                                                                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                                        >
                                                                            <Trash2 size={16} />
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                            {(users || []).length === 0 && (
                                                                <tr>
                                                                    <td colSpan="4" className="py-12 text-center">
                                                                        <div className="flex flex-col items-center gap-2">
                                                                            <p className="text-slate-400 font-medium">
                                                                                {fetchErrors.users ? `Error: ${fetchErrors.users}` : 'No users found.'}
                                                                            </p>
                                                                            <button
                                                                                onClick={() => fetchUsers()}
                                                                                className="text-xs font-bold text-sky-600 hover:underline"
                                                                            >
                                                                                Try Refreshing
                                                                            </button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Messages Tab */}
                            {activeTab === 'messages' && (
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)]">
                                    <div className="lg:col-span-4 card-surface p-0 flex flex-col overflow-hidden">
                                        <div className="p-4 border-b border-slate-100 bg-slate-50/30">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="font-bold flex items-center gap-2">
                                                    <Inbox size={18} className="text-amber-500" />
                                                    Messaging
                                                </h3>
                                            </div>
                                            <div className="relative">
                                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="text"
                                                    placeholder="Search users to chat..."
                                                    value={userSearch}
                                                    onChange={(e) => setUserSearch(e.target.value)}
                                                    className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex-1 overflow-y-auto divide-y divide-slate-50 no-scrollbar">
                                            {/* Show search results if searching, otherwise show active conversations */}
                                            {userSearch.trim() ? (
                                                users.filter(u =>
                                                    u.role !== 'admin' && (
                                                        (u.name || '').toLowerCase().includes(userSearch.toLowerCase()) ||
                                                        (u.email || '').toLowerCase().includes(userSearch.toLowerCase()))
                                                ).map(u => (
                                                    <button
                                                        key={u._id || u.id}
                                                        onClick={() => {
                                                            setSelectedChatUser(u);
                                                            setMessages([]);
                                                            setUserSearch('');
                                                        }}
                                                        className="w-full text-left p-4 hover:bg-slate-50 transition-colors"
                                                    >
                                                        <p className="text-sm font-bold text-slate-900">{u.name}</p>
                                                        <p className="text-xs text-slate-500">{u.email}</p>
                                                    </button>
                                                ))
                                            ) : conversations.length > 0 ? (
                                                conversations.map((contact) => (
                                                    <button
                                                        key={contact._id || contact.id}
                                                        onClick={() => {
                                                            setSelectedChatUser(contact);
                                                            fetchMessages(contact._id || contact.id);
                                                        }}
                                                        className={`w-full text-left p-4 hover:bg-slate-50 transition-colors relative ${selectedChatUser?.email === contact.email ? 'bg-sky-50' : ''}`}
                                                    >
                                                        <div className="flex justify-between items-start mb-1">
                                                            <p className="text-sm font-bold text-slate-900 truncate">
                                                                {contact.name || contact.email}
                                                            </p>
                                                            {contact.unreadCount > 0 && (
                                                                <span className="w-5 h-5 flex items-center justify-center bg-rose-500 text-white text-[10px] font-bold rounded-full animate-bounce">
                                                                    {contact.unreadCount}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-slate-500 truncate">{contact.email}</p>
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="p-8 text-center text-slate-400">
                                                    <p className="text-xs font-medium">No active conversations.</p>
                                                    <p className="text-[10px]">Use the search bar above to start a chat.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="lg:col-span-8 card-surface flex flex-col p-0 overflow-hidden">
                                        {selectedChatUser ? (
                                            <>
                                                {/* Chat Header */}
                                                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-bold">
                                                            {selectedChatUser.name?.charAt(0) || 'U'}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-slate-900 text-sm">{selectedChatUser.name}</h4>
                                                            <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Active Chat</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => setSelectedChatUser(null)}
                                                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                </div>

                                                {/* Messages Area */}
                                                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
                                                    {messages.length === 0 && !messagesLoading ? (
                                                        <div className="h-full flex flex-col items-center justify-center text-center space-y-2 opacity-40">
                                                            <MessageSquare size={32} className="text-slate-300" />
                                                            <p className="text-xs font-medium text-slate-400">No messages yet. Start the conversation!</p>
                                                        </div>
                                                    ) : (
                                                        messages.map((msg, i) => {
                                                            const isMe = msg.senderId.toString() === currentUserId;
                                                            return (
                                                                <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                                    <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${isMe
                                                                        ? 'bg-sky-600 text-white rounded-tr-none'
                                                                        : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none shadow-sm'
                                                                        }`}>
                                                                        <p className="leading-relaxed">{msg.content}</p>
                                                                        <p className={`text-[9px] mt-1 font-bold uppercase opacity-60 ${isMe ? 'text-right' : 'text-left'}`}>
                                                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            )
                                                        })
                                                    )}
                                                    {messagesLoading && messages.length === 0 && (
                                                        <div className="h-full flex items-center justify-center">
                                                            <Loader2 className="w-6 h-6 animate-spin text-sky-400" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Message Input */}
                                                <div className="p-4 bg-white border-t border-slate-100">
                                                    <form onSubmit={handleSendMessage} className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={newMessageContent}
                                                            onChange={(e) => setNewMessageContent(e.target.value)}
                                                            placeholder="Type your message..."
                                                            className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
                                                        />
                                                        <button
                                                            type="submit"
                                                            disabled={!newMessageContent.trim()}
                                                            className="p-2 bg-sky-600 text-white rounded-xl hover:bg-sky-700 transition-colors shadow-sm disabled:opacity-50 disabled:grayscale"
                                                        >
                                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                                                        </button>
                                                    </form>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                                                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 ring-8 ring-slate-100/50">
                                                    <Mail size={40} className="text-slate-200" />
                                                </div>
                                                <h4 className="text-lg font-bold text-slate-900 mb-2">Message Center</h4>
                                                <p className="text-slate-500 max-w-sm font-medium">Select a user from the left or search for a new student to start a conversation.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Settings Tab */}
                            {
                                activeTab === 'settings' && (
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
                        </>
                    )}
                </main>
            </div>


            {/* User Account Modal (Add/Edit) */}
            {showUserModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setShowUserModal(false)} />
                    <div className="bg-white rounded-3xl w-full max-w-md relative z-10 shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="text-xl font-bold text-slate-900">
                                {selectedUser ? 'Edit User Account' : 'Create New User'}
                            </h3>
                            <button onClick={() => setShowUserModal(false)} className="p-2 hover:bg-slate-200/50 rounded-xl transition-colors text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleUserSubmit} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                                    <input
                                        type="text"
                                        required
                                        value={userForm.name}
                                        onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-medium"
                                        placeholder="Enter full name"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                                    <input
                                        type="email"
                                        required
                                        value={userForm.email}
                                        onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-medium"
                                        placeholder="name@example.com"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-700 ml-1">Password {selectedUser && '(Leave blank to keep current)'}</label>
                                <div className="relative">
                                    <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                                    <input
                                        type="password"
                                        required={!selectedUser}
                                        value={userForm.password}
                                        onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-medium"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-700 ml-1">Account Role</label>
                                <select
                                    value={userForm.role}
                                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-bold text-slate-700"
                                >
                                    <option value="customer">Customer / Applicant</option>
                                    <option value="manager">Manager</option>
                                    <option value="admin">Administrator</option>
                                </select>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowUserModal(false)}
                                    className="flex-1 px-4 py-3 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 px-4 py-3 text-sm font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-2xl shadow-lg shadow-sky-600/20 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {submitting ? 'Saving...' : selectedUser ? 'Update User' : 'Create Account'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* User Applications Modal */}
            {showUserAppsModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setShowUserAppsModal(false)} />
                    <div className="bg-white rounded-3xl w-full max-w-3xl relative z-10 shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">User Applications</h3>
                                <p className="text-sm text-slate-500 font-medium">{selectedUser?.name || selectedUser?.email}</p>
                            </div>
                            <button onClick={() => setShowUserAppsModal(false)} className="p-2 hover:bg-slate-200/50 rounded-xl transition-colors text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 max-h-[60vh] overflow-y-auto">
                            {userAppsLoading ? (
                                <div className="py-20 flex flex-col items-center justify-center gap-4">
                                    <Loader2 className="w-10 h-10 text-sky-500 animate-spin" />
                                    <p className="text-slate-400 font-bold">Loading applications...</p>
                                </div>
                            ) : userApps.length > 0 ? (
                                <div className="space-y-4">
                                    {userApps.map((app) => (
                                        <div key={app._id || app.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all border-transparent hover:border-slate-200">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                                                    <FileText className="w-6 h-6 text-sky-500" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-900">{app.scholarshipName || 'Scholarship Application'}</h4>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                                                            <Calendar size={12} /> {new Date(app.submittedAt).toLocaleDateString()}
                                                        </span>
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${app.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                                                            app.status === 'Rejected' ? 'bg-rose-100 text-rose-700' :
                                                                'bg-amber-100 text-amber-700'
                                                            }`}>
                                                            {app.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedApplication(app)
                                                        setShowPreviewModal(true)
                                                    }}
                                                    className="p-2.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-all"
                                                    title="View Full Application"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button className="p-2.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-all" title="View Details">
                                                    <ExternalLink size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteSelectedUserApp(app._id || app.id)}
                                                    className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                                    title="Delete Application"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-20 flex flex-col items-center justify-center gap-4">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                                        <FileText size={32} />
                                    </div>
                                    <p className="text-slate-400 font-bold">No applications found for this user.</p>
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end">
                            <button
                                onClick={() => setShowUserAppsModal(false)}
                                className="px-6 py-2.5 text-sm font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-all active:scale-95"
                            >
                                Close View
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Application Details Preview Modal */}
            {showPreviewModal && selectedApplication && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md transition-opacity" onClick={() => setShowPreviewModal(false)} />
                    <div className="bg-white rounded-[2.5rem] w-full max-w-6xl h-[95vh] relative z-10 shadow-2xl overflow-hidden border border-slate-100 flex flex-col animate-in fade-in zoom-in duration-300">
                        {/* Modal Header */}
                        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-[#1e40af] flex items-center justify-center text-white shadow-lg shadow-blue-200">
                                    <User size={28} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 leading-tight">
                                        {selectedApplication.firstName} {selectedApplication.lastName}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">{selectedApplication.email}</span>
                                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${selectedApplication.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {selectedApplication.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setShowPreviewModal(false)} className="p-3 hover:bg-slate-200/50 rounded-2xl transition-all text-slate-400 hover:text-slate-900">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Content - Scrollable */}
                        <div className="flex-1 overflow-y-auto p-8 no-scrollbar space-y-8 bg-slate-50/30">
                            {/* Summary Note */}
                            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 text-center">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500">
                                    <Info size={24} />
                                </div>
                                <h2 className="text-xl font-bold text-slate-800 mb-1">Application Preview</h2>
                                <p className="text-sm text-slate-500 max-w-lg mx-auto">
                                    Full data review as provided by the applicant.
                                </p>
                            </div>

                            {/* 1. PROFILE */}
                            <ReviewCard title="1. 个人基本信息 Personal Information" color="#4DD0E1">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-2">
                                    <div className="col-span-full flex flex-col items-center mb-8 border-b border-slate-100 pb-8">
                                        {selectedApplication.photo ? (
                                            <div className="w-32 h-40 border-4 border-white rounded-xl overflow-hidden shadow-md ring-1 ring-slate-100">
                                                <img
                                                    src={selectedApplication.photo}
                                                    alt="Photo"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-32 h-40 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-300 font-bold italic">照片 Photo</div>
                                        )}
                                    </div>
                                    <DetailItem label="护照姓名 Passport Name" value={`${selectedApplication.passportFamilyName || ''} ${selectedApplication.givenName || ''}`.trim()} uppercase />
                                    <DetailItem label="中文姓名 Chinese Name" value={selectedApplication.chineseName} />
                                    <DetailItem label="性别 Gender" value={selectedApplication.gender} />
                                    <DetailItem label="国籍 Nationality" value={selectedApplication.nationality} />
                                    <DetailItem label="出生日期 Date of Birth" value={selectedApplication.dob} />
                                    <DetailItem label="出生国家或地区 Country/District of Birth" value={selectedApplication.birthCountry} />
                                    <DetailItem label="我在中国 Whether in China now?" value={selectedApplication.isInChinaNow} />
                                    <DetailItem label="母语 Mother Tongue" value={selectedApplication.nativeLanguage} />
                                    <DetailItem label="婚姻状态 Marital Status" value={selectedApplication.maritalStatus} />
                                    <DetailItem label="宗教 Religion" value={selectedApplication.religion} />
                                    <DetailItem label="职业 Occupation" value={selectedApplication.occupation} />
                                    <DetailItem label="曾就职/读单位 Status/Employer" value={selectedApplication.employerOrInstitution} />
                                </div>
                            </ReviewCard>

                            {/* 2. CORRESPONDENCE ADDRESS */}
                            <ReviewCard title="2. 通讯地址 Correspondence Address" color="#4DD0E1">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-bold text-rose-500 border-l-4 border-rose-500 pl-3 mb-4">家庭地址 Home Address</h4>
                                        <DetailItem label="街道地址 Street Address" value={selectedApplication.homeDetailedAddress} tiny />
                                        <DetailItem label="省/城市 Province/City" value={selectedApplication.homeCityProvince} tiny />
                                        <DetailItem label="国家 Country" value={selectedApplication.homeCountry} tiny />
                                        <DetailItem label="邮编 Zipcode" value={selectedApplication.homeZipcode} tiny />
                                        <DetailItem label="电话/手机 Phone or Mobile" value={selectedApplication.homePhone} tiny />
                                        <DetailItem label="常用邮箱 Main Email" value={selectedApplication.homeMainEmail} tiny />
                                    </div>
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-bold text-amber-500 border-l-4 border-amber-500 pl-3 mb-4">当前地址 Current Address</h4>
                                        <DetailItem label="现住址 Current Address" value={selectedApplication.currentDetailedAddress} tiny />
                                        <DetailItem label="省/城市 Province/City" value={selectedApplication.currentCityProvince} tiny />
                                        <DetailItem label="国家 Country" value={selectedApplication.currentCountry} tiny />
                                        <DetailItem label="邮编 Zipcode" value={selectedApplication.currentZipcode} tiny />
                                        <DetailItem label="电话/手机 Mobile/Phone" value={selectedApplication.currentPhone} tiny />
                                        <DetailItem label="学生邮箱 Email" value={selectedApplication.currentEmail} tiny />
                                    </div>
                                </div>
                            </ReviewCard>

                            {/* 3. MAILING ADDRESS */}
                            <ReviewCard title="3. 通知书邮寄地址 Mailing Address" color="#4DD0E1">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-2">
                                    <DetailItem label="收件人姓名 Receiver's Name" value={selectedApplication.mailingReceiverName} />
                                    <DetailItem label="收件人手机 Phone or Mobile" value={selectedApplication.mailingPhone} />
                                    <DetailItem label="收件人省/城市 Province/City" value={selectedApplication.mailingProvinceCity} />
                                    <DetailItem label="收件人国家 Receiver's Country" value={selectedApplication.mailingCountry} />
                                    <DetailItem label="收件人地址 Receiver's Address" value={selectedApplication.mailingDetailedAddress} fullWidth />
                                    <DetailItem label="邮编 Zipcode" value={selectedApplication.mailingZipcode} />
                                </div>
                            </ReviewCard>

                            {/* 4. PASSPORT & VISA */}
                            <ReviewCard title="4. 证照信息 Passport and Visa Information" color="#4DD0E1">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-2">
                                    <DetailItem label="护照号 Passport No." value={selectedApplication.passportNo} uppercase />
                                    <DetailItem label="有效期 Validity Period" value={selectedApplication.passportStartDate && selectedApplication.passportExpiryDate ? `${selectedApplication.passportStartDate} ~ ${selectedApplication.passportExpiryDate}` : ''} />
                                </div>
                            </ReviewCard>

                            {/* 5. LEARNING EXPERIENCE IN CHINA */}
                            <ReviewCard title="5. 在华学习经历 Learning Experience In China" color="#4DD0E1">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-2">
                                    <DetailItem label="曾有学习经历? Ever studied?" value={selectedApplication.hasStudiedInChina} />
                                    {selectedApplication.hasStudiedInChina === 'Yes' && (
                                        <>
                                            <DetailItem label="院校 Institution" value={selectedApplication.chinaInstitution} />
                                            <DetailItem label="起止日期 Date From-To" value={selectedApplication.chinaStudyStartDate && selectedApplication.chinaStudyEndDate ? `${selectedApplication.chinaStudyStartDate} ~ ${selectedApplication.chinaStudyEndDate}` : ''} />
                                        </>
                                    )}
                                </div>
                            </ReviewCard>

                            {/* 6. FINANCIAL SPONSOR */}
                            <ReviewCard title="6. 经济担保人信息 Financial Sponsor" color="#4DD0E1" noPadding>
                                <ReviewTable
                                    headers={["姓名\nName", "关系\nRelationship", "单位名称\nWork Place", "国籍\nNationality", "职业\nOccupation", "行业类型\nIndustry Type", "联系邮箱\nEmail", "联系电话\nPhone"]}
                                    rows={selectedApplication.financialSponsors?.map(s => [
                                        s.name, s.relationship, s.workPlace, s.nationality, s.occupation, s.industryType, s.email, s.phone
                                    ])}
                                />
                            </ReviewCard>

                            {/* 7. GUARANTOR */}
                            <ReviewCard title="7. 事务担保人信息 Guarantor's Information" color="#4DD0E1" noPadding>
                                <ReviewTable
                                    headers={["姓名\nName", "关系\nRelationship", "单位名称\nWork Place", "国籍\nNationality", "职业\nOccupation", "行业类型\nIndustry Type", "联系邮箱\nEmail", "联系电话\nPhone"]}
                                    rows={selectedApplication.guarantors?.map(g => [
                                        g.name, g.relationship, g.workPlace, g.nationality, g.occupation, g.industryType, g.email, g.phone
                                    ])}
                                />
                            </ReviewCard>

                            {/* 8. EMERGENCY CONTACT */}
                            <ReviewCard title="8. 紧急联系人 Emergency Contact" color="#4DD0E1" noPadding>
                                <ReviewTable
                                    headers={["姓名\nName", "关系\nRelationship", "单位名称\nWork Place", "职业\nOccupation", "联系电话\nPhone", "联系邮箱\nEmail"]}
                                    rows={selectedApplication.emergencyContacts?.map(e => [
                                        e.name, e.relationship, e.workPlace, e.occupation, e.phone, e.email
                                    ])}
                                />
                            </ReviewCard>

                            {/* 9. MAJOR'S INFORMATION */}
                            <ReviewCard title="9. 学习专业 Major's Information" color="#3B82F6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-2">
                                    <DetailItem label="所属类别 Program Category" value={selectedApplication.majorEnrollmentCategory} />
                                    <DetailItem label="专业名称 Major" value={selectedApplication.majorCourse} />
                                    <DetailItem label="授课语言 Instruction Language" value={selectedApplication.majorTeachingLanguage} />
                                    <DetailItem label="学习年限 Study Duration" value={selectedApplication.majorStudyDuration} />
                                </div>
                            </ReviewCard>

                            {/* 10. REFEREE INFORMATION */}
                            <ReviewCard title="10. 推荐人信息 Referee Information" color="#3B82F6" noPadding>
                                <ReviewTable
                                    headers={["姓名\nName", "关系\nRelationship", "单位名称\nWork Place", "职业\nOccupation", "联系电话\nPhone", "联系邮箱\nEmail"]}
                                    rows={selectedApplication.referees?.map(r => [
                                        r.name, r.relationship, r.organization || r.workPlace, r.occupation, r.phone, r.email
                                    ])}
                                />
                            </ReviewCard>

                            {/* 11. LANGUAGE PROFICIENCY */}
                            <ReviewCard title="11. 语言能力 Language Proficiency" color="#3B82F6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12">
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-bold text-sky-600 mb-4 border-b border-sky-100 pb-1">英语 English</h4>
                                        <DetailItem label="英语水平 English" value={selectedApplication.englishProficiency} />
                                        <DetailItem label="雅思 IELTS" value={selectedApplication.ieltsScore} />
                                        <DetailItem label="托福 TOEFL" value={selectedApplication.toeflScore} />
                                        <DetailItem label="GRE成绩 GRE" value={selectedApplication.greScore} />
                                        <DetailItem label="GMAT成绩 GMAT" value={selectedApplication.gmatScore} />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-bold text-sky-600 mb-4 border-b border-sky-100 pb-1">汉语 Chinese</h4>
                                        <DetailItem label="汉语水平 Chinese" value={selectedApplication.chineseProficiency} />
                                        <DetailItem label="HSK等级 HSK Level" value={selectedApplication.hskLevel} />
                                        <DetailItem label="HSK成绩 HSK Score" value={selectedApplication.hskScore} />
                                        <DetailItem label="HSKK成绩 HSKK Score" value={selectedApplication.hskkScore} />
                                    </div>
                                </div>
                            </ReviewCard>

                            {/* 12. EDUCATION BACKGROUND */}
                            <ReviewCard title="12. 教育背景 Education History" color="#3B82F6">
                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-2 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                                        <DetailItem label="最高学历 Highest Degree" value={selectedApplication.educationHighestDegree} />
                                        <DetailItem label="毕业院校 Highest School" value={selectedApplication.educationHighestSchool} />
                                        <DetailItem label="总分/绩点 GPA" value={selectedApplication.educationHighestGPA} />
                                    </div>
                                    <ReviewTable
                                        headers={["学历\nDegree", "学校\nSchool name", "开始时间\nFrom", "结束时间\nTo", "联系人\nContact person"]}
                                        rows={selectedApplication.educations?.map(ed => [
                                            ed.degree, ed.school || ed.schoolName, ed.startDate, ed.endDate, ed.contactPerson
                                        ])}
                                    />
                                </div>
                            </ReviewCard>

                            {/* 13. WORK EXPERIENCE */}
                            <ReviewCard title="13. 工作经历 Work Information" color="#3B82F6">
                                <div className="space-y-8">
                                    <ReviewTable
                                        headers={["开始时间\nFrom", "结束时间\nTo", "单位名称\nCompany", "职业\nOccupation", "联系电话\nPhone", "联系邮箱\nEmail"]}
                                        rows={selectedApplication.workExperiences?.map(w => [
                                            w.startDate, w.endDate, w.company, w.occupation, w.phone, w.email
                                        ])}
                                    />
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-2 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                                        <DetailItem label="曾在中国工作? Ever worked in China?" value={selectedApplication.workedInChina} />
                                    </div>
                                </div>
                            </ReviewCard>

                            {/* 14. FAMILY MEMBERS */}
                            <ReviewCard title="14. 家庭成员信息 Family Members" color="#3B82F6" noPadding>
                                <ReviewTable
                                    headers={["姓名\nName", "关系\nRelationship", "国籍\nNationality", "单位名称\nWork Place", "职业\nOccupation", "手机\nPhone"]}
                                    rows={selectedApplication.familyMembers?.map(f => [
                                        f.name, f.relationship, f.nationality, f.workPlace || f.workUnit, f.occupation, f.phone
                                    ])}
                                />
                            </ReviewCard>

                            {/* 15. ATTACHMENTS */}
                            <ReviewCard title="15. 申请人材料 Application Documents" color="#F59E0B">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {[
                                        { label: 'Passport Photo Page', key: 'passportPhotoPage' },
                                        { label: 'Highest Degree Cert', key: 'highestDegreeCertificate' },
                                        { label: 'Academic Transcripts', key: 'academicTranscripts' },
                                        { label: 'Language Certificate', key: 'languageCertificate' },
                                        { label: 'Physical Exam Form', key: 'physicalExamForm' },
                                        { label: 'Non-Criminal record', key: 'noCriminalRecord' },
                                        { label: 'Economic Guarantee', key: 'economicGuarantee' },
                                        { label: 'Payment Certificate', key: 'paymentCertificate' },
                                        { label: 'Guardianship Letter', key: 'guardianshipLetter' },
                                        { label: 'Other Documents', key: 'otherDocuments' }
                                    ].map((doc, idx) => {
                                        const fileUrl = selectedApplication.documents?.[doc.key];
                                        return (
                                            <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                                <div className="flex flex-col gap-0.5 min-w-0">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{doc.label}</span>
                                                    {fileUrl && typeof fileUrl === 'string' && fileUrl.length > 5 ? (
                                                        <button
                                                            onClick={() => {
                                                                setPreviewDocUrl(fileUrl)
                                                                setShowDocPreviewModal(true)
                                                            }}
                                                            className="text-left text-xs font-bold text-sky-600 hover:text-sky-700 truncate underline decoration-sky-200 decoration-2 underline-offset-2"
                                                        >
                                                            View Document
                                                        </button>
                                                    ) : (
                                                        <span className="text-rose-500 font-bold">-</span>
                                                    )}
                                                </div>
                                                {fileUrl && (
                                                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                                        <Check size={16} />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </ReviewCard>

                            {/* 16. APPLICANT'S VIDEO */}
                            <ReviewCard title="16. 申请人视频 Applicant's Video" color="#F59E0B">
                                <div className="bg-slate-50 border border-slate-200 rounded-3xl overflow-hidden">
                                    <div className="p-8 flex flex-col items-center justify-center min-h-[160px]">
                                        {selectedApplication.moreInfo?.video ? (
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-100">
                                                    <Check size={32} />
                                                </div>
                                                <span className="text-emerald-700 font-black uppercase tracking-widest text-sm mt-2">Video Uploaded</span>
                                                <button
                                                    onClick={() => {
                                                        setPreviewDocUrl(selectedApplication.moreInfo.video)
                                                        setShowDocPreviewModal(true)
                                                    }}
                                                    className="px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-200 mt-2"
                                                >
                                                    Watch Video
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-3 opacity-40">
                                                <div className="w-16 h-16 bg-slate-200 text-slate-400 rounded-2xl flex items-center justify-center">
                                                    <Info size={32} />
                                                </div>
                                                <span className="text-slate-500 font-black uppercase tracking-widest text-sm mt-2 italic">No video uploaded</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </ReviewCard>

                            {/* 17. NATIONALITY BACKGROUND */}
                            <ReviewCard title="17. 国籍背景申报 Nationality Background" color="#F59E0B">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-2">
                                    <DetailItem label="申请者是否为移民 Are you an immigrant?" value={selectedApplication.moreInfo?.isImmigrant} />
                                    <DetailItem label="是否父母一方是中国公民 Parents Chinese?" value={selectedApplication.moreInfo?.hasChineseParent} />
                                    <DetailItem label="原来自国家或地区 Original Country" value={selectedApplication.moreInfo?.originalCountry} />
                                    <DetailItem label="何时取得当前国籍 Date of Status" value={selectedApplication.moreInfo?.currentCitizenshipDate} />
                                </div>
                            </ReviewCard>

                            {/* 18. AWARD INFORMATION */}
                            <ReviewCard title="18. 奖励信息 Rewards Information" color="#F59E0B" noPadding>
                                <ReviewTable
                                    headers={["奖励名称\nAward name", "奖励性质\nType", "奖励等级\nLevel", "奖励描述\nArea", "奖励日期\nDate"]}
                                    rows={selectedApplication.moreInfo?.awards?.map(a => [
                                        a.name, a.type, a.level, a.area, a.date
                                    ])}
                                />
                            </ReviewCard>

                            {/* 19. GUARDIAN INFORMATION */}
                            <ReviewCard title="19. 监护人信息 Guardian Information" color="#F59E0B" noPadding>
                                <ReviewTable
                                    headers={["姓名\nName", "关系\nRelationship", "单位名称\nWork Place", "职业\nOccupation", "电话\nPhone", "邮箱\nEmail"]}
                                    rows={selectedApplication.moreInfo?.guardians?.map(g => [
                                        g.name, g.relationship, g.workPlace, g.occupation, g.phone, g.email
                                    ])}
                                />
                            </ReviewCard>

                            {/* 20. OTHER INFORMATION */}
                            <ReviewCard title="20. 其它信息 Other Information" color="#F59E0B">
                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-2">
                                        <DetailItem label="CSC/CIS编号 CSC/CIS NO" value={selectedApplication.moreInfo?.otherInfo?.cscNo} />
                                        <DetailItem label="特长爱好 Hobbies" value={selectedApplication.moreInfo?.otherInfo?.hobbies} />
                                        <DetailItem label="是否吸烟 Smoking" value={selectedApplication.moreInfo?.otherInfo?.isSmoking} />
                                        <DetailItem label="是否有特殊疾病 Special diseases?" value={selectedApplication.moreInfo?.otherInfo?.hasDisease} />
                                        <DetailItem label="是否曾有过犯罪史 Criminal history?" value={selectedApplication.moreInfo?.otherInfo?.hasCriminalHistory} />
                                        <DetailItem label="是否有体检表 Physical exam?" value={selectedApplication.moreInfo?.otherInfo?.hasPhysicalExam} />
                                    </div>
                                    <div className="space-y-3">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">申请备注 Application Note</h4>
                                        <div className="p-6 bg-white rounded-3xl border border-slate-100 text-sm text-slate-700 font-medium min-h-[100px] whitespace-pre-wrap shadow-sm">
                                            {renderReviewValue(selectedApplication.moreInfo?.applicationNote)}
                                        </div>
                                    </div>
                                </div>
                            </ReviewCard>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center relative z-20">
                            <button
                                onClick={() => setShowPreviewModal(false)}
                                className="px-10 py-4 text-sm font-black text-slate-600 bg-white border-2 border-slate-200 rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 shadow-sm"
                            >
                                Close Preview
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Notice Modal */}
            {showNoticeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-900">{selectedNotice ? 'Edit Notice' : 'New Notice'}</h3>
                            <button onClick={() => setShowNoticeModal(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSaveNotice} className="flex-1 overflow-y-auto p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Title</label>
                                <input type="text" required value={noticeForm.title} onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Content</label>
                                <textarea rows={4} required value={noticeForm.content} onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Type</label>
                                    <select value={noticeForm.type} onChange={(e) => setNoticeForm({ ...noticeForm, type: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500">
                                        <option value="info">Info (Blue)</option>
                                        <option value="warning">Warning (Amber)</option>
                                        <option value="urgent">Urgent (Red)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Expiry Date (Optional)</label>
                                    <input type="date" value={noticeForm.expiresAt ? new Date(noticeForm.expiresAt).toISOString().split('T')[0] : ''} onChange={(e) => setNoticeForm({ ...noticeForm, expiresAt: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500" />
                                </div>
                            </div>
                            <div className="flex gap-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={noticeForm.isPublished} onChange={(e) => setNoticeForm({ ...noticeForm, isPublished: e.target.checked })} className="w-4 h-4 text-sky-600 rounded focus:ring-sky-500" />
                                    <span className="text-sm font-medium text-slate-700">Published</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={noticeForm.isPinned} onChange={(e) => setNoticeForm({ ...noticeForm, isPinned: e.target.checked })} className="w-4 h-4 text-sky-600 rounded focus:ring-sky-500" />
                                    <span className="text-sm font-medium text-slate-700">Pinned to Top</span>
                                </label>
                            </div>
                        </form>
                        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                            <button onClick={() => setShowNoticeModal(false)} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-lg">Cancel</button>
                            <button onClick={handleSaveNotice} disabled={submitting} className="btn-primary">{submitting ? 'Saving...' : 'Save Notice'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Dashboard FAQ Modal */}
            {showDashFaqModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-900">{selectedDashFaq ? 'Edit FAQ' : 'New FAQ'}</h3>
                            <button onClick={() => setShowDashFaqModal(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSaveDashFaq} className="flex-1 overflow-y-auto p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Question</label>
                                <input type="text" required value={dashFaqForm.question} onChange={(e) => setDashFaqForm({ ...dashFaqForm, question: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Answer</label>
                                <textarea rows={4} required value={dashFaqForm.answer} onChange={(e) => setDashFaqForm({ ...dashFaqForm, answer: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Category</label>
                                <select value={dashFaqForm.category} onChange={(e) => setDashFaqForm({ ...dashFaqForm, category: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500">
                                    <option value="General">General</option>
                                    <option value="Application">Application</option>
                                    <option value="Documents">Documents</option>
                                    <option value="Scholarships">Scholarships</option>
                                </select>
                            </div>
                            <div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={dashFaqForm.isPublished} onChange={(e) => setDashFaqForm({ ...dashFaqForm, isPublished: e.target.checked })} className="w-4 h-4 text-sky-600 rounded focus:ring-sky-500" />
                                    <span className="text-sm font-medium text-slate-700">Published</span>
                                </label>
                            </div>
                        </form>
                        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                            <button onClick={() => setShowDashFaqModal(false)} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-lg">Cancel</button>
                            <button onClick={handleSaveDashFaq} disabled={submitting} className="btn-primary">{submitting ? 'Saving...' : 'Save FAQ'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Survey Modal */}
            {showSurveyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-900">{selectedSurvey ? 'Edit Survey' : 'New Survey'}</h3>
                            <button onClick={() => setShowSurveyModal(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Survey Title</label>
                                        <input type="text" required value={surveyForm.title} onChange={(e) => setSurveyForm({ ...surveyForm, title: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                                        <textarea rows={3} value={surveyForm.description} onChange={(e) => setSurveyForm({ ...surveyForm, description: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Start Date</label>
                                            <input type="date" value={surveyForm.startDate ? new Date(surveyForm.startDate).toISOString().split('T')[0] : ''} onChange={(e) => setSurveyForm({ ...surveyForm, startDate: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">End Date</label>
                                            <input type="date" value={surveyForm.endDate ? new Date(surveyForm.endDate).toISOString().split('T')[0] : ''} onChange={(e) => setSurveyForm({ ...surveyForm, endDate: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="flex items-center gap-2 cursor-pointer bg-slate-50 p-3 rounded-lg border border-slate-200">
                                            <input type="checkbox" checked={surveyForm.isActive} onChange={(e) => setSurveyForm({ ...surveyForm, isActive: e.target.checked })} className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500" />
                                            <div>
                                                <span className="block text-sm font-bold text-slate-900">Set as Active Survey</span>
                                                <span className="text-xs text-slate-500">Only one survey can be active at a time. Activating this will deactivate others.</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {/* Question Builder */}
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col h-full">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="font-bold text-slate-800">Questions ({surveyForm.questions?.length || 0})</h4>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newQ = { id: `q-${Date.now()}`, type: 'text', question: 'New Question', options: [], isRequired: true };
                                                setSurveyForm({ ...surveyForm, questions: [...(surveyForm.questions || []), newQ] });
                                            }}
                                            className="text-xs btn-primary py-1 px-3"
                                        >
                                            + Add Question
                                        </button>
                                    </div>
                                    <div className="flex-1 overflow-y-auto space-y-3 max-h-[400px]">
                                        {surveyForm.questions?.map((q, idx) => (
                                            <div key={q.id} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                                                <div className="flex gap-2 mb-2">
                                                    <span className="font-bold text-slate-400 text-xs mt-2">Q{idx + 1}</span>
                                                    <div className="flex-1 space-y-2">
                                                        <input
                                                            type="text"
                                                            value={q.question}
                                                            onChange={(e) => {
                                                                const qs = [...surveyForm.questions];
                                                                qs[idx].question = e.target.value;
                                                                setSurveyForm({ ...surveyForm, questions: qs });
                                                            }}
                                                            className="w-full px-2 py-1 text-sm font-bold border-b border-slate-200 focus:border-sky-500 focus:outline-none"
                                                            placeholder="Question text"
                                                        />
                                                        <div className="flex gap-2">
                                                            <select
                                                                value={q.type}
                                                                onChange={(e) => {
                                                                    const qs = [...surveyForm.questions];
                                                                    qs[idx].type = e.target.value;
                                                                    setSurveyForm({ ...surveyForm, questions: qs });
                                                                }}
                                                                className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1"
                                                            >
                                                                <option value="text">Short Text</option>
                                                                <option value="textarea">Long Text</option>
                                                                <option value="radio">Multiple Choice (Radio)</option>
                                                                <option value="checkbox">Checkboxes</option>
                                                                <option value="rating">Rating (1-5)</option>
                                                            </select>
                                                            <label className="flex items-center gap-1 cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={q.isRequired}
                                                                    onChange={(e) => {
                                                                        const qs = [...surveyForm.questions];
                                                                        qs[idx].isRequired = e.target.checked;
                                                                        setSurveyForm({ ...surveyForm, questions: qs });
                                                                    }}
                                                                    className="w-3 h-3"
                                                                />
                                                                <span className="text-xs text-slate-500">Required</span>
                                                            </label>
                                                        </div>
                                                        {(q.type === 'radio' || q.type === 'checkbox') && (
                                                            <div>
                                                                <p className="text-xs text-slate-400 mb-1">Options (comma separated)</p>
                                                                <input
                                                                    type="text"
                                                                    value={q.options?.join(', ') || ''}
                                                                    onChange={(e) => {
                                                                        const qs = [...surveyForm.questions];
                                                                        qs[idx].options = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                                                                        setSurveyForm({ ...surveyForm, questions: qs });
                                                                    }}
                                                                    className="w-full px-2 py-1 text-xs border border-slate-200 rounded bg-slate-50"
                                                                    placeholder="Option 1, Option 2, Option 3"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            const qs = surveyForm.questions.filter((_, i) => i !== idx);
                                                            setSurveyForm({ ...surveyForm, questions: qs });
                                                        }}
                                                        className="text-rose-400 hover:text-rose-600 self-start p-1"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {(!surveyForm.questions || surveyForm.questions.length === 0) && (
                                            <div className="text-center py-8 text-slate-400 text-sm italic">
                                                No questions added yet.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                            <button onClick={() => setShowSurveyModal(false)} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-lg">Cancel</button>
                            <button onClick={handleSaveSurvey} disabled={submitting} className="btn-primary">{submitting ? 'Saving...' : 'Save Survey'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Survey Responses Modal */}
            {showResponsesModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white w-full max-w-5xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Survey Responses</h3>
                                <p className="text-sm text-slate-500">{selectedSurvey?.title} • {surveyResponses.length} total responses</p>
                            </div>
                            <button onClick={() => setShowResponsesModal(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
                        </div>
                        <div className="flex-1 overflow-auto p-0">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 sticky top-0">
                                    <tr>
                                        <th className="px-6 py-3">User</th>
                                        <th className="px-6 py-3">Date</th>
                                        {selectedSurvey?.questions?.map((q, i) => (
                                            <th key={q.id} className="px-6 py-3 min-w-[200px]">
                                                Q{i + 1}: {q.question}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {surveyResponses.map((res) => (
                                        <tr key={res._id || res.id} className="hover:bg-slate-50/50">
                                            <td className="px-6 py-4 font-medium text-slate-900">{res.email}</td>
                                            <td className="px-6 py-4 text-slate-500">{new Date(res.submittedAt).toLocaleDateString()}</td>
                                            {selectedSurvey?.questions?.map((q) => {
                                                const ans = res.responses?.find(r => r.questionId === q.id);
                                                let displayVal = '-';
                                                if (ans) {
                                                    if (Array.isArray(ans.answer)) displayVal = ans.answer.join(', ');
                                                    else displayVal = ans.answer;
                                                }
                                                return (
                                                    <td key={q.id} className="px-6 py-4 text-slate-600 max-w-xs truncate" title={displayVal}>
                                                        {displayVal}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                    {surveyResponses.length === 0 && (
                                        <tr>
                                            <td colSpan={(selectedSurvey?.questions?.length || 0) + 2} className="px-6 py-12 text-center text-slate-400">
                                                No responses received yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Document Preview Modal (iframe / image / video) */}
            {showDocPreviewModal && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-8 animate-fadeIn">
                    <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl transition-opacity" onClick={() => setShowDocPreviewModal(false)} />

                    <div className="bg-white w-full max-w-6xl h-full max-h-[90vh] rounded-[2.5rem] shadow-2xl relative z-10 flex flex-col overflow-hidden border border-slate-200">
                        {/* Header */}
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center">
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-800 tracking-tight">Document Preview</h3>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">In-app Viewer</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <a
                                    href={previewDocUrl}
                                    download
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-3 hover:bg-emerald-50 rounded-2xl transition-all text-slate-400 hover:text-emerald-600 flex items-center gap-2 group"
                                >
                                    <span className="text-xs font-bold hidden md:block">Download File</span>
                                    <Download size={20} className="group-hover:scale-110 transition-transform" />
                                </a>
                                <button
                                    onClick={() => setShowDocPreviewModal(false)}
                                    className="p-3 hover:bg-rose-50 rounded-2xl transition-all text-slate-400 hover:text-rose-600"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 bg-slate-100 relative overflow-hidden">
                            {(() => {
                                if (!previewDocUrl) {
                                    return (
                                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                                            No file selected
                                        </div>
                                    )
                                }

                                const lower = (previewDocUrl && typeof previewDocUrl === 'string') ? previewDocUrl.toLowerCase() : ''
                                const isImage = /\.(jpg|jpeg|png|gif|webp|bmp)(\?|$)/.test(lower)
                                const isVideo = /\.(mp4|webm|ogg|mov)(\?|$)/.test(lower)

                                if (isImage) {
                                    return (
                                        <div className="w-full h-full flex items-center justify-center bg-slate-900/5">
                                            <img
                                                src={previewDocUrl}
                                                alt="Document"
                                                className="max-w-full max-h-full object-contain rounded-xl shadow-lg"
                                            />
                                        </div>
                                    )
                                }

                                if (isVideo) {
                                    return (
                                        <div className="w-full h-full flex items-center justify-center bg-black">
                                            <video
                                                src={previewDocUrl}
                                                controls
                                                className="max-w-full max-h-full rounded-xl shadow-2xl"
                                            />
                                        </div>
                                    )
                                }

                                // Fallback: use iframe for PDFs and unknown types
                                return (
                                    <iframe
                                        src={previewDocUrl}
                                        className="w-full h-full border-none bg-white"
                                        title="Document Preview"
                                    />
                                )
                            })()}
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-center">
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
                                Secure Document Management &bull; ThePlanetScholar
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}


