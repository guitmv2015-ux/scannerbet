/**
 * SCANNERBET DEFINITIVE SIDEBAR COMPONENT
 * Inspired by Raven UI (Deep Dark, Lime Accents, Efficient Space)
 */

class SidebarComponent {
  static render() {
    const sidebar = document.getElementById('app-sidebar');
    const mobileNav = document.getElementById('app-mobile-nav');
    const state = window.sbState.getState();
    const user = state.user;

    if (!user) {
      if (sidebar) sidebar.style.display = 'none';
      if (mobileNav) mobileNav.style.display = 'none';
      return;
    }

    const activeView = state.currentView || 'dashboard';

    if (sidebar) {
      sidebar.style.display = 'flex';
      sidebar.className = "hidden md:flex flex-col w-[260px] border-r border-[#262626] bg-[#0f0f0f] p-0 shrink-0 justify-between min-h-screen";

      sidebar.innerHTML = `
        <div class="flex flex-col h-full">
          
          <!-- Brand Logo Area -->
          <div class="px-5 py-6">
            <div class="flex items-center gap-3 cursor-pointer" onclick="window.sbApp.navigateTo('dashboard')">
              <!-- SVG Icon inspired by Raven's geometric logo -->
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="#a3e635" stroke="#a3e635" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span class="font-heading font-light text-xl text-white tracking-widest">
                SCANNER<span class="font-bold">BET</span>
              </span>
            </div>
          </div>

          <!-- Main Action Button -->
          <div class="px-5 pb-6">
            <button onclick="window.sbApp.navigateTo('scanner')" class="w-full btn-primary flex items-center justify-center gap-2 py-3 rounded-xl shadow-[0_0_15px_rgba(163,230,53,0.15)]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Nova Análise IA
            </button>
          </div>

          <!-- Navigation Menus -->
          <div class="flex-1 overflow-y-auto px-3 space-y-1">
            <div class="sidebar-group-title flex items-center justify-between">
              <span class="flex items-center gap-2"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg> Menu</span>
              <span class="text-[10px]">⌃</span>
            </div>
            
            <button data-view="dashboard" class="sidebar-link ${activeView === 'dashboard' ? 'active' : ''}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
              Dashboard
            </button>
            
            <button data-view="scanner" class="sidebar-link ${activeView === 'scanner' ? 'active' : ''}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
              Scanner Odds
            </button>

            <button data-view="history" class="sidebar-link ${activeView === 'history' ? 'active' : ''}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
              Meus Palpites
            </button>

            <button data-view="metrics" class="sidebar-link ${activeView === 'metrics' ? 'active' : ''}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
              Desempenho ROI
            </button>

            <button data-view="community" class="sidebar-link ${activeView === 'community' ? 'active' : ''}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              Comunidade VIP
            </button>

            <button data-view="help" class="sidebar-link ${activeView === 'help' ? 'active' : ''}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              ScannerBot IA
            </button>
          </div>

          <!-- Bottom Status & User Profile (Raven Inspired) -->
          <div class="p-4 border-t border-[#262626] space-y-4">
            
            <!-- Plan Status Card -->
            <div class="premium-card p-4 border border-[#262626] bg-[#141414] rounded-xl cursor-pointer hover:border-[#a3e635]/50 transition-colors" onclick="window.sbApp.navigateTo('plans')">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-semibold text-white flex items-center gap-1.5"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a3e635" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg> ScannerBet Pro</span>
                <span class="text-[10px] text-[#a3e635] font-bold tracking-wider">ATIVO</span>
              </div>
              <div class="flex items-center justify-between text-[10px] text-gray-500 mb-1">
                <span>Plano Mensal</span>
                <span>30 Dias</span>
              </div>
              <div class="w-full bg-[#262626] rounded-full h-1">
                <div class="bg-[#a3e635] h-1 rounded-full" style="width: 100%"></div>
              </div>
            </div>

            <!-- User Profile Area -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3 cursor-pointer" onclick="window.sbApp.navigateTo('settings')">
                <div class="w-9 h-9 rounded-lg bg-[#262626] flex items-center justify-center text-white text-sm font-bold border border-[#333333]">
                  ${user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <p class="text-sm font-semibold text-white leading-none">${user.name || 'Usuário'}</p>
                  <p class="text-[10px] text-gray-500 mt-1">${user.role} Member</p>
                </div>
              </div>
              <button id="sidebar-logout-btn" class="text-gray-500 hover:text-red-400 p-2 transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              </button>
            </div>

          </div>

        </div>
      `;
    }

    if (mobileNav) {
      mobileNav.style.display = 'none'; // Will handle mobile later, focus on desktop layout first
    }

    SidebarComponent.bindEvents();
  }

  static bindEvents() {
    document.querySelectorAll('.sidebar-link').forEach(btn => {
      btn.onclick = () => {
        const targetView = btn.getAttribute('data-view');
        if (targetView) window.sbApp.navigateTo(targetView);
      };
    });

    const logoutBtn = document.getElementById('sidebar-logout-btn');
    if (logoutBtn) logoutBtn.onclick = () => window.AuthService.logout();
  }
}

window.SidebarComponent = SidebarComponent;
