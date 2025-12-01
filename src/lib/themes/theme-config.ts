export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  borderColor: string;
  successColor: string;
  warningColor: string;
  errorColor: string;
  infoColor: string;
}

export interface ThemePreset {
  id: string;
  name: string;
  light: ThemeConfig;
  dark: ThemeConfig;
  isPremium: boolean;
}

export const defaultLightTheme: ThemeConfig = {
  primaryColor: '#0066FF',
  secondaryColor: '#00FF88',
  accentColor: '#FF6B35',
  backgroundColor: '#FFFFFF',
  surfaceColor: '#F8F9FA',
  textColor: '#1A1A1A',
  borderColor: '#E9ECEF',
  successColor: '#28A745',
  warningColor: '#FFC107',
  errorColor: '#DC3545',
  infoColor: '#17A2B8',
};

export const defaultDarkTheme: ThemeConfig = {
  primaryColor: '#00FF88',
  secondaryColor: '#0066FF',
  accentColor: '#FF6B35',
  backgroundColor: '#0A0A0A',
  surfaceColor: '#1A1A1A',
  textColor: '#FFFFFF',
  borderColor: '#333333',
  successColor: '#28A745',
  warningColor: '#FFC107',
  errorColor: '#DC3545',
  infoColor: '#17A2B8',
};

export const themePresets: ThemePreset[] = [
  {
    id: 'logistics-intelligence',
    name: 'Logistics Intelligence',
    light: defaultLightTheme,
    dark: defaultDarkTheme,
    isPremium: false,
  },
  {
    id: 'aerospace-control',
    name: 'Aerospace Control',
    light: {
      primaryColor: '#1E3A8A',
      secondaryColor: '#059669',
      accentColor: '#DC2626',
      backgroundColor: '#F8FAFC',
      surfaceColor: '#FFFFFF',
      textColor: '#0F172A',
      borderColor: '#E2E8F0',
      successColor: '#059669',
      warningColor: '#D97706',
      errorColor: '#DC2626',
      infoColor: '#2563EB',
    },
    dark: {
      primaryColor: '#3B82F6',
      secondaryColor: '#10B981',
      accentColor: '#EF4444',
      backgroundColor: '#0F172A',
      surfaceColor: '#1E293B',
      textColor: '#F8FAFC',
      borderColor: '#334155',
      successColor: '#10B981',
      warningColor: '#F59E0B',
      errorColor: '#EF4444',
      infoColor: '#3B82F6',
    },
    isPremium: true,
  },
  {
    id: 'neon-future',
    name: 'Neon Future',
    light: {
      primaryColor: '#7C3AED',
      secondaryColor: '#EC4899',
      accentColor: '#F59E0B',
      backgroundColor: '#FDF4FF',
      surfaceColor: '#FFFFFF',
      textColor: '#1F2937',
      borderColor: '#E5E7EB',
      successColor: '#10B981',
      warningColor: '#F59E0B',
      errorColor: '#EF4444',
      infoColor: '#3B82F6',
    },
    dark: {
      primaryColor: '#A78BFA',
      secondaryColor: '#F472B6',
      accentColor: '#FBBF24',
      backgroundColor: '#111827',
      surfaceColor: '#1F2937',
      textColor: '#F9FAFB',
      borderColor: '#374151',
      successColor: '#34D399',
      warningColor: '#FBBF24',
      errorColor: '#F87171',
      infoColor: '#60A5FA',
    },
    isPremium: true,
  },
];

export function generateCSSVariables(theme: ThemeConfig, isDark = false): string {
  const prefix = isDark ? '--dark' : '--light';
  return `
    ${prefix}-primary: ${theme.primaryColor};
    ${prefix}-secondary: ${theme.secondaryColor};
    ${prefix}-accent: ${theme.accentColor};
    ${prefix}-background: ${theme.backgroundColor};
    ${prefix}-surface: ${theme.surfaceColor};
    ${prefix}-text: ${theme.textColor};
    ${prefix}-border: ${theme.borderColor};
    ${prefix}-success: ${theme.successColor};
    ${prefix}-warning: ${theme.warningColor};
    ${prefix}-error: ${theme.errorColor};
    ${prefix}-info: ${theme.infoColor};
  `;
}

export function applyThemeToCSS(theme: ThemeConfig, isDark = false): void {
  const root = document.documentElement;
  const prefix = isDark ? '--dark' : '--light';
  
  root.style.setProperty(`${prefix}-primary`, theme.primaryColor);
  root.style.setProperty(`${prefix}-secondary`, theme.secondaryColor);
  root.style.setProperty(`${prefix}-accent`, theme.accentColor);
  root.style.setProperty(`${prefix}-background`, theme.backgroundColor);
  root.style.setProperty(`${prefix}-surface`, theme.surfaceColor);
  root.style.setProperty(`${prefix}-text`, theme.textColor);
  root.style.setProperty(`${prefix}-border`, theme.borderColor);
  root.style.setProperty(`${prefix}-success`, theme.successColor);
  root.style.setProperty(`${prefix}-warning`, theme.warningColor);
  root.style.setProperty(`${prefix}-error`, theme.errorColor);
  root.style.setProperty(`${prefix}-info`, theme.infoColor);
}