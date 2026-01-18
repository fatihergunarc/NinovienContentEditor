/* eslint-disable no-console */
export async function fetchEmbed(url) {
  console.log('Fetching embed data for URL:', url);

  try {
      // oEmbed providers or services
      const oEmbedEndpoints = {
          youtube: 'https://www.youtube.com/oembed',
          twitter: 'https://publish.twitter.com/oembed',
          vimeo: 'https://vimeo.com/api/oembed.json'
      };

      if (url.includes('youtube.com') || url.includes('youtu.be')) {
          return await fetchFromOEmbed(oEmbedEndpoints.youtube, url);
      } else if (url.includes('vimeo.com')) {
          return await fetchFromOEmbed(oEmbedEndpoints.vimeo, url);
      }
      // For generic URLs, attempt to fetch metadata
      return await fetchMetadata(url);
  } catch (error) {
      console.error('Error fetching embed:', error.message);
      throw error; // Let the caller handle errors
  }
}

// Fetch from oEmbed API
async function fetchFromOEmbed(endpoint, url) {
  const oEmbedUrl = `${endpoint}?url=${encodeURIComponent(url)}`;
  const response = await fetch(oEmbedUrl);

  if (!response.ok) {
      throw new Error(`Failed to fetch from oEmbed: ${response.statusText}`);
  }

  return await response.json();
}

// Fetch and parse metadata (Open Graph, Twitter Cards, etc.)
async function fetchMetadata(url) {
  // CORS hatası olduğu için mock data dönüyoruz
  // Gerçek uygulamada backend proxy kullanılmalı
  console.log('Fetching metadata for:', url);
  
  // Simüle edilmiş gecikme
  await new Promise(resolve => setTimeout(resolve, 500));

  const urlObj = new URL(url);
  const hostname = urlObj.hostname;
  const firstLetter = hostname.charAt(0).toUpperCase();

  // Site baş harfi ile placeholder görsel oluştur
  const thumbnailUrl = `https://placehold.co/600x400/6366f1/white?text=${firstLetter}&font=raleway`;

  return {
      type: 'bookmark',
      url,
      metadata: {
          title: `${hostname} - Ana Sayfa`,
          description: `${hostname} web sitesine hoş geldiniz. En güncel içerikler ve haberler burada.`,
          thumbnail: thumbnailUrl,
          siteName: hostname,
          author: 'Site Editörü',
          publisher: hostname,
          icon: `${urlObj.origin}/favicon.ico`
      }
  };

  /* GERÇEK UYGULAMA İÇİN:
  // Backend endpoint üzerinden fetch yapın
  const response = await fetch(`/api/fetch-metadata?url=${encodeURIComponent(url)}`);

  if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.statusText}`);
  }

  const data = await response.json();
  
  return {
      type: 'bookmark',
      url,
      metadata: data
  };
  */
}
