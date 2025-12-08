import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Truck, Shield, Zap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-background border-t py-6">
      <div className="container mx-auto px-4 text-center">
        <p className="text-muted-foreground text-sm">
          © 2025 Plataforma Logística. Todos os direitos reservados. | Desenvolvido por XYZLogicFlow
        </p>
      </div>
    </footer>
  );
}
