import React, { useState, useMemo } from 'react';
import clsx from 'clsx';
import { Feather, Copy, Check, Trash2, Languages, Sun, Moon } from 'lucide-react';
import { Tooltip } from '@mantine/core';
import { useAppStore } from '@/store/useAppStore';
import { getT } from '@/utils';
import { Notepad } from '@/components/Notepad/Notepad';
import { Toolbar } from '@/components/Toolbar/Toolbar';
import styles from './Editor.module.css';

export const Editor: React.FC = () => {
  const { config, text, clearText, toggleNightMode, setAutoTransliterate } = useAppStore();
  const [copied, setCopied] = useState(false);

  const isNepali = config.autoTransliterate;
  const t = useMemo(() => getT(isNepali), [isNepali]);

  const handleCopy = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn('Copy failed:', e);
    }
  };

  const handleClear = () => {
    if (!text) return;
    if (window.confirm(t.clearConfirm)) {
      clearText();
    }
  };

  return (
    <div
      className={clsx(styles.editor, config.nightMode && styles.nightmode)}
      style={{
        backgroundColor: config.nightMode ? '#121212' : config.backgroundColor,
      }}
    >
      {/* Top Navigation Bar */}
      <header className={styles.topBar}>
        {/* App Branding Logo */}
        <div className={styles.logo}>
          <Feather size={20} strokeWidth={2.5} />
          <span className={styles.logoText}>{t.logoName}</span>
        </div>

        {/* Top Action Buttons */}
        <div className={styles.topActions}>
          {/* Language Mode Switcher */}
          <Tooltip
            label={t.switchLanguageTooltip}
            withArrow
            position="bottom"
          >
            <button
              className={clsx(styles.actionBtn, isNepali && styles.actionBtnActive)}
              onClick={() => setAutoTransliterate(!isNepali)}
              aria-label={t.switchLanguageTooltip}
            >
              <Languages size={16} />
              <span className={styles.actionBtnText}>{t.modeBadge}</span>
            </button>
          </Tooltip>

          {/* Dark/Light Mode Toggle */}
          <Tooltip
            label={config.nightMode ? t.nightModeOnTooltip : t.nightModeOffTooltip}
            withArrow
            position="bottom"
          >
            <button
              className={styles.actionBtn}
              onClick={toggleNightMode}
              aria-label="Toggle dark/light mode"
            >
              {config.nightMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </Tooltip>

          {/* Copy Button */}
          <Tooltip
            label={copied ? t.copiedTooltip : t.copyTooltip}
            withArrow
            position="bottom"
          >
            <button
              className={clsx(styles.actionBtn, copied && styles.actionBtnSuccess)}
              onClick={handleCopy}
              disabled={!text}
              aria-label={t.copyTooltip}
            >
              {copied ? (
                <>
                  <Check size={16} strokeWidth={2.5} />
                  <span className={styles.actionBtnText}>{t.copied}</span>
                </>
              ) : (
                <>
                  <Copy size={16} />
                  <span className={styles.actionBtnText}>{t.copy}</span>
                </>
              )}
            </button>
          </Tooltip>

          {/* Clear Button */}
          {text && (
            <Tooltip
              label={t.clearTooltip}
              withArrow
              position="bottom"
            >
              <button
                className={styles.actionBtn}
                onClick={handleClear}
                aria-label={t.clearTooltip}
              >
                <Trash2 size={16} />
                <span className={styles.actionBtnText}>{t.clear}</span>
              </button>
            </Tooltip>
          )}
        </div>
      </header>

      {/* Main Notepad Paper */}
      <Notepad />

      {/* Floating Action Toolbar (Desktop Only) */}
      <Toolbar />
    </div>
  );
};
