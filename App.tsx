
import React, { useState, useCallback, FC, useEffect } from 'react';
import { Language, HistoryEntry } from './types';
import { refinePrompt } from './services/geminiService';
import { MagicWandIcon, ClipboardIcon, CheckIcon, SpinnerIcon, HistoryIcon, TrashIcon, ReuseIcon, CloseIcon } from './constants';

const LanguageSelector: FC<{ selectedLanguage: Language; onLanguageChange: (lang: Language) => void; }> = ({ selectedLanguage, onLanguageChange }) => {
  const languages: Language[] = ['English', 'Bangla'];
  return (
    <div className="flex items-center bg-gray-800 rounded-full p-1">
      {languages.map((lang) => (
        <button
          key={lang}
          onClick={() => onLanguageChange(lang)}
          className={`w-full px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-300 focus:outline-none ${
            selectedLanguage === lang
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-gray-300 hover:bg-gray-700'
          }`}
        >
          {lang}
        </button>
      ))}
    </div>
  );
};

const PromptTextarea: FC<{
  id: string;
  label: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
  isReadOnly?: boolean;
  isLoading?: boolean;
  onCopy?: () => void;
  copySuccess?: boolean;
  onClear?: () => void;
}> = ({ id, label, value, onChange, placeholder, isReadOnly = false, isLoading = false, onCopy, copySuccess, onClear }) => {
  return (
    <div className="relative flex flex-col w-full">
      <div className="flex justify-between items-center mb-2">
        <label htmlFor={id} className="block text-sm font-medium text-gray-300">
          {label}
        </label>
        {isReadOnly && value && onCopy && (
          <button
            onClick={onCopy}
            className="p-1.5 rounded-md hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
            title={copySuccess ? "Copied!" : "Copy to clipboard"}
          >
            {copySuccess ? <CheckIcon /> : <ClipboardIcon />}
          </button>
        )}
      </div>
      <div className="relative w-full h-full">
        <textarea
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          readOnly={isReadOnly}
          className="w-full h-full min-h-[200px] md:min-h-[300px] p-4 pr-10 bg-gray-800 border border-gray-700 rounded-xl resize-none text-white placeholder-gray-500 transition-all duration-300 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
        />
        {!isReadOnly && value && onClear && (
            <button
                onClick={onClear}
                className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                title="Clear text"
            >
                <CloseIcon />
            </button>
        )}
        {isLoading && isReadOnly && (
          <div className="absolute inset-0 bg-gray-800 bg-opacity-70 flex items-center justify-center rounded-xl">
            <div className="text-center">
                <SpinnerIcon />
                <p className="text-gray-300 mt-2">Generating perfect prompt...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const HistoryItem: FC<{
  item: HistoryEntry;
  onUse: (item: HistoryEntry) => void;
  onDelete: (id: string) => void;
}> = ({ item, onUse, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(item.outputPrompt);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };
  
  return (
    <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700 space-y-3 transition-all">
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
          <p className="font-semibold text-white truncate pr-2">{item.inputPrompt}</p>
          <p className="text-xs text-gray-400">
            {new Date(item.timestamp).toLocaleString()} &middot; {item.language}
          </p>
        </div>
        <div className="flex items-center shrink-0">
          <button onClick={() => onUse(item)} title="Use this prompt" className="p-1.5 rounded-md hover:bg-gray-700 text-gray-300 hover:text-white"><ReuseIcon /></button>
          <button onClick={() => onDelete(item.id)} title="Delete" className="p-1.5 rounded-md hover:bg-gray-700 text-red-400 hover:text-red-300"><TrashIcon /></button>
        </div>
      </div>
      {isExpanded && (
        <div className="space-y-3 pt-3 border-t border-gray-700/50 animate-fade-in">
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-1">Your Idea:</h4>
            <p className="text-sm text-gray-300 bg-gray-800 p-2 rounded">{item.inputPrompt}</p>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <h4 className="text-sm font-medium text-gray-400">Perfect Prompt:</h4>
              <button onClick={handleCopy} title="Copy" className="p-1.5 rounded-md hover:bg-gray-700 text-gray-400">
                {isCopied ? <CheckIcon /> : <ClipboardIcon />}
              </button>
            </div>
            <p className="text-sm text-gray-200 bg-gray-800 p-2 rounded max-h-40 overflow-y-auto whitespace-pre-wrap">{item.outputPrompt}</p>
          </div>
        </div>
      )}
    </div>
  );
};


const HistoryPanel: FC<{
  isOpen: boolean;
  onClose: () => void;
  history: HistoryEntry[];
  onUse: (item: HistoryEntry) => void;
  onDelete: (id: string) => void;
}> = ({ isOpen, onClose, history, onUse, onDelete }) => {
  return (
    <div className={`fixed inset-0 z-50 transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
      <div className="absolute inset-0 bg-black/60" onClick={onClose}></div>
      <div className={`absolute top-0 right-0 h-full w-full max-w-md bg-gray-800 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex justify-between items-center p-4 border-b border-gray-700 shrink-0">
          <h2 className="text-xl font-bold text-white">Prompt History</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700 text-gray-300 hover:text-white">
            <CloseIcon />
          </button>
        </div>
        {history.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-center p-4">
            <p>No history yet. Generate a prompt to get started!</p>
          </div>
        ) : (
          <ul className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-3">
            {history.map(item => (
              <li key={item.id}>
                <HistoryItem item={item} onUse={onUse} onDelete={onDelete} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

const App: FC = () => {
  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [outputPrompt, setOutputPrompt] = useState<string>('');
  const [language, setLanguage] = useState<Language>('English');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('promptHistory');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.error("Failed to parse history from localStorage", e);
      localStorage.removeItem('promptHistory');
    }
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!inputPrompt.trim()) {
      setError('Please enter a prompt idea first.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setOutputPrompt('');
    
    const result = await refinePrompt(inputPrompt, language);
    
    if (result.startsWith('Error:')) {
      setError(result);
    } else {
      setOutputPrompt(result);
       const newEntry: HistoryEntry = {
          id: `hist-${Date.now()}`,
          inputPrompt,
          outputPrompt: result,
          language,
          timestamp: Date.now(),
      };
      setHistory(prevHistory => {
          const updatedHistory = [newEntry, ...prevHistory];
          localStorage.setItem('promptHistory', JSON.stringify(updatedHistory));
          return updatedHistory;
      });
    }
    
    setIsLoading(false);
  }, [inputPrompt, language]);

  const handleCopy = useCallback(() => {
    if (outputPrompt) {
      navigator.clipboard.writeText(outputPrompt);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  }, [outputPrompt]);

  const handleDeleteHistoryItem = useCallback((id: string) => {
    setHistory(prev => {
        const updatedHistory = prev.filter(item => item.id !== id);
        localStorage.setItem('promptHistory', JSON.stringify(updatedHistory));
        return updatedHistory;
    });
  }, []);

  const handleUseHistoryItem = useCallback((item: HistoryEntry) => {
    setInputPrompt(item.inputPrompt);
    setOutputPrompt(item.outputPrompt);
    setLanguage(item.language);
    setIsHistoryPanelOpen(false);
  }, []);

  const handleClearAll = useCallback(() => {
    setInputPrompt('');
    setOutputPrompt('');
    setError(null);
  }, []);

  return (
    <>
      <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-6xl mx-auto">
          <header className="relative text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-500">
              AI Prompt Perfecter
            </h1>
            <p className="mt-3 text-lg text-gray-400 max-w-2xl mx-auto">
              Transform your simple ideas into powerful, detailed prompts for any AI model.
            </p>
            <button
              onClick={() => setIsHistoryPanelOpen(true)}
              className="absolute top-0 right-0 flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-300 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
              title="View prompt history"
            >
              <HistoryIcon />
              <span className="hidden sm:inline">History</span>
            </button>
          </header>

          <main className="flex flex-col gap-8">
            <div className="w-full max-w-xs mx-auto">
              <LanguageSelector selectedLanguage={language} onLanguageChange={setLanguage} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <PromptTextarea
                id="input-prompt"
                label="Your Prompt Idea"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                placeholder="e.g., a logo for a coffee shop"
                onClear={() => setInputPrompt('')}
              />
              <PromptTextarea
                id="output-prompt"
                label="Perfect Prompt"
                value={outputPrompt}
                placeholder="AI will generate the perfect prompt here..."
                isReadOnly={true}
                isLoading={isLoading}
                onCopy={handleCopy}
                copySuccess={copySuccess}
              />
            </div>

            {error && (
              <div className="text-center p-3 bg-red-900/50 text-red-300 border border-red-700 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex justify-center items-center gap-4 mt-4">
              <button
                onClick={handleGenerate}
                disabled={isLoading || !inputPrompt.trim()}
                className="flex items-center justify-center gap-2 px-8 py-3 text-lg font-bold text-white bg-indigo-600 rounded-full hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 shadow-lg disabled:shadow-none"
              >
                {isLoading ? <SpinnerIcon /> : <MagicWandIcon />}
                <span>{isLoading ? 'Generating...' : 'Generate Perfect Prompt'}</span>
              </button>
              <button
                onClick={handleClearAll}
                disabled={!inputPrompt && !outputPrompt && !error}
                className="p-3 text-gray-300 bg-gray-800 rounded-full hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-600/50"
                title="Clear all fields and messages"
                aria-label="Clear all fields and messages"
              >
                <TrashIcon />
              </button>
            </div>
          </main>
        </div>
      </div>
      <HistoryPanel
        isOpen={isHistoryPanelOpen}
        onClose={() => setIsHistoryPanelOpen(false)}
        history={history}
        onUse={handleUseHistoryItem}
        onDelete={handleDeleteHistoryItem}
      />
    </>
  );
};

export default App;
