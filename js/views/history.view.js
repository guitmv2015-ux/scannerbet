/**
 * SAVED TIPS & ANALYSIS HISTORY VIEW
 */

class HistoryView {
  static render() {
    const main = document.getElementById('app-main');
    if (!main) return;

    const state = window.sbState.getState();
    const history = state.history || [];

    main.innerHTML = `
      <div class="space-y-6 animate-in fade-in duration-300">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-surface-800 pb-4">
          <div>
            <span class="text-xs text-brand-400 font-bold uppercase tracking-wider block">Registros Pessoais</span>
            <h1 class="text-2xl md:text-3xl font-black text-white font-heading">Histórico & Palpites Salvados</h1>
          </div>
          <div class="flex items-center gap-2">
            <button class="history-filter-btn px-3 py-1.5 rounded-xl bg-brand-600 text-white text-xs font-bold" data-status="all">Todos</button>
            <button class="history-filter-btn px-3 py-1.5 rounded-xl bg-surface-900 border border-surface-800 text-surface-300 text-xs font-semibold hover:text-white" data-status="Ganhou">Ganhou 🟢</button>
            <button class="history-filter-btn px-3 py-1.5 rounded-xl bg-surface-900 border border-surface-800 text-surface-300 text-xs font-semibold hover:text-white" data-status="Perdeu">Perdeu 🔴</button>
          </div>
        </div>

        <!-- History List -->
        <div class="space-y-4">
          ${history.map(item => `
            <div class="glass-panel p-5 rounded-2xl border border-surface-800 space-y-3">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-800/60 pb-3">
                <div>
                  <span class="text-[10px] text-brand-400 font-bold uppercase tracking-wider block">${item.league} • ${item.date}</span>
                  <h3 class="text-base font-bold text-white">${item.match}</h3>
                </div>
                <div class="flex items-center gap-2">
                  <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-brand-500/20 text-brand-400 border border-brand-500/30">
                    Score ${item.score}/100
                  </span>
                  <span class="px-2.5 py-1 rounded-full text-xs font-bold ${
                    item.status === 'Ganhou' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    (item.status === 'Perdeu' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30')
                  }">
                    ${item.status}
                  </span>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <span class="text-surface-400 block mb-1">Seleção Escolhida:</span>
                  <strong class="text-white text-sm">${item.selection}</strong>
                  <span class="text-surface-300 block pt-0.5">Odd: <strong class="text-emerald-400">${item.odd}</strong> (${item.bookmaker})</span>
                </div>
                <div class="bg-surface-950 p-3 rounded-xl border border-surface-800 text-surface-300">
                  <span class="text-[10px] text-surface-400 font-bold block uppercase mb-1">Justificativa Resumida:</span>
                  ${item.justification}
                </div>
              </div>

              <!-- Action Controls to update status -->
              <div class="flex items-center justify-end gap-2 border-t border-surface-800/60 pt-3">
                <span class="text-[10px] text-surface-400 mr-2">Alterar Resultado:</span>
                <button class="history-update-status-btn px-3 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold hover:bg-emerald-900/60" data-id="${item.id}" data-status="Ganhou">
                  Ganhou 🟢
                </button>
                <button class="history-update-status-btn px-3 py-1 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-semibold hover:bg-rose-900/60" data-id="${item.id}" data-status="Perdeu">
                  Perdeu 🔴
                </button>
              </div>
            </div>
          `).join('')}
        </div>

      </div>
    `;

    HistoryView.bindEvents();
  }

  static bindEvents() {
    document.querySelectorAll('.history-update-status-btn').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-id');
        const newStatus = btn.getAttribute('data-status');

        const state = window.sbState.getState();
        const updated = (state.history || []).map(item => {
          if (item.id === id) {
            return { ...item, status: newStatus };
          }
          return item;
        });

        window.sbState.setState({ history: updated });
        window.Toast.show(`Resultado atualizado para: ${newStatus}`, 'success');
        HistoryView.render();
      };
    });
  }
}

window.HistoryView = HistoryView;
