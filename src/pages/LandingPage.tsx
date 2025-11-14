import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Check, 
  TrendingUp, 
  Zap, 
  Shield, 
  Brain, 
  Network, 
  Clock,
  Award,
  ChevronRight,
  ArrowRight,
  Star
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import optilogLogo from "@/assets/optilog-logo.png";

const LandingPage = () => {
  const navigate = useNavigate();
  
  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const fadeInLeft = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0 }
  };

  const fadeInRight = {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0 }
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const features = [
    { icon: Zap, title: "51 Módulos Integrados", desc: "Tudo em uma única plataforma" },
    { icon: Brain, title: "IA/ML Nativo", desc: "Análise preditiva em tempo real" },
    { icon: Network, title: "IoT + Blockchain", desc: "100% da frota rastreada" },
    { icon: Shield, title: "Certificações", desc: "SASSMAQ + ISO 9001" },
    { icon: TrendingUp, title: "ROI em 18 dias", desc: "Economia comprovada" },
    { icon: Award, title: "Nota 95/100", desc: "Top 2% do Brasil" },
  ];

  const problems = [
    "Sistemas fragmentados (TMS + Frota + Financeiro)",
    "Custos altos com múltiplas licenças",
    "Dados que não conversam entre si",
    "Decisões lentas sem análise preditiva",
    "Baixa competitividade em editais"
  ];

  const solutions = [
    "Sistema Único: 51 módulos em 1 plataforma",
    "Economia: R$ 1.268M/ano comprovados",
    "IA/ML: Análise preditiva completa",
    "IoT + Blockchain: Rastreabilidade total",
    "98% de aprovação em editais"
  ];

  const plans = [
    {
      name: "Startup",
      price: "R$ 497",
      vehicles: "Até 5 veículos",
      features: ["Módulos essenciais", "Suporte por email", "1 usuário admin"]
    },
    {
      name: "Crescimento",
      price: "R$ 997",
      vehicles: "Até 20 veículos",
      features: ["Todos os módulos", "Suporte prioritário", "5 usuários", "Integrações básicas"],
      popular: true
    },
    {
      name: "Profissional",
      price: "R$ 1.997",
      vehicles: "Até 50 veículos",
      features: ["Módulos avançados", "Suporte 24/7", "Usuários ilimitados", "Todas as integrações", "IA avançada"]
    },
    {
      name: "Enterprise",
      price: "R$ 3.997",
      vehicles: "Ilimitado",
      features: ["100% customizável", "Suporte dedicado", "Onboarding completo", "API dedicada", "SLA 99.9%"]
    }
  ];

  const modules = [
    { category: "Cadastros Básicos", count: 10, items: ["Veículos", "Motoristas", "Pneus", "RH", "Peças"] },
    { category: "Gestão de Frota", count: 8, items: ["Manutenções", "OS", "Abastecimentos", "TPMS"] },
    { category: "Operações", count: 7, items: ["Viagens", "Rotas IA", "Rastreamento", "CT-e"] },
    { category: "Portais", count: 3, items: ["Motorista", "Mecânico", "Borracheiro"] },
    { category: "TMS Avançado", count: 3, items: ["Cargas", "Entregas", "Faturamento"] },
    { category: "Financeiro", count: 5, items: ["DRE", "Fluxo de Caixa", "Análise Tributária"] },
    { category: "IA & Analytics", count: 7, items: ["Consultoria IA", "Projeções", "BI"] },
    { category: "Integrações", count: 3, items: ["Notion", "Google", "WhatsApp"] }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header/Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <img src={optilogLogo} alt="OptiLog" className="h-8 w-auto" />
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#solucao" className="text-sm font-medium hover:text-primary transition-colors">
              Solução
            </a>
            <a href="#modulos" className="text-sm font-medium hover:text-primary transition-colors">
              Módulos
            </a>
            <a href="#precos" className="text-sm font-medium hover:text-primary transition-colors">
              Preços
            </a>
            <a href="#casos" className="text-sm font-medium hover:text-primary transition-colors">
              Casos
            </a>
          </nav>
          <Button onClick={() => navigate("/login")} className="gap-2">
            Acessar Sistema
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
          >
            <Badge className="mb-4" variant="secondary">
              Primeiro TMS 100% Integrado do Brasil
            </Badge>
          </motion.div>
          
          <motion.h1 
            className="text-4xl md:text-6xl font-bold mb-6 text-foreground"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            TMS Revolucionário com<br />
            <span className="text-primary">IA, IoT e Blockchain</span>
          </motion.h1>
          
          <motion.p 
            className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Substitua 2-3 sistemas por uma única plataforma. Economize R$ 1,2 milhão/ano 
            e alcance nota 95/100 com 98% de aprovação em editais governamentais.
          </motion.p>
          
          <motion.div 
            className="flex flex-wrap gap-4 justify-center mb-12"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Button size="lg" className="gap-2 hover-scale" onClick={() => navigate("/login")}>
              Experimente Grátis 30 Dias
              <ChevronRight className="h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="gap-2 hover-scale">
              Ver Demonstração
              <Star className="h-5 w-5" />
            </Button>
          </motion.div>

          {/* Features Grid */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-6xl mx-auto"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {features.map((feature, idx) => (
              <motion.div key={idx} variants={scaleIn}>
                <Card className="border-border/50 hover-scale">
                  <CardContent className="p-4 text-center">
                    <feature.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground">{feature.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section id="solucao" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Problems */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInLeft}
              transition={{ duration: 0.5 }}
            >
              <Card className="border-destructive/20 bg-destructive/5 h-full">
              <CardHeader>
                <CardTitle className="text-2xl">❌ O Problema</CardTitle>
                <CardDescription>Desafios que transportadoras enfrentam</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {problems.map((problem, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-2" />
                    <p className="text-sm">{problem}</p>
                  </div>
                ))}
              </CardContent>
              </Card>
            </motion.div>

            {/* Solutions */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInRight}
              transition={{ duration: 0.5 }}
            >
              <Card className="border-success/20 bg-success/5 h-full">
              <CardHeader>
                <CardTitle className="text-2xl">✅ A Solução OptiLog</CardTitle>
                <CardDescription>Tudo o que você precisa em um lugar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {solutions.map((solution, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-success shrink-0 mt-0.5" />
                    <p className="text-sm font-medium">{solution}</p>
                  </div>
                ))}
              </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-center mb-4">OptiLog vs Concorrentes</h2>
            <p className="text-center text-muted-foreground mb-12">Veja por que somos diferentes</p>
          </motion.div>
          
          <motion.div 
            className="overflow-x-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-semibold">Funcionalidade</th>
                  <th className="text-center p-4 font-semibold text-primary">OptiLog</th>
                  <th className="text-center p-4 font-semibold">Concorrentes</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  { feature: "Módulos", optilog: "51 integrados", others: "15-20 (fragmentados)" },
                  { feature: "Sistemas", optilog: "1", others: "2-3" },
                  { feature: "IA/ML", optilog: "✅ Completo", others: "❌ Básico ou zero" },
                  { feature: "IoT", optilog: "✅ 100% frota", others: "❌ 20-30%" },
                  { feature: "Blockchain", optilog: "✅ Rastreabilidade", others: "❌ 2% têm" },
                  { feature: "Portais Acesso", optilog: "✅ Motorista/Mecânico", others: "❌ Não tem" },
                  { feature: "ROI", optilog: "18 dias", others: "6-12 meses" },
                  { feature: "Economia/ano", optilog: "R$ 1,268 milhão", others: "R$ 200 mil" }
                ].map((row, idx) => (
                  <tr key={idx} className="border-b hover:bg-muted/50">
                    <td className="p-4 font-medium">{row.feature}</td>
                    <td className="p-4 text-center text-primary font-semibold">{row.optilog}</td>
                    <td className="p-4 text-center text-muted-foreground">{row.others}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* Modules Section */}
      <section id="modulos" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-center mb-4">51 Módulos Integrados</h2>
            <p className="text-center text-muted-foreground mb-12">
              Tudo o que sua transportadora precisa em uma única plataforma
            </p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {modules.map((module, idx) => (
              <motion.div key={idx} variants={scaleIn}>
                <Card className="hover:border-primary/50 transition-colors hover-scale h-full">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-lg">{module.category}</CardTitle>
                    <Badge variant="secondary">{module.count}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {module.items.map((item, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="precos" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-center mb-4">Planos e Preços</h2>
            <p className="text-center text-muted-foreground mb-12">
              Escolha o plano ideal para o tamanho da sua frota
            </p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {plans.map((plan, idx) => (
              <motion.div key={idx} variants={scaleIn}>
                <Card
                key={idx} 
                className={plan.popular ? "border-primary shadow-lg relative" : ""}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary">Mais Popular</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.vehicles}</CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/mês</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full" 
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => navigate("/login")}
                  >
                    Começar Agora
                  </Button>
                </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Garantia:</strong> Se não economizar no mínimo R$ 50 mil/ano, devolvemos seu dinheiro
            </p>
          </div>
        </div>
      </section>

      {/* Case Study */}
      <section id="casos" className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.h2 
            className="text-3xl font-bold text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
          >
            Caso de Sucesso
          </motion.h2>
          
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={scaleIn}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <CardTitle className="text-2xl mb-2">EJG Evolução em Transporte Ltda.</CardTitle>
                  <CardDescription>CNPJ: 44.185.912/0001-50</CardDescription>
                </div>
                <Award className="w-12 h-12 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-card rounded-lg">
                  <p className="text-3xl font-bold text-primary mb-1">R$ 1.268M</p>
                  <p className="text-sm text-muted-foreground">Economia/ano</p>
                </div>
                <div className="text-center p-4 bg-card rounded-lg">
                  <p className="text-3xl font-bold text-primary mb-1">78 → 95</p>
                  <p className="text-sm text-muted-foreground">Nota (0-100)</p>
                </div>
                <div className="text-center p-4 bg-card rounded-lg">
                  <p className="text-3xl font-bold text-primary mb-1">98%</p>
                  <p className="text-sm text-muted-foreground">Aprovação em editais</p>
                </div>
              </div>

              <blockquote className="border-l-4 border-primary pl-4 italic">
                <p className="text-muted-foreground mb-4">
                  "Antes usávamos 3 sistemas diferentes. Dados não conversavam. Decisões demoravam dias. 
                  Com OptiLog, tudo em 1 lugar, IA decide por nós. Economizamos mais de R$ 1 milhão no 
                  primeiro ano. Nota subiu para 95/100. Agora ganhamos 98% dos editais. Sistema revolucionário."
                </p>
                <footer className="text-sm font-semibold">
                  — Edjane, Gerente Geral
                </footer>
              </blockquote>
            </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Technologies */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-center mb-4">Tecnologias Avançadas</h2>
            <p className="text-center text-muted-foreground mb-12">
              Stack moderno para máxima performance e confiabilidade
            </p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-3 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.div variants={scaleIn}>
              <Card className="hover-scale h-full">
              <CardHeader>
                <Brain className="w-10 h-10 text-primary mb-2" />
                <CardTitle>IA & Machine Learning</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2 text-muted-foreground">
                <p>• Análise preditiva de custos</p>
                <p>• Otimização de rotas</p>
                <p>• Previsão de manutenção</p>
                <p>• Detecção de anomalias</p>
              </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={scaleIn}>
              <Card className="hover-scale h-full">
              <CardHeader>
                <Network className="w-10 h-10 text-primary mb-2" />
                <CardTitle>IoT & Telemetria</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2 text-muted-foreground">
                <p>• Rastreamento GPS 100% frota</p>
                <p>• Telemetria veículos</p>
                <p>• Sensores TPMS</p>
                <p>• Detecção de fadiga</p>
              </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={scaleIn}>
              <Card className="hover-scale h-full">
              <CardHeader>
                <Shield className="w-10 h-10 text-primary mb-2" />
                <CardTitle>Blockchain & Segurança</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2 text-muted-foreground">
                <p>• Rastreabilidade imutável</p>
                <p>• Contratos inteligentes</p>
                <p>• PoD criptografado</p>
                <p>• Criptografia AES-256</p>
              </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Tempo de atividade: <strong className="text-foreground">99,9% SLA</strong></span>
              <span className="mx-2">•</span>
              <Zap className="w-4 h-4" />
              <span>API: <strong className="text-foreground">&lt; 200ms</strong></span>
              <span className="mx-2">•</span>
              <Shield className="w-4 h-4" />
              <span>Conformidade: <strong className="text-foreground">LGPD + ISO 9001</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/10 via-accent/10 to-primary/10">
        <motion.div 
          className="container mx-auto max-w-3xl text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-bold mb-4">
            Pronto para Revolucionar sua Transportadora?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Junte-se às empresas que estão economizando milhões e dominando o mercado
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" className="gap-2 hover-scale" onClick={() => navigate("/login")}>
              Começar Teste Grátis 30 Dias
              <ChevronRight className="h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="gap-2 hover-scale">
              Falar com Especialista
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            ✅ Sem cartão de crédito • ✅ Cancelamento a qualquer momento • ✅ Suporte em português
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <img src={optilogLogo} alt="OptiLog" className="h-8 w-auto mb-4" />
              <p className="text-sm text-muted-foreground">
                O primeiro TMS 100% integrado do Brasil
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Produto</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#solucao" className="hover:text-primary">Solução</a></li>
                <li><a href="#modulos" className="hover:text-primary">Módulos</a></li>
                <li><a href="#precos" className="hover:text-primary">Preços</a></li>
                <li><a href="#casos" className="hover:text-primary">Casos de Sucesso</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">Sobre</a></li>
                <li><a href="#" className="hover:text-primary">Blog</a></li>
                <li><a href="#" className="hover:text-primary">Carreiras</a></li>
                <li><a href="#" className="hover:text-primary">Contato</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Contato</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>comercial@xyzlogicflow.tech</li>
                <li>(81) 99505-5354</li>
                <li>Jaboatão dos Guararapes/PE</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© 2024 OptiLog.app - Todos os direitos reservados</p>
            <p>
              Desenvolvido por <strong className="text-foreground">XYZ Logic Flow Inova Simples</strong>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
