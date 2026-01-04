import { create } from 'zustand';

interface SettingsState {
    kabupatanName: string;
    kabupatanLogoPath: string;
    isLoading: boolean;
    error: string | null;

    // Actions
    loadSettings: () => Promise<void>;
    updateSetting: (key: string, value: string) => Promise<void>;
    uploadLogo: (file: string) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
    kabupatanName: 'Kabupaten Bogor',
    kabupatanLogoPath: '',
    isLoading: false,
    error: null,

    loadSettings: async () => {
        set({ isLoading: true, error: null });
        try {
            const settings = await window.api.settings.getAll();
            set({
                kabupatanName: settings.kabupaten_name || 'Kabupaten Bogor',
                kabupatanLogoPath: settings.kabupaten_logo_path || '',
                isLoading: false
            });
        } catch (err) {
            set({ error: 'Failed to load settings', isLoading: false });
            console.error('[SettingsStore] Load failed:', err);
        }
    },

    updateSetting: async (key: string, value: string) => {
        set({ isLoading: true, error: null });
        try {
            await window.api.settings.set(key, value);

            // Update local state
            if (key === 'kabupaten_name') {
                set({ kabupatanName: value });
            } else if (key === 'kabupaten_logo_path') {
                set({ kabupatanLogoPath: value });
            }

            set({ isLoading: false });
        } catch (err) {
            set({ error: 'Failed to update setting', isLoading: false });
            console.error('[SettingsStore] Update failed:', err);
            throw err;
        }
    },

    uploadLogo: async (sourcePath: string) => {
        set({ isLoading: true, error: null });
        try {
            // Upload to vault with 'logo' as the recordId
            const relativePath = await window.api.files.uploadToVault(sourcePath, 'branding', 'logo');

            // Update the setting in the database
            await window.api.settings.set('kabupaten_logo_path', relativePath);

            // Update local state
            set({ kabupatanLogoPath: relativePath, isLoading: false });
        } catch (err: any) {
            let errorMsg = err?.message || 'Failed to upload logo';
            if (errorMsg.includes('Error: ')) {
                errorMsg = errorMsg.split('Error: ').pop() || errorMsg;
            }
            set({ error: errorMsg, isLoading: false });
            console.error('[SettingsStore] Upload failed:', err);
            throw err;
        }
    }
}));
