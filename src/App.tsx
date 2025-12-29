/**
 * Logic View Bright - Modern Landing Page
 * A polished, responsive landing page with hero, features, and call-to-action sections
 */

function App() {
  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="landing-header-container">
          <a href="/" className="landing-logo">
            <span>🚀</span>
            <span>LogicFlow</span>
          </a>
          <nav className="landing-nav">
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="/login" className="landing-button landing-button-primary" style={{ padding: '0.5rem 1.5rem', fontSize: '0.875rem' }}>
              Get Started
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-hero-container">
          <h1>Transform Your Logistics Operations</h1>
          <p>
            The all-in-one platform for modern supply chain management. 
            Streamline your operations, optimize routes, and boost efficiency.
          </p>
          <div className="landing-hero-buttons">
            <a href="/login" className="landing-button landing-button-primary">
              Start Free Trial
            </a>
            <a href="#features" className="landing-button landing-button-secondary">
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="landing-features">
        <div className="landing-features-container">
          <h2 className="landing-section-title">Powerful Features</h2>
          <p className="landing-section-subtitle">
            Everything you need to manage your logistics operations efficiently
          </p>
          <div className="landing-features-grid">
            <div className="landing-feature-card">
              <div className="landing-feature-icon">📊</div>
              <h3>Real-time Analytics</h3>
              <p>
                Monitor your operations with live dashboards and actionable insights 
                to make data-driven decisions.
              </p>
            </div>
            <div className="landing-feature-card">
              <div className="landing-feature-icon">🗺️</div>
              <h3>Smart Routing</h3>
              <p>
                Optimize delivery routes automatically using AI-powered algorithms 
                to save time and fuel costs.
              </p>
            </div>
            <div className="landing-feature-card">
              <div className="landing-feature-icon">📦</div>
              <h3>Inventory Management</h3>
              <p>
                Track your inventory in real-time across multiple warehouses 
                with automated reordering.
              </p>
            </div>
            <div className="landing-feature-card">
              <div className="landing-feature-icon">👥</div>
              <h3>Team Collaboration</h3>
              <p>
                Enable seamless communication between drivers, warehouse staff, 
                and management teams.
              </p>
            </div>
            <div className="landing-feature-card">
              <div className="landing-feature-icon">🔒</div>
              <h3>Enterprise Security</h3>
              <p>
                Bank-level encryption and compliance with industry standards 
                to keep your data safe.
              </p>
            </div>
            <div className="landing-feature-card">
              <div className="landing-feature-icon">📱</div>
              <h3>Mobile Access</h3>
              <p>
                Access your operations from anywhere with our responsive 
                mobile-friendly interface.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="landing-how-it-works">
        <div className="landing-how-it-works-container">
          <h2 className="landing-section-title">How It Works</h2>
          <p className="landing-section-subtitle">
            Get started in minutes with our simple onboarding process
          </p>
          <div className="landing-steps">
            <div className="landing-step">
              <div className="landing-step-number">1</div>
              <h3>Sign Up</h3>
              <p>
                Create your account and set up your organization profile in just a few clicks.
              </p>
            </div>
            <div className="landing-step">
              <div className="landing-step-number">2</div>
              <h3>Configure</h3>
              <p>
                Customize the platform to match your business processes and requirements.
              </p>
            </div>
            <div className="landing-step">
              <div className="landing-step-number">3</div>
              <h3>Import Data</h3>
              <p>
                Easily import your existing data from spreadsheets or other systems.
              </p>
            </div>
            <div className="landing-step">
              <div className="landing-step-number">4</div>
              <h3>Go Live</h3>
              <p>
                Start managing your operations with full support from our team.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-container">
          <div className="landing-footer-links">
            <a href="/about">About</a>
            <a href="/pricing">Pricing</a>
            <a href="/contact">Contact</a>
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
          </div>
          <div className="landing-footer-bottom">
            © {new Date().getFullYear()} LogicFlow. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
