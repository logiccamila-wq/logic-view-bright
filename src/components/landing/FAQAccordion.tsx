import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  items?: FAQItem[];
}

const defaultFAQs: FAQItem[] = [
  {
    question: "Como funciona o período de teste grátis?",
    answer: "Você tem 14 dias para testar todas as funcionalidades da plataforma sem compromisso. Não é necessário cartão de crédito. Após o período, você pode escolher o plano que melhor atende suas necessidades.",
  },
  {
    question: "Quais integrações estão disponíveis?",
    answer: "Nossa plataforma integra nativamente com sistemas de ERP, contabilidade, bancos (OFX/CNAB), APIs de rastreamento (TomTom, Google Maps), CTe/MDFe (SEFAZ), e muito mais. Também oferecemos APIs REST para integrações personalizadas.",
  },
  {
    question: "Posso personalizar os módulos conforme minha operação?",
    answer: "Sim! A plataforma é altamente configurável. Você pode ativar/desativar módulos, criar campos customizados, definir workflows próprios e adaptar relatórios às suas necessidades específicas.",
  },
  {
    question: "Como funciona o suporte técnico?",
    answer: "Oferecemos suporte multicanal: chat ao vivo, e-mail, WhatsApp e telefone. Planos Professional e Enterprise incluem gerente de conta dedicado e suporte prioritário 24/7.",
  },
  {
    question: "Meus dados estão seguros?",
    answer: "Absoluta segurança! Usamos criptografia de ponta a ponta (SSL/TLS), backups automáticos diários, conformidade com LGPD, e infraestrutura em cloud certificada (AWS/Supabase). Você mantém controle total sobre seus dados.",
  },
  {
    question: "Preciso de conhecimento técnico para usar?",
    answer: "Não! A interface é intuitiva e pensada para usuários de todos os níveis. Oferecemos onboarding guiado, tutoriais em vídeo, documentação completa e treinamento personalizado para sua equipe.",
  },
  {
    question: "Posso começar com um plano e fazer upgrade depois?",
    answer: "Sim! Você pode começar com o plano Starter e fazer upgrade a qualquer momento. O ajuste é proporcional e imediato, sem burocracia.",
  },
  {
    question: "Qual a diferença entre os planos?",
    answer: "Todos os planos incluem funcionalidades core. Planos superiores oferecem mais usuários, armazenamento, integrações avançadas, IA/analytics, SLA de suporte e recursos enterprise (SSO, API ilimitada, white label).",
  },
];

/**
 * FAQ section with accordion UI
 * Smooth expand/collapse animations and semantic HTML
 */
export function FAQAccordion({ items = defaultFAQs }: FAQAccordionProps) {
  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white mb-4">
          <HelpCircle className="w-6 h-6" />
        </div>
        <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
          Perguntas Frequentes
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          Tire suas dúvidas sobre a plataforma
        </p>
      </motion.div>

      {/* Accordion */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
      >
        <Accordion
          type="single"
          collapsible
          className="bg-white/10 dark:bg-black/10 backdrop-blur-lg border border-white/20 rounded-2xl overflow-hidden"
        >
          {items.map((item, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border-b border-white/10 last:border-b-0"
            >
              <AccordionTrigger className="px-6 py-4 hover:bg-white/5 transition-colors text-left">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {item.question}
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 text-gray-600 dark:text-gray-300 leading-relaxed">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.div>

      {/* Still have questions? */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="text-center mt-8"
      >
        <p className="text-gray-600 dark:text-gray-300">
          Não encontrou sua resposta?{" "}
          <a
            href="/contact"
            className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
          >
            Entre em contato conosco
          </a>
        </p>
      </motion.div>
    </div>
  );
}
