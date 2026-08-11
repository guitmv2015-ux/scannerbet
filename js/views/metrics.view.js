/**
 * SCANNERBET - MÉTRICAS VIEW (FASE 12)
 * Terminal Profissional de Desempenho Analítico
 */

class MetricsView {
  static render() {
    const main = document.getElementById('app-main');
    if (!main) return;

    const state = window.sbState.getState();
    const picks = state.user?.picks || [];
    const resolvedPicks = picks.filter(p => p.status === 'WON' || p.status === 'LOST');
    
    // Calcula Metricas
    let totalInvested = 0;
    let totalReturned = 0;
    let greens = 0;
    let reds = 0;
    let avgOddSum = 0;

    resolvedPicks.forEach(p => {
       totalInvested += p.stake;
       avgOddSum += p.odd;
       if (p.status === 'WON') {
           greens++;
           totalReturned += (p.stake * p.odd);
       } else {
           reds++;
       }
    });

    const netProfit = totalReturned - totalInvested;
    const roi = totalInvested > 0 ? (netProfit / totalInvested) * 100 : 0;
    const winRate = resolvedPicks.length > 0 ? (greens / resolvedPicks.length) * 100 : 0;
    const avgOdd = resolvedPicks.length > 0 ? (avgOddSum / resolvedPicks.length) : 0;

    const isProfit = netProfit >= 0;

    main.innerHTML = `
      <div class="flex-1 w-full p-4 lg:p-6 flex flex-col relative animate-in fade-in duration-500 max-w-[1600px] mx-auto pb-12">
         
         <!-- HEADER -->
         <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#262626] pb-5 mb-8">
            <div>
               <h1 class="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                  MÉTRICAS E ROI
                  <span class="px-2 py-0.5 bg-[#1a1a1a] border border-[#333] text-[#06b6d4] rounded text-[10px] uppercase tracking-widest font-black shadow-lg">Analítico</span>
               </h1>
               <p class="text-[#737373] text-sm mt-1">Acompanhe seu desempenho e consistência no mercado</p>
            </div>
            
            <div class="flex gap-2">
               <button class="px-4 py-2 bg-[#141414] hover:bg-[#1a1a1a] border border-[#262626] rounded-lg text-xs text-[#a3a3a3] hover:text-white uppercase font-bold tracking-widest transition-colors flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg> Filtrar
               </button>
            </div>
         </div>

         <!-- INDICADORES PRINCIPAIS -->
         <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div class="bg-gradient-to-b from-[#141414] to-[#0a0a0a] border border-[#262626] rounded-xl p-5 shadow-lg">
               <p class="text-[9px] text-[#737373] uppercase tracking-widest font-bold mb-1">ROI Geral</p>
               <p class="text-3xl font-black font-mono ${roi >= 0 ? 'text-[#a3e635]' : 'text-red-500'}">${roi >= 0 ? '+' : ''}${roi.toFixed(2)}%</p>
            </div>
            <div class="bg-gradient-to-b from-[#141414] to-[#0a0a0a] border border-[#262626] rounded-xl p-5 shadow-lg">
               <p class="text-[9px] text-[#737373] uppercase tracking-widest font-bold mb-1">${isProfit ? 'Lucro Líquido' : 'Prejuízo'}</p>
               <p class="text-3xl font-black font-mono ${isProfit ? 'text-[#a3e635]' : 'text-red-500'}">${isProfit ? '+' : '-'} R$ ${Math.abs(netProfit).toFixed(2)}</p>
            </div>
            <div class="bg-gradient-to-b from-[#141414] to-[#0a0a0a] border border-[#262626] rounded-xl p-5 shadow-lg">
               <p class="text-[9px] text-[#737373] uppercase tracking-widest font-bold mb-1">Win Rate</p>
               <p class="text-3xl font-black text-white font-mono">${winRate.toFixed(1)}%</p>
            </div>
            <div class="bg-gradient-to-b from-[#141414] to-[#0a0a0a] border border-[#262626] rounded-xl p-5 shadow-lg">
               <p class="text-[9px] text-[#737373] uppercase tracking-widest font-bold mb-1">Odd Média</p>
               <p class="text-3xl font-black text-[#06b6d4] font-mono">@${avgOdd.toFixed(2)}</p>
            </div>
         </div>

         <!-- DETALHAMENTO DE BANCA E HISTÓRICO -->
         <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-[#0a0a0a] border border-[#262626] rounded-xl p-6">
               <h3 class="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg> 
                  Volume e Acertos
               </h3>
               
               <div class="space-y-4">
                  <div class="flex items-center justify-between p-3 bg-[#141414] rounded-lg border border-[#333]">
                     <span class="text-xs text-[#a3a3a3] font-bold uppercase tracking-widest">Total Apostado</span>
                     <span class="text-base font-black text-white font-mono">R$ ${totalInvested.toFixed(2)}</span>
                  </div>
                  <div class="flex items-center justify-between p-3 bg-[#141414] rounded-lg border border-[#333]">
                     <span class="text-xs text-[#a3a3a3] font-bold uppercase tracking-widest">Retorno Total</span>
                     <span class="text-base font-black text-white font-mono">R$ ${totalReturned.toFixed(2)}</span>
                  </div>
                  
                  <div class="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-[#262626]">
                     <div class="text-center p-3 bg-[#141414] rounded-lg border border-[#333]">
                        <p class="text-[9px] text-[#737373] uppercase tracking-widest font-bold mb-1">Total</p>
                        <p class="text-lg font-black text-white">${resolvedPicks.length}</p>
                     </div>
                     <div class="text-center p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                        <p class="text-[9px] text-emerald-500 uppercase tracking-widest font-bold mb-1">Greens</p>
                        <p class="text-lg font-black text-emerald-400">${greens}</p>
                     </div>
                     <div class="text-center p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                        <p class="text-[9px] text-red-500 uppercase tracking-widest font-bold mb-1">Reds</p>
                        <p class="text-lg font-black text-red-500">${reds}</p>
                     </div>
                  </div>
               </div>
            </div>

            </div>
         </div>
      </div>
    `;
  }
}

window.MetricsView = MetricsView;
