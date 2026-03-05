import { Button } from "@/components/ui/button";

export function PWACacheReset() {
  const reset = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        for (const r of regs) await r.unregister();
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
    } finally {
      window.location.reload();
    }
  };
  return <Button variant="outline" onClick={reset}>Atualizar App</Button>;
}

