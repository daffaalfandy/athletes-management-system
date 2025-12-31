import React, { useState, useEffect } from 'react';
import { Save, X, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { Ruleset, AgeCategory } from '../../../shared/schemas';
import { useRulesetStore } from './useRulesetStore';

interface RulesetEditorProps {
    ruleset?: Ruleset;
    onBack: () => void;
}

export const RulesetEditor: React.FC<RulesetEditorProps> = ({ ruleset, onBack }) => {
    const { addRuleset, updateRuleset } = useRulesetStore();
    const [name, setName] = useState(ruleset?.name || '');
    const [description, setDescription] = useState(ruleset?.description || '');
    const [categories, setCategories] = useState<AgeCategory[]>(ruleset?.categories || []);

    const handleAddCategory = () => {
        const newCategory: AgeCategory = {
            name: '',
            min_year: new Date().getFullYear() - 18,
            max_year: new Date().getFullYear() - 16,
            gender: 'MIXED'
        };
        setCategories([...categories, newCategory]);
    };

    const handleRemoveCategory = (index: number) => {
        setCategories(categories.filter((_, i) => i !== index));
    };

    const handleCategoryChange = (index: number, field: keyof AgeCategory, value: any) => {
        const newCategories = [...categories];
        newCategories[index] = { ...newCategories[index], [field]: value };
        setCategories(newCategories);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const data: Ruleset = {
            id: ruleset?.id,
            name,
            description,
            categories,
            is_active: ruleset?.is_active
        };

        if (ruleset?.id) {
            await updateRuleset(data);
        } else {
            await addRuleset(data);
        }
        onBack();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-4 mb-2">
                <button
                    type="button"
                    onClick={onBack}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                    <ArrowLeft size={20} className="text-slate-600" />
                </button>
                <h3 className="text-lg font-bold text-slate-800">
                    {ruleset ? 'Edit Ruleset' : 'Create New Ruleset'}
                </h3>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Ruleset Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder="e.g., IJF 2025 Standard"
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Optional historical note or scope..."
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm h-20 resize-none"
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Age Categories</h4>
                    <button
                        type="button"
                        onClick={handleAddCategory}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 px-2 py-1 hover:bg-blue-50 rounded transition-all"
                    >
                        <Plus size={14} /> Add Category
                    </button>
                </div>

                <div className="space-y-2">
                    {categories.map((cat, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-3 rounded-lg group animate-in slide-in-from-right-4 duration-200">
                            <div className="grid grid-cols-12 gap-2 flex-1">
                                <div className="col-span-4">
                                    <input
                                        type="text"
                                        placeholder="Name (e.g., U18)"
                                        value={cat.name}
                                        onChange={(e) => handleCategoryChange(idx, 'name', e.target.value)}
                                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded focus:border-blue-400 outline-none text-sm"
                                        required
                                    />
                                </div>
                                <div className="col-span-2">
                                    <input
                                        type="number"
                                        placeholder="Min Year"
                                        value={cat.min_year}
                                        onChange={(e) => handleCategoryChange(idx, 'min_year', parseInt(e.target.value))}
                                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded focus:border-blue-400 outline-none text-sm"
                                        required
                                    />
                                </div>
                                <div className="col-span-2">
                                    <input
                                        type="number"
                                        placeholder="Max Year"
                                        value={cat.max_year}
                                        onChange={(e) => handleCategoryChange(idx, 'max_year', parseInt(e.target.value))}
                                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded focus:border-blue-400 outline-none text-sm"
                                        required
                                    />
                                </div>
                                <div className="col-span-3">
                                    <select
                                        value={cat.gender}
                                        onChange={(e) => handleCategoryChange(idx, 'gender', e.target.value)}
                                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded focus:border-blue-400 outline-none text-sm"
                                    >
                                        <option value="M">Male</option>
                                        <option value="F">Female</option>
                                        <option value="MIXED">Mixed</option>
                                    </select>
                                </div>
                                <div className="col-span-1 flex items-center justify-center">
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveCategory(idx)}
                                        className="text-slate-300 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {categories.length === 0 && (
                        <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-slate-400 text-sm">
                            No categories added yet.
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                    type="button"
                    onClick={onBack}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                    <Save size={16} />
                    {ruleset ? 'Update Ruleset' : 'Save Ruleset'}
                </button>
            </div>
        </form>
    );
};
