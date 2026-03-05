import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Smartphone, Download, CheckCircle, Truck, Wrench, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallApp() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showQR, setShowQR] = useState(false);
  
  const baseUrl = window.location.origin;
  const driverUrl = `${baseUrl}/driver-app`;
  const mechanicUrl = `${baseUrl}/mechanic`;

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
      <Card className="w-full max-w-2xl">
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
          
          <Tabs defaultValue="geral" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="geral">Geral</TabsTrigger>
              <TabsTrigger value="motorista">
                <Truck className="h-4 w-4 mr-2" />
                Motorista
              </TabsTrigger>
              <TabsTrigger value="mecanico">
                <Wrench className="h-4 w-4 mr-2" />
                Mecânico
              </TabsTrigger>
            </TabsList>

            <TabsContent value="geral" className="space-y-6 mt-6">
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

              <div className="pt-4 border-t space-y-4">
                <div>
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

                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Download Direto:</h3>
                  <div className="flex flex-col gap-2">
                    <a
                      href="https://play.google.com/store"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 20.5v-17c0-.59.34-1.11.84-1.35L13.69 12l-9.85 9.85c-.5-.24-.84-.76-.84-1.35zm13.81-5.38L6.05 21.34l8.49-8.49 2.27 2.27zm2.96-1.48l-2.34 1.17-2.5-2.5 2.5-2.5 2.34 1.17c.41.21.67.63.67 1.08s-.26.87-.67 1.08zM6.05 2.66l10.76 6.22-2.27 2.27-8.49-8.49z"/>
                      </svg>
                      Google Play
                    </a>
                    <a
                      href="https://www.apple.com/app-store/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                      </svg>
                      App Store
                    </a>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="motorista" className="space-y-4 mt-6">
              <div className="text-center space-y-4">
                <div className="mx-auto p-4 bg-primary/10 rounded-full w-fit">
                  <Truck className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">App para Motoristas</h3>
                <p className="text-sm text-muted-foreground">
                  Acesso direto ao portal do motorista com rastreamento, jornadas e gestão de viagens
                </p>

                <div className="flex flex-col items-center gap-4 p-6 bg-muted/30 rounded-lg">
                  <Button
                    onClick={() => setShowQR(!showQR)}
                    variant="outline"
                    className="gap-2"
                  >
                    <QrCode className="h-4 w-4" />
                    {showQR ? 'Ocultar QR Code' : 'Mostrar QR Code'}
                  </Button>
                  
                  {showQR && (
                    <div className="p-4 bg-white rounded-lg">
                      <QRCodeSVG value={driverUrl} size={200} />
                    </div>
                  )}

                  <div className="w-full space-y-2">
                    <p className="text-xs text-muted-foreground">Link direto:</p>
                    <code className="block p-3 bg-background rounded text-xs break-all">
                      {driverUrl}
                    </code>
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText(driverUrl);
                      }}
                      variant="secondary"
                      size="sm"
                      className="w-full"
                    >
                      Copiar Link
                    </Button>
                  </div>
                </div>

                <div className="text-left space-y-2">
                  <h4 className="font-semibold text-sm">Funcionalidades:</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      Controle de jornadas e pausas obrigatórias
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      Registro de despesas e abastecimentos
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      Acompanhamento de gratificações
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      Histórico de viagens e performance
                    </li>
                  </ul>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="mecanico" className="space-y-4 mt-6">
              <div className="text-center space-y-4">
                <div className="mx-auto p-4 bg-primary/10 rounded-full w-fit">
                  <Wrench className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Portal do Mecânico</h3>
                <p className="text-sm text-muted-foreground">
                  Gestão completa de manutenções, ordens de serviço e controle de oficina
                </p>

                <div className="flex flex-col items-center gap-4 p-6 bg-muted/30 rounded-lg">
                  <Button
                    onClick={() => setShowQR(!showQR)}
                    variant="outline"
                    className="gap-2"
                  >
                    <QrCode className="h-4 w-4" />
                    {showQR ? 'Ocultar QR Code' : 'Mostrar QR Code'}
                  </Button>
                  
                  {showQR && (
                    <div className="p-4 bg-white rounded-lg">
                      <QRCodeSVG value={mechanicUrl} size={200} />
                    </div>
                  )}

                  <div className="w-full space-y-2">
                    <p className="text-xs text-muted-foreground">Link direto:</p>
                    <code className="block p-3 bg-background rounded text-xs break-all">
                      {mechanicUrl}
                    </code>
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText(mechanicUrl);
                      }}
                      variant="secondary"
                      size="sm"
                      className="w-full"
                    >
                      Copiar Link
                    </Button>
                  </div>
                </div>

                <div className="text-left space-y-2">
                  <h4 className="font-semibold text-sm">Funcionalidades:</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      Ordens de serviço e checklists
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      Gestão de pneus (TPMS) e borracharia
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      Controle de lava-jato e oficina
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      Análise de custos de manutenção
                    </li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
