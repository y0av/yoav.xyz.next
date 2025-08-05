'use client';

import { useEffect, useRef, useCallback } from 'react';

interface Star {
  x: number;
  y: number;
  z: number;
  opacity: number;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface Target {
  x: number;
  y: number;
  radius: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

interface Spaceship {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  angle: number;
}

export default function CanvasGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const gameStateRef = useRef({
    stars: [] as Star[],
    shootingStars: [] as ShootingStar[],
    spaceship: { x: 0, y: 0, targetX: 0, targetY: 0, angle: 0 } as Spaceship,
    projectiles: [] as Projectile[],
    targets: [] as Target[],
    particles: [] as Particle[],
    mouseX: 0,
    mouseY: 0,
    isShooting: false,
    lastShot: 0,
    lastShootingStar: 0,
    lastTarget: 0,
  });

  // Vector math utilities
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const distance = (x1: number, y1: number, x2: number, y2: number) => 
    Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

  // Initialize stars
  const initializeStars = useCallback((canvas: HTMLCanvasElement) => {
    const stars: Star[] = [];
    for (let i = 0; i < 300; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * 3 + 1,
        opacity: Math.random() * 0.3 + 0.1,
      });
    }
    gameStateRef.current.stars = stars;
  }, []);

  // Create shooting star
  const createShootingStar = useCallback((canvas: HTMLCanvasElement) => {
    const side = Math.floor(Math.random() * 4);
    let x, y, vx, vy;

    switch (side) {
      case 0: // top
        x = Math.random() * canvas.width;
        y = -20;
        vx = (Math.random() - 0.5) * 4;
        vy = Math.random() * 3 + 2;
        break;
      case 1: // right
        x = canvas.width + 20;
        y = Math.random() * canvas.height;
        vx = -(Math.random() * 3 + 2);
        vy = (Math.random() - 0.5) * 4;
        break;
      case 2: // bottom
        x = Math.random() * canvas.width;
        y = canvas.height + 20;
        vx = (Math.random() - 0.5) * 4;
        vy = -(Math.random() * 3 + 2);
        break;
      default: // left
        x = -20;
        y = Math.random() * canvas.height;
        vx = Math.random() * 3 + 2;
        vy = (Math.random() - 0.5) * 4;
    }

    gameStateRef.current.shootingStars.push({
      x, y, vx, vy,
      life: 60,
      maxLife: 60,
    });
  }, []);

  // Create target
  const createTarget = useCallback((canvas: HTMLCanvasElement) => {
    gameStateRef.current.targets.push({
      x: Math.random() * (canvas.width - 80) + 40,
      y: Math.random() * (canvas.height - 80) + 40,
      radius: 20,
    });
  }, []);

  // Create explosion particles
  const createExplosion = useCallback((x: number, y: number) => {
    for (let i = 0; i < 10; i++) {
      const angle = (Math.PI * 2 * i) / 10;
      const speed = Math.random() * 3 + 1;
      gameStateRef.current.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 30,
        maxLife: 30,
      });
    }
  }, []);

  // Update game state
  const update = useCallback((canvas: HTMLCanvasElement, currentTime: number) => {
    const state = gameStateRef.current;

    // Update spaceship position with smooth following
    state.spaceship.x = lerp(state.spaceship.x, state.spaceship.targetX, 0.02);
    state.spaceship.y = lerp(state.spaceship.y, state.spaceship.targetY, 0.02);

    // Update spaceship rotation
    const dx = state.spaceship.targetX - state.spaceship.x;
    const dy = state.spaceship.targetY - state.spaceship.y;
    const targetAngle = Math.atan2(dy, dx);
    let angleDiff = targetAngle - state.spaceship.angle;
    
    // Normalize angle difference
    while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
    while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
    
    state.spaceship.angle += angleDiff * 0.05;

    // Update stars (slow drift)
    state.stars.forEach(star => {
      star.y += star.z * 0.1;
      if (star.y > canvas.height) {
        star.y = -5;
        star.x = Math.random() * canvas.width;
      }
    });

    // Update shooting stars
    state.shootingStars.forEach((star, index) => {
      star.x += star.vx;
      star.y += star.vy;
      star.life--;
      
      if (star.life <= 0 || 
          star.x < -50 || star.x > canvas.width + 50 ||
          star.y < -50 || star.y > canvas.height + 50) {
        state.shootingStars.splice(index, 1);
      }
    });

    // Update projectiles
    state.projectiles.forEach((projectile, index) => {
      projectile.x += projectile.vx;
      projectile.y += projectile.vy;
      
      if (projectile.x < 0 || projectile.x > canvas.width ||
          projectile.y < 0 || projectile.y > canvas.height) {
        state.projectiles.splice(index, 1);
      }
    });

    // Update particles
    state.particles.forEach((particle, index) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life--;
      
      if (particle.life <= 0) {
        state.particles.splice(index, 1);
      }
    });

    // Check collisions
    state.projectiles.forEach((projectile, pIndex) => {
      state.targets.forEach((target, tIndex) => {
        const dist = distance(projectile.x, projectile.y, target.x, target.y);
        if (dist < target.radius) {
          createExplosion(target.x, target.y);
          state.projectiles.splice(pIndex, 1);
          state.targets.splice(tIndex, 1);
        }
      });
    });

    // Spawn shooting stars
    if (currentTime - state.lastShootingStar > Math.random() * 10000 + 5000) {
      createShootingStar(canvas);
      state.lastShootingStar = currentTime;
    }

    // Spawn targets
    if (currentTime - state.lastTarget > Math.random() * 2000 + 3000) {
      createTarget(canvas);
      state.lastTarget = currentTime;
    }

    // Shooting
    if (state.isShooting && currentTime - state.lastShot > 200) {
      const speed = 8;
      state.projectiles.push({
        x: state.spaceship.x,
        y: state.spaceship.y,
        vx: Math.cos(state.spaceship.angle) * speed,
        vy: Math.sin(state.spaceship.angle) * speed,
      });
      state.lastShot = currentTime;
    }
  }, [createShootingStar, createTarget, createExplosion]);

  // Render game
  const render = useCallback((canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    const state = gameStateRef.current;
    
    // Clear canvas
    ctx.fillStyle = '#212121';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Render stars with parallax
    state.stars.forEach(star => {
      const parallaxX = (state.mouseX / canvas.width - 0.5) * star.z * 10;
      const parallaxY = (state.mouseY / canvas.height - 0.5) * star.z * 10;
      
      ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
      ctx.fillRect(star.x - parallaxX, star.y - parallaxY, 1, 1);
    });

    // Render shooting stars
    state.shootingStars.forEach(star => {
      const alpha = star.life / star.maxLife;
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(star.x, star.y);
      ctx.lineTo(star.x - star.vx * 5, star.y - star.vy * 5);
      ctx.stroke();
    });

    // Render spaceship
    ctx.save();
    ctx.translate(state.spaceship.x, state.spaceship.y);
    ctx.rotate(state.spaceship.angle);
    ctx.fillStyle = '#3B82F6';
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.lineTo(-8, -6);
    ctx.lineTo(-5, 0);
    ctx.lineTo(-8, 6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Render projectiles
    state.projectiles.forEach(projectile => {
      ctx.fillStyle = '#60A5FA';
      ctx.beginPath();
      ctx.arc(projectile.x, projectile.y, 2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Render targets
    state.targets.forEach(target => {
      ctx.strokeStyle = '#60A5FA';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(target.x, target.y, target.radius, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Render particles
    state.particles.forEach(particle => {
      const alpha = particle.life / particle.maxLife;
      ctx.fillStyle = `rgba(96, 165, 250, ${alpha})`;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, 1, 0, Math.PI * 2);
      ctx.fill();
    });
  }, []);

  // Game loop
  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentTime = Date.now();
    update(canvas, currentTime);
    render(canvas, ctx);

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [update, render]);

  // Handle mouse/touch events
  const handlePointerMove = useCallback((e: PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    gameStateRef.current.mouseX = (e.clientX - rect.left) * scaleX;
    gameStateRef.current.mouseY = (e.clientY - rect.top) * scaleY;
    gameStateRef.current.spaceship.targetX = gameStateRef.current.mouseX;
    gameStateRef.current.spaceship.targetY = gameStateRef.current.mouseY;
  }, []);

  const handlePointerDown = useCallback(() => {
    gameStateRef.current.isShooting = true;
  }, []);

  const handlePointerUp = useCallback(() => {
    gameStateRef.current.isShooting = false;
  }, []);

  // Resize handler
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Re-initialize stars for new canvas size
    initializeStars(canvas);
    
    // Reset spaceship position
    gameStateRef.current.spaceship.x = canvas.width / 2;
    gameStateRef.current.spaceship.y = canvas.height / 2;
    gameStateRef.current.spaceship.targetX = canvas.width / 2;
    gameStateRef.current.spaceship.targetY = canvas.height / 2;
  }, [initializeStars]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set initial canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Initialize game state
    initializeStars(canvas);
    gameStateRef.current.spaceship.x = canvas.width / 2;
    gameStateRef.current.spaceship.y = canvas.height / 2;
    gameStateRef.current.spaceship.targetX = canvas.width / 2;
    gameStateRef.current.spaceship.targetY = canvas.height / 2;

    // Add event listeners
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointerleave', handlePointerUp);
    window.addEventListener('resize', handleResize);

    // Start game loop
    gameLoop();

    return () => {
      // Cleanup
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointerleave', handlePointerUp);
      window.removeEventListener('resize', handleResize);
    };
  }, [gameLoop, handlePointerMove, handlePointerDown, handlePointerUp, handleResize, initializeStars]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0"
      style={{ 
        touchAction: 'none',
        background: '#212121'
      }}
    />
  );
}
