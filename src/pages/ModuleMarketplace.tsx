import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  Package, 
  TrendingUp, 
  Shield, 
  Users, 
  Settings, 
  Brain, 
  Link, 
  UserCheck,
  Star,
  Download,
  CheckCircle,
  Clock,
  DollarSign,
  Zap,
  BarChart3,
  Truck,
  Warehouse,
  PackageCheck,
  Wrench
} from 'lucide-react';

interface Module {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  price: number;
  rating: number;
  reviews: number;
  category: string;
  status: 'available' | 'installed' | 'trial' | 'coming-soon';
  features: string[];
  trialDays?: number;
  popular?: boolean;
}

const ModuleMarketplace: React.FC = () => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const modules: Module[] = [
    {
      id: 'dashboard',
      name: t('modules.dashboard.name'),
      description: t('modules.dashboard.description'),
      icon: <BarChart3 className="w-8 h-8" />,
      price: 0,
      rating: 4.8,
      reviews: 1250,
      category: 'core',
      status: 'installed',
      features: [
        t('modules.dashboard.features.realTimeAnalytics'),
        t('modules.dashboard.features.customizableWidgets'),
        t('modules.dashboard.features.mobileResponsive')
      ]
    },
    {
      id: 'tms',
      name: t('modules.tms.name'),
      description: t('modules.tms.description'),
      icon: <Truck className="w-8 h-8" />,
      price: 299,
      rating: 4.7,
      reviews: 890,
      category: 'logistics',
      status: 'available',
      popular: true,
      features: [
        t('modules.tms.features.routeOptimization'),
        t('modules.tms.features.fleetManagement'),
        t('modules.tms.features.realTimeTracking')
      ],
      trialDays: 14
    },
    {
      id: 'wms',
      name: t('modules.wms.name'),
      description: t('modules.wms.description'),
      icon: <Warehouse className="w-8 h-8" />,
      price: 399,
      rating: 4.9,
      reviews: 650,
      category: 'logistics',
      status: 'available',
      features: [
        t('modules.wms.features.inventoryControl'),
        t('modules.wms.features.automatedPicking'),
        t('modules.wms.features.spaceOptimization')
      ],
      trialDays: 14
    },
    {
      id: 'oms',
      name: t('modules.oms.name'),
      description: t('modules.oms.description'),
      icon: <PackageCheck className="w-8 h-8" />,
      price: 199,
      rating: 4.6,
      reviews: 420,
      category: 'operations',
      status: 'available',
      features: [
        t('modules.oms.features.orderProcessing'),
        t('modules.oms.features.multiChannel'),
        t('modules.oms.features.customerPortal')
      ],
      trialDays: 7
    },
    {
      id: 'mechanic-hub',
      name: t('modules.mechanicHub.name'),
      description: t('modules.mechanicHub.description'),
      icon: <Wrench className="w-8 h-8" />,
      price: 149,
      rating: 4.5,
      reviews: 320,
      category: 'maintenance',
      status: 'available',
      features: [
        t('modules.mechanicHub.features.maintenanceScheduling'),
        t('modules.mechanicHub.features.partsInventory'),
        t('modules.mechanicHub.features.serviceHistory')
      ],
      trialDays: 7
    },
    {
      id: 'driver-app',
      name: t('modules.driverApp.name'),
      description: t('modules.driverApp.description'),
      icon: <Users className="w-8 h-8" />,
      price: 99,
      rating: 4.8,
      reviews: 1100,
      category: 'mobile',
      status: 'available',
      popular: true,
      features: [
        t('modules.driverApp.features.gpsNavigation'),
        t('modules.driverApp.features.proofDelivery'),
        t('modules.driverApp.features.communication')
      ],
      trialDays: 30
    },
    {
      id: 'control-tower',
      name: t('modules.controlTower.name'),
      description: t('modules.controlTower.description'),
      icon: <Shield className="w-8 h-8" />,
      price: 499,
      rating: 4.9,
      reviews: 280,
      category: 'operations',
      status: 'available',
      features: [
        t('modules.controlTower.features.realTimeMonitoring'),
        t('modules.controlTower.features.alertManagement'),
        t('modules.controlTower.features.incidentResponse')
      ],
      trialDays: 14
    },
    {
      id: 'crm',
      name: t('modules.crm.name'),
      description: t('modules.crm.description'),
      icon: <UserCheck className="w-8 h-8" />,
      price: 249,
      rating: 4.4,
      reviews: 750,
      category: 'business',
      status: 'available',
      features: [
        t('modules.crm.features.customerManagement'),
        t('modules.crm.features.salesPipeline'),
        t('modules.crm.features.communicationHistory')
      ],
      trialDays: 14
    },
    {
      id: 'erp',
      name: t('modules.erp.name'),
      description: t('modules.erp.description'),
      icon: <Settings className="w-8 h-8" />,
      price: 599,
      rating: 4.6,
      reviews: 180,
      category: 'business',
      status: 'available',
      features: [
        t('modules.erp.features.financialManagement'),
        t('modules.erp.features.hrManagement'),
        t('modules.erp.features.procurement')
      ],
      trialDays: 14
    },
    {
      id: 'ai',
      name: t('modules.ai.name'),
      description: t('modules.ai.description'),
      icon: <Brain className="w-8 h-8" />,
      price: 799,
      rating: 4.9,
      reviews: 95,
      category: 'advanced',
      status: 'coming-soon',
      features: [
        t('modules.ai.features.predictiveAnalytics'),
        t('modules.ai.features.routeOptimization'),
        t('modules.ai.features.demandForecasting')
      ]
    },
    {
      id: 'blockchain',
      name: t('modules.blockchain.name'),
      description: t('modules.blockchain.description'),
      icon: <Link className="w-8 h-8" />,
      price: 999,
      rating: 4.7,
      reviews: 45,
      category: 'advanced',
      status: 'coming-soon',
      features: [
        t('modules.blockchain.features.supplyChainTransparency'),
        t('modules.blockchain.features.secureTransactions'),
        t('modules.blockchain.features.smartContracts')
      ]
    }
  ];

  const categories = [
    { id: 'all', name: t('marketplace.categories.all'), icon: <Package className="w-4 h-4" /> },
    { id: 'core', name: t('marketplace.categories.core'), icon: <Zap className="w-4 h-4" /> },
    { id: 'logistics', name: t('marketplace.categories.logistics'), icon: <Truck className="w-4 h-4" /> },
    { id: 'operations', name: t('marketplace.categories.operations'), icon: <Settings className="w-4 h-4" /> },
    { id: 'mobile', name: t('marketplace.categories.mobile'), icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'business', name: t('marketplace.categories.business'), icon: <Users className="w-4 h-4" /> },
    { id: 'maintenance', name: t('marketplace.categories.maintenance'), icon: <Wrench className="w-4 h-4" /> },
    { id: 'advanced', name: t('marketplace.categories.advanced'), icon: <Brain className="w-4 h-4" /> }
  ];

  const filteredModules = modules.filter(module => {
    const matchesCategory = selectedCategory === 'all' || module.category === selectedCategory;
    const matchesSearch = module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleInstall = (moduleId: string) => {
    // Implement module installation logic
    console.log(`Installing module: ${moduleId}`);
  };

  const handleTrial = (moduleId: string) => {
    // Implement trial start logic
    console.log(`Starting trial for module: ${moduleId}`);
  };

  const getStatusBadge = (status: Module['status']) => {
    switch (status) {
      case 'installed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3" />
            {t('marketplace.status.installed')}
          </span>
        );
      case 'trial':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="w-3 h-3" />
            {t('marketplace.status.trial')}
          </span>
        );
      case 'coming-soon':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <Clock className="w-3 h-3" />
            {t('marketplace.status.comingSoon')}
          </span>
        );
      default:
        return null;
    }
  };

  const getPriceDisplay = (module: Module) => {
    if (module.status === 'installed') {
      return (
        <span className="text-sm font-medium text-green-600">
          {t('marketplace.price.installed')}
        </span>
      );
    }
    
    if (module.status === 'coming-soon') {
      return (
        <span className="text-sm font-medium text-gray-500">
          {t('marketplace.price.comingSoon')}
        </span>
      );
    }

    if (module.price === 0) {
      return (
        <span className="text-lg font-bold text-green-600">
          {t('marketplace.price.free')}
        </span>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold text-text">
          ${module.price}
        </span>
        <span className="text-sm text-text-secondary">
          {t('marketplace.price.perMonth')}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-text mb-2">
            {t('marketplace.title')}
          </h1>
          <p className="text-xl text-text-secondary">
            {t('marketplace.subtitle')}
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder={t('marketplace.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-background border border-border text-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-primary text-white border-primary'
                      : 'bg-surface text-text border-border hover:bg-surface-hover'
                  }`}
                >
                  {category.icon}
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Modules Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredModules.map((module, index) => (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ scale: 1.02 }}
              className={`relative p-6 rounded-xl border transition-all ${
                module.popular
                  ? 'border-primary bg-gradient-to-br from-primary/5 to-primary/10'
                  : 'border-border bg-surface hover:border-primary/50'
              }`}
            >
              {module.popular && (
                <div className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">
                  {t('marketplace.popular')}
                </div>
              )}
              
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-lg bg-primary/10 text-primary">
                  {module.icon}
                </div>
                {getStatusBadge(module.status)}
              </div>

              <h3 className="text-xl font-bold text-text mb-2">{module.name}</h3>
              <p className="text-text-secondary text-sm mb-4 line-clamp-2">
                {module.description}
              </p>

              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(module.rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-text">{module.rating}</span>
                  <span className="text-sm text-text-secondary">({module.reviews})</span>
                </div>
              </div>

              <div className="mb-4">
                <div className="space-y-1">
                  {module.features.slice(0, 3).map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-2 text-sm text-text-secondary">
                      <CheckCircle className="w-3 h-3 text-primary" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                {getPriceDisplay(module)}
              </div>

              <div className="flex gap-2">
                {module.status === 'available' && (
                  <>
                    {module.trialDays && (
                      <button
                        onClick={() => handleTrial(module.id)}
                        className="flex-1 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium"
                      >
                        {t('marketplace.actions.startTrial')} ({module.trialDays}d)
                      </button>
                    )}
                    <button
                      onClick={() => handleInstall(module.id)}
                      className="flex-1 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors font-medium"
                    >
                      {t('marketplace.actions.install')}
                    </button>
                  </>
                )}
                
                {module.status === 'installed' && (
                  <button
                    disabled
                    className="w-full px-4 py-2 rounded-lg bg-green-100 text-green-800 font-medium cursor-not-allowed"
                  >
                    {t('marketplace.actions.installed')}
                  </button>
                )}
                
                {module.status === 'coming-soon' && (
                  <button
                    disabled
                    className="w-full px-4 py-2 rounded-lg bg-gray-100 text-gray-600 font-medium cursor-not-allowed"
                  >
                    {t('marketplace.actions.comingSoon')}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredModules.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Package className="w-16 h-16 text-text-secondary mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-text mb-2">
              {t('marketplace.empty.title')}
            </h3>
            <p className="text-text-secondary">
              {t('marketplace.empty.description')}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ModuleMarketplace;