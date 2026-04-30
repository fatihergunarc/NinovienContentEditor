import React from 'react';
import {
    MemoizedExtendedKoenigEditor,
    useKoenigEditor
} from '@fatih_ergun/koenig-lexical';

// bu test etmek için kullanılan initialHtml — kapsamlı test seti
// `+` butonuyla eklenebilen tüm yaygın card türlerini içerir
const initialHtml = `
<h1 dir="ltr"><span>H1 başlığı</span></h1>
<h2 dir="ltr"><span>H2 başlığı</span></h2>
<h3 dir="ltr"><span>H3 başlığı</span></h3>
<p dir="ltr"><span>Normal paragraf — </span><strong>kalın</strong><span> ve </span><em>italik</em><span> ve </span><a href="https://example.com">bağlantı</a><span> içerir.</span></p>
<ul><li>Liste öğesi 1</li><li>Liste öğesi 2</li></ul>
<ol><li>Sıralı 1</li><li>Sıralı 2</li></ol>
<blockquote><p>Bu bir blockquote.</p></blockquote>
<pre><code>const x = 42;</code></pre>
<hr />
<figure class="kg-card kg-image-card">
  <img src="https://picsum.photos/740/420?random=1" alt="regular caption'lı" />
  <figcaption>Regular caption var</figcaption>
</figure>
<figure class="kg-card kg-image-card">
  <img src="https://picsum.photos/740/420?random=11" alt="regular caption'sız" />
</figure>
<p dir="ltr"><span>İki regular fotoğraf art arda. Aralarında ekstra boşluk olmamalı.</span></p>
<figure class="kg-card kg-image-card kg-width-wide">
  <img src="https://picsum.photos/1600/900?random=2" alt="wide caption'lı" />
  <figcaption>Wide caption var</figcaption>
</figure>
<figure class="kg-card kg-image-card kg-width-wide">
  <img src="https://picsum.photos/1600/900?random=22" alt="wide caption'sız" />
</figure>
<p dir="ltr"><span>Yukarıda iki wide fotoğraf — 75vw genişlik. Şimdi full karta geçiyoruz.</span></p>
<figure class="kg-card kg-image-card kg-width-full">
  <img src="https://picsum.photos/2000/900?random=3" alt="full caption'lı" />
  <figcaption>Full caption var</figcaption>
</figure>
<figure class="kg-card kg-image-card kg-width-full">
  <img src="https://picsum.photos/2000/900?random=33" alt="full caption'sız" />
</figure>
<p dir="ltr"><span>Aşağıda + butonuyla eklenebilen diğer card'lar:</span></p>

<h2 dir="ltr"><span>Bookmark card</span></h2>
<figure class="kg-card kg-bookmark-card">
  <a class="kg-bookmark-container" href="https://ghost.org">
    <div class="kg-bookmark-content">
      <div class="kg-bookmark-title">Ghost — Türev için en iyi yayıncılık platformu</div>
      <div class="kg-bookmark-description">Modern içerik üreticileri için tasarlanmış açık kaynak yayıncılık altyapısı.</div>
      <div class="kg-bookmark-metadata">
        <img class="kg-bookmark-icon" src="https://ghost.org/favicon.ico" alt=""/>
        <span class="kg-bookmark-author">Ghost</span>
        <span class="kg-bookmark-publisher">ghost.org</span>
      </div>
    </div>
    <div class="kg-bookmark-thumbnail">
      <img src="https://picsum.photos/200/120?random=50" alt=""/>
    </div>
  </a>
</figure>

<h2 dir="ltr"><span>Callout card</span></h2>
<div class="kg-card kg-callout-card kg-callout-card-blue">
  <div class="kg-callout-emoji">💡</div>
  <div class="kg-callout-text">Bu mavi bir callout kartı. Önemli bilgileri vurgulamak için kullanılır.</div>
</div>

<h2 dir="ltr"><span>Toggle card</span></h2>
<div class="kg-card kg-toggle-card" data-kg-toggle-state="close">
  <div class="kg-toggle-heading">
    <h4 class="kg-toggle-heading-text">Bu bir toggle başlığıdır — tıklayarak aç</h4>
  </div>
  <div class="kg-toggle-content">
    <p>Toggle içeriği uzun bir paragrafla başlıyor. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam vehicula nibh non lectus pellentesque, eu pulvinar urna luctus. Maecenas tincidunt, ipsum eu fringilla volutpat, lectus tortor placerat enim, eget feugiat erat orci ut justo.</p>
    <p>İkinci bir paragrafla devam: <strong>kalın</strong> ve <em>italik</em> içerikler de toggle altında düzgün açılmalı. Suspendisse potenti. Phasellus sit amet ipsum quis nibh feugiat tristique.</p>
    <ul><li>Madde 1 — toggle içinde liste</li><li>Madde 2</li><li>Madde 3</li></ul>
  </div>
</div>

<h2 dir="ltr"><span>Button card</span></h2>
<div class="kg-card kg-button-card">
  <a href="https://example.com" class="kg-btn kg-btn-accent">Tıkla bana</a>
</div>

<h2 dir="ltr"><span>Embed card (YouTube)</span></h2>
<figure class="kg-card kg-embed-card">
  <iframe width="200" height="113" src="https://www.youtube.com/embed/dQw4w9WgXcQ" frameborder="0" allowfullscreen></iframe>
</figure>

<h2 dir="ltr"><span>Header card</span></h2>
<div class="kg-card kg-header-card kg-v2 kg-width-full kg-content-wide kg-style-dark">
  <h2 class="kg-header-card-heading">Büyük header başlığı</h2>
  <h3 class="kg-header-card-subheading">Alt başlık metni</h3>
  <a class="kg-header-card-button kg-style-accent" href="#">CTA Buton</a>
</div>

<h2 dir="ltr"><span>HTML card</span></h2>
<div class="kg-card kg-html-card">
  <p>Bu, HTML card içinde <strong>raw HTML</strong> ile gelen içeriktir.</p>
</div>

<h2 dir="ltr"><span>File card</span></h2>
<div class="kg-card kg-file-card">
  <a class="kg-file-card-container" href="https://example.com/file.pdf">
    <div class="kg-file-card-contents">
      <div class="kg-file-card-title">Dosya başlığı</div>
      <div class="kg-file-card-caption">Dosya açıklaması</div>
      <div class="kg-file-card-metadata">
        <div class="kg-file-card-filename">document.pdf</div>
        <div class="kg-file-card-filesize">1.2 MB</div>
      </div>
    </div>
  </a>
</div>

<p dir="ltr"><span>Test seti sonu — Son paragraf.</span></p>
`.trim()

export const KonigComposerDemo = () => {
    // bu hook ve fonksiyonlar ile editor'e value set edebilir ve editor'deki value'yi alabiliriz.
    const {getHtml, setHtml} = useKoenigEditor()
    const [htmlOutput, setHtmlOutput] = React.useState('')
    const [isPreview, setIsPreview] = React.useState(false)
    const [previewHtml, setPreviewHtml] = React.useState('')
    const [isOutputOpen, setIsOutputOpen] = React.useState(false)

    // İlk mount'ta otomatik içerik yükle — kullanıcının butona basmasına gerek kalmasın.
    React.useEffect(() => {
        setHtml(initialHtml)
        setHtmlOutput(initialHtml)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Toggle card click handler — preview/render tarafının toggle açma-kapamasını sağlar.
    // NinovienClient view tarafında BU MANTIĞIN AYNISI gerekli (Ghost theme JS karşılığı).
    // Snippet:
    //   document.addEventListener('click', (e) => {
    //     const heading = e.target.closest('.kg-toggle-card .kg-toggle-heading');
    //     if (!heading) return;
    //     const card = heading.closest('.kg-toggle-card');
    //     card.setAttribute('data-kg-toggle-state',
    //         card.getAttribute('data-kg-toggle-state') === 'open' ? 'close' : 'open');
    //   });
    const previewRef = React.useRef(null)
    React.useEffect(() => {
        if (!isPreview) return
        const root = previewRef.current
        if (!root) return
        const handler = (e) => {
            const heading = e.target.closest('.kg-toggle-card .kg-toggle-heading')
            if (!heading || !root.contains(heading)) return
            const card = heading.closest('.kg-toggle-card')
            const next = card.getAttribute('data-kg-toggle-state') === 'open' ? 'close' : 'open'
            card.setAttribute('data-kg-toggle-state', next)
        }
        root.addEventListener('click', handler)
        return () => root.removeEventListener('click', handler)
    }, [isPreview, previewHtml])

    return (
        <div style={{display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#e7e9eb'}}>
            <div style={{
                position: 'sticky',
                top: 0,
                zIndex: 10,
                flexShrink: 0,
                display: 'flex',
                gap: 8,
                padding: '8px 12px',
                background: '#d9dde0',
                borderBottom: '1px solid #c5cad0'
            }}>
                <button onClick={() => {
                    setHtml(initialHtml)
                    setHtmlOutput(initialHtml)
                }}
                >
                    Set Initial HTML
                </button>
                <button onClick={() => {
                    getHtml().then(html => {
                        setHtmlOutput(html)
                        setIsOutputOpen(true)
                    })
                }}
                >
                    Get HTML
                </button>
                <button onClick={async () => {
                    if (!isPreview) {
                        // DB'ye kaydedilen HTML'i view tarafında nasıl render edeceksek burada da öyle:
                        // getHtml() çıktısını alıp statik HTML olarak göster (editor instance kullanmadan).
                        setPreviewHtml(await getHtml())
                    }
                    setIsPreview(prev => !prev)
                }}>
                    {isPreview ? 'Back to Edit' : 'Preview'}
                </button>
            </div>

            {/* Editör her zaman mount — state'i kaybolmasın diye preview'da display:none ile gizleniyor. */}
            <div className="koenig-lexical"
                 style={{
                     flex: 1,
                     minHeight: 512,
                     overflow: 'visible',
                     background: '#ffffff',
                     display: isPreview ? 'none' : 'block'
                 }}>
                <MemoizedExtendedKoenigEditor/>
            </div>
            {/* Preview = view senaryosunun aynısı: HTML statik olarak `koenig-lexical > kg-prose` içinde
                render. Kütüphanenin tüm CSS'i `.koenig-lexical .kg-prose` selector pattern'ı kullanıyor;
                CLAUDE.md'deki bu basit yapı yeterli. */}
            {isPreview && (
                <div className="koenig-lexical"
                     style={{flex: 1, minHeight: 512, overflow: 'visible', background: '#ffffff'}}>
                    <div ref={previewRef} className="kg-prose mx-auto" style={{maxWidth: 740}}
                         dangerouslySetInnerHTML={{__html: previewHtml}}/>
                </div>
            )}

            {/* Collapsible HTML Output — alta sticky */}
            <div style={{
                position: 'sticky',
                bottom: 0,
                zIndex: 10,
                flexShrink: 0,
                borderTop: '1px solid #c5cad0',
                background: '#f4f5f6'
            }}>
                <button
                    onClick={() => setIsOutputOpen(prev => !prev)}
                    style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 12px',
                        background: '#d9dde0',
                        border: 'none',
                        borderBottom: isOutputOpen ? '1px solid #c5cad0' : 'none',
                        cursor: 'pointer',
                        font: 'inherit',
                        fontWeight: 600
                    }}
                >
                    {isOutputOpen ? '▼' : '▶'} HTML Output
                </button>
                {isOutputOpen && (
                    <div style={{maxHeight: '30vh', overflow: 'auto', padding: '12px'}}>
                        {/* onemli! html'i gostermek istediginiz yerde parent elemente koenig-lexical ve kg-prose classlar asagidaki gibi eklenmelidir  */}
                        <div className="koenig-lexical">
                            <div className='kg-prose' dangerouslySetInnerHTML={{__html: htmlOutput}}/>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
