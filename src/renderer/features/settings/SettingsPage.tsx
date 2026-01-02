import React, { useState } from 'react';
import { Save, AlertCircle, CheckCircle, Loader2, Upload, Database, Settings2, Building2 } from 'lucide-react';
import { RulesetList } from './RulesetList';
import { RulesetEditor } from './RulesetEditor';
import { ClubList } from './ClubList';
import { ClubForm } from './ClubForm';
import { Ruleset, Club } from '../../../shared/schemas';

type SettingsTab = 'rulesets' | 'database' | 'clubs';

export const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState<SettingsTab>('rulesets');
    const [editingRuleset, setEditingRuleset] = useState<Ruleset | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [editingClub, setEditingClub] = useState<Club | null>(null);
    const [isAddingClub, setIsAddingClub] = useState(false);

    // Database state
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
                if (result.error === 'Cancelled by user') return;
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
        if (!confirm('WARNING: Importing a database will overwrite ALL current data. Are you sure?')) return;
        setIsRestoring(true);
        setStatus(null);
        try {
            const result = await window.api.system.restoreDatabase();
            if (result.success) {
                setStatus({ type: 'success', message: 'Database restored successfully. Reloading...' });
                setTimeout(() => window.location.reload(), 1500);
            } else {
                if (result.error === 'Cancelled by user') return;
                setStatus({ type: 'error', message: result.error || 'Restore failed' });
            }
        } catch (err) {
            setStatus({ type: 'error', message: 'An unexpected error occurred' });
            console.error(err);
        } finally {
            setIsRestoring(false);
        }
    };

    const handleEditRuleset = async (rs: Ruleset) => {
        if (rs.id) {
            const fullRs = await window.api.rulesets.getById(rs.id);
            if (fullRs) {
                setEditingRuleset(fullRs);
                setIsAdding(false);
            }
        }
    };

    const handleNewRuleset = () => {
        setEditingRuleset(null);
        setIsAdding(true);
    };

    const handleEditClub = (club: Club) => {
        setEditingClub(club);
        setIsAddingClub(false);
    };

    const handleNewClub = () => {
        setEditingClub(null);
        setIsAddingClub(true);
    };

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">System Settings</h2>
                    <p className="text-slate-500 text-sm mt-1">Configure application rules and manage system data.</p>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit mb-8">
                <button
                    onClick={() => { setActiveTab('rulesets'); setEditingRuleset(null); setIsAdding(false); }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'rulesets' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Settings2 size={18} />
                    Ruleset Management
                </button>
                <button
                    onClick={() => setActiveTab('clubs')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'clubs' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Building2 size={18} />
                    Club Management
                </button>
                <button
                    onClick={() => setActiveTab('database')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'database' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Database size={18} />
                    Database & Backup
                </button>
            </div>

            <div className="space-y-6">
                {activeTab === 'rulesets' && (
                    <div className="animate-in fade-in duration-300">
                        {editingRuleset || isAdding ? (
                            <RulesetEditor
                                ruleset={editingRuleset || undefined}
                                onBack={() => { setEditingRuleset(null); setIsAdding(false); }}
                            />
                        ) : (
                            <RulesetList onEdit={handleEditRuleset} onAdd={handleNewRuleset} />
                        )}
                    </div>
                )}

                {activeTab === 'clubs' && (
                    <div className="animate-in fade-in duration-300">
                        {editingClub || isAddingClub ? (
                            <ClubForm
                                club={editingClub || undefined}
                                onBack={() => { setEditingClub(null); setIsAddingClub(false); }}
                            />
                        ) : (
                            <ClubList onEdit={handleEditClub} onAdd={handleNewClub} />
                        )}
                    </div>
                )}

                {activeTab === 'database' && (
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm animate-in fade-in duration-300">
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Restore & Backup</h3>
                        <p className="text-slate-500 mb-8 max-w-2xl">
                            Maintain your data integrity by performing regular backups. You can restore your data from a JSON backup file at any time.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-between">
                                <div>
                                    <h4 className="font-bold text-slate-700 mb-1">Export Data</h4>
                                    <p className="text-xs text-slate-500 mb-4 text-balance">Create a snapshot of your entire database including athletes, match records, and settings.</p>
                                </div>
                                <button
                                    onClick={handleBackup}
                                    disabled={isLoading}
                                    className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
                                >
                                    {isBackingUp ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    {isBackingUp ? 'Backing up...' : 'Create Backup'}
                                </button>
                            </div>

                            <div className="p-6 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-between text-balance">
                                <div>
                                    <h4 className="font-bold text-slate-700 mb-1">Import Data</h4>
                                    <p className="text-xs text-slate-500 mb-4">Replace current data with a previous backup. This will permanently delete current records.</p>
                                </div>
                                <button
                                    onClick={handleRestore}
                                    disabled={isLoading}
                                    className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
                                >
                                    {isRestoring ? <Loader2 size={18} className="text-slate-500 animate-spin" /> : <Upload size={18} />}
                                    {isRestoring ? 'Importing...' : 'Restore from File'}
                                </button>
                            </div>
                        </div>

                        {status && (
                            <div className={`mt-6 p-4 rounded-lg flex items-center gap-3 text-sm font-medium ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                                {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                                {status.message}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

