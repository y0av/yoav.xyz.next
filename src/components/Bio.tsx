'use client';

import { useEffect, useState } from 'react';

export default function Bio() {
  const [animStarted, setAnimStarted] = useState(false);

  // If user prefers reduced motion, show content immediately
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const media = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (media.matches) setAnimStarted(true);
    }
  }, []);

  return (
    <div
      className="text-center mb-8 max-w-2xl mx-auto px-4 animate-slide-up animate-delay-200 pointer-events-none"
      onAnimationStart={() => setAnimStarted(true)}
      style={{ opacity: animStarted ? undefined : 0 }}
    >
  <p className="text-xs sm:text-sm md:text-sm lg:text-base xl:text-lg text-gray-200 leading-relaxed">
        A Full-stack lead developer with expertise in IoT sensor based devices,<br />
        Cross platform mobile applications and gamification.<br />
        More than 18 years of professional experience in development.
      </p>
    </div>
  );
}
