import React from 'react';

/**
 * Modern Landing Page Component
 * 
 * A polished, responsive landing page with:
 * - Hero section with clear value proposition
 * - Feature highlights
 * - How it works section
 * - Footer with branding
 */
function App() {
  return (
    <div className="landing-page">
      {/* Header */}
      <header style={{
        backgroundColor: 'var(--color-bg-primary)',
        borderBottom: '1px solid var(--color-border)',
        padding: 'var(--spacing-md) 0',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div className="container" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{
            fontSize: 'var(--font-size-xl)',
            fontWeight: 700,
            color: 'var(--color-primary)'
          }}>
            Logic View Bright
          </div>
          <nav style={{
            display: 'flex',
            gap: 'var(--spacing-lg)'
          }}>
            <a href="#features" style={{ color: 'var(--color-text-primary)' }}>Features</a>
            <a href="#how-it-works" style={{ color: 'var(--color-text-primary)' }}>How It Works</a>
            <a href="#contact" className="btn btn-primary btn-sm" style={{
              padding: 'var(--spacing-sm) var(--spacing-md)',
              fontSize: 'var(--font-size-sm)'
            }}>Get Started</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'var(--color-text-inverse)',
        padding: 'var(--spacing-3xl) 0',
        textAlign: 'center'
      }}>
        <div className="container">
          <h1 style={{
            fontSize: 'var(--font-size-5xl)',
            fontWeight: 700,
            marginBottom: 'var(--spacing-lg)',
            color: 'var(--color-text-inverse)'
          }}>
            Transform Your Logistics Operations
          </h1>
          <p style={{
            fontSize: 'var(--font-size-xl)',
            marginBottom: 'var(--spacing-2xl)',
            color: 'rgba(255, 255, 255, 0.9)',
            maxWidth: '800px',
            margin: '0 auto var(--spacing-2xl)'
          }}>
            A comprehensive platform for managing fleet, routes, maintenance, and operations with real-time insights and intelligent automation.
          </p>
          <div style={{
            display: 'flex',
            gap: 'var(--spacing-md)',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button className="btn btn-large" style={{
              backgroundColor: 'var(--color-text-inverse)',
              color: 'var(--color-primary)'
            }}>
              Start Free Trial
            </button>
            <button className="btn btn-large btn-secondary" style={{
              borderColor: 'var(--color-text-inverse)',
              color: 'var(--color-text-inverse)'
            }}>
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section section-light">
        <div className="container">
          <h2 className="text-center mb-2xl" style={{ color: 'var(--color-text-primary)' }}>
            Powerful Features for Modern Logistics
          </h2>
          <div className="grid grid-3">
            <div className="card">
              <div style={{
                width: '60px',
                height: '60px',
                backgroundColor: 'var(--color-primary-light)',
                borderRadius: 'var(--radius-xl)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 'var(--spacing-md)',
                fontSize: 'var(--font-size-2xl)'
              }}>
                🚚
              </div>
              <h3 className="mb-sm">Fleet Management</h3>
              <p>
                Track your entire fleet in real-time with GPS integration, maintenance scheduling, and vehicle health monitoring.
              </p>
            </div>
            
            <div className="card">
              <div style={{
                width: '60px',
                height: '60px',
                backgroundColor: 'var(--color-primary-light)',
                borderRadius: 'var(--radius-xl)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 'var(--spacing-md)',
                fontSize: 'var(--font-size-2xl)'
              }}>
                📊
              </div>
              <h3 className="mb-sm">Analytics Dashboard</h3>
              <p>
                Get actionable insights with comprehensive KPIs, cost monitoring, and executive-level reporting capabilities.
              </p>
            </div>
            
            <div className="card">
              <div style={{
                width: '60px',
                height: '60px',
                backgroundColor: 'var(--color-primary-light)',
                borderRadius: 'var(--radius-xl)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 'var(--spacing-md)',
                fontSize: 'var(--font-size-2xl)'
              }}>
                🛠️
              </div>
              <h3 className="mb-sm">Maintenance Tracking</h3>
              <p>
                Predictive maintenance, service scheduling, and workshop management to keep your fleet running smoothly.
              </p>
            </div>
            
            <div className="card">
              <div style={{
                width: '60px',
                height: '60px',
                backgroundColor: 'var(--color-primary-light)',
                borderRadius: 'var(--radius-xl)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 'var(--spacing-md)',
                fontSize: 'var(--font-size-2xl)'
              }}>
                🗺️
              </div>
              <h3 className="mb-sm">Route Optimization</h3>
              <p>
                Intelligent routing algorithms that reduce fuel costs, improve delivery times, and maximize efficiency.
              </p>
            </div>
            
            <div className="card">
              <div style={{
                width: '60px',
                height: '60px',
                backgroundColor: 'var(--color-primary-light)',
                borderRadius: 'var(--radius-xl)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 'var(--spacing-md)',
                fontSize: 'var(--font-size-2xl)'
              }}>
                📱
              </div>
              <h3 className="mb-sm">Driver App</h3>
              <p>
                Mobile-first driver interface for journey management, digital documentation, and real-time communication.
              </p>
            </div>
            
            <div className="card">
              <div style={{
                width: '60px',
                height: '60px',
                backgroundColor: 'var(--color-primary-light)',
                borderRadius: 'var(--radius-xl)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 'var(--spacing-md)',
                fontSize: 'var(--font-size-2xl)'
              }}>
                🔒
              </div>
              <h3 className="mb-sm">Enterprise Security</h3>
              <p>
                Role-based access control, audit trails, and compliance-ready security features for peace of mind.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="section">
        <div className="container">
          <h2 className="text-center mb-2xl">How It Works</h2>
          <div className="grid grid-3">
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-text-inverse)',
                borderRadius: 'var(--radius-full)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto var(--spacing-md)',
                fontSize: 'var(--font-size-3xl)',
                fontWeight: 700
              }}>
                1
              </div>
              <h4 className="mb-sm">Sign Up</h4>
              <p>
                Create your account in minutes and configure your organization settings.
              </p>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-text-inverse)',
                borderRadius: 'var(--radius-full)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto var(--spacing-md)',
                fontSize: 'var(--font-size-3xl)',
                fontWeight: 700
              }}>
                2
              </div>
              <h4 className="mb-sm">Import Data</h4>
              <p>
                Import your fleet, drivers, and routes with our easy-to-use data import tools.
              </p>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-text-inverse)',
                borderRadius: 'var(--radius-full)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto var(--spacing-md)',
                fontSize: 'var(--font-size-3xl)',
                fontWeight: 700
              }}>
                3
              </div>
              <h4 className="mb-sm">Go Live</h4>
              <p>
                Start managing operations, tracking KPIs, and optimizing your logistics immediately.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section section-dark" id="contact">
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 className="mb-lg" style={{ color: 'var(--color-text-inverse)' }}>
            Ready to Transform Your Logistics?
          </h2>
          <p style={{
            fontSize: 'var(--font-size-lg)',
            marginBottom: 'var(--spacing-xl)',
            color: 'rgba(255, 255, 255, 0.8)',
            maxWidth: '600px',
            margin: '0 auto var(--spacing-xl)'
          }}>
            Join hundreds of companies already using Logic View Bright to streamline their operations.
          </p>
          <button className="btn btn-large" style={{
            backgroundColor: 'var(--color-text-inverse)',
            color: 'var(--color-primary)'
          }}>
            Get Started Today
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        backgroundColor: 'var(--color-bg-tertiary)',
        padding: 'var(--spacing-xl) 0',
        borderTop: '1px solid var(--color-border)'
      }}>
        <div className="container">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 'var(--spacing-md)'
          }}>
            <div>
              <div style={{
                fontSize: 'var(--font-size-lg)',
                fontWeight: 700,
                color: 'var(--color-primary)',
                marginBottom: 'var(--spacing-sm)'
              }}>
                Logic View Bright
              </div>
              <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)', marginBottom: 0 }}>
                © 2024 Logic View Bright. All rights reserved.
              </p>
            </div>
            <div style={{
              display: 'flex',
              gap: 'var(--spacing-lg)',
              fontSize: 'var(--font-size-sm)'
            }}>
              <a href="#privacy">Privacy Policy</a>
              <a href="#terms">Terms of Service</a>
              <a href="#support">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
