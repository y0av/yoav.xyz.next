'use client';

import Image from 'next/image';
import { useRef, useState, useCallback, useEffect } from 'react';

export default function Portrait() {
  const imageRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastPointer, setLastPointer] = useState({ x: 0, y: 0 });
  const animationFrameRef = useRef<number | null>(null);

  const applyFriction = useCallback(() => {
    setVelocity(prev => ({
      x: prev.x * 0.95,
      y: prev.y * 0.95,
    }));

    setRotation(prev => ({
      x: prev.x + velocity.x,
      y: prev.y + velocity.y,
    }));

    if (Math.abs(velocity.x) > 0.1 || Math.abs(velocity.y) > 0.1) {
      animationFrameRef.current = requestAnimationFrame(applyFriction);
    }
  }, [velocity.x, velocity.y]);

  useEffect(() => {
    if (!isDragging && (Math.abs(velocity.x) > 0.1 || Math.abs(velocity.y) > 0.1)) {
      animationFrameRef.current = requestAnimationFrame(applyFriction);
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isDragging, velocity, applyFriction]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true);
    setLastPointer({ x: e.clientX, y: e.clientY });
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - lastPointer.x;
    const deltaY = e.clientY - lastPointer.y;

    setVelocity({
      x: deltaY * 0.5, // Vertical mouse movement rotates around X axis
      y: deltaX * 0.5, // Horizontal mouse movement rotates around Y axis
    });

    setRotation(prev => ({
      x: prev.x + deltaY * 0.5,
      y: prev.y + deltaX * 0.5,
    }));

    setLastPointer({ x: e.clientX, y: e.clientY });
  }, [isDragging, lastPointer]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
    
    // Start friction animation
    if (Math.abs(velocity.x) > 0.1 || Math.abs(velocity.y) > 0.1) {
      animationFrameRef.current = requestAnimationFrame(applyFriction);
    }
  }, [velocity, applyFriction]);

  return (
    <div className="mb-8 perspective-1000 animate-spin-in animate-delay-400">
      <div
        ref={imageRef}
        className="relative w-32 h-32 lg:w-40 lg:h-40 mx-auto cursor-grab active:cursor-grabbing select-none"
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          transformStyle: 'preserve-3d',
          transition: isDragging ? 'none' : 'transform 0.1s ease-out',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <div className="relative w-full h-full rounded-full border-4 border-white overflow-hidden shadow-lg">
          <Image
            src="/yoav.jpg"
            alt="Yoav"
            fill
            className="object-cover"
            priority
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
}
