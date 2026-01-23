import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, X, Save, ChevronRight, ChevronDown } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL;

export default function AdminEnrollmentCategories() {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editMode, setEditMode] = useState(null)
    const [submitting, setSubmitting] = useState(false)

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        subCategories: [] // Array of strings
    })
    const [newSubCategory, setNewSubCategory] = useState('')

    useEffect(() => {
        fetchCategories()
    }, [])

    async function fetchCategories() {
        setLoading(true)
        try {
            const res = await fetch(`${API_URL}/enrollment-categories`)
            const data = await res.json()
            setCategories(data)
        } catch (error) {
            console.error('Failed to fetch categories', error)
        }
        setLoading(false)
    }

    function handleEdit(category) {
        setFormData({
            name: category.name,
            subCategories: category.subCategories || []
        })
        setEditMode(category._id)
        setIsModalOpen(true)
    }

    function handleAddSubCategory() {
        if (!newSubCategory.trim()) return
        setFormData({
            ...formData,
            subCategories: [...formData.subCategories, newSubCategory.trim()]
        })
        setNewSubCategory('')
    }

    function handleRemoveSubCategory(index) {
        const newSubs = [...formData.subCategories]
        newSubs.splice(index, 1)
        setFormData({ ...formData, subCategories: newSubs })
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setSubmitting(true)
        try {
            const url = editMode
                ? `${API_URL}/enrollment-categories/${editMode}`
                : `${API_URL}/enrollment-categories`

            const method = editMode ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                await fetchCategories()
                setIsModalOpen(false)
                resetForm()
            } else {
                alert('Failed to save category')
            }
        } catch (error) {
            console.error('Error saving category', error)
        }
        setSubmitting(false)
    }

    async function handleDelete(id) {
        if (!confirm('Are you sure? This will delete the category and all its sub-items.')) return
        try {
            await fetch(`${API_URL}/enrollment-categories/${id}`, { method: 'DELETE' })
            fetchCategories()
        } catch (error) {
            console.error('Error deleting category', error)
        }
    }

    function resetForm() {
        setFormData({ name: '', subCategories: [] })
        setEditMode(null)
        setNewSubCategory('')
    }

    return (
        <div className="space-y-6">
            <div className="card-surface p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Enrollment Categories</h2>
                        <p className="text-sm text-slate-500">Manage admission categories and sub-programs</p>
                    </div>
                    <button
                        onClick={() => { resetForm(); setIsModalOpen(true) }}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Add Category
                    </button>
                </div>

                {loading ? (
                    <p className="text-center py-8 text-slate-500">Loading categories...</p>
                ) : (
                    <div className="space-y-4">
                        {categories.map((cat) => (
                            <CategoryItem
                                key={cat._id}
                                category={cat}
                                onEdit={() => handleEdit(cat)}
                                onDelete={() => handleDelete(cat._id)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <h3 className="text-xl font-bold text-slate-900">{editMode ? 'Edit Category' : 'Add New Category'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition text-slate-500">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            <form id="categoryForm" onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Category Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                                        placeholder="e.g. Exchange Programme"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Sub-Categories / Programs</label>
                                    <div className="flex gap-2 mb-3">
                                        <input
                                            type="text"
                                            value={newSubCategory}
                                            onChange={(e) => setNewSubCategory(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubCategory())}
                                            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                                            placeholder="Type sub-category and press Enter or Add"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddSubCategory}
                                            className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 transition"
                                        >
                                            Add
                                        </button>
                                    </div>

                                    <div className="space-y-2 max-h-60 overflow-y-auto p-1">
                                        {formData.subCategories.length === 0 && (
                                            <p className="text-sm text-slate-400 italic">No sub-categories added yet.</p>
                                        )}
                                        {formData.subCategories.map((sub, idx) => (
                                            <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100 group">
                                                <span className="text-sm text-slate-700">{sub}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveSubCategory(idx)}
                                                    className="text-slate-400 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-5 py-2.5 rounded-lg border border-slate-300 font-semibold text-slate-600 hover:bg-white transition"
                            >
                                Cancel
                            </button>
                            <button
                                form="categoryForm"
                                type="submit"
                                disabled={submitting}
                                className="px-5 py-2.5 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-100 flex items-center gap-2"
                            >
                                {submitting ? 'Saving...' : 'Save Category'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function CategoryItem({ category, onEdit, onDelete }) {
    const [expanded, setExpanded] = useState(false)

    return (
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white transition-all hover:shadow-sm">
            <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg transition-transform duration-200 ${expanded ? 'bg-sky-100 text-sky-600 rotate-90' : 'bg-slate-100 text-slate-500'}`}>
                        <ChevronRight className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800">{category.name}</h3>
                        <p className="text-xs text-slate-500">{category.subCategories?.length || 0} sub-categories</p>
                    </div>
                </div>
                <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                    <button onClick={onEdit} className="p-2 hover:bg-sky-50 text-slate-400 hover:text-sky-600 rounded-lg transition">
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={onDelete} className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {expanded && (
                <div className="bg-slate-50/50 p-4 border-t border-slate-100">
                    <ul className="space-y-2 pl-11">
                        {category.subCategories?.map((sub, i) => (
                            <li key={i} className="text-sm text-slate-600 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                {typeof sub === 'string' ? sub : sub.name}
                            </li>
                        ))}
                        {(!category.subCategories || category.subCategories.length === 0) && (
                            <li className="text-sm text-slate-400 italic">No sub-categories</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    )
}
