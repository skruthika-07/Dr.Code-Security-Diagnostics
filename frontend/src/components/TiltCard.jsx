import { useRef, useState, useCallback } from 'react';

export default function TiltCard({
  children,
  className = '',
  maxTilt = 16,
  glowColor = 'rgba(54,224,200,0.28)',
  rounded = 'rounded-2xl',
}) {
  const ref = useRef(null);
  const [transform, setTransform] = useState(
    'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1) translateZ(0px)'
  );
  const [shadow, setShadow] = useState('0 4px 12px -4px rgba(0,0,0,0.4)');
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const handleMouseMove = useCallback((e) => {
    if (prefersReducedMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rotateY = (x - 0.5) * maxTilt * 2;
    const rotateX = (0.5 - y) * maxTilt * 2;

    setTransform(
      `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.04) translateZ(24px)`
    );
    setShadow(
      `${-rotateY * 2}px ${rotateX * 2 + 22}px 40px -12px rgba(0,0,0,0.55), 0 0 32px ${glowColor}`
    );
    setGlare({ x: x * 100, y: y * 100, opacity: 0.05 });
  }, [maxTilt, glowColor, prefersReducedMotion]);

  const handleMouseLeave = useCallback(() => {
    setTransform('perspective(900px) rotateX(0deg) rotateY(0deg) scale(1) translateZ(0px)');
    setShadow('0 4px 12px -4px rgba(0,0,0,0.4)');
    setGlare((g) => ({ ...g, opacity: 0 }));
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`transition-transform duration-150 ease-out will-change-transform ${className}`}
      style={{ transform, boxShadow: shadow }}
    >
      <div className={`relative ${rounded} overflow-hidden`}>
        {children}
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-150"
          style={{
            opacity: glare.opacity,
            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(170,255,210,0.35), transparent 70%)`,
          }}
        />
      </div>
    </div>
  );
}