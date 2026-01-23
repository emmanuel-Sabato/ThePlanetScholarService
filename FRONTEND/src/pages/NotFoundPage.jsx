import { Link } from 'react-router-dom'
import { Search, Map, Home, Compass, GraduationCap, Plane, Globe } from 'lucide-react'

export default function NotFoundPage() {
    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4 relative overflow-hidden bg-slate-50 font-sans">
            {/* Animated Background Icons */}
            <div className="absolute inset-0 pointer-events-none select-none opacity-[0.05]">
                <Globe className="absolute top-[10%] left-[10%] w-32 h-32 animate-float-extra text-sky-600" />
                <Plane className="absolute top-[20%] right-[15%] w-24 h-24 animate-float-slow text-emerald-600" style={{ animationDelay: '-2s' }} />
                <GraduationCap className="absolute bottom-[20%] left-[15%] w-40 h-40 animate-float text-rose-600" style={{ animationDelay: '-4s' }} />
                <Compass className="absolute bottom-[10%] right-[10%] w-28 h-28 animate-float-slow text-sky-600" />
            </div>

            {/* Main Content Card */}
            <div className="max-w-xl w-full text-center relative z-10 animate-fadeIn">
                {/* Visual Animation Box */}
                <div className="relative w-48 h-48 mx-auto mb-12">
                    {/* Radar Circles */}
                    <div className="absolute inset-0 border-2 border-sky-100 rounded-full"></div>
                    <div className="absolute inset-0 border-2 border-sky-200 rounded-full animate-pulse-ring"></div>
                    <div className="absolute inset-0 border-2 border-emerald-100 rounded-full animate-pulse-ring" style={{ animationDelay: '1s' }}></div>

                    {/* Radar Sweep Line */}
                    <div className="absolute top-1/2 left-1/2 w-1/2 h-1 bg-gradient-to-r from-sky-400/50 to-transparent origin-left -translate-y-1/2 animate-radar"></div>

                    {/* Central Icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white p-6 rounded-full shadow-2xl border border-slate-100 ring-8 ring-sky-50/50">
                            <Search className="w-12 h-12 text-sky-600 animate-bounce" />
                        </div>
                    </div>

                    {/* Dynamic '404' Markers */}
                    <div className="absolute top-0 right-0 bg-white/80 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-rose-500 border border-rose-100 shadow-sm animate-pulse">404_NOT_FOUND</div>
                    <div className="absolute bottom-4 left-0 bg-white/80 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-sky-500 border border-sky-100 shadow-sm animate-pulse" style={{ animationDelay: '0.5s' }}>DESTINATION_UNKNOWN</div>
                </div>

                <h1 className="text-6xl md:text-8xl font-black text-slate-900 mb-4 tracking-tighter">
                    Oo<span className="text-sky-600">ps!</span>
                </h1>

                <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-6">
                    We've searched the globe...
                </h2>

                <p className="text-slate-600 mb-10 text-lg leading-relaxed max-w-md mx-auto">
                    The scholarship or page you're looking for has embarked on a new journey. Let's get you back on track to your future!
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link to="/" className="btn-primary w-full sm:w-auto px-8 py-4 text-base shadow-xl shadow-sky-100 group">
                        <Home className="w-5 h-5 mr-2 transition-transform group-hover:-translate-y-1" />
                        Back to Home
                    </Link>
                    <Link to="/scholarships" className="btn-secondary w-full sm:w-auto px-8 py-4 text-base bg-white border-2 group">
                        <Map className="w-5 h-5 mr-2 transition-transform group-hover:rotate-12" />
                        Explore Scholarships
                    </Link>
                </div>

                {/* Secret Admin Hint for helpfulness */}
                <p className="mt-12 text-xs text-slate-400 font-medium tracking-widest uppercase">
                    Error Code: AREA_51_REDIRECT
                </p>
            </div>
        </div>
    )
}
