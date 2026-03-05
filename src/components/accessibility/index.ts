/**
 * @file Accessibility Helpers
 * @description Componentes e utilities para melhorar acessibilidade WCAG AAA
 */

export {
  AccessiblePage,
  AccessibilityAnnouncer,
  useAnnounce,
  AccessibleButton,
  AccessibleIcon,
  AccessibleList,
  AccessibleHeading,
} from './AccessibilityHelpers';

/**
 * Utilitários de contraste de cores WCAG AAA
 */

// Calcula luminância relativa de uma cor
export function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const sRGB = c / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Calcula rácio de contraste entre duas cores
export function getContrastRatio(
  rgb1: [number, number, number],
  rgb2: [number, number, number]
): number {
  const l1 = getRelativeLuminance(...rgb1);
  const l2 = getRelativeLuminance(...rgb2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Verifica se o contraste atende WCAG AAA (7:1 para texto normal, 4.5:1 para texto grande)
export function meetsWCAGAAA(
  foreground: [number, number, number],
  background: [number, number, number],
  largeText = false
): boolean {
  const ratio = getContrastRatio(foreground, background);
  return largeText ? ratio >= 4.5 : ratio >= 7;
}

/**
 * Classes CSS para screen reader only
 */
export const srOnly = 'sr-only';

/**
 * Gera ID único para aria-describedby
 */
let idCounter = 0;
export function generateAriaId(prefix = 'aria'): string {
  return `${prefix}-${++idCounter}`;
}
