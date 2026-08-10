/**
 * SCANNERBET CONFIGURATION MODULE - EXPANDED SPORTSBOOK CATALOG
 */

window.SCANNERBET_CONFIG = {
  APP_NAME: 'ScannerBet',
  APP_VERSION: '1.0.0-PROD-READY',
  TAGLINE: 'Encontre. Compare. Analise.',
  SUPPORT_EMAIL: 'suporte@scannerbet.com.br',
  
  // Real-time Odds API Configuration
  API_CONFIG: {
    configured: true, // Switched to true for Phase 2 Integration
    baseUrl: '/api',  // Backend Proxy URL
    updateIntervalMs: 30000 // 30 seconds for polling if applicable
  },
  
  // Default Plans Configuration (Editable by Admin)
  PLANS: [
    {
      id: 'start',
      name: 'Scanner Start',
      price: 39.90,
      currency: 'R$',
      period: 'mês',
      popular: false,
      aiLimit: 30,
      features: [
        '30 análises inteligentes por mês',
        'Comparação de Odds (Betano & bet365)',
        'Alertas de variação de odds',
        'Acesso ao Feed da Comunidade',
        'Histórico dos últimos 30 dias'
      ],
      badge: 'Iniciante'
    },
    {
      id: 'pro',
      name: 'Scanner Pro',
      price: 69.90,
      currency: 'R$',
      period: 'mês',
      popular: true,
      aiLimit: 150,
      features: [
        '150 análises inteligentes por mês',
        'Todas as casas de apostas (Betano, bet365, Superbet, KTO)',
        'Indicador Scanner Score 0-100',
        'Acesso Completo às Comunidades e Grupos VIP',
        'Dashboard de Desempenho & Métricas de Win-Rate',
        'Selo PRO no perfil da comunidade'
      ],
      badge: 'Mais Popular'
    },
    {
      id: 'elite',
      name: 'Scanner Elite',
      price: 99.90,
      currency: 'R$',
      period: 'mês',
      popular: false,
      aiLimit: 9999,
      features: [
        'Análises com IA ILIMITADAS',
        'Notificação instantânea de Palpites Oficiais do Administrador',
        'Comparador de Odds Ultra-Rápido',
        'Acesso Exclusivo ao Grupo Elite no Discord/Comunidade',
        'Gerador de Links de Referral com comissão estendida',
        'Suporte Prioritário VIP 24/7'
      ],
      badge: 'Alta Performance'
    }
  ],

  // Bookmakers / Odds Providers
  BOOKMAKERS: [
    { id: 'betano', name: 'Betano', logo: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=60&h=60&fit=crop&crop=faces', color: '#ff5500', active: true, status: 'Online' },
    { id: 'bet365', name: 'bet365', logo: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=60&h=60&fit=crop&crop=faces', color: '#006a4e', active: true, status: 'Online' },
    { id: 'superbet', name: 'Superbet', logo: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=60&h=60&fit=crop&crop=faces', color: '#e30613', active: true, status: 'Online' },
    { id: 'kto', name: 'KTO', logo: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=60&h=60&fit=crop&crop=faces', color: '#cc0000', active: true, status: 'Online' }
  ],

  // Expanded Sports & Leagues Catalog
  SPORTS: [
    {
      id: 'futebol',
      name: 'Futebol',
      icon: '⚽',
      leagues: [
        { id: 'brasileirao', name: 'Brasileirão Série A' },
        { id: 'champions', name: 'UEFA Champions League' },
        { id: 'premier-league', name: 'Premier League' },
        { id: 'copa-brasil', name: 'Copa do Brasil' },
        { id: 'la-liga', name: 'La Liga (Espanha)' }
      ]
    },
    {
      id: 'basquete',
      name: 'Basquete',
      icon: '🏀',
      leagues: [
        { id: 'nba', name: 'NBA' },
        { id: 'nbb', name: 'NBB (Brasil)' },
        { id: 'euroleague', name: 'EuroLeague' }
      ]
    },
    {
      id: 'tenis',
      name: 'Tênis',
      icon: '🎾',
      leagues: [
        { id: 'atp', name: 'ATP Masters 1000' },
        { id: 'wimbledon', name: 'Wimbledon / Grand Slam' }
      ]
    },
    {
      id: 'mma',
      name: 'UFC / MMA',
      icon: '🥊',
      leagues: [
        { id: 'ufc-ppv', name: 'UFC PPV Card' },
        { id: 'ufc-fight-night', name: 'UFC Fight Night' }
      ]
    },
    {
      id: 'esports',
      name: 'eSports',
      icon: '🎮',
      leagues: [
        { id: 'csgo', name: 'CS2 Major' },
        { id: 'lol', name: 'League of Legends Worlds' }
      ]
    }
  ],

  // AI Engine Configuration
  AI_ENGINE: {
    DEFAULT_MODEL: 'ScannerBet-V3-SportsAI',
    DISCLAIMER_TEXT: 'Conteúdo destinado exclusivamente a maiores de 18 anos. As análises do ScannerBet são ferramentas informativas baseadas em estatísticas e modelos matemáticos. Não garantem resultados nem lucros. Aposte com responsabilidade.',
    SCORE_WEIGHTS: {
      oddsDiscrepancy: 0.35,
      teamForm: 0.25,
      xGContext: 0.20,
      publicSentiment: 0.20
    }
  }
};
