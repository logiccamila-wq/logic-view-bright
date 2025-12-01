import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface TextRevealProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  staggerChildren?: number;
  type?: 'char' | 'word' | 'line';
  animation?: 'fadeInUp' | 'fadeInDown' | 'slideInLeft' | 'slideInRight' | 'scaleIn';
}

const TextReveal: React.FC<TextRevealProps> = ({
  text,
  className = '',
  delay = 0,
  duration = 0.5,
  staggerChildren = 0.02,
  type = 'char',
  animation = 'fadeInUp'
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const getAnimationVariants = () => {
    switch (animation) {
      case 'fadeInDown':
        return {
          hidden: { opacity: 0, y: -20 },
          visible: { opacity: 1, y: 0 }
        };
      case 'slideInLeft':
        return {
          hidden: { opacity: 0, x: -50 },
          visible: { opacity: 1, x: 0 }
        };
      case 'slideInRight':
        return {
          hidden: { opacity: 0, x: 50 },
          visible: { opacity: 1, x: 0 }
        };
      case 'scaleIn':
        return {
          hidden: { opacity: 0, scale: 0.5 },
          visible: { opacity: 1, scale: 1 }
        };
      case 'fadeInUp':
      default:
        return {
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 }
        };
    }
  };

  const variants = getAnimationVariants();

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: delay,
        staggerChildren: staggerChildren
      }
    }
  };

  const renderContent = () => {
    switch (type) {
      case 'word':
        const words = text.split(' ');
        return (
          <motion.span
            ref={ref}
            variants={container}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className={className}
          >
            {words.map((word, index) => (
              <motion.span
                key={index}
                variants={variants}
                transition={{ duration }}
                className="inline-block mr-1"
              >
                {word}
              </motion.span>
            ))}
          </motion.span>
        );

      case 'line':
        const lines = text.split('\n');
        return (
          <motion.div
            ref={ref}
            variants={container}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className={className}
          >
            {lines.map((line, index) => (
              <motion.div
                key={index}
                variants={variants}
                transition={{ duration }}
                className="block"
              >
                {line}
              </motion.div>
            ))}
          </motion.div>
        );

      case 'char':
      default:
        const chars = text.split('');
        return (
          <motion.span
            ref={ref}
            variants={container}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className={className}
          >
            {chars.map((char, index) => (
              <motion.span
                key={index}
                variants={variants}
                transition={{ duration }}
                className="inline-block"
              >
                {char === ' ' ? '\u00A0' : char}
              </motion.span>
            ))}
          </motion.span>
        );
    }
  };

  return renderContent();
};

export default TextReveal;