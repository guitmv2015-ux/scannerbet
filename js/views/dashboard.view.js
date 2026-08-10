/**
 * EVOLUA PAINEL STYLIZED DASHBOARD VIEW
 */

class DashboardView {
  static render() {
    const main = document.getElementById('app-main');
    if (!main) return;

    const state = window.sbState.getState();
    const user = state.user;
    if (!user) {
      window.sbApp.navigateTo('auth-login');
      return;
    }

    main.innerHTML = `
      <div class="space-y-6 animate-in fade-in duration-300">
        
        <!-- Top Welcome Greeting Bar (Matching Evolua Screenshot) -->
        <div class="evolua-card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="flex items-center gap-2 text-base md:text-lg font-bold text-white">
            <span>Olá, ${user.name}</span>
            <span>👋</span>
            <span>bem-vindo ao seu painel</span>
          </div>
          <button id="dash-tutorial-btn" class="px-4 py-2 rounded-xl bg-surface-900 border border-surface-700 text-xs font-semibold text-surface-200 hover:text-white flex items-center gap-2 transition-all">
            <span>▶</span> Ver tutorial
          </button>
        </div>

        <!-- Featured Promo Gift Banner (Matching Evolua Screenshot Banner) -->
        <div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#031d38] via-[#09355b] to-[#041a33] p-6 md:p-8 text-white border border-cyan-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <!-- Background Ambient Glow -->
          <div class="absolute -right-10 -bottom-10 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none"></div>

          <div class="space-y-3 max-w-xl text-center md:text-left z-10">
            <span class="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[11px] font-bold uppercase tracking-wider">Bônus Exclusivo ScannerBet</span>
            <h2 class="text-2xl md:text-3xl font-black font-heading tracking-tight leading-tight">
              EU TENHO UM PRESENTE PRA VOCÊ 🎁
            </h2>
            <p class="text-xs md:text-sm text-cyan-100/90 leading-relaxed">
              AO ASSINAR O SCANNER PRO, VOCÊ TAMBÉM GANHA ACESSO COMPLETO AO GRUPO VIP E NOTIFICAÇÕES INSTANTÂNEAS NO DISCORD/WHATSAPP.
            </p>
            <button id="dash-banner-gift-btn" class="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/30 transition-all inline-block">
              QUERO MEU PRESENTE ➔
            </button>
          </div>

          <!-- Banner Visual Graphic -->
          <div class="w-44 h-44 rounded-2xl bg-gradient-to-tr from-cyan-600/30 to-blue-600/30 border border-cyan-400/30 flex items-center justify-center text-6xl shadow-2xl shrink-0 z-10 animate-bounce">
            🎁
          </div>
        </div>

        <!-- Metric Stat Cards Row (Matching 4 Stat Cards in Evolua Screenshot) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <!-- Card 1: Status da Assinatura -->
          <div class="evolua-card p-5 space-y-2">
            <span class="text-xs text-surface-400 font-semibold block">Status da Assinatura</span>
            <div class="pt-1">
              <span class="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold">
                ${user.role === 'Admin' ? 'Administrador 👑' : 'Ativa • ' + user.role}
              </span>
            </div>
          </div>

          <!-- Card 2: Taxa de Entrega / Análises IA -->
          <div class="evolua-card p-5 space-y-1">
            <span class="text-xs text-surface-400 font-semibold block">Taxa de assertividade IA</span>
            <div class="text-3xl font-black text-white">${user.hitRate}%</div>
            <span class="text-[11px] text-surface-400">Análises ➔ Total</span>
          </div>

          <!-- Card 3: Taxa de Erro -->
          <div class="evolua-card p-5 space-y-1">
            <span class="text-xs text-surface-400 font-semibold block">Taxa de variação</span>
            <div class="text-3xl font-black text-rose-400">13.5%</div>
            <span class="text-[11px] text-surface-400">Desvio ➔ Mercado</span>
          </div>

          <!-- Card 4: Palpites Cadastrados -->
          <div class="evolua-card p-5 space-y-1">
            <span class="text-xs text-surface-400 font-semibold block">Palpites cadastrados</span>
            <div class="text-3xl font-black text-white">${user.totalBets}</div>
            <span class="text-[11px] text-surface-400">Total na base</span>
          </div>

        </div>

        <!-- Data Visualizations Grid (Matching Evolua Charts Row) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <!-- Left Chart Card: Palpites por Etapa (CRM / Histórico) -->
          <div class="lg:col-span-7 evolua-card p-6 space-y-4">
            <div class="flex items-center justify-between border-b border-surface-800 pb-3">
              <div>
                <h3 class="font-bold text-white text-sm">Palpites por etapa (Histórico)</h3>
                <p class="text-xs text-surface-400">Quantidade de análises registradas no sistema</p>
              </div>
              <button class="px-3 py-1.5 rounded-lg bg-surface-900 border border-surface-700 text-xs font-semibold text-surface-200">
                Atualizar
              </button>
            </div>
            <div id="dash-bar-chart-container" class="pt-2"></div>
          </div>

          <!-- Right Chart Card: Desempenho das Campanhas / Casas de Apostas -->
          <div class="lg:col-span-5 evolua-card p-6 space-y-4">
            <div class="flex items-center justify-between border-b border-surface-800 pb-3">
              <div>
                <h3 class="font-bold text-white text-sm">Desempenho por Casa de Apostas</h3>
                <p class="text-xs text-surface-400">Distribuição de odds de valor geradas</p>
              </div>
              <button class="px-3 py-1.5 rounded-lg bg-surface-900 border border-surface-700 text-xs font-semibold text-surface-200">
                Atualizar
              </button>
            </div>

            <!-- Simulated Donut Chart Layout (Matching Pink/Blue Donut in Evolua Screenshot) -->
            <div class="flex flex-col items-center justify-center py-4 space-y-4">
              <div class="relative w-40 h-40 rounded-full border-8 border-cyan-500 border-t-indigo-500 border-r-rose-500 flex items-center justify-center shadow-2xl">
                <div class="text-center">
                  <span class="text-xl font-black text-white">4 Casas</span>
                  <span class="text-[10px] text-surface-400 block font-semibold">Monitoradas</span>
                </div>
              </div>

              <!-- Legend (Matching Screenshot) -->
              <div class="flex items-center justify-center gap-4 text-xs font-semibold">
                <span class="flex items-center gap-1.5 text-cyan-400">
                  <span class="w-3 h-3 rounded-full bg-cyan-500"></span> Superbet (45%)
                </span>
                <span class="flex items-center gap-1.5 text-indigo-400">
                  <span class="w-3 h-3 rounded-full bg-indigo-500"></span> Betano (35%)
                </span>
                <span class="flex items-center gap-1.5 text-rose-400">
                  <span class="w-3 h-3 rounded-full bg-rose-500"></span> bet365 (20%)
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>
    `;

    DashboardView.bindEvents();
  }

  static bindEvents() {
    const giftBtn = document.getElementById('dash-banner-gift-btn');
    if (giftBtn) giftBtn.onclick = () => window.sbApp.navigateTo('scanner');

    const tutBtn = document.getElementById('dash-tutorial-btn');
    if (tutBtn) tutBtn.onclick = () => window.sbApp.navigateTo('scanner');

    setTimeout(() => {
      window.ChartRenderer.renderBarChart('dash-bar-chart-container', [12, 18, 25, 34, 47, 52]);
    }, 50);
  }
}

window.DashboardView = DashboardView;
