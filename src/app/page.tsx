'use client';

import dynamic from 'next/dynamic';
import Logo from '@/components/Logo';
import Greeting from '@/components/Greeting';
import Portrait from '@/components/Portrait';
import Bio from '@/components/Bio';
import SocialIcons from '@/components/SocialIcons';

// Dynamically import CanvasGame to avoid SSR issues
const CanvasGame = dynamic(() => import('@/components/CanvasGame'), {
  ssr: false,
});

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-800">
      {/* Interactive Background Canvas */}
      <CanvasGame />
      
      {/* Logo in top-left corner */}
      <Logo />
      
      {/* Main content centered */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 pointer-events-none">
        <div className="flex flex-col items-center justify-center space-y-6 pointer-events-auto">
          {/* Greeting text */}
          <Greeting />
          
          {/* Portrait with 3D interaction */}
          <Portrait />
          
          {/* Bio text */}
          <Bio />
          
          {/* Social icons */}
          <SocialIcons />
        </div>
      </main>
    </div>
  );
}
