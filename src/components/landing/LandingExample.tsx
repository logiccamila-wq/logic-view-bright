/**
 * Landing Page Components Example
 * 
 * This file demonstrates how to use all the landing page components
 * Copy sections to your actual landing page as needed
 */

import {
  AnimatedHero,
  FeatureCard,
  PricingCard,
  StatsCounter,
  ModuleTabs,
  LeadForm,
  TestimonialCarousel,
  FAQAccordion,
  IntegrationGrid,
} from "@/components/landing";
import { Truck, Zap, Shield, TrendingUp, Users, DollarSign } from "lucide-react";

export default function LandingExample() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <AnimatedHero
        badge="🚀 Plataforma #1 em Gestão Logística"
        headline="Transforme sua Logística com Inteligência"
        subheadline="Gestão completa de frota, motoristas e operações em uma única plataforma moderna e intuitiva"
        primaryCTA={{
          text: "Começar Teste Grátis",
          onClick: () => window.scrollTo({ top: document.getElementById("lead-form")?.offsetTop || 0, behavior: "smooth" }),
        }}
        secondaryCTA={{
          text: "Ver Demo",
          onClick: () => window.open("/demo", "_blank"),
        }}
      />

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <StatsCounter
            value={85}
            suffix="%"
            label="Redução de Custos"
            icon={TrendingUp}
            colorScheme="accent"
          />
          <StatsCounter
            value={500}
            suffix="+"
            label="Empresas Ativas"
            icon={Users}
            colorScheme="primary"
          />
          <StatsCounter
            value={2500}
            suffix="+"
            label="Veículos Gerenciados"
            icon={Truck}
            colorScheme="secondary"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Recursos Poderosos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              icon={Truck}
              title="TMS Completo"
              description="Gestão end-to-end de transportes com rastreamento em tempo real, roteirização inteligente e documentação fiscal automatizada."
              colorScheme="primary"
              gradient
              link={{
                text: "Saiba mais",
                onClick: () => console.log("TMS clicked"),
              }}
            />
            <FeatureCard
              icon={DollarSign}
              title="Financeiro Integrado"
              description="Controle total de receitas e despesas, conciliação bancária automática e aprovações com workflow customizável."
              colorScheme="accent"
              gradient
              link={{
                text: "Saiba mais",
                onClick: () => console.log("Finance clicked"),
              }}
            />
            <FeatureCard
              icon={Shield}
              title="100% Seguro"
              description="Criptografia de ponta, backups automáticos, conformidade LGPD e infraestrutura cloud certificada."
              colorScheme="secondary"
              gradient
              link={{
                text: "Saiba mais",
                onClick: () => console.log("Security clicked"),
              }}
            />
          </div>
        </div>
      </section>

      {/* Module Tabs Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900 dark:text-white">
            Módulos Integrados
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-12 text-lg">
            Tudo que você precisa em um só lugar
          </p>
          <ModuleTabs />
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-purple-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900 dark:text-white">
            Planos Transparentes
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-12 text-lg">
            Escolha o plano ideal para seu negócio
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <PricingCard
              planName="Starter"
              price={{ monthly: 997, annual: 9970 }}
              description="Ideal para pequenas transportadoras"
              features={[
                "Até 5 usuários",
                "50 veículos",
                "TMS Básico",
                "Rastreamento GPS",
                "Suporte via e-mail",
                "10GB armazenamento",
              ]}
              onCTAClick={() => console.log("Starter clicked")}
            />
            <PricingCard
              planName="Professional"
              price={{ monthly: 2497, annual: 24970 }}
              description="Para operações em crescimento"
              features={[
                "Até 20 usuários",
                "200 veículos",
                "TMS Completo + IA",
                "Integrações avançadas",
                "Suporte prioritário",
                "100GB armazenamento",
                "Analytics avançado",
              ]}
              popular
              onCTAClick={() => console.log("Professional clicked")}
            />
            <PricingCard
              planName="Enterprise"
              price={{ monthly: 4997, annual: 49970 }}
              description="Solução completa e escalável"
              features={[
                "Usuários ilimitados",
                "Veículos ilimitados",
                "Todos os módulos",
                "API ilimitada",
                "Suporte 24/7 dedicado",
                "Armazenamento ilimitado",
                "White label",
                "SSO/SAML",
              ]}
              onCTAClick={() => console.log("Enterprise clicked")}
            />
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="py-20 px-4">
        <IntegrationGrid />
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            O que nossos clientes dizem
          </h2>
          <TestimonialCarousel
            testimonials={[
              {
                id: 1,
                name: "Carlos Mendes",
                role: "Diretor de Operações",
                company: "TransLog Brasil",
                quote: "A xyzlogicflow transformou nossa operação. Reduzimos custos em 35% e aumentamos a eficiência em tempo real.",
                rating: 5,
              },
              {
                id: 2,
                name: "Ana Paula Silva",
                role: "Gerente de Logística",
                company: "Rodocar Transportes",
                quote: "Plataforma intuitiva e completa. O suporte técnico é excepcional, sempre prontos para ajudar.",
                rating: 5,
              },
              {
                id: 3,
                name: "Roberto Ferreira",
                role: "CEO",
                company: "Expresso Norte",
                quote: "ROI positivo em 3 meses. A integração com nossos sistemas foi perfeita e sem dores de cabeça.",
                rating: 5,
              },
            ]}
          />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4">
        <FAQAccordion />
      </section>

      {/* Lead Form Section */}
      <section id="lead-form" className="py-20 px-4 bg-gradient-to-br from-purple-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Pronto para Começar?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Teste grátis por 14 dias. Sem cartão de crédito.
            </p>
          </div>
          <LeadForm
            onSuccess={() => {
              console.log("Lead submitted successfully!");
              // Redirect to thank you page or show success message
            }}
          />
        </div>
      </section>
    </div>
  );
}
