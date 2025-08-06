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
  const returnToZeroTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const applyFriction = useCallback(() => {
    setVelocity(prev => ({
      x: prev.x * 0.98,
      y: prev.y * 0.98,
    }));

    setRotation(prev => {
      const newRotation = {
        x: prev.x + velocity.x,
        y: prev.y + velocity.y,
      };
      
      // When velocity is very low, smoothly return to original position after delay
      if (Math.abs(velocity.x) < 0.3 && Math.abs(velocity.y) < 0.3) {
        if (!returnToZeroTimeoutRef.current) {
          returnToZeroTimeoutRef.current = setTimeout(() => {
            // Start return to center animation
            const returnToCenter = () => {
              setRotation(prev => {
                if (Math.abs(prev.x) > 0.1 || Math.abs(prev.y) > 0.1) {
                  const finalRotation = {
                    x: prev.x * 0.92,
                    y: prev.y * 0.92,
                  };
                  animationFrameRef.current = requestAnimationFrame(returnToCenter);
                  return finalRotation;
                }
                return prev;
              });
            };
            returnToCenter();
          }, 4000);
        }
        newRotation.x = newRotation.x * 0.92;
        newRotation.y = newRotation.y * 0.92;
      }
      
      return newRotation;
    });

    if (Math.abs(velocity.x) > 0.05 || Math.abs(velocity.y) > 0.05) {
      animationFrameRef.current = requestAnimationFrame(applyFriction);
    }
  }, [velocity.x, velocity.y]);

  useEffect(() => {
    if (!isDragging && (Math.abs(velocity.x) > 0.05 || Math.abs(velocity.y) > 0.05)) {
      animationFrameRef.current = requestAnimationFrame(applyFriction);
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (returnToZeroTimeoutRef.current) {
        clearTimeout(returnToZeroTimeoutRef.current);
      }
    };
  }, [isDragging, velocity, applyFriction]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true);
    setLastPointer({ x: e.clientX, y: e.clientY });
    
    // Clear timeout when user starts dragging again
    if (returnToZeroTimeoutRef.current) {
      clearTimeout(returnToZeroTimeoutRef.current);
      returnToZeroTimeoutRef.current = null;
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    // Safely set pointer capture
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (error) {
      // Ignore invalid pointer id errors
    }
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - lastPointer.x;
    const deltaY = e.clientY - lastPointer.y;

    setVelocity({
      x: deltaY * 0.8,
      y: deltaX * 0.8,
    });

    setRotation(prev => ({
      x: prev.x + deltaY * 0.8,
      y: prev.y + deltaX * 0.8,
    }));

    setLastPointer({ x: e.clientX, y: e.clientY });
  }, [isDragging, lastPointer]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    setIsDragging(false);
    
    // Safely release pointer capture
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (error) {
      // Ignore invalid pointer id errors
    }
    
    // Start friction animation if there's velocity
    if (Math.abs(velocity.x) > 0.05 || Math.abs(velocity.y) > 0.05) {
      animationFrameRef.current = requestAnimationFrame(applyFriction);
    }
  }, [velocity, applyFriction]);

  return (
    <div className="mb-8 perspective-1000 animate-spin-in animate-delay-400 pointer-events-auto">
      <div
        ref={imageRef}
        className="relative w-24 h-24 lg:w-28 lg:h-28 mx-auto cursor-grab active:cursor-grabbing select-none"
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          transformStyle: 'preserve-3d',
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
