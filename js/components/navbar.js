/**
 * EVOLUA PAINEL STYLIZED TOP HEADER COMPONENT
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

    header.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between gap-4">
        
        <!-- Left Breadcrumb Page Title (Evolua Style) -->
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
          <span class="font-bold text-sm text-white">${activePageLabel}</span>
        </div>

        <!-- Right Header Items -->
        <div class="flex items-center gap-3">
          ${isAuth ? `
            <!-- Revenda / Upgrade CTA Gradient Pill (Evolua Style) -->
            <button id="nav-cta-upgrade-btn" class="hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg transition-all">
              <span>🚀</span> Revenda / Programa de Afiliados
            </button>

            <!-- User Profile Pill (Evolua Style: "G Guilherme") -->
            <div class="flex items-center gap-2 bg-surface-900 border border-surface-700/80 px-3 py-1 rounded-full text-xs font-bold text-white cursor-pointer" onclick="window.sbApp.navigateTo('settings')">
              <span class="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[11px] font-black">
                ${user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </span>
              <span>${user.name}</span>
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
          <button id="theme-toggle-btn" class="p-2 rounded-xl bg-surface-900 border border-surface-700 text-surface-300 hover:text-white transition-all text-xs" title="Alternar Tema">
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
