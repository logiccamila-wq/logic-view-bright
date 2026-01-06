/**
 * @file Animações com Framer Motion
 * @description Biblioteca completa de componentes de animação para o XYZLogicFlow
 * 
 * Uso:
 * - PageTransition: Para transições entre páginas
 * - FadeIn/FadeInUp/etc: Para animar elementos ao aparecer
 * - StaggerContainer/StaggerItem: Para animar listas em sequência
 * - HoverScale: Para efeitos de hover
 * - Bounce/Pulse: Para animações contínuas
 */

export {
  PageTransition,
  AnimatedPage,
  pageVariants,
  SlideRightTransition,
  SlideLeftTransition,
  ScaleTransition,
  FadeTransition,
} from './PageTransition';

export {
  FadeIn,
  FadeInUp,
  FadeInLeft,
  FadeInRight,
  ScaleIn,
  StaggerContainer,
  StaggerItem,
  Bounce,
  Pulse,
  Shake,
  HoverScale,
  RotateIn,
} from './MotionEffects';

// Variants pré-definidas para uso direto com motion.div
export const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const slideUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const slideLeftVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

export const slideRightVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
};

export const scaleInVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
};

export const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const staggerItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};
