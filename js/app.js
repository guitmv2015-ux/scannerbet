/**
 * SCANNERBET BOOTSTRAP APPLICATION & ROUTER
 */

class ScannerBetApp {
  constructor() {
    this.routes = {
      'landing': window.LandingView,
      'auth-login': window.AuthView,
      'auth-register': window.AuthView,
      'onboarding': window.OnboardingView,
      'dashboard': window.DashboardView,
      'scanner': window.ScannerView,
      'community': window.CommunityView,
      'metrics': window.MetricsView,
      'history': window.HistoryView,
      'referral': window.ReferralView,
      'plans': window.PlansView,
      'blog': window.BlogView,
      'admin': window.AdminView,
      'settings': window.SettingsView,
      'help': window.HelpView
    };

    this.init();
  }

  init() {
    // Initial theme set
    const state = window.sbState.getState();
    document.documentElement.className = state.theme || 'dark';

    // Subscribe to state changes to re-render navbar/sidebar
    window.sbState.subscribe((newState) => {
      window.NavbarComponent.render();
      window.SidebarComponent.render();
    });

    // Initial Navbar & Sidebar render
    window.NavbarComponent.render();
    window.SidebarComponent.render();

    // Bind floating ScannerBot drawer toggles
    this.bindAiAssistant();

    // Initial route resolution based on auth status
    if (state.user) {
      if (!state.user.onboardingCompleted) {
        this.navigateTo('onboarding');
      } else {
        this.navigateTo('dashboard');
      }
    } else {
      this.navigateTo('landing');
    }
  }

  // Router Navigate Method
  navigateTo(viewId, params = {}) {
    const state = window.sbState.getState();
    
    // Auth Guard check for protected routes
    const publicViews = ['landing', 'auth-login', 'auth-register', 'blog', 'plans', 'help'];
    if (!state.user && !publicViews.includes(viewId)) {
      viewId = 'auth-login';
    }

    window.sbState.setState({ currentView: viewId });
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Render Target View
    const ViewClass = this.routes[viewId];
    if (ViewClass) {
      if (viewId === 'auth-login') ViewClass.renderLogin();
      else if (viewId === 'auth-register') ViewClass.renderSignup();
      else ViewClass.render(params);
    }
  }

  // ScannerBot Drawer Logic
  bindAiAssistant() {
    const toggleBtn = document.getElementById('toggle-ai-assistant-btn');
    const closeBtn = document.getElementById('close-ai-assistant-btn');
    const drawer = document.getElementById('ai-assistant-drawer');
    const chatForm = document.getElementById('ai-chat-form');
    const chatInput = document.getElementById('ai-chat-input');
    const chatMessages = document.getElementById('ai-chat-messages');

    if (toggleBtn && drawer) {
      toggleBtn.onclick = () => {
        const isHidden = drawer.classList.contains('pointer-events-none');
        if (isHidden) {
          drawer.classList.remove('translate-y-full', 'opacity-0', 'pointer-events-none');
        } else {
          drawer.classList.add('translate-y-full', 'opacity-0', 'pointer-events-none');
        }
      };
    }

    if (closeBtn && drawer) {
      closeBtn.onclick = () => {
        drawer.classList.add('translate-y-full', 'opacity-0', 'pointer-events-none');
      };
    }

    if (chatForm && chatInput && chatMessages) {
      chatForm.onsubmit = (e) => {
        e.preventDefault();
        const query = chatInput.value.trim();
        if (!query) return;

        // User message
        const userMsg = document.createElement('div');
        userMsg.className = 'flex gap-2 justify-end';
        userMsg.innerHTML = `
          <div class="bg-brand-600 p-3 rounded-2xl rounded-tr-none text-white max-w-[85%]">
            ${query}
          </div>
        `;
        chatMessages.appendChild(userMsg);
        chatInput.value = '';
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Bot Response Simulation
        setTimeout(() => {
          let botReply = 'O ScannerBet centraliza as cotações de casas como Betano, bet365 e Superbet, fornecendo uma análise preditiva por IA com o Scanner Score (0-100) para te auxiliar na escolha.';
          
          if (query.toLowerCase().includes('plano') || query.toLowerCase().includes('preço')) {
            botReply = 'Oferecemos 3 planos: Scanner Start (R$ 39,90/mês), Scanner Pro (R$ 69,90/mês) e Scanner Elite (R$ 99,90/mês com análises ilimitadas).';
          } else if (query.toLowerCase().includes('garantia') || query.toLowerCase().includes('lucro')) {
            botReply = 'Não garantimos lucros nem acertos. O ScannerBet é uma ferramenta estritamente informativa baseada em dados estatísticos. Aposte com responsabilidade (18+).';
          }

          const botMsg = document.createElement('div');
          botMsg.className = 'flex gap-2 max-w-[85%]';
          botMsg.innerHTML = `
            <div class="w-6 h-6 rounded-full bg-brand-600/30 border border-brand-500 flex items-center justify-center text-brand-400 text-xs shrink-0 mt-1">🤖</div>
            <div class="bg-surface-800 p-3 rounded-2xl rounded-tl-none border border-surface-700/50 text-surface-200">
              ${botReply}
            </div>
          `;
          chatMessages.appendChild(botMsg);
          chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 800);
      };
    }
  }
}

// Global App Instance
document.addEventListener('DOMContentLoaded', () => {
  window.sbApp = new ScannerBetApp();
});
