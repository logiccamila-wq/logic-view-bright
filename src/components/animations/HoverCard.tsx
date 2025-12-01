import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';

interface HoverCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  scaleAmount?: number;
  rotateAmount?: number;
  onClick?: () => void;
  disabled?: boolean;
}

const HoverCard: React.FC<HoverCardProps> = ({
  children,
  className = '',
  glowColor = 'rgba(59, 130, 246, 0.3)',
  scaleAmount = 1.05,
  rotateAmount = 5,
  onClick,
  disabled = false
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-100, 100], [rotateAmount, -rotateAmount]));
  const rotateY = useSpring(useTransform(mouseX, [-100, 100], [-rotateAmount, rotateAmount]));

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    mouseX.set(e.clientX - rect.left - centerX);
    mouseY.set(e.clientY - rect.top - centerY);
  };

  const handleMouseLeave = () => {
    if (disabled) return;
    
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleMouseEnter = () => {
    if (disabled) return;
    setIsHovered(true);
  };

  return (
    <motion.div
      className={`relative ${className} ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      onClick={onClick}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px'
      }}
      whileHover={!disabled ? { scale: scaleAmount } : {}}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
    >
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-lg"
        style={{
          background: `radial-gradient(circle at ${mouseX.get() + 100}px ${mouseY.get() + 100}px, ${glowColor} 0%, transparent 70%)`,
          filter: 'blur(20px)',
          opacity: isHovered ? 1 : 0,
          transform: 'translateZ(-1px)'
        }}
        animate={{
          opacity: isHovered ? 1 : 0
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Card content */}
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d'
        }}
        className="relative bg-surface rounded-lg border border-border p-6 h-full"
      >
        {children}
        
        {/* Subtle border glow on hover */}
        <motion.div
          className="absolute inset-0 rounded-lg pointer-events-none"
          style={{
            border: `1px solid ${glowColor}`,
            opacity: 0
          }}
          animate={{
            opacity: isHovered ? 0.5 : 0
          }}
          transition={{ duration: 0.2 }}
        />
      </motion.div>

      {/* Floating elements */}
      {isHovered && (
        <motion.div
          className="absolute top-2 right-2"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        </motion.div>
      )}
    </motion.div>
  );
};

export default HoverCard;