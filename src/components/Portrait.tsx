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
      x: prev.x * 0.98, // Slower friction for more spinning time
      y: prev.y * 0.98,
    }));

    setRotation(prev => {
      const newRotation = {
        x: prev.x + velocity.x,
        y: prev.y + velocity.y,
      };
      
      // When velocity is very low, slowly return to original position
      if (Math.abs(velocity.x) < 0.5 && Math.abs(velocity.y) < 0.5) {
        newRotation.x = prev.x * 0.95; // Slowly return to 0
        newRotation.y = prev.y * 0.95; // Slowly return to 0
      }
      
      return newRotation;
    });

    if (Math.abs(velocity.x) > 0.05 || Math.abs(velocity.y) > 0.05 || Math.abs(rotation.x) > 1 || Math.abs(rotation.y) > 1) {
      animationFrameRef.current = requestAnimationFrame(applyFriction);
    }
  }, [velocity.x, velocity.y, rotation.x, rotation.y]);

  useEffect(() => {
    if (!isDragging && (Math.abs(velocity.x) > 0.05 || Math.abs(velocity.y) > 0.05 || Math.abs(rotation.x) > 1 || Math.abs(rotation.y) > 1)) {
      animationFrameRef.current = requestAnimationFrame(applyFriction);
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isDragging, velocity, rotation, applyFriction]);

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
      x: deltaY * 0.8, // Increased sensitivity for more responsive spinning
      y: deltaX * 0.8, // Increased sensitivity for more responsive spinning
    });

    setRotation(prev => ({
      x: prev.x + deltaY * 0.8,
      y: prev.y + deltaX * 0.8,
    }));

    setLastPointer({ x: e.clientX, y: e.clientY });
  }, [isDragging, lastPointer]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
    
    // Start friction animation
    if (Math.abs(velocity.x) > 0.05 || Math.abs(velocity.y) > 0.05) {
      animationFrameRef.current = requestAnimationFrame(applyFriction);
    }
  }, [velocity, applyFriction]);

  return (
    <div className="mb-8 perspective-1000 animate-spin-in animate-delay-400 pointer-events-auto">
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
