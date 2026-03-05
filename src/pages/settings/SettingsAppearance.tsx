import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Sun, Moon, Sparkles, Check, Copy, Download, Upload } from 'lucide-react';
import { useCustomTheme } from '@/lib/themes/ThemeProvider';
import { ThemePreset } from '@/lib/themes/theme-config';
import { themePresets } from '@/lib/themes/theme-config';

const SettingsAppearance: React.FC = () => {
  const { t } = useTranslation();
  const { currentTheme, setCustomTheme, isDark } = useCustomTheme();
  const [selectedPreset, setSelectedPreset] = useState<ThemePreset | null>(null);
  const [customColors, setCustomColorsState] = useState({
    primary: '#3B82F6',
    secondary: '#8B5CF6',
    accent: '#10B981',
    background: '#FFFFFF',
    surface: '#F8FAFC',
    text: '#1F2937'
  });
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    if (currentTheme) {
      setCustomColorsState({
        primary: currentTheme.primaryColor,
        secondary: currentTheme.secondaryColor,
        accent: currentTheme.accentColor,
        background: currentTheme.backgroundColor,
        surface: currentTheme.surfaceColor,
        text: currentTheme.textColor
      });
    }
  }, [currentTheme]);

  const handlePresetSelect = (preset: ThemePreset) => {
    setSelectedPreset(preset);
    const themeConfig = isDark ? preset.dark : preset.light;
    setCustomColorsState({
      primary: themeConfig.primaryColor,
      secondary: themeConfig.secondaryColor,
      accent: themeConfig.accentColor,
      background: themeConfig.backgroundColor,
      surface: themeConfig.surfaceColor,
      text: themeConfig.textColor
    });
    setCustomTheme(themeConfig);
  };

  const handleColorChange = (colorKey: keyof typeof customColors, value: string) => {
    const newColors = { ...customColors, [colorKey]: value };
    setCustomColorsState(newColors);
  };

  const copyToClipboard = async (color: string) => {
    try {
      await navigator.clipboard.writeText(color);
      setCopiedColor(color);
      setTimeout(() => setCopiedColor(null), 2000);
    } catch (err) {
      console.error('Failed to copy color:', err);
    }
  };

  const exportTheme = () => {
    const themeData = {
      name: 'Custom Theme',
      colors: customColors,
      timestamp: new Date().toISOString()
    };
    const dataStr = JSON.stringify(themeData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'optilog-custom-theme.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const importTheme = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const themeData = JSON.parse(e.target?.result as string);
          if (themeData.colors) {
            setCustomColorsState(themeData.colors);
          }
        } catch (err) {
          console.error('Failed to import theme:', err);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-text mb-2">
            {t('settings.appearance.title')}
          </h1>
          <p className="text-text-secondary">
            {t('settings.appearance.description')}
          </p>
        </motion.div>

        {/* Theme Presets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-text mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            {t('settings.appearance.themePresets')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {themePresets.map((preset, index) => (
              <motion.div
                key={preset.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedPreset?.id === preset.id
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => handlePresetSelect(preset)}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-text">{preset.name}</h3>
                  {selectedPreset?.id === preset.id && (
                    <Check className="w-5 h-5 text-primary" />
                  )}
                </div>
                <div className="flex gap-1 mb-3">
                  <div
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: (isDark ? preset.dark : preset.light).primaryColor }}
                  />
                  <div
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: (isDark ? preset.dark : preset.light).secondaryColor }}
                  />
                  <div
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: (isDark ? preset.dark : preset.light).accentColor }}
                  />
                  <div
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: (isDark ? preset.dark : preset.light).backgroundColor }}
                  />
                </div>
                <p className="text-sm text-text-secondary">{preset.name}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Color Customization */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-text flex items-center gap-2">
              <Palette className="w-5 h-5" />
              {t('settings.appearance.customColors')}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setPreviewMode(previewMode === 'light' ? 'dark' : 'light')}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface hover:bg-surface-hover transition-colors"
              >
                {previewMode === 'light' ? (
                  <><Moon className="w-4 h-4" /> {t('settings.appearance.darkMode')}</>
                ) : (
                  <><Sun className="w-4 h-4" /> {t('settings.appearance.lightMode')}</>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(customColors).map(([key, value]) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 rounded-lg bg-surface border border-border"
              >
                <label className="block text-sm font-medium text-text mb-2 capitalize">
                  {t(`settings.appearance.colors.${key}`)}
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={value}
                    onChange={(e) => handleColorChange(key as keyof typeof customColors, e.target.value)}
                    className="w-12 h-12 rounded-lg border-2 border-border cursor-pointer"
                  />
                  <div className="flex-1">
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => handleColorChange(key as keyof typeof customColors, e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-background border border-border text-text focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <button
                    onClick={() => copyToClipboard(value)}
                    className="p-2 rounded-lg bg-background border border-border hover:bg-surface-hover transition-colors"
                  >
                    {copiedColor === value ? (
                      <Check className="w-4 h-4 text-primary" />
                    ) : (
                      <Copy className="w-4 h-4 text-text-secondary" />
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Preview Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-text mb-4">
            {t('settings.appearance.preview')}
          </h2>
          <div
            className={`p-6 rounded-lg border-2 transition-all ${
              previewMode === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-border'
            }`}
            style={{
              backgroundColor: previewMode === 'dark' ? '#111827' : customColors.background,
              color: previewMode === 'dark' ? '#F9FAFB' : customColors.text
            }}
          >
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div
                  className="px-4 py-2 rounded-lg font-medium"
                  style={{ backgroundColor: customColors.primary, color: 'white' }}
                >
                  {t('settings.appearance.primaryButton')}
                </div>
                <div
                  className="px-4 py-2 rounded-lg font-medium"
                  style={{ backgroundColor: customColors.secondary, color: 'white' }}
                >
                  {t('settings.appearance.secondaryButton')}
                </div>
                <div
                  className="px-4 py-2 rounded-lg font-medium"
                  style={{ backgroundColor: customColors.accent, color: 'white' }}
                >
                  {t('settings.appearance.accentButton')}
                </div>
              </div>
              <div
                className="p-4 rounded-lg"
                style={{ backgroundColor: customColors.surface, color: customColors.text }}
              >
                <h3 className="font-semibold mb-2">{t('settings.appearance.sampleTitle')}</h3>
                <p className="text-sm opacity-80">{t('settings.appearance.sampleText')}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Import/Export */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex gap-4"
        >
          <button
            onClick={exportTheme}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
          >
            <Download className="w-4 h-4" />
            {t('settings.appearance.exportTheme')}
          </button>
          <label className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface border border-border hover:bg-surface-hover transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            {t('settings.appearance.importTheme')}
            <input
              type="file"
              accept=".json"
              onChange={importTheme}
              className="hidden"
            />
          </label>
        </motion.div>
      </div>
    </div>
  );
};

export default SettingsAppearance;