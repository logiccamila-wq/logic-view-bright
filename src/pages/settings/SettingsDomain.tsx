import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function SettingsDomain() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('settings.domain.title')}</h1>
        <p className="text-muted-foreground">
          {t('settings.domain.description')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.domain.domain')}</CardTitle>
          <CardDescription>
            {t('settings.domain.configure_domain')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="domain">{t('settings.domain.custom_domain')}</Label>
              <Input id="domain" placeholder="your-company.com" />
            </div>
            <Button>{t('common.save')}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}