import { useState } from 'react'
import { CheckCircle, Upload, ChevronRight, ChevronLeft, X, AlertTriangle } from 'lucide-react'
import { useToast } from '../context/ToastContext'

const steps = [
    { id: 1, title: "Instructions" },
    { id: 2, title: "Personal Details" },
    { id: 3, title: "Academic Info" },
    { id: 4, title: "Review" }
]

export default function ApplicationWizard({ scholarshipName, isOpen, onClose, applicationId }) {
    const { addToast } = useToast()
    const [currentStep, setCurrentStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', phone: '',
        university: '', degree: '', gpa: '',
        personalStatement: '',
        files: []
    })

    if (!isOpen) return null

    const handleNext = () => {
        if (currentStep < steps.length) {
            setCurrentStep(prev => prev + 1)
        } else {
            // Submit
            handleSubmit()
        }
    }

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1)
        }
    }

    const handleSubmit = async () => {
        setIsSubmitting(true)
        try {
            const url = applicationId
                ? `http://localhost:3000/api/applications/${applicationId}`
                : 'http://localhost:3000/api/applications';

            const method = applicationId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    ...formData,
                    scholarshipName,
                    status: 'Approved', // Directly approve application on submit
                    submittedAt: new Date()
                })
            })

            if (response.ok) {
                addToast('success', `Application for ${scholarshipName} submitted successfully!`)
                onClose()
                setCurrentStep(1)
                setFormData({
                    firstName: '', lastName: '', email: '', phone: '',
                    university: '', degree: '', gpa: '',
                    personalStatement: '',
                    files: []
                })
                // Trigger refresh if needed, for now user might need to reload or state update
                window.location.reload(); // Simple refresh to show new status
            } else {
                const data = await response.json();
                if (response.status === 400 && data.error.includes('already have')) {
                    addToast('warning', data.error);
                } else {
                    addToast('error', data.error || 'Failed to submit application. Please try again.')
                }
            }
        } catch (error) {
            console.error('Submission error:', error)
            addToast('error', 'Network error. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Apply for Scholarship</h2>
                        <p className="text-sm text-slate-500">{scholarshipName}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between mb-2">
                        {steps.map((step) => (
                            <div key={step.id} className={`flex flex-col items-center flex-1 relative ${step.id === currentStep ? 'text-sky-600 font-semibold' : 'text-slate-400'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 text-xs font-bold transition-all ${step.id < currentStep ? 'bg-emerald-500 text-white' :
                                    step.id === currentStep ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-500'
                                    }`}>
                                    {step.id < currentStep ? <CheckCircle className="w-5 h-5" /> : step.id}
                                </div>
                                <span className="text-xs hidden sm:block">{step.title}</span>
                                {step.id !== steps.length && (
                                    <div className={`absolute top-4 left-[50%] w-full h-[2px] -z-10 ${step.id < currentStep ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-2">
                    {currentStep === 1 && (
                        <div className="space-y-6 animate-fadeIn py-8 flex flex-col justify-center h-full">
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 flex flex-col items-center text-center max-w-lg mx-auto shadow-sm">
                                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-6 ring-4 ring-amber-50">
                                    <AlertTriangle className="w-8 h-8 text-amber-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">Important Application Notice</h3>
                                <p className="text-amber-800 font-semibold text-lg mb-2">
                                    "You must have to add true Infomation about you!"
                                </p>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    Please ensure all details provided are accurate and truthful. Submitting false information will result in immediate disqualification of your application.
                                </p>
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="space-y-4 animate-fadeIn">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">First Name</label>
                                    <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="John" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Last Name</label>
                                    <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="Doe" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700">Email Address</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="john@example.com" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700">Phone Number</label>
                                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="+1 (555) 000-0000" />
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="space-y-4 animate-fadeIn">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700">Current University/School</label>
                                <input type="text" name="university" value={formData.university} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="School or University Name" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Degree Level</label>
                                    <select name="degree" value={formData.degree} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500">
                                        <option value="">Select...</option>
                                        <option value="high_school">High School</option>
                                        <option value="bachelors">Bachelor's</option>
                                        <option value="masters">Master's</option>
                                        <option value="phd">PhD</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">GPA / Grade</label>
                                    <input type="text" name="gpa" value={formData.gpa} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="e.g. 3.8 or A" />
                                </div>
                            </div>
                        </div>
                    )}



                    {currentStep === 4 && (
                        <div className="space-y-4 animate-fadeIn">
                            <div className="bg-slate-50 p-4 rounded-xl space-y-3">
                                <h3 className="font-semibold text-slate-900 border-b border-slate-200 pb-2">Application Summary</h3>
                                <div className="grid grid-cols-2 gap-y-2 text-sm">
                                    <span className="text-slate-500">Name:</span>
                                    <span className="font-medium text-slate-900 text-right">{formData.firstName} {formData.lastName}</span>
                                    <span className="text-slate-500">Email:</span>
                                    <span className="font-medium text-slate-900 text-right truncate">{formData.email}</span>
                                    <span className="text-slate-500">University or School :</span>
                                    <span className="font-medium text-slate-900 text-right truncate">{formData.university}</span>
                                </div>
                            </div>
                            <div className="p-3 bg-sky-50 text-sky-700 text-sm rounded-lg flex items-start gap-2">
                                <CheckCircle className="w-5 h-5 shrink-0" />
                                <p>I confirm that all information provided is accurate and I agree to the terms and conditions.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-white">
                    <button
                        onClick={handleBack}
                        disabled={currentStep === 1}
                        className={`flex items-center gap-1 text-sm font-semibold px-4 py-2 rounded-lg transition ${currentStep === 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100'
                            }`}
                    >
                        <ChevronLeft className="w-4 h-4" /> Back
                    </button>

                    <button
                        onClick={currentStep === 4 ? handleSubmit : handleNext}
                        disabled={isSubmitting}
                        className={`flex items-center gap-1 px-6 py-2.5 rounded-full text-sm font-bold text-white shadow-lg transition transform active:scale-95 ${currentStep === 4 ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200' : 'bg-sky-600 hover:bg-sky-700 shadow-sky-200'
                            } ${isSubmitting ? 'opacity-75 cursor-wait' : ''}`}
                    >
                        {isSubmitting ? 'Submitting...' : (currentStep === 4 ? 'Submit Application' : 'Next Step')}
                        {currentStep !== 4 && <ChevronRight className="w-4 h-4" />}
                    </button>
                </div>
            </div>
        </div>
    )
}
