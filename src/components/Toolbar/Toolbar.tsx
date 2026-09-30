import React, { useState, useEffect, useMemo } from 'react';
import { Tooltip } from '@mantine/core';
import {
  Sun,
  Moon,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Trash2,
  Languages,
} from 'lucide-react';
import clsx from 'clsx';
import { useAppStore } from '@/store/useAppStore';
import { openInFullScreen, exitFullScreen, isFullscreenActive, getT } from '@/utils';
import { ColorPicker } from '@/components/ColorPicker/ColorPicker';
import styles from './Toolbar.module.css';

interface ToolbarProps {
  onOpenClearModal?: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ onOpenClearModal }) => {
  const { config, toggleNightMode, setFullScreen, text, clearText, setAutoTransliterate } =
    useAppStore();
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreenState] = useState(false);

  const isNepali = config.autoTransliterate;
  const t = useMemo(() => getT(isNepali), [isNepali]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const active = isFullscreenActive();
      setIsFullscreenState(active);
      setFullScreen(active);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, [setFullScreen]);

  const toggleFullscreen = () => {
    if (isFullscreenActive()) {
      exitFullScreen();
    } else {
      openInFullScreen();
    }
  };

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
    if (onOpenClearModal) {
      onOpenClearModal();
    } else {
      clearText();
    }
  };

  return (
    <div className={clsx(styles.toolbar, config.nightMode && styles.nightmode)}>
      {/* Background Color Picker (hidden in night mode) */}
      {!config.nightMode && <ColorPicker isNepali={isNepali} />}

      {/* Transliteration / Language Mode Toggle */}
      <Tooltip
        label={isNepali ? t.transliterationOnTooltip : t.transliterationOffTooltip}
        withArrow
        position="top"
      >
        <button
          className={clsx(
            styles.toolBtn,
            isNepali && styles.toolBtnActive
          )}
          onClick={() => setAutoTransliterate(!isNepali)}
          aria-label="Toggle transliteration mode"
        >
          <Languages size={18} />
        </button>
      </Tooltip>

      <div className={styles.divider} />

      {/* Copy Text */}
      <Tooltip label={copied ? t.copiedTooltip : t.copyTooltip} withArrow position="top">
        <button
          className={styles.toolBtn}
          onClick={handleCopy}
          disabled={!text}
          style={{ opacity: !text ? 0.4 : 1 }}
          aria-label={t.copyTooltip}
        >
          {copied ? <Check size={18} color="#51cf66" /> : <Copy size={18} />}
        </button>
      </Tooltip>

      {/* Clear Text */}
      {text && (
        <Tooltip label={t.clearTooltip} withArrow position="top">
          <button
            className={styles.toolBtn}
            onClick={handleClear}
            aria-label={t.clearTooltip}
          >
            <Trash2 size={18} />
          </button>
        </Tooltip>
      )}

      <div className={styles.divider} />

      {/* Night mode toggle */}
      <Tooltip
        label={config.nightMode ? t.nightModeOnTooltip : t.nightModeOffTooltip}
        withArrow
        position="top"
      >
        <button
          className={styles.toolBtn}
          onClick={toggleNightMode}
          aria-label="Toggle dark mode"
        >
          {config.nightMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </Tooltip>

      {/* Fullscreen toggle */}
      <Tooltip
        label={isFullscreen ? t.fullscreenOnTooltip : t.fullscreenOffTooltip}
        withArrow
        position="top"
      >
        <button
          className={styles.toolBtn}
          onClick={toggleFullscreen}
          aria-label="Toggle fullscreen"
        >
          {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </button>
      </Tooltip>
    </div>
  );
};
