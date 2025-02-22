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
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Failed to fetch metadata: ${response.statusText}`);
    }

    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const getMetaTag = name => doc.querySelector(`meta[property='${name}'], meta[name='${name}']`)?.content;

    return {
        url,
        metadata: {
            title: getMetaTag('og:title') || doc.title,
            description: getMetaTag('og:description') || getMetaTag('description'),
            thumbnail: getMetaTag('og:image'),
            siteName: getMetaTag('og:site_name'),
            author: getMetaTag('author'),
            icon: `${new URL(url).origin}/favicon.ico`
        }
    };
}
