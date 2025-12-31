import React, { useEffect, useState } from 'react';
import { useRulesetStore } from './useRulesetStore';
import { Plus, Edit2, Trash2, CheckCircle, Circle } from 'lucide-react';
import { Ruleset } from '../../../shared/schemas';

interface RulesetListProps {
    onEdit: (ruleset: Ruleset) => void;
    onAdd: () => void;
}

export const RulesetList: React.FC<RulesetListProps> = ({ onEdit, onAdd }) => {
    const { rulesets, loading, loadRulesets, setActiveRuleset, deleteRuleset } = useRulesetStore();

    useEffect(() => {
        loadRulesets();
    }, [loadRulesets]);

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this ruleset?')) {
            await deleteRuleset(id);
        }
    };

    if (loading && rulesets.length === 0) {
        return <div className="p-8 text-center text-slate-500">Loading rulesets...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Available Rulesets</h3>
                    <p className="text-sm text-slate-500 text-balance">Only the active ruleset is used for athlete classification.</p>
                </div>
                <button
                    onClick={onAdd}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                    <Plus size={16} />
                    New Ruleset
                </button>
            </div>

            {rulesets.length === 0 ? (
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-12 text-center">
                    <p className="text-slate-500">No rulesets defined yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {rulesets.map((rs) => (
                        <div key={rs.id} className={`bg-white border rounded-xl p-5 shadow-sm transition-all ${rs.is_active ? 'border-emerald-500 ring-1 ring-emerald-500/20' : 'border-slate-200 hover:border-slate-300'}`}>
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => rs.id && setActiveRuleset(rs.id)}
                                        className={`transition-colors ${rs.is_active ? 'text-emerald-500' : 'text-slate-300 hover:text-slate-400'}`}
                                        title={rs.is_active ? 'Active' : 'Click to make active'}
                                    >
                                        {rs.is_active ? <CheckCircle size={22} fill="currentColor" className="text-white" /> : <Circle size={22} />}
                                    </button>
                                    <div>
                                        <h4 className="font-bold text-slate-800">{rs.name}</h4>
                                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">{rs.description || 'No description'}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => onEdit(rs)}
                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    {!rs.is_active && rs.id && (
                                        <button
                                            onClick={() => handleDelete(rs.id!)}
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {rs.is_active && (
                                <div className="mt-4 px-3 py-1.5 bg-emerald-50 rounded-md inline-flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Active Policy</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
