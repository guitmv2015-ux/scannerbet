/**
 * SCANNERBET DASHBOARD VIEW - FASE 12
 * Terminal Profissional de Inteligência Esportiva com Foco no Brasileirão Série A
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

    if (!forceRefresh && this.allEvents && this.allEvents.length > 0) {
        this.renderContent(main, userName);
        return;
    }

    main.className = "flex-1 w-full p-4 lg:p-6 min-h-[calc(100vh-5rem)] flex flex-col relative";

    main.innerHTML = `
      <div class="flex-1 flex flex-col items-center justify-center text-[#a3a3a3] text-sm animate-pulse">
        <svg class="animate-spin mb-4 h-10 w-10 text-[#06b6d4]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <span class="font-bold text-white text-base">Buscando oportunidades no mercado global...</span>
        <span class="text-xs mt-2 text-[#737373]">Analisando Brasileirão Série A e outras ligas</span>
      </div>
    `;

    try {
      this.allEvents = await window.EventsService.getMassiveEvents();
      this.currentFilterDate = 'all'; 
      this.currentFilterStatus = 'all'; 
      this.currentFilterSport = 'all'; 
      this.currentFilterMarket = 'all'; // 1x2, handicap, over_under
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
     if (diff >= 3) return { text: "COTAÇÃO DESTACADA", color: "text-[#a3e635]", bg: "bg-[#a3e635]/10", dot: "bg-[#a3e635]" };
     if (diff >= 1) return { text: "DIFERENÇA INTERESSANTE", color: "text-[#fbbf24]", bg: "bg-[#fbbf24]/10", dot: "bg-[#fbbf24]" };
     if (diff > 0) return { text: "MONITORAR", color: "text-white", bg: "bg-[#404040]/30", dot: "bg-white" };
     return { text: "SEM DIFERENÇA RELEVANTE", color: "text-[#ef4444]", bg: "bg-red-500/10", dot: "bg-[#ef4444]" };
  }

  static calculateRealOpportunities() {
     this.opportunities = [];
     this.totalBookmakers = new Set();
     this.totalMarkets = new Set();
     
     this.allEvents.forEach(evt => {
         const markets = window.OddsProviderService.getNormalizedOddsForEvent(evt);
         if (!markets || markets.length === 0) return;
         
         evt.availableMarkets = markets.map(m => m.id); // Guardar os mercados disponiveis no evento
         
         markets.forEach(market => {
             this.totalMarkets.add(market.id);
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
                     
                     if (diff >= 1) { 
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
    
    if (this.currentFilterDate === 'today') {
       filteredEvents = filteredEvents.filter(e => e.startTime <= endOfToday.getTime());
    } else if (this.currentFilterDate === 'tomorrow') {
       filteredEvents = filteredEvents.filter(e => e.startTime > endOfToday.getTime() && e.startTime <= tomorrow.getTime());
    }
    
    if (this.currentFilterStatus === 'live') {
       filteredEvents = filteredEvents.filter(e => e.status === 'AO VIVO');
    } else if (this.currentFilterStatus === 'pre') {
       filteredEvents = filteredEvents.filter(e => e.status !== 'AO VIVO');
    }

    if (this.currentFilterSport !== 'all') {
       filteredEvents = filteredEvents.filter(e => e.sportTitle === this.currentFilterSport);
    }

    if (this.currentFilterMarket !== 'all') {
       filteredEvents = filteredEvents.filter(e => e.availableMarkets && e.availableMarkets.includes(this.currentFilterMarket));
    }

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

    // Filtrar Eventos Brasileiros (Prioridade Brasileirão Série A)
    const brazilEvents = filteredEvents.filter(e => 
       e.sportKey === 'soccer_brazil_campeonato' || 
       (e.sportTitle && e.sportTitle.toLowerCase().includes('brazil'))
    );

    const renderFilterBtn = (type, val, label) => {
       const current = type === 'date' ? this.currentFilterDate : (type === 'status' ? this.currentFilterStatus : (type === 'market' ? this.currentFilterMarket : this.currentFilterSport));
       const isActive = current === val;
       return `<button onclick="window.DashboardView.setFilter('${type}', '${val}')" class="px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${isActive ? 'bg-[#06b6d4] text-black shadow-[0_0_10px_rgba(6,182,212,0.3)]' : 'bg-[#141414] border border-[#262626] text-[#a3a3a3] hover:text-white hover:border-[#404040] whitespace-nowrap'}">${label}</button>`;
    };

    main.innerHTML = `
      <div class="max-w-[1600px] mx-auto w-full space-y-8 animate-in fade-in duration-500 pb-10">
        
        <!-- HEADER -->
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#262626] pb-5">
           <div>
              <h1 class="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                 SCANNERBET
                 <span class="px-2 py-0.5 bg-gradient-to-r from-[#06b6d4] to-blue-500 text-white rounded text-[10px] uppercase tracking-widest font-black shadow-lg">Terminal Profissional</span>
              </h1>
              <p class="text-[#737373] text-sm mt-1">Inteligência de Odds em Tempo Real & Comparador Multimercado</p>
           </div>
           <div class="flex flex-wrap items-center gap-4 bg-[#0f0f0f] border border-[#262626] rounded-xl p-2 pr-4">
              <div class="px-3 border-r border-[#262626]">
                 <p class="text-[9px] uppercase tracking-widest text-[#737373] font-bold">API</p>
                 <p class="text-xs text-emerald-400 font-mono font-bold flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> ONLINE</p>
              </div>
              <div class="px-3 border-r border-[#262626]">
                 <p class="text-[9px] uppercase tracking-widest text-[#737373] font-bold">Última Atualização</p>
                 <p class="text-xs text-white font-mono font-bold">Hoje • ${updateTimeStr}</p>
              </div>
              <button onclick="window.DashboardView.render(true)" class="flex items-center gap-2 bg-[#1a1a1a] hover:bg-[#262626] border border-[#333] text-white px-4 py-1.5 rounded text-[10px] uppercase font-bold transition-all">
                 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-9.21l-3.23 2.15"></path></svg>
                 Atualizar Dados
              </button>
           </div>
        </div>

        
        <!-- DESTAQUE GLOBAL DE BUSCA -->
        <div class="bg-gradient-to-r from-[#06b6d4]/20 to-blue-600/20 border border-[#06b6d4]/30 rounded-2xl p-6 relative overflow-hidden">
           <div class="absolute -top-24 -right-24 w-64 h-64 bg-[#06b6d4]/10 rounded-full blur-3xl pointer-events-none"></div>
           <h2 class="text-xl font-black text-white mb-4 relative z-10">Qual odd você quer encontrar agora?</h2>
           <div class="relative w-full max-w-3xl z-10 flex gap-2">
              <div class="relative flex-1">
                 <input type="text" id="global-search" placeholder="Digite o nome de um time (ex: Flamengo), campeonato ou mercado..." value="${this.searchQuery}"
                        class="w-full bg-[#0a0a0a]/80 backdrop-blur-sm border-2 border-[#333] text-white text-lg rounded-xl pl-12 pr-4 py-4 focus:border-[#06b6d4] focus:outline-none transition-colors shadow-inner"
                        onkeyup="window.DashboardView.handleSearch(event)">
                 <svg class="absolute left-4 top-4 text-[#06b6d4]" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </div>
           </div>
           <div class="mt-4 flex gap-2 z-10 relative">
              <span class="text-xs text-[#a3a3a3] font-bold mt-1">Populares:</span>
              <button onclick="document.getElementById('global-search').value='Flamengo'; window.DashboardView.handleSearch({target: {value: 'Flamengo'}})" class="text-xs bg-[#1a1a1a] border border-[#333] px-3 py-1 rounded-full text-white hover:border-[#06b6d4] transition-colors">Flamengo</button>
              <button onclick="document.getElementById('global-search').value='Palmeiras'; window.DashboardView.handleSearch({target: {value: 'Palmeiras'}})" class="text-xs bg-[#1a1a1a] border border-[#333] px-3 py-1 rounded-full text-white hover:border-[#06b6d4] transition-colors">Palmeiras</button>
              <button onclick="document.getElementById('global-search').value='Série A'; window.DashboardView.handleSearch({target: {value: 'Série A'}})" class="text-xs bg-[#1a1a1a] border border-[#333] px-3 py-1 rounded-full text-white hover:border-[#06b6d4] transition-colors">Série A</button>
           </div>
        </div>


        <!-- 🇧🇷 FUTEBOL BRASILEIRO (SÉRIE A E OUTROS) - PRIMEIRO PLANO -->
        <div class="space-y-4">
           <div class="flex items-center justify-between border-b-2 border-emerald-500/50 pb-2">
              <h2 class="text-2xl font-black text-white uppercase tracking-widest flex items-center gap-3">
                 <span class="text-3xl">🇧🇷</span> Foco: Futebol Brasileiro
              </h2>
              <div class="flex items-center gap-3">
                 <span class="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                    ${brazilEvents.length} jogos (Ao Vivo & Futuros)
                 </span>
              </div>
           </div>
           
           <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              ${brazilEvents.length === 0 ? `
                 <div class="col-span-full bg-[#0a0a0a] border border-dashed border-[#333] rounded-xl p-10 flex flex-col items-center justify-center text-center">
                    <p class="text-white font-bold mb-2 text-lg">Sem partidas do Brasileirão neste exato momento.</p>
                    <p class="text-[#737373]">As casas de apostas ainda não liberaram as cotações para os próximos jogos.</p>
                 </div>
              ` : brazilEvents.map((evt) => {
                 const dateStr = window.DateUtil ? window.DateUtil.formatEventDate(evt.startTime) : new Date(evt.startTime).toLocaleString();
                 const isLive = evt.status === 'AO VIVO';
                 const marketsAvail = evt.availableMarkets || [];
                 
                 let bestOddHighlight = null;
                 const oddsData = window.OddsProviderService.getNormalizedOddsForEvent(evt);
                 if (oddsData && oddsData.length > 0) {
                     const mkt1x2 = oddsData.find(m => m.id === 'h2h');
                     if (mkt1x2 && mkt1x2.selections.length > 0) {
                         const sel = mkt1x2.selections[0];
                         if (sel.bestOdd) bestOddHighlight = sel.bestOdd;
                     }
                 }

                 return `
                 <div class="bg-gradient-to-br from-[#0f0f0f] to-[#141414] border border-[#333] hover:border-emerald-500 shadow-lg rounded-xl p-6 flex flex-col justify-between group transition-all relative overflow-hidden transform hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(16,185,129,0.1)]">
                    <div class="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
                    <div class="flex items-center justify-between mb-5 pl-3">
                       <span class="text-[10px] bg-emerald-500 text-black px-2 py-1 rounded font-black uppercase tracking-widest shadow-md">${evt.sportTitle}</span>
                       <div class="flex items-center gap-2">
                          ${isLive ? '<span class="text-[10px] bg-red-500 text-white px-2 py-1 rounded uppercase font-black animate-pulse shadow-md">AO VIVO</span>' : ''}
                          <span class="text-xs text-[#a3a3a3] font-mono group-hover:text-white transition-colors bg-[#0a0a0a] px-2 py-1 rounded border border-[#262626]">${dateStr}</span>
                       </div>
                    </div>
                    
                    <div class="pl-3 mb-6">
                       <h3 class="text-2xl font-black text-white leading-tight mb-2">${evt.homeTeam}</h3>
                       <p class="text-sm font-bold text-[#737373] italic mb-2 px-2 py-0.5 bg-[#1a1a1a] w-fit rounded">vs</p>
                       <h3 class="text-2xl font-black text-white leading-tight">${evt.awayTeam}</h3>
                    </div>

                    <div class="pl-3 flex flex-wrap gap-2 mb-6">
                       ${marketsAvail.map(m => `<span class="text-[9px] uppercase tracking-widest text-[#a3a3a3] bg-[#1a1a1a] px-2 py-1 rounded border border-[#333]">${m}</span>`).join('')}
                    </div>

                    <div class="pl-3 flex items-center justify-between mt-auto pt-5 border-t border-[#333]">
                       <div>
                          ${bestOddHighlight ? `
                             <p class="text-[10px] uppercase text-[#737373] font-bold mb-1">Favorito Casa (Melhor Odd)</p>
                             <p class="text-2xl font-black text-emerald-400 font-mono leading-none">${parseFloat(bestOddHighlight.odd).toFixed(2)} <span class="text-xs text-[#a3a3a3] ml-1 bg-[#1a1a1a] px-2 py-1 rounded border border-[#333] font-sans">${bestOddHighlight.bookmaker}</span></p>
                          ` : `<p class="text-sm text-[#737373]">Calculando...</p>`}
                       </div>
                       <button onclick="window.sbApp.navigateTo('scanner', { sportKey: '${evt.sportKey}', eventId: '${evt.id}' })" class="bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-3 rounded-lg font-black text-xs uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                          Abrir Cotações
                       </button>
                    </div>
                 </div>
                 `
              }).join('')}
           </div>
        </div>

<!-- KPIs REAIS -->
        <div class="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div class="bg-gradient-to-b from-[#141414] to-[#0a0a0a] border border-[#262626] rounded-xl p-4">
            <p class="text-[9px] text-[#737373] uppercase tracking-widest font-bold mb-1">Eventos</p>
            <p class="text-2xl font-black text-white font-mono">${this.allEvents.length}</p>
          </div>
          <div class="bg-gradient-to-b from-[#141414] to-[#0a0a0a] border border-[#262626] rounded-xl p-4">
            <p class="text-[9px] text-[#737373] uppercase tracking-widest font-bold mb-1">Mercados</p>
            <p class="text-2xl font-black text-white font-mono">${this.totalMarkets.size}</p>
          </div>
          <div class="bg-gradient-to-b from-[#141414] to-[#0a0a0a] border border-[#262626] rounded-xl p-4">
            <p class="text-[9px] text-[#737373] uppercase tracking-widest font-bold mb-1">Casas</p>
            <p class="text-2xl font-black text-white font-mono">${this.totalBookmakers.size}</p>
          </div>
          <div class="bg-gradient-to-b from-[#141414] to-[#0a0a0a] border border-[#06b6d4]/50 shadow-[0_0_15px_rgba(6,182,212,0.1)] rounded-xl p-4">
            <p class="text-[9px] text-[#06b6d4] uppercase tracking-widest font-bold mb-1 flex items-center gap-1"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg> Oportunidades</p>
            <p class="text-2xl font-black text-[#06b6d4] font-mono">${this.opportunities.length}</p>
          </div>
          <div class="bg-gradient-to-b from-[#141414] to-[#0a0a0a] border border-[#262626] rounded-xl p-4">
            <p class="text-[9px] text-[#737373] uppercase tracking-widest font-bold mb-1">Palpites</p>
            <p class="text-2xl font-black text-white font-mono">${window.sbState.getState().user?.picks?.filter(p=>p.status==='PENDING').length || 0}</p>
          </div>
          <div class="bg-gradient-to-b from-[#141414] to-[#0a0a0a] border border-[#262626] rounded-xl p-4">
            <p class="text-[9px] text-[#737373] uppercase tracking-widest font-bold mb-1">ROI Global</p>
            <p class="text-2xl font-black text-[#a3e635] font-mono">+0.0%</p>
          </div>
        </div>

        
<div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          <!-- 🔥 DESTAQUES E OPORTUNIDADES MULTIMERCADO -->
          <div class="xl:col-span-2 flex flex-col space-y-4">
             <div class="flex items-center justify-between border-b border-[#262626] pb-2">
                <h2 class="text-lg font-black text-white flex items-center gap-2">🔥 OPORTUNIDADES EM DESTAQUE</h2>
                <span class="text-[10px] text-[#737373]">Ranking baseado na diferença das casas</span>
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
                         <div class="flex flex-wrap items-center gap-3 mb-3">
                            <span class="text-[9px] bg-[#1a1a1a] text-[#a3a3a3] border border-[#333] px-2 py-0.5 rounded uppercase font-bold tracking-wider">${opp.event.sportTitle}</span>
                            <span class="text-[10px] text-[#737373] font-mono">${dateStr}</span>
                            <span class="text-[9px] font-bold ${opp.classification.color} ${opp.classification.bg} px-2 py-0.5 rounded flex items-center gap-1.5 border border-current"><span class="w-1.5 h-1.5 rounded-full ${opp.classification.dot}"></span> ${opp.classification.text}</span>
                         </div>
                         <h3 class="text-base font-bold text-white mb-2 leading-tight">${opp.event.homeTeam} <span class="text-[#737373] font-normal mx-1">x</span> ${opp.event.awayTeam}</h3>
                         <div class="flex items-center gap-2 text-sm">
                            <span class="text-[10px] uppercase tracking-widest text-[#a3a3a3] font-semibold bg-[#141414] px-2 py-1 rounded border border-[#262626]">${opp.market.name}</span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#404040" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                            <span class="text-[#06b6d4] font-black">${opp.selection.fullName}</span>
                         </div>
                      </div>
                      
                      <div class="flex items-center gap-5 bg-[#0a0a0a] p-3 rounded-lg border border-[#1a1a1a]">
                         <div class="text-center border-r border-[#262626] pr-5">
                            <p class="text-[8px] text-[#737373] uppercase tracking-widest font-bold mb-1 text-left">Odd Média</p>
                            <p class="text-base font-bold text-[#a3a3a3] font-mono">@${opp.avg}</p>
                         </div>
                         <div class="text-center min-w-[90px]">
                            <p class="text-[8px] text-[#737373] uppercase tracking-widest font-bold mb-1 text-left">Maior Odd (${opp.bestOddObj.bookmaker})</p>
                            <p class="text-2xl font-black text-[#a3e635] font-mono leading-none shadow-sm">@${parseFloat(opp.bestOddObj.odd).toFixed(2)}</p>
                            <p class="text-[9px] font-bold text-emerald-400 mt-1 flex items-center justify-start gap-1 bg-emerald-500/10 px-1 py-0.5 rounded w-fit"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg> +${opp.diff}%</p>
                         </div>
                      </div>
                      
                      <div>
                         <button onclick="window.sbApp.navigateTo('scanner', { sportKey: '${opp.event.sportKey}', eventId: '${opp.event.id}' })" class="w-full md:w-auto bg-[#1a1a1a] hover:bg-[#06b6d4] text-white hover:text-black border border-[#333] hover:border-[#06b6d4] px-5 py-3 rounded-lg font-bold text-[11px] uppercase tracking-widest transition-all whitespace-nowrap">
                            Analisar
                         </button>
                      </div>
                   </div>
                `}).join('')}
             </div>
          </div>

          <!-- PESQUISA E TODOS OS EVENTOS -->
          <div class="flex flex-col space-y-4" id="todoseventos">
             <div class="flex items-center justify-between border-b border-[#262626] pb-2">
                <h2 class="text-lg font-bold text-white uppercase">Todos os Eventos</h2>
                <span class="text-[10px] bg-[#1a1a1a] text-[#06b6d4] px-2 py-0.5 rounded font-mono font-bold">${numEvents} Encontrados</span>
             </div>
             
             <!-- PESQUISA E FILTROS COMPACTOS -->
             <div class="bg-[#0a0a0a] border border-[#262626] rounded-xl p-3 flex flex-col gap-3">
                
                
                <div class="flex overflow-x-auto no-scrollbar gap-2 pb-1">
                   ${renderFilterBtn('market', 'all', 'Todos Mkts')}
                   ${renderFilterBtn('market', 'h2h', '1X2')}
                   ${renderFilterBtn('market', 'spreads', 'Handicap')}
                   ${renderFilterBtn('market', 'totals', 'Over/Under')}
                </div>
             </div>

             <div class="bg-[#0a0a0a] border border-[#262626] rounded-xl overflow-hidden flex flex-col h-[550px]">
                <div class="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                   ${filteredEvents.length === 0 ? '<div class="text-center text-[#737373] text-sm p-6">Nenhum evento corresponde aos filtros.</div>' : ''}
                   
                   ${filteredEvents.map((evt) => {
                      const isLive = evt.status === 'AO VIVO';
                      const dateStr = window.DateUtil ? window.DateUtil.formatEventDate(evt.startTime) : new Date(evt.startTime).toLocaleString();
                      const mkts = evt.availableMarkets || [];
                      
                      return `
                      <div onclick="window.sbApp.navigateTo('scanner', { sportKey: '${evt.sportKey}', eventId: '${evt.id}' })" class="bg-[#141414] border border-[#262626] hover:border-[#06b6d4]/50 rounded-lg p-3 cursor-pointer transition-colors group">
                         <div class="flex items-center justify-between mb-2">
                            <span class="text-[10px] text-[#a3a3a3] font-mono group-hover:text-white transition-colors">${dateStr}</span>
                            ${isLive ? '<span class="text-[9px] bg-red-500/20 text-red-500 border border-red-500/30 px-2 py-0.5 rounded uppercase font-bold animate-pulse">AO VIVO</span>' : '<span class="text-[9px] text-[#737373] uppercase font-bold tracking-widest">PRÉ-JOGO</span>'}
                         </div>
                         <div class="mb-2">
                             <p class="text-[10px] text-[#06b6d4] font-bold uppercase truncate">${evt.sportTitle}</p>
                         </div>
                         <div class="flex items-center justify-between gap-2">
                            <div class="flex-1">
                               <p class="text-sm font-black text-white group-hover:text-white transition-colors leading-tight mb-0.5">${evt.homeTeam}</p>
                               <p class="text-sm font-black text-white group-hover:text-white transition-colors leading-tight">${evt.awayTeam}</p>
                            </div>
                            <div class="flex flex-col gap-1 items-end">
                               ${mkts.slice(0,3).map(m => `<span class="text-[7px] uppercase tracking-widest text-[#737373] bg-[#0a0a0a] px-1 py-0.5 rounded border border-[#262626]">${m}</span>`).join('')}
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
     if (type === 'market') this.currentFilterMarket = val;
     this.renderContent(document.getElementById('app-main'), window.sbState.getState().user?.name || 'Guilherme');
  }

  static handleSearch(e) {
     this.searchQuery = e.target.value;
     this.renderContent(document.getElementById('app-main'), window.sbState.getState().user?.name || 'Guilherme');
  }
}

window.DashboardView = DashboardView;
