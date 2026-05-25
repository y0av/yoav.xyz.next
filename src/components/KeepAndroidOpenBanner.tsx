'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';

const BANNER_ID = 'keepandroidopen-banner';
const BANNER_HEIGHT_VAR = '--kao-banner-height';

export default function KeepAndroidOpenBanner() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const updateBannerHeight = () => {
      root.style.setProperty(
        BANNER_HEIGHT_VAR,
        `${container.getBoundingClientRect().height}px`,
      );
    };

    updateBannerHeight();

    const observer = new ResizeObserver(updateBannerHeight);
    observer.observe(container);

    return () => {
      observer.disconnect();
      root.style.removeProperty(BANNER_HEIGHT_VAR);
    };
  }, []);

  return (
    <>
      <div
        id={BANNER_ID}
        ref={containerRef}
        className="relative z-30"
      />
      <Script
        src={`https://keepandroidopen.org/banner.js?id=${BANNER_ID}`}
        strategy="afterInteractive"
      />
    </>
  );
}
