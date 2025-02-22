import {} from '../src';
import './styles/demo.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import content from './content/content.json';
import {
    KoenigComposer,
    MemoizedExtendedKoenigEditor
} from '../src';
import {
    Route,
    HashRouter as Router,
    Routes,
    useLocation
} from 'react-router-dom';
import {fetchEmbed} from './utils/fetchEmbed';
import {fileTypes, useFileUpload} from './utils/useFileUpload';

const KonigComposerDemo = () => {
    const location = useLocation();

    const initialContent = React.useMemo(() => {
        return JSON.stringify(content);
    }, []);
    
    const cardConfig = {
        renderLabels: true,
        siteUrl: window.location.origin,
        membersEnabled: true,
        stripeEnabled: true,
        deprecated: {
            headerV1: true
        },
        feature: {
            collections: true,
            collectionsCard: true,
            contentVisibility: true
        },
        fetchEmbed: fetchEmbed
    };

    const props = {
        cardConfig,
        darkMode: false,
        fileUploader: {useFileUpload: useFileUpload({isMultiplayer: false}), fileTypes},
        initialEditorState: initialContent,
        isSnippetsEnabled: false,
        isTKEnabled: true
    };

    return (
        <div
            key={location.key}
            className={`koenig-lexical top`}
        >
            <KoenigComposer
                {...props}
            >
                <MemoizedExtendedKoenigEditor />
            </KoenigComposer>
        </div>
    );
};

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <Router>
            <Routes>
                <Route element={<KonigComposerDemo />} path="/" />
            </Routes>
        </Router>
    </React.StrictMode>
);
