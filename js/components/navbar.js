/**
 * SCANNERBET DEFINITIVE NAVBAR COMPONENT
 * Inspired by Raven UI (Minimalist, Dark, Sleek Icons)
 */

class NavbarComponent {
  static render() {
    const header = document.getElementById('app-navbar');
    if (!header) return;

    const state = window.sbState.getState();
    const isAuth = !!state.user;

    // Generate current date string like Raven (e.g. "10 de Agosto de 2026 - Segunda-feira")
    const dateOpts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateString = new Date().toLocaleDateString('pt-BR', dateOpts);
    const timeHour = new Date().getHours();
    let greeting = 'Bom dia!';
    if (timeHour >= 12 && timeHour < 18) greeting = 'Boa tarde!';
    else if (timeHour >= 18) greeting = 'Boa noite!';

    const config = window.SCANNERBET_CONFIG.API_CONFIG;
    const isDemoMode = !config.configured;

    header.innerHTML = `
      ${isDemoMode ? `
        <!-- Demo Mode Transparency Banner -->
        <div class="w-full bg-[#f59e0b] text-black text-[10px] font-bold tracking-widest uppercase text-center py-1">
          🟡 Modo Demonstração: Os dados exibidos são simulados. Nenhuma API real conectada.
        </div>
      ` : `
        <div class="w-full bg-[#22c55e] text-black text-[10px] font-bold tracking-widest uppercase text-center py-1">
          🟢 DADOS EM TEMPO REAL CONECTADOS
        </div>
      `}
      <div class="w-full px-6 h-20 flex items-center justify-between border-b border-[#262626] bg-[#0a0a0a]">
        
        <!-- Left Greeting & Date -->
        <div class="flex flex-col">
          <h2 class="text-xl font-bold text-white flex items-center gap-2">
            ${greeting} <span class="animate-pulse">👋</span>
          </h2>
          <p class="text-[11px] text-[#737373] mt-0.5 capitalize">${dateString}</p>
        </div>

        <!-- Right Header Items -->
        <div class="flex items-center gap-4">
          ${isAuth ? `
            <!-- Action Icons (View, Refresh, Support) -->
            <div class="flex items-center gap-2 mr-2">
              <button class="w-8 h-8 rounded-full flex items-center justify-center text-[#a3a3a3] hover:bg-[#1a1a1a] hover:text-white transition-colors" title="Modo Oculto">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              </button>
              <button class="w-8 h-8 rounded-full flex items-center justify-center text-[#a3a3a3] hover:bg-[#1a1a1a] hover:text-white transition-colors" title="Atualizar Dados">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
              </button>
              <button onclick="window.sbApp.navigateTo('help')" class="ml-2 btn-primary !rounded-full shadow-[0_0_15px_rgba(163,230,53,0.2)]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                Suporte
              </button>
            </div>

            <div class="h-6 w-px bg-[#262626]"></div> <!-- Divider -->

            <!-- Theme & Notifications -->
            <div class="flex items-center gap-1">
              <button class="w-9 h-9 rounded-full flex items-center justify-center text-[#a3a3a3] hover:bg-[#1a1a1a] hover:text-white transition-colors relative">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                <span class="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500"></span>
              </button>
              <button id="theme-toggle-btn" class="w-9 h-9 rounded-full flex items-center justify-center text-[#a3a3a3] hover:bg-[#1a1a1a] hover:text-white transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
              </button>
            </div>
          ` : `
            <button onclick="window.sbApp.navigateTo('auth-login')" class="btn-ghost">
              Entrar
            </button>
            <button onclick="window.sbApp.navigateTo('auth-register')" class="btn-primary">
              Começar Agora
            </button>
          `}
        </div>
      </div>
    `;

    NavbarComponent.bindEvents();
  }

  static bindEvents() {
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
