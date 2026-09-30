import React, { useRef, useState, useLayoutEffect } from 'react';
import clsx from 'clsx';
import { TransliterationState } from '@/hooks/useTransliteration';
import styles from './SuggestionDropdown.module.css';

interface SuggestionDropdownProps {
  state: TransliterationState;
  onSelect: (index: number) => void;
  nightMode: boolean;
}

export const SuggestionDropdown: React.FC<SuggestionDropdownProps> = ({
  state,
  onSelect,
  nightMode,
}) => {
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [coords, setCoords] = useState<{ top: number; left: number }>({
    top: state.y + 4,
    left: Math.max(10, state.x),
  });

  useLayoutEffect(() => {
    if (!state.active || (!state.suggestions.length && !state.loading)) {
      return;
    }

    const dropdownEl = dropdownRef.current;
    if (!dropdownEl) return;

    const parentEl = dropdownEl.parentElement;
    const parentWidth = parentEl ? parentEl.clientWidth : window.innerWidth;
    const dropdownWidth = dropdownEl.offsetWidth || 160;

    const top = state.y + 4;
    let left = state.x;

    // Check if dropdown extends beyond right edge of container
    if (left + dropdownWidth > parentWidth - 12) {
      // Flip or clamp left so it aligns gracefully within viewport
      left = Math.max(10, parentWidth - dropdownWidth - 12);
    } else {
      left = Math.max(10, left);
    }

    setCoords({ top, left });
  }, [state.x, state.y, state.active, state.suggestions, state.loading]);

  if (!state.active || (!state.suggestions.length && !state.loading)) {
    return null;
  }

  return (
    <div className={clsx(nightMode && styles.nightmode)}>
      {/* Floating Dropdown clamped within screen/container boundaries */}
      <div
        ref={dropdownRef}
        className={clsx(styles.dropdown, 'animate-fade-in')}
        style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
      >
        {state.suggestions.map((suggestion, index) => {
          const isSelected = index === state.selectedIndex;
          const isCached = suggestion === state.selectedCache;

          return (
            <div
              key={`${suggestion}-${index}`}
              className={clsx(
                styles.item,
                isSelected && styles.selected,
                isCached && styles.cached
              )}
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect(index);
              }}
            >
              <span>{suggestion}</span>
            </div>
          );
        })}

        {state.loading && (
          <div className={styles.loadingItem}>
            <div className="kagaj-loading-dots">
              <div className="kagaj-loading-dot" />
              <div className="kagaj-loading-dot" />
              <div className="kagaj-loading-dot" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
