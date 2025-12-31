import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';

import { AthleteForm } from './features/athletes/AthleteForm';
import { useAthleteStore } from './features/athletes/useAthleteStore';

function App() {
    const [isReady, setIsReady] = useState(false);
    const { athletes, loadAthletes, addAthlete, deleteAthlete, error } = useAthleteStore();

    useEffect(() => {
        const init = async () => {
            await loadAthletes();
            setIsReady(true);
        };
        init();
    }, [loadAthletes]);

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
        <div className="min-h-screen bg-slate-900 text-white p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-8">Judo Command Center</h1>

                {error && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h2 className="text-2xl font-semibold mb-4">Add Athlete</h2>
                        <AthleteForm onSubmit={addAthlete} />
                    </div>

                    <div>
                        <h2 className="text-2xl font-semibold mb-4">Roster ({athletes.length})</h2>
                        <div className="bg-gray-800 rounded-lg overflow-hidden">
                            {athletes.length === 0 ? (
                                <p className="p-4 text-gray-400 text-center">No athletes found.</p>
                            ) : (
                                <ul className="divide-y divide-gray-700">
                                    {athletes.map((athlete) => (
                                        <li key={athlete.id} className="p-4 flex justify-between items-center hover:bg-gray-750">
                                            <div>
                                                <p className="font-medium text-white">{athlete.name}</p>
                                                <p className="text-sm text-gray-400">
                                                    {athlete.rank} • {athlete.weight}kg • {athlete.birthYear}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => athlete.id && deleteAthlete(athlete.id)}
                                                className="text-red-400 hover:text-red-300 text-sm px-3 py-1 bg-red-500/10 hover:bg-red-500/20 rounded"
                                            >
                                                Delete
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const root = createRoot(document.getElementById('root')!);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
