import { useEffect, useState } from 'react';

// Extend Window interface for analytics
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    clarity?: (...args: any[]) => void;
  }
}

const GA_MEASUREMENT_ID = 'G-S8CDSW9YJM';
const CLARITY_PROJECT_ID = 'v0z7xewmkj';

/**
 * DeferredAnalytics - Consolidated analytics loader
 * 
 * This component defers ALL analytics providers (Google Analytics, Microsoft Clarity, 
 * and Vercel Analytics) until the page is fully interactive and the browser is idle.
 * 
 * Benefits:
 * - Faster First Contentful Paint (FCP) - analytics don't block initial render
 * - Faster Largest Contentful Paint (LCP) - critical content loads first
 * - Better Core Web Vitals scores
 * - Reduced main thread blocking
 */
export function DeferredAnalytics() {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const loadAnalytics = () => {
      setShouldLoad(true);
    };

    // Wait for page to be fully loaded and interactive
    if (document.readyState === 'complete') {
      // Use requestIdleCallback for best performance - loads during browser idle time
      if ('requestIdleCallback' in window) {
        requestIdleCallback(loadAnalytics, { timeout: 5000 });
      } else {
        // Fallback for Safari and older browsers
        setTimeout(loadAnalytics, 2000);
      }
    } else {
      // Page not yet loaded - wait for load event
      const onLoad = () => {
        if ('requestIdleCallback' in window) {
          requestIdleCallback(loadAnalytics, { timeout: 5000 });
        } else {
          setTimeout(loadAnalytics, 2000);
        }
      };
      window.addEventListener('load', onLoad, { once: true });
      return () => window.removeEventListener('load', onLoad);
    }
  }, []);

  // Don't render anything until ready
  if (!shouldLoad) return null;

  // Render the actual analytics loader
  return <AnalyticsLoader />;
}

/**
 * AnalyticsLoader - Handles the actual loading of all analytics scripts
 * Only rendered after the page is fully interactive
 */
function AnalyticsLoader() {
  useEffect(() => {
    // Load all analytics in parallel (non-blocking)
    Promise.all([
      loadGoogleAnalytics(),
      loadMicrosoftClarity(),
      loadVercelAnalytics(),
    ]).then(() => {
      console.log('[Analytics] All providers loaded successfully');
    }).catch((error) => {
      console.warn('[Analytics] Some providers failed to load:', error);
    });
  }, []);

  return null;
}

/**
 * Load Google Analytics 4
 */
async function loadGoogleAnalytics(): Promise<void> {
  return new Promise((resolve) => {
    // Already initialized
    if (window.gtag) {
      resolve();
      return;
    }

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
      send_page_view: true,
      transport_type: 'beacon', // Use Beacon API for better performance
    });

    // Load the Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    script.onload = () => resolve();
    script.onerror = () => {
      console.warn('[Analytics] Failed to load Google Analytics');
      resolve(); // Don't reject - analytics failure shouldn't break the app
    };
    document.head.appendChild(script);
  });
}

/**
 * Load Microsoft Clarity
 */
async function loadMicrosoftClarity(): Promise<void> {
  return new Promise((resolve) => {
    // Already initialized
    if (window.clarity) {
      resolve();
      return;
    }

    try {
      (function(c: any, l: any, a: string, r: string, i: string) {
        c[a] = c[a] || function() {
          (c[a].q = c[a].q || []).push(arguments);
        };
        const t = l.createElement(r);
        t.async = 1;
        t.src = "https://www.clarity.ms/tag/" + i;
        t.onload = () => resolve();
        t.onerror = () => {
          console.warn('[Analytics] Failed to load Microsoft Clarity');
          resolve();
        };
        const y = l.getElementsByTagName(r)[0];
        if (y?.parentNode) {
          y.parentNode.insertBefore(t, y);
        } else {
          document.head.appendChild(t);
        }
      })(window, document, "clarity", "script", CLARITY_PROJECT_ID);
    } catch (error) {
      console.warn('[Analytics] Error initializing Microsoft Clarity:', error);
      resolve();
    }
  });
}

/**
 * Load Vercel Analytics
 */
async function loadVercelAnalytics(): Promise<void> {
  try {
    // Dynamic import - only loads the module when called
    const { inject } = await import('@vercel/analytics');
    inject();
  } catch (error) {
    console.warn('[Analytics] Failed to load Vercel Analytics:', error);
  }
}

