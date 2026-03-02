import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { KeyRound, ShieldCheck, ArrowRight, Lock, Mail, CheckCircle2, ChevronLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function ResetPasswordPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { resetPassword } = useAuth()
    const { showToast } = useToast()

    const emailFromQuery = searchParams.get('email') || ''

    const [formData, setFormData] = useState({
        email: emailFromQuery,
        code: '',
        newPassword: '',
        confirmPassword: ''
    })

    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.email || !formData.code || !formData.newPassword) {
            showToast('All fields are required', 'error')
            return
        }

        if (formData.newPassword !== formData.confirmPassword) {
            showToast('Passwords do not match', 'error')
            return
        }

        if (formData.newPassword.length < 6) {
            showToast('Password must be at least 6 characters', 'error')
            return
        }

        setLoading(true)
        try {
            await resetPassword(formData.email, formData.code, formData.newPassword)
            setSuccess(true)
            showToast('Password reset successfully!', 'success')
            setTimeout(() => navigate('/login'), 3000)
        } catch (err) {
            showToast(err.message, 'error')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
                <div className="w-full max-w-md text-center p-8 card-surface space-y-6 animate-fadeIn">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-50 mb-4">
                        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold text-slate-900">Password Reset!</h1>
                        <p className="text-slate-500">Your password has been updated. Redirecting you to login...</p>
                    </div>
                    <Link to="/login" className="btn-primary w-full flex items-center justify-center gap-2">
                        Go to Login <ArrowRight size={18} />
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 bg-slate-50/50">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center space-y-2">
                    <Link to="/login" className="inline-flex items-center gap-2 text-slate-400 hover:text-sky-600 font-bold text-xs uppercase tracking-widest transition-all mb-4 group">
                        <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Login
                    </Link>
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-sky-500/10 to-indigo-500/10 border border-sky-100 shadow-sm mb-6">
                        <KeyRound className="w-8 h-8 text-sky-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900">Set New Password</h1>
                    <p className="text-slate-600">Enter the 6-digit code sent to your email</p>
                </div>

                <form onSubmit={handleSubmit} className="card-surface p-8 space-y-6 shadow-xl shadow-sky-900/5">
                    <div className="space-y-5">
                        {/* Email */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all bg-slate-50 focus:bg-white"
                                    placeholder="your@email.com"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Reset Code */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700">6-Digit Reset Code</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <ShieldCheck className="h-5 w-5 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    maxLength={6}
                                    required
                                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all bg-slate-50 focus:bg-white font-mono tracking-widest text-lg"
                                    placeholder="123456"
                                    value={formData.code}
                                    onChange={e => setFormData({ ...formData, code: e.target.value.replace(/\D/g, '') })}
                                />
                            </div>
                        </div>

                        {/* New Password */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700">New Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all bg-slate-50 focus:bg-white"
                                    placeholder="••••••••"
                                    value={formData.newPassword}
                                    onChange={e => setFormData({ ...formData, newPassword: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700">Confirm New Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all bg-slate-50 focus:bg-white"
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-2xl shadow-lg shadow-sky-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:grayscale`}
                    >
                        {loading ? 'Updating Password...' : 'Reset Password'}
                        {!loading && <ArrowRight size={18} />}
                    </button>
                </form>
            </div>
        </div>
    )
}
