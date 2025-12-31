import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { LayoutDashboard, Users, FileText, Plus, X } from 'lucide-react';
import '../index.css';

import { AthleteForm } from './features/athletes/AthleteForm';
import { useAthleteStore } from './features/athletes/useAthleteStore';
import { AthleteList } from './features/athletes/AthleteList';

function App() {
    const [isReady, setIsReady] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const { loadAthletes, addAthlete, error } = useAthleteStore();

    useEffect(() => {
        const init = async () => {
            await loadAthletes();
            setIsReady(true);
        };
        init();
    }, [loadAthletes]);

    const handleAddAthlete = async (data: any) => {
        await addAthlete(data);
        setIsFormOpen(false);
    };

    if (!isReady) {
        return (
            <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-pulse text-2xl">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
            {/* Sidebar */}
            <aside className="w-64 bg-[#0f172a] text-slate-300 flex flex-col flex-shrink-0 transition-all duration-300">
                <div className="p-6">
                    <div className="flex items-center gap-3 text-white mb-8">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-lg">J</div>
                        <span className="font-bold text-lg tracking-wide">JUDO PRO AMS</span>
                    </div>

                    <nav className="space-y-1">
                        <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" />
                        <NavItem icon={<Users size={20} />} label="Athletes" active />
                        <NavItem icon={<FileText size={20} />} label="Reports" />
                    </nav>
                </div>

                <div className="mt-auto p-6 border-t border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-slate-700 flex items-center justify-center font-medium text-xs">
                            KB
                        </div>
                        <div>
                            <div className="text-xs font-bold text-white tracking-wider uppercase">Kabupaten</div>
                            <div className="text-[10px] font-bold text-white tracking-wider uppercase">Bogor</div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 bg-white">
                {/* Header */}
                <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <h1 className="text-lg font-bold text-slate-800">Athlete Management</h1>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pool Health</span>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                <span className="text-xs font-medium text-slate-600">Online</span>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsFormOpen(true)}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm"
                        >
                            <Plus size={16} />
                            New Athlete
                        </button>
                    </div>
                </header>

                {error && (
                    <div className="m-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                        {error}
                    </div>
                )}

                {/* Content Area */}
                <div className="flex-1 overflow-hidden relative">
                    <AthleteList />
                </div>
            </main>

            {/* Add Athlete Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <h2 className="text-lg font-bold text-slate-800">Add New Athlete</h2>
                            <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6">
                            <AthleteForm onSubmit={handleAddAthlete} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const NavItem = ({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) => (
    <div className={`
        flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-all duration-200 group
        ${active ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/50 text-slate-400 hover:text-white'}
    `}>
        <span className={active ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}>{icon}</span>
        <span className="text-sm font-medium">{label}</span>
    </div>
);

const root = createRoot(document.getElementById('root')!);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
