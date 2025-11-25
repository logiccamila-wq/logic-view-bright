import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Zap,
  Brain,
  TrendingUp,
  Shield,
  Rocket,
  ArrowRight,
  CheckCircle,
  Globe,
  Lock,
  Users,
  BarChart3,
  Truck,
  Target,
  DollarSign,
  Clock,
  Award,
  Star,
  Wrench,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import optilogLogo from "@/assets/optilog-logo.png";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";

const LandingPage = () => {
  const navigate = useNavigate();
  const { canAccessModule } = useAuth();

  const metrics = [
    { value: "98%", label: "Redução de Custos", icon: DollarSign },
    { value: "10x", label: "Mais Eficiência", icon: Zap },
    { value: "24/7", label: "Monitoramento", icon: Clock },
    { value: "100%", label: "Rastreamento", icon: Target },
  ];

  const features = [
    {
      icon: Brain,
      title: "IA Conversacional",
      desc: "Chatbot inteligente que aprende com sua operação",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: Truck,
      title: "Telemetria Real-Time",
      desc: "Monitoramento completo de comportamento e performance",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Globe,
      title: "Marketplace de Fretes",
      desc: "Conecte embarcadores e transportadoras automaticamente",
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      icon: Lock,
      title: "Blockchain & IoT",
      desc: "Rastreabilidade imutável e sensores inteligentes",
      gradient: "from-orange-500 to-red-500",
    },
    {
      icon: BarChart3,
      title: "Analytics Prescritivo",
      desc: "IA que sugere decisões baseadas em ML preditivo",
      gradient: "from-violet-500 to-purple-500",
    },
    {
      icon: Shield,
      title: "ESG & Compliance",
      desc: "Pegada de carbono e certificações automáticas",
      gradient: "from-green-500 to-emerald-500",
    },
  ];

  const testimonials = [
    {
      name: "Carlos Silva",
      role: "CEO, TransLog Brasil",
      text: "Reduzimos 40% dos custos operacionais em 3 meses. A IA preditiva é game-changer.",
      rating: 5,
    },
    {
      name: "Ana Costa",
      role: "Diretora, RodoFácil",
      text: "Sistema mais completo do mercado. Substituímos 5 ferramentas por uma.",
      rating: 5,
    },
    {
      name: "Roberto Lima",
      role: "Gestor, LogMaster",
      text: "O marketplace de fretes aumentou nossa receita em 60%. ROI em 15 dias!",
      rating: 5,
    },
  ];

  const plans = [
    {
      name: "Starter",
      price: "497",
      desc: "Para operações até 10 veículos",
      features: ["TMS Completo", "App Motorista", "Suporte Email", "1 Usuário"],
    },
    {
      name: "Growth",
      price: "1.497",
      desc: "Para frotas em crescimento",
      features: ["Tudo do Starter", "IA Preditiva", "Telemática", "WhatsApp Bot", "5 Usuários", "Suporte Priority"],
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      desc: "Soluções sob medida",
      features: ["Tudo do Growth", "Marketplace", "Blockchain", "API Dedicada", "Usuários Ilimitados", "CSM Dedicado"],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={optilogLogo} alt="OptiLog" className="h-8" />
            <span className="text-xl font-bold">Optilog</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/login')}>
              Entrar
            </Button>
            <Button className="gap-2" onClick={() => navigate('/login')}>
              Começar Grátis
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-500/10 to-background" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
        </div>

        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 animate-fade-in" variant="outline">
              <Sparkles className="w-3 h-3 mr-1" />
              Tecnologia que Transforma Logística
            </Badge>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent animate-fade-in">
              A Startup que Reinventa
              <br />
              a Logística Brasileira
            </h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in">
              Sistema completo com <span className="text-primary font-semibold">IA nativa</span>, 
              marketplace integrado e automação inteligente. Tudo em uma plataforma.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
              <Button size="lg" className="gap-2 text-lg h-14 px-8 hover-scale" onClick={() => navigate('/login')}>
                <Rocket className="w-5 h-5" />
                Testar 14 Dias Grátis
              </Button>
              <Button size="lg" variant="outline" className="gap-2 text-lg h-14 px-8 hover-scale">
                <Brain className="w-5 h-5" />
                Ver Demo ao Vivo
              </Button>
            </div>

            {/* Metrics Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
              {metrics.map((metric, idx) => {
                const IconComponent = metric.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + idx * 0.1 }}
                  >
                    <Card className="border-border/40 bg-card/50 backdrop-blur hover-scale">
                      <CardContent className="p-6 text-center">
                        <IconComponent className="w-8 h-8 mx-auto mb-2 text-primary" />
                        <div className="text-3xl font-bold mb-1">{metric.value}</div>
                        <div className="text-sm text-muted-foreground">{metric.label}</div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Access Portals */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center mb-12"
          >
            <Badge className="mb-4" variant="outline">
              <Zap className="w-3 h-3 mr-1" />
              Acesso Rápido
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Portais Especializados
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Acesse diretamente os módulos específicos para sua função
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Card App Motorista */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card 
                className="border-2 border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 hover:border-blue-500/40 transition-all duration-300 cursor-pointer hover:scale-105"
                onClick={() => canAccessModule('driver') ? navigate('/driver') : toast.error('Sem permissão para acessar o App Motorista')}
              >
                <CardContent className="p-8">
                  <div className="bg-gradient-to-br from-blue-500 to-cyan-500 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                    <Truck className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-3">App Motorista</h3>
                  <p className="text-muted-foreground mb-6">
                    Gerencie viagens, check-lists e ganhos em tempo real
                  </p>
                  
                  <div className="space-y-2 mb-6">
                    {['Check-in/Check-out', 'Rotas Otimizadas', 'Controle Financeiro', 'Alertas Inteligentes'].map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-blue-500" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button onClick={() => canAccessModule('driver') ? navigate('/driver') : toast.error('Sem permissão para acessar o App Motorista')} className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
                    Acessar App
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Card Hub Mecânico */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card 
                className="border-2 border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-pink-500/10 hover:border-purple-500/40 transition-all duration-300 cursor-pointer hover:scale-105"
                onClick={() => canAccessModule('mechanic') ? navigate('/mechanic') : toast.error('Sem permissão para acessar o Hub Mecânico')}
              >
                <CardContent className="p-8">
                  <div className="bg-gradient-to-br from-purple-500 to-pink-500 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                    <Wrench className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-3">Hub Mecânico</h3>
                  <p className="text-muted-foreground mb-6">
                    Controle ordens de serviço, manutenções e TPMS
                  </p>
                  
                  <div className="space-y-2 mb-6">
                    {['Ordens de Serviço', 'Manutenção Preventiva', 'Controle de Pneus', 'Análise de Custos'].map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-purple-500" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                    Acessar Hub
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge className="mb-4" variant="outline">
              <Zap className="w-3 h-3 mr-1" />
              Próxima Geração
            </Badge>
            <h2 className="text-4xl font-bold mb-4">
              Features que o Mercado Não Tem
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Tecnologias de ponta que colocam você 5 anos à frente da concorrência
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => {
              const IconComponent = feature.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="group border-border/40 bg-card/50 backdrop-blur hover:border-primary/50 transition-all duration-300 hover:scale-105 h-full">
                    <CardContent className="p-6">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge className="mb-4" variant="outline">
              <Award className="w-3 h-3 mr-1" />
              Social Proof
            </Badge>
            <h2 className="text-4xl font-bold mb-4">
              Quem Usa, Aprova
            </h2>
            <p className="text-muted-foreground text-lg">
              +1.200 transportadoras confiam no LogicFlow AI
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="border-border/40 bg-card/50 backdrop-blur h-full hover-scale">
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-4">"{testimonial.text}"</p>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge className="mb-4" variant="outline">
              <DollarSign className="w-3 h-3 mr-1" />
              Planos Transparentes
            </Badge>
            <h2 className="text-4xl font-bold mb-4">
              Preços Justos para Todos
            </h2>
            <p className="text-muted-foreground text-lg">
              Sem taxas ocultas. Cancele quando quiser.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {plans.map((plan, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className={`border-border/40 bg-card/50 backdrop-blur h-full relative hover-scale ${
                  plan.popular ? 'border-primary shadow-lg shadow-primary/20 scale-105' : ''
                }`}>
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                      Mais Popular
                    </Badge>
                  )}
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-muted-foreground mb-4">{plan.desc}</p>
                    <div className="mb-6">
                      <span className="text-4xl font-bold">
                        {plan.price === "Custom" ? plan.price : `R$ ${plan.price}`}
                      </span>
                      {plan.price !== "Custom" && (
                        <span className="text-muted-foreground">/mês</span>
                      )}
                    </div>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className={`w-full ${plan.popular ? '' : 'variant-outline'}`}
                      onClick={() => navigate('/login')}
                    >
                      {plan.price === "Custom" ? "Falar com Vendas" : "Começar Agora"}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-500/10 to-background -z-10" />
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Pronto para Revolucionar
              <br />
              sua Operação?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Junte-se a +1.200 empresas que já transformaram sua logística com IA
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="gap-2 text-lg h-14 px-8 hover-scale" onClick={() => navigate('/login')}>
                <Rocket className="w-5 h-5" />
                Começar Teste Grátis
              </Button>
              <Button size="lg" variant="outline" className="gap-2 text-lg h-14 px-8 hover-scale">
                <Users className="w-5 h-5" />
                Agendar Demo
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              ✓ Sem cartão de crédito • ✓ 14 dias grátis • ✓ Cancele quando quiser
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Preços</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Integrações</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Sobre</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Carreiras</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contato</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Recursos</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Documentação</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Suporte</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Status</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Changelog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Privacidade</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Termos</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Segurança</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">LGPD</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/40 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <img src={optilogLogo} alt="OptiLog" className="h-6" />
              <span className="text-sm text-muted-foreground">
                © 2025 LogicFlow AI. Todos os direitos reservados.
              </span>
            </div>
            <div className="flex items-center gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" /></svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.840 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.430.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      <PWAInstallPrompt />
    </div>
  );
};

export default LandingPage;
