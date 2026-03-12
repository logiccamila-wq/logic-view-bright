import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Building2,
  Users,
  Truck,
  Star,
  Warehouse,
  Calculator,
  Activity,
  Zap,
  Shield,
  Cpu,
  TrendingUp,
  DollarSign,
  Headphones,
  Layers,
  Menu,
  X,
  ChevronRight,
  Check,
  ArrowRight,
  MapPin,
  MessageSquare,
  FileText,
  Database,
  Globe2,
  Palette,
} from "lucide-react";
import ParticleBackground from "@/components/animations/ParticleBackground";
import { AnimatedHero } from "@/components/landing/AnimatedHero";
import { FeatureCard } from "@/components/landing/FeatureCard";
import { PricingCard } from "@/components/landing/PricingCard";
import { StatsCounter } from "@/components/landing/StatsCounter";
import { ModuleTabs } from "@/components/landing/ModuleTabs";
import { LeadForm } from "@/components/landing/LeadForm";
import { TestimonialCarousel } from "@/components/landing/TestimonialCarousel";
import { FAQAccordion } from "@/components/landing/FAQAccordion";
import { IntegrationGrid } from "@/components/landing/IntegrationGrid";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PRICING } from "@/config/pricing";
import { supportedLanguages } from "@/lib/i18n/i18n-config";
import {
  landingPalettes,
  landingTranslations,
  resolveLandingLanguage,
  resolveLandingPalette,
} from "@/pages/unifiedLandingContent";

export default function UnifiedLandingPage() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(() => resolveLandingLanguage(i18n.language));
  const [selectedPalette, setSelectedPalette] = useState("pilot-blue");
  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 100], [0, 0.95]);

  // Detect domain/branding
  const searchParams = new URLSearchParams(window.location.search);
  const brand = searchParams.get("brand");
  const customDomain = window.location.hostname;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setSelectedLanguage(resolveLandingLanguage(i18n.language));
  }, [i18n.language]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setMobileMenuOpen(false);
    }
  };

  const activePalette = resolveLandingPalette(selectedPalette);
  const copy = landingTranslations[selectedLanguage];

  const navigationLinks = [
    { label: copy.navigation.solutions, id: "features" },
    { label: copy.navigation.plans, id: "pricing" },
    { label: copy.navigation.resources, id: "modules" },
    { label: copy.navigation.contact, id: "contact" },
  ];

  const handleLanguageChange = (languageCode: string) => {
    const nextLanguage = resolveLandingLanguage(languageCode);
    setSelectedLanguage(nextLanguage);
    i18n.changeLanguage(nextLanguage);
  };

  const features = [
    {
      title: "TMS Completo",
      description:
        "Gestão completa de transporte com rastreamento real-time, otimização de rotas e emissão automática de CTe/MDFe",
      icon: Truck,
      colorScheme: "secondary" as const,
    },
    {
      title: "WMS Inteligente",
      description:
        "Controle total do armazém com picking otimizado, inventário automático e endereçamento dinâmico",
      icon: Warehouse,
      colorScheme: "primary" as const,
    },
    {
      title: "ERP Financeiro",
      description:
        "Gestão financeira completa com DRE, fluxo de caixa, contas a pagar/receber e conciliação bancária",
      icon: Calculator,
      colorScheme: "accent" as const,
    },
    {
      title: "CRM Integrado",
      description:
        "Gestão de clientes, funil de vendas, propostas comerciais e histórico completo de interações",
      icon: Users,
      colorScheme: "warning" as const,
    },
    {
      title: "Control Tower",
      description:
        "Torre de controle logística com visibilidade total da operação em tempo real",
      icon: Activity,
      colorScheme: "warning" as const,
    },
    {
      title: "IA & Machine Learning",
      description:
        "Otimização automática de rotas, previsão de demanda e manutenção preditiva",
      icon: Zap,
      colorScheme: "warning" as const,
    },
    {
      title: "Blockchain Tracking",
      description:
        "Rastreabilidade total com blockchain para segurança e transparência nas operações",
      icon: Shield,
      colorScheme: "secondary" as const,
    },
    {
      title: "IoT & Telemetria",
      description:
        "Telemetria veicular, sensores IoT e monitoramento remoto de ativos",
      icon: Cpu,
      colorScheme: "primary" as const,
    },
  ];

  const socialProofStats = [
    {
      value: 1000,
      suffix: "+",
      label: "Empresas",
      icon: Building2,
    },
    {
      value: 10000,
      suffix: "+",
      label: "Usuários",
      icon: Users,
    },
    {
      value: 5,
      suffix: "M+",
      label: "Entregas",
      icon: Truck,
    },
    {
      value: 4.9,
      suffix: "/5",
      label: "Estrelas",
      icon: Star,
    },
  ];

  const benefitStats = [
    {
      value: 40,
      suffix: "%",
      label: "Aumento de Produtividade",
      icon: TrendingUp,
    },
    {
      value: 30,
      suffix: "%",
      label: "Redução de Custos",
      icon: DollarSign,
    },
    {
      value: 98,
      suffix: "%",
      label: "Satisfação dos Clientes",
      icon: Star,
    },
    {
      value: 24,
      suffix: "/7",
      label: "Suporte Especializado",
      icon: Headphones,
    },
  ];

  const pricingPlans = [
    {
      planName: PRICING.starter.label,
      price: {
        monthly: PRICING.starter.monthly,
        annual: PRICING.starter.annual,
      },
      description: "Perfeito para pequenas empresas começando a digitalização",
      features: [
        "TMS Básico",
        "Até 5 usuários",
        "Até 10 veículos",
        "Rastreamento em tempo real",
        "Suporte via email",
        "Armazenamento 10GB",
      ],
      ctaText: "Começar Teste",
      popular: false,
    },
    {
      planName: PRICING.professional.label,
      price: {
        monthly: PRICING.professional.monthly,
        annual: PRICING.professional.annual,
      },
      description: "Para empresas em crescimento que precisam de mais recursos",
      features: [
        "TMS + WMS + ERP",
        "Até 20 usuários",
        "Até 50 veículos",
        "Integrações avançadas",
        "Suporte prioritário",
        "IA básica",
        "Armazenamento 100GB",
        "API completa",
      ],
      ctaText: "Começar Teste",
      popular: true,
    },
    {
      planName: PRICING.enterprise.label,
      price: {
        monthly: PRICING.enterprise.monthly,
        annual: PRICING.enterprise.annual,
      },
      description: "Solução completa para grandes operações logísticas",
      features: [
        "Todos os módulos",
        "Usuários ilimitados",
        "Veículos ilimitados",
        "White-label",
        "Suporte 24/7",
        "IA avançada",
        "Blockchain",
        "Armazenamento ilimitado",
        "Gerente de conta dedicado",
      ],
      ctaText: "Falar com Vendas",
      popular: false,
    },
  ];

  const innovationFeatures = [
    {
      icon: Zap,
      title: "IA & Machine Learning",
      description:
        "Algoritmos avançados de IA para otimização de rotas, previsão de demanda e manutenção preditiva",
      gradient: "from-yellow-500 to-orange-500",
    },
    {
      icon: Shield,
      title: "Blockchain",
      description:
        "Rastreabilidade imutável e transparente de toda a cadeia logística com tecnologia blockchain",
      gradient: "from-cyan-500 to-blue-500",
    },
    {
      icon: Activity,
      title: "IoT & Telemetria",
      description:
        "Sensores inteligentes e telemetria em tempo real para monitoramento completo da frota",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: Layers,
      title: "Digital Twin",
      description:
        "Gêmeos digitais da operação para simulação e otimização antes da implementação",
      gradient: "from-green-500 to-emerald-500",
    },
  ];

  const testimonials = [
    {
      id: 1,
      name: "João Silva",
      role: "CEO",
      company: "TransLog Brasil",
      quote:
        "Reduzimos custos em 35% no primeiro trimestre após implementar o XYZLogicFlow. A plataforma é intuitiva e o suporte é excepcional.",
      rating: 5,
      photo: "https://ui-avatars.com/api/?name=Joao+Silva&background=0D8ABC&color=fff",
    },
    {
      id: 2,
      name: "Maria Santos",
      role: "Gerente de Logística",
      company: "LogFast",
      quote:
        "A plataforma transformou nossa operação. Agora temos visibilidade total de todos os processos e conseguimos tomar decisões mais rápidas e assertivas.",
      rating: 5,
      photo: "https://ui-avatars.com/api/?name=Maria+Santos&background=7C3AED&color=fff",
    },
    {
      id: 3,
      name: "Pedro Costa",
      role: "Diretor de TI",
      company: "CargoTech",
      quote:
        "Melhor investimento em tecnologia que fizemos. A integração com nossos sistemas foi perfeita e o ROI apareceu em menos de 6 meses.",
      rating: 5,
      photo: "https://ui-avatars.com/api/?name=Pedro+Costa&background=059669&color=fff",
    },
  ];

  const faqs = [
    {
      question: "Como funciona o período de teste gratuito?",
      answer:
        "Oferecemos 14 dias de teste completamente grátis, sem necessidade de cartão de crédito. Você terá acesso a todos os recursos do plano escolhido e poderá cancelar a qualquer momento.",
    },
    {
      question: "Posso migrar meus dados de outro sistema?",
      answer:
        "Sim! Nossa equipe especializada oferece suporte completo para migração de dados de qualquer sistema. Fazemos a importação de cadastros, históricos e documentos sem perda de informações.",
    },
    {
      question: "A plataforma é compatível com dispositivos móveis?",
      answer:
        "Sim, o XYZLogicFlow é 100% responsivo e também oferece aplicativos nativos para iOS e Android, permitindo que motoristas e gestores acessem a plataforma de qualquer lugar.",
    },
    {
      question: "Quais integrações estão disponíveis?",
      answer:
        "Integramos com mais de 50 sistemas, incluindo ERPs (SAP, Totvs), SEFAZ para emissão de documentos fiscais, bancos para conciliação, sistemas de rastreamento, APIs de mapas e muito mais.",
    },
    {
      question: "Como funciona o suporte técnico?",
      answer:
        "Oferecemos suporte via chat, email e telefone. Planos Professional têm suporte prioritário e planos Enterprise contam com suporte 24/7 e gerente de conta dedicado.",
    },
    {
      question: "Os dados são seguros e estão em conformidade com a LGPD?",
      answer:
        "Sim! Somos certificados ISO 27001 e seguimos rigorosamente a LGPD. Todos os dados são criptografados, temos backups diários e infraestrutura redundante com 99.9% de uptime.",
    },
    {
      question: "Posso personalizar a plataforma com a minha marca?",
      answer:
        "Sim, planos Enterprise incluem opção de white-label, permitindo personalizar cores, logos e até mesmo domínio próprio para criar uma experiência totalmente customizada.",
    },
    {
      question: "Existe contrato de fidelidade?",
      answer:
        "Não exigimos contrato de fidelidade. Você pode cancelar a assinatura a qualquer momento. Planos anuais têm desconto de 20% mas também sem fidelidade.",
    },
  ];

  const integrations = [
    { name: "Google Maps", icon: <MapPin className="w-8 h-8" />, category: "Mapas" },
    { name: "WhatsApp", icon: <MessageSquare className="w-8 h-8" />, category: "Comunicação" },
    { name: "SEFAZ", icon: <FileText className="w-8 h-8" />, category: "Fiscal" },
    { name: "Receita Federal", icon: <Shield className="w-8 h-8" />, category: "Fiscal" },
    { name: "Correios", icon: <Truck className="w-8 h-8" />, category: "Logística" },
    { name: "Banco Central", icon: <DollarSign className="w-8 h-8" />, category: "Financeiro" },
    { name: "SAP", icon: <Database className="w-8 h-8" />, category: "ERP" },
    { name: "Totvs", icon: <Database className="w-8 h-8" />, category: "ERP" },
  ];

  return (
    <>
      <Helmet>
        <title>{copy.seoTitle}</title>
        <meta
          name="description"
          content={copy.seoDescription}
        />
        <meta
          name="keywords"
          content="TMS, WMS, ERP, gestão logística, inteligência artificial, otimização de rotas, blockchain, IoT"
        />
        <meta property="og:title" content={copy.seoTitle} />
        <meta
          property="og:description"
          content={copy.seoDescription}
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://${customDomain}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href={`https://${customDomain}`} />
      </Helmet>

      <div
        className="relative min-h-screen overflow-hidden text-white"
        style={{
          background: `
            radial-gradient(circle at top left, ${activePalette.glow} 0%, transparent 24%),
            radial-gradient(circle at 85% 18%, ${activePalette.secondary}22 0%, transparent 18%),
            linear-gradient(160deg, ${activePalette.background} 0%, #020617 58%, #0f172a 100%)
          `,
        }}
      >
        {/* Particle Background */}
        <ParticleBackground />

        {/* Header/Navigation */}
        <motion.header
          className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
          style={{
            backgroundColor: scrolled ? "rgba(2, 6, 23, 0.8)" : "transparent",
            backdropFilter: scrolled ? "blur(18px)" : "none",
            boxShadow: scrolled ? `0 16px 40px -32px ${activePalette.glow}` : "none",
          }}
        >
          <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 lg:h-20">
              {/* Logo */}
              <button
                onClick={() => scrollToSection("hero")}
                className="flex items-center space-x-2 group"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-75 group-hover:opacity-100 transition-opacity" />
                  <div
                    className="relative rounded-lg p-2"
                    style={{
                      backgroundColor: "rgba(15, 23, 42, 0.82)",
                      border: `1px solid ${activePalette.border}`,
                    }}
                  >
                    <Truck className="h-6 w-6" style={{ color: activePalette.secondary }} />
                  </div>
                </div>
                <span
                  className="bg-clip-text text-xl font-bold text-transparent"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${activePalette.secondary} 0%, #ffffff 44%, ${activePalette.accent} 100%)`,
                  }}
                >
                  XYZLogicFlow
                </span>
              </button>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center space-x-8">
                {navigationLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => scrollToSection(link.id)}
                    className="text-gray-300 hover:text-white transition-colors relative group"
                  >
                    {link.label}
                    <span
                      className="absolute -bottom-1 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-300"
                      style={{
                        backgroundImage: `linear-gradient(135deg, ${activePalette.primary} 0%, ${activePalette.accent} 100%)`,
                      }}
                    />
                  </button>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="hidden lg:flex items-center space-x-4">
                <div
                  className="flex items-center gap-2 rounded-full border px-2 py-1 backdrop-blur-xl"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.06)",
                    borderColor: activePalette.border,
                  }}
                >
                  {supportedLanguages.map((language) => (
                    <button
                      key={language.code}
                      type="button"
                      onClick={() => handleLanguageChange(language.code)}
                      className="rounded-full px-2.5 py-1 text-xs font-semibold transition-all"
                      style={{
                        backgroundColor:
                          selectedLanguage === language.code ? `${activePalette.secondary}33` : "transparent",
                        color: selectedLanguage === language.code ? "#fff" : "#cbd5e1",
                      }}
                    >
                      {language.flag}
                    </button>
                  ))}
                </div>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/login")}
                  className="text-gray-300 hover:text-white"
                >
                  {copy.navigation.login}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/marketplace")}
                  className="border-gray-600 text-gray-100 hover:bg-gray-800"
                  style={{ borderColor: activePalette.border }}
                >
                  {copy.navigation.marketplace}
                </Button>
                <Button
                  onClick={() => scrollToSection("contact")}
                  className="text-white"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${activePalette.primary} 0%, ${activePalette.accent} 100%)`,
                    boxShadow: `0 18px 40px -26px ${activePalette.glow}`,
                  }}
                >
                  {copy.navigation.start}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden rounded-lg p-2 transition-colors hover:bg-gray-800"
                style={{
                  border: `1px solid ${activePalette.border}`,
                  backgroundColor: "rgba(15, 23, 42, 0.5)",
                }}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="lg:hidden border-t py-4"
                style={{ borderColor: activePalette.border }}
              >
                <div className="flex flex-col space-y-4">
                  <div className="flex flex-wrap gap-2 px-4">
                    {supportedLanguages.map((language) => (
                      <button
                        key={language.code}
                        type="button"
                        onClick={() => handleLanguageChange(language.code)}
                        className="rounded-full px-3 py-1.5 text-sm font-medium"
                        style={{
                          backgroundColor:
                            selectedLanguage === language.code ? `${activePalette.secondary}33` : "rgba(255,255,255,0.06)",
                          border: `1px solid ${activePalette.border}`,
                        }}
                      >
                        {language.flag} {language.code.split("-")[0].toUpperCase()}
                      </button>
                    ))}
                  </div>
                  {navigationLinks.map((link) => (
                    <button
                      key={link.id}
                      onClick={() => scrollToSection(link.id)}
                      className="text-gray-300 hover:text-white text-left py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      {link.label}
                    </button>
                  ))}
                  <hr className="border-gray-800" />
                  <Button
                    variant="ghost"
                    onClick={() => navigate("/login")}
                    className="w-full justify-start text-gray-300"
                  >
                    {copy.navigation.login}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => navigate("/marketplace")}
                    className="w-full justify-start text-gray-300"
                  >
                    {copy.navigation.marketplace}
                  </Button>
                  <Button
                    onClick={() => scrollToSection("contact")}
                    className="w-full text-white"
                    style={{
                      backgroundImage: `linear-gradient(135deg, ${activePalette.primary} 0%, ${activePalette.accent} 100%)`,
                    }}
                  >
                    {copy.navigation.start}
                  </Button>
                </div>
              </motion.div>
            )}
          </nav>
        </motion.header>

        {/* Hero Section */}
        <section id="hero" className="relative pt-32 pb-20 lg:pt-40 lg:pb-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedHero
              badge={copy.hero.badge}
              headline={copy.hero.headline}
              subheadline={copy.hero.subheadline}
              primaryCTA={{
                text: copy.hero.primaryCta,
                onClick: () => scrollToSection("contact"),
              }}
              secondaryCTA={{
                text: copy.hero.secondaryCta,
                onClick: () => navigate("/marketplace"),
              }}
              trustBadges={[
                { icon: <Shield className="w-4 h-4" />, text: copy.hero.trustBadges[0] },
                { icon: <Check className="w-4 h-4" />, text: copy.hero.trustBadges[1] },
                { icon: <TrendingUp className="w-4 h-4" />, text: copy.hero.trustBadges[2] },
              ]}
              palette={activePalette}
              featurePills={copy.hero.featurePills}
              quickStats={copy.hero.quickStats}
              visualTitle={copy.hero.visualTitle}
              visualCaption={copy.hero.visualCaption}
              visualHighlights={copy.hero.visualHighlights}
              visualSteps={copy.hero.visualSteps}
              controls={
                <div className="grid gap-4 lg:grid-cols-2">
                  <div
                    className="rounded-[1.75rem] border p-4 backdrop-blur-2xl"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.06)",
                      borderColor: activePalette.border,
                    }}
                  >
                    <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-200">
                      <Globe2 className="h-4 w-4" style={{ color: activePalette.secondary }} />
                      {copy.controls.language}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {supportedLanguages.map((language) => (
                        <button
                          key={language.code}
                          type="button"
                          onClick={() => handleLanguageChange(language.code)}
                          className="rounded-full border px-3 py-2 text-sm font-semibold transition-transform hover:-translate-y-0.5"
                          style={{
                            borderColor: activePalette.border,
                            backgroundColor:
                              selectedLanguage === language.code ? `${activePalette.secondary}33` : "rgba(255,255,255,0.04)",
                          }}
                        >
                          {language.flag} {language.name.split(" ")[0]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div
                    className="rounded-[1.75rem] border p-4 backdrop-blur-2xl"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.06)",
                      borderColor: activePalette.border,
                    }}
                  >
                    <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-200">
                      <Palette className="h-4 w-4" style={{ color: activePalette.secondary }} />
                      {copy.controls.palette}
                    </div>
                    <p className="mb-3 text-sm text-slate-400">{copy.controls.paletteHint}</p>
                    <div className="flex flex-wrap gap-2">
                      {landingPalettes.map((palette) => (
                        <button
                          key={palette.id}
                          type="button"
                          onClick={() => setSelectedPalette(palette.id)}
                          className="rounded-full border px-3 py-2 text-sm font-semibold transition-transform hover:-translate-y-0.5"
                          style={{
                            borderColor: palette.id === selectedPalette ? `${activePalette.secondary}` : activePalette.border,
                            backgroundColor:
                              palette.id === selectedPalette ? `${palette.secondary}26` : "rgba(255,255,255,0.04)",
                          }}
                        >
                          {palette.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              }
            />
          </div>
        </section>

        {/* Social Proof Bar */}
        <section className="relative py-12 backdrop-blur-sm" style={{ backgroundColor: "rgba(15, 23, 42, 0.45)" }}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {socialProofStats.map((stat, index) => (
                <StatsCounter
                  key={index}
                  value={stat.value}
                  suffix={stat.suffix}
                  label={stat.label}
                  icon={stat.icon}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="relative py-20 lg:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
                <Badge className="mb-4 border" style={{ backgroundColor: `${activePalette.primary}18`, color: "#bfdbfe", borderColor: activePalette.border }}>
                  {copy.sections.featuresBadge}
                </Badge>
               <h2 className="mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-4xl font-bold text-transparent lg:text-5xl">
                  {copy.sections.featuresTitle}
                </h2>
               <p className="mx-auto max-w-3xl text-xl text-gray-400">
                  {copy.sections.featuresSubtitle}
                </p>
              </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <FeatureCard
                  key={index}
                  title={feature.title}
                  description={feature.description}
                  icon={feature.icon}
                  colorScheme={feature.colorScheme}
                  gradient={true}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Modules Showcase */}
        <section id="modules" className="relative py-20 lg:py-32" style={{ backgroundColor: "rgba(15, 23, 42, 0.28)" }}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
                <Badge className="mb-4 border" style={{ backgroundColor: `${activePalette.accent}16`, color: "#e9d5ff", borderColor: activePalette.border }}>
                  {copy.sections.modulesBadge}
                </Badge>
               <h2 className="mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-4xl font-bold text-transparent lg:text-5xl">
                  {copy.sections.modulesTitle}
                </h2>
               <p className="mx-auto max-w-3xl text-xl text-gray-400">
                  {copy.sections.modulesSubtitle}
                </p>
              </motion.div>

            <ModuleTabs />
          </div>
        </section>

        {/* Benefits Section */}
        <section className="relative py-20 lg:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <Badge className="mb-4 bg-green-500/10 text-green-400 border-green-500/20">
                Resultados Comprovados
              </Badge>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Impacto real no seu negócio
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Métricas médias alcançadas pelos nossos clientes
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefitStats.map((stat, index) => (
                <StatsCounter
                  key={index}
                  value={stat.value}
                  suffix={stat.suffix}
                  label={stat.label}
                  icon={stat.icon}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="relative py-20 lg:py-32 bg-gray-900/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <Badge className="mb-4 bg-orange-500/10 text-orange-400 border-orange-500/20">
                Planos Flexíveis
              </Badge>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Escolha o plano ideal para seu negócio
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
                Sem taxas ocultas. Cancele quando quiser.
              </p>

              {/* Annual/Monthly Toggle */}
              <div className="flex items-center justify-center gap-4">
                <span className={`text-sm ${!isAnnual ? "text-white font-semibold" : "text-gray-400"}`}>
                  Mensal
                </span>
                <button
                  onClick={() => setIsAnnual(!isAnnual)}
                  className="relative w-14 h-7 bg-gray-700 rounded-full transition-colors hover:bg-gray-600"
                >
                  <div
                    className={`absolute top-1 left-1 w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-transform ${
                      isAnnual ? "translate-x-7" : ""
                    }`}
                  />
                </button>
                <span className={`text-sm ${isAnnual ? "text-white font-semibold" : "text-gray-400"}`}>
                  Anual
                  <Badge className="ml-2 bg-green-500/10 text-green-400 border-green-500/20 text-xs">
                    20% OFF
                  </Badge>
                </span>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {pricingPlans.map((plan, index) => (
                <PricingCard
                  key={index}
                  planName={plan.planName}
                  price={plan.price}
                  billingPeriod={isAnnual ? "annual" : "monthly"}
                  description={plan.description}
                  features={plan.features}
                  ctaText={plan.ctaText}
                  popular={plan.popular}
                  onCTAClick={() => {
                    if (plan.planName === "Enterprise") {
                      scrollToSection("contact");
                    } else {
                      scrollToSection("contact");
                    }
                  }}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Innovation/Tech Section */}
        <section className="relative py-20 lg:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <Badge className="mb-4 bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
                Tecnologia de Ponta
              </Badge>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Inovação que impulsiona resultados
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Tecnologias emergentes aplicadas à logística
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {innovationFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl blur-xl -z-10"
                    style={{
                      backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))`,
                    }}
                  />
                  <div className="relative bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-all h-full">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-4`}>
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-gray-400 text-sm">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="relative py-20 lg:py-32 bg-gray-900/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <Badge className="mb-4 bg-pink-500/10 text-pink-400 border-pink-500/20">
                Depoimentos
              </Badge>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                O que nossos clientes dizem
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Histórias de sucesso de empresas que transformaram suas operações
              </p>
            </motion.div>

            <TestimonialCarousel testimonials={testimonials} />
          </div>
        </section>

        {/* Integration Partners */}
        <section className="relative py-20 lg:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <Badge className="mb-4 bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                Integrações
              </Badge>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Conecte-se com suas ferramentas favoritas
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Mais de 50 integrações nativas para maximizar sua produtividade
              </p>
            </motion.div>

            <IntegrationGrid integrations={integrations} />
          </div>
        </section>

        {/* FAQ Section */}
        <section className="relative py-20 lg:py-32 bg-gray-900/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <Badge className="mb-4 bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
                Perguntas Frequentes
              </Badge>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Tire suas dúvidas
              </h2>
              <p className="text-xl text-gray-400">
                Respostas para as perguntas mais comuns sobre nossa plataforma
              </p>
            </motion.div>

            <FAQAccordion items={faqs} />
          </div>
        </section>

        {/* Final CTA Section */}
        <section id="contact" className="relative py-20 lg:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl">
              {/* Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 opacity-90" />
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtNi42MjcgNS4zNzMtMTIgMTItMTJzMTIgNS4zNzMgMTIgMTItNS4zNzMgMTItMTIgMTItMTItNS4zNzMtMTItMTJ6bS0yNCAwYzAtNi42MjcgNS4zNzMtMTIgMTItMTJzMTIgNS4zNzMgMTIgMTItNS4zNzMgMTItMTIgMTItMTItNS4zNzMtMTItMTJ6bTAgMjRjMC02LjYyNyA1LjM3My0xMiAxMi0xMnMxMiA1LjM3MyAxMiAxMi01LjM3MyAxMi0xMiAxMi0xMi01LjM3My0xMi0xMnptMjQgMGMwLTYuNjI3IDUuMzczLTEyIDEyLTEyczEyIDUuMzczIDEyIDEyLTUuMzczIDEyLTEyIDEyLTEyLTUuMzczLTEyLTEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />

              <div className="relative px-8 py-16 lg:px-16 lg:py-24">
                <div className="max-w-4xl mx-auto text-center mb-12">
                  <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-white">
                    Pronto para Revolucionar sua Logística?
                  </h2>
                  <p className="text-xl text-white/90 mb-8">
                    Junte-se a mais de 1000 empresas que já transformaram suas operações
                  </p>

                  {/* Trust Elements */}
                  <div className="flex flex-wrap items-center justify-center gap-6 mb-12">
                    <div className="flex items-center gap-2 text-white/90">
                      <Check className="h-5 w-5" />
                      <span className="text-sm">14 dias grátis</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/90">
                      <Check className="h-5 w-5" />
                      <span className="text-sm">Sem cartão de crédito</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/90">
                      <Check className="h-5 w-5" />
                      <span className="text-sm">Garantia 30 dias</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/90">
                      <Check className="h-5 w-5" />
                      <span className="text-sm">LGPD Compliant</span>
                    </div>
                  </div>
                </div>

                {/* Lead Form */}
                <div className="max-w-2xl mx-auto">
                  <LeadForm
                    onSuccess={() => {
                      // Handle success - could show modal, redirect, etc.
                      alert("Obrigado! Entraremos em contato em breve.");
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative py-16 bg-gray-950 border-t border-gray-900">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
              {/* Produto */}
              <div>
                <h3 className="text-lg font-bold mb-4 text-white">Produto</h3>
                <ul className="space-y-3">
                  <li>
                    <button
                      onClick={() => scrollToSection("features")}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      TMS
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => scrollToSection("features")}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      WMS
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => scrollToSection("features")}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      ERP
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => scrollToSection("features")}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      CRM
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => scrollToSection("pricing")}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      Preços
                    </button>
                  </li>
                </ul>
              </div>

              {/* Empresa */}
              <div>
                <h3 className="text-lg font-bold mb-4 text-white">Empresa</h3>
                <ul className="space-y-3">
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                      Sobre Nós
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                      Blog
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                      Carreiras
                    </a>
                  </li>
                  <li>
                    <button
                      onClick={() => scrollToSection("contact")}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      Contato
                    </button>
                  </li>
                </ul>
              </div>

              {/* Recursos */}
              <div>
                <h3 className="text-lg font-bold mb-4 text-white">Recursos</h3>
                <ul className="space-y-3">
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                      Documentação
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                      API
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                      Integrações
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                      Status
                    </a>
                  </li>
                </ul>
              </div>

              {/* Legal */}
              <div>
                <h3 className="text-lg font-bold mb-4 text-white">Legal</h3>
                <ul className="space-y-3">
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                      Privacidade
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                      Termos de Uso
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                      LGPD
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                      Cookies
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="pt-8 border-t border-gray-900">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                {/* Logo and Copyright */}
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg">
                    <Truck className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    {/* NOTE: Copyright year is set at build time. Update during annual releases. */}
                    <p className="text-sm text-gray-400">
                      © {new Date().getFullYear()} XYZLogicFlow. Todos os direitos reservados.
                    </p>
                  </div>
                </div>

                {/* Social Icons */}
                <div className="flex items-center space-x-4">
                  <a
                    href="#"
                    className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors"
                    aria-label="LinkedIn"
                  >
                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors"
                    aria-label="Twitter"
                  >
                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors"
                    aria-label="Facebook"
                  >
                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors"
                    aria-label="Instagram"
                  >
                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Newsletter */}
              <div className="mt-8 pt-8 border-t border-gray-900">
                <div className="max-w-md mx-auto text-center">
                  <h4 className="text-sm font-semibold text-white mb-2">
                    Receba novidades e atualizações
                  </h4>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="Seu melhor email"
                      className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    />
                    <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                      Assinar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </footer>

        {/* Scroll to Top Button */}
        <button
          onClick={() => scrollToSection("hero")}
          className="fixed bottom-8 right-8 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all z-40 group"
          aria-label="Scroll to top"
        >
          <ArrowRight className="h-5 w-5 text-white -rotate-90 group-hover:-translate-y-1 transition-transform" />
        </button>
      </div>
    </>
  );
}
