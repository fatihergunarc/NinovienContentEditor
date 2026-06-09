# Tasarım: Yarım/Float Görsel (half-left / half-right)

**Tarih:** 2026-06-10
**Durum:** Onaylandı (tasarım), implementasyon planı bekliyor
**Kapsam:** Yalnızca yarım/float görsel. Tablo kartı ayrı bir spec'te ele alınacak (bkz. "Kapsam dışı").

---

## 1. Amaç

Koenig Image kartına yeni bir genişlik seçeneği eklemek: görsel, içerik kolonunun ~%50'sini kaplar ve gövde metni görselin **yanından akar (float)**. Kullanıcı **sol** veya **sağ** yön seçebilir. Hedef, kullanıcının `editor yarım fotograf ornegi.html` dosyasında elle HTML yapıştırarak elde ettiği düzeni, editörde menüden tıklanabilir kalıcı bir özelliğe dönüştürmek.

## 2. Kullanıcı kararları (onaylandı)

| Karar | Seçim |
|------|-------|
| Yön | **Sol + Sağ** (kullanıcı seçer) |
| Genişlik | **Sabit %50** (sürükle-boyutlandırma yok) |
| Dar ekran | **Float kapanır, görsel tam genişliğe geçip metnin üstüne yığılır** |
| Toolbar | Genişlik araç çubuğunda **Full'dan sonra iki ayrı düğme** (Yarım sol / Yarım sağ) |
| Kodlama | **Birleşik (A):** `cardWidth = 'half-left' | 'half-right'` (ayrı `alignment` property'si YOK) |

## 3. Veri modeli ve HTML sözleşmesi

`cardWidth` değerinde enum doğrulaması yok (`generate-decorator-node.js`), bu yüzden yeni string değer serbestçe akar. Varsayılan `'regular'` değişmez.

**Üretilen HTML (renderer):** `image-renderer.js` zaten `kg-width-${cardWidth}` sınıfını her non-regular değer için otomatik üretir. Yani:

```html
<!-- half-left -->
<figure class="kg-card kg-image-card kg-width-half-left">
  <img class="kg-image" src="..." alt="..." loading="lazy">
  <figcaption>...</figcaption>   <!-- caption varsa -->
</figure>

<!-- half-right -->
<figure class="kg-card kg-image-card kg-width-half-right"> ... </figure>
```

**Roundtrip (KRİTİK):** parser bu sınıfı geri okuyabilmeli. Şu an:

```js
// packages/kg-default-nodes/lib/nodes/image/image-parser.js (≈satır 24/33)
const kgClass = domNode.className.match(/kg-width-(wide|full)/);
if (kgClass) { payload.cardWidth = kgClass[1]; }
```

Bu regex genişletilmeli — **yoksa kaydedilen HTML tekrar editöre açıldığında `regular`'a sessizce düşer ve float kaybolur:**

```js
const kgClass = domNode.className.match(/kg-width-(wide|full|half-left|half-right)/);
```

`half-left`/`half-right` tireli ve küçük harfli olduğundan hem geçerli CSS sınıfı hem geçerli regex grubu — `kg-width-${cardWidth}` ile birebir eşleşir. (Bare `half` değil, açık iki alternatif yazılır ki kısmi eşleşme olmasın.)

## 4. Dokunma noktaları (dosya bazında)

### Paket: `@fatih_ergun/kg-default-nodes` (otomatik yayınlanmıyor — bkz. §6)
- **`lib/nodes/image/image-parser.js`** — regex'e `half-left|half-right` ekle. **Tek zorunlu kod değişikliği bu pakette.**
- `lib/nodes/image/image-renderer.js` — değişiklik gerekmez (sınıfı zaten üretir). Opsiyonel: `sizes` ipucuna yarım dal (≈satır 73-82, kozmetik/perf, roundtrip'i etkilemez).

### Paket: `@fatih_ergun/koenig-lexical` (main'e merge → otomatik patch publish)
- **`src/assets/icons/kg-img-half-left.svg` + `kg-img-half-right.svg`** — yeni ikonlar. Format: `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`, ikincil çizgiler `stroke-opacity=".5"`. Renk/boyut sabitlenmez (Tailwind className yönetir). `kg-img-regular.svg`/`kg-img-wide.svg` referans alınır.
- **`src/components/ui/ToolbarMenu.jsx`** — iki svgr import (`...svg?react`) + `TOOLBAR_ICONS`'a `imgHalfLeft`/`imgHalfRight` kaydı (≈satır 7-10 importlar, 30-32 kayıt).
- **`src/nodes/ImageNodeComponent.jsx`** — Full düğmesinden sonra (≈satır 279) iki `ToolbarMenuItem`: `icon="imgHalfLeft"` → `handleImageCardResize('half-left')`, `icon="imgHalfRight"` → `handleImageCardResize('half-right')`. `isActive={cardWidth === 'half-left'}` vb. (`hide={isGif(src)}` mevcut desenle.)
- **`src/components/ui/CardWrapper.jsx`** — `CARD_WIDTH_CLASSES`'a editör önizlemesi için entry (Tailwind float), örn:
  ```js
  'half-left':  'float-left w-1/2 mr-6 mb-3',
  'half-right': 'float-right w-1/2 ml-6 mb-3',
  ```
  Ayrıca PropTypes `cardWidth: PropTypes.oneOf([...])` enum'una iki değeri ekle (≈satır 74) — yoksa PropTypes uyarısı.
- **`src/styles/components/kg-prose.css`** — **yayınlanan render CSS'i** (consumer'a giden tek CSS). `.kg-prose` altında scope'lu float kuralları + dar ekran collapse (bkz. §5).

### Demo + dokümantasyon
- **`packages/koenig-demo/src/kg-standart.css`** — aynı float kurallarını ekle. Bu dosya hem demo önizlemesi hem de NinovienClient render tarafına kopyalanan kanonik referans.

## 5. CSS tasarımı

Yayınlanan `kg-prose.css` içine, `.kg-prose` altında scope'lu (sadece render edilen içeriği etkiler, canlı editörü değil):

```css
/* Yarım / float görsel kartları */
.kg-prose figure.kg-card.kg-width-half-left,
.kg-prose figure.kg-card.kg-width-half-right {
    width: 50%;
    max-width: 50%;
    box-sizing: border-box;
}
.kg-prose figure.kg-card.kg-width-half-left img,
.kg-prose figure.kg-card.kg-width-half-right img {
    display: block;   /* kg-prose img{display:inline} kuralını ezer */
    width: 100%;
    height: auto;
}
.kg-prose figure.kg-card.kg-width-half-left {
    float: left;
    margin: 0.4em 1.6em 0.8em 0;
}
.kg-prose figure.kg-card.kg-width-half-right {
    float: right;
    margin: 0.4em 0 0.8em 1.6em;
}

/* Dar ekran: float kapan, tam genişlik, üste yığ.
   kg-prose.css'te kullanılan mevcut breakpoint: max-width 500px */
@media (max-width: 500px) {
    .kg-prose figure.kg-card.kg-width-half-left,
    .kg-prose figure.kg-card.kg-width-half-right {
        float: none;
        width: 100%;
        max-width: 100%;
        margin-left: 0;
        margin-right: 0;
    }
}
```

**Clearfix:** Float'lı figür, kısa bir paragrafın ardından gelen blok öğenin (başlık, `hr`, başka kart) üstüne taşabilir. Çözüm: float'tan sonraki blok-seviyesi öğelere `clear` ver; satır içi metni **temizleme** (sarmanın amacı o). İmplementasyonda preview ile doğrulanıp ince ayar yapılacak. Pratik kural: `width: 50%` (vw değil) — yarım görsel kolon-göreceli kalmalı, breakout yapmamalı.

**Not (mevcut boşluk):** `kg-width-wide`/`kg-width-full` için gerçek genişlik CSS'i yayınlanan pakette değil, yalnızca `koenig-demo/src/kg-standart.css`'te. Yarım float kuralı bilinçli olarak hem yayınlanan `kg-prose.css`'e hem demo dosyasına konuyor ki consumer'a ulaşsın.

## 6. Yayın / build zinciri (EN KRİTİK BÖLÜM)

**Tespit:** `koenig-lexical`, `kg-default-nodes`'u bundle eder (vite `rollupOptions.external` yalnızca `react`/`react-dom`). Ama CI publish iş akışı (`.github/workflows/publish-koenig-lexical.yml`), `packages/koenig-lexical` dizininde şunu çalıştırır:

```
npm install --legacy-peer-deps --ignore-scripts --no-workspaces
npm run build
```

`--no-workspaces` → workspace symlink kullanılmaz; `@fatih_ergun/kg-default-nodes@^1.0.0` **npm registry'den** çekilir. `--ignore-scripts` → kg-default-nodes'un `prepare` build'i de koşmaz. Yani **CI'da bundle'lanan, npm'deki yayınlanmış kg-default-nodes'tur, yerel düzenlenmiş `lib/` değil.**

`kg-default-nodes`'un `es/`/`cjs/` çıktıları **gitignore'da** (lib = kaynak, es/cjs = build). Workflow yalnızca `packages/koenig-lexical/**` değişiminde tetiklenir.

**Bunun sonucu — zorunlu yayın sırası:**

1. `kg-default-nodes/lib/image-parser.js` düzenlenir.
2. `kg-default-nodes` lokal build edilir (`yarn build` / `rollup -c`) → `es/`+`cjs/` üretilir.
3. **`kg-default-nodes` manuel olarak npm'e yayınlanır** (version bump, örn. 1.0.0 → 1.0.1; `^1.0.0` aralığı bunu kapsar). Bu paketin otomasyonu YOK.
4. **Sonra** koenig-lexical değişiklikleri (CSS/toolbar/ikon) main'e merge edilir → otomatik patch publish, artık npm'deki **yeni** kg-default-nodes'u bundle eder.

> ⚠️ Eğer adım 3 atlanır ve sadece koenig-lexical merge edilirse, CI eski kg-default-nodes'u (parser fix'i olmayan) bundle eder → consumer'da görsel kaydedilip tekrar açılınca `regular`'a düşer. Sıra **kg-default-nodes önce** olmalı.

**Doğrulama adımı:** koenig-lexical CI'ı çalıştıktan sonra, `npm install`'ın gerçekten yeni kg-default-nodes'u çektiğini (varsa `package-lock.json` pin'i nedeniyle) build çıktısında parser regex'ini arayarak teyit et — exit code değil, fiili etki.

**NinovienClient koordinasyonu:** Render CSS'i `kg-prose.css` üzerinden yayınlanan bundle'a girecek; ancak NinovienClient bugün wide/full'u kendi `kg-standart.css` kopyasıyla render ediyorsa, yarım float kuralları o kopyaya da eklenmeli. İmplementasyon sırasında NinovienClient'ın render CSS'ini nereden aldığı netleştirilmeli.

## 7. Test planı

| Katman | Dosya | Eklenecek |
|--------|-------|-----------|
| Node setter/serialization | `packages/kg-default-nodes/test/nodes/image.test.js` | `cardWidth` setter, exportDOM (figure sınıfı), **importDOM roundtrip** (figure `kg-width-half-left` → `cardWidth === 'half-left'`), exportJSON/importJSON |
| Renderer | `packages/kg-default-cards/test/cards/image.test.js` | half-left/right çıktı (wide deseni gibi) |
| Parser | `packages/kg-parser-plugins/test/cards/image.test.js` | figureToImageCard half-left/right |
| UI | `packages/koenig-lexical/test/...` (yok — oluşturulacak) | Toolbar düğmesi `cardWidth`'i set ediyor + className uygulanıyor (Playwright) |

En kritik test: **render → parse roundtrip** (HTML üret, geri parse et, `cardWidth` korunuyor mu).

## 8. Riskler ve kabul kriterleri

**Riskler:**
- **Editör WYSIWYG'i yaklaşık olabilir.** Görsel kartları blok-decorator node; editör içi metin sarması render'la birebir olmayabilir. Otorite olan yayınlanan render (kg-prose). İmplementasyonda `preview_*` araçlarıyla hem editör hem render doğrulanacak.
- **Sarma görselden SONRAKİ metne uygulanır** (standart float). Kullanıcı görseli, sarmasını istediği paragrafın üstüne koymalı. (Dokümantasyon notu.)
- **Yayın sırası hatası** (§6) → consumer'da sessiz `regular` düşüşü. Mitigasyon: kg-default-nodes önce publish + build çıktısı doğrulaması.

**Kabul kriterleri:**
1. Editörde görsel seçilince toolbar'da Yarım sol / Yarım sağ düğmeleri görünür ve tıklayınca `cardWidth` değişir.
2. Kaydedilen HTML `<figure class="kg-card kg-image-card kg-width-half-left">` üretir.
3. Bu HTML tekrar editöre yüklenince `cardWidth` korunur (roundtrip).
4. `kg-prose` ile render edilen HTML'de görsel %50 float olur, metin yanından akar.
5. Dar ekranda (≤500px) float kapanır, görsel tam genişliğe geçer.
6. İlgili tüm test katmanları yeşil.

## 9. Kapsam dışı (sonraki adım)

- **Tablo kartı** — ayrı spec + plan döngüsü. (Lexical `@lexical/table` entegrasyonu vs. basit form-tablo kararı orada verilecek.)
- Yarım görselde sürükle-yeniden boyutlandırma (sabit %50 seçildi).
- wide/full render CSS'inin yayınlanan bundle'a taşınması (mevcut boşluk; bu spec'in kapsamı dışı, sadece not edildi).
