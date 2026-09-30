import { useState, useRef, useCallback, useEffect } from 'react';
import axios from 'axios';
import getCaretCoordinates from 'textarea-caret';
import { useAppStore } from '@/store/useAppStore';

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
  const lastFetchedWordRef = useRef<string>('');
  const lastCaretPosRef = useRef<number>(0);

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

  // Fetch suggestions from Google Input Tools API
  const fetchSuggestions = useCallback(
    async (wordToTranslate: string) => {
      if (!config.autoTransliterate) return;

      const trimmed = wordToTranslate.trim();
      if (!trimmed || trimmed === lastFetchedWordRef.current) {
        if (!trimmed) {
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
        setState((prev) => ({ ...prev, active: false, suggestions: [] }));
        return;
      }

      // Cancel ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      lastFetchedWordRef.current = trimmed;
      const lowerWord = trimmed.toLowerCase();
      const cached = memory[lowerWord] || null;

      setState((prev) => ({
        ...prev,
        active: true,
        inputText: trimmed,
        loading: true,
        selectedCache: cached,
      }));

      try {
        const url = `https://inputtools.google.com/request?text=${encodeURIComponent(
          trimmed
        )}&itc=ne-t-i0-und&num=5&cp=0&cs=1&ie=utf-8&oe=utf-8`;

        const response = await axios.post(url, null, {
          signal: abortControllerRef.current.signal,
        });

        const data = response.data;
        if (Array.isArray(data) && data[0] === 'SUCCESS') {
          const rawSuggestions: string[] = data[1]?.[0]?.[1] || [];
          const suggestions = [...rawSuggestions];

          // Handle purna biram if typing dot or punctuation
          if (trimmed === '.' || suggestions.includes('.')) {
            if (!suggestions.includes('।')) {
              suggestions.unshift('।');
            }
          }

          if (suggestions.length === 0) {
            suggestions.push(trimmed);
          }

          // If there's a cached word preference, prioritize it or mark it
          let initialIndex = 0;
          if (cached && suggestions.includes(cached)) {
            initialIndex = suggestions.indexOf(cached);
          }

          setState((prev) => ({
            ...prev,
            suggestions,
            selectedIndex: initialIndex,
            selectedCache: cached,
            loading: false,
            active: true,
          }));
        } else {
          setState((prev) => ({
            ...prev,
            suggestions: [trimmed],
            selectedIndex: 0,
            loading: false,
            active: true,
          }));
        }
      } catch (err) {
        if (!axios.isCancel(err)) {
          setState((prev) => ({
            ...prev,
            loading: false,
            // Keep fallback suggestion as current input text
            suggestions: prev.suggestions.length ? prev.suggestions : [trimmed],
          }));
        }
      }
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

      // Remember preference in store
      if (state.inputText.trim()) {
        rememberWord(state.inputText.trim(), chosenWord);
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
