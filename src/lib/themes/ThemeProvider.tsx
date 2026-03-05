import { createContext, useContext, useEffect, useState } from 'react';
import { ThemeProvider as NextThemeProvider, useTheme } from 'next-themes';
import { ThemeConfig, ThemePreset, themePresets, applyThemeToCSS } from './theme-config';

interface ThemeContextType {
  currentTheme: ThemeConfig;
  currentPreset: ThemePreset | null;
  isDark: boolean;
  setThemePreset: (preset: ThemePreset) => void;
  setCustomTheme: (theme: ThemeConfig, isDark?: boolean) => void;
  availablePresets: ThemePreset[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme();
  const [currentPreset, setCurrentPreset] = useState<ThemePreset | null>(null);
  const [customTheme, setCustomTheme] = useState<ThemeConfig | null>(null);
  const isDark = theme === 'dark';

  useEffect(() => {
    if (customTheme) {
      applyThemeToCSS(customTheme, isDark);
    } else if (currentPreset) {
      const themeConfig = isDark ? currentPreset.dark : currentPreset.light;
      applyThemeToCSS(themeConfig, isDark);
    }
  }, [currentPreset, customTheme, isDark]);

  const setThemePreset = (preset: ThemePreset) => {
    setCurrentPreset(preset);
    setCustomTheme(null);
  };

  const setCustomThemeConfig = (theme: ThemeConfig, dark = isDark) => {
    setCustomTheme(theme);
    setCurrentPreset(null);
  };

  const currentTheme = customTheme || currentPreset?.[isDark ? 'dark' : 'light'] || 
    (isDark ? themePresets[0].dark : themePresets[0].light);

  const value: ThemeContextType = {
    currentTheme,
    currentPreset,
    isDark,
    setThemePreset,
    setCustomTheme: setCustomThemeConfig,
    availablePresets: themePresets,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useCustomTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useCustomTheme must be used within a ThemeProvider');
  }
  return context;
}

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ThemeProvider>
        <style>{`
          :root {
            --light-primary: #0066FF;
            --light-secondary: #00FF88;
            --light-accent: #FF6B35;
            --light-background: #FFFFFF;
            --light-surface: #F8F9FA;
            --light-text: #1A1A1A;
            --light-border: #E9ECEF;
            --light-success: #28A745;
            --light-warning: #FFC107;
            --light-error: #DC3545;
            --light-info: #17A2B8;
            
            --dark-primary: #00FF88;
            --dark-secondary: #0066FF;
            --dark-accent: #FF6B35;
            --dark-background: #0A0A0A;
            --dark-surface: #1A1A1A;
            --dark-text: #FFFFFF;
            --dark-border: #333333;
            --dark-success: #28A745;
            --dark-warning: #FFC107;
            --dark-error: #DC3545;
            --dark-info: #17A2B8;
          }
          
          .light {
            --primary: var(--light-primary);
            --secondary: var(--light-secondary);
            --accent: var(--light-accent);
            --background: var(--light-background);
            --surface: var(--light-surface);
            --text: var(--light-text);
            --border: var(--light-border);
            --success: var(--light-success);
            --warning: var(--light-warning);
            --error: var(--light-error);
            --info: var(--light-info);
          }
          
          .dark {
            --primary: var(--dark-primary);
            --secondary: var(--dark-secondary);
            --accent: var(--dark-accent);
            --background: var(--dark-background);
            --surface: var(--dark-surface);
            --text: var(--dark-text);
            --border: var(--dark-border);
            --success: var(--dark-success);
            --warning: var(--dark-warning);
            --error: var(--dark-error);
            --info: var(--dark-info);
          }
          
          * {
            transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
          }
        `}</style>
        {children}
      </ThemeProvider>
    </NextThemeProvider>
  );
}