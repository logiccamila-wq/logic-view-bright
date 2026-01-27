import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Check } from "lucide-react";
import { getPlanOptions } from "@/config/pricing";

interface LeadFormProps {
  onSuccess?: () => void;
  plans?: Array<{ value: string; label: string }>;
}

const defaultPlans = getPlanOptions("monthly");

/**
 * Enhanced lead capture form with domain preview
 * Integrates with Supabase leads table
 */
export function LeadForm({ onSuccess, plans = defaultPlans }: LeadFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    domain: "",
    plan: "",
  });
  const [lgpdAccepted, setLgpdAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const sanitizeDomain = (value: string): string => {
    return value.toLowerCase().replace(/[^a-z0-9-]/g, "");
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!lgpdAccepted) {
      toast.error("Por favor, aceite os termos da LGPD");
      return;
    }

    if (!formData.name || !formData.email || !formData.company) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);

    try {
      // NOTE: Type assertion needed because leads table exists in database
      // but is not yet in generated Supabase types (src/integrations/supabase/types.ts).
      // To fix: Run `npx supabase gen types typescript` to regenerate types
      // after deploying the leads table migration.
      const { error } = await (supabase as any).from("leads").insert([
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone || "",
          company: formData.company,
          source: "landing_page",
          status: "new",
          notes: JSON.stringify({
            domain: formData.domain,
            plan: formData.plan,
            lgpd_accepted: lgpdAccepted,
          }),
        },
      ]);

      if (error) throw error;

      setSubmitted(true);
      toast.success("Cadastro realizado com sucesso! Entraremos em contato.");
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error submitting lead:", error);
      toast.error("Erro ao enviar formulário. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/10 dark:bg-black/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 text-center"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
          Obrigado!
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Recebemos seu cadastro. Nossa equipe entrará em contato em breve.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="bg-white/10 dark:bg-black/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-xl"
    >
      <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Comece sua Jornada Digital
      </h3>

      <div className="space-y-4">
        {/* Name */}
        <div>
          <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">
            Nome Completo *
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="João Silva"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            required
            className="bg-white/20 dark:bg-black/20 border-white/30 backdrop-blur-sm"
          />
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
            E-mail Corporativo *
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="joao@empresa.com.br"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            required
            className="bg-white/20 dark:bg-black/20 border-white/30 backdrop-blur-sm"
          />
        </div>

        {/* Phone */}
        <div>
          <Label htmlFor="phone" className="text-gray-700 dark:text-gray-300">
            Telefone
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="(11) 99999-9999"
            value={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            className="bg-white/20 dark:bg-black/20 border-white/30 backdrop-blur-sm"
          />
        </div>

        {/* Company */}
        <div>
          <Label htmlFor="company" className="text-gray-700 dark:text-gray-300">
            Empresa *
          </Label>
          <Input
            id="company"
            type="text"
            placeholder="Transportadora XYZ"
            value={formData.company}
            onChange={(e) => handleChange("company", e.target.value)}
            required
            className="bg-white/20 dark:bg-black/20 border-white/30 backdrop-blur-sm"
          />
        </div>

        {/* Domain Preview */}
        <div>
          <Label htmlFor="domain" className="text-gray-700 dark:text-gray-300">
            Domínio Desejado
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="domain"
              type="text"
              placeholder="minhaempresa"
              value={formData.domain}
              onChange={(e) => handleChange("domain", sanitizeDomain(e.target.value))}
              className="bg-white/20 dark:bg-black/20 border-white/30 backdrop-blur-sm"
            />
            <span className="text-gray-600 dark:text-gray-400 whitespace-nowrap">
              .xyzlogicflow.com
            </span>
          </div>
          {formData.domain && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Seu domínio: <span className="font-medium">{formData.domain}.xyzlogicflow.com</span>
            </p>
          )}
        </div>

        {/* Plan */}
        <div>
          <Label htmlFor="plan" className="text-gray-700 dark:text-gray-300">
            Plano de Interesse
          </Label>
          <Select value={formData.plan} onValueChange={(value) => handleChange("plan", value)}>
            <SelectTrigger className="bg-white/20 dark:bg-black/20 border-white/30 backdrop-blur-sm">
              <SelectValue placeholder="Selecione um plano" />
            </SelectTrigger>
            <SelectContent>
              {plans.map((plan) => (
                <SelectItem key={plan.value} value={plan.value}>
                  {plan.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* LGPD Checkbox */}
        <div className="flex items-start gap-3">
          <Checkbox
            id="lgpd"
            checked={lgpdAccepted}
            onCheckedChange={(checked) => setLgpdAccepted(checked as boolean)}
          />
          <Label
            htmlFor="lgpd"
            className="text-sm text-gray-600 dark:text-gray-300 cursor-pointer leading-relaxed"
          >
            Aceito que meus dados sejam utilizados conforme a{" "}
            <a href="/privacy" className="text-indigo-600 dark:text-indigo-400 underline">
              Política de Privacidade
            </a>{" "}
            e{" "}
            <a href="/terms" className="text-indigo-600 dark:text-indigo-400 underline">
              Termos de Uso
            </a>
            , em conformidade com a LGPD.
          </Label>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={loading || !lgpdAccepted}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            "Começar Teste Grátis"
          )}
        </Button>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
        Ao enviar, você concorda em receber comunicações da xyzlogicflow.
      </p>
    </motion.form>
  );
}
