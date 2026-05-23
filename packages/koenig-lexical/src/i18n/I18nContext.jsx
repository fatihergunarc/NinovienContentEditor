import React from 'react';

import en from './locales/en.json';
import tr from './locales/tr.json';

// Hafif i18n: yeni paket bağımlılığı yerine context + flat key sözlük.
// Bilinmeyen key'de fallback olarak key string'inin kendisini döndürür ki
// eksik çeviri görsel olarak hemen fark edilsin.
const LOCALES = {en, tr};

const I18nContext = React.createContext({locale: 'en', t: (key) => key});

export const I18nProvider = ({locale = 'en', children}) => {
    const resolvedLocale = LOCALES[locale] ? locale : 'en';
    const dict = LOCALES[resolvedLocale];

    const value = React.useMemo(() => ({
        locale: resolvedLocale,
        t: (key) => (dict && dict[key] !== undefined ? dict[key] : key)
    }), [resolvedLocale, dict]);

    return (
        <I18nContext.Provider value={value}>
            {children}
        </I18nContext.Provider>
    );
};

export const useTranslation = () => React.useContext(I18nContext);

export default I18nContext;
