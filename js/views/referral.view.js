/**
 * INDIQUE E GANHE / REFERRAL PROGRAM DASHBOARD VIEW
 */

class ReferralView {
  static render() {
    const main = document.getElementById('app-main');
    if (!main) return;

    const state = window.sbState.getState();
    const user = state.user;
    const stats = state.referralStats || {};
    const leaderboard = window.ReferralService.getLeaderboard();
    const refLink = window.ReferralService.getReferralLink(user ? user.referralCode : 'SCANNER');

    main.innerHTML = `
      <div class="space-y-6 animate-in fade-in duration-300">
        
        <!-- Header Banner -->
        <div class="glass-panel p-6 md:p-8 rounded-3xl border border-brand-500/40 glow-purple flex flex-col md:flex-row items-center justify-between gap-6">
          <div class="space-y-2 text-center md:text-left">
            <span class="text-xs text-brand-400 font-bold uppercase tracking-wider">Programa de Indicação</span>
            <h1 class="text-2xl md:text-3xl font-black text-white font-heading">Indique Amigos & Ganhe Comissões</h1>
            <p class="text-xs text-surface-300 max-w-xl">
              Compartilhe seu link exclusivo. Receba 30% de comissão recorrente por cada novo assinante que se cadastrar pelo seu código.
            </p>
          </div>
          <div class="w-full md:w-auto bg-surface-950 p-4 rounded-2xl border border-surface-800 space-y-2">
            <span class="text-[10px] text-surface-400 font-bold uppercase tracking-wider block">Seu Link de Indicação:</span>
            <div class="flex items-center gap-2">
              <input type="text" readonly value="${refLink}" id="referral-link-input" class="bg-surface-900 border border-surface-700 rounded-xl px-3 py-2 text-xs text-brand-400 font-mono flex-1 focus:outline-none" />
              <button id="referral-copy-btn" class="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shrink-0 shadow-lg shadow-brand-500/25">
                Copiar 📋
              </button>
            </div>
          </div>
        </div>

        <!-- Referral Stats Grid -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="glass-panel p-5 rounded-2xl border border-surface-800 space-y-1">
            <span class="text-xs text-surface-400 font-semibold block">Cliques no Link</span>
            <div class="text-2xl font-black text-white">${stats.clicks || 0}</div>
            <span class="text-[10px] text-surface-400">Visitantes únicos</span>
          </div>

          <div class="glass-panel p-5 rounded-2xl border border-surface-800 space-y-1">
            <span class="text-xs text-surface-400 font-semibold block">Cadastros Realizados</span>
            <div class="text-2xl font-black text-white">${stats.signups || 0}</div>
            <span class="text-[10px] text-surface-400">Contas criadas</span>
          </div>

          <div class="glass-panel p-5 rounded-2xl border border-surface-800 space-y-1">
            <span class="text-xs text-surface-400 font-semibold block">Assinantes Ativos</span>
            <div class="text-2xl font-black text-emerald-400">${stats.activeSubscribers || 0}</div>
            <span class="text-[10px] text-emerald-400/80">Conversão de 33%</span>
          </div>

          <div class="glass-panel p-5 rounded-2xl border border-surface-800 space-y-1">
            <span class="text-xs text-surface-400 font-semibold block">Comissão Acumulada</span>
            <div class="text-2xl font-black text-brand-400">R$ ${(stats.commissionEarned || 0).toFixed(2).replace('.', ',')}</div>
            <span class="text-[10px] text-surface-400">Saldo a receber: R$ ${(stats.unpaidBalance || 0).toFixed(2).replace('.', ',')}</span>
          </div>
        </div>

        <!-- Leaderboard Ranking -->
        <div class="glass-panel p-6 rounded-3xl border border-surface-800 space-y-4">
          <h3 class="font-bold text-white text-lg flex items-center gap-2">
            <span>🏆</span> Ranking Top Indicadores do Mês
          </h3>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="border-b border-surface-800 text-surface-400 font-semibold uppercase text-[10px]">
                  <th class="py-2.5 px-3">Posição</th>
                  <th class="py-2.5 px-3">Usuário</th>
                  <th class="py-2.5 px-3">Código</th>
                  <th class="py-2.5 px-3 text-center">Conversões</th>
                  <th class="py-2.5 px-3 text-right">Recompensa Total</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-surface-800/50">
                ${leaderboard.map(item => `
                  <tr class="${item.rank === 4 ? 'bg-brand-500/10 font-bold' : ''} hover:bg-surface-800/40">
                    <td class="py-3 px-3">
                      <span class="w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-bold ${
                        item.rank === 1 ? 'bg-amber-500 text-black' : (item.rank === 2 ? 'bg-slate-300 text-black' : (item.rank === 3 ? 'bg-amber-700 text-white' : 'bg-surface-800 text-surface-300'))
                      }">
                        #${item.rank}
                      </span>
                    </td>
                    <td class="py-3 px-3 text-white">${item.name}</td>
                    <td class="py-3 px-3 text-surface-400 font-mono">${item.code}</td>
                    <td class="py-3 px-3 text-center text-emerald-400 font-bold">${item.conversions}</td>
                    <td class="py-3 px-3 text-right text-brand-400 font-bold">${item.reward}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;

    ReferralView.bindEvents();
  }

  static bindEvents() {
    const copyBtn = document.getElementById('referral-copy-btn');
    const input = document.getElementById('referral-link-input');

    if (copyBtn && input) {
      copyBtn.onclick = () => {
        navigator.clipboard.writeText(input.value);
        window.Toast.show('Link de indicação copiado para a área de transferência!', 'success');
      };
    }
  }
}

window.ReferralView = ReferralView;
