/**
 * SCANNERBET DASHBOARD VIEW - FASE 8
 * Ambiente Privado com Esportes Dinâmicos da API e Autocomplete no Cache.
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

    if (!forceRefresh && this.allEvents && this.allEvents.length > 0 && this.activeSports) {
        this.renderContent(main);
        return;
    }

    main.className = "flex-1 w-full p-4 lg:p-6 min-h-[calc(100vh-5rem)] flex flex-col relative";

    main.innerHTML = `
      <div class="flex-1 flex flex-col items-center justify-center text-[#a3a3a3] text-sm animate-pulse">
        <svg class="animate-spin mb-4 h-10 w-10 text-[#06b6d4]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <span class="font-bold text-white text-base">Sincronizando Central Esportiva...</span>
        <span class="text-xs mt-2 text-[#737373]">Obtendo lista de esportes e campeonatos ativos...</span>
      </div>
    `;

    try {
      // 1. Busca esportes dinâmicos da API primeiro
      this.activeSports = await window.EventsService.getActiveSports();
      // Remove outrights for simplicity in dashboard
      this.validSports = this.activeSports.filter(s => !s.hasOutrights && !s.key.includes('_winner') && !s.key.includes('_outrights'));
      
      // Agrupar por esporte base (ex: soccer, basketball) para facilitar a UI
      this.sportsGroups = this._groupSports(this.validSports);

      this.currentFilterDate = 'all'; 
      this.currentFilterStatus = 'all'; 
      this.currentFilterSportGroup = 'soccer'; // Padrão: Futebol
      this.currentFilterSportKey = 'all'; // Todos daquele grupo
      this.searchQuery = '';
      this.lastUpdate = new Date();
      
      // Carrega os eventos apenas do esporte/grupo padrao
      await this.loadEventsForCurrentGroup();

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

  static _groupSports(sports) {
      const groups = new Map();
      sports.forEach(s => {
          const groupName = s.group.toLowerCase();
          const baseType = groupName.includes('soccer') || groupName.includes('futebol') ? 'soccer' :
                           groupName.includes('basketball') ? 'basketball' :
                           groupName.includes('tennis') ? 'tennis' :
                           groupName.includes('hockey') ? 'hockey' :
                           groupName.includes('american football') ? 'american_football' :
                           groupName.includes('mixed martial arts') || groupName.includes('mma') ? 'mma' : 'other';
          
          if (!groups.has(baseType)) {
              groups.set(baseType, { id: baseType, name: this._translateGroup(baseType), keys: [] });
          }
          groups.get(baseType).keys.push(s);
      });
      return Array.from(groups.values()).sort((a,b) => b.keys.length - a.keys.length); 
  }

  static _translateGroup(baseType) {
      const dict = {
          'soccer': '⚽ Futebol',
          'basketball': '🏀 Basquete',
          'tennis': '🎾 Tênis',
          'hockey': '🏒 Hóquei',
          'american_football': '🏈 Futebol Americano',
          'mma': '🥊 MMA',
          'other': '🎯 Outros'
      };
      return dict[baseType] || '🎯 Outros';
  }

  static async loadEventsForCurrentGroup() {
      const main = document.getElementById('app-main');
      if (!this.allEvents) {
          
      } else if (main) {
          main.style.opacity = '0.5';
          main.style.pointerEvents = 'none';
      }

      try {
          let keysToFetch = [];
          if (this.currentFilterSportKey !== 'all') {
             keysToFetch = [this.currentFilterSportKey];
          } else {
             const groupObj = this.sportsGroups.find(g => g.id === this.currentFilterSportGroup);
             if (groupObj) {
                 keysToFetch = groupObj.keys.map(s => s.key);
             }
          }

          if (keysToFetch.length === 0) keysToFetch = ['soccer_brazil_campeonato']; // Fallback
          
          this.allEvents = await window.EventsService.getMassiveEvents(keysToFetch);
          this.calculateRealOpportunities();
          
          if (main) {
             main.style.opacity = '1';
             main.style.pointerEvents = 'auto';
             this.renderContent(main);
          }
      } catch (e) {
          console.error(e);
          if (main) {
             main.style.opacity = '1';
             main.style.pointerEvents = 'auto';
             window.Toast.show('Erro ao carregar eventos do esporte.', 'error');
          }
      }
  }

  static setSportGroup(groupId) {
      this.currentFilterSportGroup = groupId;
      this.currentFilterSportKey = 'all'; 
      this.displayedEventsLimit = 12;
      this.loadEventsForCurrentGroup();
  }

  static setSportKey(key) {
      this.currentFilterSportKey = key;
      this.displayedEventsLimit = 12;
      this.loadEventsForCurrentGroup();
  }

  static setFilter(type, val) {
      if (type === 'date') this.currentFilterDate = val;
      if (type === 'status') this.currentFilterStatus = val;
      this.displayedEventsLimit = 12;
      this.renderContent(document.getElementById('app-main'));
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

      // Autocomplete a partir dos allEvents já cacheados
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
          dropdown.innerHTML = `<div class="p-4 text-sm text-[#737373] text-center">Nenhum evento encontrado para "${query}". Tente mudar de esporte.</div>`;
          dropdown.classList.remove('hidden');
      }
  }

  static renderEventCard(evt) {
       const dateStr = window.DateUtil ? window.DateUtil.formatEventDate(evt.startTime) : new Date(evt.startTime).toLocaleString();
       const isLive = evt.status === 'AO VIVO';
       const marketsAvail = evt.availableMarkets || [];
       
       let oddsHtml = '';
       const oddsData = window.OddsProviderService.getNormalizedOddsForEvent(evt);
       let totalBookies = 0;
       let totalMarkets = oddsData ? oddsData.length : 0;
       
       if (oddsData && oddsData.length > 0) {
           const allBookiesSet = new Set();
           oddsData.forEach(m => {
               if(m.selections) m.selections.forEach(s => {
                   if(s.allOdds) s.allOdds.forEach(o => allBookiesSet.add(o.bookmakerKey));
               });
           });
           totalBookies = allBookiesSet.size;
           
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
          
          <div class="pl-2 mb-4 flex-1 flex flex-col justify-center">
             <h3 class="text-xl font-black text-white leading-tight mb-1">${evt.homeTeam}</h3>
             <p class="text-xs font-bold text-[#737373] italic mb-1 px-1 w-fit rounded">vs</p>
             <h3 class="text-xl font-black text-white leading-tight">${evt.awayTeam}</h3>
          </div>
          
          <div class="pl-2 mb-3 flex gap-4 text-[9px] uppercase tracking-widest text-[#737373] font-black">
             <span>${totalBookies} CASAS</span>
             <span>${totalMarkets} MERCADOS</span>
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
    } else if (this.currentFilterDate === '7days') {
       const d7 = new Date(endOfToday); d7.setDate(d7.getDate()+7);
       filteredEvents = filteredEvents.filter(e => e.startTime <= d7.getTime());
    }
    
    if (this.currentFilterStatus === 'live') {
       filteredEvents = filteredEvents.filter(e => e.status === 'AO VIVO');
    } else if (this.currentFilterStatus === 'pre') {
       filteredEvents = filteredEvents.filter(e => e.status !== 'AO VIVO');
    }

    const updateTimeStr = this.lastUpdate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    // Estatísticas Pessoais
    const state = window.sbState.getState();
    const userPicks = state.user?.picks || [];
    const resolvedPicks = userPicks.filter(p => p.status === 'WON' || p.status === 'LOST');
    const winRate = resolvedPicks.length > 0 ? ((userPicks.filter(p => p.status === 'WON').length / resolvedPicks.length) * 100).toFixed(0) : '--';
    
    const currentGroupData = this.sportsGroups.find(g => g.id === this.currentFilterSportGroup);
    
    // Renderização dos cards de grupos de esportes
    const sportsCardsHtml = this.sportsGroups.map(g => {
        const isActive = this.currentFilterSportGroup === g.id;
        return `
        <button onclick="window.DashboardView.setSportGroup('${g.id}')" 
           class="min-w-max px-5 py-3 rounded-xl border transition-all flex items-center gap-2 ${isActive ? 'bg-[#06b6d4] border-[#06b6d4] text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'bg-[#141414] border-[#262626] text-[#a3a3a3] hover:text-white hover:border-[#404040]'}">
           <span class="font-black tracking-widest text-[10px] uppercase">${g.name}</span>
           <span class="bg-black/20 text-current px-1.5 py-0.5 rounded font-mono text-[9px]">${g.keys.length}</span>
        </button>
        `;
    }).join('');

    // Renderização das ligas/campeonatos (sport keys) daquele grupo
    const leaguesHtml = `<button onclick="window.DashboardView.setSportKey('all')" class="px-3 py-1.5 rounded text-[10px] uppercase font-bold transition-all ${this.currentFilterSportKey === 'all' ? 'bg-[#404040] text-white' : 'text-[#737373] hover:text-white'}">Principais</button>` +
        (currentGroupData ? currentGroupData.keys.map(k => `
        <button onclick="window.DashboardView.setSportKey('${k.key}')" class="px-3 py-1.5 rounded text-[10px] uppercase font-bold transition-all whitespace-nowrap ${this.currentFilterSportKey === k.key ? 'bg-[#404040] text-white' : 'text-[#737373] hover:text-white'}">
            ${k.title}
        </button>
    `).join('') : '');

    const renderFilterBtn = (type, val, label) => {
       const current = type === 'date' ? this.currentFilterDate : this.currentFilterStatus;
       const isActive = current === val;
       return `<button onclick="window.DashboardView.setFilter('${type}', '${val}')" class="px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${isActive ? 'bg-[#06b6d4] text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'bg-[#141414] border border-[#262626] text-[#a3a3a3] hover:text-white hover:border-[#404040] whitespace-nowrap'}">${label}</button>`;
    };

    this.displayedEventsLimit = this.displayedEventsLimit || 12;
    const paginatedEvents = filteredEvents.slice(0, this.displayedEventsLimit);
    const hasMoreEvents = filteredEvents.length > this.displayedEventsLimit;

    window.DashboardView.loadMoreEvents = () => {
        this.displayedEventsLimit += 12;
        this.renderContent(document.getElementById('app-main'));
    };

    main.innerHTML = `
      <div class="max-w-[1600px] mx-auto w-full space-y-8 animate-in fade-in duration-500 pb-12" onclick="document.getElementById('global-search-dropdown').classList.add('hidden')">
        
        <!-- HEADER -->
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#262626] pb-5">
           <div>
              <h1 class="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                 SCANNERBET
                 <span class="px-2 py-0.5 bg-gradient-to-r from-[#06b6d4] to-blue-500 text-white rounded text-[10px] uppercase tracking-widest font-black shadow-lg">Central Esportiva</span>
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

        <!-- ESPORTES MONITORADOS E ESTATISTICAS GERAIS -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
           <div class="bg-[#0f0f0f] border border-[#262626] rounded-xl p-6 flex flex-col justify-center items-center relative overflow-hidden group hover:border-[#404040] transition-all">
              <div class="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity"><svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 22h20L12 2z"></path></svg></div>
              <span class="text-[10px] text-[#737373] uppercase font-black tracking-widest mb-2 z-10">Total de Eventos (<span class="text-white">${currentGroupData?currentGroupData.name:'N/A'}</span>)</span>
              <span class="text-4xl font-black text-white font-mono z-10">${this.allEvents.length}</span>
           </div>
           <div class="bg-[#0f0f0f] border border-[#262626] rounded-xl p-6 flex flex-col justify-center items-center relative overflow-hidden group hover:border-[#404040] transition-all">
              <div class="absolute -right-4 -bottom-4 opacity-5 text-[#06b6d4] group-hover:opacity-10 transition-opacity"><svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg></div>
              <span class="text-[10px] text-[#737373] uppercase font-black tracking-widest mb-2 z-10">Casas Encontradas</span>
              <span class="text-4xl font-black text-white font-mono z-10">${this.totalBookmakers ? this.totalBookmakers.size : 0}</span>
           </div>
           <div class="bg-[#0f0f0f] border border-[#262626] rounded-xl p-6 flex flex-col justify-center items-center relative overflow-hidden group hover:border-[#a3e635]/50 transition-all cursor-pointer" onclick="document.getElementById('oportunidades-section')?.scrollIntoView({behavior: 'smooth'})">
              <div class="absolute -right-4 -bottom-4 opacity-5 text-[#a3e635] group-hover:opacity-10 transition-opacity"><svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"></circle></svg></div>
              <span class="text-[10px] text-[#737373] uppercase font-black tracking-widest mb-2 z-10 flex items-center gap-1">Oportunidades de Margem <span class="w-1.5 h-1.5 rounded-full bg-[#a3e635] animate-pulse"></span></span>
              <span class="text-4xl font-black text-[#a3e635] font-mono z-10">${this.opportunities ? this.opportunities.length : 0}</span>
           </div>
           <div class="bg-[#0f0f0f] border border-[#262626] rounded-xl p-6 flex flex-col justify-center items-center relative overflow-hidden group hover:border-[#404040] transition-all cursor-pointer" onclick="window.sbApp.navigateTo('metrics')">
              <div class="absolute -right-4 -bottom-4 opacity-5 text-blue-500 group-hover:opacity-10 transition-opacity"><svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg></div>
              <span class="text-[10px] text-[#737373] uppercase font-black tracking-widest mb-2 z-10">Meu Win Rate</span>
              <span class="text-4xl font-black ${winRate !== '--' && winRate >= 50 ? 'text-[#06b6d4]' : (winRate !== '--' ? 'text-red-500' : 'text-white')} font-mono z-10">${winRate}${winRate !== '--' ? '%' : ''}</span>
           </div>
        </div>

        <!-- AUTOCOMPLETE E PESQUISA INTELIGENTE NO CACHE -->
        <div class="bg-gradient-to-r from-[#0a0a0a] to-[#141414] border border-[#262626] rounded-2xl p-6 relative flex flex-col items-center text-center">
           <h2 class="text-xl md:text-2xl font-black text-white mb-2 relative z-10 tracking-tight">Buscar Partida</h2>
           <p class="text-[#a3a3a3] text-xs md:text-sm mb-4 relative z-10">Procure times ou campeonatos nos eventos de ${currentGroupData ? currentGroupData.name : 'Esporte'}. (Sem requisições extras)</p>
           
           <div class="relative w-full max-w-2xl z-50">
              <input type="text" id="global-search" placeholder="🔎 Ex: Palmeiras, Lakers, Real Madrid..."
                     class="w-full bg-[#0a0a0a] border border-[#333] hover:border-[#404040] text-white text-base rounded-xl pl-12 pr-4 py-4 focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/20 focus:outline-none transition-all shadow-inner"
                     onkeyup="window.DashboardView.handleGlobalSearch(event)"
                     onclick="event.stopPropagation()">
              <svg class="absolute left-4 top-4 text-[#06b6d4]" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              
              <!-- DROPDOWN DE RESULTADOS (IN-MEMORY) -->
              <div id="global-search-dropdown" class="absolute top-full left-0 w-full mt-2 bg-[#141414] border border-[#262626] rounded-xl shadow-2xl hidden z-[100] max-h-80 overflow-y-auto text-left custom-scrollbar overflow-hidden"></div>
           </div>
        </div>

        <!-- FILTRO DINÂMICO DE ESPORTES (NOVA ARQUITETURA DA FASE 8) -->
        <div>
           <h3 class="text-[10px] text-[#737373] uppercase font-black tracking-widest mb-3">Esportes Disponíveis</h3>
           <div class="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
              ${sportsCardsHtml}
           </div>
           
           <div class="mt-4 bg-[#0a0a0a] border border-[#262626] rounded-lg p-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span class="text-[9px] text-[#a3a3a3] uppercase font-black tracking-widest pl-2 pr-1 border-r border-[#333]">Campeonatos</span>
              ${leaguesHtml}
           </div>
        </div>

        <!-- FILTROS DE TEMPO/STATUS -->
        <div class="bg-[#0a0a0a] border border-[#262626] rounded-2xl p-4 flex flex-wrap items-center gap-6">
           <div class="flex items-center gap-3 w-full lg:w-auto overflow-x-auto no-scrollbar pb-1 lg:pb-0">
              <span class="text-[9px] text-[#737373] uppercase font-black tracking-widest min-w-max">Status / Data:</span>
              ${renderFilterBtn('status', 'all', 'Todos')}
              ${renderFilterBtn('status', 'live', 'Ao Vivo')}
              ${renderFilterBtn('date', 'today', 'Hoje')}
              ${renderFilterBtn('date', 'tomorrow', 'Amanhã')}
              ${renderFilterBtn('date', '3days', 'Próximos 3 Dias')}
              ${renderFilterBtn('date', '7days', 'Próximos 7 Dias')}
           </div>
        </div>

        <!-- LISTAGEM PRINCIPAL -->
        <div class="space-y-6">
           ${paginatedEvents.length > 0 ? `
           <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              ${paginatedEvents.map(e => this.renderEventCard(e)).join('')}
           </div>
           ${hasMoreEvents ? `
           <div class="flex justify-center mt-6">
               <button onclick="window.DashboardView.loadMoreEvents()" class="bg-[#1a1a1a] hover:bg-[#262626] border border-[#333] hover:border-[#06b6d4] text-white px-8 py-3 rounded-xl text-[10px] uppercase font-black tracking-widest transition-all shadow-md">
                   Carregar Mais Eventos (${filteredEvents.length - this.displayedEventsLimit} restantes)
               </button>
           </div>
           ` : ''}
           ` : `
           <div class="bg-[#0f0f0f] border border-[#262626] rounded-xl p-12 text-center flex flex-col items-center justify-center">
               <svg class="w-16 h-16 text-[#333] mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
               <h3 class="text-xl font-bold text-white mb-2">Nenhum evento encontrado</h3>
               <p class="text-sm text-[#737373]">Tente mudar os filtros de Status, Data ou Esporte.</p>
           </div>
           `}
        </div>
      </div>
    `;
  }
}

window.DashboardView = DashboardView;

