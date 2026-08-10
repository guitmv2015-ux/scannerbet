/**
 * EVOLUA PAINEL EXACT STYLIZED SIDEBAR COMPONENT
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

    if (sidebar) {
      sidebar.style.display = 'flex';
      sidebar.className = "hidden md:flex flex-col w-64 border-r border-[#1a1738] bg-[#0f0d24] p-4 shrink-0 justify-between min-h-screen overflow-y-auto";

      sidebar.innerHTML = `
        <div class="space-y-6">
          <!-- Logo Brand Header (Matching Evolua Prospect Logo) -->
          <div class="flex items-center gap-2.5 px-2 py-1 cursor-pointer" onclick="window.sbApp.navigateTo('dashboard')">
            <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-lg">
              ⚡
            </div>
            <div>
              <span class="font-heading font-black text-lg text-white tracking-tight leading-none block">
                SCANNER<span class="text-indigo-400">BET</span>
              </span>
              <span class="text-[9px] font-mono text-cyan-400 uppercase tracking-widest font-bold block">AI PROSPECT</span>
            </div>
          </div>

          <!-- Navigation Groups (Matching Evolua Menu Items & Badges Exactly) -->
          <nav class="space-y-3">
            
            <!-- Section 1: Painel & Conexões -->
            <div class="space-y-1">
              <button data-view="dashboard" class="sidebar-link ${activeView === 'dashboard' ? 'active' : ''}">
                <span class="text-base">📊</span>
                <span class="flex-1">Painel</span>
              </button>
              
              <button data-view="scanner" class="sidebar-link ${activeView === 'scanner' ? 'active' : ''}">
                <span class="text-base">📡</span>
                <span class="flex-1">Conexões</span>
                <span class="badge-sidebar-warn">Não oficial</span>
              </button>

              <button data-view="community" class="sidebar-link ${activeView === 'community' ? 'active' : ''}">
                <span class="text-base">👤</span>
                <span class="flex-1">Leads</span>
              </button>
            </div>

            <!-- Section 2: Agentes (Collapsible) -->
            <div class="space-y-1">
              <div class="sidebar-group-title flex items-center justify-between cursor-pointer">
                <span class="flex items-center gap-1.5">⭐ Agentes</span>
                <span class="text-[10px]">⌄</span>
              </div>
              <div class="pl-2 space-y-1">
                <button data-view="scanner" class="sidebar-link text-xs py-2 ${activeView === 'scanner' ? 'active' : ''}">
                  <span class="text-xs">←</span>
                  <span>Agente de Disparo</span>
                </button>
                <button data-view="help" class="sidebar-link text-xs py-2 ${activeView === 'help' ? 'active' : ''}">
                  <span class="text-xs">👤</span>
                  <span>Agente de Atendimento</span>
                </button>
              </div>
            </div>

            <!-- Section 3: Ferramentas (Collapsible) -->
            <div class="space-y-1">
              <div class="sidebar-group-title flex items-center justify-between cursor-pointer">
                <span class="flex items-center gap-1.5">📍 Ferramentas</span>
                <span class="text-[10px]">⌄</span>
              </div>
              <div class="pl-2 space-y-1">
                <button data-view="scanner" class="sidebar-link text-xs py-2">
                  <span class="text-xs">📍</span>
                  <span>ScannerBet Odds</span>
                </button>
                <button data-view="metrics" class="sidebar-link text-xs py-2">
                  <span class="text-xs">📷</span>
                  <span>Extrator de Mídia</span>
                </button>
                <button data-view="history" class="sidebar-link text-xs py-2">
                  <span class="text-xs">🏢</span>
                  <span>Extrator CNPJ</span>
                </button>
                <button data-view="referral" class="sidebar-link text-xs py-2">
                  <span class="text-xs">💬</span>
                  <span>Grupos WhatsApp VIP</span>
                </button>
              </div>
            </div>

            <!-- Section 4: Disparos & CRM -->
            <div class="space-y-1">
              <button data-view="scanner" class="sidebar-link">
                <span class="text-base">🔔</span>
                <span class="flex-1">Disparos</span>
                <span class="badge-sidebar-warn">Não oficial</span>
              </button>

              <button data-view="history" class="sidebar-link ${activeView === 'history' ? 'active' : ''}">
                <span class="text-base">📊</span>
                <span class="flex-1">CRM (Kanban)</span>
              </button>

              <button data-view="metrics" class="sidebar-link ${activeView === 'metrics' ? 'active' : ''}">
                <span class="text-base">🔄</span>
                <span class="flex-1">Follow-up IA</span>
              </button>

              <button data-view="help" class="sidebar-link ${activeView === 'help' ? 'active' : ''}">
                <span class="text-base">💬</span>
                <span class="flex-1">ScannerBot Chat</span>
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

        <!-- Bottom Logout Button (Matching Evolua Purple Gradient Button) -->
        <div class="pt-4 border-t border-[#1a1738]">
          <button id="sidebar-logout-btn" class="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all">
            <span>🚪</span> Sair
          </button>
        </div>
      `;
    }

    // Mobile Bottom Navigation Bar
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
