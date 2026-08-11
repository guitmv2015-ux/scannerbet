/**
 * SCANNERBET DASHBOARD VIEW - FASE 13
 * Central de Descoberta com Autocomplete e Foco no Futebol Brasileiro
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

    if (!forceRefresh && this.allEvents && this.allEvents.length > 0) {
        this.renderContent(main);
        return;
    }

    main.className = "flex-1 w-full p-4 lg:p-6 min-h-[calc(100vh-5rem)] flex flex-col relative";

    main.innerHTML = `
      <div class="flex-1 flex flex-col items-center justify-center text-[#a3a3a3] text-sm animate-pulse">
        <svg class="animate-spin mb-4 h-10 w-10 text-[#06b6d4]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <span class="font-bold text-white text-base">Sincronizando Central de Descoberta...</span>
        <span class="text-xs mt-2 text-[#737373]">Carregando jogos Ao Vivo e Futuros</span>
      </div>
    `;

    try {
      this.allEvents = await window.EventsService.getMassiveEvents();
      this.currentFilterDate = 'all'; 
      this.currentFilterStatus = 'all'; 
      this.currentFilterSport = 'all'; 
      this.currentFilterMarket = 'all';
      this.searchQuery = '';
      this.lastUpdate = new Date();
      
      this.calculateRealOpportunities();
      this.renderContent(main);
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
     if (diff > 0) return { text: "ACIMA DA MÉDIA", color: "text-white", bg: "bg-[#404040]/30", dot: "bg-white" };
     return { text: "MONITORAR", color: "text-[#ef4444]", bg: "bg-red-500/10", dot: "bg-[#ef4444]" };
  }

  static calculateRealOpportunities() {
     this.opportunities = [];
     this.totalBookmakers = new Set();
     this.totalMarkets = new Set();
     
     this.allEvents.forEach(evt => {
         const markets = window.OddsProviderService.getNormalizedOddsForEvent(evt);
         if (!markets || markets.length === 0) return;
         
         evt.availableMarkets = markets.map(m => m.id);
         
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
                     
                     if (diff >= 0.5) { 
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

  static handleGlobalSearch(e) {
      const query = e.target.value.toLowerCase().trim();
      const dropdown = document.getElementById('global-search-dropdown');
      
      if (!query || query.length < 2) {
          dropdown.classList.add('hidden');
          return;
      }

      const results = this.allEvents.filter(evt => 
          evt.homeTeam.toLowerCase().includes(query) || 
          evt.awayTeam.toLowerCase().includes(query) ||
          (evt.sportTitle && evt.sportTitle.toLowerCase().includes(query))
      ).slice(0, 8);

      if (results.length > 0) {
          dropdown.innerHTML = results.map(r => {
             const isLive = r.status === 'AO VIVO';
             const dateStr = window.DateUtil ? window.DateUtil.formatEventDate(r.startTime) : new Date(r.startTime).toLocaleString();
             return `
             <div class="p-3 hover:bg-[#1a1a1a] cursor-pointer border-b border-[#262626] last:border-0 transition-colors flex items-center justify-between group" onclick="window.sbApp.navigateTo('scanner', { sportKey: '${r.sportKey}', eventId: '${r.id}' })">
                <div>
                   <p class="text-sm font-black text-white group-hover:text-[#06b6d4] transition-colors">${r.homeTeam} x ${r.awayTeam}</p>
                   <div class="flex items-center gap-2 mt-1">
                      <span class="text-[9px] bg-[#141414] text-[#a3a3a3] border border-[#333] px-1.5 py-0.5 rounded uppercase tracking-widest">${r.sportTitle}</span>
                      ${isLive ? '<span class="text-[9px] bg-red-500 text-white px-1.5 py-0.5 rounded font-black uppercase animate-pulse">AO VIVO</span>' : `<span class="text-[10px] text-[#737373]">${dateStr}</span>`}
                   </div>
                </div>
                <button class="bg-[#06b6d4]/10 text-[#06b6d4] group-hover:bg-[#06b6d4] group-hover:text-black px-3 py-1.5 rounded text-[9px] font-black uppercase tracking-widest transition-all">Ver Odds</button>
             </div>
          `}).join('');
          dropdown.classList.remove('hidden');
      } else {
          dropdown.innerHTML = `<div class="p-4 text-sm text-[#737373] text-center">Nenhum evento encontrado para "${query}"</div>`;
          dropdown.classList.remove('hidden');
      }
  }

  static categorizeEvents(events) {
      const now = new Date();
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);
      
      const tomorrow = new Date(endOfToday);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const live = [];
      const today = [];
      const upcoming = [];
      
      events.forEach(e => {
          if (e.status === 'AO VIVO') live.push(e);
          else if (e.startTime <= endOfToday.getTime()) today.push(e);
          else upcoming.push(e);
      });
      
      return { live, today, upcoming };
  }

  static renderEventCard(evt) {
       const dateStr = window.DateUtil ? window.DateUtil.formatEventDate(evt.startTime) : new Date(evt.startTime).toLocaleString();
       const isLive = evt.status === 'AO VIVO';
       const marketsAvail = evt.availableMarkets || [];
       
       let oddsHtml = '';
       const oddsData = window.OddsProviderService.getNormalizedOddsForEvent(evt);
       if (oddsData && oddsData.length > 0) {
           const mktMain = oddsData.find(m => m.id === 'h2h') || oddsData[0];
           if (mktMain && mktMain.selections.length > 0) {
               oddsHtml = `<div class="flex gap-2 w-full">`;
               mktMain.selections.slice(0, 3).forEach(sel => {
                   const bestOddVal = sel.bestOdd ? parseFloat(sel.bestOdd.odd).toFixed(2) : '-';
                   oddsHtml += `
                   <div class="flex-1 bg-[#0a0a0a] rounded border border-[#262626] p-2 flex flex-col items-center justify-center group-hover:border-[#06b6d4]/50 transition-colors">
                       <span class="text-[8px] uppercase tracking-widest text-[#737373] truncate w-full text-center mb-1">${sel.fullName}</span>
                       <span class="text-sm font-black ${sel.bestOdd ? 'text-[#a3e635]' : 'text-[#404040]'} font-mono leading-none">
                           ${sel.bestOdd ? '@' + bestOddVal : '-'}
                       </span>
                   </div>`;
               });
               oddsHtml += `</div>`;
           }
       }

       return `
       <div class="bg-gradient-to-br from-[#0f0f0f] to-[#141414] border border-[#262626] hover:border-emerald-500 shadow-lg rounded-xl p-5 flex flex-col justify-between group transition-all relative overflow-hidden transform hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(16,185,129,0.1)] h-full">
          ${isLive ? '<div class="absolute top-0 left-0 w-1.5 h-full bg-red-500"></div>' : '<div class="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>'}
          <div class="flex items-center justify-between mb-4 pl-2">
             <span class="text-[9px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded font-black uppercase tracking-widest shadow-md">${evt.sportTitle}</span>
             <div class="flex items-center gap-2">
                ${isLive ? '<span class="text-[9px] bg-red-500 text-white px-2 py-0.5 rounded uppercase font-black animate-pulse shadow-md">AO VIVO</span>' : ''}
                <span class="text-[10px] text-[#a3a3a3] font-mono group-hover:text-white transition-colors bg-[#0a0a0a] px-2 py-0.5 rounded border border-[#262626]">${dateStr}</span>
             </div>
          </div>
          
          <div class="pl-2 mb-5 flex-1 flex flex-col justify-center">
             <h3 class="text-xl font-black text-white leading-tight mb-1">${evt.homeTeam}</h3>
             <p class="text-xs font-bold text-[#737373] italic mb-1 px-1 w-fit rounded">vs</p>
             <h3 class="text-xl font-black text-white leading-tight">${evt.awayTeam}</h3>
          </div>

          <div class="pl-2 flex flex-wrap gap-1 mb-5">
             ${marketsAvail.slice(0,3).map(m => `<span class="text-[8px] uppercase tracking-widest text-[#a3a3a3] bg-[#1a1a1a] px-1.5 py-0.5 rounded border border-[#333]">${m}</span>`).join('')}
             ${marketsAvail.length > 3 ? `<span class="text-[8px] uppercase tracking-widest text-[#737373] bg-[#1a1a1a] px-1.5 py-0.5 rounded border border-[#333]">+${marketsAvail.length-3}</span>` : ''}
          </div>

          <div class="pl-2 mt-auto pt-4 border-t border-[#333]">
             <div class="mb-3">
                ${oddsHtml || `<p class="text-xs text-[#737373]">Calculando...</p>`}
             </div>
             <button onclick="window.sbApp.navigateTo('scanner', { sportKey: '${evt.sportKey}', eventId: '${evt.id}' })" class="w-full bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/30 text-emerald-500 hover:text-black px-4 py-3 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all">
                Ver Todas as Odds e Casas
             </button>
          </div>
       </div>
       `;
  }

  static renderContent(main) {
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    const tomorrow = new Date(endOfToday);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    let filteredEvents = this.allEvents;
    
    if (this.currentFilterDate === 'today') {
       filteredEvents = filteredEvents.filter(e => e.startTime <= endOfToday.getTime());
    } else if (this.currentFilterDate === 'tomorrow') {
       filteredEvents = filteredEvents.filter(e => e.startTime > endOfToday.getTime() && e.startTime <= tomorrow.getTime());
    } else if (this.currentFilterDate === '3days') {
       const d3 = new Date(endOfToday); d3.setDate(d3.getDate()+3);
       filteredEvents = filteredEvents.filter(e => e.startTime <= d3.getTime());
    }
    
    if (this.currentFilterStatus === 'live') {
       filteredEvents = filteredEvents.filter(e => e.status === 'AO VIVO');
    } else if (this.currentFilterStatus === 'pre') {
       filteredEvents = filteredEvents.filter(e => e.status !== 'AO VIVO');
    }

    if (this.currentFilterSport !== 'all') {
       filteredEvents = filteredEvents.filter(e => e.sportTitle === this.currentFilterSport || e.sportKey.includes(this.currentFilterSport));
    }

    if (this.currentFilterMarket !== 'all') {
       filteredEvents = filteredEvents.filter(e => e.availableMarkets && e.availableMarkets.includes(this.currentFilterMarket));
    }

    const updateTimeStr = this.lastUpdate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    // Calculate Win Rate and P&L
    const state = window.sbState.getState();
    const userPicks = state.user?.picks || [];
    const resolvedPicks = userPicks.filter(p => p.status === 'WON' || p.status === 'LOST');
    const winRate = resolvedPicks.length > 0 ? ((userPicks.filter(p => p.status === 'WON').length / resolvedPicks.length) * 100).toFixed(0) : '--';
    const picksProfit = userPicks.reduce((sum, p) => sum + (p.status === 'WON' ? ((p.odd * p.stake) - p.stake) : (p.status === 'LOST' ? -p.stake : 0)), 0);
    const picksStake = userPicks.reduce((sum, p) => sum + p.stake, 0);

    // Filtrar Eventos Brasileiros (Prioridade: Série A, B, Copa do Brasil ou qualquer coisa 'brazil')
    let primaryEvents = [];
    let secondaryEvents = [];
    let primaryTitle = '<span class="text-3xl">🇧🇷</span> Futebol Brasileiro';
    let emptyMessage = 'Sem partidas do Futebol Brasileiro disponíveis neste exato momento.';
    
    if (this.currentFilterSport === 'all') {
        primaryEvents = filteredEvents.filter(e => 
           e.sportKey.includes('soccer_brazil') || 
           (e.sportTitle && e.sportTitle.toLowerCase().includes('brazil')) ||
           (e.sportTitle && e.sportTitle.toLowerCase().includes('série a'))
        );
        secondaryEvents = filteredEvents.filter(e => !primaryEvents.includes(e));
    } else {
        primaryEvents = filteredEvents;
        secondaryEvents = [];
        primaryTitle = `<span class="text-3xl">🎯</span> ${this.currentFilterSport}`;
        emptyMessage = `Nenhuma partida encontrada para ${this.currentFilterSport}.`;
    }

    const brCategorized = this.categorizeEvents(primaryEvents);

    const renderFilterBtn = (type, val, label) => {
       const current = type === 'date' ? this.currentFilterDate : (type === 'status' ? this.currentFilterStatus : (type === 'market' ? this.currentFilterMarket : this.currentFilterSport));
       const isActive = current === val;
       return `<button onclick="window.DashboardView.setFilter('${type}', '${val}')" class="px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${isActive ? 'bg-[#06b6d4] text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'bg-[#141414] border border-[#262626] text-[#a3a3a3] hover:text-white hover:border-[#404040] whitespace-nowrap'}">${label}</button>`;
    };

    main.innerHTML = `
      <div class="max-w-[1600px] mx-auto w-full space-y-10 animate-in fade-in duration-500 pb-12" onclick="document.getElementById('global-search-dropdown').classList.add('hidden')">
        
        <!-- HEADER -->
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#262626] pb-5">
           <div>
              <h1 class="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                 SCANNERBET
                 <span class="px-2 py-0.5 bg-gradient-to-r from-[#06b6d4] to-blue-500 text-white rounded text-[10px] uppercase tracking-widest font-black shadow-lg">Central de Controle</span>
              </h1>
           </div>
           <div class="flex flex-wrap items-center gap-4 bg-[#0f0f0f] border border-[#262626] rounded-xl p-2 pr-4">
              <div class="px-3 border-r border-[#262626]">
                 <p class="text-[9px] uppercase tracking-widest text-[#737373] font-bold">Última Atualização</p>
                 <p class="text-xs text-white font-mono font-bold flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Hoje • ${updateTimeStr}</p>
              </div>
              <button onclick="window.DashboardView.render(true)" class="flex items-center gap-2 bg-[#1a1a1a] hover:bg-[#262626] border border-[#333] text-white px-4 py-1.5 rounded text-[10px] uppercase font-bold transition-all">
                 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-9.21l-3.23 2.15"></path></svg>
                 Atualizar Dados
              </button>
           </div>
        </div>

        <!-- VISÃO GERAL -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
           <div class="bg-[#0f0f0f] border border-[#262626] rounded-xl p-6 flex flex-col justify-center items-center relative overflow-hidden group hover:border-[#404040] transition-all">
              <div class="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity"><svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 22h20L12 2z"></path></svg></div>
              <span class="text-[10px] text-[#737373] uppercase font-black tracking-widest mb-2 z-10">Eventos Hoje</span>
              <span class="text-4xl font-black text-white font-mono z-10">${this.allEvents.filter(e => new Date(e.startTime) <= new Date(new Date().setHours(23,59,59,999))).length}</span>
           </div>
           <div class="bg-[#0f0f0f] border border-[#262626] rounded-xl p-6 flex flex-col justify-center items-center relative overflow-hidden group hover:border-[#404040] transition-all">
              <div class="absolute -right-4 -bottom-4 opacity-5 text-emerald-500 group-hover:opacity-10 transition-opacity"><svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg></div>
              <span class="text-[10px] text-[#737373] uppercase font-black tracking-widest mb-2 z-10">Casas Monitoradas</span>
              <span class="text-4xl font-black text-white font-mono z-10">${this.totalBookmakers ? this.totalBookmakers.size : 0}</span>
           </div>
           <div class="bg-[#0f0f0f] border border-[#262626] rounded-xl p-6 flex flex-col justify-center items-center relative overflow-hidden group hover:border-[#a3e635]/50 transition-all cursor-pointer" onclick="document.getElementById('oportunidades-section').scrollIntoView({behavior: 'smooth'})">
              <div class="absolute -right-4 -bottom-4 opacity-5 text-[#a3e635] group-hover:opacity-10 transition-opacity"><svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"></circle></svg></div>
              <span class="text-[10px] text-[#737373] uppercase font-black tracking-widest mb-2 z-10 flex items-center gap-1">Oportunidades <span class="w-1.5 h-1.5 rounded-full bg-[#a3e635] animate-pulse"></span></span>
              <span class="text-4xl font-black text-[#a3e635] font-mono z-10">${this.opportunities ? this.opportunities.length : 0}</span>
           </div>
           <div class="bg-[#0f0f0f] border border-[#262626] rounded-xl p-6 flex flex-col justify-center items-center relative overflow-hidden group hover:border-[#404040] transition-all cursor-pointer" onclick="window.sbApp.navigateTo('metrics')">
              <div class="absolute -right-4 -bottom-4 opacity-5 text-blue-500 group-hover:opacity-10 transition-opacity"><svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg></div>
              <span class="text-[10px] text-[#737373] uppercase font-black tracking-widest mb-2 z-10">Meu Win Rate</span>
              <span class="text-4xl font-black ${winRate !== '--' && winRate >= 50 ? 'text-[#06b6d4]' : (winRate !== '--' ? 'text-red-500' : 'text-white')} font-mono z-10">${winRate}${winRate !== '--' ? '%' : ''}</span>
           </div>
        </div>

        <!-- DESTAQUE GLOBAL DE BUSCA (AUTOCOMPLETE NATIVO) -->
        <div class="bg-gradient-to-r from-[#06b6d4]/10 to-blue-600/10 border border-[#262626] rounded-2xl p-6 md:p-10 relative overflow-visible flex flex-col items-center text-center shadow-lg">
           <h2 class="text-2xl md:text-3xl font-black text-white mb-2 relative z-10 tracking-tight">Buscar Partida Específica</h2>
           <p class="text-[#a3a3a3] text-sm md:text-base mb-6 relative z-10">Consulte o Scanner diretamente pelo nome do time ou liga.</p>
           
           <div class="relative w-full max-w-4xl z-50">
              <input type="text" id="global-search" placeholder="🔎 Ex: Flamengo, Brasileirão, Palmeiras, Premier League..."
                     class="w-full bg-[#0a0a0a]/90 backdrop-blur-md border-2 border-[#333] hover:border-[#404040] text-white text-lg rounded-2xl pl-14 pr-6 py-5 focus:border-[#06b6d4] focus:ring-4 focus:ring-[#06b6d4]/20 focus:outline-none transition-all shadow-inner"
                     onkeyup="window.DashboardView.handleGlobalSearch(event)"
                     onclick="event.stopPropagation()">
              <svg class="absolute left-5 top-5 text-[#06b6d4]" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              
              <!-- DROPDOWN DE RESULTADOS -->
              <div id="global-search-dropdown" class="absolute top-full left-0 w-full mt-3 bg-[#0f0f0f] border border-[#262626] rounded-xl shadow-2xl hidden z-[100] max-h-96 overflow-y-auto text-left custom-scrollbar overflow-hidden"></div>
           </div>
           
           <div class="mt-6 flex flex-wrap justify-center gap-2 z-10 relative">
              <span class="text-xs text-[#a3a3a3] font-bold mt-1.5 mr-2">Buscas Frequentes:</span>
              <button onclick="document.getElementById('global-search').value='Flamengo'; document.getElementById('global-search').dispatchEvent(new Event('keyup'));" class="text-xs bg-[#1a1a1a] border border-[#333] px-4 py-1.5 rounded-full text-white hover:border-[#06b6d4] hover:bg-[#06b6d4]/10 transition-colors font-bold">Flamengo</button>
              <button onclick="document.getElementById('global-search').value='Palmeiras'; document.getElementById('global-search').dispatchEvent(new Event('keyup'));" class="text-xs bg-[#1a1a1a] border border-[#333] px-4 py-1.5 rounded-full text-white hover:border-[#06b6d4] hover:bg-[#06b6d4]/10 transition-colors font-bold">Palmeiras</button>
              <button onclick="document.getElementById('global-search').value='Série A'; document.getElementById('global-search').dispatchEvent(new Event('keyup'));" class="text-xs bg-[#1a1a1a] border border-[#333] px-4 py-1.5 rounded-full text-white hover:border-[#06b6d4] hover:bg-[#06b6d4]/10 transition-colors font-bold">Brasileirão Série A</button>
              <button onclick="document.getElementById('global-search').value='Corinthians'; document.getElementById('global-search').dispatchEvent(new Event('keyup'));" class="text-xs bg-[#1a1a1a] border border-[#333] px-4 py-1.5 rounded-full text-white hover:border-[#06b6d4] hover:bg-[#06b6d4]/10 transition-colors font-bold">Corinthians</button>
           </div>
        </div>

        <!-- FILTROS (ESPORTE, DATA, STATUS, DESTAQUES) -->
        <div class="bg-[#0a0a0a] border border-[#262626] rounded-2xl p-4 flex flex-wrap items-center gap-6">
           <div class="flex items-center gap-3 w-full lg:w-auto overflow-x-auto no-scrollbar pb-1 lg:pb-0">
              <span class="text-[9px] text-[#737373] uppercase font-black tracking-widest min-w-max">Esporte:</span>
              ${renderFilterBtn('sport', 'all', 'Todos')}
              ${renderFilterBtn('sport', 'soccer_brazil', 'Futebol Brasileiro')}
              ${renderFilterBtn('sport', 'Brasileirão Série A', 'Brasileirão Série A')}
           </div>
           <div class="w-px h-8 bg-[#262626] hidden lg:block"></div>
           <div class="flex items-center gap-3 w-full lg:w-auto overflow-x-auto no-scrollbar pb-1 lg:pb-0">
              <span class="text-[9px] text-[#737373] uppercase font-black tracking-widest min-w-max">Tempo:</span>
              ${renderFilterBtn('status', 'live', 'Ao Vivo')}
              ${renderFilterBtn('date', 'today', 'Hoje')}
              ${renderFilterBtn('date', 'tomorrow', 'Amanhã')}
              ${renderFilterBtn('date', '3days', 'Próximos Jogos')}
           </div>
        </div>

        <!-- LISTAGEM PRINCIPAL -->
        <div class="space-y-6">
           <div class="flex items-center justify-between border-b-2 border-emerald-500/50 pb-3">
              <h2 class="text-2xl lg:text-3xl font-black text-white uppercase tracking-widest flex items-center gap-3">
                 ${primaryTitle}
              </h2>
              <div class="flex items-center gap-3">
                 <span class="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded border border-emerald-500/30 uppercase tracking-widest">
                    Central Principal
                 </span>
              </div>
           </div>
           
           ${primaryEvents.length === 0 ? `
              <div class="bg-[#0a0a0a] border border-dashed border-[#333] rounded-2xl p-12 flex flex-col items-center justify-center text-center">
                 <p class="text-white font-black mb-2 text-xl">${emptyMessage}</p>
                 <p class="text-[#737373]">As casas de apostas monitoradas pela API ainda não liberaram as cotações para estes jogos.</p>
              </div>
           ` : `
              <!-- AO VIVO -->
              ${brCategorized.live.length > 0 ? `
              <div class="space-y-4 mb-8">
                 <h3 class="text-sm font-black text-red-500 uppercase tracking-widest flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> Ao Vivo Agora</h3>
                 <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    ${brCategorized.live.map(evt => this.renderEventCard(evt)).join('')}
                 </div>
              </div>` : ''}
              
              <!-- HOJE -->
              ${brCategorized.today.length > 0 ? `
              <div class="space-y-4 mb-8">
                 <h3 class="text-sm font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">Jogos de Hoje</h3>
                 <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    ${brCategorized.today.map(evt => this.renderEventCard(evt)).join('')}
                 </div>
              </div>` : ''}
              
              <!-- PRÓXIMOS JOGOS -->
              ${brCategorized.upcoming.length > 0 ? `
              <div class="space-y-4 mb-8">
                 <h3 class="text-sm font-black text-[#a3a3a3] uppercase tracking-widest flex items-center gap-2">Próximos Jogos</h3>
                 <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    ${brCategorized.upcoming.map(evt => this.renderEventCard(evt)).join('')}
                 </div>
              </div>` : ''}
           `}
        </div>

        <div id="oportunidades-section" class="grid grid-cols-1 xl:grid-cols-3 gap-8 scroll-mt-24">
          
          <!-- ⭐ MELHORES ODDS DA RODADA (Substituindo 'Oportunidades em Destaque') -->
          <div class="xl:col-span-2 flex flex-col space-y-6">
             <div class="flex items-center justify-between border-b border-[#262626] pb-3">
                <h2 class="text-xl font-black text-white flex items-center gap-2 uppercase tracking-widest">⭐ Melhores Cotações Encontradas</h2>
                <span class="text-[10px] text-[#737373] font-bold uppercase tracking-widest">Global</span>
             </div>
             
             <div class="space-y-4">
                ${this.opportunities.length === 0 ? `
                   <div class="bg-[#0a0a0a] border border-dashed border-[#333] rounded-2xl p-10 text-center">
                      <p class="text-[#737373] text-sm">Nenhuma cotação substancialmente acima da média encontrada neste momento.</p>
                   </div>
                ` : ''}
                
                ${this.opportunities.slice(0, 10).map((opp) => {
                   const dateStr = window.DateUtil ? window.DateUtil.formatEventDate(opp.event.startTime) : new Date(opp.event.startTime).toLocaleString();
                   return `
                   <div class="bg-[#0a0a0a] border border-[#262626] hover:border-[#06b6d4]/50 shadow-lg rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all group">
                      <div class="flex-1">
                         <div class="flex flex-wrap items-center gap-3 mb-4">
                            <span class="text-[9px] bg-[#141414] text-[#06b6d4] border border-[#262626] px-2 py-1 rounded uppercase font-black tracking-widest">${opp.event.sportTitle}</span>
                            <span class="text-[10px] text-[#737373] font-mono font-bold">${dateStr}</span>
                            <span class="text-[9px] font-bold text-[#a3a3a3] bg-[#141414] px-2 py-1 rounded flex items-center gap-1.5 border border-[#333]"><span class="w-1.5 h-1.5 rounded-full ${opp.classification.dot}"></span> Cotação Acima da Média</span>
                         </div>
                         <h3 class="text-lg font-black text-white mb-3 leading-tight">${opp.event.homeTeam} <span class="text-[#737373] font-normal mx-2">x</span> ${opp.event.awayTeam}</h3>
                         <div class="flex items-center gap-3 text-sm bg-[#141414] p-2 rounded-lg border border-[#262626] w-fit">
                            <span class="text-[10px] uppercase tracking-widest text-[#a3a3a3] font-black">${opp.market.name}</span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#404040" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                            <span class="text-[#06b6d4] font-black tracking-wide">${opp.selection.fullName}</span>
                         </div>
                      </div>
                      
                      <div class="flex items-center gap-6 bg-[#0f0f0f] p-4 rounded-xl border border-[#1a1a1a] shadow-inner">
                         <div class="text-left border-r border-[#262626] pr-6">
                            <p class="text-[9px] text-[#737373] uppercase tracking-widest font-bold mb-2">Odd Média</p>
                            <p class="text-lg font-black text-[#a3a3a3] font-mono">@${opp.avg}</p>
                         </div>
                         <div class="text-left min-w-[110px]">
                            <p class="text-[9px] text-white uppercase tracking-widest font-black mb-2 flex items-center gap-1">Maior Odd <span class="bg-[#262626] px-1 rounded text-[#a3a3a3]">${opp.bestOddObj.bookmaker}</span></p>
                            <div class="flex items-end gap-2">
                               <p class="text-3xl font-black text-[#a3e635] font-mono leading-none drop-shadow-md">@${parseFloat(opp.bestOddObj.odd).toFixed(2)}</p>
                            </div>
                            <p class="text-[9px] font-black text-emerald-400 mt-2 flex items-center justify-start gap-1 uppercase tracking-widest"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg> +${opp.diff}% DIF</p>
                         </div>
                      </div>
                      
                      <div>
                         <button onclick="window.sbApp.navigateTo('scanner', { sportKey: '${opp.event.sportKey}', eventId: '${opp.event.id}' })" class="w-full md:w-auto bg-[#1a1a1a] hover:bg-[#06b6d4] text-white hover:text-black border border-[#333] hover:border-[#06b6d4] px-6 py-4 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all whitespace-nowrap shadow-lg">
                            Ver Comparativo
                         </button>
                      </div>
                   </div>
                `}).join('')}
             </div>
          </div>

          <!-- MINHA ATIVIDADE E DESEMPENHO -->
          <div class="flex flex-col space-y-6">
             <div class="flex items-center justify-between border-b border-[#262626] pb-3">
                <h2 class="text-xl font-black text-white uppercase tracking-widest">Minha Atividade</h2>
                <button onclick="window.sbApp.navigateTo('history')" class="text-[10px] text-[#06b6d4] hover:text-white uppercase tracking-widest font-black transition-colors">Ver Relatório</button>
             </div>

             <!-- Meu Desempenho (Mini) -->
             <div class="grid grid-cols-2 gap-3 mb-2">
                <div class="bg-[#0f0f0f] border border-[#262626] rounded-xl p-3 text-center">
                   <p class="text-[9px] text-[#737373] uppercase tracking-widest font-bold">ROI Geral</p>
                   <p class="text-lg font-black ${winRate !== '--' && winRate >= 5 ? 'text-[#a3e635]' : (winRate !== '--' ? 'text-red-500' : 'text-white')} font-mono">
                      ${userPicks.length > 0 ? (picksProfit / picksStake * 100).toFixed(1) + '%' : '--%'}
                   </p>
                </div>
                <div class="bg-[#0f0f0f] border border-[#262626] rounded-xl p-3 text-center">
                   <p class="text-[9px] text-[#737373] uppercase tracking-widest font-bold">P&L</p>
                   <p class="text-lg font-black ${picksProfit >= 0 ? 'text-[#a3e635]' : 'text-red-500'} font-mono">
                      ${userPicks.length > 0 ? (picksProfit >= 0 ? '+' : '') + 'R$' + picksProfit.toFixed(0) : '--'}
                   </p>
                </div>
                <div class="bg-[#0f0f0f] border border-[#262626] rounded-xl p-3 text-center">
                   <p class="text-[9px] text-[#737373] uppercase tracking-widest font-bold">Greens</p>
                   <p class="text-lg font-black text-[#a3e635] font-mono">${userPicks.filter(p=>p.status==='WON').length}</p>
                </div>
                <div class="bg-[#0f0f0f] border border-[#262626] rounded-xl p-3 text-center">
                   <p class="text-[9px] text-[#737373] uppercase tracking-widest font-bold">Reds</p>
                   <p class="text-lg font-black text-red-500 font-mono">${userPicks.filter(p=>p.status==='LOST').length}</p>
                </div>
             </div>

             <!-- Últimos Palpites -->
             <div class="bg-[#0a0a0a] border border-[#262626] rounded-2xl overflow-hidden flex flex-col h-[400px]">
                <div class="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                   ${userPicks.length === 0 ? '<div class="text-center text-[#737373] text-sm p-6">Nenhum palpite salvo.</div>' : ''}
                   
                   ${[...userPicks].sort((a,b)=>b.timestamp-a.timestamp).slice(0, 10).map((pick) => {
                      const isPending = pick.status === 'PENDING';
                      return `
                      <div class="bg-[#141414] border border-[#262626] hover:border-[#06b6d4]/50 rounded-xl p-4 transition-colors group relative overflow-hidden">
                         <div class="absolute top-0 left-0 w-1 h-full ${isPending ? 'bg-[#737373]' : (pick.status === 'WON' ? 'bg-[#a3e635]' : 'bg-red-500')}"></div>
                         <div class="pl-2">
                            <div class="flex items-center justify-between mb-2">
                               <span class="text-[10px] text-[#a3a3a3] font-mono font-bold">${new Date(pick.timestamp).toLocaleDateString('pt-BR')}</span>
                               <span class="text-[9px] uppercase font-black tracking-widest ${isPending ? 'text-[#737373]' : (pick.status === 'WON' ? 'text-[#a3e635]' : 'text-red-500')}">${isPending ? 'PENDENTE' : (pick.status === 'WON' ? 'GANHOU' : 'PERDEU')}</span>
                            </div>
                            <div class="mb-2">
                                <p class="text-[11px] font-black text-white group-hover:text-[#06b6d4] transition-colors leading-tight">${pick.eventName}</p>
                            </div>
                            <div class="flex items-center justify-between">
                                <p class="text-[10px] font-black text-white uppercase tracking-widest bg-[#1a1a1a] px-2 py-1 rounded border border-[#333]">${pick.selection} <span class="text-[#06b6d4] font-mono ml-1">@${parseFloat(pick.odd).toFixed(2)}</span></p>
                                <button onclick="window.sbApp.navigateTo('scanner', { sportKey: '${pick.sportKey || 'soccer_brazil_campeonato'}', eventId: '${pick.eventId || ''}' })" class="text-[9px] text-white hover:text-black bg-[#262626] hover:bg-[#06b6d4] px-2 py-1 rounded font-black uppercase tracking-widest transition-colors border border-[#404040]">Analisar</button>
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
     this.renderContent(document.getElementById('app-main'));
  }
}

window.DashboardView = DashboardView;
