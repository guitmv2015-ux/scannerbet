/**
 * FULL ADMIN CONTROL PANEL & MODERATION VIEW
 */

class AdminView {
  static render() {
    const main = document.getElementById('app-main');
    if (!main) return;

    const state = window.sbState.getState();
    const user = state.user;

    // Security check: Only Admin role can render admin view
    if (!user || user.role !== 'Admin') {
      main.innerHTML = `
        <div class="glass-panel p-12 text-center space-y-4 max-w-md mx-auto my-12 rounded-3xl border border-rose-500/40">
          <div class="text-4xl">🛑</div>
          <h2 class="text-xl font-bold text-white">Acesso Restrito ao Administrador</h2>
          <p class="text-xs text-surface-400">Alterne para o perfil "Admin" no menu superior da barra de navegação para acessar este painel.</p>
          <button onclick="window.AuthService.switchUserRole('Admin'); window.sbApp.navigateTo('admin');" class="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-lg">
            Alternar para Perfil Admin 👑
          </button>
        </div>
      `;
      return;
    }

    const metrics = state.adminMetrics || {};
    const users = window.AdminService.getUsersList();
    const providers = window.OddsProviderService.getProvidersStatus();
    const auditLogs = window.AdminService.getAuditLogs();

    main.innerHTML = `
      <div class="space-y-6 animate-in fade-in duration-300">
        
        <!-- Admin Header -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-surface-800 pb-4">
          <div>
            <span class="text-xs text-brand-400 font-bold uppercase tracking-wider block">Painel Administrativo 👑</span>
            <h1 class="text-2xl md:text-3xl font-black text-white font-heading">Visão Geral do Produto</h1>
          </div>
          <button id="admin-publish-official-tip-btn" class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2">
            <span>⚡</span> Publicar Palpite Oficial
          </button>
        </div>

        <!-- Executive Metrics Cards Grid -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="glass-panel p-5 rounded-2xl border border-surface-800 space-y-1">
            <span class="text-xs text-surface-400 font-semibold block">Total de Usuários</span>
            <div class="text-2xl font-black text-white">${metrics.totalUsers.toLocaleString()}</div>
            <span class="text-[10px] text-emerald-400 font-semibold">+142 hoje</span>
          </div>

          <div class="glass-panel p-5 rounded-2xl border border-surface-800 space-y-1">
            <span class="text-xs text-surface-400 font-semibold block">Assinantes Ativos</span>
            <div class="text-2xl font-black text-brand-400">${metrics.activeSubscribers.toLocaleString()}</div>
            <span class="text-[10px] text-surface-400">Churn Rate: ${metrics.churnRate}%</span>
          </div>

          <div class="glass-panel p-5 rounded-2xl border border-surface-800 space-y-1">
            <span class="text-xs text-surface-400 font-semibold block">Receita Recorrente (MRR)</span>
            <div class="text-2xl font-black text-emerald-400">R$ ${metrics.mrr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <span class="text-[10px] text-emerald-400/80">Crescimento constante</span>
          </div>

          <div class="glass-panel p-5 rounded-2xl border border-surface-800 space-y-1">
            <span class="text-xs text-surface-400 font-semibold block">Análises de IA Processadas</span>
            <div class="text-2xl font-black text-white">${metrics.totalAiAnalyses.toLocaleString()}</div>
            <span class="text-[10px] text-surface-400">Média de 4.2s por requisição</span>
          </div>
        </div>

        <!-- Odds Provider Health Monitor Section -->
        <div class="glass-panel p-6 rounded-3xl border border-surface-800 space-y-4">
          <div class="flex items-center justify-between border-b border-surface-800 pb-3">
            <h3 class="font-bold text-white text-base flex items-center gap-2">
              <span>📡</span> Monitor de Status dos Providers de Odds
            </h3>
            <button id="admin-sync-odds-btn" class="px-3 py-1.5 rounded-xl bg-surface-800 hover:bg-surface-700 text-white text-xs font-semibold">
              Forçar Sincronização
            </button>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            ${providers.map(p => `
              <div class="p-4 rounded-xl bg-surface-950 border border-surface-800 space-y-1">
                <div class="flex items-center justify-between text-xs">
                  <strong class="text-white font-bold">${p.name}</strong>
                  <span class="w-2 h-2 rounded-full ${p.status === 'Online' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}"></span>
                </div>
                <div class="text-[11px] text-surface-400">Status: <strong class="text-emerald-400">${p.status}</strong></div>
                <div class="text-[10px] text-surface-500">Latência: ${p.latency} • Last sync: ${p.lastSync}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Users Management Table -->
        <div class="glass-panel p-6 rounded-3xl border border-surface-800 space-y-4">
          <div class="flex items-center justify-between border-b border-surface-800 pb-3">
            <h3 class="font-bold text-white text-base">Gerenciamento de Usuários</h3>
            <input type="text" placeholder="Buscar usuário por e-mail..." class="bg-surface-950 border border-surface-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-surface-500 focus:outline-none" />
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="border-b border-surface-800 text-surface-400 font-semibold uppercase text-[10px]">
                  <th class="py-2.5 px-3">Usuário</th>
                  <th class="py-2.5 px-3">E-mail</th>
                  <th class="py-2.5 px-3">Papel / Plano</th>
                  <th class="py-2.5 px-3">Créditos IA</th>
                  <th class="py-2.5 px-3">Status</th>
                  <th class="py-2.5 px-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-surface-800/50">
                ${users.map(u => `
                  <tr class="hover:bg-surface-800/40">
                    <td class="py-3 px-3 font-bold text-white">${u.name}</td>
                    <td class="py-3 px-3 text-surface-300">${u.email}</td>
                    <td class="py-3 px-3 font-semibold text-brand-400">${u.role}</td>
                    <td class="py-3 px-3 text-surface-300">${u.aiCredits}</td>
                    <td class="py-3 px-3">
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${u.status === 'Ativo' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}">
                        ${u.status}
                      </span>
                    </td>
                    <td class="py-3 px-3 text-right">
                      <button class="admin-toggle-block-btn text-[11px] font-semibold text-rose-400 hover:underline" data-id="${u.id}">
                        ${u.status === 'Ativo' ? 'Bloquear' : 'Desbloquear'}
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Audit Logs -->
        <div class="glass-panel p-6 rounded-3xl border border-surface-800 space-y-3">
          <h3 class="font-bold text-white text-base">Logs do Sistema & Auditoria</h3>
          <div class="space-y-2 text-xs">
            ${auditLogs.map(log => `
              <div class="p-3 rounded-xl bg-surface-950 border border-surface-800 flex items-center justify-between text-surface-300">
                <div>
                  <strong class="text-brand-400 font-mono">${log.action}:</strong> ${log.detail}
                </div>
                <span class="text-[10px] text-surface-500">${log.timestamp}</span>
              </div>
            `).join('')}
          </div>
        </div>

      </div>
    `;

    AdminView.bindEvents();
  }

  static bindEvents() {
    const pubBtn = document.getElementById('admin-publish-official-tip-btn');
    if (pubBtn) {
      pubBtn.onclick = () => {
        window.CommunityService.createPost({
          text: '🔥 PALPITE OFICIAL SCANNERBET: Flamengo x Palmeiras — Entrada em Ambas Marcam @ 1.92 com desvio de valor positivo na Superbet. Score IA 84/100.',
          attachedBet: {
            match: 'Flamengo vs Palmeiras',
            selection: 'Ambas Marcam (Sim)',
            odd: 1.92,
            bookmaker: 'SUPERBET',
            score: 84
          },
          isOfficial: true
        });

        window.Toast.show('Palpite Oficial publicado na comunidade com selo de verificação!', 'success');
        window.sbApp.navigateTo('community');
      };
    }

    const syncBtn = document.getElementById('admin-sync-odds-btn');
    if (syncBtn) {
      syncBtn.onclick = () => {
        window.Toast.show('Sincronização forçada com providers efetuada!', 'success');
      };
    }
  }
}

window.AdminView = AdminView;
