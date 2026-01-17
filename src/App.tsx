import React from 'react';

const Feature: React.FC<{ title: string; desc: string }> = ({ title, desc }) => (
  <div className="feature-card" role="article" aria-label={title}>
    <h3>{title}</h3>
    <p>{desc}</p>
  </div>
);

export default function App() {
  const [showSignup, setShowSignup] = React.useState(false);
  const [formData, setFormData] = React.useState({ name: '', email: '', company: '' });

  React.useEffect(() => {
    console.log('[App] mounted');
  }, []);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Cadastro:', formData);
    alert(`Obrigado ${formData.name}! Entraremos em contato em breve.`);
    setShowSignup(false);
    setFormData({ name: '', email: '', company: '' });
  };

  return (
    <div className="app-root">
      <header className="topbar" role="banner">
        <div className="brand">LogicView</div>
        <nav aria-label="Main navigation">
          <a href="#features">Recursos</a>
          <a href="#marketplace">Marketplace</a>
          <a href="#how">Como funciona</a>
          <a href="#contact">Contato</a>
        </nav>
        <button className="cta" onClick={() => setShowSignup(true)} aria-label="Experimente grátis">Experimente grátis</button>
      </header>

      <main>
        <section className="hero" role="region" aria-label="Hero">
          <div>
            <h1>Transforme dados em decisões — em tempo real</h1>
            <p>UI elegante, execução rápida e integrações inteligentes para times que precisam entregar resultados.</p>
            <div className="hero-cta">
              <button className="primary" onClick={() => setShowSignup(true)}>Começar agora</button>
              <button className="secondary">Ver demo</button>
            </div>
          </div>
          <div className="hero-visual" aria-hidden="true">
            <div className="card-visual">📊 Dashboard preview</div>
          </div>
        </section>

        <section id="features" className="features" aria-label="Destaques">
          <h2>Destaques</h2>
          <div className="features-grid">
            <Feature title="Realtime Insights" desc="Alertas e métricas em tempo real para decisões imediatas." />
            <Feature title="Workflows acionáveis" desc="Automatize ações com base em regras de negócio." />
            <Feature title="Segurança de nível enterprise" desc="Roles, permissões e auditoria completas." />
          </div>
        </section>

        <section id="marketplace" className="marketplace" aria-label="Marketplace">
          <h2>Marketplace de Módulos</h2>
          <p className="marketplace-desc">Expanda funcionalidades com módulos prontos para usar</p>
          <div className="modules-grid">
            <div className="module-card">
              <span className="module-icon">📦</span>
              <h3>Gestão de Frotas</h3>
              <p>Rastreamento e manutenção</p>
            </div>
            <div className="module-card">
              <span className="module-icon">📊</span>
              <h3>Relatórios Avançados</h3>
              <p>Analytics e dashboards</p>
            </div>
            <div className="module-card">
              <span className="module-icon">🔔</span>
              <h3>Notificações</h3>
              <p>Alertas inteligentes</p>
            </div>
            <div className="module-card">
              <span className="module-icon">🤖</span>
              <h3>Automações</h3>
              <p>Workflows customizáveis</p>
            </div>
          </div>
        </section>

        <section id="how" className="how" aria-label="Como funciona">
          <h2>Como funciona</h2>
          <ol>
            <li>Conectar fontes de dados</li>
            <li>Configurar painéis e regras de ação</li>
            <li>Executar e escalar</li>
          </ol>
        </section>

        <section id="contact" className="contact" aria-label="Contato">
          <h2>Fale Conosco</h2>
          <p>Agende uma demo e mostre o que o LogicView faz pelo seu negócio.</p>
          <div className="contact-methods">
            <div className="contact-card">
              <span className="contact-icon">📧</span>
              <h3>Email</h3>
              <a href="mailto:contato@xyzlogicflow.tech">contato@xyzlogicflow.tech</a>
            </div>
            <div className="contact-card">
              <span className="contact-icon">💬</span>
              <h3>Chat Online</h3>
              <p>Atendimento via WhatsApp</p>
              <button className="chat-btn" onClick={() => window.open('https://wa.me/seu_numero', '_blank')}>
                Iniciar conversa
              </button>
            </div>
            <div className="contact-card">
              <span className="contact-icon">📅</span>
              <h3>Agendar Demo</h3>
              <button className="primary" onClick={() => setShowSignup(true)}>Agendar agora</button>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer" role="contentinfo">
        <div className="footer-content">
          <div className="footer-section">
            <h4>LogicView</h4>
            <p>Transformando dados em decisões</p>
          </div>
          <div className="footer-section">
            <h4>Links</h4>
            <a href="#features">Recursos</a>
            <a href="#marketplace">Marketplace</a>
            <a href="#contact">Contato</a>
          </div>
          <div className="footer-section">
            <h4>Contato</h4>
            <p>contato@xyzlogicflow.tech</p>
            <p>© {new Date().getFullYear()} LogicView</p>
          </div>
        </div>
      </footer>

      {/* Modal de Cadastro */}
      {showSignup && (
        <div className="modal-overlay" onClick={() => setShowSignup(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowSignup(false)}>✕</button>
            <h2>Experimente Grátis</h2>
            <p>Preencha os dados e comece sua jornada</p>
            <form onSubmit={handleSignup}>
              <input
                type="text"
                placeholder="Seu nome"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
              <input
                type="email"
                placeholder="Seu email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="Empresa"
                value={formData.company}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
              />
              <button type="submit" className="primary">Cadastrar</button>
            </form>
          </div>
        </div>
      )}

      {/* Botão de Chat Flutuante */}
      <button 
        className="chat-float" 
        onClick={() => window.open('https://wa.me/seu_numero', '_blank')}
        aria-label="Chat online"
      >
        💬
      </button>
    </div>
  );
}
