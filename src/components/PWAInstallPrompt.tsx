import { useEffect, useState } from "react";
import { X, Download, Share, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Verifica se já está instalado
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true;

    setIsStandalone(standalone);

    // Detecta iOS e Android
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const android = /Android/.test(navigator.userAgent);

    setIsIOS(ios);
    setIsAndroid(android);

    // Verifica se o usuário já dispensou antes
    const dismissed = localStorage.getItem("pwa-install-dismissed");

    if ((ios || android) && !standalone && !dismissed) {
      if (ios) {
        setShowPrompt(true);
      }
    }

    // Handler Android
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setShowPrompt(false);
      localStorage.setItem("pwa-installed", "true");
    }

    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-install-dismissed", "true");
  };

  if (!showPrompt || isStandalone) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 pointer-events-none">
      <Card className="w-full max-w-md pointer-events-auto animate-in slide-in-from-bottom-5 duration-300 shadow-2xl border-2">
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Download className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Instalar OptiLog</h3>
                <p className="text-sm text-muted-foreground">Acesso rápido e offline</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleDismiss} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {isIOS && (
            <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
              <p className="text-sm font-medium">Como instalar no iPhone:</p>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-primary">1.</span>
                  <span>
                    Toque no botão <Share className="inline h-4 w-4 mx-1" /> <strong>Compartilhar</strong>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-primary">2.</span>
                  <span>
                    Role e toque em <Plus className="inline h-4 w-4 mx-1" /> <strong>Adicionar à Tela de Início</strong>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-primary">3.</span>
                  <span>
                    Depois toque em <strong>Adicionar</strong>
                  </span>
                </li>
              </ol>
            </div>
          )}

          {isAndroid && deferredPrompt && (
            <Button onClick={handleInstall} className="w-full" size="lg">
              <Download className="mr-2 h-5 w-5" />
              Instalar Agora
            </Button>
          )}

          {isAndroid && !deferredPrompt && (
            <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
              <p className="text-sm font-medium">Como instalar no Android:</p>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-primary">1.</span>
                  <span>Aperte o menu ⋮</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-primary">2.</span>
                  <span>
                    Escolha <strong>Instalar app</strong> ou <strong>Adicionar à tela inicial</strong>
                  </span>
                </li>
              </ol>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
