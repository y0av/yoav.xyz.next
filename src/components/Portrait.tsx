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
  const [isResetting, setIsResetting] = useState(false);
  // Refs to avoid stale state in RAF loop
  const rotationRef = useRef({ x: 0, y: 0 });
  const velocityRef = useRef({ x: 0, y: 0 });

  const applyFriction = useCallback(() => {
    // Use refs for smooth, natural physics without stale closures
    const currentVel = velocityRef.current;
    const nextVel = {
      x: currentVel.x * 0.98,
      y: currentVel.y * 0.98,
    };
    velocityRef.current = nextVel;
    setVelocity(nextVel);

    const currentRot = rotationRef.current;
    const nextRot = {
      x: currentRot.x + nextVel.x,
      y: currentRot.y + nextVel.y,
    };
    rotationRef.current = nextRot;
    setRotation(nextRot);

    const speedLow = Math.abs(nextVel.x) <= 0.05 && Math.abs(nextVel.y) <= 0.05;

    if (!speedLow && !isResetting) {
      animationFrameRef.current = requestAnimationFrame(applyFriction);
    }

    // When motion has effectively stopped, schedule the delayed reset
    if (speedLow && !isDragging && !isResetting && !returnToZeroTimeoutRef.current) {
      returnToZeroTimeoutRef.current = setTimeout(() => {
        if (!isDragging) {
          setIsResetting(true);
          rotationRef.current = { x: 0, y: 0 };
          setRotation({ x: 0, y: 0 });
        }
        // do not clear here; we'll null the ref on start of next interaction or unmount
      }, 3000);
    }
  }, [isDragging, isResetting]);

  useEffect(() => {
    if (!isDragging && !isResetting && (Math.abs(velocity.x) > 0.05 || Math.abs(velocity.y) > 0.05)) {
      animationFrameRef.current = requestAnimationFrame(applyFriction);
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isDragging, isResetting, velocity, applyFriction]);

  // Keep refs in sync whenever public state changes (external updates or direct sets)
  useEffect(() => { rotationRef.current = rotation; }, [rotation]);
  useEffect(() => { velocityRef.current = velocity; }, [velocity]);

  // Clear any pending reset on unmount only
  useEffect(() => {
    return () => {
      if (returnToZeroTimeoutRef.current) {
        clearTimeout(returnToZeroTimeoutRef.current);
        returnToZeroTimeoutRef.current = null;
      }
    };
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true);
    setLastPointer({ x: e.clientX, y: e.clientY });
    
    // Clear timeout when user starts dragging again
    if (returnToZeroTimeoutRef.current) {
      clearTimeout(returnToZeroTimeoutRef.current);
      returnToZeroTimeoutRef.current = null;
    }
  // Cancel any ongoing smooth reset and remove transition immediately
  setIsResetting(false);
    
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

  const newVel = { x: deltaY * 0.8, y: deltaX * 0.8 };
  velocityRef.current = newVel;
  setVelocity(newVel);

  const nextRot = { x: rotationRef.current.x + newVel.x, y: rotationRef.current.y + newVel.y };
  rotationRef.current = nextRot;
  setRotation(nextRot);

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
  if (Math.abs(velocityRef.current.x) > 0.05 || Math.abs(velocityRef.current.y) > 0.05) {
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
          transition: isResetting ? 'transform 1200ms cubic-bezier(0.22, 1, 0.36, 1)' : undefined,
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onTransitionEnd={() => {
          // End of smooth reset
          setIsResetting(false);
          setRotation({ x: 0, y: 0 });
        }}
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
