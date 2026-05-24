import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';

// `ResizeObserver loop completed with undelivered notifications` —
// spec gereği zararsız bir tarayıcı uyarısı (callback frame'de bitmediğinde
// yayılır). CRA dev-server overlay'i bunu hata gibi gösteriyor; demo
// deneyimini bozmaması için yakalayıp susturuyoruz. Capture phase: CRA
// overlay listener'ından önce çalışıp stopImmediatePropagation ile kesiyoruz.
// Kütüphane (koenig-lexical) dokunulmamıştır; bu sadece demo overlay'i içindir.
window.addEventListener('error', (e) => {
    if (e.message && e.message.includes('ResizeObserver loop')) {
        e.stopImmediatePropagation();
        e.preventDefault();
    }
}, true);

const root = createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App/>
    </React.StrictMode>
);
