import React, { useEffect } from 'react';
import { X, Image as ImageIcon, Download, ExternalLink } from 'lucide-react';

interface ProofPreviewProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    date: string;
    type: 'rank' | 'medal';
    imagePath?: string;
}

export const ProofPreview: React.FC<ProofPreviewProps> = ({ isOpen, onClose, title, date, type, imagePath }) => {
    const [imgSrc, setImgSrc] = React.useState<string | null>(null);
    const [isZoomed, setIsZoomed] = React.useState(false);

    useEffect(() => {
        if (isOpen && imagePath) {
            setImgSrc(`dossier://${imagePath}`);
            setIsZoomed(false);
        } else {
            setImgSrc(null);
            setIsZoomed(false);
        }
    }, [isOpen, imagePath]);

    // Lock body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleDownload = async () => {
        if (!imagePath) return;
        try {
            // Extract extension
            const ext = imagePath.split('.').pop() || 'jpg';
            const defaultName = `proof-${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${date}.${ext}`;

            await window.api.files.downloadVaultFile(imagePath, defaultName);
        } catch (error) {
            console.error("Download failed", error);
            alert("Failed to download image.");
        }
    };

    const toggleZoom = () => setIsZoomed(!isZoomed);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex flex-col">
                        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                            <ImageIcon size={16} className="text-blue-500" />
                            Proof of {type === 'rank' ? 'Promotion' : 'Achievement'}
                        </h3>
                        <p className="text-xs text-slate-500">{title} • {date}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Image Viewer Area */}
                <div className="flex-1 bg-slate-900 flex items-center justify-center min-h-[400px] relative group bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 to-slate-950 overflow-hidden">
                    {imgSrc ? (
                        <div
                            className={`transition-transform duration-300 ease-in-out ${isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'}`}
                            onClick={(e) => { e.stopPropagation(); toggleZoom(); }}
                        >
                            <img src={imgSrc} alt="Proof" className="max-w-full max-h-[600px] object-contain shadow-2xl" />
                        </div>
                    ) : (
                        <div className="text-center p-8">
                            <div className="w-24 h-32 mx-auto bg-slate-800 border-2 border-slate-700 rounded-lg flex items-center justify-center mb-4 shadow-xl rotate-3 transition-transform group-hover:rotate-0 duration-500">
                                <ImageIcon size={32} className="text-slate-600" />
                            </div>
                            <p className="text-slate-400 text-sm font-medium">No image uploaded</p>
                            <p className="text-slate-600 text-xs mt-1 max-w-xs mx-auto">
                                No proof document is attached to this record.
                            </p>
                        </div>
                    )}

                    {/* Toolbar */}
                    {imgSrc && (
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-slate-800/90 backdrop-blur rounded-full shadow-lg border border-slate-700/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                            <button
                                className="p-2 text-slate-400 hover:text-white transition-colors"
                                title={isZoomed ? "Zoom Out" : "Zoom In"}
                                onClick={(e) => { e.stopPropagation(); toggleZoom(); }}
                            >
                                <ExternalLink size={14} className={`transition-transform ${isZoomed ? "rotate-180" : ""}`} />
                            </button>
                            <div className="w-px h-3 bg-slate-700 mx-1" />
                            <button
                                className="p-2 text-slate-400 hover:text-white transition-colors"
                                title="Download"
                                onClick={(e) => { e.stopPropagation(); handleDownload(); }}
                            >
                                <Download size={14} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
