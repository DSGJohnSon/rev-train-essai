import { PseudonymData, StoredQuizSettings, StoredRevisionSettings } from '@/types/session';

// Clés localStorage
const KEYS = {
  PSEUDONYM: 'rev-train-pseudonym',
  QUIZ_SETTINGS: 'rev-train-quiz-settings',
  REVISION_SETTINGS: 'rev-train-revision-settings',
} as const;

// ============================================
// PSEUDONYME
// ============================================

export function getPseudonym(): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const data = localStorage.getItem(KEYS.PSEUDONYM);
    if (!data) return null;
    
    const parsed: PseudonymData = JSON.parse(data);
    return parsed.pseudonym;
  } catch (error) {
    console.error('Error reading pseudonym from localStorage:', error);
    return null;
  }
}

export function setPseudonym(pseudonym: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const data: PseudonymData = {
      pseudonym,
      lastUsed: new Date().toISOString(),
    };
    localStorage.setItem(KEYS.PSEUDONYM, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving pseudonym to localStorage:', error);
  }
}

export function clearPseudonym(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(KEYS.PSEUDONYM);
  } catch (error) {
    console.error('Error clearing pseudonym from localStorage:', error);
  }
}

// ============================================
// PARAMÈTRES QUIZ
// ============================================

export function getQuizSettings(): StoredQuizSettings | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const data = localStorage.getItem(KEYS.QUIZ_SETTINGS);
    if (!data) return null;
    
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading quiz settings from localStorage:', error);
    return null;
  }
}

export function setQuizSettings(settings: Omit<StoredQuizSettings, 'lastUsed'>): void {
  if (typeof window === 'undefined') return;
  
  try {
    const data: StoredQuizSettings = {
      ...settings,
      lastUsed: new Date().toISOString(),
    };
    localStorage.setItem(KEYS.QUIZ_SETTINGS, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving quiz settings to localStorage:', error);
  }
}

export function clearQuizSettings(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(KEYS.QUIZ_SETTINGS);
  } catch (error) {
    console.error('Error clearing quiz settings from localStorage:', error);
  }
}

// ============================================
// PARAMÈTRES RÉVISION
// ============================================

export function getRevisionSettings(): StoredRevisionSettings | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const data = localStorage.getItem(KEYS.REVISION_SETTINGS);
    if (!data) return null;
    
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading revision settings from localStorage:', error);
    return null;
  }
}

export function setRevisionSettings(settings: Omit<StoredRevisionSettings, 'lastUsed'>): void {
  if (typeof window === 'undefined') return;
  
  try {
    const data: StoredRevisionSettings = {
      ...settings,
      lastUsed: new Date().toISOString(),
    };
    localStorage.setItem(KEYS.REVISION_SETTINGS, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving revision settings to localStorage:', error);
  }
}

export function clearRevisionSettings(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(KEYS.REVISION_SETTINGS);
  } catch (error) {
    console.error('Error clearing revision settings from localStorage:', error);
  }
}

// ============================================
// UTILITAIRES
// ============================================

export function clearAllSettings(): void {
  clearPseudonym();
  clearQuizSettings();
  clearRevisionSettings();
}