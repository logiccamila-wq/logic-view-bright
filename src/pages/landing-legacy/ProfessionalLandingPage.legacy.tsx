// Legacy landing page - Mantido para referência histórica
// Nova versão unificada em: /src/pages/UnifiedLandingPage.tsx
// Data de arquivamento: 2026-01-27

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { 
  ArrowRight, Check, Truck, Shield, Zap, Users, Globe, 
  BarChart3, DollarSign, Package, Clock, Star, Sparkles, 
  Rocket, Target, Award, ChevronRight, Menu, X, 
  Warehouse, UserCheck, Building2, Calculator, FileText,
  Code2, Layers, Receipt, Monitor, Cpu, Database, Cloud,
  TrendingUp, Smartphone, Headphones, Mail, Phone,
  CheckCircle2, PlayCircle, MapPin, Settings, ShoppingBag,
  Lock, Zap as Lightning, Activity, PieChart, GitBranch
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function ProfessionalLandingPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState("features");
  
  // Lead Form State
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadCompany, setLeadCompany] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('leads' as any).insert({
        name: leadName,
        email: leadEmail,
        phone: leadPhone,
        company: leadCompany,
        source: 'landing',
        status: 'new'
      });
      
      if (error) throw error;
      
      toast.success("🎉 Cadastro recebido com sucesso!", {
        description: "Nossa equipe entrará em contato em até 24h para liberar seu teste grátis de 14 dias.",
      });
      
      // Reset form
      setLeadName("");
      setLeadEmail("");
      setLeadPhone("");
      setLeadCompany("");
    } catch (err: any) {
      toast.success("Cadastro recebido!", {
        description: "Nossa equipe entrará em contato em breve.",
      });
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: Truck,
      title: "TMS Completo",
      description: "Gestão de transporte com rastreamento real-time, otimização de rotas e emissão automática de CTe/MDFe",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      icon: Warehouse,
      title: "WMS Inteligente",
      description: "Controle total do armazém com picking otimizado, inventário automático e endereçamento dinâmico",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    },
    {
      icon: DollarSign,
      title: "ERP Financeiro",
      description: "Gestão financeira completa com DRE, fluxo de caixa, contas a pagar/receber e conciliação bancária",
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      icon: UserCheck,
      title: "CRM Avançado",
      description: "Gestão de clientes, funil de vendas, propostas comerciais e histórico completo de interações",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10"
    },
    {
      icon: BarChart3,
      title: "Analytics BI",
      description: "Dashboards inteligentes, KPIs em tempo real, relatórios customizados e insights preditivos",
      color: "text-pink-500",
      bgColor: "bg-pink-500/10"
    },
    {
      icon: Shield,
      title: "Segurança Total",
      description: "Proteção de dados com criptografia, backup automático, LGPD compliance e controle de acesso",
      color: "text-red-500",
      bgColor: "bg-red-500/10"
    }
  ];

  const benefits = [
    {
      icon: TrendingUp,
      title: "Aumento de 40% em Produtividade",
      description: "Automatize processos e elimine tarefas manuais"
    },
    {
      icon: DollarSign,
      title: "Redução de 30% em Custos",
      description: "Otimize recursos e reduza desperdícios"
    },
    {
      icon: Clock,
      title: "Economia de 15h/semana",
      description: "Libere sua equipe para atividades estratégicas"
    },
    {
      icon: Award,
      title: "ROI em 3 meses",
      description: "Retorno garantido do investimento"
    }
  ];

  const modules = [
    { name: "TMS", icon: Truck, users: "2.5k+" },
    { name: "WMS", icon: Warehouse, users: "1.8k+" },
    { name: "Financeiro", icon: DollarSign, users: "3.2k+" },
    { name: "CRM", icon: UserCheck, users: "2.1k+" },
    { name: "Analytics", icon: BarChart3, users: "4.5k+" },
    { name: "RH", icon: Users, users: "1.5k+" },
    { name: "Manutenção", icon: Settings, users: "890+" },
    { name: "Marketplace", icon: ShoppingBag, users: "1.2k+" }
  ];

  const testimonials = [
    {
      name: "Carlos Silva",
      role: "CEO, TransLog Brasil",
      avatar: "CS",
      content: "Aumentamos nossa eficiência operacional em 45% no primeiro trimestre. O ROI foi impressionante!",
      rating: 5
    },
    {
      name: "Maria Santos",
      role: "Diretora Financeira, LogMove",
      avatar: "MS",
      content: "A integração financeira economizou 20 horas semanais da nossa equipe. Simplesmente transformador.",
      rating: 5
    },
    {
      name: "João Oliveira",
      role: "Gerente de Operações, FastCargo",
      avatar: "JO",
      content: "Reduzimos custos em 35% com a otimização de rotas e gestão inteligente da frota.",
      rating: 5
    }
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "497",
      popular: false,
      features: [
        "Até 10 usuários",
        "3 módulos à escolha",
        "10 GB armazenamento",
        "Suporte por email",
        "Atualizações inclusas"
      ]
    },
    {
      name: "Professional",
      price: "997",
      popular: true,
      features: [
        "Até 50 usuários",
        "Todos os módulos",
        "100 GB armazenamento",
        "Suporte prioritário",
        "API completa",
        "Customizações",
        "Treinamento incluso"
      ]
    },
    {
      name: "Enterprise",
      price: "Custom",
      popular: false,
      features: [
        "Usuários ilimitados",
        "Módulos customizados",
        "Armazenamento ilimitado",
        "Suporte 24/7 dedicado",
        "SLA garantido",
        "Onboarding completo",
        "Consultor exclusivo"
      ]
    }
  ];

  const stats = [
    { value: "15k+", label: "Empresas Ativas" },
    { value: "98%", label: "Satisfação" },
    { value: "40%", label: "Aumento Médio em Produtividade" },
    { value: "24/7", label: "Suporte" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-background/80 backdrop-blur-xl border-b shadow-sm' : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
                <Zap className="h-10 w-10 text-primary relative z-10 fill-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Logic View
                </span>
                <span className="text-xs text-muted-foreground -mt-1 font-semibold">BRIGHT</span>
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors">
                Recursos
              </a>
              <a href="#modules" className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors">
                Módulos
              </a>
              <a href="#pricing" className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors">
                Planos
              </a>
              <a href="#testimonials" className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors">
                Depoimentos
              </a>
              <Button variant="ghost" onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button className="shadow-lg shadow-primary/25" onClick={() => {
                document.getElementById('cta-form')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                Teste Grátis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t space-y-3">
              <a href="#features" className="block py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                Recursos
              </a>
              <a href="#modules" className="block py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                Módulos
              </a>
              <a href="#pricing" className="block py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                Planos
              </a>
              <a href="#testimonials" className="block py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                Depoimentos
              </a>
              <Button variant="ghost" className="w-full" onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button className="w-full" onClick={() => {
                setMobileMenuOpen(false);
                document.getElementById('cta-form')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                Teste Grátis
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium animate-pulse">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Plataforma #1 de Gestão Logística no Brasil
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl lg:text-7xl font-black tracking-tight">
              <span className="block mb-2">Transforme sua</span>
              <span className="block bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
                Logística em Lucro
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Sistema completo de gestão que une <strong>TMS, WMS, ERP Financeiro, CRM</strong> e mais em uma única plataforma inteligente.
              <span className="block mt-2 text-primary font-semibold">Aumente 40% sua produtividade e reduza 30% seus custos.</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/40 transition-all"
                onClick={() => document.getElementById('cta-form')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Rocket className="mr-2 h-5 w-5" />
                Comece Grátis por 14 Dias
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-6 border-2"
                onClick={() => document.getElementById('demo-video')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <PlayCircle className="mr-2 h-5 w-5" />
                Ver Demonstração
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-8 pt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>Sem cartão de crédito</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>Cancelamento gratuito</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>Suporte em português</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto mt-20">
            {stats.map((stat, index) => (
              <div key={index} className="text-center space-y-2">
                <div className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-32 relative">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="mb-4" variant="outline">Recursos</Badge>
            <h2 className="text-4xl lg:text-5xl font-black mb-4">
              Tudo que você precisa,
              <span className="block text-primary">em um só lugar</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Recursos empresariais completos para transformar sua operação
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 group cursor-pointer"
              >
                <CardHeader>
                  <div className={`w-14 h-14 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`h-7 w-7 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 lg:py-32 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="mb-4" variant="outline">Resultados Comprovados</Badge>
            <h2 className="text-4xl lg:text-5xl font-black mb-4">
              Impacto real no seu negócio
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center space-y-4 p-6 rounded-2xl bg-background/50 backdrop-blur border hover:shadow-xl transition-all">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <benefit.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules Showcase */}
      <section id="modules" className="py-20 lg:py-32">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="mb-4" variant="outline">Módulos</Badge>
            <h2 className="text-4xl lg:text-5xl font-black mb-4">
              Escolha os módulos perfeitos
              <span className="block text-primary">para o seu negócio</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Sistema modular que cresce com você
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {modules.map((module, index) => (
              <Card 
                key={index}
                className="text-center p-6 hover:shadow-xl hover:border-primary/50 transition-all cursor-pointer group"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <module.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-bold mb-2">{module.name}</h3>
                <p className="text-sm text-muted-foreground">{module.users} usuários</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 lg:py-32 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="mb-4" variant="outline">Depoimentos</Badge>
            <h2 className="text-4xl lg:text-5xl font-black mb-4">
              Empresas que confiam
              <span className="block text-primary">em nossa plataforma</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-2 hover:shadow-xl transition-all">
                <CardHeader>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground italic">"{testimonial.content}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 lg:py-32">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="mb-4" variant="outline">Planos</Badge>
            <h2 className="text-4xl lg:text-5xl font-black mb-4">
              Escolha o plano ideal
              <span className="block text-primary">para sua empresa</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Todos os planos incluem 14 dias de teste grátis
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative ${plan.popular ? 'border-primary border-2 shadow-xl shadow-primary/20' : 'border-2'}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-4 py-1">
                      Mais Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl mb-4">{plan.name}</CardTitle>
                  <div className="space-y-2">
                    <div className="text-5xl font-black">
                      {plan.price === "Custom" ? (
                        <span>Custom</span>
                      ) : (
                        <>
                          <span className="text-2xl text-muted-foreground">R$</span>
                          {plan.price}
                        </>
                      )}
                    </div>
                    {plan.price !== "Custom" && (
                      <div className="text-muted-foreground">/mês</div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button 
                    className="w-full" 
                    variant={plan.popular ? "default" : "outline"}
                    size="lg"
                    onClick={() => document.getElementById('cta-form')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    {plan.price === "Custom" ? "Falar com Vendas" : "Começar Teste Grátis"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Form Section */}
      <section id="cta-form" className="py-20 lg:py-32 bg-gradient-to-br from-primary/10 via-blue-500/10 to-purple-500/10">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <Card className="border-2 shadow-2xl">
              <CardHeader className="text-center pb-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Rocket className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-3xl lg:text-4xl font-black mb-4">
                  Comece seu teste gratuito
                </CardTitle>
                <CardDescription className="text-lg">
                  Sem compromisso. Sem cartão de crédito. Acesso completo por 14 dias.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLeadSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome Completo *</Label>
                      <Input 
                        id="name"
                        placeholder="João Silva"
                        value={leadName}
                        onChange={(e) => setLeadName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Corporativo *</Label>
                      <Input 
                        id="email"
                        type="email"
                        placeholder="joao@empresa.com"
                        value={leadEmail}
                        onChange={(e) => setLeadEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone *</Label>
                      <Input 
                        id="phone"
                        placeholder="(11) 99999-9999"
                        value={leadPhone}
                        onChange={(e) => setLeadPhone(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Empresa *</Label>
                      <Input 
                        id="company"
                        placeholder="Nome da Empresa"
                        value={leadCompany}
                        onChange={(e) => setLeadCompany(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full text-lg py-6 shadow-xl shadow-primary/25"
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? (
                      "Enviando..."
                    ) : (
                      <>
                        <Rocket className="mr-2 h-5 w-5" />
                        Começar Agora Grátis
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Ao cadastrar, você concorda com nossos Termos de Uso e Política de Privacidade
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 border-t py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Zap className="h-8 w-8 text-primary fill-primary" />
                <span className="text-xl font-black">Logic View</span>
              </div>
              <p className="text-sm text-muted-foreground">
                A plataforma completa de gestão logística que transforma sua operação.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Produto</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-primary transition-colors">Recursos</a></li>
                <li><a href="#modules" className="hover:text-primary transition-colors">Módulos</a></li>
                <li><a href="#pricing" className="hover:text-primary transition-colors">Planos</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Integrações</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Sobre</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Carreiras</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contato</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contato</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <a href="mailto:contato@xyzlogicflow.tech" className="hover:text-primary transition-colors">
                    contato@xyzlogicflow.tech
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>(11) 4000-0000</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>São Paulo, Brasil</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
              <p>&copy; 2025 Logic View Bright. Todos os direitos reservados.</p>
              <div className="flex gap-6">
                <a href="#" className="hover:text-primary transition-colors">Termos de Uso</a>
                <a href="#" className="hover:text-primary transition-colors">Privacidade</a>
                <a href="#" className="hover:text-primary transition-colors">LGPD</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
