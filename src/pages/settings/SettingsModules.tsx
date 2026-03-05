import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

export default function SettingsModules() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('settings.modules.title')}</h1>
        <p className="text-muted-foreground">
          {t('settings.modules.description')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.modules.module_management')}</CardTitle>
          <CardDescription>
            {t('settings.modules.enable_disable_modules')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="fleet">{t('modules.fleet')}</Label>
              <Switch id="fleet" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="logistics">{t('modules.logistics')}</Label>
              <Switch id="logistics" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="maintenance">{t('modules.maintenance')}</Label>
              <Switch id="maintenance" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="financial">{t('modules.financial')}</Label>
              <Switch id="financial" />
            </div>
            <Button>{t('common.save')}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}