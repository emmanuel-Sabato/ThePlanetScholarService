import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'

const DEFAULT_PASSWORD = 'admin123'

export default function AdminLoginPage() {
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate()

    function handleSubmit(e) {
        e.preventDefault()

        // Get stored password or use default
        const storedPassword = localStorage.getItem('adminPassword') || DEFAULT_PASSWORD

        if (password === storedPassword) {
            // Set password in localStorage if using default for first time
            if (!localStorage.getItem('adminPassword')) {
                localStorage.setItem('adminPassword', DEFAULT_PASSWORD)
            }
            localStorage.setItem('adminAuth', 'authenticated')
            navigate('/admin/dashboard')
        } else {
            setError('Incorrect password')
            setPassword('')
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50 flex items-center justify-center px-4">
            <div className="card-surface p-8 max-w-md w-full">
                <div className="text-center mb-6">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-sky-600 to-emerald-500 flex items-center justify-center mx-auto mb-4">
                        <Lock className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Admin Access</h1>
                    <p className="text-sm text-slate-600 mt-2">Enter password to continue</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="password"
                            required
                            placeholder="Admin Password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value)
                                setError('')
                            }}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                            autoFocus
                        />
                        {error && (
                            <p className="text-sm text-red-600 mt-2">{error}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="btn-primary w-full"
                    >
                        Access Dashboard
                    </button>

                    <p className="text-xs text-slate-500 text-center mt-4">
                        Authorized personnel only
                    </p>
                </form>
            </div>
        </div>
    )
}
