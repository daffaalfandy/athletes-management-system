import React, { useEffect } from 'react';
import { X, Image as ImageIcon, Download, ExternalLink } from 'lucide-react';

interface ProofPreviewProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    date: string;
    type: 'rank' | 'medal';
}

export const ProofPreview: React.FC<ProofPreviewProps> = ({ isOpen, onClose, title, date, type }) => {
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

                {/* Image Viewer Area (Mock) */}
                <div className="flex-1 bg-slate-900 flex items-center justify-center min-h-[400px] relative group bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 to-slate-950">
                    {/* Placeholder for actual image */}
                    <div className="text-center p-8">
                        <div className="w-24 h-32 mx-auto bg-slate-800 border-2 border-slate-700 rounded-lg flex items-center justify-center mb-4 shadow-xl rotate-3 transition-transform group-hover:rotate-0 duration-500">
                            <ImageIcon size={32} className="text-slate-600" />
                        </div>
                        <p className="text-slate-400 text-sm font-medium">No image uploaded</p>
                        <p className="text-slate-600 text-xs mt-1 max-w-xs mx-auto">
                            In a real scenario, the proof document (certificate or photo) would be displayed here in high resolution.
                        </p>
                    </div>

                    {/* Mock Toolbar */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-slate-800/90 backdrop-blur rounded-full shadow-lg border border-slate-700/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button className="p-2 text-slate-400 hover:text-white transition-colors" title="Zoom In">
                            <ExternalLink size={14} />
                        </button>
                        <div className="w-px h-3 bg-slate-700 mx-1" />
                        <button className="p-2 text-slate-400 hover:text-white transition-colors" title="Download">
                            <Download size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
