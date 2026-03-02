import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Mail, Lock, ArrowRight, Shield, HelpCircle, AlertCircle, XCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function LoginPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { login, logout, user, loading: authLoading, forgotPassword } = useAuth()
    const { showToast } = useToast()
    const scholarshipId = searchParams.get('scholarshipId')

    const [showForgotModal, setShowForgotModal] = useState(false)
    const [forgotEmail, setForgotEmail] = useState('')
    const [forgotLoading, setForgotLoading] = useState(false)

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Redirect if already logged in
    useEffect(() => {
        if (!authLoading && user) {
            if (user.role === 'manager') {
                navigate('/manager')
            } else if (user.role === 'customer') {
                navigate(scholarshipId ? `/dashboard?scholarshipId=${scholarshipId}` : '/dashboard')
            }
        }
    }, [user, authLoading, navigate, scholarshipId])

    const validateForm = () => {
        if (!formData.email.includes('@')) {
            setError('Please enter a valid email address')
            return false
        }
        if (formData.password.length < 1) {
            setError('Please enter your password')
            return false
        }
        setError('')
        return true
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validateForm()) return

        setLoading(true)
        setError('')
        try {
            const userData = await login(formData.email, formData.password)

            if (userData.role === 'admin') {
                // Instantly logout if an admin tried to log in through user portal
                await logout();
                setError('Administrators must use the dedicated Admin Portal to sign in.');
                showToast('Use Admin Portal', 'warning');
                return;
            }

            showToast('Welcome back!', 'success')
            // Redirect based on role
            if (userData.role === 'manager') {
                navigate('/manager')
            } else {
                navigate(scholarshipId ? `/dashboard?scholarshipId=${scholarshipId}` : '/dashboard')
            }
        } catch (error) {
            setError(error.message || 'Invalid email or password. Please try again.')
            showToast(error.message || 'Login failed', 'error')
        } finally {
            setLoading(false)
        }
    }


    return (
        <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
            <div className="w-full max-w-md space-y-8 animate-fadeIn">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-sky-500/10 to-emerald-500/10 border border-sky-100 shadow-sm mb-6">
                        <Lock className="w-8 h-8 text-sky-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h1>
                    <p className="text-slate-600">
                        Sign in to manage your scholarship applications
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="card-surface p-8 space-y-6">
                    {/* Error Box */}
                    {error && (
                        <div className="p-4 bg-red-50 border-2 border-red-300 rounded-xl flex items-start gap-3 animate-fadeIn">
                            <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-bold text-red-700 text-sm">Login Failed</p>
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-5">
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

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="block text-sm font-semibold text-slate-700">Password</label>
                                <button
                                    type="button"
                                    onClick={() => setShowForgotModal(true)}
                                    className="text-xs font-semibold text-sky-600 hover:text-sky-700"
                                >
                                    Forgot password?
                                </button>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all bg-slate-50 focus:bg-white"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <input
                            id="remember-me"
                            name="remember-me"
                            type="checkbox"
                            className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-slate-300 rounded"
                        />
                        <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600 font-medium">
                            Remember me
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full btn-primary flex justify-center items-center gap-2 py-3 shadow-sky-100 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                        {!loading && <ArrowRight className="w-4 h-4" />}
                    </button>

                    {/* <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl flex gap-3 text-left animate-fadeIn">
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-slate-600 leading-relaxed">
                            To apply for a scholarship, you must first <Link to="/scholarships" className="font-semibold text-rose-600 hover:text-rose-700 hover:underline">choose one here</Link> and click "Apply Now"!
                        </p>
                    </div> */}

                    <div className="text-center pt-2">
                        <p className="text-sm text-slate-600">
                            If you don't have account <Link to={scholarshipId ? `/register?scholarshipId=${scholarshipId}` : '/register'} className="font-bold text-sky-600 hover:text-sky-700 hover:underline">SignUp Here</Link>
                        </p>
                    </div>
                </form>

                <div className="flex items-center justify-center gap-6 pt-4 border-t border-slate-100">
                    <Link to="/about" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">Security Information</Link>
                    <Link to="/contact" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">Contact Support</Link>
                </div>
            </div>

            {/* Forgot Password Modal */}
            {showForgotModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-scaleIn">
                        <div className="p-8 space-y-6">
                            <div className="text-center space-y-2">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-sky-50 mb-2">
                                    <HelpCircle className="w-6 h-6 text-sky-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">Forgot Password?</h3>
                                <p className="text-sm text-slate-500">Enter your email and we'll send you a 6-digit code to reset your password.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                                    <input
                                        type="email"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all font-medium text-slate-900"
                                        placeholder="your@email.com"
                                        value={forgotEmail}
                                        onChange={(e) => setForgotEmail(e.target.value)}
                                    />
                                </div>

                                <div className="flex flex-col gap-3 pt-2">
                                    <button
                                        type="button"
                                        disabled={forgotLoading || !forgotEmail}
                                        onClick={async () => {
                                            if (!forgotEmail.includes('@')) {
                                                showToast('Please enter a valid email', 'error')
                                                return
                                            }
                                            setForgotLoading(true)
                                            try {
                                                await forgotPassword(forgotEmail)
                                                showToast('Reset code sent to your email!', 'success')
                                                setShowForgotModal(false)
                                                // We will redirect to reset-password page after a short delay
                                                navigate(`/reset-password?email=${encodeURIComponent(forgotEmail)}`)
                                            } catch (err) {
                                                showToast(err.message, 'error')
                                            } finally {
                                                setForgotLoading(false)
                                            }
                                        }}
                                        className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-lg shadow-sky-600/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        {forgotLoading ? 'Processing...' : 'Send Reset Code'}
                                        {!forgotLoading && <ArrowRight size={18} />}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowForgotModal(false)}
                                        className="w-full py-3 text-slate-500 font-bold hover:text-slate-700 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
