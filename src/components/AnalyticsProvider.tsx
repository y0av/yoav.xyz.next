"use client";

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { logPageView, logFirebaseEvent, setAnalyticsUserProperties } from '@/lib/firebase';

/**
 * Hooks into Next.js navigation to produce rich Analytics events.
 * Logs: page_view (on load + every route change), route_change, and basic navigation performance metrics.
 */
export default function AnalyticsProvider() {
  const pathname = usePathname();
  const search = useSearchParams();
  const lastPathRef = useRef<string | null>(null);

  // Initial + subsequent page views
  useEffect(() => {
    if (!pathname) return;
    const fullPath = pathname + (search?.toString() ? `?${search.toString()}` : '');
    if (lastPathRef.current === fullPath) return;
    // page_view (GA4 style) + custom route_change for funnels
    logPageView(fullPath);
    if (lastPathRef.current) {
      logFirebaseEvent('route_change', {
        from: lastPathRef.current,
        to: fullPath,
      });
    } else {
      logFirebaseEvent('first_view', { path: fullPath });
    }
    lastPathRef.current = fullPath;
  }, [pathname, search]);

  // Basic performance metrics once (FCP-like & load)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    // User properties: theme (prefers-color-scheme) & device category (simple heuristic)
    try {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const theme = mq.matches ? 'dark' : 'light';
      const width = window.innerWidth;
      const deviceCategory = width < 640 ? 'mobile' : width < 1024 ? 'tablet' : 'desktop';
      setAnalyticsUserProperties({ theme, device_category: deviceCategory });
      // Update theme property if user toggles system preference during session
      if (mq.addEventListener) {
        mq.addEventListener('change', (e) => setAnalyticsUserProperties({ theme: e.matches ? 'dark' : 'light' }));
      } else if ((mq as any).addListener) {
        (mq as any).addListener((e: MediaQueryListEvent) => setAnalyticsUserProperties({ theme: e.matches ? 'dark' : 'light' }));
      }
    } catch {/* ignore */}
    let done = false;
    const report = () => {
      if (done) return; done = true;
      try {
        const timing = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
        if (timing) {
          logFirebaseEvent('perf_navigation', {
            domComplete: Math.round(timing.domComplete - timing.startTime),
            domInteractive: Math.round(timing.domInteractive - timing.startTime),
            firstPaint: Math.round((performance.getEntriesByName('first-paint')[0]?.startTime ?? 0)),
            firstContentfulPaint: Math.round((performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? 0)),
          });
        }
      } catch {/* ignore */}
    };
    if (document.readyState === 'complete') {
      report();
    } else {
      window.addEventListener('load', report, { once: true });
    }
  }, []);

  return null;
}
