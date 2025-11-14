export type Language = 'Bangla' | 'English';

export type HistoryEntry = {
  id: string;
  inputPrompt: string;
  outputPrompt: string;
  language: Language;
  timestamp: number;
};
