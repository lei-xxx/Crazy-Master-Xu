import React, { MouseEvent, ReactNode, useRef, useState } from 'react';
import { cn } from '../lib/utils';

interface HoverButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  glowColor?: string;
  backgroundColor?: string;
  textColor?: string;
  hoverTextColor?: string;
}

export const HoverButton: React.FC<HoverButtonProps> = ({
  children,
  className = '',
  disabled = false,
  glowColor = 'rgba(255,255,255,0.95)',
  backgroundColor = '#ffffff',
  textColor = '#050505',
  hoverTextColor = '#050505',
  onMouseMove,
  onMouseEnter,
  onMouseLeave,
  ...props
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [glowPosition, setGlowPosition] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (event: MouseEvent<HTMLButtonElement>) => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      setGlowPosition({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      });
    }
    onMouseMove?.(event);
  };

  const handleMouseEnter = (event: MouseEvent<HTMLButtonElement>) => {
    setIsHovered(true);
    onMouseEnter?.(event);
  };

  const handleMouseLeave = (event: MouseEvent<HTMLButtonElement>) => {
    setIsHovered(false);
    onMouseLeave?.(event);
  };

  return (
    <button
      ref={buttonRef}
      disabled={disabled}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'relative inline-flex cursor-pointer items-center justify-center overflow-hidden border-none font-semibold transition-[color,box-shadow,transform] duration-300 focus:outline-none focus:ring-2 focus:ring-white/70 focus:ring-offset-2 focus:ring-offset-black disabled:cursor-not-allowed disabled:opacity-50',
        isHovered && 'shadow-[0_0_58px_rgba(255,255,255,0.72)]',
        className
      )}
      style={{
        backgroundColor,
        color: isHovered ? hoverTextColor : textColor
      }}
      {...props}
    >
      <div
        className={cn(
          'pointer-events-none absolute h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-75 transition-transform duration-500 ease-out',
          isHovered ? 'scale-[1.25]' : 'scale-0'
        )}
        style={{
          left: `${glowPosition.x}px`,
          top: `${glowPosition.y}px`,
          background: `radial-gradient(circle, ${glowColor} 0%, rgba(255,255,255,0.46) 30%, transparent 76%)`
        }}
      />
      <span className="relative z-10 flex items-center justify-center">{children}</span>
    </button>
  );
};
