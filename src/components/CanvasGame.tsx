'use client';

import { useEffect, useRef, useCallback } from 'react';
import { logFirebaseEvent } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

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
  animationProgress: number; // 0 to 1 for entrance animation
  sourceX: number; // Where it came from
  sourceY: number; // Where it came from
  targetX: number; // Final destination X
  targetY: number; // Final destination Y
  // Boss-related (optional for normal targets)
  isBoss?: boolean;
  hp?: number;
  maxHp?: number;
  hitFlash?: number; // small countdown frames for hit blink
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type: 'spark' | 'ember' | 'ring' | 'classic';
}

interface Spaceship {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  angle: number;
}

type CanvasGameMode = 'game' | 'starsOnly';

interface CanvasGameProps {
  mode?: CanvasGameMode; // 'game' renders full game, 'starsOnly' renders background stars only
  targetGoal?: number;   // how many targets to pop before redirect
  redirectPath?: string; // where to redirect once goal is reached
}

export default function CanvasGame({
  mode = 'game',
  targetGoal = 100,
  redirectPath = '/guestbook',
}: CanvasGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const redirectedRef = useRef(false);
  const router = useRouter();
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
    killed: 0,
    totalTargetsSpawned: 0,
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
    // Choose a random side to spawn from
    const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
    let sourceX, sourceY, targetX, targetY;
    
    const margin = 40;
    
    // Final target position
    targetX = Math.random() * (canvas.width - margin * 2) + margin;
    targetY = Math.random() * (canvas.height - margin * 2) + margin;
    
    switch (side) {
      case 0: // top
        sourceX = targetX;
        sourceY = -50;
        break;
      case 1: // right
        sourceX = canvas.width + 50;
        sourceY = targetY;
        break;
      case 2: // bottom
        sourceX = targetX;
        sourceY = canvas.height + 50;
        break;
      default: // left
        sourceX = -50;
        sourceY = targetY;
    }
    
    // Determine if this spawn should be a boss: spawn #50 and #80
    const nextSpawnIndex = gameStateRef.current.totalTargetsSpawned + 1;
    const isBoss = nextSpawnIndex === 50 || nextSpawnIndex === 80;

    const target: Target = {
      x: sourceX,
      y: sourceY,
      radius: isBoss ? 30 : 20,
      animationProgress: 0,
      sourceX,
      sourceY,
      targetX,
      targetY,
      isBoss,
      hp: isBoss ? 30 : undefined,
      maxHp: isBoss ? 30 : undefined,
      hitFlash: 0,
    };

    gameStateRef.current.targets.push(target);
    gameStateRef.current.totalTargetsSpawned = nextSpawnIndex;

    logFirebaseEvent(isBoss ? 'game_boss_spawn' : 'game_target_spawn', { index: nextSpawnIndex });
  }, []);

  // Create explosion particles
  const createExplosion = useCallback((x: number, y: number) => {
    const useNewStyle = Math.random() < 0.5;

    if (!useNewStyle) {
      // Legacy pop effect for familiarity
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
          size: 1,
          color: '#60A5FA',
          type: 'classic',
        });
      }
      return;
    }

    const palette = ['#1D4ED8', '#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE'];

    // Fast sparks that spray outward
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 2;
      gameStateRef.current.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 30,
        maxLife: 30,
        size: Math.random() * 2 + 1.5,
        color: palette[Math.floor(Math.random() * palette.length)],
        type: 'spark',
      });
    }

    // Slow embers that float away
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2 + 0.5;
      gameStateRef.current.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 45,
        maxLife: 45,
        size: Math.random() * 3 + 2,
        color: '#E0F2FE',
        type: 'ember',
      });
    }

    // Shockwave ring for extra punch
    gameStateRef.current.particles.push({
      x,
      y,
      vx: 0,
      vy: 0,
      life: 25,
      maxLife: 25,
      size: 8,
      color: 'rgba(96,165,250,0.8)',
      type: 'ring',
    });
  }, []);

  // Update game state
  const update = useCallback((canvas: HTMLCanvasElement, currentTime: number) => {
    const state = gameStateRef.current;

    // Update spaceship position with constant slow speed
    if (mode === 'game') {
      const dx = state.spaceship.targetX - state.spaceship.x;
      const dy = state.spaceship.targetY - state.spaceship.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist > 1) { // Only move if not very close to target
        const speed = 1; // Constant slow speed
        const moveX = (dx / dist) * speed;
        const moveY = (dy / dist) * speed;
        
        state.spaceship.x += moveX;
        state.spaceship.y += moveY;
      }

      // Update spaceship rotation to point toward target (faster rotation)
      const targetAngle = Math.atan2(dy, dx);
      let angleDiff = targetAngle - state.spaceship.angle;
      
      // Normalize angle difference
      while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
      while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
      
      state.spaceship.angle += angleDiff * 0.1;
    }

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

    if (mode === 'game') {
      // Update projectiles
      state.projectiles.forEach((projectile, index) => {
        projectile.x += projectile.vx;
        projectile.y += projectile.vy;
        
        if (projectile.x < 0 || projectile.x > canvas.width ||
            projectile.y < 0 || projectile.y > canvas.height) {
          state.projectiles.splice(index, 1);
        }
      });
    }

    // Update particles with type-specific behavior
    for (let index = state.particles.length - 1; index >= 0; index--) {
      const particle = state.particles[index];
      particle.life--;

      switch (particle.type) {
        case 'classic': {
          particle.x += particle.vx;
          particle.y += particle.vy;
          break;
        }
        case 'spark': {
          particle.x += particle.vx;
          particle.y += particle.vy;
          particle.vx *= 0.96;
          particle.vy = particle.vy * 0.96 + 0.02; // slight gravity pull
          particle.size = Math.max(0.5, particle.size * 0.97);
          break;
        }
        case 'ember': {
          particle.x += particle.vx * 0.9;
          particle.y += particle.vy * 0.9;
          particle.vx *= 0.94;
          particle.vy = particle.vy * 0.94 + 0.01;
          particle.size = Math.max(1, particle.size * 0.995);
          break;
        }
        case 'ring': {
          particle.size += 1.4;
          break;
        }
      }

      if (particle.life <= 0) {
        state.particles.splice(index, 1);
      }
    }

    if (mode === 'game') {
      // Update targets (animate entrance slowly, reduce hit flash)
      state.targets.forEach((target, index) => {
        if (target.animationProgress < 1) {
          target.animationProgress += 0.01; // Slower animation speed
          // Lerp from source to target position
          target.x = lerp(target.sourceX, target.targetX, target.animationProgress);
          target.y = lerp(target.sourceY, target.targetY, target.animationProgress);
        }
        if (target.hitFlash && target.hitFlash > 0) {
          target.hitFlash -= 1;
        }
      });
    }

    if (mode === 'game') {
      // Check collisions
      // Note: iterate backwards to avoid index issues when splicing
      for (let pIndex = state.projectiles.length - 1; pIndex >= 0; pIndex--) {
        const projectile = state.projectiles[pIndex];
        let projectileConsumed = false;
        for (let tIndex = state.targets.length - 1; tIndex >= 0; tIndex--) {
          const target = state.targets[tIndex];
          const distToTarget = distance(projectile.x, projectile.y, target.x, target.y);
          if (distToTarget < target.radius) {
            // Hit detected
            if (target.isBoss && typeof target.hp === 'number' && typeof target.maxHp === 'number') {
              // Boss takes damage, blink on hit
              target.hp = Math.max(0, target.hp - 1);
              target.hitFlash = 6; // short blink
              createExplosion(target.x, target.y);
              state.projectiles.splice(pIndex, 1);
              projectileConsumed = true;
              logFirebaseEvent('game_boss_hit', { hp: target.hp, maxHp: target.maxHp });

              if (target.hp <= 0) {
                // Boss destroyed
                state.targets.splice(tIndex, 1);
                state.killed += 1;
                logFirebaseEvent('game_boss_destroyed', { total: state.killed });
                // Spawn 10 new circles immediately
                for (let i = 0; i < 10; i++) {
                  createTarget(canvas);
                }
                state.lastTarget = currentTime; // reset spawn timer
              }
            } else {
              // Normal target destroyed
              createExplosion(target.x, target.y);
              state.projectiles.splice(pIndex, 1);
              state.targets.splice(tIndex, 1);
              state.killed += 1;
              logFirebaseEvent('game_target_hit', { total: state.killed });
              // If we just destroyed the last circle, immediately spawn 4 new circles
              if (state.targets.length === 0) {
                for (let i = 0; i < 4; i++) {
                  createTarget(canvas);
                }
                state.lastTarget = currentTime; // reset spawn timer
              }
            }
            break;
          }
        }
        if (projectileConsumed) {
          // continue to next projectile after handling hit
          continue;
        }
      }
    }

    // Spawn shooting stars
    if (currentTime - state.lastShootingStar > Math.random() * 10000 + 5000) {
      createShootingStar(canvas);
      state.lastShootingStar = currentTime;
    }

    if (mode === 'game') {
      // Spawn targets (limit to 4 maximum)
      if (state.targets.length < 4 && currentTime - state.lastTarget > Math.random() * 3000 + 3000) {
        createTarget(canvas);
        state.lastTarget = currentTime;
      }

      // Shooting
      if (state.isShooting && currentTime - state.lastShot > 150) { // Faster shooting
        const speed = 10; // Faster projectiles
        const shootX = state.spaceship.x + Math.cos(state.spaceship.angle) * 15; // Shoot from nose
        const shootY = state.spaceship.y + Math.sin(state.spaceship.angle) * 15; // Shoot from nose
        
        state.projectiles.push({
          x: shootX,
          y: shootY,
          vx: Math.cos(state.spaceship.angle) * speed,
          vy: Math.sin(state.spaceship.angle) * speed,
        });
        state.lastShot = currentTime;
      }
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

    if (mode === 'game') {
      // Render spaceship
      ctx.save();
      ctx.translate(state.spaceship.x, state.spaceship.y);
      ctx.rotate(state.spaceship.angle);
      
      // Draw spaceship body
      ctx.fillStyle = '#3B82F6';
      ctx.beginPath();
      ctx.moveTo(15, 0);  // Nose of the ship
      ctx.lineTo(-10, -8); // Top wing
      ctx.lineTo(-6, 0);   // Body center
      ctx.lineTo(-10, 8);  // Bottom wing
      ctx.closePath();
      ctx.fill();
      
      // Draw spaceship outline for better visibility
      ctx.strokeStyle = '#60A5FA';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      ctx.restore();
    }

    if (mode === 'game') {
      // Render projectiles
      state.projectiles.forEach(projectile => {
        ctx.fillStyle = '#60A5FA';
        ctx.beginPath();
        ctx.arc(projectile.x, projectile.y, 2, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    if (mode === 'game') {
      // Render targets
      state.targets.forEach((target) => {
        const alpha = Math.min(target.animationProgress, 1);
        const scale = Math.min(target.animationProgress * 1.2, 1); // Slight scale animation

        ctx.save();
        // Hit blink effect for bosses: alternate visibility
        const blinkVisible = !target.hitFlash || target.hitFlash % 2 === 0;
        ctx.globalAlpha = alpha * (blinkVisible ? 1 : 0.4);
        ctx.translate(target.x, target.y);
        ctx.scale(scale, scale);

        if (target.isBoss) {
          // Boss styling - purple
          ctx.strokeStyle = '#A855F7'; // purple-500
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(0, 0, target.radius, 0, Math.PI * 2);
          ctx.stroke();

          // Inner circle
          ctx.strokeStyle = '#C084FC'; // purple-400
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, target.radius * 0.6, 0, Math.PI * 2);
          ctx.stroke();

          // HP ring indicator
          if (typeof target.hp === 'number' && typeof target.maxHp === 'number') {
            const pct = Math.max(0, Math.min(1, target.hp / target.maxHp));
            ctx.strokeStyle = '#F0ABFC'; // purple-300
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, target.radius + 5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pct);
            ctx.stroke();
          }
        } else {
          // Normal target styling - blue
          ctx.strokeStyle = '#60A5FA';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, target.radius, 0, Math.PI * 2);
          ctx.stroke();

          // Add a pulsing inner circle
          ctx.strokeStyle = '#93C5FD';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(0, 0, target.radius * 0.6, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.restore();
      });
    }

    // Render particles with additive glow for extra punch
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    state.particles.forEach(particle => {
      const alpha = Math.max(0, particle.life / particle.maxLife);
      ctx.globalAlpha = alpha;

      if (particle.type === 'ring') {
        ctx.strokeStyle = particle.color;
        ctx.lineWidth = 1.5 + (1 - alpha) * 2;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.stroke();
        return;
      }

      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // Render kill counter (tiny, blue) at bottom center
    if (mode === 'game') {
      const countText = `${Math.min(state.killed, targetGoal)}/${targetGoal}`;
      ctx.save();
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      const x = canvas.width / 2;
      const y = canvas.height - 10;
      // shadow for readability
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillText(countText, x + 1, y);
      ctx.fillText(countText, x - 1, y);
      ctx.fillText(countText, x, y + 1);
      // blue text
      ctx.fillStyle = '#60A5FA';
      ctx.fillText(countText, x, y);
      ctx.restore();
    }
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

    // Redirect if goal reached (only in game mode)
    if (
      mode === 'game' &&
      !redirectedRef.current &&
      gameStateRef.current.killed >= targetGoal
    ) {
      redirectedRef.current = true;
  logFirebaseEvent('game_goal_reached', { killed: gameStateRef.current.killed, goal: targetGoal });
  router.push(redirectPath);
      return; // stop scheduling next frame; component will unmount on route change
    }

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [update, render, mode, targetGoal, router, redirectPath]);

  // Handle mouse/touch events
  const handlePointerMove = useCallback((e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;
    
    gameStateRef.current.mouseX = mouseX;
    gameStateRef.current.mouseY = mouseY;
    if (mode === 'game') {
      gameStateRef.current.spaceship.targetX = mouseX;
      gameStateRef.current.spaceship.targetY = mouseY;
    }
  }, [mode]);

  const handlePointerDown = useCallback(() => {
    if (mode === 'game') {
      gameStateRef.current.isShooting = true;
      logFirebaseEvent('game_shooting_start');
    }
  }, [mode]);

  const handlePointerUp = useCallback(() => {
  gameStateRef.current.isShooting = false;
  if (mode === 'game') logFirebaseEvent('game_shooting_end');
  }, []);

  // Resize handler
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Re-initialize stars for new canvas size
    initializeStars(canvas);
    
    if (mode === 'game') {
      // Reset spaceship position to lower right
      gameStateRef.current.spaceship.x = canvas.width - 100;
      gameStateRef.current.spaceship.y = canvas.height - 100;
      gameStateRef.current.spaceship.targetX = canvas.width - 100;
      gameStateRef.current.spaceship.targetY = canvas.height - 100;
    }
  }, [initializeStars, mode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set initial canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Initialize game state
    initializeStars(canvas);
    if (mode === 'game') {
      gameStateRef.current.spaceship.x = canvas.width - 100;
      gameStateRef.current.spaceship.y = canvas.height - 100;
      gameStateRef.current.spaceship.targetX = canvas.width - 100;
      gameStateRef.current.spaceship.targetY = canvas.height - 100;
    }

    // Add event listeners
    canvas.addEventListener('pointermove', handlePointerMove);
    if (mode === 'game') {
      canvas.addEventListener('pointerdown', handlePointerDown);
      canvas.addEventListener('pointerup', handlePointerUp);
      canvas.addEventListener('pointerleave', handlePointerUp);
      
      // Also add mouse event listeners for better compatibility
      canvas.addEventListener('mousedown', handlePointerDown);
      canvas.addEventListener('mouseup', handlePointerUp);
      canvas.addEventListener('mouseleave', handlePointerUp);
    }
    
    window.addEventListener('resize', handleResize);

    // Start game loop
    gameLoop();

    return () => {
      // Cleanup
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      canvas.removeEventListener('pointermove', handlePointerMove);
      if (mode === 'game') {
        canvas.removeEventListener('pointerdown', handlePointerDown);
        canvas.removeEventListener('pointerup', handlePointerUp);
        canvas.removeEventListener('pointerleave', handlePointerUp);
        
        // Remove mouse event listeners
        canvas.removeEventListener('mousemove', handlePointerMove);
        canvas.removeEventListener('mousedown', handlePointerDown);
        canvas.removeEventListener('mouseup', handlePointerUp);
        canvas.removeEventListener('mouseleave', handlePointerUp);
      }
      
      window.removeEventListener('resize', handleResize);
    };
  }, [gameLoop, handlePointerMove, handlePointerDown, handlePointerUp, handleResize, initializeStars, mode]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0"
      style={{ 
  touchAction: 'none',
  background: '#212121',
  pointerEvents: mode === 'game' ? 'auto' : 'none',
      }}
    />
  );
}
