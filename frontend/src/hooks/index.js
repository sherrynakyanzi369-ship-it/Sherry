import { useEffect, useState } from 'react';

export function useDebounce(value, delay = 250) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function setMeta(key, attrValue, content, isProperty = false) {
  const attr = isProperty ? 'property' : 'name';
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function useSeo({ title, description, image, jsonLd }) {
  useEffect(() => {
    const fullTitle = title ? `${title} · Sherriez Scents` : 'Sherriez Scents — Fragrances That Tell Your Story';
    document.title = fullTitle;
    setMeta('description', 'description', description ?? 'Discover premium fragrances, perfume oils, body sprays and gift sets at Sherriez Scents. Authentic scents, secure checkout, fast delivery.');
    setMeta('og:title', 'og:title', fullTitle, true);
    setMeta('og:description', 'og:description', description ?? 'Premium fragrances that tell your story.', true);
    setMeta('og:type', 'og:type', 'website', true);
    if (image) setMeta('og:image', 'og:image', image, true);

    let link = document.head.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = window.location.href;

    let script = document.getElementById('jsonld-page');
    if (jsonLd) {
      if (!script) {
        script = document.createElement('script');
        script.id = 'jsonld-page';
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(jsonLd);
    } else if (script) {
      script.remove();
    }
  }, [title, description, image, jsonLd]);
}

export function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal:not(.revealed)');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('revealed');
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  });
}
