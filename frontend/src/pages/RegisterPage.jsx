import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { User, Mail, Lock, CheckCircle2, Shield, ArrowRight, Globe, FileText, Send, Clock, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

// Simple country list for dropdown (could be expanded)
const COUNTRIES = [
    "Afghanistan", "Albania", "Algeria", "Argentina", "Australia", "Austria", "Bangladesh", "Belgium", "Brazil",
    "Canada", "China", "Colombia", "Denmark", "Egypt", "Ethiopia", "Finland", "France", "Germany", "Ghana",
    "India", "Indonesia", "Iran", "Iraq", "Ireland", "Italy", "Japan", "Kenya", "Malaysia", "Mexico",
    "Morocco", "Netherlands", "New Zealand", "Nigeria", "Norway", "Pakistan", "Philippines", "Poland",
    "Portugal", "Russia", "Rwanda", "Saudi Arabia", "Singapore", "South Africa", "South Korea", "Spain",
    "Sweden", "Switzerland", "Tanzania", "Thailand", "Turkey", "Uganda", "Ukraine", "United Arab Emirates",
    "United Kingdom", "United States", "Vietnam", "Zimbabwe", "Other"
];

export default function RegisterPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { register, sendVerificationCode, verifyCode, user, loading: authLoading } = useAuth()
    const { showToast } = useToast()
    const scholarshipId = searchParams.get('scholarshipId')

    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [emailVerified, setEmailVerified] = useState(false)

    // Verification State
    const [verificationCode, setVerificationCode] = useState('')
    const [isCodeSent, setIsCodeSent] = useState(false)
    const [timer, setTimer] = useState(0)

    const [formData, setFormData] = useState({
        surname: '',
        givenName: '',
        middleName: '',
        hasPassport: 'yes', // 'yes' or 'no'
        passportNumber: '',
        nationality: '',
        email: '',
        password: '',
        confirmPassword: ''
    })

    // Timer countdown effect
    useEffect(() => {
        let interval = null;
        if (timer > 0) {
            interval = setInterval(() => setTimer(t => t - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    // Handle Auth Redirects (only if strictly already logged in and not registering new)
    useEffect(() => {
        if (!authLoading && user) {
            // navigate(scholarshipId ? `/dashboard?scholarshipId=${scholarshipId}` : '/dashboard') 
            // Commented out to allow testing/registration flow even if technically session exists (though usually we'd redirect)
            // But per requirements if user clicks "SignUp" from login page they want to register.
            // If strictly auth'd, maybe redirect. 
            if (!window.location.href.includes('register')) {
                navigate('/dashboard')
            }
        }
    }, [authLoading, user, navigate])

    const handleSendCode = async () => {
        if (!formData.email || !formData.email.includes('@')) {
            showToast('Please enter a valid email address first', 'error')
            return
        }
        setLoading(true)
        try {
            await sendVerificationCode(formData.email)
            setIsCodeSent(true)
            setTimer(30) // 30 seconds timer
            showToast('Verification code sent to your email', 'success')
        } catch (error) {
            showToast(error.message, 'error')
        } finally {
            setLoading(false)
        }
    }

    const [verificationError, setVerificationError] = useState(null) // NEW

    const handleVerifyCode = async () => {
        setVerificationError(null)
        if (!verificationCode) {
            setVerificationError('Please enter the code')
            showToast('Please enter the code', 'error')
            return
        }
        setLoading(true)
        console.log('Verifying code for:', formData.email, 'Code:', verificationCode)
        try {
            const res = await verifyCode(formData.email, verificationCode)
            console.log('Verification response:', res)
            setEmailVerified(true)
            showToast('Email verified successfully!', 'success')
            setStep(3) // Move to Password Step
        } catch (error) {
            console.error('Verification failed:', error)
            setVerificationError(error.message || 'Verification failed')
            showToast(error.message, 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async () => {
        if (formData.password !== formData.confirmPassword) {
            showToast('Passwords do not match', 'error')
            return
        }
        if (formData.password.length < 8) {
            showToast('Password must be at least 8 characters', 'error')
            return
        }

        setLoading(true)
        try {
            await register(formData)
            setStep(4) // Success Step
            showToast('Account created successfully!', 'success')
        } catch (error) {
            showToast(error.message, 'error')
        } finally {
            setLoading(false)
        }
    }

    // Step Validation
    const validateStep1 = () => {
        if (!formData.surname || !formData.givenName || !formData.nationality) {
            showToast('Please fill in all required fields', 'error')
            return false
        }
        if (formData.hasPassport === 'yes' && !formData.passportNumber) {
            showToast('Please enter your passport number', 'error')
            return false
        }
        // Pre-fill email for step 2 if empty? Or Step 2 asks for it. 
        // User asked for email in step 1 list initially, but verification in step 2. 
        // I'll keep email input in Step 2 to match "Email verification: -> Email input (fetch first...)" logic
        return true
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 font-sans">
            <div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row">

                {/* Visual Side / Progress (Hidden on mobile for simplicity or shown as header) */}
                <div className="bg-slate-900 text-white p-8 md:w-1/3 flex flex-col justify-between relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 to-emerald-400 flex items-center justify-center mb-6 shadow-lg">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Create Account</h2>
                        <p className="text-slate-400 text-sm">Join The Planet Scholar Service today.</p>
                    </div>

                    {/* Steps Indicator */}
                    <div className="relative z-10 space-y-6 mt-8 hidden md:block">
                        {[1, 2, 3, 4].map(s => (
                            <div key={s} className={`flex items-center gap-3 transition-all ${step >= s ? 'opacity-100' : 'opacity-40'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 
                                    ${step >= s ? 'bg-sky-500 border-sky-500' : 'border-slate-600 bg-transparent'}`}>
                                    {s < step ? <CheckCircle2 className="w-4 h-4" /> : s}
                                </div>
                                <span className="font-medium text-sm">
                                    {s === 1 && 'Personal Info'}
                                    {s === 2 && 'Verification'}
                                    {s === 3 && 'Password'}
                                    {s === 4 && 'Success'}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Decorative Blob */}
                    <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-sky-500 rounded-full blur-3xl opacity-20"></div>
                </div>

                {/* Form Side */}
                <div className="p-8 md:w-2/3 bg-white">
                    {/* Step 1: Personal Information */}
                    {step === 1 && (
                        <div className="space-y-6 animate-fadeIn">
                            <h3 className="text-2xl font-bold text-slate-800 border-b pb-4">Personal Information</h3>

                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700">Surname on Passport <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                value={formData.surname}
                                                onChange={e => setFormData({ ...formData, surname: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition"
                                                placeholder="e.g. DOE"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700">Given Name <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                value={formData.givenName}
                                                onChange={e => setFormData({ ...formData, givenName: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition"
                                                placeholder="e.g. John"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Middle Name (Optional)</label>
                                        <input
                                            type="text"
                                            value={formData.middleName}
                                            onChange={e => setFormData({ ...formData, middleName: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition"
                                        />
                                    </div>

                                    <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <label className="text-sm font-semibold text-slate-700 block">Do you have a passport?</label>
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="hasPassport"
                                                    value="yes"
                                                    checked={formData.hasPassport === 'yes'}
                                                    onChange={e => setFormData({ ...formData, hasPassport: e.target.value })}
                                                    className="w-4 h-4 text-sky-600 focus:ring-sky-500"
                                                />
                                                <span className="text-sm text-slate-700">I have passport</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="hasPassport"
                                                    value="no"
                                                    checked={formData.hasPassport === 'no'}
                                                    onChange={e => setFormData({ ...formData, hasPassport: e.target.value })}
                                                    className="w-4 h-4 text-sky-600 focus:ring-sky-500"
                                                />
                                                <span className="text-sm text-slate-700">I don't have passport</span>
                                            </label>
                                        </div>

                                        {formData.hasPassport === 'yes' && (
                                            <div className="pt-2 animate-fadeIn">
                                                <label className="text-sm font-semibold text-slate-700">Passport Number <span className="text-red-500">*</span></label>
                                                <div className="relative mt-1">
                                                    <FileText className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                                    <input
                                                        type="text"
                                                        value={formData.passportNumber}
                                                        onChange={e => setFormData({ ...formData, passportNumber: e.target.value })}
                                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                                                        placeholder="Enter passport number"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Nationality <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <Globe className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                            <select
                                                value={formData.nationality}
                                                onChange={e => setFormData({ ...formData, nationality: e.target.value })}
                                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none appearance-none bg-white"
                                            >
                                                <option value="">Select Nationality</option>
                                                {COUNTRIES.map(c => (
                                                    <option key={c} value={c}>{c}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Email Address <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                                                placeholder="your@email.com"
                                            />
                                        </div>
                                        <p className="text-xs text-slate-500">We'll verify this email in the next step.</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        if (validateStep1()) setStep(2)
                                    }}
                                    className="w-full btn-primary py-3 flex items-center justify-center gap-2 mt-4"
                                >
                                    Next Step <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Email Verification */}
                    {step === 2 && (
                        <div className="space-y-6 animate-fadeIn">
                            <h3 className="text-2xl font-bold text-slate-800 border-b pb-4">Email Verification</h3>

                            <p className="text-slate-600">
                                We need to verify your email address: <span className="font-bold text-sky-600">{formData.email}</span>
                            </p>

                            <div className="space-y-6">
                                {!isCodeSent ? (
                                    <div className="bg-sky-50 p-6 rounded-xl border border-sky-100 text-center space-y-4">
                                        <Mail className="w-12 h-12 text-sky-500 mx-auto" />
                                        <p className="text-sm text-slate-600">Click below to receive a verification code in your email.</p>
                                        <button
                                            onClick={handleSendCode}
                                            disabled={loading}
                                            className="btn-primary py-2 px-6 w-full sm:w-auto"
                                        >
                                            {loading ? 'Sending...' : 'Send Verification Code'}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className={`p-4 rounded-xl border ${timer > 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-slate-700">Enter Verification Code</span>
                                                {timer > 0 && (
                                                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                                                        <Clock className="w-3 h-3" /> Paste in {timer}s
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={verificationCode}
                                                    onChange={e => setVerificationCode(e.target.value)}
                                                    className="flex-1 px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 text-center letter-spacing-2 font-mono text-lg"
                                                    placeholder="123456"
                                                    maxLength={6}
                                                />
                                                <button
                                                    onClick={handleVerifyCode}
                                                    disabled={loading}
                                                    className="btn-primary px-6"
                                                >
                                                    {loading ? 'Verifying...' : 'Verify'}
                                                </button>
                                            </div>
                                            {verificationError && (
                                                <p className="text-sm text-red-600 font-medium mt-2 flex items-center gap-1">
                                                    <AlertCircle className="w-4 h-4" /> {verificationError}
                                                </p>
                                            )}
                                            <p className="text-xs text-slate-500 mt-2">
                                                Didn't receive code? <button onClick={handleSendCode} disabled={timer > 0} className={`${timer > 0 ? 'text-slate-400' : 'text-sky-600 hover:underline'}`}>Resend</button>
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={() => setStep(1)}
                                    className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-2"
                                >
                                    Back to Personal Info
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Password */}
                    {step === 3 && (
                        <div className="space-y-6 animate-fadeIn">
                            <h3 className="text-2xl font-bold text-slate-800 border-b pb-4">Create Password</h3>

                            <div className="space-y-4">
                                <div className="p-4 bg-sky-50 rounded-xl border border-sky-100 flex gap-3">
                                    <Lock className="w-5 h-5 text-sky-600 flex-shrink-0" />
                                    <p className="text-sm text-sky-800">Please create a strong password with at least 8 characters, numbers, and symbols.</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Password</label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Confirm Password</label>
                                    <input
                                        type="password"
                                        value={formData.confirmPassword}
                                        onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button onClick={() => setStep(2)} className="flex-1 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition font-medium text-slate-600">Back</button>
                                <button
                                    onClick={handleRegister}
                                    disabled={loading}
                                    className="flex-[2] btn-primary py-3 flex items-center justify-center gap-2"
                                >
                                    {loading ? 'Creating Account...' : 'Complete Registration'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Success */}
                    {step === 4 && (
                        <div className="text-center py-12 animate-fadeIn space-y-6">
                            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                                <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-800">Registration Succeeded!</h2>
                            <p className="text-slate-600 max-w-md mx-auto">
                                Your account has been created successfully. You can now login to manage your scholarship applications.
                            </p>

                            <div className="pt-6">
                                <Link
                                    to={`/login${scholarshipId ? '?scholarshipId=' + scholarshipId : ''}`}
                                    className="btn-primary py-3 px-12 text-lg shadow-xl shadow-sky-200"
                                >
                                    Login Now
                                </Link>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.4s ease-out forwards;
                }
            `}</style>
        </div>
    )
}
