import React, { useState, useEffect } from 'react';
import { Save, Upload, Loader2, CheckCircle, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { useSettingsStore } from './useSettingsStore';

export const BrandingSettings = () => {
    const { kabupatanName, kabupatanLogoPath, isLoading, error, updateSetting, uploadLogo, loadSettings } = useSettingsStore();
    const [localName, setLocalName] = useState(kabupatanName);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadSettings();
    }, [loadSettings]);

    useEffect(() => {
        setLocalName(kabupatanName);
    }, [kabupatanName]);

    useEffect(() => {
        const loadLogoPreview = async () => {
            if (kabupatanLogoPath) {
                try {
                    const absolutePath = await window.api.files.getImagePath(kabupatanLogoPath);
                    setLogoPreview(`dossier://${kabupatanLogoPath}`);
                } catch (err) {
                    console.error('Failed to load logo preview:', err);
                }
            }
        };
        loadLogoPreview();
    }, [kabupatanLogoPath]);

    const handleSaveName = async () => {
        if (localName.trim() === kabupatanName) return;

        setIsSaving(true);
        setStatus(null);
        try {
            await updateSetting('kabupaten_name', localName.trim());
            setStatus({ type: 'success', message: 'Kabupaten name updated successfully!' });
        } catch (err) {
            setStatus({ type: 'error', message: 'Failed to update kabupaten name' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleUploadLogo = async () => {
        setStatus(null);
        try {
            const filePath = await window.api.files.selectImage();
            if (!filePath) return;

            await uploadLogo(filePath);
            setStatus({ type: 'success', message: 'Logo uploaded successfully!' });
        } catch (err: any) {
            let errorMsg = err?.message || 'Failed to upload logo';
            // Clean up IPC error messages to be more user-friendly
            if (errorMsg.includes('Error: ')) {
                errorMsg = errorMsg.split('Error: ').pop() || errorMsg;
            }
            setStatus({ type: 'error', message: errorMsg });
        }
    };

    return (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Branding & Identity</h3>
            <p className="text-slate-500 mb-8 max-w-2xl">
                Customize the application branding to reflect your institution. This will update the sidebar and exported documents.
            </p>

            <div className="space-y-6">
                {/* Kabupaten Name */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                        Kabupaten Name
                    </label>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={localName}
                            onChange={(e) => setLocalName(e.target.value)}
                            placeholder="e.g., Kabupaten Bogor"
                            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                            onClick={handleSaveName}
                            disabled={isSaving || localName.trim() === kabupatanName}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            Save
                        </button>
                    </div>
                </div>

                {/* Logo Upload */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                        Kabupaten Logo
                    </label>
                    <p className="text-xs text-slate-500 mb-3">
                        Upload a PNG or JPG image (max 1MB). This will replace the default logo in the sidebar.
                    </p>

                    <div className="flex items-start gap-4">
                        {/* Logo Preview */}
                        <div className="w-20 h-20 rounded-lg border-2 border-slate-200 flex items-center justify-center bg-slate-50 overflow-hidden flex-shrink-0">
                            {logoPreview ? (
                                <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-slate-400 font-bold text-sm">KB</div>
                            )}
                        </div>

                        <button
                            onClick={handleUploadLogo}
                            disabled={isLoading}
                            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                            {logoPreview ? 'Replace Logo' : 'Upload Logo'}
                        </button>
                    </div>
                </div>

                {/* Status Messages */}
                {status && (
                    <div className={`p-4 rounded-lg flex items-center gap-3 text-sm font-medium ${status.type === 'success'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        : 'bg-red-50 text-red-700 border border-red-100'
                        }`}>
                        {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        {status.message}
                    </div>
                )}
            </div>
        </div>
    );
};
