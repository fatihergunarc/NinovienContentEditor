## Development  
Projeyi indirdikten sonra aşağıdaki komutları kullanarak yerel ortamda test edebilirsiniz:  

1. Gerekli bağımlılıkları yükleyin:  
   ```bash
   yarn
   ```  

2. Demo sayfasını çalıştırın:  
   ```bash
   yarn dev
   ```  
   Bu komut, demo sayfasını (packages/koenig-demo) ayağa kaldırır.  

3. `koenig-lexical` paketinde değişiklik yapmak için:  
   - İlgili klasöre gidin:  
     ```bash
     cd packages/koenig-lexical
     ```  
   - Projeyi izleyerek build edin:  
     ```bash
     yarn build --watch
     ```  
     Bu sayede, `koenig-lexical` paketinde yaptığınız herhangi bir değişiklik otomatik olarak yansıyacaktır.  


### Kurulum
Bileşeni aşağıdaki komutla projeye dahil edebilirsiniz:  
```bash
npm i '@zeeshanzahoor/koenig-lexical'
```

### Stil Dosyalarının Dahil Edilmesi
Bileşenin gerekli CSS dosyasını, editörün kullanıldığı ve kullanıcıya HTML gösterilen sayfaya dahil etmelisiniz:  
```javascript
import '@zeeshanzahoor/koenig-lexical/koenig-lexical.css';
```

### KoenigComposer Bileşeninin Yapılandırılması
`KoenigComposer` bileşeni, editörün bağlamını sağlayan temel bir bileşendir ve global bir seviyede dahil edilmelidir. Aşağıda temel yapılandırma örneği verilmiştir:

```jsx
const cardConfig = {
  renderLabels: true,
  siteUrl: window.location.origin,
  membersEnabled: true,
  stripeEnabled: true,
  deprecated: { headerV1: true },
  feature: {
    collections: false,
    collectionsCard: false,
    contentVisibility: true,
  },
  fetchEmbed: fetchEmbed,
};

const props = {
  cardConfig,
  darkMode: false,
  fileUploader: { useFileUpload: useFileUpload({ isMultiplayer: false }), fileTypes },
  isSnippetsEnabled: false,
  isTKEnabled: true,
};

return (
  <div>
    <KoenigComposer {...props}>
      {/* Ek bileşenler buraya eklenebilir */}
    </KoenigComposer>
  </div>
);
```

### Editörün Dahil Edilmesi ve Kullanımı
Editör bileşenini aşağıdaki şekilde projeye dahil edebilirsiniz. Kullanım için bir üst kapsayıcının `koenig-lexical` sınıfına sahip olması gerektiğini unutmayın.

```jsx
import { useKoenigEditor } from '@zeeshanzahoor/koenig-lexical';

<div className="koenig-lexical">
  <MemoizedExtendedKoenigEditor />
</div>
```

Bu adımlar tamamlandığında, editörün sorunsuz bir şekilde çalıştığını gözlemleyebilirsiniz.

---

## Veri Okuma ve Yazma Fonksiyonları

`useKoenigEditor`, editörden veri okuma (`getHtml`) ve yazma (`setHtml`) işlemlerini kolaylaştıran bir hook sağlar. Aşağıda örnek kullanım gösterilmiştir:

```jsx
import { useKoenigEditor } from '@zeeshanzahoor/koenig-lexical';

const EditorWrapper = () => {
  const { getHtml, setHtml } = useKoenigEditor();
  const [output, setOutput] = useState();

  const collectHtml = async () =>{
    const html = await getHtml()
    setOutput(html)
  }

  return (
    <div className="koenig-lexical">
      <button onClick={() => collectHtml()}>Collect HTML</button>
      <MemoizedExtendedKoenigEditor />
    </div>
  );
};
```

---

## Verilerin Kaydedilmesi ve Kullanıcıya Gösterilmesi

Editör verileri, veritabanında HTML formatında saklanmalıdır. Yukarıdaki örneklerde veri okuma ve yazma işlemleri açıklanmıştır. Verileri kullanıcıya göstermek için şu örnek uygulanabilir:

```jsx
const UserFacingComponent = ({ html }) => {
  return (
    <div className="koenig-lexical">
      <div className="kg-prose" dangerouslySetInnerHTML={{ __html: htmlOutput }} />
    </div>
  );
};
```

> **Not:** Yukarıda belirtilen CSS dosyasını ve gerekli sınıf adlarını içeriğe dahil etmeyi unutmayın.

---

## Bileşen Stillerinin Özelleştirilmesi

Editörün görsel tasarımını özelleştirmek için [buradaki](https://github.com/zahooz/custom-koenig-editor/blob/main/packages/koenig-lexical/src/styles/components/kg-prose.css) CSS dosyasından yararlanabilirsiniz.

---

## Görsel Yükleme Servisi Geliştirme

Backend servisiniz şu kriterleri karşılamalıdır:
- Tekil veya çoklu dosya yüklemelerini desteklemelidir.
- Başarıyla yüklenen dosyalar için aşağıdaki formatta veri döndürmelidir:
  ```json
  { "url": "dosyanın URL'si", "fileName": "dosya adı" }
  ```
- Başarısız yüklemeler için şu format kullanılmalıdır:
  ```json
  { "fileName": "dosya adı", "message": "hata mesajı" }
  ```
- Galeri desteği için, hem başarılı hem de başarısız yükleme bilgilerini içeren bir liste dönebilmelidir:
  ```json
  [
    { "url": "dosyanın URL'si", "fileName": "dosya adı" },
    { "fileName": "dosya adı", "message": "hata mesajı" }
  ]
  ```

Ayrıca, `useFileUpload.js` dosyasındaki `upload` fonksiyonunu bu servisle uyumlu hale getirmelisiniz.

---

## Embed Servisi Geliştirme

Embed servisi, farklı platformlardan (örneğin YouTube, Twitter, Vimeo) içeriklerin sayfaya gömülmesini sağlar. `fetchEmbed` şu anda bu üç platformu desteklemektedir. Ek platformlar eklemek veya servisi devre dışı bırakmak için yapılandırma dosyasını güncelleyebilirsiniz.