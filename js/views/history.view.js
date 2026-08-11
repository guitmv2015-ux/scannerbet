/**
 * SCANNERBET - MEUS PALPITES VIEW (FASE 12)
 * Terminal Profissional
 */

class HistoryView {
  static render() {
    const main = document.getElementById('app-main');
    if (!main) return;

    const state = window.sbState.getState();
    const picks = state.user?.picks || [];
    
    const pendingPicks = picks.filter(p => p.status === 'PENDING').sort((a,b) => b.timestamp - a.timestamp);
    const resolvedPicks = picks.filter(p => p.status !== 'PENDING').sort((a,b) => b.timestamp - a.timestamp);

    this.activeTab = this.activeTab || 'pending';

    const renderTab = (id, label, count) => {
       const isActive = this.activeTab === id;
       return `<button onclick="window.HistoryView.switchTab('${id}')" class="px-5 py-3 text-[11px] uppercase tracking-widest font-bold whitespace-nowrap border-b-2 transition-all flex items-center gap-2 ${isActive ? 'border-[#06b6d4] text-white' : 'border-transparent text-[#737373] hover:text-white hover:bg-[#141414]'}">
          ${label} <span class="bg-[#1a1a1a] border border-[#333] px-2 py-0.5 rounded text-[9px] ${isActive ? 'text-[#06b6d4]' : 'text-[#737373]'}">${count}</span>
       </button>`;
    };

    main.innerHTML = `
      <div class="flex-1 w-full p-4 lg:p-6 flex flex-col relative animate-in fade-in duration-500 max-w-[1600px] mx-auto pb-12">
         
         <!-- HEADER -->
         <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#262626] pb-5 mb-6">
            <div>
               <h1 class="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                  MEUS PALPITES
                  <span class="px-2 py-0.5 bg-[#1a1a1a] border border-[#333] text-[#06b6d4] rounded text-[10px] uppercase tracking-widest font-black shadow-lg">Carteira</span>
               </h1>
               <p class="text-[#737373] text-sm mt-1">Gerencie suas análises e acompanhe os resultados</p>
            </div>
            
            <div class="flex gap-4">
               <div class="bg-[#0a0a0a] border border-[#262626] rounded-xl p-3 px-5 text-center">
                  <p class="text-[9px] text-[#737373] uppercase tracking-widest font-bold mb-1">Total Apostado</p>
                  <p class="text-lg font-black text-white font-mono">R$ ${picks.reduce((sum, p) => sum + p.stake, 0).toFixed(2)}</p>
               </div>
            </div>
         </div>

         <!-- TABS -->
         <div class="flex overflow-x-auto border-b border-[#262626] mb-6 custom-scrollbar">
            ${renderTab('pending', 'Pendentes', pendingPicks.length)}
            ${renderTab('resolved', 'Resolvidos', resolvedPicks.length)}
         </div>

         <!-- LISTA DE PALPITES -->
         <div class="space-y-4">
            ${this.activeTab === 'pending' ? this.renderPicks(pendingPicks, true) : this.renderPicks(resolvedPicks, false)}
         </div>
      </div>
    `;
  }

  static switchTab(tab) {
      this.activeTab = tab;
      this.render();
  }

  static renderPicks(pickList, isPending) {
      if (!pickList || pickList.length === 0) {
          return `
             <div class="bg-[#0a0a0a] border border-dashed border-[#333] rounded-xl p-10 text-center">
                <p class="text-[#737373] text-sm">Nenhum palpite ${isPending ? 'pendente' : 'resolvido'} encontrado.</p>
                ${isPending ? `<button onclick="window.sbApp.navigateTo('dashboard')" class="mt-4 bg-[#06b6d4]/10 text-[#06b6d4] hover:bg-[#06b6d4] hover:text-black px-4 py-2 rounded text-xs font-bold uppercase tracking-widest transition-colors">Procurar Oportunidades</button>` : ''}
             </div>
          `;
      }

      return pickList.map(pick => {
          const profit = (pick.stake * pick.odd) - pick.stake;
          const dateStr = window.DateUtil ? window.DateUtil.formatEventDate(pick.date) : new Date(pick.date).toLocaleString();
          
          let statusBadge = `<span class="bg-[#404040]/30 text-[#a3a3a3] border border-[#404040] px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-[#737373] animate-pulse"></span> PENDENTE</span>`;
          if (pick.status === 'WON') statusBadge = `<span class="bg-[#a3e635]/20 text-[#a3e635] border border-[#a3e635]/30 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest">GANHOU</span>`;
          if (pick.status === 'LOST') statusBadge = `<span class="bg-red-500/20 text-red-500 border border-red-500/30 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest">PERDEU</span>`;
          if (pick.status === 'VOID') statusBadge = `<span class="bg-[#737373]/20 text-[#a3a3a3] border border-[#737373]/30 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest">DEVOLVIDA</span>`;

          const marketName = pick.marketType === 'h2h' ? 'Resultado Final' : (pick.marketType === 'spreads' ? 'Handicap' : (pick.marketType === 'totals' ? 'Over/Under' : pick.marketType));

          return `
             <div class="bg-gradient-to-br from-[#0a0a0a] to-[#0f0f0f] border border-[#262626] rounded-xl p-5 hover:border-[#404040] transition-colors relative overflow-hidden group">
                ${pick.status === 'WON' ? '<div class="absolute top-0 left-0 w-1 h-full bg-[#a3e635]"></div>' : ''}
                ${pick.status === 'LOST' ? '<div class="absolute top-0 left-0 w-1 h-full bg-red-500"></div>' : ''}
                ${pick.status === 'PENDING' ? '<div class="absolute top-0 left-0 w-1 h-full bg-[#06b6d4]"></div>' : ''}
                
                <div class="flex flex-col md:flex-row justify-between gap-6 pl-2">
                   <!-- Info do Evento -->
                   <div class="flex-1">
                      <div class="flex items-center gap-3 mb-3">
                         <span class="text-[9px] bg-[#1a1a1a] text-[#a3a3a3] border border-[#333] px-2 py-0.5 rounded uppercase font-bold tracking-wider">${pick.league || 'Evento'}</span>
                         <span class="text-[10px] text-[#737373] font-mono">${dateStr}</span>
                         ${statusBadge}
                      </div>
                      <h3 class="text-base font-black text-white mb-3">${pick.eventName}</h3>
                      <div class="flex flex-wrap items-center gap-2 text-xs">
                         <span class="text-[9px] uppercase tracking-widest text-[#a3a3a3] font-semibold bg-[#141414] px-2 py-1 rounded border border-[#262626]">${marketName}</span>
                         <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#404040" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                         <span class="text-white font-bold">${pick.selection} ${pick.line !== null && pick.line !== undefined ? (pick.line > 0 ? '+'+pick.line : pick.line) : ''}</span>
                      </div>
                   </div>

                   <!-- Info Financeira e Ações -->
                   <div class="flex flex-col sm:flex-row items-center gap-4 bg-[#141414] p-4 rounded-lg border border-[#262626] min-w-[300px]">
                      <div class="flex-1 text-center sm:text-left border-b sm:border-b-0 sm:border-r border-[#333] pb-3 sm:pb-0 sm:pr-4">
                         <p class="text-[9px] text-[#737373] uppercase tracking-widest font-bold mb-1">${pick.bookmaker}</p>
                         <p class="text-xl font-black text-[#06b6d4] font-mono leading-none">@${parseFloat(pick.odd).toFixed(2)}</p>
                      </div>
                      <div class="flex-1 text-center sm:text-right">
                         <p class="text-[9px] text-[#737373] uppercase tracking-widest font-bold mb-1">Stake: R$ ${pick.stake.toFixed(2)}</p>
                         <p class="text-sm font-black ${pick.status === 'LOST' ? 'text-red-500' : 'text-[#a3e635]'} font-mono leading-none">
                            ${pick.status === 'LOST' ? `- R$ ${pick.stake.toFixed(2)}` : `+ R$ ${profit.toFixed(2)}`}
                         </p>
                      </div>
                   </div>
                </div>

                ${isPending ? `
                <div class="mt-4 pt-4 border-t border-[#262626] flex items-center justify-end gap-2 pl-2">
                   <span class="text-[9px] text-[#737373] uppercase tracking-widest font-bold mr-2">Marcar como:</span>
                   <button onclick="window.HistoryView.resolvePick('${pick.id}', 'WON')" class="px-3 py-1.5 rounded bg-[#a3e635]/10 hover:bg-[#a3e635] text-[#a3e635] hover:text-black border border-[#a3e635]/30 text-[9px] font-black uppercase tracking-widest transition-colors">Ganhou</button>
                   <button onclick="window.HistoryView.resolvePick('${pick.id}', 'LOST')" class="px-3 py-1.5 rounded bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-black border border-red-500/30 text-[9px] font-black uppercase tracking-widest transition-colors">Perdeu</button>
                   <button onclick="window.HistoryView.resolvePick('${pick.id}', 'VOID')" class="px-3 py-1.5 rounded bg-[#404040]/30 hover:bg-[#737373] text-[#a3a3a3] hover:text-black border border-[#404040] text-[9px] font-black uppercase tracking-widest transition-colors">Devolvida</button>
                </div>
                ` : ''}
             </div>
          `;
      }).join('');
  }

  static resolvePick(pickId, status) {
      if (!window.PicksService) return;
      window.PicksService.updatePickStatus(pickId, status);
      this.render();
      window.sbApp.showToast('Atualizado', 'Status do palpite alterado com sucesso.', 'success');
  }
}

window.HistoryView = HistoryView;
