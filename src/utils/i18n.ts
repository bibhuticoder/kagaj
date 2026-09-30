export interface Translations {
  logoName: string;
  modeBadge: string;
  placeholder: string;
  hint: string;
  copy: string;
  copied: string;
  copyTooltip: string;
  copiedTooltip: string;
  clear: string;
  clearTooltip: string;
  clearConfirm: string;
  colorPickerTooltip: string;
  transliterationOnTooltip: string;
  transliterationOffTooltip: string;
  nightModeOnTooltip: string;
  nightModeOffTooltip: string;
  fullscreenOnTooltip: string;
  fullscreenOffTooltip: string;
  switchLanguageTooltip: string;
}

export const translations: Record<'ne' | 'en', Translations> = {
  ne: {
    logoName: 'कागज',
    modeBadge: 'नेपाली (रोमन)',
    placeholder: 'यहाँ लेख्नुहोस्... (रोमनमा टाइप गर्नुहोस्, जस्तै: namaste -> नमस्ते)',
    hint: 'स्पेस (Space) वा इन्टर (Enter) थिचेर शब्द छान्नुहोस्',
    copy: 'कपी',
    copied: 'गरियो',
    copyTooltip: 'पाठ प्रतिलिपि गर्नुहोस् (Copy)',
    copiedTooltip: 'प्रतिलिपि गरियो! (Copied)',
    clear: 'मेटाउनुहोस्',
    clearTooltip: 'सबै पाठ मेटाउनुहोस् (Clear text)',
    clearConfirm: 'के तपाईं सबै पाठ मेटाउन चाहनुहुन्छ?',
    colorPickerTooltip: 'पृष्ठभूमिको रङ परिवर्तन गर्नुहोस्',
    transliterationOnTooltip: 'नेपाली रुपान्तरण सक्रिय छ (Transliteration ON)',
    transliterationOffTooltip: 'साधारण अंग्रेजी मोड (English Mode)',
    nightModeOnTooltip: 'दिनको मोड (Light Mode)',
    nightModeOffTooltip: 'रातको मोड (Night Mode)',
    fullscreenOnTooltip: 'पूर्ण पर्दा बन्द (Exit Fullscreen)',
    fullscreenOffTooltip: 'पूर्ण पर्दा (Fullscreen)',
    switchLanguageTooltip: 'भाषा मोड परिवर्तन गर्न क्लिक गर्नुहोस्',
  },
  en: {
    logoName: 'Kagaj',
    modeBadge: 'English',
    placeholder: 'Type your notes here...',
    hint: 'Transliteration disabled. Type freely in english',
    copy: 'Copy',
    copied: 'Copied',
    copyTooltip: 'Copy text to clipboard',
    copiedTooltip: 'Copied to clipboard!',
    clear: 'Clear',
    clearTooltip: 'Clear all text',
    clearConfirm: 'Are you sure you want to clear all text?',
    colorPickerTooltip: 'Change background color',
    transliterationOnTooltip: 'Nepali transliteration is ON',
    transliterationOffTooltip: 'English mode (Direct typing)',
    nightModeOnTooltip: 'Switch to Light Mode',
    nightModeOffTooltip: 'Switch to Night Mode',
    fullscreenOnTooltip: 'Exit Fullscreen',
    fullscreenOffTooltip: 'Enter Fullscreen',
    switchLanguageTooltip: 'Click to switch language mode',
  },
};

export const getT = (isNepali: boolean): Translations => {
  return isNepali ? translations.ne : translations.en;
};
