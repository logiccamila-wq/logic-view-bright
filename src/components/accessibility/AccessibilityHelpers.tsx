import { ReactNode, useEffect } from "react";
import { useLocation } from "react-router-dom";

interface AccessiblePageProps {
  children: ReactNode;
  title: string;
  description?: string;
}

/**
 * Wrapper para páginas com melhorias de acessibilidade WCAG AAA
 * - Define título da página para leitores de tela
 * - Anuncia mudanças de rota
 * - Gerencia foco ao navegar
 */
export function AccessiblePage({ children, title, description }: AccessiblePageProps) {
  const location = useLocation();

  useEffect(() => {
    // Define o título do documento
    document.title = `${title} | XYZLogicFlow`;

    // Anuncia mudança de página para leitores de tela
    const announcement = document.getElementById('route-announcement');
    if (announcement) {
      announcement.textContent = `Navegou para ${title}${description ? `: ${description}` : ''}`;
    }

    // Move foco para o início do conteúdo principal
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
    }
  }, [location, title, description]);

  return <>{children}</>;
}

/**
 * Live region para anúncios de leitores de tela
 * Deve ser incluído uma única vez no App
 */
export function AccessibilityAnnouncer() {
  return (
    <>
      {/* Skip to main content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg"
      >
        Pular para conteúdo principal
      </a>

      {/* Live region for route announcements */}
      <div
        id="route-announcement"
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      />

      {/* Live region for dynamic content */}
      <div
        id="live-region"
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      />
    </>
  );
}

/**
 * Hook para anunciar mensagens para leitores de tela
 */
export function useAnnounce() {
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const liveRegion = document.getElementById('live-region');
    if (liveRegion) {
      liveRegion.setAttribute('aria-live', priority);
      liveRegion.textContent = message;
      
      // Limpa após 1 segundo
      setTimeout(() => {
        liveRegion.textContent = '';
      }, 1000);
    }
  };

  return { announce };
}

/**
 * Componente de botão acessível com ARIA labels apropriados
 */
interface AccessibleButtonProps {
  children: ReactNode;
  onClick?: () => void;
  ariaLabel: string;
  ariaDescription?: string;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export function AccessibleButton({
  children,
  onClick,
  ariaLabel,
  ariaDescription,
  disabled = false,
  className = '',
  type = 'button',
}: AccessibleButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={className}
      aria-label={ariaLabel}
      aria-describedby={ariaDescription ? `desc-${ariaLabel.replace(/\s+/g, '-')}` : undefined}
    >
      {children}
      {ariaDescription && (
        <span id={`desc-${ariaLabel.replace(/\s+/g, '-')}`} className="sr-only">
          {ariaDescription}
        </span>
      )}
    </button>
  );
}

/**
 * Componente de ícone acessível
 */
interface AccessibleIconProps {
  icon: ReactNode;
  label: string;
  decorative?: boolean;
}

export function AccessibleIcon({ icon, label, decorative = false }: AccessibleIconProps) {
  if (decorative) {
    return <span aria-hidden="true">{icon}</span>;
  }

  return (
    <span role="img" aria-label={label}>
      {icon}
    </span>
  );
}

/**
 * Componente de lista acessível com navegação por teclado
 */
interface AccessibleListProps {
  children: ReactNode;
  ariaLabel: string;
  className?: string;
}

export function AccessibleList({ children, ariaLabel, className = '' }: AccessibleListProps) {
  return (
    <ul
      role="list"
      aria-label={ariaLabel}
      className={className}
    >
      {children}
    </ul>
  );
}

/**
 * Heading com nível semântico correto
 */
interface AccessibleHeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: ReactNode;
  className?: string;
  id?: string;
}

export function AccessibleHeading({ level, children, className = '', id }: AccessibleHeadingProps) {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  
  return (
    <Tag className={className} id={id}>
      {children}
    </Tag>
  );
}
