const cache = {};

export const saveTranslation = async ({ text, sourceLang, targetLang, translatedText }) => {
  const key = `${sourceLang}-${targetLang}-${text}`;
  cache[key] = translatedText;
};

export const getCachedTranslation = async ({ text, sourceLang, targetLang }) => {
  const key = `${sourceLang}-${targetLang}-${text}`;
  return cache[key] ? { translatedText: cache[key] } : null;
};
