import { useEffect, useRef } from 'react';

const MAX_DPR = 1.75;
const PARTICLE_COUNT = 44;
const RIBBON_COUNT = 4;

function drawGlow(ctx, x, y, radius, colorStops) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  colorStops.forEach(([stop, color]) => {
    gradient.addColorStop(stop, color);
  });
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function createParticles() {
  return Array.from({ length: PARTICLE_COUNT }, (_, index) => ({
    angle: (Math.PI * 2 * index) / PARTICLE_COUNT,
    speed: 0.08 + (index % 7) * 0.017,
    orbit: 0.2 + (index % 11) * 0.031,
    size: 1 + (index % 4) * 0.7,
    drift: 0.12 + (index % 9) * 0.03,
    depth: 0.25 + (index % 5) * 0.14,
  }));
}

export default function HeroVisualCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      return undefined;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }

    const context = canvas.getContext('2d');
    const host = canvas.parentElement;

    if (!context || !host) {
      return undefined;
    }

    const particles = createParticles();
    const pointer = {
      currentX: 0.5,
      currentY: 0.34,
      targetX: 0.5,
      targetY: 0.34,
    };
    const bounds = { width: 0, height: 0, dpr: 1 };

    let frameId = 0;
    let running = true;
    let isVisible = !document.hidden;
    let isInView = true;
    let lastTime = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const width = Math.max(rect.width, 1);
      const height = Math.max(rect.height, 1);
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);

      bounds.width = width;
      bounds.height = height;
      bounds.dpr = dpr;

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const drawRibbons = (time, centerX, centerY, parallaxX) => {
      context.save();
      context.globalCompositeOperation = 'screen';

      for (let index = 0; index < RIBBON_COUNT; index += 1) {
        const progress = index / Math.max(RIBBON_COUNT - 1, 1);
        const amplitude = bounds.height * (0.12 + progress * 0.08);
        const startY = bounds.height * (0.15 + progress * 0.16);
        const endY = bounds.height * (0.82 - progress * 0.08);
        const wave = Math.sin(time * (0.4 + progress * 0.25) + index * 1.9);
        const lift = Math.cos(time * 0.75 + index * 0.7);

        context.beginPath();
        context.moveTo(bounds.width * (-0.12 + progress * 0.05), startY);
        context.bezierCurveTo(
          bounds.width * (0.2 + progress * 0.14) + parallaxX * 30,
          startY - amplitude * (0.55 + wave * 0.18),
          centerX + bounds.width * (0.12 + progress * 0.08) + parallaxX * 40,
          centerY + amplitude * 0.15 + lift * 26,
          bounds.width * (0.92 + progress * 0.08),
          endY + amplitude * (0.14 + wave * 0.1),
        );

        const ribbonGradient = context.createLinearGradient(0, startY, bounds.width, endY);
        ribbonGradient.addColorStop(0, `rgba(28, 82, 157, ${0.06 + progress * 0.04})`);
        ribbonGradient.addColorStop(0.5, `rgba(47, 111, 189, ${0.14 + progress * 0.08})`);
        ribbonGradient.addColorStop(1, `rgba(207, 42, 39, ${0.06 + progress * 0.04})`);

        context.strokeStyle = ribbonGradient;
        context.lineWidth = 1.5 + progress * 2.6;
        context.lineCap = 'round';
        context.stroke();
      }

      context.restore();
    };

    const drawParticles = (time, centerX, centerY, parallaxX, parallaxY) => {
      context.save();
      context.globalCompositeOperation = 'screen';

      particles.forEach((particle, index) => {
        const orbitalX =
          Math.cos(time * particle.speed + particle.angle) *
          bounds.width *
          (0.11 + particle.orbit * 0.22);
        const orbitalY =
          Math.sin(time * (particle.speed * 1.3) + particle.angle * 1.7) *
          bounds.height *
          (0.06 + particle.orbit * 0.12);
        const drift = Math.sin(time * (0.9 + particle.drift) + index) * 16;
        const shimmer = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(time * 1.5 + index * 0.8));

        const x = centerX + orbitalX + parallaxX * particle.depth * 28;
        const y = centerY + orbitalY + drift + parallaxY * particle.depth * 20;

        drawGlow(context, x, y, particle.size * 4.8, [
          [0, `rgba(255, 255, 255, ${0.32 * shimmer})`],
          [0.42, `rgba(47, 111, 189, ${0.18 * shimmer})`],
          [1, 'rgba(47, 111, 189, 0)'],
        ]);
      });

      context.restore();
    };

    const drawGrid = (time, parallaxX, parallaxY) => {
      const gridSize = Math.max(bounds.width / 12, 68);
      context.save();
      context.strokeStyle = 'rgba(28, 82, 157, 0.08)';
      context.lineWidth = 1;

      for (let x = -gridSize; x < bounds.width + gridSize; x += gridSize) {
        context.beginPath();
        context.moveTo(x + parallaxX * 18, 0);
        context.lineTo(x - bounds.width * 0.1 + parallaxX * 28, bounds.height);
        context.stroke();
      }

      for (let y = -gridSize; y < bounds.height + gridSize; y += gridSize) {
        const offset = Math.sin(time * 0.35 + y * 0.01) * 10;
        context.beginPath();
        context.moveTo(0, y + offset + parallaxY * 14);
        context.lineTo(bounds.width, y - offset + parallaxY * 10);
        context.stroke();
      }

      context.restore();
    };

    const render = (timestamp) => {
      if (!running || !isVisible || !isInView) {
        frameId = 0;
        return;
      }

      if (!lastTime) {
        lastTime = timestamp;
      }

      const delta = Math.min((timestamp - lastTime) / 1000, 0.04);
      lastTime = timestamp;

      pointer.currentX += (pointer.targetX - pointer.currentX) * Math.min(1, delta * 5.5);
      pointer.currentY += (pointer.targetY - pointer.currentY) * Math.min(1, delta * 5.5);

      const time = timestamp / 1000;
      const parallaxX = pointer.currentX - 0.5;
      const parallaxY = pointer.currentY - 0.5;

      const centerX = bounds.width * (0.54 + parallaxX * 0.08);
      const centerY = bounds.height * (0.32 + parallaxY * 0.07);

      context.clearRect(0, 0, bounds.width, bounds.height);

      const background = context.createLinearGradient(0, 0, bounds.width, bounds.height);
      background.addColorStop(0, '#f7f8fb');
      background.addColorStop(0.52, '#edf2fa');
      background.addColorStop(1, '#dbe7f6');
      context.fillStyle = background;
      context.fillRect(0, 0, bounds.width, bounds.height);

      drawGlow(context, bounds.width * 0.15, bounds.height * 0.08, bounds.width * 0.48, [
        [0, 'rgba(47, 111, 189, 0.16)'],
        [0.45, 'rgba(28, 82, 157, 0.09)'],
        [1, 'rgba(28, 82, 157, 0)'],
      ]);

      drawGlow(context, bounds.width * 0.9, bounds.height * 0.12, bounds.width * 0.34, [
        [0, 'rgba(207, 42, 39, 0.12)'],
        [0.5, 'rgba(207, 42, 39, 0.05)'],
        [1, 'rgba(207, 42, 39, 0)'],
      ]);

      drawGrid(time, parallaxX, parallaxY);
      drawRibbons(time, centerX, centerY, parallaxX);

      drawGlow(context, centerX, centerY, bounds.width * 0.18, [
        [0, 'rgba(255, 255, 255, 0.38)'],
        [0.26, 'rgba(47, 111, 189, 0.18)'],
        [0.62, 'rgba(28, 82, 157, 0.12)'],
        [1, 'rgba(28, 82, 157, 0)'],
      ]);

      drawGlow(context, centerX, centerY + bounds.height * 0.06, bounds.width * 0.32, [
        [0, 'rgba(207, 42, 39, 0.06)'],
        [0.55, 'rgba(207, 42, 39, 0.03)'],
        [1, 'rgba(207, 42, 39, 0)'],
      ]);

      context.save();
      context.globalCompositeOperation = 'screen';
      context.strokeStyle = 'rgba(28, 82, 157, 0.16)';
      context.lineWidth = 1.1;
      for (let index = 0; index < 3; index += 1) {
        const radius = bounds.width * (0.12 + index * 0.065);
        const stretch = 0.52 + index * 0.09 + Math.sin(time * 0.75 + index) * 0.03;

        context.beginPath();
        context.ellipse(
          centerX + parallaxX * 24,
          centerY + bounds.height * 0.03 + parallaxY * 16,
          radius,
          radius * stretch,
          time * 0.08 + index * 0.35,
          0,
          Math.PI * 2,
        );
        context.stroke();
      }
      context.restore();

      drawParticles(time, centerX, centerY, parallaxX, parallaxY);

      context.save();
      context.fillStyle = 'rgba(28, 82, 157, 0.012)';
      for (let x = 0; x < bounds.width; x += 6) {
        const alpha = 0.015 + ((x / 6) % 3) * 0.003;
        context.fillStyle = `rgba(28, 82, 157, ${alpha * 0.8})`;
        context.fillRect(x, 0, 1, bounds.height);
      }
      context.restore();

      frameId = window.requestAnimationFrame(render);
    };

    const start = () => {
      if (!frameId && running && isVisible && isInView) {
        frameId = window.requestAnimationFrame(render);
      }
    };

    const handlePointerMove = (event) => {
      const rect = host.getBoundingClientRect();
      pointer.targetX = (event.clientX - rect.left) / rect.width;
      pointer.targetY = (event.clientY - rect.top) / rect.height;
      start();
    };

    const handlePointerLeave = () => {
      pointer.targetX = 0.5;
      pointer.targetY = 0.34;
    };

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
      if (isVisible) {
        start();
      }
    };

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isInView = Boolean(entry?.isIntersecting);
        if (isInView) {
          start();
        }
      },
      { threshold: 0.08 },
    );

    const resizeObserver = new ResizeObserver(() => {
      resize();
      start();
    });

    resize();
    intersectionObserver.observe(host);
    resizeObserver.observe(host);

    host.addEventListener('pointermove', handlePointerMove, { passive: true });
    host.addEventListener('pointerleave', handlePointerLeave);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    start();

    return () => {
      running = false;
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
      host.removeEventListener('pointermove', handlePointerMove);
      host.removeEventListener('pointerleave', handlePointerLeave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return <canvas ref={canvasRef} className="hero-visual-canvas" aria-hidden="true" />;
}
