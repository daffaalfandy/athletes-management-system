import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';

function App() {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // Simple ready check - in a real app, this would check if DB is ready via IPC
        const timer = setTimeout(() => setIsReady(true), 100);
        return () => clearTimeout(timer);
    }, []);

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
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">Judo Command Center</h1>
                <p className="text-slate-400">React + Electron + SQLite Stack Initialized ✓</p>
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
