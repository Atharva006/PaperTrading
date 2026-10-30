import React, { useEffect } from 'react';

export interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  keywords?: string;
  ogType?: 'website' | 'article';
  ogImage?: string;
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
}

const DEFAULT_TITLE = 'Cendrix Capital — Free Paper Trading Platform & Indian Stock Market Simulator';
const DEFAULT_DESCRIPTION =
  "Experience Cendrix Capital: India's premier free paper trading platform & live stock market simulator. Trade NSE equities, NIFTY 50 options, and MCX commodities with ₹10,00,000 virtual capital in a zero-risk virtual trading platform.";
const DEFAULT_CANONICAL = 'https://cendrix-capital-stf.vercel.app/';
const DEFAULT_OG_IMAGE = 'https://cendrix-capital-stf.vercel.app/cendrix-terminal-hero.jpg';

export const SEO: React.FC<SEOProps> = ({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  canonical = DEFAULT_CANONICAL,
  keywords,
  ogType = 'website',
  ogImage = DEFAULT_OG_IMAGE,
  noindex = false,
  jsonLd,
}) => {
  useEffect(() => {
    // 1. Update Title (ensures single, clean title tag)
    document.title = title;

    // Helper to update or create a meta tag by name
    const setMetaByName = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Helper to update or create a meta tag by property (Open Graph)
    const setMetaByProperty = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // 2. Robots
    const robotsContent = noindex
      ? 'noindex, nofollow'
      : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
    setMetaByName('robots', robotsContent);

    // 3. Description & Keywords
    setMetaByName('description', description);
    if (keywords) {
      setMetaByName('keywords', keywords);
    }

    // 4. Canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonical);

    // 5. Open Graph Meta Tags
    setMetaByProperty('og:title', title);
    setMetaByProperty('og:description', description);
    setMetaByProperty('og:url', canonical);
    setMetaByProperty('og:type', ogType);
    setMetaByProperty('og:image', ogImage);

    // 6. Twitter Meta Tags
    setMetaByName('twitter:title', title);
    setMetaByName('twitter:description', description);
    setMetaByName('twitter:url', canonical);
    setMetaByName('twitter:image', ogImage);

    // 7. Dynamic JSON-LD (if specified)
    const scriptId = 'dynamic-page-jsonld';
    let scriptTag = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (jsonLd) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = scriptId;
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.text = JSON.stringify(jsonLd);
    } else if (scriptTag) {
      scriptTag.remove();
    }
  }, [title, description, canonical, keywords, ogType, ogImage, noindex, jsonLd]);

  return null;
};
