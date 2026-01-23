import {
    LayoutDashboard,
    Users,
    Inbox,
    BookOpen,
    Briefcase,
    Rocket,
    Users2,
    MessageSquare,
    HelpCircle,
    Star,
    Settings,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Bell,
    ClipboardList,
    FileQuestion
} from 'lucide-react'
import { useState } from 'react'
import logoImg from '../assets/Thep2s.png'

export default function AdminSidebar({ activeTab, onTabChange, onLogout, totalUnread = 0 }) {
    const [isCollapsed, setIsCollapsed] = useState(false)

    const menuGroups = [
        {
            group: "Management",
            items: [
                { id: 'overview', label: 'Overview', icon: LayoutDashboard, color: 'text-indigo-600' },
                { id: 'applicants', label: 'Applications & Users', icon: Users, color: 'text-blue-600' },
                { id: 'messages', label: 'Messages', icon: Inbox, color: 'text-amber-600' },
                { id: 'scholarships', label: 'Scholarships', icon: BookOpen, color: 'text-sky-600' },
                { id: 'categories', label: 'Enrollment Category', icon: BookOpen, color: 'text-indigo-600' },
            ]
        },
        {
            group: "User Dashboard",
            items: [
                { id: 'notices', label: 'Notices', icon: Bell, color: 'text-amber-600' },
                { id: 'dashboard-faqs', label: 'Dashboard FAQs', icon: FileQuestion, color: 'text-sky-600' },
                { id: 'surveys', label: 'Surveys', icon: ClipboardList, color: 'text-emerald-600' },
            ]
        },
        {
            group: "Website Content",
            items: [
                { id: 'services', label: 'Services', icon: Briefcase, color: 'text-emerald-600' },
                { id: 'blog', label: 'Blog', icon: MessageSquare, color: 'text-purple-600' },
                { id: 'testimonials', label: 'Success Stories', icon: Star, color: 'text-yellow-600' },
                { id: 'mission', label: 'Mission', icon: Rocket, color: 'text-rose-600' },
            ]
        },
        {
            group: "Support & Team",
            items: [
                { id: 'faqs', label: 'FAQs', icon: HelpCircle, color: 'text-slate-600' },
                { id: 'team', label: 'Team', icon: Users2, color: 'text-indigo-600' },
                { id: 'settings', label: 'Settings', icon: Settings, color: 'text-slate-500' },
            ]
        }
    ]

    return (
        <aside
            className={`fixed left-0 top-0 h-screen bg-white border-r border-slate-200 transition-all duration-300 z-50 flex flex-col ${isCollapsed ? 'w-20' : 'w-64'
                }`}
        >
            {/* Sidebar Header */}
            <div className="h-16 flex items-center px-4 border-b border-slate-50 relative">
                <div className={`flex items-center gap-3 transition-opacity duration-300 ${isCollapsed ? 'opacity-0 invisible w-0' : 'opacity-100 visible'}`}>
                    <img src={logoImg} alt="Logo" className="h-8 w-auto" />
                    <span className="font-bold text-slate-900 truncate">Admin Panel</span>
                </div>
                {isCollapsed && (
                    <img src={logoImg} alt="Logo" className="h-8 w-auto absolute left-6" />
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-3 top-1/2 -translate-y-1/2 bg-white border border-slate-200 rounded-full p-1 shadow-sm hover:bg-slate-50 text-slate-400 hover:text-sky-600 transition-colors"
                >
                    {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>
            </div>

            {/* Sidebar Navigation */}
            <div className="flex-1 overflow-y-auto py-6 no-scrollbar">
                {menuGroups.map((group, idx) => (
                    <div key={idx} className="mb-6 px-4">
                        {!isCollapsed && (
                            <h3 className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                                {group.group}
                            </h3>
                        )}
                        <div className="space-y-1">
                            {group.items.map((item) => {
                                const Icon = item.icon
                                const isActive = activeTab === item.id
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => onTabChange(item.id)}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${isActive
                                            ? 'bg-sky-50 text-sky-600 shadow-sm ring-1 ring-sky-100'
                                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                            }`}
                                        title={isCollapsed ? item.label : ''}
                                    >
                                        <div className={`transition-colors duration-200 ${isActive ? 'text-sky-600' : item.color}`}>
                                            <Icon size={20} />
                                        </div>
                                        {!isCollapsed && (
                                            <span className="text-sm font-bold tracking-tight">{item.label}</span>
                                        )}
                                        {item.id === 'messages' && totalUnread > 0 && (
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black leading-none ${isActive ? 'bg-sky-600 text-white' : 'bg-rose-500 text-white animate-pulse'}`}>
                                                {totalUnread}
                                            </span>
                                        )}
                                        {isActive && !isCollapsed && item.id !== 'messages' && (
                                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-600 shadow-sm shadow-sky-200" />
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-slate-50">
                <button
                    onClick={onLogout}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all duration-200 group`}
                >
                    <LogOut size={20} className="group-hover:text-rose-600" />
                    {!isCollapsed && <span className="text-sm font-bold tracking-tight">Sign Out</span>}
                </button>
            </div>
        </aside>
    )
}
