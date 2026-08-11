/**
 * OPPORTUNITIES VIEW
 * Central de Oportunidades - Exibe maiores distorções baseadas na Linha de Referência (Sharp Bookie)
 */

class OpportunitiesView {
  static currentFilterSport = 'ALL';
  static currentFilterDistortion = 3;

  static async render() {
    const main = document.getElementById('app-main');
    if (!main) return;

    main.className = "flex-1 w-full p-4 md:p-6 lg:p-8 min-h-[calc(100vh-5rem)] flex flex-col bg-surface-950 relative";

    // Pegar cache de eventos. Precisamos varrer o localStorage e coletar todos os eventos cacheados.
    const allEvents = this.getAllCachedEvents();

    if (allEvents.length === 0) {
       main.innerHTML = `
         <div class="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#0a0a0a] rounded-2xl border border-[#262626] border-dashed animate-in zoom-in-95 duration-300 max-w-2xl mx-auto mt-12">
            <div class="w-16 h-16 rounded-full bg-[#141414] border border-[#262626] flex items-center justify-center text-[#737373] mb-4 shadow-sm">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
            <h3 class="text-xl font-bold text-white mb-2">Nenhum dado em memória</h3>
            <p class="text-sm text-[#737373] mb-6 leading-relaxed">A Central de Oportunidades analisa os dados já carregados no Dashboard para não esgotar sua franquia de API. Acesse o Dashboard primeiro para carregar as ligas.</p>
            <button class="btn-primary py-2 px-6 flex items-center gap-2 mx-auto" onclick="window.sbApp.navigateTo('dashboard')">
              Carregar Dashboard
            </button>
         </div>
       `;
       return;
    }

    // Calcular Oportunidades
    let opportunities = window.SuggestionsService.findTopOpportunities(allEvents);

    // Filtros
    if (this.currentFilterSport !== 'ALL') {
       opportunities = opportunities.filter(opp => opp.event.sportKey === this.currentFilterSport);
    }
    
    opportunities = opportunities.filter(opp => opp.evaluation.percentDiff >= this.currentFilterDistortion);

    const tooltip = (text) => `<span class="inline-flex items-center justify-center w-3 h-3 rounded-full bg-[#404040] text-[8px] text-white cursor-help ml-1 hover:bg-white hover:text-black transition-colors" title="${text}">i</span>`;

    // Extract available sports from opportunities to populate filter
    const activeSports = [...new Set(window.SuggestionsService.findTopOpportunities(allEvents).map(o => o.event.sportKey))];
    const sportFilterHTML = activeSports.map(sk => `
       <button class="px-4 py-2 text-[10px] font-bold rounded-md transition-all ${this.currentFilterSport === sk ? 'bg-[#a3e635] text-black shadow-sm' : 'text-[#737373] hover:text-white hover:bg-[#141414]'}" onclick="window.OpportunitiesView.setSportFilter('${sk}')">
          ${sk.replace(/_/g, ' ').toUpperCase()}
       </button>
    `).join('');

    main.innerHTML = `
      <div class="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#262626] pb-6 animate-in fade-in">
        <div>
          <h1 class="text-3xl font-black text-white tracking-tight flex items-center gap-3">
             Central de Oportunidades
             <span class="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold tracking-widest uppercase">SHARP BOOKIE</span>
          </h1>
          <p class="text-sm text-[#737373] mt-2">Varredura profunda das ligas em cache buscando distorções em relação à Linha de Referência (Pinnacle/Média).</p>
        </div>
      </div>

      <!-- Toolbar de Filtros Avançados -->
      <div class="flex flex-col md:flex-row gap-4 mb-6 items-start md:items-center justify-between bg-[#0a0a0a] p-4 rounded-xl border border-[#262626] shadow-lg">
         
         <div class="flex items-center gap-3">
            <span class="text-[9px] font-black text-[#737373] uppercase tracking-widest">Esporte:</span>
            <select class="bg-[#141414] border border-[#262626] text-white text-[10px] font-bold p-2 rounded cursor-pointer uppercase tracking-widest" onchange="window.OpportunitiesView.setSportFilter(this.value)">
               <option value="ALL" ${this.currentFilterSport === 'ALL' ? 'selected' : ''}>TODOS</option>
               ${activeSports.map(sk => `<option value="${sk}" ${this.currentFilterSport === sk ? 'selected' : ''}>${sk.replace(/_/g, ' ')}</option>`).join('')}
            </select>
         </div>

         <div class="flex flex-wrap gap-4">
            <div class="flex items-center gap-2">
               <span class="text-[9px] font-black text-[#737373] uppercase tracking-widest">Diferença Mínima:</span>
               <select class="bg-[#141414] border border-[#262626] text-white text-[10px] font-bold p-2 rounded cursor-pointer" onchange="window.OpportunitiesView.setDistortionFilter(this.value)">
                  <option value="1" ${this.currentFilterDistortion == 1 ? 'selected' : ''}>> 1%</option>
                  <option value="2" ${this.currentFilterDistortion == 2 ? 'selected' : ''}>> 2%</option>
                  <option value="3" ${this.currentFilterDistortion == 3 ? 'selected' : ''}>> 3%</option>
                  <option value="5" ${this.currentFilterDistortion == 5 ? 'selected' : ''}>> 5%</option>
                  <option value="10" ${this.currentFilterDistortion == 10 ? 'selected' : ''}>> 10%</option>
               </select>
            </div>
         </div>
      </div>

      <!-- Tabela/Grid de Oportunidades -->
      ${opportunities.length === 0 ? `
         <div class="p-8 text-center bg-[#0a0a0a] border border-[#262626] rounded-xl text-[#737373] text-sm">
            Nenhuma distorção encontrada para os filtros atuais.
         </div>
      ` : `
         <div class="grid grid-cols-1 xl:grid-cols-2 gap-4 animate-in slide-in-from-bottom-4 duration-300">
            ${opportunities.map(opp => this.buildOpportunityCard(opp)).join('')}
         </div>
      `}
    `;
  }

  static buildOpportunityCard(opp) {
     const { event, market, selection, evaluation } = opp;
     const dateFormatted = window.DateUtil.formatEventDate(event.startTime);
     const relativeStatus = window.DateUtil.getRelativeStatus(event.startTime);
     const bestOddVal = parseFloat(selection.bestOdd.odd).toFixed(2);
     const refOddVal = evaluation.refOdd.toFixed(2);
     const diff = evaluation.percentDiff.toFixed(2);
     const isLive = event.status === 'AO VIVO';

     return `
        <div class="bg-gradient-to-r from-[#141414] to-[#0a0a0a] border border-[#262626] rounded-xl p-4 flex flex-col md:flex-row gap-4 hover:border-[#a3e635]/50 transition-colors shadow-sm group">
           <!-- Coluna Info Jogo -->
           <div class="flex flex-col flex-1 border-b md:border-b-0 md:border-r border-[#262626] pb-4 md:pb-0 md:pr-4">
              <div class="flex items-center gap-2 mb-2">
                 <span class="text-[9px] font-bold ${isLive ? 'text-red-500 bg-red-500/10' : 'text-[#737373] bg-[#262626]'} px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                    ${isLive ? '<span class="w-1 h-1 bg-red-500 rounded-full animate-pulse"></span>' : ''}
                    ${isLive ? 'Ao Vivo' : dateFormatted}
                 </span>
                 <span class="text-[9px] text-[#a3a3a3] uppercase tracking-wider">${event.sportTitle}</span>
              </div>
              <h4 class="text-sm font-black text-white leading-tight mb-2 group-hover:text-[#a3e635] transition-colors">${event.homeTeam} <span class="text-[#404040] font-normal px-1">×</span> ${event.awayTeam}</h4>
              <div class="mt-auto flex flex-col">
                 <span class="text-[9px] text-[#737373] uppercase font-bold tracking-wider">Mercado</span>
                 <span class="text-[11px] font-bold text-white bg-[#1a1a1a] border border-[#262626] px-2 py-1 rounded w-fit mt-1">${market.name} • ${selection.name}</span>
              </div>
           </div>

           <!-- Coluna Oportunidade / Distorção -->
           <div class="flex flex-col md:w-48 shrink-0 justify-between">
              <div class="flex justify-between items-start mb-2">
                 <div class="flex flex-col">
                    <span class="text-[9px] text-[#737373] uppercase font-bold tracking-wider mb-0.5">Distorção</span>
                    <span class="text-lg font-black font-mono ${evaluation.percentDiff > 3 ? 'text-emerald-500' : 'text-[#a3e635]'}">+${diff}%</span>
                 </div>
              </div>

              <div class="bg-[#0a0a0a] rounded-lg border border-[#262626] p-2 grid grid-cols-2 gap-2 text-center mb-3">
                 <div>
                    <span class="block text-[8px] text-[#737373] uppercase font-bold tracking-wider truncate" title="Linha de Referência (${evaluation.refBookmaker})">Ref (${evaluation.refBookmaker})</span>
                    <span class="block text-[11px] font-bold text-white font-mono mt-0.5">${refOddVal}</span>
                 </div>
                 <div class="border-l border-[#262626]">
                    <span class="block text-[8px] text-[#737373] uppercase font-bold tracking-wider truncate" title="Melhor Odd Encontrada">Odd (${selection.bestOdd.bookmaker})</span>
                    <span class="block text-[11px] font-bold text-[#a3e635] font-mono mt-0.5">${bestOddVal}</span>
                 </div>
              </div>

              <button class="w-full bg-[#262626] group-hover:bg-[#a3e635] group-hover:text-black text-white text-[10px] font-black uppercase tracking-wider py-2 rounded transition-colors"
                      onclick="window.sbApp.navigateTo('scanner', { eventId: '${event.id}', sportKey: '${event.sportKey}', marketId: '${market.id}' })">
                 Analisar Distorção
              </button>
           </div>
        </div>
     `;
  }

  static setSportFilter(sportKey) {
     this.currentFilterSport = sportKey;
     this.render();
  }

  static setDistortionFilter(val) {
     this.currentFilterDistortion = parseFloat(val);
     this.render();
  }

  static getAllCachedEvents() {
     const events = [];
     for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('sb_events_cache_')) {
           try {
              const data = JSON.parse(localStorage.getItem(key));
              // Verifica se cache é válido (5 minutos)
              if (Date.now() - data.timestamp < 5 * 60 * 1000) {
                 events.push(...data.events);
              }
           } catch(e) {}
        }
     }
     return events;
  }
}

window.OpportunitiesView = OpportunitiesView;
