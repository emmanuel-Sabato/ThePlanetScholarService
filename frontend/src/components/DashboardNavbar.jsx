import { LogOut, Bell } from 'lucide-react'
import logoImg from '../assets/Thep2s.png'

export default function DashboardNavbar({
    tabs = [],
    activeTab,
    onTabChange,
    portalName = "Portal",
    onLogout,
    showNotifications = false,
    userName = null
}) {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Left: Branding */}
                    <div className="flex items-center gap-3">
                        <img src={logoImg} alt="Logo" className="h-8 w-auto" />
                        <div className="hidden sm:block h-6 w-px bg-slate-200" />
                        <div className="hidden sm:block">
                            <p className="text-[10px] uppercase tracking-wider text-sky-600 font-bold leading-none mb-0.5">{portalName}</p>
                            <p className="text-sm font-bold text-slate-900 leading-none">
                                {userName ? `${userName}'s Dashboard` : 'Dashboard'}
                            </p>
                        </div>
                    </div>

                    {/* Center: Tabs */}
                    <div className="hidden md:flex items-center gap-1 bg-slate-100/50 p-1 rounded-xl border border-slate-200/50">
                        {tabs.map((tab) => {
                            const Icon = tab.icon
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => onTabChange(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 relative group ${activeTab === tab.id
                                        ? 'bg-white text-sky-600 shadow-sm ring-1 ring-slate-200/50'
                                        : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{tab.label}</span>
                                    {tab.badge && (
                                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black leading-none ${activeTab === tab.id ? 'bg-sky-600 text-white' : 'bg-rose-500 text-white animate-pulse'}`}>
                                            {tab.badge}
                                        </span>
                                    )}
                                </button>
                            )
                        })}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        {showNotifications && (
                            <button className="p-2 relative text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                            </button>
                        )}
                        <button
                            onClick={onLogout}
                            className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-bold text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>

                {/* Mobile Tabs */}
                <div className="md:hidden flex overflow-x-auto gap-2 py-2 no-scrollbar">
                    {tabs.map((tab) => {
                        const Icon = tab.icon
                        return (
                            <button
                                key={tab.id}
                                onClick={() => onTabChange(tab.id)}
                                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all relative ${activeTab === tab.id
                                    ? 'bg-sky-600 text-white shadow-sm'
                                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                                    }`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                <span>{tab.label}</span>
                                {tab.badge && (
                                    <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black leading-none ${activeTab === tab.id ? 'bg-white text-sky-600' : 'bg-rose-500 text-white'}`}>
                                        {tab.badge}
                                    </span>
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>
        </nav>
    )
}
