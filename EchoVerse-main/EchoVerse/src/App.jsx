import React, { useState, useEffect, useRef } from 'react';
import { Mic, Volume2, Wifi, WifiOff, Settings as SettingsIcon, X, Save, RotateCcw } from 'lucide-react';
import './styles.css';
// Offline dictionary moved inline
const offlineDictionary = {
  es: {
    'hello': 'hola',
    'goodbye': 'adiós',
    'thank you': 'gracias',
    'good morning': 'buenos días',
    'please': 'por favor',
  },
  fr: {
    'hello': 'bonjour',
    'goodbye': 'au revoir',
    'thank you': 'merci',
    'good morning': 'bonjour',
    'please': 's\'il vous plaît',
  },
  de: {
    'hello': 'hallo',
    'goodbye': 'auf wiedersehen',
    'thank you': 'danke',
    'good morning': 'guten morgen',
    'please': 'bitte',
  },
  hi: {
    'hello': 'नमस्ते',
    'goodbye': 'अलविदा',
    'thank you': 'धन्यवाद',
    'good morning': 'सुप्रभात',
    'please': 'कृपया',
  }
};

const VoiceRecorder = ({ onRecordingComplete, isListening, setIsListening }) => {
  const recognition = useRef(null);

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;

      recognition.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onRecordingComplete(transcript);
        setIsListening(false);
      };

      recognition.current.onerror = () => {
        setIsListening(false);
      };
    }
  }, [onRecordingComplete, setIsListening]);

  const startListening = () => {
    if (recognition.current) {
      recognition.current.start();
      setIsListening(true);
    }
  };

  return (
    <button
      onClick={startListening}
      className={`absolute bottom-4 right-4 p-2 rounded-full transition-colors ${
        isListening ? 'bg-red-500' : 'bg-gray-200 hover:bg-gray-300'
      }`}
      title="Voice Input"
    >
      <Mic className={`w-5 h-5 ${isListening ? 'text-white' : 'text-gray-600'}`} />
    </button>
  );
};

const SettingsPanel = ({ isOpen, onClose, settings, onSettingsChange }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Settings</h2>
          <button onClick={onClose} className="p-2">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.enableOfflineMode}
                onChange={(e) => onSettingsChange({
                  ...settings,
                  enableOfflineMode: e.target.checked
                })}
                className="rounded"
              />
              <span>Enable Offline Mode</span>
            </label>
          </div>
          
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.autoSpeak}
                onChange={(e) => onSettingsChange({
                  ...settings,
                  autoSpeak: e.target.checked
                })}
                className="rounded"
              />
              <span>Auto-speak translations</span>
            </label>
          </div>
          
          <div>
            <label className="block mb-2">Speech Rate</label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={settings.speechRate}
              onChange={(e) => onSettingsChange({
                ...settings,
                speechRate: parseFloat(e.target.value)
              })}
              className="w-full"
            />
            <div className="text-center">{settings.speechRate}x</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState({
    enableOfflineMode: true,
    autoSpeak: false,
    speechRate: 1,
  });

  const languages = [
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'ru', name: 'Russian' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hi', name: 'Hindi' }
  ];
  
  const [targetLang, setTargetLang] = useState(languages[0]);
  const synthesis = useRef(window.speechSynthesis);
  const translationHistory = useRef([]);
  const currentHistoryIndex = useRef(-1);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const speakText = (text, lang) => {
    if (synthesis.current) {
      synthesis.current.cancel(); // Stop any current speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = settings.speechRate;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      synthesis.current.speak(utterance);
    }
  };

  const tryOfflineTranslation = (text, langCode) => {
    const lowerText = text.toLowerCase().trim();
    return offlineDictionary[langCode]?.[lowerText] || null;
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      setError('Please enter some text');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      let translatedText;

      // Try offline translation first if enabled or if offline
      if (isOffline || settings.enableOfflineMode) {
        translatedText = tryOfflineTranslation(inputText, targetLang.code);
        
        if (!translatedText && !isOffline) {
          // If online but no offline translation available, use API
          const response = await fetch('http://localhost:5000/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: inputText, targetLang: targetLang.name })
          });

          const data = await response.json();
          if (data.error) throw new Error(data.error);
          translatedText = data.translatedText;
        } else if (!translatedText && isOffline) {
          throw new Error('No offline translation available for this text');
        }
      } else {
        // Online mode
        const response = await fetch('http://localhost:5000/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: inputText, targetLang: targetLang.name })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error);
        translatedText = data.translatedText;
      }

      setOutputText(translatedText);
      translationHistory.current.push({
        input: inputText,
        output: translatedText,
        lang: targetLang
      });
      currentHistoryIndex.current = translationHistory.current.length - 1;

      if (settings.autoSpeak) {
        speakText(translatedText, targetLang.code);
      }
    } catch (err) {
      setError(err.message || 'Translation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUndo = () => {
    if (currentHistoryIndex.current > 0) {
      currentHistoryIndex.current--;
      const previousTranslation = translationHistory.current[currentHistoryIndex.current];
      setInputText(previousTranslation.input);
      setOutputText(previousTranslation.output);
      setTargetLang(previousTranslation.lang);
    }
  };

  const handleRedo = () => {
    if (currentHistoryIndex.current < translationHistory.current.length - 1) {
      currentHistoryIndex.current++;
      const nextTranslation = translationHistory.current[currentHistoryIndex.current];
      setInputText(nextTranslation.input);
      setOutputText(nextTranslation.output);
      setTargetLang(nextTranslation.lang);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <header className="py-8 text-center relative">
        <h1 className="text-4xl font-bold text-white mb-2">EchoVerse</h1>
        <div className="flex justify-center items-center gap-2">
          {isOffline ? (
            <div className="flex items-center text-white bg-red-500 px-3 py-1 rounded-full">
              <WifiOff className="w-4 h-4 mr-2" />
              Offline Mode
            </div>
          ) : (
            <div className="flex items-center text-white bg-green-500 px-3 py-1 rounded-full">
              <Wifi className="w-4 h-4 mr-2" />
              Online
            </div>
          )}
        </div>
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="absolute right-4 top-4 p-2 text-white hover:bg-white/10 rounded-full"
        >
          <SettingsIcon className="w-6 h-6" />
        </button>
      </header>

      <main className="max-w-3xl mx-auto p-6">
        <div className="bg-white/90 backdrop-blur-lg rounded-lg p-6 shadow-xl">
          <div className="flex gap-2 mb-4">
            <button
              onClick={handleUndo}
              disabled={currentHistoryIndex.current <= 0}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
              title="Undo"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <button
              onClick={handleRedo}
              disabled={currentHistoryIndex.current >= translationHistory.current.length - 1}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
              title="Redo"
            >
              <Save className="w-5 h-5" />
            </button>
          </div>

          <div className="relative">
            <textarea
              className="w-full min-h-[150px] p-4 rounded-lg border focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter text to translate..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <VoiceRecorder
              onRecordingComplete={setInputText}
              isListening={isListening}
              setIsListening={setIsListening}
            />
          </div>

          <div className="flex gap-4 my-6">
            <select
              className="flex-1 p-3 rounded-lg border"
              value={targetLang.code}
              onChange={(e) => setTargetLang(languages.find(lang => lang.code === e.target.value))}
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>

            <button
              onClick={handleTranslate}
              disabled={isLoading || !inputText.trim()}
              className="flex-1 bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {isLoading ? 'Translating...' : 'Translate'}
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
              {error}
            </div>
          )}

          {outputText && (
            <div className="relative bg-gray-50 p-4 rounded-lg">
              <p className="mb-8">{outputText}</p>
              <button
                onClick={() => speakText(outputText, targetLang.code)}
                disabled={isSpeaking}
                className={`absolute bottom-4 right-4 p-2 rounded-full ${
                  isSpeaking ? 'bg-purple-500' : 'bg-gray-200 hover:bg-gray-300'
                }`}
                title="Text to Speech"
              >
                <Volume2 className={`w-5 h-5 ${isSpeaking ? 'text-white' : 'text-gray-600'}`} />
              </button>
            </div>
          )}

          <SettingsPanel
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            settings={settings}
            onSettingsChange={setSettings}
          />
        </div>
      </main>
    </div>
  );
};

export default App;