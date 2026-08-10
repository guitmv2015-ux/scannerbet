/**
 * BETTOR PERFORMANCE METRICS & ROI ANALYTICS VIEW
 */

class MetricsView {
  static render() {
    const main = document.getElementById('app-main');
    if (!main) return;

    const state = window.sbState.getState();
    const user = state.user;
    if (!user) return;

    main.innerHTML = `
      <div class="space-y-6 animate-in fade-in duration-300">
        
        <!-- Header -->
        <div class="border-b border-surface-800 pb-4">
          <span class="text-xs text-brand-400 font-bold uppercase tracking-wider block">Desempenho Pessoal</span>
          <h1 class="text-2xl md:text-3xl font-black text-white font-heading">Métricas de Apostas</h1>
        </div>

        <!-- Metric Summary Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="glass-panel p-5 rounded-2xl border border-surface-800 space-y-1">
            <span class="text-xs text-surface-400 font-semibold block">Taxa de Acerto Geral</span>
            <div class="text-3xl font-black text-emerald-400">${user.hitRate}%</div>
            <p class="text-[11px] text-surface-400">${user.wins} Vitórias • ${user.losses} Derrotas</p>
          </div>

          <div class="glass-panel p-5 rounded-2xl border border-surface-800 space-y-1">
            <span class="text-xs text-surface-400 font-semibold block">Total de Entradas</span>
            <div class="text-3xl font-black text-white">${user.totalBets}</div>
            <p class="text-[11px] text-surface-400">Registradas no ScannerBet</p>
          </div>

          <div class="glass-panel p-5 rounded-2xl border border-surface-800 space-y-1">
            <span class="text-xs text-surface-400 font-semibold block">Odd Média Utilizada</span>
            <div class="text-3xl font-black text-brand-400">1.89</div>
            <p class="text-[11px] text-surface-400">Superbet & Betano prevalecentes</p>
          </div>
        </div>

        <!-- Performance SVG Bar Chart Card -->
        <div class="glass-panel p-6 rounded-3xl border border-surface-800 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-white text-base">Evolução do Hit Rate (Últimas Rodadas)</h3>
            <span class="text-xs text-emerald-400 font-bold">+4.2% este mês</span>
          </div>
          <div id="metrics-bar-chart-container" class="pt-4"></div>
        </div>

        <!-- Responsible Gambling Banner -->
        <div class="p-4 bg-surface-950 rounded-2xl border border-surface-800 text-xs text-surface-400 leading-relaxed">
          <strong class="text-white">Nota de Transparência:</strong> As métricas exibidas servem exclusivamente para acompanhamento estatístico da consistência técnica do usuário. O ScannerBet não realiza apostas por você nem garante retornos financeiros.
        </div>

      </div>
    `;

    setTimeout(() => {
      window.ChartRenderer.renderBarChart('metrics-bar-chart-container', [65, 70, 78, 72, 84, 80, 88]);
    }, 50);
  }
}

window.MetricsView = MetricsView;
