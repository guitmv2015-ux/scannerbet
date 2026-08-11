/**
 * SCANNERBET - MEUS PALPITES VIEW (FASE 13)
 * Terminal Profissional
 */

class HistoryView {
  static render() {
    const main = document.getElementById('app-main');
    if (!main) return;

    const state = window.sbState.getState();
    const picks = state.user?.picks || [];
    
    this.currentFilterStatus = this.currentFilterStatus || 'all';
    this.activeTab = this.activeTab || 'pending';

    let filteredPicks = picks;
    
    // Status Filter for Resolved tab
    if (this.activeTab === 'resolved' && this.currentFilterStatus !== 'all') {
        filteredPicks = filteredPicks.filter(p => p.status === this.currentFilterStatus);
    }

    const pendingPicks = picks.filter(p => p.status === 'PENDING').sort((a,b) => b.timestamp - a.timestamp);
    const resolvedPicks = filteredPicks.filter(p => p.status !== 'PENDING').sort((a,b) => b.timestamp - a.timestamp);

    const renderTab = (id, label, count) => {
       const isActive = this.activeTab === id;
       return `<button onclick="window.HistoryView.switchTab('${id}')" class="px-5 py-3 text-[11px] uppercase tracking-widest font-black whitespace-nowrap border-b-2 transition-all flex items-center gap-2 ${isActive ? 'border-[#06b6d4] text-white' : 'border-transparent text-[#737373] hover:text-white hover:bg-[#141414]'}">
          ${label} <span class="bg-[#1a1a1a] border border-[#333] px-2 py-0.5 rounded text-[9px] ${isActive ? 'text-[#06b6d4]' : 'text-[#737373]'}">${count}</span>
       </button>`;
    };

    const renderFilter = (val, label) => {
       const isActive = this.currentFilterStatus === val;
       return `<button onclick="window.HistoryView.setFilter('${val}')" class="px-3 py-1.5 rounded-lg text-[10px] uppercase font-black tracking-widest transition-colors ${isActive ? 'bg-[#06b6d4] text-black' : 'bg-[#141414] border border-[#333] text-[#737373] hover:text-white'}">${label}</button>`;
    };

    main.innerHTML = `
      <div class="flex-1 w-full p-4 lg:p-6 flex flex-col relative animate-in fade-in duration-500 max-w-[1600px] mx-auto pb-12">
         
         <!-- HEADER -->
         <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#262626] pb-5 mb-6">
            <div>
               <h1 class="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                  MEUS PALPITES
                  <span class="px-2 py-1 bg-[#1a1a1a] border border-[#333] text-[#06b6d4] rounded text-[10px] uppercase tracking-widest font-black shadow-lg">Carteira</span>
               </h1>
               <p class="text-[#a3a3a3] text-sm mt-1">Gerencie suas análises e acompanhe os resultados</p>
            </div>
            
            <div class="flex gap-4">
               <div class="bg-[#0a0a0a] border border-[#262626] rounded-xl p-4 px-6 text-center shadow-lg">
                  <p class="text-[9px] text-[#737373] uppercase tracking-widest font-black mb-1">Total Apostado</p>
                  <p class="text-2xl font-black text-white font-mono">R$ ${picks.reduce((sum, p) => sum + p.stake, 0).toFixed(2)}</p>
               </div>
            </div>
         </div>

         <!-- TABS & FILTERS -->
         <div class="flex flex-col md:flex-row md:items-center justify-between border-b border-[#262626] mb-8 gap-4">
            <div class="flex overflow-x-auto custom-scrollbar">
               ${renderTab('pending', 'Pendentes', pendingPicks.length)}
               ${renderTab('resolved', 'Resolvidos', picks.filter(p => p.status !== 'PENDING').length)}
            </div>
            
            ${this.activeTab === 'resolved' ? `
            <div class="flex gap-2 pb-3 md:pb-0">
               ${renderFilter('all', 'Todos')}
               ${renderFilter('WON', 'Ganhos')}
               ${renderFilter('LOST', 'Perdidos')}
               ${renderFilter('VOID', 'Devolvidos')}
            </div>
            ` : ''}
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
      this.currentFilterStatus = 'all'; // reset filter on tab switch
      this.render();
  }

  static setFilter(status) {
      this.currentFilterStatus = status;
      this.render();
  }

  static renderPicks(pickList, isPending) {
      if (!pickList || pickList.length === 0) {
          return `
             <div class="bg-[#0a0a0a] border border-dashed border-[#333] rounded-2xl p-12 text-center shadow-lg">
                <p class="text-[#737373] text-base font-bold">Nenhum palpite encontrado para esta visualização.</p>
                ${isPending ? `<button onclick="window.sbApp.navigateTo('dashboard')" class="mt-6 bg-[#06b6d4]/10 text-[#06b6d4] hover:bg-[#06b6d4] hover:text-black border border-[#06b6d4]/30 px-6 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-colors">Procurar Oportunidades</button>` : ''}
             </div>
          `;
      }

      return pickList.map(pick => {
          const profit = (pick.stake * pick.odd) - pick.stake;
          const dateStr = window.DateUtil ? window.DateUtil.formatEventDate(pick.date) : new Date(pick.date).toLocaleString();
          
          let statusBadge = `<span class="bg-[#404040]/30 text-[#a3a3a3] border border-[#404040] px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-[#737373] animate-pulse"></span> PENDENTE</span>`;
          let statusColor = 'bg-[#06b6d4]';
          if (pick.status === 'WON') {
              statusBadge = `<span class="bg-[#a3e635]/20 text-[#a3e635] border border-[#a3e635]/30 px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest">GANHOU</span>`;
              statusColor = 'bg-[#a3e635]';
          }
          if (pick.status === 'LOST') {
              statusBadge = `<span class="bg-red-500/20 text-red-500 border border-red-500/30 px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest">PERDEU</span>`;
              statusColor = 'bg-red-500';
          }
          if (pick.status === 'VOID') {
              statusBadge = `<span class="bg-[#737373]/20 text-[#a3a3a3] border border-[#737373]/30 px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest">DEVOLVIDA</span>`;
              statusColor = 'bg-[#737373]';
          }

          const marketName = pick.marketType === 'h2h' ? 'Resultado Final' : (pick.marketType === 'spreads' ? 'Handicap' : (pick.marketType === 'totals' ? 'Over/Under' : pick.marketType));

          return `
             <div class="bg-gradient-to-br from-[#0a0a0a] to-[#0f0f0f] border border-[#262626] rounded-2xl p-6 hover:border-[#404040] transition-colors relative overflow-hidden group shadow-lg">
                <div class="absolute top-0 left-0 w-1.5 h-full ${statusColor}"></div>
                
                <div class="flex flex-col md:flex-row justify-between gap-8 pl-3">
                   <!-- Info do Evento -->
                   <div class="flex-1">
                      <div class="flex flex-wrap items-center gap-3 mb-4">
                         <span class="text-[9px] bg-[#141414] text-[#a3a3a3] border border-[#333] px-2 py-1 rounded uppercase font-black tracking-wider">${pick.league || 'Evento'}</span>
                         <span class="text-[10px] text-[#737373] font-mono font-bold">${dateStr}</span>
                         ${statusBadge}
                      </div>
                      <h3 class="text-xl font-black text-white mb-4">${pick.eventName}</h3>
                      <div class="flex flex-wrap items-center gap-3 text-sm bg-[#141414] p-3 rounded-xl border border-[#262626] w-fit">
                         <span class="text-[10px] uppercase tracking-widest text-[#a3a3a3] font-black">${marketName}</span>
                         <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#404040" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                         <span class="text-white font-black text-base">${pick.selection} ${pick.line !== null && pick.line !== undefined ? (pick.line > 0 ? '+'+pick.line : pick.line) : ''}</span>
                      </div>
                   </div>

                   <!-- Info Financeira e Ações -->
                   <div class="flex flex-col sm:flex-row items-center gap-6 bg-[#141414] p-5 rounded-xl border border-[#262626] min-w-[320px] shadow-inner">
                      <div class="flex-1 text-center sm:text-left border-b sm:border-b-0 sm:border-r border-[#333] pb-4 sm:pb-0 sm:pr-6">
                         <p class="text-[9px] text-[#737373] uppercase tracking-widest font-black mb-2">${pick.bookmaker}</p>
                         <p class="text-3xl font-black text-[#06b6d4] font-mono leading-none drop-shadow-md">@${parseFloat(pick.odd).toFixed(2)}</p>
                      </div>
                      <div class="flex-1 text-center sm:text-right">
                         <p class="text-[9px] text-[#737373] uppercase tracking-widest font-black mb-2">Stake: R$ ${pick.stake.toFixed(2)}</p>
                         <p class="text-xl font-black ${pick.status === 'LOST' ? 'text-red-500' : 'text-[#a3e635]'} font-mono leading-none">
                            ${pick.status === 'LOST' ? `- R$ ${pick.stake.toFixed(2)}` : `+ R$ ${profit.toFixed(2)}`}
                         </p>
                      </div>
                   </div>
                </div>

                ${isPending ? `
                <div class="mt-6 pt-4 border-t border-[#262626] flex items-center justify-end gap-3 pl-3">
                   <span class="text-[9px] text-[#737373] uppercase tracking-widest font-black mr-2">Resolver Resultado:</span>
                   <button onclick="window.HistoryView.resolvePick('${pick.id}', 'WON')" class="px-4 py-2 rounded-lg bg-[#a3e635]/10 hover:bg-[#a3e635] text-[#a3e635] hover:text-black border border-[#a3e635]/30 text-[10px] font-black uppercase tracking-widest transition-all shadow-md">✅ Ganhou</button>
                   <button onclick="window.HistoryView.resolvePick('${pick.id}', 'LOST')" class="px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-black border border-red-500/30 text-[10px] font-black uppercase tracking-widest transition-all shadow-md">❌ Perdeu</button>
                   <button onclick="window.HistoryView.resolvePick('${pick.id}', 'VOID')" class="px-4 py-2 rounded-lg bg-[#404040]/30 hover:bg-[#737373] text-[#a3a3a3] hover:text-black border border-[#404040] text-[10px] font-black uppercase tracking-widest transition-all shadow-md">Devolvida</button>
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
