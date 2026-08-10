/**
 * EVOLUA PAINEL EXACT STYLIZED HEADER COMPONENT
 */

class NavbarComponent {
  static render() {
    const header = document.getElementById('app-navbar');
    if (!header) return;

    const state = window.sbState.getState();
    const user = state.user;
    const isAuth = !!user;

    const pageLabels = {
      'dashboard': 'Painel',
      'scanner': 'ScannerBet Odds & IA',
      'community': 'Comunidade & Palpites',
      'metrics': 'Métricas de Acerto',
      'history': 'Histórico Salvado',
      'referral': 'Indique e Ganhe',
      'plans': 'Planos & Assinatura',
      'blog': 'Blog & Notícias',
      'admin': 'Painel Administrativo 👑',
      'settings': 'Configurações',
      'help': 'Central de Ajuda'
    };

    const activePageLabel = pageLabels[state.currentView] || 'Painel';
    const firstInitial = user && user.name ? user.name.charAt(0).toUpperCase() : 'G';
    const userName = user && user.name ? user.name : 'Guilherme';

    header.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between gap-4">
        
        <!-- Left Breadcrumb Page Indicator (Exact Evolua Header Style) -->
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
          <span class="font-bold text-sm text-white font-heading">${activePageLabel}</span>
        </div>

        <!-- Right Header Items (Exact Evolua Header Buttons) -->
        <div class="flex items-center gap-3">
          ${isAuth ? `
            <!-- Cyan Gradient CTA Pill Button: "🚀 Revenda com sua Marca" -->
            <button id="nav-cta-upgrade-btn" class="hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-sky-400 to-blue-600 hover:from-sky-300 hover:to-blue-500 text-white font-bold text-xs shadow-lg transition-all">
              <span>🚀</span> Revenda com sua Marca
            </button>

            <!-- User Avatar Pill: "G Guilherme" (Matching Evolua Screenshot User Pill) -->
            <div class="flex items-center gap-2.5 bg-[#1a1738] border border-surface-700/80 px-3.5 py-1.5 rounded-full text-xs font-bold text-white cursor-pointer hover:border-indigo-500 transition-all" onclick="window.sbApp.navigateTo('settings')">
              <span class="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[11px] font-black shadow">
                ${firstInitial}
              </span>
              <span>${userName}</span>
            </div>
          ` : `
            <button id="nav-login-btn" class="text-xs text-surface-300 hover:text-white font-bold px-3 py-2">
              Entrar
            </button>
            <button id="nav-register-btn" class="px-4 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs shadow-lg">
              Começar Agora
            </button>
          `}

          <!-- Theme Toggle -->
          <button id="theme-toggle-btn" class="p-2 rounded-xl bg-[#1a1738] border border-surface-700 text-surface-300 hover:text-white transition-all text-xs" title="Alternar Tema Dark/Light">
            ${state.theme === 'dark' ? '🌙' : '☀️'}
          </button>
        </div>
      </div>
    `;

    NavbarComponent.bindEvents();
  }

  static bindEvents() {
    const ctaUpgradeBtn = document.getElementById('nav-cta-upgrade-btn');
    if (ctaUpgradeBtn) {
      ctaUpgradeBtn.onclick = () => window.sbApp.navigateTo('referral');
    }

    const loginBtn = document.getElementById('nav-login-btn');
    if (loginBtn) loginBtn.onclick = () => window.sbApp.navigateTo('auth-login');

    const registerBtn = document.getElementById('nav-register-btn');
    if (registerBtn) registerBtn.onclick = () => window.sbApp.navigateTo('auth-register');

    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.onclick = () => {
        const state = window.sbState.getState();
        const newTheme = state.theme === 'dark' ? 'light' : 'dark';
        document.documentElement.className = newTheme;
        window.sbState.setState({ theme: newTheme });
      };
    }
  }
}

window.NavbarComponent = NavbarComponent;
