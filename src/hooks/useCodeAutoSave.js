import { useEffect } from 'react';
import { getCodeStorageKey } from '../utils/codeTemplates';

/**
 * Auto-save editor code to localStorage every 10 seconds.
 */
export function useCodeAutoSave(code, language, intervalMs = 10000) {
  useEffect(() => {
    const interval = setInterval(() => {
      if (code) {
        localStorage.setItem(getCodeStorageKey(language), code);
        localStorage.setItem('prayogshala_last_code', code);
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, [code, language, intervalMs]);
}

/**
 * Load saved code when language changes, or apply default template.
 */
export function useCodeLanguageSync(language, setCode, getDefaultCodeFn) {
  useEffect(() => {
    const saved = localStorage.getItem(getCodeStorageKey(language));
    if (saved) {
      setCode(saved);
    } else {
      setCode(getDefaultCodeFn(language));
    }
  }, [language, setCode, getDefaultCodeFn]);
}
