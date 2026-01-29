import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, X, Save, ChevronRight, ChevronDown, GraduationCap, DollarSign, Gift, Languages, BookOpen, Layers } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL ||
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3000/api'
        : '/api');

// Predefined configuration for the enrollment flow
const ENROLLMENT_CONFIG = {
    levelsOfStudy: [
        {
            id: 'chinese_language',
            name: 'Chinese Language',
            hasFundingOptions: true,
            subPrograms: {
                'Self-Funded': ['One Year Program', 'One Semester Program'],
                'Scholarship': ['One Year Program', 'One Semester Program']
            }
        },
        { id: 'advanced_diploma', name: 'Advanced Diploma', hasFundingOptions: true },
        { id: 'bachelor', name: 'Bachelor Degree', hasFundingOptions: true },
        { id: 'masters', name: "Master's Degree", hasFundingOptions: true },
        { id: 'phd', name: 'PhD', hasFundingOptions: true }
    ],
    fundingTypes: [
        { id: 'scholarship', name: 'Scholarship' },
        { id: 'self_funded', name: 'Self-Funded' }
    ],
    scholarshipBenefits: [
        { id: 'full', name: 'Free tuition + Free hostel + Monthly stipend' },
        { id: 'tuition_hostel', name: 'Free tuition + Free hostel' },
        { id: 'tuition_only', name: 'Free tuition only' },
        { id: 'half_tuition', name: 'Half tuition' }
    ],
    languages: [
        { id: 'chinese', name: 'Chinese-taught' },
        { id: 'english', name: 'English-taught' }
    ],
    programsByLevel: {
        advanced_diploma: [
            'Big Data Technology',
            'Computer Science',
            'Software Engineering',
            'Nursing',
            'Tourism Management',
            'International Economics & Trade',
            'Animal Husbandry',
            'Crop Production',
            'Agricultural Mechanization'
        ],
        bachelor: [
            'Computer Science',
            'Software Engineering',
            'Artificial Intelligence',
            'Engineering (Civil, Mechanical, Electrical, Chemical)',
            'Medicine / Nursing / Pharmacy',
            'Business Administration',
            'Architecture & Urban Planning',
            'Logistics & Supply Chain',
            'Environmental & Agricultural Sciences',
            'Mathematics, Physics, English, Geology, Ecology'
        ],
        masters: [
            'Computer Science & AI',
            'Engineering Programs',
            'Medicine & Pharmacy',
            'Business Administration',
            'Biotechnology',
            'Environmental & Material Sciences',
            'Architecture & Urban/Rural Development'
        ],
        phd: [
            'Software Engineering',
            'Artificial Intelligence',
            'Engineering Fields',
            'Medicine & Pharmacy',
            'Agricultural Sciences',
            'Environmental, Geological & Material Sciences'
        ]
    }
};

export default function AdminEnrollmentCategories() {
    const [expandedSection, setExpandedSection] = useState('levels')
    const [config, setConfig] = useState(ENROLLMENT_CONFIG)
    const [programs, setPrograms] = useState(ENROLLMENT_CONFIG.programsByLevel)
    const [isEditingPrograms, setIsEditingPrograms] = useState(false)
    const [editingLevel, setEditingLevel] = useState(null)
    const [newProgram, setNewProgram] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchConfig()
    }, [])

    const fetchConfig = async () => {
        try {
            const response = await fetch(`${API_URL}/enrollment-config`, { credentials: 'include' })
            if (response.ok) {
                const data = await response.json()
                setConfig(data)
                setPrograms(data.programsByLevel)
            }
        } catch (error) {
            console.error('Failed to fetch enrollment config', error)
        } finally {
            setLoading(false)
        }
    }

    const toggleSection = (section) => {
        setExpandedSection(expandedSection === section ? null : section)
    }

    const handleAddProgram = (levelId) => {
        if (!newProgram.trim()) return
        setPrograms(prev => ({
            ...prev,
            [levelId]: [...(prev[levelId] || []), newProgram.trim()]
        }))
        setNewProgram('')
    }

    const handleRemoveProgram = (levelId, index) => {
        setPrograms(prev => ({
            ...prev,
            [levelId]: prev[levelId].filter((_, i) => i !== index)
        }))
    }

    const handleSavePrograms = async () => {
        try {
            const updatedConfig = { ...config, programsByLevel: programs }
            const response = await fetch(`${API_URL}/enrollment-config`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(updatedConfig)
            })
            if (response.ok) {
                setConfig(updatedConfig)
                setIsEditingPrograms(false)
                setEditingLevel(null)
            }
        } catch (error) {
            console.error('Failed to save programs', error)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="card-surface p-6">
                <div className="flex justify-between items-center mb-2">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Enrollment Categories</h2>
                        <p className="text-sm text-slate-500">Manage the enrollment flow structure and available programs</p>
                    </div>
                </div>

                {/* Flow Diagram */}
                <div className="mt-6 p-4 bg-gradient-to-r from-sky-50 to-indigo-50 rounded-xl border border-sky-100">
                    <p className="text-xs font-bold text-sky-700 uppercase tracking-wider mb-3">Application Flow</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600">
                        <span className="px-3 py-1.5 bg-white rounded-lg shadow-sm border">Step 1: Level</span>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                        <span className="px-3 py-1.5 bg-white rounded-lg shadow-sm border">Step 2: Funding</span>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                        <span className="px-3 py-1.5 bg-white rounded-lg shadow-sm border text-amber-600">(Step 3: Benefits)</span>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                        <span className="px-3 py-1.5 bg-white rounded-lg shadow-sm border">Step 4: Language</span>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                        <span className="px-3 py-1.5 bg-white rounded-lg shadow-sm border">Step 5: Programs</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2 italic">* Step 3 only appears if "Scholarship" is selected in Step 2</p>
                </div>
            </div>

            {/* Section 1: Levels of Study */}
            <div className="card-surface overflow-hidden">
                <button
                    onClick={() => toggleSection('levels')}
                    className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition"
                >
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${expandedSection === 'levels' ? 'bg-sky-100 text-sky-600' : 'bg-slate-100 text-slate-500'}`}>
                            <GraduationCap className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <h3 className="font-bold text-slate-800">Step 1: Levels of Study</h3>
                            <p className="text-xs text-slate-500">{config.levelsOfStudy.length} levels configured</p>
                        </div>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${expandedSection === 'levels' ? 'rotate-180' : ''}`} />
                </button>

                {expandedSection === 'levels' && (
                    <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3">
                        {config.levelsOfStudy.map((level) => (
                            <div key={level.id} className="bg-white p-4 rounded-xl border border-slate-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-sky-500" />
                                        <span className="font-semibold text-slate-800">{level.name}</span>
                                    </div>
                                    {level.id === 'chinese_language' && (
                                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full uppercase">Has Sub-programs</span>
                                    )}
                                </div>
                                {level.subPrograms && (
                                    <div className="mt-3 pl-5 space-y-2">
                                        {Object.entries(level.subPrograms).map(([funding, subs]) => (
                                            <div key={funding} className="text-sm">
                                                <span className="text-slate-500 font-medium">{funding}:</span>
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    {subs.map(sub => (
                                                        <span key={sub} className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">{sub}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Section 2: Funding Types */}
            <div className="card-surface overflow-hidden">
                <button
                    onClick={() => toggleSection('funding')}
                    className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition"
                >
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${expandedSection === 'funding' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                            <DollarSign className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <h3 className="font-bold text-slate-800">Step 2: Funding Types</h3>
                            <p className="text-xs text-slate-500">How students fund their studies</p>
                        </div>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${expandedSection === 'funding' ? 'rotate-180' : ''}`} />
                </button>

                {expandedSection === 'funding' && (
                    <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3">
                        {config.fundingTypes.map((type) => (
                            <div key={type.id} className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span className="font-semibold text-slate-800">{type.name}</span>
                                {type.id === 'self_funded' && (
                                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">Skips Benefits Step</span>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Section 3: Scholarship Benefits */}
            <div className="card-surface overflow-hidden">
                <button
                    onClick={() => toggleSection('benefits')}
                    className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition"
                >
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${expandedSection === 'benefits' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                            <Gift className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <h3 className="font-bold text-slate-800">Step 3: Scholarship Benefits</h3>
                            <p className="text-xs text-slate-500">Only shown for Scholarship funding type</p>
                        </div>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${expandedSection === 'benefits' ? 'rotate-180' : ''}`} />
                </button>

                {expandedSection === 'benefits' && (
                    <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3">
                        {config.scholarshipBenefits.map((benefit) => (
                            <div key={benefit.id} className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-amber-500" />
                                <span className="font-semibold text-slate-800">{benefit.name}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Section 4: Language of Instruction */}
            <div className="card-surface overflow-hidden">
                <button
                    onClick={() => toggleSection('language')}
                    className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition"
                >
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${expandedSection === 'language' ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-500'}`}>
                            <Languages className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <h3 className="font-bold text-slate-800">Step 4: Language of Instruction</h3>
                            <p className="text-xs text-slate-500">Teaching language options</p>
                        </div>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${expandedSection === 'language' ? 'rotate-180' : ''}`} />
                </button>

                {expandedSection === 'language' && (
                    <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3">
                        {config.languages.map((lang) => (
                            <div key={lang.id} className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-purple-500" />
                                <span className="font-semibold text-slate-800">{lang.name}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Section 5: Programs by Level */}
            <div className="card-surface overflow-hidden">
                <button
                    onClick={() => toggleSection('programs')}
                    className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition"
                >
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${expandedSection === 'programs' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                            <BookOpen className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <h3 className="font-bold text-slate-800">Step 5: Available Programs</h3>
                            <p className="text-xs text-slate-500">Programs displayed based on Level selection</p>
                        </div>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${expandedSection === 'programs' ? 'rotate-180' : ''}`} />
                </button>

                {expandedSection === 'programs' && (
                    <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-4">
                        {Object.entries(programs).map(([levelId, programList]) => {
                            const levelName = config.levelsOfStudy.find(l => l.id === levelId)?.name || levelId
                            const isEditing = editingLevel === levelId

                            return (
                                <div key={levelId} className="bg-white p-4 rounded-xl border border-slate-200">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-bold text-slate-800">{levelName}</h4>
                                        <button
                                            onClick={() => setEditingLevel(isEditing ? null : levelId)}
                                            className={`text-xs font-bold px-3 py-1 rounded-lg transition ${isEditing ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                        >
                                            {isEditing ? 'Done' : 'Edit'}
                                        </button>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {programList.map((program, idx) => (
                                            <div key={idx} className={`text-xs px-3 py-1.5 rounded-lg flex items-center gap-2 ${isEditing ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-indigo-50 text-indigo-700'}`}>
                                                <span>{program}</span>
                                                {isEditing && (
                                                    <button
                                                        onClick={() => handleRemoveProgram(levelId, idx)}
                                                        className="hover:text-rose-900"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {isEditing && (
                                        <div className="mt-3 flex gap-2">
                                            <input
                                                type="text"
                                                value={newProgram}
                                                onChange={(e) => setNewProgram(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddProgram(levelId))}
                                                placeholder="Add new program..."
                                                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                            />
                                            <button
                                                onClick={() => handleAddProgram(levelId)}
                                                className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
