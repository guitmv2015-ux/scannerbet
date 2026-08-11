/**
 * SCANNERBET DASHBOARD VIEW - FASE 9
 * Terminal Profissional de Inteligência Esportiva
 */

class DashboardView {
  static async render(forceRefresh = false) {
    const main = document.getElementById('app-main');
    if (!main) return;

    const state = window.sbState.getState();
    const user = state.user;
    if (!user) {
      window.sbApp.navigateTo('auth-login');
      return;
    }

    const userName = user.name || 'Guilherme';

    // Load preferences
    this.prefs = JSON.parse(localStorage.getItem('sb_dash_prefs')) || {
      showOpportunities: true,
      showEvents: true,
      showMetrics: true
    };

    if (!forceRefresh && this.allEvents && this.allEvents.length > 0) {
        // Just re-render
        this.renderContent(main, userName);
        return;
    }

    main.className = "flex-1 w-full p-4 lg:p-6 min-h-[calc(100vh-5rem)] flex flex-col relative";

    main.innerHTML = `
      <div class="flex-1 flex flex-col items-center justify-center text-[#a3a3a3] text-sm animate-pulse">
        <svg class="animate-spin mb-4 h-10 w-10 text-[#06b6d4]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <span class="font-bold text-white text-base">Buscando oportunidades em tempo real...</span>
        <span class="text-xs mt-2 text-[#737373]">Conectando aos provedores globais de odds</span>
      </div>
    `;

    try {
      this.allEvents = await window.EventsService.getMassiveEvents();
      this.currentFilterDate = 'all'; // all, today, tomorrow
      this.currentFilterStatus = 'all'; // all, live, pre
      this.currentFilterSport = 'all'; // all, soccer, basketball...
      this.searchQuery = '';
      this.lastUpdate = new Date();
      
      this.sports = [...new Set(this.allEvents.map(e => e.sportTitle || 'Outros'))];

      this.calculateRealOpportunities();
      this.renderContent(main, userName);

    } catch (e) {
      console.error(e);
      main.innerHTML = `
        <div class="p-8 text-center bg-red-950/20 border border-red-500/20 rounded-xl max-w-2xl mx-auto mt-10">
          <h3 class="text-red-500 font-bold mb-2">Erro ao conectar com The Odds API</h3>
          <p class="text-sm text-red-400/80">${e.message || 'Falha de comunicação com o backend.'}</p>
          <button onclick="window.DashboardView.render(true)" class="mt-4 px-6 py-2 bg-[#1a1a1a] border border-[#333] hover:border-white rounded text-white text-xs font-bold transition-all">Tentar Novamente</button>
        </div>
      `;
    }
  }

  static getClassification(diff) {
     if (diff >= 3) return { text: "VALOR POTENCIAL", color: "text-[#a3e635]", bg: "bg-[#a3e635]/10", dot: "bg-[#a3e635]" };
     if (diff >= 1) return { text: "COTAÇÃO INTERESSANTE", color: "text-[#fbbf24]", bg: "bg-[#fbbf24]/10", dot: "bg-[#fbbf24]" };
     if (diff > 0) return { text: "MONITORAR", color: "text-white", bg: "bg-[#404040]/30", dot: "bg-white" };
     return { text: "SEM VANTAGEM IDENTIFICADA", color: "text-[#737373]", bg: "bg-transparent border border-[#262626]", dot: "bg-[#737373]" };
  }

  static calculateRealOpportunities() {
     this.opportunities = [];
     this.totalBookmakers = new Set();
     
     this.allEvents.forEach(evt => {
         const markets = window.OddsProviderService.getNormalizedOddsForEvent(evt);
         if (!markets || markets.length === 0) return;
         
         markets.forEach(market => {
             market.selections.forEach(sel => {
                 if (sel.allOdds.length > 1) {
                     let highest = parseFloat(sel.allOdds[0].odd);
                     let lowest = highest;
                     let bestOddObj = sel.allOdds[0];
                     let sum = 0;
                     
                     sel.allOdds.forEach(o => {
                         this.totalBookmakers.add(o.bookmakerKey);
                         const val = parseFloat(o.odd);
                         if (val > highest) { highest = val; bestOddObj = o; }
                         if (val < lowest) lowest = val;
                         sum += val;
                     });
                     
                     const avg = sum / sel.allOdds.length;
                     const diff = ((highest - avg) / avg) * 100;
                     
                     if (diff >= 1) { // Só mostra Cotação Interessante ou Valor Potencial no Mural Principal
                         this.opportunities.push({
                             event: evt,
                             market: market,
                             selection: sel,
                             bestOddObj: bestOddObj,
                             diff: diff.toFixed(2),
                             avg: avg.toFixed(2),
                             numBookmakers: sel.allOdds.length,
                             classification: this.getClassification(diff)
                         });
                     }
                 }
             });
         });
     });
     
     this.opportunities.sort((a, b) => b.diff - a.diff);
  }

  static renderContent(main, userName) {
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    const tomorrow = new Date(endOfToday);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    let filteredEvents = this.allEvents;
    
    // Date filter
    if (this.currentFilterDate === 'today') {
       filteredEvents = filteredEvents.filter(e => e.startTime <= endOfToday.getTime());
    } else if (this.currentFilterDate === 'tomorrow') {
       filteredEvents = filteredEvents.filter(e => e.startTime > endOfToday.getTime() && e.startTime <= tomorrow.getTime());
    }
    
    // Status filter
    if (this.currentFilterStatus === 'live') {
       filteredEvents = filteredEvents.filter(e => e.status === 'AO VIVO');
    } else if (this.currentFilterStatus === 'pre') {
       filteredEvents = filteredEvents.filter(e => e.status !== 'AO VIVO');
    }

    // Sport filter
    if (this.currentFilterSport !== 'all') {
       filteredEvents = filteredEvents.filter(e => e.sportTitle === this.currentFilterSport);
    }

    // Search
    if (this.searchQuery) {
       const q = this.searchQuery.toLowerCase();
       filteredEvents = filteredEvents.filter(e => 
          e.homeTeam.toLowerCase().includes(q) || 
          e.awayTeam.toLowerCase().includes(q) ||
          (e.sportTitle && e.sportTitle.toLowerCase().includes(q))
       );
    }

    const numEvents = filteredEvents.length;
    const updateTimeStr = this.lastUpdate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    // Filter Helper
    const renderFilterBtn = (type, val, label) => {
       const current = type === 'date' ? this.currentFilterDate : (type === 'status' ? this.currentFilterStatus : this.currentFilterSport);
       const isActive = current === val;
       return `<button onclick="window.DashboardView.setFilter('${type}', '${val}')" class="px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${isActive ? 'bg-[#06b6d4] text-black shadow-[0_0_10px_rgba(6,182,212,0.3)]' : 'bg-[#141414] border border-[#262626] text-[#a3a3a3] hover:text-white hover:border-[#404040]'}">${label}</button>`;
    };

    main.innerHTML = `
      <div class="max-w-[1600px] mx-auto w-full space-y-6 animate-in fade-in duration-500">
        
        <!-- HEADER -->
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#262626] pb-5">
           <div>
              <h1 class="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                 SCANNERBET
                 <span class="px-2 py-0.5 bg-[#1a1a1a] border border-[#333] rounded text-[10px] text-[#06b6d4] uppercase tracking-widest font-bold">Terminal Profissional</span>
              </h1>
              <p class="text-[#737373] text-sm mt-1">Central de Inteligência Esportiva & Monitoramento Global</p>
           </div>
           <div class="flex items-center gap-4 bg-[#0f0f0f] border border-[#262626] rounded-xl p-2 pr-4">
              <div class="px-3 border-r border-[#262626]">
                 <p class="text-[9px] uppercase tracking-widest text-[#737373] font-bold">Status do Terminal</p>
                 <p class="text-xs text-emerald-400 font-mono font-bold flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> ONLINE</p>
              </div>
              <div class="px-3 border-r border-[#262626]">
                 <p class="text-[9px] uppercase tracking-widest text-[#737373] font-bold">Última Sincronização</p>
                 <p class="text-xs text-white font-mono font-bold">Hoje • ${updateTimeStr}</p>
              </div>
              <button onclick="window.DashboardView.render(true)" class="flex items-center gap-2 bg-[#1a1a1a] hover:bg-[#262626] border border-[#333] text-white px-3 py-1.5 rounded text-[10px] uppercase font-bold transition-all">
                 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-9.21l-3.23 2.15"></path></svg>
                 Atualizar
              </button>
           </div>
        </div>

        <!-- KPIs REAIS -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="bg-gradient-to-b from-[#141414] to-[#0a0a0a] border border-[#262626] rounded-xl p-5 hover:border-[#404040] transition-colors">
            <p class="text-[10px] text-[#737373] uppercase tracking-widest font-bold mb-1 flex items-center gap-2"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg> Eventos Disponíveis</p>
            <p class="text-3xl font-black text-white font-mono">${this.allEvents.length}</p>
          </div>
          <div class="bg-gradient-to-b from-[#141414] to-[#0a0a0a] border border-[#262626] rounded-xl p-5 hover:border-[#404040] transition-colors">
            <p class="text-[10px] text-[#737373] uppercase tracking-widest font-bold mb-1 flex items-center gap-2"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M2 12h20"></path><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg> Casas Monitoradas</p>
            <p class="text-3xl font-black text-white font-mono">${this.totalBookmakers.size}</p>
          </div>
          <div class="bg-gradient-to-b from-[#141414] to-[#0a0a0a] border border-[#262626] rounded-xl p-5 hover:border-[#06b6d4]/50 transition-colors">
            <p class="text-[10px] text-[#06b6d4] uppercase tracking-widest font-bold mb-1 flex items-center gap-2"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg> Oportunidades >1%</p>
            <p class="text-3xl font-black text-[#06b6d4] font-mono">${this.opportunities.length}</p>
          </div>
          <div class="bg-gradient-to-b from-[#141414] to-[#0a0a0a] border border-[#262626] rounded-xl p-5 hover:border-[#404040] transition-colors">
            <p class="text-[10px] text-[#737373] uppercase tracking-widest font-bold mb-1 flex items-center gap-2"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg> Palpites Pendentes</p>
            <p class="text-3xl font-black text-white font-mono">${window.sbState.getState().user?.picks?.filter(p=>p.status==='PENDING').length || 0}</p>
          </div>
        </div>

        <!-- PESQUISA E FILTROS -->
        <div class="bg-[#0a0a0a] border border-[#262626] rounded-xl p-4 flex flex-col md:flex-row items-center gap-6">
           <div class="relative w-full md:w-1/3">
              <input type="text" placeholder="Buscar time, atleta, campeonato..." value="${this.searchQuery}"
                     class="w-full bg-[#141414] border border-[#333] text-white text-sm rounded-lg pl-10 pr-4 py-2.5 focus:border-[#06b6d4] focus:outline-none transition-colors"
                     onkeyup="window.DashboardView.handleSearch(event)">
              <svg class="absolute left-3.5 top-3 text-[#737373]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
           </div>
           
           <div class="flex-1 flex flex-wrap items-center gap-4 border-l border-[#262626] pl-6">
              <div class="flex items-center gap-2">
                 <span class="text-[10px] uppercase text-[#737373] font-bold mr-2">Data:</span>
                 ${renderFilterBtn('date', 'all', 'Todos')}
                 ${renderFilterBtn('date', 'today', 'Hoje')}
                 ${renderFilterBtn('date', 'tomorrow', 'Amanhã')}
              </div>
              <div class="flex items-center gap-2 border-l border-[#262626] pl-4">
                 <span class="text-[10px] uppercase text-[#737373] font-bold mr-2">Status:</span>
                 ${renderFilterBtn('status', 'all', 'Todos')}
                 ${renderFilterBtn('status', 'pre', 'Pré-Jogo')}
                 ${renderFilterBtn('status', 'live', 'Ao Vivo')}
              </div>
              <div class="flex items-center gap-2 border-l border-[#262626] pl-4">
                 <span class="text-[10px] uppercase text-[#737373] font-bold mr-2">Esporte:</span>
                 ${renderFilterBtn('sport', 'all', 'Todos')}
                 ${this.sports.slice(0, 4).map(s => renderFilterBtn('sport', s, s)).join('')}
              </div>
           </div>
        </div>

        <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          <!-- SEÇÃO PRINCIPAL: OPORTUNIDADES -->
          <div class="xl:col-span-2 flex flex-col space-y-4">
             <div class="flex items-center justify-between border-b border-[#262626] pb-2">
                <h2 class="text-lg font-black text-white flex items-center gap-2">🔥 MELHORES OPORTUNIDADES</h2>
                <span class="text-[10px] text-[#737373]">Calculado com dados reais</span>
             </div>
             
             <div class="space-y-4">
                ${this.opportunities.length === 0 ? `
                   <div class="bg-[#0a0a0a] border border-dashed border-[#333] rounded-xl p-10 text-center">
                      <p class="text-[#737373] text-sm">Nenhuma oportunidade com Valor Potencial encontrada neste momento.</p>
                   </div>
                ` : ''}
                
                ${this.opportunities.slice(0, 10).map((opp) => {
                   const dateStr = window.DateUtil ? window.DateUtil.formatEventDate(opp.event.startTime) : new Date(opp.event.startTime).toLocaleString();
                   return `
                   <div class="bg-[#0f0f0f] border border-[#262626] hover:border-[#06b6d4]/50 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all group">
                      <div class="flex-1">
                         <div class="flex items-center gap-3 mb-3">
                            <span class="text-[9px] bg-[#1a1a1a] text-[#a3a3a3] border border-[#333] px-2 py-0.5 rounded uppercase font-bold tracking-wider">${opp.event.sportTitle}</span>
                            <span class="text-[10px] text-[#737373] font-mono">${dateStr}</span>
                            <span class="text-[9px] font-bold ${opp.classification.color} ${opp.classification.bg} px-2 py-0.5 rounded flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full ${opp.classification.dot}"></span> ${opp.classification.text}</span>
                         </div>
                         <h3 class="text-base font-bold text-white mb-2 leading-tight">${opp.event.homeTeam} <span class="text-[#737373] font-normal mx-1">x</span> ${opp.event.awayTeam}</h3>
                         <div class="flex items-center gap-2 text-sm">
                            <span class="text-[#a3a3a3] font-semibold">${opp.market.name}</span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#404040" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                            <span class="text-[#06b6d4] font-bold">${opp.selection.fullName}</span>
                         </div>
                      </div>
                      
                      <div class="flex items-center gap-6 bg-[#0a0a0a] p-4 rounded-lg border border-[#1a1a1a]">
                         <div class="text-center border-r border-[#262626] pr-6">
                            <p class="text-[9px] text-[#737373] uppercase tracking-widest font-bold mb-1 text-left">Odd Média</p>
                            <p class="text-lg font-bold text-[#a3a3a3] font-mono">@${opp.avg}</p>
                         </div>
                         <div class="text-center min-w-[90px]">
                            <p class="text-[9px] text-[#737373] uppercase tracking-widest font-bold mb-1 text-left">${opp.bestOddObj.bookmaker}</p>
                            <p class="text-2xl font-black text-[#a3e635] font-mono leading-none">@${parseFloat(opp.bestOddObj.odd).toFixed(2)}</p>
                            <p class="text-[10px] font-bold text-emerald-400 mt-1 flex items-center justify-start gap-1"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg> +${opp.diff}%</p>
                         </div>
                      </div>
                      
                      <div>
                         <button onclick="window.sbApp.navigateTo('scanner', { sportKey: '${opp.event.sportKey}', eventId: '${opp.event.id}' })" class="w-full md:w-auto bg-[#06b6d4]/10 hover:bg-[#06b6d4] text-[#06b6d4] hover:text-black border border-[#06b6d4]/30 px-5 py-3 rounded-lg font-bold text-[11px] uppercase tracking-widest transition-all whitespace-nowrap">
                            Analisar Odds
                         </button>
                      </div>
                   </div>
                `}).join('')}
             </div>
          </div>

          <!-- SEÇÃO LATERAL: EVENTOS DO CALENDÁRIO -->
          <div class="flex flex-col space-y-4">
             <div class="flex items-center justify-between border-b border-[#262626] pb-2">
                <h2 class="text-lg font-bold text-white uppercase">Todos os Eventos</h2>
                <span class="text-[10px] bg-[#1a1a1a] text-white px-2 py-0.5 rounded font-mono">${numEvents}</span>
             </div>
             
             <div class="bg-[#0a0a0a] border border-[#262626] rounded-xl overflow-hidden flex flex-col h-[600px]">
                <div class="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                   ${filteredEvents.length === 0 ? '<div class="text-center text-[#737373] text-sm p-6">Nenhum evento corresponde aos filtros atuais.</div>' : ''}
                   
                   ${filteredEvents.map((evt) => {
                      const isLive = evt.status === 'AO VIVO';
                      const dateStr = window.DateUtil ? window.DateUtil.formatEventDate(evt.startTime) : new Date(evt.startTime).toLocaleString();
                      
                      return `
                      <div onclick="window.sbApp.navigateTo('scanner', { sportKey: '${evt.sportKey}', eventId: '${evt.id}' })" class="bg-[#141414] border border-[#262626] hover:border-[#06b6d4]/50 rounded-lg p-4 cursor-pointer transition-colors group">
                         <div class="flex items-center justify-between mb-3">
                            <span class="text-[10px] text-[#a3a3a3] font-mono group-hover:text-white transition-colors">${dateStr}</span>
                            ${isLive ? '<span class="text-[9px] bg-red-500/20 text-red-500 border border-red-500/30 px-2 py-0.5 rounded uppercase font-bold animate-pulse">AO VIVO</span>' : '<span class="text-[9px] text-[#737373] uppercase font-bold tracking-widest">PRÉ-JOGO</span>'}
                         </div>
                         <div class="flex items-center justify-between gap-4">
                            <div class="flex-1">
                               <p class="text-sm font-bold text-white group-hover:text-[#06b6d4] transition-colors leading-tight mb-1">${evt.homeTeam}</p>
                               <p class="text-sm font-bold text-white group-hover:text-[#06b6d4] transition-colors leading-tight">${evt.awayTeam}</p>
                            </div>
                            <div class="text-right flex flex-col items-end">
                               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#404040" stroke-width="2" class="group-hover:stroke-[#06b6d4] transition-colors mb-2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                               <span class="text-[8px] uppercase tracking-widest text-[#737373] bg-[#0a0a0a] px-1.5 py-0.5 rounded border border-[#262626]">Mercados</span>
                            </div>
                         </div>
                      </div>
                   `}).join('')}
                </div>
             </div>
          </div>
          
        </div>
      </div>
    `;
  }

  static setFilter(type, val) {
     if (type === 'date') this.currentFilterDate = val;
     if (type === 'status') this.currentFilterStatus = val;
     if (type === 'sport') this.currentFilterSport = val;
     this.renderContent(document.getElementById('app-main'), window.sbState.getState().user?.name || 'Guilherme');
  }

  static handleSearch(e) {
     this.searchQuery = e.target.value;
     this.renderContent(document.getElementById('app-main'), window.sbState.getState().user?.name || 'Guilherme');
  }
}

window.DashboardView = DashboardView;
