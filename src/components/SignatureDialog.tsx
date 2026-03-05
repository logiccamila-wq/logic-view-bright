import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import SignatureCanvas from "react-signature-canvas";

interface SignatureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportId: string;
  reportType: "weekly_journey" | "payroll" | "service_order";
  onSigned: () => void;
}

export function SignatureDialog({
  open,
  onOpenChange,
  reportId,
  reportType,
  onSigned,
}: SignatureDialogProps) {
  const { user } = useAuth();
  const sigCanvas = useRef<any>(null);
  const [loading, setLoading] = useState(false);

  const clear = () => {
    sigCanvas.current?.clear();
  };

  const save = async () => {
    if (sigCanvas.current?.isEmpty()) {
      toast.error("Por favor, assine antes de confirmar");
      return;
    }

    setLoading(true);
    try {
      const signatureData = sigCanvas.current.toDataURL();
      
      // Get user info
      const userAgent = navigator.userAgent;
      const ipAddress = ""; // In production, get from server

      const { error } = await (supabase as any)
        .from("digital_signatures")
        .insert({
          report_id: reportId,
          report_type: reportType,
          signer_id: user!.id,
          signature_data: signatureData,
          ip_address: ipAddress,
          user_agent: userAgent,
        });

      if (error) throw error;

      toast.success("Relatório assinado com sucesso!");
      onOpenChange(false);
      onSigned();
    } catch (error) {
      console.error("Error saving signature:", error);
      toast.error("Erro ao salvar assinatura");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assinatura Digital</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="border border-border rounded-lg p-2 bg-white">
            <SignatureCanvas
              ref={sigCanvas}
              canvasProps={{
                className: "w-full h-64",
              }}
            />
          </div>

          <div className="flex justify-between gap-2">
            <Button variant="outline" onClick={clear}>
              Limpar
            </Button>
            <Button onClick={save} disabled={loading}>
              {loading ? "Salvando..." : "Confirmar Assinatura"}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground mt-4 space-y-1">
            <p>
              Ao assinar digitalmente este documento, você concorda que esta assinatura tem o mesmo
              valor legal de uma assinatura manuscrita.
            </p>
            <p>
              A assinatura digital será registrada com data, hora, IP e identificação do dispositivo
              utilizado.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}