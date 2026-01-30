import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const ScholarshipCTA = () => {
    return (
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-sky-900 to-indigo-950 rounded-3xl p-8 mb-8 text-white shadow-2xl border border-white/10 group">
            {/* Dynamic Background Elements */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-sky-500/20 rounded-full blur-[80px] group-hover:bg-sky-500/30 transition-all duration-700"></div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] group-hover:bg-indigo-500/30 transition-all duration-700"></div>

            <div className="relative flex flex-col lg:flex-row items-center justify-between gap-10">
                <div className="flex-1 text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-500/20 to-indigo-500/20 backdrop-blur-xl px-4 py-1.5 rounded-full text-xs font-bold mb-6 border border-white/10 tracking-wide uppercase">
                        <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
                        <span className="bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
                            Exclusive Database Access
                        </span>
                    </div>

                    <h2 className="text-3xl md:text-4xl font-extrabold mb-6 leading-[1.15] bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
                        Don't see your ideal <br className="hidden md:block" /> scholarship here?
                    </h2>

                    <p className="text-slate-300 text-lg md:text-xl max-w-2xl leading-relaxed font-medium">
                        This list is just a preview. We have over <span className="text-white font-bold">500+ specialized programs</span> waiting for you. Sign up now and our experts will manually match you with the perfect opportunity.
                    </p>
                </div>

                <div className="shrink-0">
                    <Link
                        to="/register"
                        className="inline-flex items-center gap-3 bg-gradient-to-r from-sky-600 to-indigo-600 text-white px-10 py-5 rounded-2xl font-black text-lg hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 shadow-[0_20px_40px_-15px_rgba(14,165,233,0.3)] hover:shadow-[0_25px_50px_-12px_rgba(14,165,233,0.4)]"
                    >
                        Get Personalized Help
                        <ArrowRight className="w-6 h-6 group-hover:translate-x-1.5 transition-transform duration-300" />
                    </Link>
                    <div className="mt-4 text-center">
                        <p className="text-slate-500 text-sm font-semibold">Join 2,000+ students today</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScholarshipCTA;
