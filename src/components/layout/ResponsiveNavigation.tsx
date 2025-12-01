import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  Home, 
  Settings, 
  Package, 
  BarChart3, 
  Users,
  ChevronDown,
  LogOut,
  User,
  Bell,
  Search
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  children?: NavItem[];
  badge?: number;
}

interface ResponsiveNavigationProps {
  className?: string;
  onNavigate?: (path: string) => void;
  currentPath?: string;
}

const ResponsiveNavigation: React.FC<ResponsiveNavigationProps> = ({
  className = '',
  onNavigate,
  currentPath = '/'
}) => {
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const navigationItems: NavItem[] = [
    {
      id: 'dashboard',
      label: t('navigation.dashboard'),
      icon: <Home className="w-5 h-5" />,
      href: '/dashboard'
    },
    {
      id: 'analytics',
      label: t('navigation.analytics'),
      icon: <BarChart3 className="w-5 h-5" />,
      href: '/analytics',
      badge: 3
    },
    {
      id: 'modules',
      label: t('navigation.modules'),
      icon: <Package className="w-5 h-5" />,
      href: '/modules',
      children: [
        { id: 'tms', label: t('modules.tms.name'), icon: <Package className="w-4 h-4" />, href: '/modules/tms' },
        { id: 'wms', label: t('modules.wms.name'), icon: <Package className="w-4 h-4" />, href: '/modules/wms' },
        { id: 'oms', label: t('modules.oms.name'), icon: <Package className="w-4 h-4" />, href: '/modules/oms' }
      ]
    },
    {
      id: 'team',
      label: t('navigation.team'),
      icon: <Users className="w-5 h-5" />,
      href: '/team'
    },
    {
      id: 'settings',
      label: t('navigation.settings'),
      icon: <Settings className="w-5 h-5" />,
      href: '/settings',
      children: [
        { id: 'appearance', label: t('settings.appearance.title'), icon: <Settings className="w-4 h-4" />, href: '/settings/appearance' },
        { id: 'branding', label: t('settings.branding.title'), icon: <Settings className="w-4 h-4" />, href: '/settings/branding' }
      ]
    }
  ];

  const profileItems = [
    { id: 'profile', label: t('navigation.profile'), icon: <User className="w-4 h-4" />, href: '/profile' },
    { id: 'notifications', label: t('navigation.notifications'), icon: <Bell className="w-4 h-4" />, href: '/notifications' },
    { id: 'logout', label: t('navigation.logout'), icon: <LogOut className="w-4 h-4" />, href: '/logout' }
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleNavigation = (href: string) => {
    if (onNavigate) {
      onNavigate(href);
    }
    setIsMobileMenuOpen(false);
  };

  const isActive = (href: string) => {
    return currentPath.startsWith(href);
  };

  const renderNavItem = (item: NavItem, isMobile = false, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const active = isActive(item.href);

    return (
      <div key={item.id} className={level > 0 ? 'ml-4' : ''}>
        <button
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.id);
            } else {
              handleNavigation(item.href);
            }
          }}
          className={`
            flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors
            ${active 
              ? 'bg-primary/10 text-primary border border-primary/20' 
              : 'text-text-secondary hover:text-text hover:bg-surface-hover'
            }
            ${isMobile ? 'text-base' : 'text-sm'}
          `}
        >
          <div className="flex items-center gap-3">
            {item.icon}
            <span>{item.label}</span>
          </div>
          {hasChildren && (
            <ChevronDown
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            />
          )}
          {item.badge && (
            <span className="ml-2 bg-primary text-white text-xs px-2 py-1 rounded-full">
              {item.badge}
            </span>
          )}
        </button>

        {hasChildren && (
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-1 space-y-1 overflow-hidden"
              >
                {item.children!.map(child => renderNavItem(child, isMobile, level + 1))}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    );
  };

  return (
    <nav className={`bg-surface border-b border-border ${className}`}>
      {/* Desktop Navigation */}
      <div className="hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Navigation */}
            <div className="flex items-center space-x-8">
              <div className="flex-shrink-0">
                <div className="text-2xl font-bold text-primary">
                  OptiLog
                </div>
              </div>
              <div className="flex space-x-4">
                {navigationItems.map(item => (
                  <div key={item.id} className="relative group">
                    <button
                      onClick={() => {
                        if (!item.children) {
                          handleNavigation(item.href);
                        }
                      }}
                      className={`
                        flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
                        ${isActive(item.href) 
                          ? 'text-primary bg-primary/10' 
                          : 'text-text-secondary hover:text-text'
                        }
                      `}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                      {item.children && <ChevronDown className="w-4 h-4" />}
                      {item.badge && (
                        <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </button>

                    {/* Dropdown */}
                    {item.children && (
                      <div className="absolute top-full left-0 mt-1 w-48 bg-surface border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        <div className="py-2">
                          {item.children.map(child => (
                            <button
                              key={child.id}
                              onClick={() => handleNavigation(child.href)}
                              className={`
                                flex items-center gap-3 w-full px-4 py-2 text-sm transition-colors
                                ${isActive(child.href) 
                                  ? 'text-primary bg-primary/10' 
                                  : 'text-text-secondary hover:text-text hover:bg-surface-hover'
                                }
                              `}
                            >
                              {child.icon}
                              <span>{child.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Search and Profile */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="w-4 h-4 text-text-secondary" />
                </div>
                <input
                  type="text"
                  placeholder={t('navigation.search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className={`
                    pl-10 pr-4 py-2 border rounded-lg text-sm transition-all
                    ${isSearchFocused 
                      ? 'w-64 border-primary' 
                      : 'w-48 border-border'
                    }
                    bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary/20
                  `}
                />
              </div>

              {/* Notifications */}
              <button className="relative p-2 text-text-secondary hover:text-text transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Profile */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-surface-hover transition-colors"
                >
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-lg shadow-lg z-50"
                    >
                      <div className="py-2">
                        {profileItems.map(item => (
                          <button
                            key={item.id}
                            onClick={() => handleNavigation(item.href)}
                            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-text-secondary hover:text-text hover:bg-surface-hover transition-colors"
                          >
                            {item.icon}
                            <span>{item.label}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-primary">
              OptiLog
            </div>
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg text-text-secondary hover:text-text hover:bg-surface-hover transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-surface border-t border-border overflow-hidden"
            >
              <div className="px-4 py-4 space-y-2">
                {/* Search */}
                <div className="relative mb-4">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="w-4 h-4 text-text-secondary" />
                  </div>
                  <input
                    type="text"
                    placeholder={t('navigation.search')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* Navigation Items */}
                {navigationItems.map(item => renderNavItem(item, true))}

                {/* Profile Section */}
                <div className="pt-4 border-t border-border">
                  <div className="space-y-2">
                    {profileItems.map(item => (
                      <button
                        key={item.id}
                        onClick={() => handleNavigation(item.href)}
                        className="flex items-center gap-3 w-full px-3 py-2 text-sm text-text-secondary hover:text-text hover:bg-surface-hover rounded-lg transition-colors"
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default ResponsiveNavigation;