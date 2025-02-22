import './App.css';
import {KonigComposerDemo} from './Demo'
import React from 'react';

import {fetchEmbed} from './utils/fetchEmbed';

// bu css dosyasi editorun tasarimi icin kullanilir.
import '@zeeshanzahoor/koenig-lexical/koenig-lexical.css'

// KoenigComposer bir React Context Provider'i olarak calisir ve editorun butun ozelliklerini saglar.
// Bu componenti Editorun disinda eklenmelidir
import {
  KoenigComposer,
} from '@zeeshanzahoor/koenig-lexical';

// file uploader icin kullanilan hook
import {fileTypes, useFileUpload} from './utils/useFileUpload';

const App = () => {
  // bunlar default olarak kullanilan config
  const cardConfig = {
      renderLabels: true,
      siteUrl: window.location.origin,
      membersEnabled: true,
      stripeEnabled: true,
      deprecated: {
          headerV1: true
      },
      feature: {
          collections: false,
          collectionsCard: false,
          contentVisibility: true
      },
      fetchEmbed: fetchEmbed,
  };

  const props = {
      cardConfig,
      darkMode: false,
      fileUploader: {useFileUpload: useFileUpload({isMultiplayer: false}), fileTypes},
      isSnippetsEnabled: false,
      isTKEnabled: true,
  };

  return (
      <div>
        <KoenigComposer {...props}>
          <KonigComposerDemo />
        </KoenigComposer>
      </div>
  );
};

export default App;

