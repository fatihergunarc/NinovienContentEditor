# Yarım/Float Görsel Implementasyon Planı

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Koenig Image kartına `half-left` / `half-right` genişlik seçeneği eklemek — görsel kolonun ~%50'sini kaplar, gövde metni yanından akar; dar ekranda tam genişliğe yığılır.

**Architecture:** `cardWidth` değeri birleşik string (`'half-left'`/`'half-right'`). Renderer sınıfı (`kg-width-${cardWidth}`) zaten generic olduğundan otomatik `kg-width-half-left` üretir; tek zorunlu çekirdek kod değişikliği parser regex'inin bu değerleri geri okuyabilmesi (roundtrip). Editör önizlemesi Tailwind `CARD_WIDTH_CLASSES` ile, yayınlanan render `.koenig-lexical .kg-prose` altındaki float CSS ile çalışır.

**Tech Stack:** Lerna monorepo; `@fatih_ergun/kg-default-nodes` (lexical node/renderer/parser, mocha+c8), `@fatih_ergun/koenig-lexical` (React/Vite, Tailwind, vite-plugin-svgr), `koenig-demo` (Vite demo).

**Referans spec:** `docs/superpowers/specs/2026-06-10-half-float-image-design.md`

---

## Dosya yapısı (dokunulacaklar)

**Çekirdek (özelliği çalışır kılan):**
- `packages/kg-default-nodes/lib/nodes/image/image-parser.js` — roundtrip regex (KRİTİK)
- `packages/kg-default-nodes/test/nodes/image.test.js` — roundtrip + regresyon testleri
- `packages/koenig-lexical/src/assets/icons/kg-img-half-left.svg` — yeni (oluştur)
- `packages/koenig-lexical/src/assets/icons/kg-img-half-right.svg` — yeni (oluştur)
- `packages/koenig-lexical/src/components/ui/ToolbarMenu.jsx` — ikon import + kaydı
- `packages/koenig-lexical/src/nodes/ImageNodeComponent.jsx` — iki toolbar düğmesi
- `packages/koenig-lexical/src/components/ui/CardWrapper.jsx` — editör float class + PropTypes
- `packages/koenig-lexical/src/styles/components/kg-prose.css` — yayınlanan render float CSS
- `packages/koenig-demo/src/kg-standart.css` — demo + NinovienClient kopya referansı

**Renderer değişikliği GEREKMEZ:** `image-renderer.js` zaten `kg-width-${node.cardWidth}` üretir; `half-left`/`half-right` otomatik çıkar. (`sizes` ipucu yarım için eklenmez — zararsız, YAGNI.)

**Opsiyonel (legacy mobiledoc yolu, Task 7):** `packages/kg-parser-plugins/lib/cards/image.js` — HTML-saklayan tüketici için GEREKMEZ.

---

## Task 1: Parser roundtrip fix (kg-default-nodes) — KRİTİK

**Files:**
- Test: `packages/kg-default-nodes/test/nodes/image.test.js` (importDOM describe bloğu, ≈satır 365'ten sonra; rendering describe bloğu, ≈satır 198'den sonra)
- Modify: `packages/kg-default-nodes/lib/nodes/image/image-parser.js:24`

- [ ] **Step 1: Başarısız roundtrip testlerini yaz**

`packages/kg-default-nodes/test/nodes/image.test.js` içinde, `it('extracts Medium card widths', ...)` testinin (≈satır 377) hemen ardına ekle:

```js
        it('extracts Koenig half-left card width', editorTest(function () {
            const document = createDocument(html`
                <figure class="kg-card kg-image-card kg-width-half-left">
                    <img src="http://example.com/test.png">
                </figure>
            `);
            const nodes = $generateNodesFromDOM(editor, document);
            nodes.length.should.equal(1);
            nodes[0].cardWidth.should.equal('half-left');
        }));

        it('extracts Koenig half-right card width', editorTest(function () {
            const document = createDocument(html`
                <figure class="kg-card kg-image-card kg-width-half-right">
                    <img src="http://example.com/test.png">
                </figure>
            `);
            const nodes = $generateNodesFromDOM(editor, document);
            nodes.length.should.equal(1);
            nodes[0].cardWidth.should.equal('half-right');
        }));
```

- [ ] **Step 2: Testi çalıştır, BAŞARISIZ olduğunu doğrula**

Run: `cd packages/kg-default-nodes && ./node_modules/.bin/mocha test/nodes/image.test.js --grep "half"`
Expected: 2 FAIL — `AssertionError: expected 'regular' to equal 'half-left'` (parser değeri tanımıyor, default 'regular'a düşüyor).

- [ ] **Step 3: Regex'i genişlet**

`packages/kg-default-nodes/lib/nodes/image/image-parser.js` satır 24'ü değiştir:

```js
                        const kgClass = domNode.className.match(/kg-width-(wide|full|half-left|half-right)/);
```

(Diğer satırlar aynı kalır; `payload.cardWidth = kgClass[1];` yakalanan grubu aynen atar.)

- [ ] **Step 4: Testi çalıştır, GEÇTİĞİNİ doğrula**

Run: `cd packages/kg-default-nodes && ./node_modules/.bin/mocha test/nodes/image.test.js --grep "half"`
Expected: 2 passing.

- [ ] **Step 5: exportDOM regresyon testini ekle**

Renderer'ın zaten doğru sınıfı ürettiğini kilitle. `it('renders a wide image', ...)` testinin (≈satır 198) ardına ekle:

```js
        it('renders a half-left image', editorTest(function () {
            dataset.cardWidth = 'half-left';
            const imageNode = $createImageNode(dataset);
            const {element} = imageNode.exportDOM(exportOptions);

            element.classList.contains('kg-width-half-left').should.be.true();
        }));

        it('renders a half-right image', editorTest(function () {
            dataset.cardWidth = 'half-right';
            const imageNode = $createImageNode(dataset);
            const {element} = imageNode.exportDOM(exportOptions);

            element.classList.contains('kg-width-half-right').should.be.true();
        }));
```

- [ ] **Step 6: İmaj test dosyasının tamamını çalıştır**

Run: `cd packages/kg-default-nodes && ./node_modules/.bin/mocha test/nodes/image.test.js`
Expected: tüm testler passing (yeni 4 dahil).

- [ ] **Step 7: Commit**

```bash
cd /Users/hasilm/Downloads/App/Ninovien/NinovienContentEditor
git add packages/kg-default-nodes/lib/nodes/image/image-parser.js packages/kg-default-nodes/test/nodes/image.test.js
git commit -m "feat(kg-default-nodes): parse half-left/half-right image card width"
```

---

## Task 2: Toolbar ikonları (koenig-lexical)

**Files:**
- Create: `packages/koenig-lexical/src/assets/icons/kg-img-half-left.svg`
- Create: `packages/koenig-lexical/src/assets/icons/kg-img-half-right.svg`
- Modify: `packages/koenig-lexical/src/components/ui/ToolbarMenu.jsx` (importlar ≈satır 7-10; `TOOLBAR_ICONS` ≈satır 30-32)

> Not: İkonların görsel doğrulaması Task 5'te (preview) yapılır; bu task yapısal. SVG'ler mevcut `kg-img-regular.svg` konvansiyonuna birebir uyar: `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`, ikincil çizgiler `stroke-opacity=".5"`, sabit renk/boyut YOK.

- [ ] **Step 1: Sol yarım ikonunu oluştur**

`packages/koenig-lexical/src/assets/icons/kg-img-half-left.svg`:

```xml
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M11 8H1v8h10V8Z"/>
  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-opacity=".5" d="M15 9.5h8M15 12h8M15 14.5h5"/>
</svg>
```

- [ ] **Step 2: Sağ yarım ikonunu oluştur**

`packages/koenig-lexical/src/assets/icons/kg-img-half-right.svg`:

```xml
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M13 8h10v8H13V8Z"/>
  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-opacity=".5" d="M1 9.5h8M1 12h8M1 14.5h5"/>
</svg>
```

- [ ] **Step 3: İkonları import et ve kaydet**

`packages/koenig-lexical/src/components/ui/ToolbarMenu.jsx` — `ImgFullIcon` importunun (satır 7) ardına iki import ekle:

```js
import ImgHalfLeftIcon from '../../assets/icons/kg-img-half-left.svg?react';
import ImgHalfRightIcon from '../../assets/icons/kg-img-half-right.svg?react';
```

Aynı dosyada `TOOLBAR_ICONS` nesnesinde `imgFull: ImgFullIcon,` satırının (≈satır 32) ardına ekle:

```js
    imgHalfLeft: ImgHalfLeftIcon,
    imgHalfRight: ImgHalfRightIcon,
```

- [ ] **Step 4: Build kırılmıyor mu — hızlı doğrula**

Run: `cd packages/koenig-lexical && ./node_modules/.bin/eslint src/components/ui/ToolbarMenu.jsx`
Expected: hata yok (import sırası/lint temiz). Lint uyarısı çıkarsa import'ları alfabetik sıraya göre yerleştir.

- [ ] **Step 5: Commit**

```bash
cd /Users/hasilm/Downloads/App/Ninovien/NinovienContentEditor
git add packages/koenig-lexical/src/assets/icons/kg-img-half-left.svg packages/koenig-lexical/src/assets/icons/kg-img-half-right.svg packages/koenig-lexical/src/components/ui/ToolbarMenu.jsx
git commit -m "feat(koenig-lexical): add half-left/half-right toolbar icons"
```

---

## Task 3: Toolbar düğmeleri + editör genişlik class'ı + PropTypes (koenig-lexical)

**Files:**
- Modify: `packages/koenig-lexical/src/components/ui/CardWrapper.jsx` (`CARD_WIDTH_CLASSES` ≈satır 4-11; `propTypes` ≈satır 74)
- Modify: `packages/koenig-lexical/src/nodes/ImageNodeComponent.jsx` (genişlik ToolbarMenu, Full düğmesinden sonra ≈satır 279)

- [ ] **Step 1: Editör genişlik class'larını ekle**

`packages/koenig-lexical/src/components/ui/CardWrapper.jsx` — `CARD_WIDTH_CLASSES` nesnesine `full:` satırından sonra ekle (satır 10 ardından, virgül ekleyerek):

```js
const CARD_WIDTH_CLASSES = {
    wide: [
        'w-[calc(75vw-var(--kg-breakout-adjustment-with-fallback)+2px)] mx-[calc(50%-(50vw-var(--kg-breakout-adjustment-with-fallback))-.8rem)] min-w-[calc(100%+3.6rem)] translate-x-[calc(50vw-50%+.8rem-var(--kg-breakout-adjustment-with-fallback))]',
        'md:min-w-[calc(100%+10rem)]',
        'lg:min-w-[calc(100%+18rem)]'
    ].join(' '),
    full: 'inset-x-[-1px] mx-[calc(50%-50vw)] w-[calc(100vw+2px)] lg:mx-[calc(50%-50vw+(var(--kg-breakout-adjustment-with-fallback)/2))] lg:w-[calc(100vw-var(--kg-breakout-adjustment-with-fallback)+2px)]',
    'half-left': 'float-left w-1/2 mr-6 mb-3',
    'half-right': 'float-right w-1/2 ml-6 mb-3'
};
```

- [ ] **Step 2: PropTypes enum'unu genişlet**

Aynı dosyada `propTypes` içinde (≈satır 74):

```js
    cardWidth: PropTypes.oneOf(['regular', 'wide', 'full', 'half-left', 'half-right']),
```

- [ ] **Step 3: İki toolbar düğmesini ekle**

`packages/koenig-lexical/src/nodes/ImageNodeComponent.jsx` — "Full width" `ToolbarMenuItem`'ın (≈satır 273-279) hemen ardına, `<ToolbarMenuSeparator hide={isGif(src)} />` (≈satır 280) ÖNCESİNE ekle:

```jsx
                    <ToolbarMenuItem
                        hide={isGif(src)}
                        icon="imgHalfLeft"
                        isActive={cardWidth === 'half-left'}
                        label="Half width, left"
                        onClick={() => handleImageCardResize('half-left')}
                    />
                    <ToolbarMenuItem
                        hide={isGif(src)}
                        icon="imgHalfRight"
                        isActive={cardWidth === 'half-right'}
                        label="Half width, right"
                        onClick={() => handleImageCardResize('half-right')}
                    />
```

- [ ] **Step 4: Lint doğrula**

Run: `cd packages/koenig-lexical && ./node_modules/.bin/eslint src/components/ui/CardWrapper.jsx src/nodes/ImageNodeComponent.jsx`
Expected: hata yok.

- [ ] **Step 5: Commit**

```bash
cd /Users/hasilm/Downloads/App/Ninovien/NinovienContentEditor
git add packages/koenig-lexical/src/components/ui/CardWrapper.jsx packages/koenig-lexical/src/nodes/ImageNodeComponent.jsx
git commit -m "feat(koenig-lexical): half-left/half-right image toolbar buttons + editor preview"
```

---

## Task 4: Render CSS (yayınlanan kg-prose.css + demo kg-standart.css)

**Files:**
- Modify: `packages/koenig-lexical/src/styles/components/kg-prose.css` (`.koenig-lexical { .kg-prose { ... } }` nested bloğunun içine, "Cards in general" kuralları sonrası ≈satır 684 ardına)
- Modify: `packages/koenig-demo/src/kg-standart.css` (mevcut `.kg-prose .kg-card.kg-width-wide/full` kurallarının yanına)

> Önemli: kg-prose.css `.koenig-lexical { .kg-prose { … } }` şeklinde nested; tüketici de `<div class="koenig-lexical"><div class="kg-prose">` ile render eder, yani nested kural tüketiciye uyar. Render figürü `kg-width-half-left` CLASS'ı taşır (editör figürü `data-kg-card-width` attribute'u taşır → çakışma yok).

- [ ] **Step 1: Yayınlanan render CSS'ini ekle**

`packages/koenig-lexical/src/styles/components/kg-prose.css` — `.kg-prose { ... }` bloğunun İÇİNDE, satır 684'teki `full + full` kuralından sonra (satır 685 boş satırın ardına) ekle (girinti mevcut bloğa uysun):

```css
        /* Half / float image cards (rendered output)
        /* -------------------------------------------------------------------- */

        figure.kg-card.kg-width-half-left,
        figure.kg-card.kg-width-half-right {
            width: 50%;
            max-width: 50%;
            box-sizing: border-box;
        }

        figure.kg-card.kg-width-half-left img,
        figure.kg-card.kg-width-half-right img {
            display: block;
            width: 100%;
            height: auto;
        }

        figure.kg-card.kg-width-half-left {
            float: left;
            margin: 0.4em 1.6em 0.8em 0;
        }

        figure.kg-card.kg-width-half-right {
            float: right;
            margin: 0.4em 0 0.8em 1.6em;
        }

        @media (max-width: 500px) {
            figure.kg-card.kg-width-half-left,
            figure.kg-card.kg-width-half-right {
                float: none;
                width: 100%;
                max-width: 100%;
                margin-left: 0;
                margin-right: 0;
            }
        }
```

- [ ] **Step 2: Demo + NinovienClient referans CSS'ini ekle**

`packages/koenig-demo/src/kg-standart.css` — mevcut `.kg-prose .kg-card.kg-width-full { ... }` kuralının ardına ekle (bu dosya flat, nested değil):

```css
.kg-prose .kg-card.kg-width-half-left,
.kg-prose .kg-card.kg-width-half-right {
    width: 50%;
    max-width: 50%;
    box-sizing: border-box;
}
.kg-prose .kg-card.kg-width-half-left {
    float: left;
    margin: 0.4em 1.6em 0.8em 0;
}
.kg-prose .kg-card.kg-width-half-right {
    float: right;
    margin: 0.4em 0 0.8em 1.6em;
}
@media (max-width: 500px) {
    .kg-prose .kg-card.kg-width-half-left,
    .kg-prose .kg-card.kg-width-half-right {
        float: none;
        width: 100%;
        max-width: 100%;
        margin-left: 0;
        margin-right: 0;
    }
}
```

(Görselin %100 figür genişliğini doldurması için `.kg-prose figure.kg-card img { display:block; width:100% }` kuralı kg-standart.css'te zaten var.)

- [ ] **Step 3: CSS sözdizimi/build doğrula**

Run: `cd packages/koenig-lexical && ./node_modules/.bin/vite build 2>&1 | tail -20`
Expected: build başarılı, CSS hatası yok. `dist/index.css` üretilir.

- [ ] **Step 4: Üretilen bundle float kuralını içeriyor mu — doğrula**

Run: `cd packages/koenig-lexical && grep -c "kg-width-half-left" dist/index.css`
Expected: ≥1 (kural yayınlanan bundle'a girdi).

- [ ] **Step 5: Commit**

```bash
cd /Users/hasilm/Downloads/App/Ninovien/NinovienContentEditor
git add packages/koenig-lexical/src/styles/components/kg-prose.css packages/koenig-demo/src/kg-standart.css
git commit -m "feat(koenig-lexical): half/float image render CSS (kg-prose + demo)"
```

---

## Task 5: Uçtan uca doğrulama (koenig-demo, preview araçları)

> Bu task kod yazmaz; özelliği gerçek editörde doğrular. Sorun bulunursa ilgili kaynağı düzelt, ilgili Task'a dön, yeniden doğrula. `preview_*` araçları kullanılır; Bash ile dev server başlatma.

**Files:** (doğrulama; gerekirse Task 3/4 dosyalarına dönülür)

- [ ] **Step 1: Demo'yu derleyip ayağa kaldır**

`koenig-lexical` build edilmiş olmalı (Task 4 Step 3). Sonra `preview_start` ile demo dev server'ı başlat (kök `yarn dev` koenig-demo'yu kaldırır). Hangi komutun çalıştığını `preview_*` çıktısından doğrula.

- [ ] **Step 2: Editörde görsel ekle ve yarım-sol uygula**

Editöre bir görsel ekle (URL veya yükleme), görseli seç, toolbar'da **Half width, left** düğmesine tıkla.
- `preview_snapshot`: toolbar'da iki yeni düğme görünüyor, sol aktif (yeşil).
- `preview_console_logs`: PropTypes uyarısı / hata YOK.
- Beklenen editör davranışı: görsel ~%50, takip eden paragraf yanından akıyor. **Eğer editörde sarma bozuksa** (kartlar blok-decorator olduğundan riskli — spec §8), CARD_WIDTH_CLASSES'taki Tailwind'i preview ile ayarla; sarma editörde mümkün değilse fallback olarak görseli %50 genişlikte (sarmasız) bırak ve render'ın otorite olduğunu not et.

- [ ] **Step 3: Üretilen HTML'i doğrula (roundtrip export)**

Demo'nun HTML çıktısını al (demo'da çıktı paneli yoksa `preview_eval` ile editör API'sinden `getHtml()` çağır). 
Expected: `<figure class="kg-card kg-image-card kg-width-half-left">…</figure>`.

- [ ] **Step 4: Render edilmiş float'ı doğrula**

Bu HTML'i `.koenig-lexical .kg-prose` kapsayıcısında render et (demo'nun render görünümü veya `preview_eval` ile geçici bir DOM). `preview_inspect` ile figür `float: left; width: 50%` olduğunu, takip eden paragrafın sardığını teyit et. `preview_screenshot` ile kanıt al.

- [ ] **Step 5: Sağ varyant + dar ekran**

- Half width, right uygula → figür sağa float, metin solda sarıyor.
- `preview_resize` ile genişliği ≤500px yap → float kapanıyor, görsel tam genişlik, metnin üstüne yığılıyor. `preview_screenshot` ile kanıt.

- [ ] **Step 6: Roundtrip re-import**

Üretilen `kg-width-half-left` HTML'ini editöre geri yükle (`setHtml`) → görsel hâlâ yarım-sol (toolbar'da sol aktif), `regular`'a düşmüyor. (Task 1 testini canlı doğrular.)

- [ ] **Step 7: Bulguları özetle / gerekirse düzelt-tekrarla**

Tüm adımlar yeşilse Task 6'ya geç. Değilse: kaynağı düzelt → ilgili Task'ı yeniden çalıştır → bu task'ı baştan doğrula. Hiçbir adımı "muhtemelen çalışır" diye atlama — ekran görüntüsü/inspect ile kanıt şart.

---

## Task 6: Build + yayın runbook (MANUEL — kullanıcı çalıştırır)

> ⚠️ Bu task npm publish içerir (dışa dönük, geri alması zor). **Ajan otomatik çalıştırmaz**; kullanıcı çalıştırır. Sıra kritik (spec §6): kg-default-nodes ÖNCE yayınlanmalı, yoksa koenig-lexical CI eski parser'ı bundle eder.

- [ ] **Step 1: kg-default-nodes'u build et ve npm'e yayınla**

```bash
cd /Users/hasilm/Downloads/App/Ninovien/NinovienContentEditor/packages/kg-default-nodes
yarn build                       # lib -> es/cjs (parser fix'i build çıktısına girer)
npm version patch --no-git-tag-version   # 1.0.0 -> 1.0.1
npm publish --access public      # @fatih_ergun/kg-default-nodes (npm login/token gerekir)
```

- [ ] **Step 2: koenig-lexical'ın yeni sürümü çektiğini doğrula**

koenig-lexical `^1.0.0` aralığı 1.0.1'i kapsar. Yerelde teyit:
```bash
cd /Users/hasilm/Downloads/App/Ninovien/NinovienContentEditor/packages/koenig-lexical
npm view @fatih_ergun/kg-default-nodes version    # 1.0.1 görmeli
```

- [ ] **Step 3: koenig-lexical değişikliklerini main'e merge et → otomatik publish**

PR'ı (feat/half-float-image) main'e merge et. `publish-koenig-lexical.yml` otomatik koşar: `npm install --no-workspaces` ile **npm'deki yeni** kg-default-nodes'u çeker, build edip patch bump + publish eder.

- [ ] **Step 4: Yayınlanan bundle'ı fiilen doğrula (exit code değil)**

```bash
npm view @fatih_ergun/koenig-lexical version       # yeni patch
# Yayınlanan CSS float kuralını içeriyor mu:
npm pack @fatih_ergun/koenig-lexical --dry-run 2>/dev/null
# veya kurup: grep "kg-width-half-left" node_modules/@fatih_ergun/koenig-lexical/dist/index.css
```

- [ ] **Step 5: NinovienClient render CSS koordinasyonu**

NinovienClient wide/full'u kendi `kg-standart.css` kopyasıyla render ediyorsa, Task 4 Step 2'deki yarım float kurallarını o kopyaya da ekle. Aksi halde tüketicide float görünmez (HTML doğru üretilse bile).

---

## Task 7 (OPSİYONEL): Legacy mobiledoc parser aynası (kg-parser-plugins)

> HTML-saklayan tüketici (NinovienClient) için GEREKMEZ — lexical roundtrip Task 1 ile tamam. Bu yalnızca içerik mobiledoc dönüştürücülerinden geçerse devreye girer. Ayrıca kg-parser-plugins'in de ayrı yayın koordinasyonu gerekir (kg-converters üzerinden bundle'lanır). İhtiyaç netleşene kadar ertelenebilir.

**Files:**
- Test: `packages/kg-parser-plugins/test/cards/image.test.js` (figureToImageCard describe, ≈satır 67 ardına)
- Modify: `packages/kg-parser-plugins/lib/cards/image.js:24`

- [ ] **Step 1: Başarısız test yaz**

`packages/kg-parser-plugins/test/cards/image.test.js`, `it('extracts Koenig card widths', ...)` (≈satır 62-67) ardına:

```js
        it('extracts Koenig half-left card width', function () {
            const dom = buildDOM('<figure class="kg-card kg-image-card kg-width-half-left"><img src="http://example.com/test.png"></figure>');
            const [section] = parser.parse(dom).sections.toArray();

            section.payload.cardWidth.should.equal('half-left');
        });
```

- [ ] **Step 2: Çalıştır, BAŞARISIZ doğrula**

Run: `cd packages/kg-parser-plugins && ./node_modules/.bin/mocha test/cards/image.test.js --grep "half-left"`
Expected: FAIL (`expected undefined to equal 'half-left'`).

- [ ] **Step 3: Regex'i genişlet**

`packages/kg-parser-plugins/lib/cards/image.js` satır 24:

```js
        const kgClass = node.className.match(/kg-width-(wide|full|half-left|half-right)/);
```

- [ ] **Step 4: Çalıştır, GEÇTİĞİNİ doğrula**

Run: `cd packages/kg-parser-plugins && ./node_modules/.bin/mocha test/cards/image.test.js --grep "half-left"`
Expected: passing.

- [ ] **Step 5: Commit**

```bash
cd /Users/hasilm/Downloads/App/Ninovien/NinovienContentEditor
git add packages/kg-parser-plugins/lib/cards/image.js packages/kg-parser-plugins/test/cards/image.test.js
git commit -m "feat(kg-parser-plugins): parse half-left/half-right image card width"
```

---

## Notlar

- **YAGNI:** Sürükle-boyutlandırma yok (sabit %50); ayrı `alignment` property'si yok (birleşik `half-left`/`half-right`); renderer `sizes` ipucu yarım için eklenmez.
- **Roundtrip otoritesi:** Task 1 testi çekirdek güvence; Task 5 Step 6 canlı doğrular.
- **Editör WYSIWYG riski:** Task 5 Step 2'de karara bağlanır; render (kg-prose) her zaman otorite.
- **Tablo kartı:** ayrı spec/plan (kapsam dışı).
