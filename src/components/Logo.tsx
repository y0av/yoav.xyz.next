'use client';

import Image from 'next/image';

export default function Logo() {
  return (
    <div className="fixed top-4 left-4 z-10 pointer-events-none">
      <Image
        src="/logo.svg"
        alt="Logo"
        width={40}
        height={40}
        className="w-8 h-8 md:w-10 md:h-10"
        priority
      />
    </div>
  );
}
