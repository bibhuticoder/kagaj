import React, { useRef, useMemo } from 'react';
import clsx from 'clsx';
import { Calendar, Sparkles } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useTransliteration } from '@/hooks/useTransliteration';
import { getFormattedDate, countWords, getT } from '@/utils';
import { SuggestionDropdown } from '@/components/SuggestionDropdown/SuggestionDropdown';
import styles from './Notepad.module.css';

export const Notepad: React.FC = () => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const { text, config } = useAppStore();

  const isNepali = config.autoTransliterate;
  const t = useMemo(() => getT(isNepali), [isNepali]);

  const {
    state: transliterationState,
    handleInputChange,
    handleKeyDown,
    handleMouseDown,
    applySuggestion,
  } = useTransliteration(textareaRef);

  const formattedDate = useMemo(() => getFormattedDate(isNepali), [isNepali]);
  const wordStats = useMemo(() => countWords(text, isNepali), [text, isNepali]);

  return (
    <div
      className={clsx(
        styles.notepad,
        config.nightMode && styles.nightmode
      )}
    >
      {/* Header with Date (Desktop only, hidden on mobile) */}
      <div className={styles.head}>
        <div className={styles.dateBadge}>
          <Calendar size={15} />
          <span>{formattedDate}</span>
        </div>
      </div>

      {/* Body / Textarea */}
      <div className={styles.body}>
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          placeholder={t.placeholder}
          value={text}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onMouseDown={handleMouseDown}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />

        {/* Suggestion Dropdown near caret (Desktop) */}
        {isNepali && (
          <SuggestionDropdown
            state={transliterationState}
            onSelect={applySuggestion}
            nightMode={config.nightMode}
          />
        )}
      </div>

      {/* Mobile Suggestion Pill Bar (Fixed above keyboard on small screens) */}
      {isNepali && transliterationState.active && transliterationState.suggestions.length > 0 && (
        <div className={clsx(styles.mobileSuggestionBar, 'animate-fade-in')}>
          <Sparkles size={16} color="#1c7ed6" />
          {transliterationState.suggestions.map((suggestion, index) => (
            <button
              key={`mob-${suggestion}-${index}`}
              className={clsx(
                styles.mobilePill,
                index === transliterationState.selectedIndex && styles.mobilePillActive
              )}
              onMouseDown={(e) => {
                e.preventDefault();
                applySuggestion(index);
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                applySuggestion(index);
              }}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Footer with Date on left (mobile), Hint (desktop), and Word Count on right */}
      <div className={styles.footer}>
        <div className={styles.footerLeft}>
          <div className={styles.footerDate}>
            <Calendar size={13} />
            <span>{formattedDate}</span>
          </div>
          <span className={styles.hint}>{t.hint}</span>
        </div>
        <span className={styles.wordCount}>{wordStats.label}</span>
      </div>
    </div>
  );
};
