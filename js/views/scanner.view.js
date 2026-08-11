/**
 * SCANNERBET SCANNER VIEW - FASE 14
 * Terminal Profissional de Comparação de Odds Multimercado
 */

class ScannerView {
  static async render(params, forceRefresh = false) {
    const main = document.getElementById('app-main');
    if (!main) return;

    if (!forceRefresh) {
      main.innerHTML = `
        <div class="flex-1 w-full p-4 flex flex-col items-center justify-center min-h-[calc(100vh-5rem)]">
          <div class="w-12 h-12 border-4 border-[#262626] border-t-[#06b6d4] rounded-full animate-spin mb-4"></div>
          <span class="text-sm font-black text-white uppercase tracking-widest">Sincronizando Terminal...</span>
          <span class="text-[10px] text-[#737373] mt-2">Buscando cotações e mercados reais na The Odds API</span>
        </div>
      `;
    }

    try {
      this.allEvents = await window.EventsService.getMassiveEvents();
      
      let targetSport = params && params.sportKey ? params.sportKey : null;
      let targetEventId = params && params.eventId ? params.eventId : null;

      // Fase 14: Se não houver evento selecionado, mostra a Central de Pesquisa
      if (!targetEventId) {
          this.initSearchCentralFilters();
          this.renderSearchCentral(main);
          return;
      }

      this.currentEvent = this.allEvents.find(e => e.id === targetEventId);
      if (!this.currentEvent || forceRefresh) {
          this.currentEvent = await window.EventsService.getEventById(targetSport, targetEventId, forceRefresh);
      }
      if (!this.currentEvent) throw new Error("Evento não encontrado");

      this.normalizedMarkets = window.OddsProviderService.getNormalizedOddsForEvent(this.currentEvent);
      
      if (this.normalizedMarkets.length > 0 && !this.normalizedMarkets.find(m => m.id === this.activeTab) && this.activeTab !== 'overview') {
          this.activeTab = 'overview';
      } else if (!this.activeTab) {
          this.activeTab = 'overview';
      }

      this.activeLines = this.activeLines || {}; 
      this.autoRefreshInterval = this.autoRefreshInterval || 0; // 0 = off

      this.calculateOtherOpportunities();
      this.renderFullScanner(main);
      this.setupAutoRefresh();
      
    } catch (error) {
       console.error(error);
       main.innerHTML = `
         <div class="p-8 text-center bg-[#0a0a0a] border border-[#262626] rounded-xl max-w-2xl mx-auto mt-10 shadow-2xl">
            <h3 class="text-red-500 font-black mb-2 uppercase tracking-widest">Erro de Sincronização</h3>
            <p class="text-sm text-[#a3a3a3] mb-6">${error.message || 'Falha ao carregar as matrizes.'}</p>
            <p class="text-xs text-[#a3a3a3] mb-6 whitespace-pre-wrap font-mono text-left bg-black p-4 rounded border border-red-500 overflow-x-auto">${error.stack}</p>
            <p class="text-xs text-[#404040] mb-6">Verifique a comunicação com The Odds API.</p>
            <button onclick="window.ScannerView.render({}, true)" class="bg-[#1a1a1a] hover:bg-emerald-500 hover:text-black border border-[#333] hover:border-emerald-500 text-emerald-500 font-black text-xs uppercase tracking-widest px-8 py-3 rounded-lg transition-colors">Tentar Novamente</button>
         </div>
       `;
    }
  }

  // =========================================================================================
  // CENTRAL DE PESQUISA (Quando nenhum evento é selecionado)
  // =========================================================================================

  static initSearchCentralFilters() {
      this.scSearchQuery = this.scSearchQuery || '';
      this.scFilterSport = this.scFilterSport || 'all';
      this.scFilterLeague = this.scFilterLeague || 'all';
      this.scFilterDate = this.scFilterDate || 'all';
      this.scFilterStatus = this.scFilterStatus || 'all';
      this.scFilterSort = this.scFilterSort || 'best_odd'; // best_odd, most_bookies, most_markets
  }

  static applySearchCentralFilters() {
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);
      const tomorrow = new Date(endOfToday);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const d3 = new Date(endOfToday); d3.setDate(d3.getDate()+3);
      const d7 = new Date(endOfToday); d7.setDate(d7.getDate()+7);

      let results = this.allEvents;

      // Global text search (teams, leagues)
      if (this.scSearchQuery.length >= 2) {
          const q = this.scSearchQuery.toLowerCase();
          results = results.filter(e => 
              e.homeTeam.toLowerCase().includes(q) || 
              e.awayTeam.toLowerCase().includes(q) || 
              (e.sportTitle && e.sportTitle.toLowerCase().includes(q))
          );
      }

      // Advanced Filters
      if (this.scFilterSport !== 'all') {
          results = results.filter(e => e.sportTitle === this.scFilterSport);
      }
      if (this.scFilterLeague !== 'all') {
          results = results.filter(e => e.sportTitle === this.scFilterLeague);
      }
      if (this.scFilterStatus === 'live') {
          results = results.filter(e => e.status === 'AO VIVO');
      } else if (this.scFilterStatus === 'pre') {
          results = results.filter(e => e.status !== 'AO VIVO');
      }
      
      if (this.scFilterDate === 'today') results = results.filter(e => e.startTime <= endOfToday.getTime());
      if (this.scFilterDate === 'tomorrow') results = results.filter(e => e.startTime > endOfToday.getTime() && e.startTime <= tomorrow.getTime());
      if (this.scFilterDate === '3days') results = results.filter(e => e.startTime <= d3.getTime());
      if (this.scFilterDate === '7days') results = results.filter(e => e.startTime <= d7.getTime());

      // Prepare stats for sorting
      results.forEach(evt => {
          if (!evt._statsExtracted) {
              const markets = window.OddsProviderService.getNormalizedOddsForEvent(evt);
              evt.availableMarkets = markets.map(m => m.id);
              
              const allBookies = new Set();
              let bestDiff = 0;
              let bestOddVal = 0;

              markets.forEach(m => {
                  m.selections.forEach(s => {
                      if (s.allOdds) s.allOdds.forEach(o => allBookies.add(o.bookmaker));
                      if (s.stats && s.stats.diff > bestDiff) {
                          bestDiff = s.stats.diff;
                          bestOddVal = parseFloat(s.bestOdd.odd);
                      }
                  });
              });

              evt._numBookies = allBookies.size;
              evt._numMarkets = markets.length;
              evt._bestDiff = bestDiff;
              evt._bestOdd = bestOddVal;
              evt._statsExtracted = true;
          }
      });

      // Sorters
      if (this.scFilterSort === 'best_odd') {
          results.sort((a,b) => b._bestDiff - a._bestDiff);
      } else if (this.scFilterSort === 'most_bookies') {
          results.sort((a,b) => b._numBookies - a._numBookies);
      } else if (this.scFilterSort === 'most_markets') {
          results.sort((a,b) => b._numMarkets - a._numMarkets);
      }

      return results;
  }

  static renderSearchCentral(main) {
      // Clear interval if returning to search central
      if (this.refreshTimer) {
          clearInterval(this.refreshTimer);
          this.refreshTimer = null;
      }

      const results = this.applySearchCentralFilters();
      const sportsAvailable = [...new Set(this.allEvents.map(e => e.sportTitle))].filter(Boolean);
      const leaguesAvailable = [...new Set(this.allEvents.map(e => e.sportTitle))].filter(Boolean); // Simplifying as sportTitle acts as league in Odds API usually

      const renderFilter = (type, val, label, current) => {
          const isActive = current === val;
          return `<button onclick="window.ScannerView.scSetFilter('${type}', '${val}')" class="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${isActive ? 'bg-[#06b6d4] text-black shadow-[0_0_10px_rgba(6,182,212,0.3)]' : 'bg-[#141414] border border-[#262626] text-[#737373] hover:text-white hover:border-[#404040] whitespace-nowrap'}">${label}</button>`;
      };

      const renderSort = (val, label, icon) => {
          const isActive = this.scFilterSort === val;
          return `<button onclick="window.ScannerView.scSetFilter('sort', '${val}')" class="px-4 py-3 w-full rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${isActive ? 'bg-[#06b6d4]/10 border border-[#06b6d4]/30 text-[#06b6d4]' : 'bg-[#141414] border border-[#262626] text-[#a3a3a3] hover:bg-[#1a1a1a]'}">${icon} ${label}</button>`;
      };

      main.innerHTML = `
        <div class="flex-1 w-full p-4 lg:p-6 flex flex-col relative animate-in fade-in duration-500 max-w-[1600px] mx-auto pb-12">
            
            <div class="text-center mb-8">
               <h1 class="text-3xl md:text-5xl font-black text-white tracking-tight flex items-center justify-center gap-3 mb-2">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="3"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  CENTRAL DE PESQUISA
               </h1>
               <p class="text-[#a3a3a3] text-sm uppercase tracking-widest font-bold">Encontre o evento perfeito para escanear</p>
            </div>

            <!-- BUSCA GLOBAL DO SCANNER -->
            <div class="max-w-3xl mx-auto w-full relative z-50 mb-8">
                <input type="text" id="sc-global-search" placeholder="🔎 Digite time, campeonato ou evento..."
                       value="${this.scSearchQuery}"
                       class="w-full bg-[#0a0a0a] border-2 border-[#333] hover:border-[#404040] text-white text-lg rounded-2xl pl-14 pr-6 py-4 focus:border-[#06b6d4] focus:ring-4 focus:ring-[#06b6d4]/20 focus:outline-none transition-all shadow-inner"
                       onkeyup="window.ScannerView.scHandleSearch(event)">
                <svg class="absolute left-5 top-4.5 text-[#06b6d4]" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>

            <!-- FILTROS AVANÇADOS -->
            <div class="bg-[#0a0a0a] border border-[#262626] rounded-2xl p-5 mb-8 shadow-lg space-y-4">
                <div class="flex flex-wrap items-center gap-4">
                   <div class="flex items-center gap-3 w-full lg:w-auto overflow-x-auto custom-scrollbar pb-1">
                      <span class="text-[9px] text-[#737373] uppercase font-black tracking-widest min-w-max"><svg class="inline mr-1" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg> Esporte / Liga:</span>
                      ${renderFilter('sport', 'all', 'Todos', this.scFilterSport)}
                      ${sportsAvailable.map(sp => renderFilter('sport', sp, sp, this.scFilterSport)).join('')}
                   </div>
                </div>
                <div class="flex flex-wrap items-center gap-4 border-t border-[#1a1a1a] pt-4">
                   <div class="flex items-center gap-3 w-full lg:w-auto overflow-x-auto custom-scrollbar pb-1">
                      <span class="text-[9px] text-[#737373] uppercase font-black tracking-widest min-w-max"><svg class="inline mr-1" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg> Data:</span>
                      ${renderFilter('date', 'all', 'Todos', this.scFilterDate)}
                      ${renderFilter('date', 'today', 'Hoje', this.scFilterDate)}
                      ${renderFilter('date', 'tomorrow', 'Amanhã', this.scFilterDate)}
                      ${renderFilter('date', '3days', 'Próx 3 Dias', this.scFilterDate)}
                      ${renderFilter('date', '7days', 'Próx 7 Dias', this.scFilterDate)}
                   </div>
                   <div class="w-px h-6 bg-[#262626] hidden lg:block"></div>
                   <div class="flex items-center gap-3 w-full lg:w-auto overflow-x-auto custom-scrollbar pb-1">
                      <span class="text-[9px] text-[#737373] uppercase font-black tracking-widest min-w-max"><svg class="inline mr-1" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> Status:</span>
                      ${renderFilter('status', 'all', 'Todos', this.scFilterStatus)}
                      ${renderFilter('status', 'live', 'Ao Vivo', this.scFilterStatus)}
                      ${renderFilter('status', 'pre', 'Pré-Jogo', this.scFilterStatus)}
                   </div>
                </div>
            </div>

            <!-- ORDENAÇÃO E RESUMO -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                ${renderSort('best_odd', '⭐ Melhores Cotações', '')}
                ${renderSort('most_bookies', '🏦 Mais Casas', '')}
                ${renderSort('most_markets', '📊 Mais Mercados', '')}
            </div>
            
            <div class="flex justify-between items-center mb-4 pl-2">
                <span class="text-xs font-black text-[#a3a3a3] uppercase tracking-widest">${results.length} Eventos Encontrados</span>
                <span class="text-[9px] bg-[#1a1a1a] border border-[#333] px-2 py-1 rounded text-[#737373] uppercase tracking-widest">Base de Dados: The Odds API</span>
            </div>

            <!-- LISTAGEM DE EVENTOS PARA ESCANEAR -->
            <div class="space-y-4">
                ${results.length === 0 ? `
                   <div class="bg-[#0a0a0a] border border-dashed border-[#333] rounded-2xl p-12 text-center shadow-lg">
                      <p class="text-[#737373] text-sm uppercase tracking-widest font-black">Não existem eventos disponíveis para os filtros selecionados.</p>
                   </div>
                ` : results.map(evt => {
                   const dateStr = window.DateUtil ? window.DateUtil.formatEventDate(evt.startTime) : new Date(evt.startTime).toLocaleString('pt-BR');
                   const isLive = evt.status === 'AO VIVO';
                   
                   return `
                   <div class="bg-gradient-to-r from-[#0f0f0f] to-[#141414] border border-[#262626] hover:border-[#06b6d4]/50 rounded-2xl p-6 transition-colors shadow-lg group relative overflow-hidden flex flex-col md:flex-row justify-between md:items-center gap-6">
                       ${isLive ? '<div class="absolute top-0 left-0 w-1 h-full bg-red-500"></div>' : '<div class="absolute top-0 left-0 w-1 h-full bg-[#06b6d4]"></div>'}
                       
                       <div class="flex-1 pl-3">
                           <div class="flex flex-wrap items-center gap-2 mb-3">
                              <span class="text-[9px] bg-[#1a1a1a] text-[#06b6d4] border border-[#333] px-2 py-0.5 rounded font-black uppercase tracking-widest">${evt.sportTitle}</span>
                              ${isLive ? '<span class="text-[9px] bg-red-500/20 text-red-500 border border-red-500/30 px-2 py-0.5 rounded font-black uppercase tracking-widest animate-pulse">AO VIVO</span>' : ''}
                              <span class="text-[10px] text-[#737373] font-mono group-hover:text-white transition-colors">${dateStr}</span>
                           </div>
                           <h3 class="text-xl font-black text-white leading-tight">${evt.homeTeam} <span class="text-[#404040] mx-2 font-light">vs</span> ${evt.awayTeam}</h3>
                       </div>

                       <div class="flex items-center gap-4 bg-[#0a0a0a] p-4 rounded-xl border border-[#1a1a1a]">
                           <div class="text-center border-r border-[#262626] pr-4">
                              <p class="text-[9px] text-[#737373] uppercase tracking-widest font-black mb-1">Casas</p>
                              <p class="text-xl font-black text-white font-mono">${evt._numBookies || 0}</p>
                           </div>
                           <div class="text-center border-r border-[#262626] pr-4">
                              <p class="text-[9px] text-[#737373] uppercase tracking-widest font-black mb-1">Mercados</p>
                              <p class="text-xl font-black text-white font-mono">${evt._numMarkets || 0}</p>
                           </div>
                           <div class="text-center min-w-[70px]">
                              <p class="text-[9px] text-[#737373] uppercase tracking-widest font-black mb-1 flex items-center justify-center gap-1">⭐ Melhor Odd</p>
                              <p class="text-xl font-black text-[#a3e635] font-mono leading-none">${evt._bestOdd > 0 ? '@'+parseFloat(evt._bestOdd).toFixed(2) : '-'}</p>
                           </div>
                       </div>

                       <div>
                           <button onclick="window.sbApp.navigateTo('scanner', { sportKey: '${evt.sportKey}', eventId: '${evt.id}' })" class="w-full md:w-auto bg-[#1a1a1a] hover:bg-[#06b6d4] text-[#06b6d4] hover:text-black border border-[#333] hover:border-[#06b6d4] px-6 py-4 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all whitespace-nowrap shadow-lg">
                              [ Analisar Odds ]
                           </button>
                       </div>
                   </div>
                   `;
                }).join('')}
            </div>
        </div>
      `;
  }

  static scHandleSearch(e) {
      this.scSearchQuery = e.target.value;
      if (this.scTimeout) clearTimeout(this.scTimeout);
      this.scTimeout = setTimeout(() => {
          this.renderSearchCentral(document.getElementById('app-main'));
      }, 300);
  }

  static scSetFilter(type, val) {
      if (type === 'sport') this.scFilterSport = val;
      if (type === 'date') this.scFilterDate = val;
      if (type === 'status') this.scFilterStatus = val;
      if (type === 'sort') this.scFilterSort = val;
      this.renderSearchCentral(document.getElementById('app-main'));
  }

  // =========================================================================================
  // MATRIZ DE ODDS (Quando um evento é selecionado)
  // =========================================================================================

  static refreshCurrentEvent() {
      if (this.currentEvent) {
          this.render({ sportKey: this.currentEvent.sportKey, eventId: this.currentEvent.id }, true);
      }
  }

  static setupAutoRefresh() {
      if (this.refreshTimer) clearInterval(this.refreshTimer);
      if (this.autoRefreshInterval > 0) {
          this.refreshTimer = setInterval(() => {
              console.log(`[Scanner] Auto-refresh triggered (${this.autoRefreshInterval}s)`);
              this.refreshCurrentEvent();
          }, this.autoRefreshInterval * 1000);
      }
  }

  static setAutoRefresh(seconds) {
      this.autoRefreshInterval = seconds;
      this.setupAutoRefresh();
      // Renderizar apenas o dropdown de refresh sem recarregar tudo, ou usar manipulação de DOM simples
      const dropdown = document.getElementById('auto-refresh-label');
      if (dropdown) dropdown.innerText = seconds === 0 ? 'OFF' : `${seconds}s`;
      window.sbApp.showToast('Auto Refresh', `Atualização automática ajustada para ${seconds === 0 ? 'Desligado' : seconds + ' segundos'}.`, 'success');
  }

  static calculateOtherOpportunities() {
     this.otherOpportunities = [];
     if (!this.normalizedMarkets) return;
     
     this.normalizedMarkets.forEach(market => {
         market.selections.forEach(sel => {
             if (sel.stats && sel.stats.diff >= 0.5) {
                 this.otherOpportunities.push({
                     market: market,
                     selection: sel,
                     bestOddObj: sel.bestOdd,
                     diff: sel.stats.diff.toFixed(2),
                     avg: sel.stats.averageOdd.toFixed(2)
                 });
             }
         });
     });
     
     this.otherOpportunities.sort((a, b) => b.diff - a.diff);
  }

  static renderFullScanner(main) {
    const isLive = this.currentEvent.status === 'AO VIVO';
    const dateFormatted = window.DateUtil ? window.DateUtil.formatEventDate(this.currentEvent.startTime) : new Date(this.currentEvent.startTime).toLocaleString('pt-BR');

    // TABS (Apenas mercados existentes na API, criadas dinamicamente)
    let tabsHtml = `
      <button class="px-6 py-4 text-[11px] uppercase tracking-widest font-black whitespace-nowrap border-b-2 transition-all ${this.activeTab === 'overview' ? 'border-[#06b6d4] text-[#06b6d4]' : 'border-transparent text-[#737373] hover:text-white hover:bg-[#141414]'}"
              onclick="window.ScannerView.switchTab('overview')">
         VISÃO GERAL
      </button>
    `;
    
    this.normalizedMarkets.forEach(m => {
       tabsHtml += `
         <button class="px-6 py-4 text-[11px] uppercase tracking-widest font-black whitespace-nowrap border-b-2 transition-all ${this.activeTab === m.id ? 'border-[#06b6d4] text-white' : 'border-transparent text-[#737373] hover:text-white hover:bg-[#141414]'}"
                 onclick="window.ScannerView.switchTab('${m.id}')">
            ${m.name}
         </button>
       `;
    });

    const updateTimeStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    let allBookiesSet = new Set();
    if (this.normalizedMarkets) {
        this.normalizedMarkets.forEach(m => {
            if (m.selections) {
                m.selections.forEach(s => {
                    if (s.allOdds) s.allOdds.forEach(o => allBookiesSet.add(o.bookmaker));
                });
            }
        });
    }
    const totalBookies = allBookiesSet.size;

    main.innerHTML = `
      <div class="flex-1 w-full p-4 lg:p-6 flex flex-col relative animate-in fade-in duration-500 max-w-[1600px] mx-auto pb-12">
         
         <!-- TOOLBAR SUPERIOR -->
         <div class="w-full flex items-center justify-between mb-6 z-20">
             <button onclick="window.sbApp.navigateTo('scanner')" class="text-[10px] bg-[#141414] hover:bg-[#1a1a1a] border border-[#262626] px-4 py-2 rounded text-[#a3a3a3] hover:text-white font-black uppercase tracking-widest flex items-center gap-2 transition-colors shadow-lg">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M15 18l-6-6 6-6"/></svg>
                Voltar à Central de Pesquisa
             </button>
             
             <div class="flex items-center gap-3">
                 <!-- Auto Refresh Selector -->
                 <div class="relative group">
                    <button class="bg-[#141414] border border-[#262626] text-[#737373] hover:text-white px-4 py-2 rounded font-black text-[9px] uppercase tracking-widest flex items-center gap-2 transition-all shadow-md">
                       <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                       Auto: <span id="auto-refresh-label" class="text-white">${this.autoRefreshInterval === 0 ? 'OFF' : this.autoRefreshInterval + 's'}</span>
                    </button>
                    <div class="absolute right-0 top-full mt-1 bg-[#0a0a0a] border border-[#262626] rounded shadow-2xl hidden group-hover:flex flex-col z-[100] w-32 overflow-hidden">
                       <button onclick="window.ScannerView.setAutoRefresh(0)" class="text-[9px] font-black uppercase tracking-widest text-left px-4 py-2 text-[#737373] hover:bg-[#1a1a1a] hover:text-white transition-colors">OFF</button>
                       <button onclick="window.ScannerView.setAutoRefresh(30)" class="text-[9px] font-black uppercase tracking-widest text-left px-4 py-2 text-[#06b6d4] hover:bg-[#1a1a1a] transition-colors">30 Segundos</button>
                       <button onclick="window.ScannerView.setAutoRefresh(60)" class="text-[9px] font-black uppercase tracking-widest text-left px-4 py-2 text-[#06b6d4] hover:bg-[#1a1a1a] transition-colors">60 Segundos</button>
                       <button onclick="window.ScannerView.setAutoRefresh(120)" class="text-[9px] font-black uppercase tracking-widest text-left px-4 py-2 text-[#06b6d4] hover:bg-[#1a1a1a] transition-colors">120 Segundos</button>
                    </div>
                 </div>

                 <button onclick="window.ScannerView.refreshCurrentEvent()" class="bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-black border border-emerald-500/30 px-6 py-2 rounded font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>
                    Atualizar Odds
                 </button>
             </div>
         </div>

         <!-- HEADER DO EVENTO -->
         <div class="flex flex-col xl:flex-row gap-0 mb-8 relative overflow-hidden rounded-2xl border border-[#262626] shadow-2xl">
            <div class="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] to-[#141414] z-0"></div>
            
            <div class="flex-1 p-6 lg:p-10 relative z-10 flex flex-col justify-center border-b xl:border-b-0 xl:border-r border-[#262626]">
                <div class="flex flex-wrap items-center gap-3 mb-6">
                   <span class="bg-[#1a1a1a] border border-[#333] text-[#06b6d4] text-[10px] px-3 py-1.5 rounded font-black uppercase tracking-widest shadow-md flex items-center gap-2">
                     <span class="text-xs">🏆</span> ${this.currentEvent.sportTitle}
                   </span>
                   <span class="bg-[#1a1a1a] border border-[#333] ${isLive ? 'text-red-500' : 'text-[#a3a3a3]'} text-[10px] px-3 py-1.5 rounded font-black uppercase tracking-widest flex items-center gap-2 shadow-md">
                      ${isLive ? '<span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>' : ''} ${this.currentEvent.status}
                   </span>
                   <span class="bg-[#1a1a1a] border border-[#333] text-[#737373] text-[10px] px-3 py-1.5 rounded font-black uppercase tracking-widest shadow-md flex items-center gap-2">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                      ${dateFormatted}
                   </span>
                </div>
                <h1 class="text-3xl lg:text-5xl font-black text-white tracking-tight flex flex-col md:flex-row md:items-center gap-3 md:gap-6 leading-none">
                   <span>${this.currentEvent.homeTeam}</span> 
                   <span class="text-[#404040] text-2xl font-light italic">vs</span> 
                   <span>${this.currentEvent.awayTeam}</span>
                </h1>
            </div>
            
            <div class="flex flex-wrap sm:flex-nowrap bg-[#0a0a0a] xl:w-[450px] relative z-10">
                <div class="flex-1 p-6 flex flex-col justify-center items-center text-center border-r border-[#262626]">
                   <p class="text-[9px] text-[#737373] uppercase tracking-widest font-black mb-1">Última Atualização</p>
                   <p class="text-xl font-black text-white font-mono">${updateTimeStr}</p>
                </div>
                <div class="flex-1 p-6 flex flex-col justify-center items-center text-center border-r border-[#262626]">
                   <p class="text-[9px] text-[#737373] uppercase tracking-widest font-black mb-1">Bookmakers</p>
                   <p class="text-3xl font-black text-white font-mono">${totalBookies}</p>
                </div>
                <div class="flex-1 p-6 flex flex-col justify-center items-center text-center">
                   <p class="text-[9px] text-[#737373] uppercase tracking-widest font-black mb-1">Mercados</p>
                   <p class="text-3xl font-black text-[#06b6d4] font-mono">${this.normalizedMarkets.length}</p>
                </div>
            </div>
         </div>

         <!-- TABS MULTIMERCADO -->
         ${(() => {
             let maxDiff = 0, bestDiffSel = '', bestDiffMkt = '';
             let maxDisp = 0, maxDispSel = '', maxDispMkt = '';
             this.normalizedMarkets.forEach(m => {
                 m.selections.forEach(sel => {
                     if (sel.stats && sel.stats.diff > maxDiff) { maxDiff = sel.stats.diff; bestDiffSel = sel.fullName; bestDiffMkt = m.name; }
                     if (sel.stats && sel.stats.dispersion > maxDisp) { maxDisp = sel.stats.dispersion; maxDispSel = sel.fullName; maxDispMkt = m.name; }
                 });
             });
             return `
             <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div class="bg-gradient-to-br from-[#141414] to-[#0a0a0a] p-5 rounded-2xl border border-[#262626] shadow-lg flex items-center justify-between">
                   <div>
                      <p class="text-[9px] text-[#737373] uppercase tracking-widest font-black mb-1">Maior Oportunidade</p>
                      <p class="text-sm text-white font-black">${bestDiffSel || '-'}</p>
                      <p class="text-[9px] text-[#06b6d4] uppercase tracking-widest">${bestDiffMkt || '-'}</p>
                   </div>
                   <span class="text-xl font-black text-emerald-400 font-mono">+${maxDiff.toFixed(1)}%</span>
                </div>
                <div class="bg-gradient-to-br from-[#141414] to-[#0a0a0a] p-5 rounded-2xl border border-[#262626] shadow-lg flex items-center justify-between">
                   <div>
                      <p class="text-[9px] text-[#737373] uppercase tracking-widest font-black mb-1">Maior Dispersão</p>
                      <p class="text-sm text-white font-black">${maxDispSel || '-'}</p>
                      <p class="text-[9px] text-[#06b6d4] uppercase tracking-widest">${maxDispMkt || '-'}</p>
                   </div>
                   <span class="text-xl font-black text-[#a3a3a3] font-mono">σ ${maxDisp.toFixed(2)}</span>
                </div>
                <div class="bg-gradient-to-br from-[#141414] to-[#0a0a0a] p-5 rounded-2xl border border-[#262626] shadow-lg flex items-center justify-between">
                   <div>
                      <p class="text-[9px] text-[#737373] uppercase tracking-widest font-black mb-1">Cobertura de Casas</p>
                      <p class="text-sm text-white font-black">${totalBookies} Bookmakers</p>
                      <p class="text-[9px] text-[#06b6d4] uppercase tracking-widest">Monitoramento Ativo</p>
                   </div>
                   <span class="text-xl font-black text-white font-mono">${this.normalizedMarkets.length} <span class="text-[10px] text-[#737373]">MKT</span></span>
                </div>
             </div>`;
         })()}
         <div class="flex overflow-x-auto border-b-2 border-[#262626] mb-8 custom-scrollbar bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-30 shadow-sm">
            ${tabsHtml}
         </div>

         <!-- CONTENT GRID -->
         <div class="flex flex-col xl:flex-row gap-8">
            <div id="scanner-content-area" class="w-full xl:w-3/4">
               ${this.renderTabContent()}
            </div>
            
            <div class="w-full xl:w-1/4 flex flex-col gap-6">
               ${this.renderOpportunitiesPanel()}
            </div>
         </div>
      </div>
    `;
  }

  static switchTab(tabId) {
    this.activeTab = tabId;
    const contentArea = document.getElementById('scanner-content-area');
    if (contentArea) contentArea.innerHTML = this.renderTabContent();
    // Also re-render tabs strictly to update active state
    this.renderFullScanner(document.getElementById('app-main'));
  }

  static setDisplayMode(mode) {
      this.displayMode = mode;
      this.switchTab(this.activeTab);
  }

  static renderTabContent() {
    if (this.normalizedMarkets.length === 0) {
        return `<div class="p-10 text-center text-[#737373] bg-[#0a0a0a] rounded-xl border border-[#262626]">Nenhuma cotação disponível para este evento no momento.</div>`;
    }

    if (this.activeTab === 'overview') {
        return this.renderOverview();
    }

    const market = this.normalizedMarkets.find(m => m.id === this.activeTab);
    if (!market) return '';

    return this.renderMarketTable(market);
  }

  static renderOverview() {
    let html = `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">`;
    
    this.normalizedMarkets.forEach(m => {
       html += `<div class="bg-gradient-to-b from-[#141414] to-[#0a0a0a] border border-[#262626] rounded-2xl p-6 flex flex-col hover:border-[#404040] transition-colors shadow-lg group">
          <h4 class="text-[10px] font-black text-white mb-5 uppercase tracking-widest border-b border-[#262626] pb-3 flex items-center justify-between">
             <span class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-[#06b6d4] group-hover:bg-emerald-500 transition-colors"></span>${m.name}</span>
             <span class="bg-[#1a1a1a] text-[#737373] px-2 py-0.5 rounded border border-[#333]">${m.selections.length}</span>
          </h4>
          <div class="flex flex-col gap-3 flex-1">
             ${m.selections.slice(0, 4).map(sel => `
                <div class="flex items-center justify-between bg-[#0f0f0f] p-3 rounded-lg border border-[#1a1a1a]">
                   <span class="text-[11px] text-[#a3a3a3] font-bold truncate pr-2 group-hover:text-white transition-colors">${sel.fullName}</span>
                   ${sel.bestOdd ? `
                   <div class="flex flex-col items-end">
                      <span class="text-base font-black text-[#a3e635] leading-none mb-1 font-mono">@${parseFloat(sel.bestOdd.odd).toFixed(2)}</span>
                      <span class="text-[8px] bg-[#1a1a1a] text-[#737373] px-1.5 py-0.5 rounded border border-[#333] uppercase tracking-widest">${sel.bestOdd.bookmaker}</span>
                   </div>` : '<span class="text-xs text-[#404040]">-</span>'}
                </div>
             `).join('')}
             ${m.selections.length > 4 ? `<div class="text-[9px] text-[#06b6d4] text-center mt-2 uppercase font-black tracking-widest py-1.5 bg-[#06b6d4]/10 rounded border border-[#06b6d4]/20">+ ${m.selections.length - 4} LINHAS DISPONÍVEIS</div>` : ''}
          </div>
          <button onclick="window.ScannerView.switchTab('${m.id}')" class="mt-5 w-full bg-[#1a1a1a] hover:bg-[#06b6d4] text-white hover:text-black text-[10px] uppercase tracking-widest font-black py-3 rounded-lg border border-[#333] hover:border-[#06b6d4] transition-all">
             Analisar Matriz
          </button>
       </div>`;
    });

    html += `</div>`;
    return html;
  }

  static setMarketLine(marketId, lineStr) {
      this.activeLines[marketId] = lineStr;
      this.switchTab(marketId);
  }

  // =========================================================================================
  // RENDERIZAÇÃO DA MATRIZ DO MERCADO COM COMPARATIVO
  // =========================================================================================
  static renderMarketTable(market) {
     const uniqueLines = [...new Set(market.selections.map(s => s.line))].filter(l => l !== undefined && l !== null);
     uniqueLines.sort((a,b) => parseFloat(a) - parseFloat(b));

     let currentLine = this.activeLines[market.id];
     if (!currentLine && uniqueLines.length > 0) {
         currentLine = uniqueLines[Math.floor(uniqueLines.length / 2)]; 
         this.activeLines[market.id] = currentLine;
     }

     let activeSelections = market.selections;
     if (uniqueLines.length > 0 && currentLine !== undefined) {
         activeSelections = market.selections.filter(s => s.line === currentLine);
     }

     let lineSelectorHtml = '';
     if (uniqueLines.length > 0) {
         lineSelectorHtml = `
            <div class="mb-6 flex flex-col lg:flex-row lg:items-center gap-4 bg-[#0a0a0a] p-4 rounded-xl border border-[#262626] shadow-lg">
               <span class="text-[10px] uppercase text-[#737373] font-black tracking-widest whitespace-nowrap bg-[#141414] px-3 py-2 rounded-lg border border-[#333]"><svg class="inline mr-1 mb-0.5" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 9h16M4 15h16"/></svg> Selecione a Linha:</span>
               <div class="flex gap-2 overflow-x-auto custom-scrollbar pb-1 w-full items-center">
                  ${uniqueLines.map(line => `
                     <button onclick="window.ScannerView.setMarketLine('${market.id}', ${line})" 
                             class="px-5 py-2 rounded-lg text-sm font-black font-mono transition-all border ${currentLine === line ? 'bg-[#06b6d4] text-black border-[#06b6d4] shadow-[0_0_15px_rgba(6,182,212,0.4)] transform -translate-y-0.5' : 'bg-[#1a1a1a] text-[#a3a3a3] border-[#333] hover:border-[#404040] hover:text-white'}">
                        ${line > 0 ? '+'+line : line}
                     </button>
                  `).join('')}
               </div>
            </div>
         `;
     }

     const bookmakersSet = new Set();
     activeSelections.forEach(sel => {
         sel.allOdds.forEach(odd => bookmakersSet.add(odd.bookmaker));
     });
     let bookmakersList = Array.from(bookmakersSet).sort();

     if (bookmakersList.length === 0) {
         return `${lineSelectorHtml}<div class="p-8 text-center text-[#737373] bg-[#0a0a0a] rounded-xl border border-[#262626]">Nenhuma cotação para esta linha.</div>`;
     }

     if (this.displayMode === 'best') {
         const bestBookies = new Set(activeSelections.map(s => s.bestOdd ? s.bestOdd.bookmaker : null).filter(Boolean));
         if (bestBookies.size > 0) bookmakersList = Array.from(bestBookies).sort();
     }

     // Comparativo de Casas (Fase 14: Mostrar resumos para cada seleção ativa)
     let comparativeHtml = `<div class="grid grid-cols-1 md:grid-cols-${Math.min(activeSelections.length, 3)} gap-4 mb-8">`;
     activeSelections.forEach(sel => {
         if (sel.stats) {
             comparativeHtml += `
             <div class="bg-gradient-to-br from-[#141414] to-[#0a0a0a] border border-[#262626] rounded-xl p-4 shadow-lg">
                    <div class="flex justify-between items-center mb-2">
                   <span class="text-[9px] text-[#737373] uppercase tracking-widest font-black">⭐ Melhor</span>
                   <span class="text-sm font-black text-[#a3e635] font-mono">@${sel.bestOdd ? parseFloat(sel.bestOdd.odd).toFixed(2) : '-'}</span>
                </div>
                <div class="flex justify-between items-center mb-2">
                    <span class="text-[9px] text-[#737373] uppercase tracking-widest font-black">Odd Média</span>
                    <span class="text-xs font-black text-white font-mono">@${sel.stats.averageOdd > 0 ? sel.stats.averageOdd.toFixed(2) : '-'}</span>
                 </div>
                 <div class="flex justify-between items-center mb-2">
                    <span class="text-[9px] text-[#737373] uppercase tracking-widest font-black">Diferença</span>
                    <span class="text-xs font-black ${sel.stats.diff > 1 ? 'text-emerald-400' : 'text-[#737373]'} font-mono">+${sel.stats.diff.toFixed(2)}%</span>
                 </div>
                 <div class="flex justify-between items-center mt-3 pt-2 border-t border-[#1a1a1a]">
                    <span class="text-[9px] text-[#404040] uppercase tracking-widest font-black">Disponível em ${sel.stats.numBookmakers} casas</span>
                    ${sel.stats.dispersion > 0 ? `<span class="text-[9px] text-[#737373] font-mono cursor-help" title="Dispersão (σ): Mede a variação das odds entre as casas. Uma dispersão maior indica divergência de precificação e possível valor oculto.">σ ${sel.stats.dispersion.toFixed(2)}</span>` : ''}
                 </div>
             </div>`;
         }
     });
     comparativeHtml += `</div>`;

     let insightsHtml = `<div class="bg-[#0f0f0f] border border-[#262626] rounded-xl p-4 mb-6 shadow-inner">
         <h4 class="text-[10px] text-[#06b6d4] uppercase tracking-widest font-black mb-2 flex items-center gap-2"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg> SCANNER INSIGHTS</h4>
         <ul class="text-xs text-[#a3a3a3] space-y-1">`;
      activeSelections.forEach(sel => {
          if (sel.stats && sel.stats.numBookmakers > 0) {
              const best = sel.bestOdd;
              if (best && sel.stats.diff > 2) {
                  insightsHtml += `<li>• <strong class="text-white">${best.bookmaker}</strong> apresenta a maior cotação para <strong class="text-white">${sel.fullName}</strong> (@${parseFloat(best.odd).toFixed(2)}), com diferença de <strong class="text-emerald-400">+${sel.stats.diff.toFixed(1)}%</strong> da média.</li>`;
              }
              if (sel.stats.dispersion > 0.15) {
                  insightsHtml += `<li>• O mercado de <strong class="text-white">${sel.fullName}</strong> apresenta alta dispersão nas casas (desvio de ${sel.stats.dispersion.toFixed(2)}). Fique atento às discrepâncias.</li>`;
              }
          }
      });
      if (insightsHtml.endsWith('space-y-1">')) {
          insightsHtml += `<li>• Cotações uniformes detectadas para esta linha. Nenhuma discrepância matemática relevante.</li>`;
      }
      insightsHtml += `</ul></div>`;

     // Matriz Table
     let thHtml = `<th class="px-5 py-4 text-left text-[10px] font-black text-[#737373] uppercase tracking-wider bg-[#0f0f0f] sticky left-0 z-20 border-b border-[#262626] rounded-tl-xl w-48 shadow-[5px_0_15px_-5px_rgba(0,0,0,0.5)]">Bookmaker</th>`;
     activeSelections.forEach(sel => {
         thHtml += `<th class="px-5 py-4 text-center text-[11px] font-black text-white uppercase tracking-wider bg-[#0f0f0f] border-b border-[#262626] min-w-[140px]">${sel.fullName}</th>`;
     });

     let rowsHtml = '';
     bookmakersList.forEach(bookie => {
         rowsHtml += `<tr class="border-b border-[#262626] hover:bg-[#141414] transition-colors group">
            <td class="px-5 py-4 font-bold text-sm text-[#a3a3a3] group-hover:text-white sticky left-0 bg-[#0a0a0a] group-hover:bg-[#141414] border-r border-[#262626]/50 transition-colors z-10 shadow-[5px_0_15px_-5px_rgba(0,0,0,0.3)]">
               <div class="flex items-center gap-3">
                  <div class="w-6 h-6 rounded bg-[#1a1a1a] flex items-center justify-center text-[10px] font-black text-white border border-[#333] shadow-inner">${bookie.charAt(0)}</div>
                  ${bookie}
               </div>
            </td>
         `;
         
         activeSelections.forEach(sel => {
             const oddData = sel.allOdds.find(o => o.bookmaker === bookie);
             if (oddData) {
                 const isBest = sel.bestOdd && sel.bestOdd.bookmaker === bookie;
                 const oddVal = parseFloat(oddData.odd).toFixed(2);
                 const trendHtml = oddData.trend > 0 ? '<span class="text-[8px] text-emerald-500 font-bold ml-1" title="Subindo">▲</span>' : (oddData.trend < 0 ? '<span class="text-[8px] text-red-500 font-bold ml-1" title="Caindo">▼</span>' : '');
                 const probHtml = oddData.impliedProb ? `<span class="text-[8px] text-[#737373] font-mono mt-0.5 block cursor-help" title="Probabilidade Implícita: Probabilidade matemática calculada com base na odd atual (${oddData.impliedProb.toFixed(1)}%).">${oddData.impliedProb.toFixed(1)}%</span>` : '';
                 
                 rowsHtml += `
                    <td class="px-5 py-3 text-center relative">
                       <button onclick="window.ScannerView.openPickModal('${market.id}', '${sel.fullName.replace(/'/g, "\\'")}', '${bookie}', ${oddVal}, '${sel.line}')" 
                               class="w-full relative font-mono font-black text-base py-3 rounded-lg border transition-all overflow-hidden shadow-sm
                               ${isBest ? 'bg-[#a3e635]/10 border-[#a3e635] text-[#a3e635] hover:bg-[#a3e635] hover:text-black shadow-[0_0_20px_rgba(163,230,53,0.1)]' : 'bg-[#1a1a1a] border-[#333] text-[#a3a3a3] hover:border-[#06b6d4] hover:text-white hover:bg-[#06b6d4]/10'}">
                          ${isBest ? `<span class="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></span>` : ''}
                          <span class="relative z-10 flex flex-col items-center justify-center">
                             ${isBest ? `<span class="text-[8px] text-[#a3e635] uppercase tracking-widest mb-1 leading-none bg-[#a3e635]/10 px-2 py-0.5 rounded">⭐ Maior Odd</span>` : ''}
                             <div class="flex items-center justify-center">${oddVal}${trendHtml}</div>
                             ${probHtml}
                          </span>
                       </button>
                    </td>
                 `;
             } else {
                 rowsHtml += `<td class="px-5 py-3 text-center"><div class="w-full py-4 bg-[#141414] rounded-lg border border-dashed border-[#262626] text-[#404040] text-sm">-</div></td>`;
             }
         });
         rowsHtml += `</tr>`;
     });

     return `
        ${lineSelectorHtml}
        ${insightsHtml}
        ${comparativeHtml}
        
        <div class="flex items-center justify-between mb-3">
            <h4 class="text-[10px] text-[#737373] uppercase tracking-widest font-black">Matriz Multimercado:</h4>
            <div class="flex items-center gap-2 bg-[#141414] p-1 rounded-lg border border-[#262626]">
                <button onclick="window.ScannerView.setDisplayMode('all')" class="px-3 py-1.5 rounded text-[9px] font-black uppercase tracking-widest transition-all ${!this.displayMode || this.displayMode === 'all' ? 'bg-[#06b6d4] text-black' : 'text-[#737373] hover:text-white'}">Todas as Casas</button>
                <button onclick="window.ScannerView.setDisplayMode('best')" class="px-3 py-1.5 rounded text-[9px] font-black uppercase tracking-widest transition-all ${this.displayMode === 'best' ? 'bg-[#a3e635] text-black' : 'text-[#737373] hover:text-white'}">⭐ Melhores Odds</button>
            </div>
        </div>
        <div class="bg-[#0a0a0a] border border-[#262626] rounded-2xl overflow-x-auto custom-scrollbar shadow-2xl animate-in fade-in duration-300 relative mb-8">
           <table class="w-full whitespace-nowrap">
              <thead>
                 <tr>${thHtml}</tr>
              </thead>
              <tbody>
                 ${rowsHtml}
              </tbody>
           </table>
        </div>
     `;
  }

  static renderOpportunitiesPanel() {
      let html = `
         <div class="bg-[#0a0a0a] border border-[#262626] rounded-2xl flex flex-col h-[600px] overflow-hidden shadow-2xl">
            <div class="p-5 border-b border-[#262626] bg-[#141414]">
               <h3 class="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a3e635" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  📌 Distorções do Jogo
               </h3>
               <p class="text-[9px] text-[#737373] mt-1 font-bold uppercase tracking-widest">Cotações notavelmente acima da média</p>
            </div>
            <div class="p-4 flex-1 overflow-y-auto custom-scrollbar space-y-3">
      `;
      
      if (!this.otherOpportunities || this.otherOpportunities.length === 0) {
          html += `<div class="h-full flex flex-col items-center justify-center text-center p-6"><p class="text-xs text-[#737373]">Nenhuma cotação notavelmente acima da média da casa foi encontrada neste evento.</p></div>`;
      } else {
          this.otherOpportunities.slice(0, 8).forEach(opp => {
              html += `
                 <div class="bg-[#141414] border border-[#333] hover:border-[#06b6d4]/50 rounded-xl p-4 transition-colors cursor-pointer group"
                      onclick="window.ScannerView.switchTab('${opp.market.id}')">
                     <div class="flex items-center justify-between mb-3">
                       <span class="text-[9px] uppercase tracking-widest text-[#a3a3a3] font-black bg-[#1a1a1a] px-2 py-0.5 rounded border border-[#262626]">${opp.market.name}</span>
                       <span class="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-black">+${opp.diff}% DIF</span>
                    </div>
                    <p class="text-sm font-black text-white mb-4 truncate group-hover:text-[#06b6d4] transition-colors">${opp.selection.fullName}</p>
                    <div class="flex items-end justify-between bg-[#0a0a0a] p-3 rounded-lg border border-[#262626]">
                       <div class="flex flex-col">
                          <span class="text-[9px] uppercase tracking-widest text-[#737373] font-bold mb-1">${opp.bestOddObj.bookmaker}</span>
                          <span class="text-lg font-black text-[#a3e635] font-mono leading-none">@${parseFloat(opp.bestOddObj.odd).toFixed(2)}</span>
                       </div>
                       <div class="flex flex-col items-end">
                          <span class="text-[9px] text-[#737373] font-bold uppercase tracking-widest mb-1">Média</span>
                          <span class="text-sm font-black text-[#a3a3a3] font-mono">@${opp.avg}</span>
                       </div>
                    </div>
                 </div>
              `;
          });
      }

      html += `</div></div>`;
      return html;
  }

  // =========================================================================================
  // MODAL E LOGIC
  // =========================================================================================
  static openPickModal(marketId, selection, bookmaker, odd, line) {
    if (!window.sbApp || !window.sbApp.components || !window.sbApp.components.Modal) return;
    
    const evt = this.currentEvent;
    const market = this.normalizedMarkets.find(m => m.id === marketId);
    
    const html = `
      <div class="bg-[#0a0a0a] p-5 rounded-2xl border border-[#262626] mb-6 shadow-inner">
         <div class="flex justify-between items-start mb-5 border-b border-[#262626] pb-4">
            <div>
               <span class="text-[9px] text-[#737373] uppercase tracking-wider font-black block mb-1">Evento Escaneado</span>
               <h4 class="text-base font-black text-white">${evt.homeTeam} x ${evt.awayTeam}</h4>
            </div>
            <div class="text-right">
               <span class="text-[9px] text-[#737373] uppercase tracking-wider font-black block mb-1">Mercado</span>
               <h4 class="text-xs font-black text-[#06b6d4] uppercase tracking-widest bg-[#06b6d4]/10 px-2 py-1 rounded border border-[#06b6d4]/20">${market.name}</h4>
            </div>
         </div>
         
         <div class="flex flex-col md:flex-row justify-between items-center gap-4 bg-[#141414] p-6 rounded-xl border border-[#333] shadow-lg">
            <div class="text-center md:text-left w-full md:w-auto">
               <span class="text-[9px] text-[#737373] uppercase tracking-wider font-black block mb-2">Seleção de Aposta</span>
               <h4 class="text-2xl font-black text-white">${selection}</h4>
            </div>
            <div class="text-center md:text-right w-full md:w-auto flex flex-col items-center md:items-end">
               <span class="text-[10px] bg-[#262626] text-white px-3 py-1 rounded font-black uppercase tracking-wider mb-2">${bookmaker}</span>
               <h4 class="text-5xl font-black text-[#a3e635] leading-none font-mono drop-shadow-md">@${parseFloat(odd).toFixed(2)}</h4>
            </div>
         </div>
      </div>
      
      <div class="mb-6">
         <label class="text-[10px] text-[#737373] font-black uppercase tracking-wider mb-2 block pl-1">Valor da Stake (R$)</label>
         <div class="relative">
            <span class="absolute left-4 top-4 text-[#737373] font-bold text-lg">R$</span>
            <input type="number" id="pick-stake" value="100" min="1" step="1" 
                   class="w-full bg-[#0f0f0f] border border-[#333] text-white text-2xl font-black font-mono rounded-xl pl-12 pr-4 py-4 focus:border-[#a3e635] focus:ring-2 focus:ring-[#a3e635]/20 focus:outline-none transition-all shadow-inner"
                   oninput="window.ScannerView.updateModalCalculations(${odd})">
         </div>
      </div>
      
      <div class="flex justify-between items-center bg-[#1a1a1a] p-6 rounded-xl border border-[#333] shadow-lg">
         <div class="flex flex-col">
            <span class="text-[10px] text-[#737373] font-black uppercase tracking-wider mb-1">Lucro Líquido Estimado</span>
            <span id="pick-profit" class="text-3xl font-black text-[#a3e635] font-mono">+ R$ ${(100 * parseFloat(odd) - 100).toFixed(2)}</span>
         </div>
      </div>
    `;

    window.sbApp.components.Modal.show({
      title: 'Registrar Palpite',
      content: html,
      primaryText: 'Salvar no Histórico',
      onPrimary: () => {
         const stake = parseFloat(document.getElementById('pick-stake').value) || 100;
         if (window.PicksService) {
             const selObj = market.selections.find(s => s.fullName === selection);
             window.PicksService.savePick({
                 eventId: evt.id,
                 eventName: `${evt.homeTeam} x ${evt.awayTeam}`,
                 date: evt.startTime,
                 sportKey: evt.sportKey,
                 league: evt.sportTitle,
                 marketType: marketId,
                 selection: selection,
                 line: line !== 'null' && line !== 'undefined' ? parseFloat(line) : null,
                 bookmaker: bookmaker,
                 odd: parseFloat(odd),
                 stake: stake,
                 marketSnapshot: selObj && selObj.stats ? {
                     avg: selObj.stats.averageOdd,
                     diff: selObj.stats.diff,
                     dispersion: selObj.stats.dispersion,
                     bestOdd: selObj.bestOdd
                 } : null
             });
             window.sbApp.showToast('Palpite Salvo', 'Sua entrada foi registrada com sucesso!', 'success');
         }
      }
    });
  }

  static updateModalCalculations(odd) {
     const stakeInput = document.getElementById('pick-stake');
     const profitDisplay = document.getElementById('pick-profit');
     if (!stakeInput || !profitDisplay) return;
     
     const stake = parseFloat(stakeInput.value) || 0;
     const profit = (stake * odd) - stake;
     
     if (profit >= 0) {
        profitDisplay.textContent = `+ R$ ${profit.toFixed(2)}`;
        profitDisplay.className = 'text-3xl font-black text-[#a3e635] font-mono';
     } else {
        profitDisplay.textContent = `R$ ${profit.toFixed(2)}`;
        profitDisplay.className = 'text-3xl font-black text-red-500 font-mono';
     }
  }
}

window.ScannerView = ScannerView;
