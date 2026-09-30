export interface AppConfig {
  nightMode: boolean;
  fullScreen: boolean;
  backgroundColor: string;
  autoTransliterate: boolean;
  fontSize: number;
}

export interface AppState {
  text: string;
  config: AppConfig;
  memory: Record<string, string>; // romanized word -> preferred nepali word cache
  
  // Actions
  setText: (text: string) => void;
  setNightMode: (nightMode: boolean) => void;
  toggleNightMode: () => void;
  setFullScreen: (fullScreen: boolean) => void;
  setBackgroundColor: (color: string) => void;
  setAutoTransliterate: (auto: boolean) => void;
  setFontSize: (size: number) => void;
  rememberWord: (roman: string, nepali: string) => void;
  clearMemory: () => void;
  clearText: () => void;
}

export interface CaretCoordinates {
  top: number;
  left: number;
  height: number;
}

export interface SuggestionState {
  active: boolean;
  x: number;
  y: number;
  inputText: string;
  lastInputText: string;
  suggestions: string[];
  selectedIndex: number;
  selectedCache: string | null;
  loading: boolean;
}
