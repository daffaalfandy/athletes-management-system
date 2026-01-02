import React, { useEffect } from 'react';
import { useClubStore } from './useClubStore';
import { Plus, Edit2, Trash2, Building2, MapPin, User, Phone } from 'lucide-react';
import { Club } from '../../../shared/schemas';

interface ClubListProps {
    onEdit: (club: Club) => void;
    onAdd: () => void;
}

export const ClubList: React.FC<ClubListProps> = ({ onEdit, onAdd }) => {
    const { clubs, loading, loadClubs, deleteClub } = useClubStore();

    useEffect(() => {
        loadClubs();
    }, [loadClubs]);

    const handleDelete = async (id: number, name: string) => {
        if (confirm(`Delete "${name}"? Athletes assigned to this club will become unattached.`)) {
            try {
                await deleteClub(id);
            } catch (error: any) {
                alert(error.message || 'Failed to delete club');
            }
        }
    };

    if (loading && clubs.length === 0) {
        return <div className="p-8 text-center text-slate-500">Loading clubs...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Club Management</h3>
                    <p className="text-sm text-slate-500 text-balance">Manage clubs and assign athletes for better organization.</p>
                </div>
                <button
                    onClick={onAdd}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                    <Plus size={16} />
                    Add Club
                </button>
            </div>

            {clubs.length === 0 ? (
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-12 text-center">
                    <Building2 size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500">No clubs defined yet.</p>
                    <p className="text-sm text-slate-400 mt-1">Create your first club to start organizing athletes.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {clubs.map((club) => (
                        <div key={club.id} className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-5 shadow-sm transition-all">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-start gap-3 flex-1">
                                    {club.logo_path ? (
                                        <img
                                            src={`dossier://${club.logo_path}`}
                                            alt={club.name}
                                            className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200">
                                            <Building2 size={24} className="text-slate-400" />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-slate-800 truncate">{club.name}</h4>
                                        {club.location && (
                                            <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                                                <MapPin size={12} />
                                                <span className="truncate">{club.location}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2 ml-2">
                                    <button
                                        onClick={() => onEdit(club)}
                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                        title="Edit club"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    {club.id && (
                                        <button
                                            onClick={() => handleDelete(club.id!, club.name)}
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                            title="Delete club"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {(club.contact_person || club.contact_phone) && (
                                <div className="mt-3 pt-3 border-t border-slate-100 space-y-1">
                                    {club.contact_person && (
                                        <div className="flex items-center gap-2 text-xs text-slate-600">
                                            <User size={12} className="text-slate-400" />
                                            <span className="truncate">{club.contact_person}</span>
                                        </div>
                                    )}
                                    {club.contact_phone && (
                                        <div className="flex items-center gap-2 text-xs text-slate-600">
                                            <Phone size={12} className="text-slate-400" />
                                            <span>{club.contact_phone}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
