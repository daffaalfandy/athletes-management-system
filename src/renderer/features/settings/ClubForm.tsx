import React, { useState, useEffect } from 'react';
import { Save, ArrowLeft, Upload, Building2 } from 'lucide-react';
import { Club } from '../../../shared/schemas';
import { useClubStore } from './useClubStore';

interface ClubFormProps {
    club?: Club;
    onBack: () => void;
}

export const ClubForm: React.FC<ClubFormProps> = ({ club, onBack }) => {
    const { addClub, updateClub } = useClubStore();
    const [formData, setFormData] = useState<Club>({
        id: club?.id,
        name: club?.name || '',
        logo_path: club?.logo_path || '',
        contact_person: club?.contact_person || '',
        contact_phone: club?.contact_phone || '',
        contact_email: club?.contact_email || '',
        location: club?.location || '',
    });
    const [tempLogoPath, setTempLogoPath] = useState<string>('');
    const [tempLogoDataUrl, setTempLogoDataUrl] = useState<string>('');
    const [uploading, setUploading] = useState(false);
    const [logoUploadTimestamp, setLogoUploadTimestamp] = useState<number>(Date.now());

    // Convert temp file path to data URL for preview
    useEffect(() => {
        if (tempLogoPath) {
            const fs = window.require?.('fs');
            if (fs) {
                try {
                    const buffer = fs.readFileSync(tempLogoPath);
                    const base64 = buffer.toString('base64');
                    const ext = tempLogoPath.split('.').pop()?.toLowerCase();
                    const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
                    setTempLogoDataUrl(`data:${mimeType};base64,${base64}`);
                } catch (error) {
                    console.error('Failed to read temp logo:', error);
                }
            }
        }
    }, [tempLogoPath]);

    const handleLogoUpload = async () => {
        const filePath = await window.api.files.selectImage();
        if (!filePath) return;

        if (!formData.id) {
            // Store temp path, upload after save
            setTempLogoPath(filePath);
            return;
        }

        // Upload immediately for existing clubs
        setUploading(true);
        try {
            const vaultPath = await window.api.files.uploadToVault(filePath, 'clubs', formData.id);
            const updatedData = { ...formData, logo_path: vaultPath };
            setFormData(updatedData);

            // Save to database immediately
            await updateClub(updatedData as Club & { id: number });

            // Update timestamp to force preview refresh
            setLogoUploadTimestamp(Date.now());
        } catch (error: any) {
            const message = error.message || String(error);
            if (message.includes('File too large')) {
                alert('The selected file is too large. Please choose an image smaller than 1MB.');
            } else {
                alert('Failed to upload logo');
            }
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (club?.id) {
                // Update existing club
                await updateClub(formData as Club & { id: number });
            } else {
                // Create new club
                const newClub = await addClub(formData);

                // Upload logo if temp path exists
                if (tempLogoPath && newClub.id) {
                    try {
                        const vaultPath = await window.api.files.uploadToVault(tempLogoPath, 'clubs', newClub.id);
                        await updateClub({ ...newClub, logo_path: vaultPath, id: newClub.id });
                    } catch (error: any) {
                        const message = error.message || String(error);
                        if (message.includes('File too large')) {
                            alert('Logo upload failed: File is too large (max 1MB). Club created without logo.');
                        } else {
                            alert('Logo upload failed. Club created without logo.');
                        }
                    }
                }
            }
            onBack();
        } catch (error: any) {
            alert(error.message || 'Failed to save club');
        }
    };

    const logoPreviewPath = formData.logo_path
        ? `dossier://${formData.logo_path}?t=${logoUploadTimestamp}`
        : tempLogoDataUrl
            ? tempLogoDataUrl
            : null;

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
                    {club ? 'Edit Club' : 'Add New Club'}
                </h3>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
                {/* Club Logo */}
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Club Logo
                    </label>
                    <div className="flex items-center gap-4">
                        {logoPreviewPath ? (
                            <img
                                src={logoPreviewPath}
                                alt="Club logo"
                                className="w-20 h-20 rounded-lg object-cover border border-slate-200"
                            />
                        ) : (
                            <div className="w-20 h-20 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200">
                                <Building2 size={32} className="text-slate-400" />
                            </div>
                        )}
                        <button
                            type="button"
                            onClick={handleLogoUpload}
                            disabled={uploading}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                        >
                            <Upload size={16} />
                            {uploading ? 'Uploading...' : 'Upload Logo'}
                        </button>
                    </div>
                </div>

                {/* Club Name */}
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Club Name *
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        placeholder="e.g., Judo Club Bandung"
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                    />
                </div>

                {/* Location */}
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Location
                    </label>
                    <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="e.g., Bandung, West Java"
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                    />
                </div>

                {/* Contact Information */}
                <div className="pt-4 border-t border-slate-100">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                        Contact Information
                    </h4>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">
                                Contact Person
                            </label>
                            <input
                                type="text"
                                value={formData.contact_person}
                                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                                placeholder="e.g., John Doe"
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">
                                Contact Phone
                            </label>
                            <input
                                type="tel"
                                value={formData.contact_phone}
                                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                                placeholder="e.g., +62 812-3456-7890"
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">
                                Contact Email
                            </label>
                            <input
                                type="email"
                                value={formData.contact_email}
                                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                                placeholder="e.g., contact@judoclub.com"
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                            />
                        </div>
                    </div>
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
                    {club ? 'Update Club' : 'Save Club'}
                </button>
            </div>
        </form>
    );
};
