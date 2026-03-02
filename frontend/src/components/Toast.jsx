import { useEffect, useState } from 'react'
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react'

export default function Toast({ id, type = 'info', message, onClose }) {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        requestAnimationFrame(() => setVisible(true))
    }, [])

    const handleClose = () => {
        setVisible(false)
        setTimeout(() => onClose(id), 300) // Wait for exit animation
    }

    const icons = {
        success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
        error: <AlertCircle className="w-5 h-5 text-red-500" />,
        info: <Info className="w-5 h-5 text-sky-500" />,
    }

    const bgColors = {
        success: 'bg-emerald-50 border-emerald-100',
        error: 'bg-red-50 border-red-100',
        info: 'bg-sky-50 border-sky-100',
    }

    return (
        <div
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg transition-all duration-300 transform ${visible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
                } ${bgColors[type] || bgColors.info} min-w-[300px] max-w-sm`}
        >
            {icons[type] || icons.info}
            <p className="flex-1 text-sm font-medium text-slate-700">{message}</p>
            <button
                onClick={handleClose}
                className="p-1 rounded-full hover:bg-black/5 text-slate-400 hover:text-slate-600 transition"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    )
}
