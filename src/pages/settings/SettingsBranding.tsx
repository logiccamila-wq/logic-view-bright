import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Building, Upload, Save, Eye, RefreshCw, Image, Type } from 'lucide-react';

const SettingsBranding: React.FC = () => {
  const { t } = useTranslation();
  const [companyName, setCompanyName] = useState('OptiLog');
  const [tagline, setTagline] = useState('Transformação Digital em Logística');
  const [primaryLogo, setPrimaryLogo] = useState<string | null>(null);
  const [favicon, setFavicon] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'primary' | 'favicon') => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (type === 'primary') {
          setPrimaryLogo(result);
        } else {
          setFavicon(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      // Show success notification (would be implemented with toast)
      alert(t('settings.branding.saveSuccess'));
    }, 1500);
  };

  const handleReset = () => {
    setCompanyName('OptiLog');
    setTagline('Transformação Digital em Logística');
    setPrimaryLogo(null);
    setFavicon(null);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-text mb-2">
            {t('settings.branding.title')}
          </h1>
          <p className="text-text-secondary">
            {t('settings.branding.description')}
          </p>
        </motion.div>

        <div className="grid gap-6">
          {/* Company Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-lg bg-surface border border-border"
          >
            <h2 className="text-xl font-semibold text-text mb-4 flex items-center gap-2">
              <Building className="w-5 h-5" />
              {t('settings.branding.companyInfo')}
            </h2>
            
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  {t('settings.branding.companyName')}
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-background border border-border text-text focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter company name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  {t('settings.branding.tagline')}
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-background border border-border text-text focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter company tagline"
                />
              </div>
            </div>
          </motion.div>

          {/* Logo Upload */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-lg bg-surface border border-border"
          >
            <h2 className="text-xl font-semibold text-text mb-4 flex items-center gap-2">
              <Image className="w-5 h-5" />
              {t('settings.branding.logos')}
            </h2>
            
            <div className="grid gap-6">
              {/* Primary Logo */}
              <div>
                <label className="block text-sm font-medium text-text mb-3">
                  {t('settings.branding.primaryLogo')}
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-background">
                    {primaryLogo ? (
                      <img src={primaryLogo} alt="Primary logo" className="w-20 h-20 object-contain" />
                    ) : (
                      <Image className="w-8 h-8 text-text-secondary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors cursor-pointer">
                      <Upload className="w-4 h-4" />
                      {t('settings.branding.uploadLogo')}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleLogoUpload(e, 'primary')}
                        className="hidden"
                      />
                    </label>
                    <p className="text-sm text-text-secondary mt-2">
                      {t('settings.branding.logoRequirements')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Favicon */}
              <div>
                <label className="block text-sm font-medium text-text mb-3">
                  {t('settings.branding.favicon')}
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-background">
                    {favicon ? (
                      <img src={favicon} alt="Favicon" className="w-12 h-12 object-contain" />
                    ) : (
                      <Type className="w-6 h-6 text-text-secondary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors cursor-pointer">
                      <Upload className="w-4 h-4" />
                      {t('settings.branding.uploadFavicon')}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleLogoUpload(e, 'favicon')}
                        className="hidden"
                      />
                    </label>
                    <p className="text-sm text-text-secondary mt-2">
                      {t('settings.branding.faviconRequirements')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-lg bg-surface border border-border"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-text">
                {t('settings.branding.preview')}
              </h2>
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
              >
                <Eye className="w-4 h-4" />
                {previewMode ? t('settings.branding.hidePreview') : t('settings.branding.showPreview')}
              </button>
            </div>
            
            {previewMode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-6 rounded-lg bg-background border border-border"
              >
                <div className="flex items-center gap-4 mb-4">
                  {primaryLogo && (
                    <img src={primaryLogo} alt={companyName} className="w-12 h-12 object-contain" />
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-text">{companyName}</h3>
                    <p className="text-text-secondary">{tagline}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                    <span className="text-text">Dashboard Module</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-secondary"></div>
                    <span className="text-text">TMS Module</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-accent"></div>
                    <span className="text-text">WMS Module</span>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex gap-4"
          >
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {loading ? t('settings.branding.saving') : t('settings.branding.saveChanges')}
            </button>
            
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-surface border border-border hover:bg-surface-hover transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              {t('settings.branding.reset')}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SettingsBranding;