import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AppState, AppConfig } from '@/types';

const DEFAULT_CONFIG: AppConfig = {
  nightMode: false,
  fullScreen: false,
  backgroundColor: '#80CBC4',
  autoTransliterate: true,
  fontSize: 19,
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      text: '',
      config: DEFAULT_CONFIG,
      memory: {},

      setText: (text: string) => set({ text }),

      setNightMode: (nightMode: boolean) =>
        set((state) => ({
          config: { ...state.config, nightMode },
        })),

      toggleNightMode: () =>
        set((state) => ({
          config: { ...state.config, nightMode: !state.config.nightMode },
        })),

      setFullScreen: (fullScreen: boolean) =>
        set((state) => ({
          config: { ...state.config, fullScreen },
        })),

      setBackgroundColor: (backgroundColor: string) =>
        set((state) => ({
          config: { ...state.config, backgroundColor },
        })),

      setAutoTransliterate: (autoTransliterate: boolean) =>
        set((state) => ({
          config: { ...state.config, autoTransliterate },
        })),

      setFontSize: (fontSize: number) =>
        set((state) => ({
          config: { ...state.config, fontSize },
        })),

      rememberWord: (roman: string, nepali: string) =>
        set((state) => ({
          memory: {
            ...state.memory,
            [roman.toLowerCase().trim()]: nepali,
          },
        })),

      clearMemory: () => set({ memory: {} }),

      clearText: () => set({ text: '' }),
    }),
    {
      name: 'kagaj-app-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
