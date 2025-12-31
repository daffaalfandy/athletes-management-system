import React, { useState } from 'react';
import { Save, AlertCircle, CheckCircle, Loader2, Upload } from 'lucide-react';

export const SettingsPage = () => {
    const [isBackingUp, setIsBackingUp] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const isLoading = isBackingUp || isRestoring;

    const handleBackup = async () => {
        setIsBackingUp(true);
        setStatus(null);
        try {
            const result = await window.api.system.backupDatabase();
            if (result.success) {
                setStatus({ type: 'success', message: `Database backed up successfully to: ${result.data}` });
            } else {
                // If it was cancelled, we might not want to show an error, or show a neutral message
                if (result.error === 'Cancelled by user') {
                    // Optionally do nothing or show info
                    return;
                }
                setStatus({ type: 'error', message: result.error || 'Backup failed' });
            }
        } catch (err) {
            setStatus({ type: 'error', message: 'An unexpected error occurred' });
            console.error(err);
        } finally {
            setIsBackingUp(false);
        }
    };

    const handleRestore = async () => {
        if (!confirm('WARNING: Importing a database will overwrite ALL current data. This action cannot be undone. Are you sure?')) {
            return;
        }

        setIsRestoring(true);
        setStatus(null);
        try {
            const result = await window.api.system.restoreDatabase();
            if (result.success) {
                setStatus({ type: 'success', message: 'Database restored successfully. Reloading...' });
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else {
                if (result.error === 'Cancelled by user') {
                    return;
                }
                setStatus({ type: 'error', message: result.error || 'Restore failed' });
            }
        } catch (err) {
            setStatus({ type: 'error', message: 'An unexpected error occurred' });
            console.error(err);
        } finally {
            setIsRestoring(false);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">System Settings</h2>

            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-700 mb-4">Database Management</h3>

                <p className="text-slate-500 mb-6">
                    Manage your database backups. You can export your data to safe keeping or restore from a previous backup.
                </p>

                <div className="flex items-center gap-4">
                    <button
                        onClick={handleBackup}
                        disabled={isLoading}
                        className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isBackingUp ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        {isBackingUp ? 'Backing up...' : 'Backup Database'}
                    </button>

                    <button
                        onClick={handleRestore}
                        disabled={isLoading}
                        className="flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isRestoring ? <Loader2 size={18} className="text-slate-500 animate-spin" /> : <Upload size={18} />}
                        {isRestoring ? 'Importing...' : 'Import Database'}
                    </button>

                    {status && (
                        <div className={`flex items-center gap-2 text-sm ${status.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
                            {status.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                            {status.message}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
