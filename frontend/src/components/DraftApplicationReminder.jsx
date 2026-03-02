import { useState, useEffect } from 'react';
import { AlertTriangle, ArrowRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DraftApplicationReminder({ activeTab, userApp }) {
    const [showReminder, setShowReminder] = useState(false);
    const navigate = useNavigate();

    // Find the draft application
    // We look for 'Draft' status OR 'UNEnded' (if that's a status used, 
    // but based on DashboardPage.jsx, 'Draft' is the primary one used for unsubmitted apps).
    // The user mentioned "UNEnded[Unsubmited]" so we should stick to what we saw in the code: 'Draft'.
    const draftApp = userApp?.find(app => app.status === 'Draft' || app.status === 'UNEnded');

    const handleDismiss = () => {
        setShowReminder(false);
    };

    const handleContinue = () => {
        if (draftApp) {
            navigate(`/apply/${draftApp._id || draftApp.id}`);
            setShowReminder(false);
        }
    };

    // Trigger 1: Navigation to "Start Application" tab
    useEffect(() => {
        if (activeTab === 'start_application' && draftApp) {
            // Show immediately when returning/landing on this tab
            setShowReminder(true);
        } else {
            // Hide if leaving the tab
            setShowReminder(false);
        }
    }, [activeTab, draftApp]);

    // Trigger 2: Timer (Every 1.5 minutes while on "Start Application" tab)
    useEffect(() => {
        let interval;
        if (activeTab === 'start_application' && draftApp) {
            interval = setInterval(() => {
                setShowReminder(true);
            }, 90000); // 1.5 minutes = 90000 ms
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [activeTab, draftApp]);

    if (!showReminder || !draftApp) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 animate-slideUp">
            <div className="bg-white border-l-4 border-amber-500 rounded-lg shadow-2xl p-4 max-w-sm flex flex-col gap-3 relative">
                <button
                    onClick={handleDismiss}
                    className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 transition"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-100 rounded-full flex-shrink-0">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-800 text-sm">Action Required</h4>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            You have an unsubmitted application for <span className="font-semibold text-slate-800">{draftApp.scholarshipName}</span>.
                            Don't forget to complete it!
                        </p>
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <button
                        onClick={handleContinue}
                        className="text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 px-4 py-2 rounded-md transition flex items-center gap-2 shadow-sm"
                    >
                        Continue Application
                        <ArrowRight className="w-3 h-3" />
                    </button>
                </div>
            </div>
        </div>
    );
}
