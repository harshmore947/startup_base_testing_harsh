import { useEffect } from 'react';

// Extend Window interface to include gtag
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

const GA_MEASUREMENT_ID = 'G-S8CDSW9YJM';

/**
 * Google Analytics - Loads asynchronously after page is interactive
 * Uses requestIdleCallback to avoid blocking the main thread
 */
export function GoogleAnalytics() {
  useEffect(() => {
    // Don't run on server
    if (typeof window === 'undefined') return;
    
    // Already initialized
    if (window.gtag) return;

    const initGA = () => {
      // Double-check it hasn't been initialized while waiting
      if (window.gtag) return;
      
      // Initialize dataLayer
      window.dataLayer = window.dataLayer || [];

      // Define gtag function
      window.gtag = function() {
        window.dataLayer.push(arguments);
      };

      // Set initial timestamp
      window.gtag('js', new Date());

      // Configure GA with measurement ID
      window.gtag('config', GA_MEASUREMENT_ID, {
        // Optimize for performance
        send_page_view: true,
        transport_type: 'beacon', // Use Beacon API for better performance
      });

      // Load the Google Analytics script
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
      document.head.appendChild(script);
    };

    // Load after page is fully interactive
    if (document.readyState === 'complete') {
      // Use requestIdleCallback to load during browser idle time
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(initGA, { timeout: 3000 });
      } else {
        // Fallback: delay by 2 seconds for older browsers
        setTimeout(initGA, 2000);
      }
    } else {
      // Wait for page load, then use idle callback
      const onLoad = () => {
        if ('requestIdleCallback' in window) {
          (window as any).requestIdleCallback(initGA, { timeout: 3000 });
        } else {
          setTimeout(initGA, 2000);
        }
      };
      window.addEventListener('load', onLoad, { once: true });
      return () => window.removeEventListener('load', onLoad);
    }
  }, []);

  return null;
}
