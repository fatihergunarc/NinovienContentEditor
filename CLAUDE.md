# NinovienContentEditor

TryGhost/Koenig'in Ninovien için fork'u. Lerna monorepo (18 paket); ana paket `packages/koenig-lexical`.

## Tüketici uygulama

Bu repo bir kütüphane; **NinovienClient** uygulaması bunu npm üzerinden tüketir:

- npm scope: **`@fatih_ergun/koenig-lexical`** (örn. `@fatih_ergun/kg-default-nodes`, `@fatih_ergun/kg-converters` …)
- NinovienClient kodu doğrudan değil, **yayınlanmış paket sürümünü** kullanır → değişikliğin client'a ulaşması için npm publish şart.

## Otomatik npm yayını

`.github/workflows/publish-koenig-lexical.yml` — `main` branch'ine push'ta `packages/koenig-lexical/**` altında değişiklik varsa şunlar otomatik koşar:

1. Build
2. `npm version patch --no-git-tag-version` (her push = patch bump)
3. Bump commit'ini `github-actions[bot]` ile push
4. `npm publish --access public` (NPM_TOKEN secret ile)

Sonuç: **main'e merge = otomatik yayın**. Minor/major bump veya yayın atlamak gerekirse workflow manuel müdahale ister. Diğer `kg-*` paketlerinde bu otomasyon yok.

## NinovienClient'ın bağlı olduğu API yüzeyi

Aşağıdakiler **kırıcı değişiklik kapsamındadır** — signature, sınıf adı veya davranış değiştirilirse NinovienClient kırılır:

### Bileşenler / hook'lar

- `KoenigComposer` — global kapsayıcı. Props: `cardConfig`, `fileUploader`, `darkMode`, `isTKEnabled`, `initialEditorState`, `enableMultiplayer`, `editable`.
- `MemoizedExtendedKoenigEditor` ([packages/koenig-lexical/src/components/ExtendedKoenigEditor.jsx](packages/koenig-lexical/src/components/ExtendedKoenigEditor.jsx)) — Ninovien'e özgü editör sarmalayıcı. Tam yükseklik konteyner, max-width 740px, alta tıklayınca odaklan + caret-bottom, global drag-drop dosya, `editable` prop'u ile salt-okunur mod.
- `useKoenigEditor` ([packages/koenig-lexical/src/utils/useKoenigEditor.js](packages/koenig-lexical/src/utils/useKoenigEditor.js)) — `{getHtml, setHtml}` döner. `getHtml()` Promise'tir.

### Sözleşmeler

- **Veri formatı:** İçerik DB'de **HTML** olarak saklanır (mobiledoc/lexical state JSON değil).
- **CSS:** Tüketici taraf `@fatih_ergun/koenig-lexical/koenig-lexical.css` import etmeli; üst kapsayıcı `koenig-lexical` sınıfına sahip olmalı; render'da `kg-prose` kullanılmalı:
  ```jsx
  <div className="koenig-lexical">
    <div className="kg-prose" dangerouslySetInnerHTML={{__html: html}} />
  </div>
  ```
- **`useFileUpload` sözleşmesi:** Tüketici şu şekilde dönen bir hook sağlar: `{progress, isLoading, upload, errors, filesNumber}`. `upload(files)` başarıda `[{url, fileName}]`, hatada `[{fileName, message}]` döner.
- **`fetchEmbed`:** YouTube / Twitter / Vimeo embed çözümlemesi için `cardConfig.fetchEmbed` fonksiyonu.

## Bilinen tutarsızlıklar

- `README.md` ve `packages/koenig-demo/README.md` install komutu olarak `@zeeshanzahoor/koenig-lexical` gösteriyor; gerçek scope `@fatih_ergun/koenig-lexical`. README güncellenirse düzeltilmeli.

## Geliştirme

```bash
yarn setup        # bağımlılıklar + tüm paketlerin build'i
yarn dev          # koenig-demo'yu ayağa kaldırır
```

`koenig-lexical` üzerinde watch mode için:
```bash
cd packages/koenig-lexical
yarn build --watch
```
