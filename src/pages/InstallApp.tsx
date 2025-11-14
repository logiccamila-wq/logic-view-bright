import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Smartphone, Download, CheckCircle } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallApp() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
            <Smartphone className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Instalar OptiLog</CardTitle>
          <CardDescription>
            Instale o aplicativo no seu dispositivo para acesso rápido e experiência otimizada
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isInstalled ? (
            <div className="text-center space-y-4">
              <div className="mx-auto p-3 bg-green-500/10 rounded-full w-fit">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <p className="text-sm text-muted-foreground">
                Aplicativo já instalado! Você pode acessá-lo pela tela inicial.
              </p>
            </div>
          ) : (
            <>
              {deferredPrompt ? (
                <Button onClick={handleInstall} className="w-full" size="lg">
                  <Download className="mr-2 h-5 w-5" />
                  Instalar Aplicativo
                </Button>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground text-center">
                    Para instalar o aplicativo:
                  </p>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className="font-semibold text-primary">iPhone/iPad:</div>
                      <div>
                        Toque em <span className="font-mono bg-muted px-1 rounded">⋯</span> no Safari
                        → "Adicionar à Tela de Início"
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className="font-semibold text-primary">Android:</div>
                      <div>
                        Toque em <span className="font-mono bg-muted px-1 rounded">⋮</span> no Chrome
                        → "Adicionar à tela inicial" ou "Instalar app"
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          <div className="pt-4 border-t">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              Benefícios
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                Acesso rápido pela tela inicial
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                Funciona offline
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                Notificações em tempo real
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                Experiência otimizada mobile
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
