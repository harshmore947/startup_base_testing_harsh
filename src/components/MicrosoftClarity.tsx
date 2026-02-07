import { useEffect } from 'react';

// Declare clarity on window for TypeScript
declare global {
  interface Window {
    clarity?: (...args: any[]) => void;
  }
}

/**
 * Microsoft Clarity - Loads asynchronously after page is interactive
 * Uses requestIdleCallback to avoid blocking the main thread
 */
export function MicrosoftClarity() {
  useEffect(() => {
    // Don't run on server
    if (typeof window === 'undefined') return;
    
    // Already initialized
    if (window.clarity) return;

    const initClarity = () => {
      // Double-check it hasn't been initialized while waiting
      if (window.clarity) return;
      
      (function(c: any, l: any, a: string, r: string, i: string) {
        c[a] = c[a] || function() {
          (c[a].q = c[a].q || []).push(arguments);
        };
        const t = l.createElement(r);
        t.async = 1;
        t.src = "https://www.clarity.ms/tag/" + i;
        const y = l.getElementsByTagName(r)[0];
        if (y?.parentNode) {
          y.parentNode.insertBefore(t, y);
        }
      })(window, document, "clarity", "script", "v0z7xewmkj");
    };

    // Load after page is fully interactive
    if (document.readyState === 'complete') {
      // Use requestIdleCallback to load during browser idle time
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(initClarity, { timeout: 3000 });
      } else {
        // Fallback: delay by 2 seconds for older browsers
        setTimeout(initClarity, 2000);
      }
    } else {
      // Wait for page load, then use idle callback
      const onLoad = () => {
        if ('requestIdleCallback' in window) {
          (window as any).requestIdleCallback(initClarity, { timeout: 3000 });
        } else {
          setTimeout(initClarity, 2000);
        }
      };
      window.addEventListener('load', onLoad, { once: true });
      return () => window.removeEventListener('load', onLoad);
    }
  }, []);

  return null;
}
