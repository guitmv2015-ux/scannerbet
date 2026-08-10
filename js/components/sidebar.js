/**
 * EVOLUA PAINEL STYLIZED SIDEBAR COMPONENT
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

    const activeView = state.currentView;

    // Desktop Vertical Dark Sidebar
    if (sidebar) {
      sidebar.style.display = 'flex';
      sidebar.className = "hidden md:flex flex-col w-64 border-r border-surface-800 bg-[#0c0b1e] p-4 shrink-0 justify-between min-h-screen overflow-y-auto";

      sidebar.innerHTML = `
        <div class="space-y-6">
          <!-- Logo Brand Header -->
          <div class="flex items-center gap-3 px-2 py-1 cursor-pointer" onclick="window.sbApp.navigateTo('dashboard')">
            <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-lg">
              ⚡
            </div>
            <span class="font-heading font-black text-lg text-white tracking-tight">
              SCANNER<span class="text-indigo-400">BET</span>
            </span>
          </div>

          <!-- Navigation Groups -->
          <nav class="space-y-4">
            
            <!-- Section 1: PAINEL -->
            <div class="space-y-1">
              <button data-view="dashboard" class="sidebar-link ${activeView === 'dashboard' ? 'active' : ''}">
                <span class="text-base">📊</span>
                <span>Painel</span>
              </button>
            </div>

            <!-- Section 2: FERRAMENTAS SCANNER -->
            <div class="space-y-1">
              <div class="sidebar-group-title flex items-center justify-between">
                <span>Ferramentas Scanner</span>
                <span>⌄</span>
              </div>
              <button data-view="scanner" class="sidebar-link ${activeView === 'scanner' ? 'active' : ''}">
                <span class="text-base">⚡</span>
                <span class="flex-1">ScannerBet Odds</span>
                <span class="badge-sidebar-warn">PRO</span>
              </button>
            </div>

            <!-- Section 3: COMUNIDADE -->
            <div class="space-y-1">
              <div class="sidebar-group-title flex items-center justify-between">
                <span>Comunidade</span>
                <span>⌄</span>
              </div>
              <button data-view="community" class="sidebar-link ${activeView === 'community' ? 'active' : ''}">
                <span class="text-base">💬</span>
                <span class="flex-1">Feed & Palpites</span>
                <span class="badge-sidebar-bonus">OFICIAL</span>
              </button>
            </div>

            <!-- Section 4: DESEMPENHO -->
            <div class="space-y-1">
              <div class="sidebar-group-title">Desempenho</div>
              <button data-view="metrics" class="sidebar-link ${activeView === 'metrics' ? 'active' : ''}">
                <span class="text-base">📈</span>
                <span>Métricas de Acerto</span>
              </button>
              <button data-view="history" class="sidebar-link ${activeView === 'history' ? 'active' : ''}">
                <span class="text-base">📜</span>
                <span>Histórico Salvado</span>
              </button>
            </div>

            <!-- Section 5: AFILIADOS & PLANOS -->
            <div class="space-y-1">
              <div class="sidebar-group-title">Programa</div>
              <button data-view="referral" class="sidebar-link ${activeView === 'referral' ? 'active' : ''}">
                <span class="text-base">🎁</span>
                <span>Indique e Ganhe</span>
              </button>
              <button data-view="plans" class="sidebar-link ${activeView === 'plans' ? 'active' : ''}">
                <span class="text-base">💳</span>
                <span>Planos & Assinatura</span>
              </button>
            </div>

            <!-- Section 6: SUPORTE & BLOG -->
            <div class="space-y-1">
              <div class="sidebar-group-title">Suporte</div>
              <button data-view="blog" class="sidebar-link ${activeView === 'blog' ? 'active' : ''}">
                <span class="text-base">📰</span>
                <span>Blog & Notícias</span>
              </button>
              <button data-view="help" class="sidebar-link ${activeView === 'help' ? 'active' : ''}">
                <span class="text-base">🤖</span>
                <span class="flex-1">ScannerBot IA</span>
                <span class="badge-sidebar-bonus">BÔNUS</span>
              </button>
              ${user.role === 'Admin' ? `
                <button data-view="admin" class="sidebar-link ${activeView === 'admin' ? 'active' : ''}">
                  <span class="text-base">🛡️</span>
                  <span>Painel Admin 👑</span>
                </button>
              ` : ''}
            </div>

          </nav>
        </div>

        <!-- Bottom Logout Button (Evolua Painel Style) -->
        <div class="pt-4 border-t border-surface-800/60">
          <button id="sidebar-logout-btn" class="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all">
            <span>🚪</span> Sair
          </button>
        </div>
      `;
    }

    // Mobile Navigation Bottom Bar
    if (mobileNav) {
      mobileNav.style.display = 'flex';
      const mobileItems = [
        { id: 'dashboard', label: 'Painel', icon: '📊' },
        { id: 'scanner', label: 'Scanner', icon: '⚡' },
        { id: 'community', label: 'Comunidade', icon: '💬' },
        { id: 'history', label: 'Histórico', icon: '📜' },
        { id: 'plans', label: 'Planos', icon: '💳' }
      ];

      mobileNav.innerHTML = mobileItems.map(item => `
        <button data-view="${item.id}" class="mobile-nav-item flex flex-col items-center gap-1 text-[10px] font-semibold p-1 ${
          activeView === item.id ? 'text-indigo-400 font-bold' : 'text-surface-400'
        }">
          <span class="text-base">${item.icon}</span>
          <span>${item.label}</span>
        </button>
      `).join('');
    }

    SidebarComponent.bindEvents();
  }

  static bindEvents() {
    document.querySelectorAll('.sidebar-link, .mobile-nav-item').forEach(btn => {
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
