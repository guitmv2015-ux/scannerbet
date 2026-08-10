/**
 * EVOLUA PAINEL EXACT STYLIZED DASHBOARD VIEW
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

    const userName = user.name || 'Guilherme';

    main.innerHTML = `
      <div class="space-y-6 animate-in fade-in duration-300">
        
        <!-- Top Welcome Greeting Bar (Matching Evolua Screenshot Exactly) -->
        <div class="evolua-card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="flex items-center gap-2 text-base md:text-lg font-bold text-white">
            <span>Olá, ${userName}</span>
            <span>👋</span>
            <span>bem-vindo ao seu painel</span>
          </div>
          <button id="dash-tutorial-btn" class="px-4 py-2 rounded-xl bg-surface-900 border border-surface-700 text-xs font-semibold text-surface-200 hover:text-white flex items-center gap-2 transition-all">
            <span>▶</span> Ver tutorial
          </button>
        </div>

        <!-- Featured Promo Gift Banner (Matching Evolua Screenshot Banner Exactly) -->
        <div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#031b38] via-[#08345e] to-[#041b34] p-6 md:p-8 text-white border border-cyan-500/40 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <!-- Ambient Glow -->
          <div class="absolute -right-10 -bottom-10 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none"></div>

          <div class="space-y-3 max-w-xl text-center md:text-left z-10">
            <span class="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[11px] font-bold uppercase tracking-wider">Bônus Exclusivo</span>
            <h2 class="text-2xl md:text-3xl font-black font-heading tracking-tight leading-tight">
              EU TENHO UM PRESENTE PRA VOCÊ 🎁
            </h2>
            <p class="text-xs md:text-sm text-cyan-100/90 leading-relaxed">
              AO ASSINAR O EVOLUA PROSPECT / SCANNERBET PRO, VOCÊ TAMBÉM GANHA ACESSO AO EVOLUA CHAT E FERRAMENTAS VIP.
            </p>
            <button id="dash-banner-gift-btn" class="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/30 transition-all inline-block">
              QUERO MEU PRESENTE ➔
            </button>
          </div>

          <!-- Gift Box Graphic -->
          <div class="w-44 h-44 rounded-2xl bg-gradient-to-tr from-cyan-600/30 to-blue-600/30 border border-cyan-400/30 flex items-center justify-center text-6xl shadow-2xl shrink-0 z-10 animate-bounce">
            🎁
          </div>
        </div>

        <!-- Metric Stat Cards Row (Matching 4 Stat Cards in Evolua Screenshot Exactly) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <!-- Card 1: Status da Conexão -->
          <div class="evolua-card p-5 space-y-3">
            <span class="text-xs text-surface-400 font-semibold block">Status da Conexão</span>
            <div>
              <span class="px-3 py-1 rounded-md bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold">
                Desconectado
              </span>
            </div>
          </div>

          <!-- Card 2: Taxa de entrega -->
          <div class="evolua-card p-5 space-y-1">
            <span class="text-xs text-surface-400 font-semibold block">Taxa de entrega</span>
            <div class="text-3xl font-black text-white">5%</div>
            <span class="text-[11px] text-surface-400">Enviadas ➔ Total</span>
          </div>

          <!-- Card 3: Taxa de erro -->
          <div class="evolua-card p-5 space-y-1">
            <span class="text-xs text-surface-400 font-semibold block">Taxa de erro</span>
            <div class="text-3xl font-black text-white">15%</div>
            <span class="text-[11px] text-surface-400">Erros ➔ Total</span>
          </div>

          <!-- Card 4: Leads cadastrados -->
          <div class="evolua-card p-5 space-y-1">
            <span class="text-xs text-surface-400 font-semibold block">Leads cadastrados</span>
            <div class="text-3xl font-black text-white">340</div>
            <span class="text-[11px] text-surface-400">Total na base</span>
          </div>

        </div>

        <!-- Data Visualizations Grid (Matching Evolua Charts Row Exactly) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <!-- Left Chart Card: Leads por etapa (CRM) -->
          <div class="lg:col-span-7 evolua-card p-6 space-y-4">
            <div class="flex items-center justify-between border-b border-surface-800 pb-3">
              <div>
                <h3 class="font-bold text-white text-sm">Leads por etapa (CRM)</h3>
                <p class="text-xs text-surface-400">Quantidade de leads em cada coluna do Kanban</p>
              </div>
              <button class="px-3.5 py-1.5 rounded-xl bg-surface-900 border border-surface-700 text-xs font-semibold text-surface-200">
                Atualizar
              </button>
            </div>
            <div id="dash-bar-chart-container" class="pt-2"></div>
          </div>

          <!-- Right Chart Card: Desempenho das campanhas -->
          <div class="lg:col-span-5 evolua-card p-6 space-y-4">
            <div class="flex items-center justify-between border-b border-surface-800 pb-3">
              <div>
                <h3 class="font-bold text-white text-sm">Desempenho das campanhas</h3>
                <p class="text-xs text-surface-400">Status geral de envio</p>
              </div>
              <button class="px-3.5 py-1.5 rounded-xl bg-surface-900 border border-surface-700 text-xs font-semibold text-surface-200">
                Atualizar
              </button>
            </div>

            <!-- Donut Chart Layout (Matching Pink/Blue Donut in Evolua Screenshot) -->
            <div class="flex flex-col items-center justify-center py-4 space-y-4">
              <div class="relative w-44 h-44 rounded-full border-[12px] border-sky-400 border-t-rose-500 border-r-rose-500 flex items-center justify-center shadow-2xl">
                <div class="text-center">
                  <span class="text-2xl font-black text-white">340</span>
                  <span class="text-[10px] text-surface-400 block font-semibold">Total</span>
                </div>
              </div>

              <!-- Legend (Matching Screenshot: "Enviadas" | "Erros") -->
              <div class="flex items-center justify-center gap-6 text-xs font-semibold pt-2">
                <span class="flex items-center gap-2 text-sky-400">
                  <span class="w-3.5 h-2 rounded-sm bg-sky-400"></span> Enviadas
                </span>
                <span class="flex items-center gap-2 text-rose-400">
                  <span class="w-3.5 h-2 rounded-sm bg-rose-500"></span> Erros
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
      window.ChartRenderer.renderBarChart('dash-bar-chart-container', [0, 1]);
    }, 50);
  }
}

window.DashboardView = DashboardView;
