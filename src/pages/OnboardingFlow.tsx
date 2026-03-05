import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronRight, Truck, Users, Package, CheckCircle } from 'lucide-react';

interface OnboardingData {
  companyName: string;
  industry: string;
  fleetSize: string;
  primaryUse: string;
}

export default function OnboardingFlow() {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    companyName: '',
    industry: '',
    fleetSize: '',
    primaryUse: ''
  });

  const steps = [
    {
      title: t('onboarding.welcome.title'),
      description: t('onboarding.welcome.description')
    },
    {
      title: t('onboarding.company.title'),
      description: t('onboarding.company.description')
    },
    {
      title: t('onboarding.fleet.title'),
      description: t('onboarding.fleet.description')
    },
    {
      title: t('onboarding.complete.title'),
      description: t('onboarding.complete.description')
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="text-center space-y-6">
            <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
              <Truck className="w-12 h-12 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{t('onboarding.welcome.title')}</h2>
              <p className="text-muted-foreground mt-2">
                {t('onboarding.welcome.description')}
              </p>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="companyName">{t('onboarding.company.name')}</Label>
              <Input
                id="companyName"
                value={onboardingData.companyName}
                onChange={(e) => setOnboardingData({...onboardingData, companyName: e.target.value})}
                placeholder={t('onboarding.company.name_placeholder')}
              />
            </div>
            <div>
              <Label htmlFor="industry">{t('onboarding.company.industry')}</Label>
              <Select value={onboardingData.industry} onValueChange={(value) => setOnboardingData({...onboardingData, industry: value})}>
                <SelectTrigger id="industry">
                  <SelectValue placeholder={t('onboarding.company.select_industry')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transportation">{t('onboarding.company.transportation')}</SelectItem>
                  <SelectItem value="logistics">{t('onboarding.company.logistics')}</SelectItem>
                  <SelectItem value="construction">{t('onboarding.company.construction')}</SelectItem>
                  <SelectItem value="delivery">{t('onboarding.company.delivery')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="fleetSize">{t('onboarding.fleet.size')}</Label>
              <Select value={onboardingData.fleetSize} onValueChange={(value) => setOnboardingData({...onboardingData, fleetSize: value})}>
                <SelectTrigger id="fleetSize">
                  <SelectValue placeholder={t('onboarding.fleet.select_size')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-10">1-10 {t('common.vehicles')}</SelectItem>
                  <SelectItem value="11-50">11-50 {t('common.vehicles')}</SelectItem>
                  <SelectItem value="51-200">51-200 {t('common.vehicles')}</SelectItem>
                  <SelectItem value="200+">200+ {t('common.vehicles')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="primaryUse">{t('onboarding.fleet.primary_use')}</Label>
              <Select value={onboardingData.primaryUse} onValueChange={(value) => setOnboardingData({...onboardingData, primaryUse: value})}>
                <SelectTrigger id="primaryUse">
                  <SelectValue placeholder={t('onboarding.fleet.select_use')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cargo">{t('onboarding.fleet.cargo')}</SelectItem>
                  <SelectItem value="passenger">{t('onboarding.fleet.passenger')}</SelectItem>
                  <SelectItem value="mixed">{t('onboarding.fleet.mixed')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="text-center space-y-6">
            <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{t('onboarding.complete.title')}</h2>
              <p className="text-muted-foreground mt-2">
                {t('onboarding.complete.description')}
              </p>
            </div>
            <Button size="lg" className="mt-4">
              {t('onboarding.complete.go_to_dashboard')}
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 flex-1 rounded-full mx-1 transition-colors ${
                    index <= currentStep ? 'bg-primary' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <CardTitle>{steps[currentStep].title}</CardTitle>
            <CardDescription>{steps[currentStep].description}</CardDescription>
          </CardHeader>
          <CardContent>
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStepContent()}
            </motion.div>
            
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
              >
                {t('common.previous')}
              </Button>
              
              {currentStep < steps.length - 1 ? (
                <Button onClick={handleNext}>
                  {t('common.next')}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}