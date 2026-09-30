import { useState, useRef, useCallback, useEffect } from 'react';
import axios from 'axios';
import getCaretCoordinates from 'textarea-caret';
import { useAppStore } from '@/store/useAppStore';
import { offlineEngine } from '@/utils';

export interface TransliterationState {
  active: boolean;
  x: number;
  y: number;
  inputText: string;
  suggestions: string[];
  selectedIndex: number;
  selectedCache: string | null;
  loading: boolean;
}

const PUNCTUATION_REGEX = /[!()[\]{};:'",<>/?@#$%^&*_~।॥\n\r\t]/;
const API_DEBOUNCE_MS = 250; // Delay API call by 250ms; if typing continues, previous request is cancelled

export function useTransliteration(
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
) {
  const { text, setText, memory, rememberWord, config } = useAppStore();
  const [state, setState] = useState<TransliterationState>({
    active: false,
    x: 0,
    y: 0,
    inputText: '',
    suggestions: [],
    selectedIndex: 0,
    selectedCache: null,
    loading: false,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastFetchedWordRef = useRef<string>('');
  const lastCaretPosRef = useRef<number>(0);

  // Sync memory dictionary into offlineEngine
  useEffect(() => {
    if (memory && Object.keys(memory).length > 0) {
      offlineEngine.loadCustomLexicon(memory);
    }
  }, [memory]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Auto expand textarea height to fit content smoothly
  const autoExpand = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.max(240, el.scrollHeight)}px`;
  }, [textareaRef]);

  // Update caret position coordinates for the dropdown
  const updateCaretPosition = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    const caret = getCaretCoordinates(el, el.selectionStart || 0);
    setState((prev) => ({
      ...prev,
      x: caret.left,
      y: caret.top + caret.height,
    }));
  }, [textareaRef]);

  // Fetch suggestions: immediate offline suggestions + debounced background Google API call
  const fetchSuggestions = useCallback(
    (wordToTranslate: string) => {
      if (!config.autoTransliterate) return;

      const trimmed = wordToTranslate.trim();
      if (!trimmed || trimmed === lastFetchedWordRef.current) {
        if (!trimmed) {
          if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
          if (abortControllerRef.current) abortControllerRef.current.abort();
          setState((prev) => ({
            ...prev,
            active: false,
            inputText: '',
            suggestions: [],
            loading: false,
          }));
        }
        return;
      }

      // Check if word contains any delimiter or punctuation
      if (PUNCTUATION_REGEX.test(trimmed)) {
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        if (abortControllerRef.current) abortControllerRef.current.abort();
        setState((prev) => ({ ...prev, active: false, suggestions: [] }));
        return;
      }

      // 1. Clear any pending debounce timer & abort any ongoing API request
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }

      lastFetchedWordRef.current = trimmed;
      const lowerWord = trimmed.toLowerCase();
      const cached = memory[lowerWord] || null;

      // 2. Generate immediate instant offline suggestions (0ms latency, no network)
      const offlineCandidates = offlineEngine.getSuggestions(trimmed, 5);
      if (cached && !offlineCandidates.includes(cached)) {
        offlineCandidates.unshift(cached);
      }
      if (trimmed === '.' && !offlineCandidates.includes('।')) {
        offlineCandidates.unshift('।');
      }

      // Show immediate offline candidates right away
      setState((prev) => ({
        ...prev,
        active: true,
        inputText: trimmed,
        suggestions: offlineCandidates.length ? offlineCandidates : [trimmed],
        selectedIndex: 0,
        selectedCache: cached,
        loading: true,
      }));

      // 3. Debounce the Google Input Tools API call
      // If user types subsequent characters within API_DEBOUNCE_MS (250ms), this call is cancelled
      debounceTimerRef.current = setTimeout(async () => {
        abortControllerRef.current = new AbortController();

        try {
          const url = `https://inputtools.google.com/request?text=${encodeURIComponent(
            trimmed
          )}&itc=ne-t-i0-und&num=5&cp=0&cs=1&ie=utf-8&oe=utf-8`;

          const response = await axios.post(url, null, {
            signal: abortControllerRef.current.signal,
            timeout: 2500, // Fast timeout for seamless offline fallback
          });

          const data = response.data;
          if (Array.isArray(data) && data[0] === 'SUCCESS') {
            const apiSuggestions: string[] = data[1]?.[0]?.[1] || [];
            const merged = [...apiSuggestions];

            // Handle purna biram if typing dot
            if (trimmed === '.' || merged.includes('.')) {
              if (!merged.includes('।')) {
                merged.unshift('।');
              }
            }

            // Add any unique offline candidates
            for (const cand of offlineCandidates) {
              if (!merged.includes(cand)) {
                merged.push(cand);
              }
            }

            if (merged.length === 0) {
              merged.push(trimmed);
            }

            let initialIndex = 0;
            if (cached && merged.includes(cached)) {
              initialIndex = merged.indexOf(cached);
            }

            setState((prev) => ({
              ...prev,
              suggestions: merged.slice(0, 6),
              selectedIndex: initialIndex,
              selectedCache: cached,
              loading: false,
              active: true,
            }));
          } else {
            // Keep offline candidates silently
            setState((prev) => ({
              ...prev,
              loading: false,
              active: true,
            }));
          }
        } catch {
          // When API fails, is aborted, or device is offline: silently keep offline candidates without showing any error
          setState((prev) => ({
            ...prev,
            loading: false,
            active: true,
          }));
        }
      }, API_DEBOUNCE_MS);
    },
    [config.autoTransliterate, memory]
  );

  // Extract the word before the current cursor position
  const getWordAtCursor = useCallback(
    (currentText: string, cursorIndex: number): string => {
      const searchSpace = currentText.slice(0, cursorIndex);
      // Find the last whitespace or newline
      const lastSpaceIndex = Math.max(
        searchSpace.lastIndexOf(' '),
        searchSpace.lastIndexOf('\n'),
        searchSpace.lastIndexOf('\t')
      );
      return searchSpace.slice(lastSpaceIndex + 1);
    },
    []
  );

  // Apply a chosen suggestion into the textarea
  const applySuggestion = useCallback(
    (indexToApply?: number) => {
      const el = textareaRef.current;
      if (!el) return;

      // Clear any pending debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }

      const activeIndex =
        typeof indexToApply === 'number' ? indexToApply : state.selectedIndex;
      const chosenWord = state.suggestions[activeIndex] || state.inputText;

      if (!chosenWord || !state.inputText) {
        setState((prev) => ({ ...prev, active: false, suggestions: [] }));
        return;
      }

      const cursor = el.selectionStart || 0;
      const currentText = el.value;
      const searchSpace = currentText.slice(0, cursor);

      const lastSpaceIndex = Math.max(
        searchSpace.lastIndexOf(' '),
        searchSpace.lastIndexOf('\n'),
        searchSpace.lastIndexOf('\t')
      );

      const prefix = currentText.slice(0, lastSpaceIndex + 1);
      const suffix = currentText.slice(cursor);

      // Construct new text with space after transliterated word
      const newText = `${prefix}${chosenWord} ${suffix}`;
      const newCursorPos = prefix.length + chosenWord.length + 1;

      // Remember preference in store and offline engine
      if (state.inputText.trim()) {
        const cleanRoman = state.inputText.trim().toLowerCase();
        rememberWord(cleanRoman, chosenWord);
        offlineEngine.trie.insert(cleanRoman, chosenWord, 100);
      }

      // Update store text
      setText(newText);
      lastCaretPosRef.current = newCursorPos;

      // Reset suggestion state
      lastFetchedWordRef.current = '';
      setState((prev) => ({
        ...prev,
        active: false,
        inputText: '',
        suggestions: [],
        selectedIndex: 0,
        selectedCache: null,
        loading: false,
      }));

      // Restore focus and cursor position
      requestAnimationFrame(() => {
        if (el) {
          el.focus();
          el.setSelectionRange(newCursorPos, newCursorPos);
          autoExpand();
          updateCaretPosition();
        }
      });
    },
    [
      state.selectedIndex,
      state.suggestions,
      state.inputText,
      textareaRef,
      rememberWord,
      setText,
      autoExpand,
      updateCaretPosition,
    ]
  );

  // Handle input event
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newText = e.target.value;
      setText(newText);
      autoExpand();
      updateCaretPosition();

      const cursor = e.target.selectionStart || 0;
      const currentWord = getWordAtCursor(newText, cursor);

      if (currentWord) {
        fetchSuggestions(currentWord);
      } else {
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        if (abortControllerRef.current) abortControllerRef.current.abort();
        setState((prev) => ({
          ...prev,
          active: false,
          inputText: '',
          suggestions: [],
        }));
      }
    },
    [setText, autoExpand, updateCaretPosition, getWordAtCursor, fetchSuggestions]
  );

  // Handle key navigation and confirmation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (!state.active || state.suggestions.length === 0) return;

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setState((prev) => ({
          ...prev,
          selectedIndex:
            prev.selectedIndex <= 0
              ? prev.suggestions.length - 1
              : prev.selectedIndex - 1,
        }));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setState((prev) => ({
          ...prev,
          selectedIndex:
            prev.selectedIndex >= prev.suggestions.length - 1
              ? 0
              : prev.selectedIndex + 1,
        }));
      } else if (e.key === ' ' || e.key === 'Enter') {
        // Only intercept if we have a valid input word and suggestions
        if (state.inputText.trim()) {
          e.preventDefault();
          applySuggestion();
        }
      } else if (e.key === 'Escape') {
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        if (abortControllerRef.current) abortControllerRef.current.abort();
        setState((prev) => ({ ...prev, active: false }));
      }
    },
    [state.active, state.suggestions, state.inputText, applySuggestion]
  );

  // Dismiss on external click
  const handleMouseDown = useCallback(() => {
    // If user clicked elsewhere in textarea, re-evaluate cursor
    setTimeout(() => {
      const el = textareaRef.current;
      if (!el) return;
      updateCaretPosition();
      const cursor = el.selectionStart || 0;
      const currentWord = getWordAtCursor(el.value, cursor);
      if (currentWord) {
        fetchSuggestions(currentWord);
      } else {
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        if (abortControllerRef.current) abortControllerRef.current.abort();
        setState((prev) => ({ ...prev, active: false }));
      }
    }, 50);
  }, [textareaRef, updateCaretPosition, getWordAtCursor, fetchSuggestions]);

  // Sync textarea height on mount or font size change
  useEffect(() => {
    autoExpand();
  }, [text, autoExpand, config.fontSize]);

  return {
    state,
    setState,
    handleInputChange,
    handleKeyDown,
    handleMouseDown,
    applySuggestion,
    updateCaretPosition,
    autoExpand,
  };
}
