/**
 * EVOLUA PAINEL EXACT STYLIZED DASHBOARD VIEW - FASE 8 (DYNAMIC & CUSTOMIZABLE)
 * Premium SaaS Style inspired by Raven UI
 */

class DashboardView {
  static async render() {
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

    main.className = "flex-1 w-full p-6 lg:p-8 min-h-[calc(100vh-5rem)] flex flex-col relative";

    main.innerHTML = `
      <div class="flex-1 flex flex-col items-center justify-center text-[#a3a3a3] text-sm animate-pulse">
        <svg class="animate-spin mb-4 h-8 w-8 text-[#a3e635]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        Sincronizando com Provedores de Odds Reais...
      </div>
    `;

    try {
      this.allEvents = await window.EventsService.getMassiveEvents();
      this.currentFilterDate = 'all'; // all, today
      this.currentFilterStatus = 'all'; // all, live, pre
      this.currentFilterSport = 'all'; // all, soccer, basketball...
      this.searchQuery = '';
      
      this.sports = [...new Set(this.allEvents.map(e => e.sportTitle || 'Outros'))];

      this.calculateRealOpportunities();
      this.renderContent(main, userName);

    } catch (e) {
      console.error(e);
      main.innerHTML = `
        <div class="p-8 text-center bg-red-950/20 border border-red-500/20 rounded-xl max-w-2xl mx-auto mt-10">
          <h3 class="text-red-500 font-bold mb-2">Erro ao carregar eventos</h3>
          <p class="text-sm text-red-400/80">${e.message || 'Falha de comunicação com a API.'}</p>
          <button onclick="window.DashboardView.render()" class="mt-4 px-4 py-2 bg-[#262626] hover:bg-[#404040] rounded text-white text-xs font-bold transition-colors">Tentar Novamente</button>
        </div>
      `;
    }
  }

  static getClassification(diff) {
     if (diff > 5) return { text: "VALOR POTENCIAL", color: "text-[#a3e635]", bg: "bg-[#a3e635]/10", dot: "bg-[#a3e635]" };
     if (diff > 2) return { text: "COTAÇÃO INTERESSANTE", color: "text-[#fbbf24]", bg: "bg-[#fbbf24]/10", dot: "bg-[#fbbf24]" };
     if (diff > 0.5) return { text: "MONITORAR", color: "text-white", bg: "bg-[#404040]/30", dot: "bg-white" };
     return { text: "SEM VANTAGEM IDENTIFICADA", color: "text-red-400", bg: "bg-red-400/10", dot: "bg-red-500" };
  }

  static calculateRealOpportunities() {
     this.opportunities = [];
     
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
                         const val = parseFloat(o.odd);
                         if (val > highest) { highest = val; bestOddObj = o; }
                         if (val < lowest) lowest = val;
                         sum += val;
                     });
                     
                     const avg = sum / sel.allOdds.length;
                     const diff = ((highest - avg) / avg) * 100;
                     
                     if (diff > 0.5) { // Consider above 0.5%
                         this.opportunities.push({
                             event: evt,
                             market: market,
                             selection: sel,
                             bestOddObj: bestOddObj,
                             diff: diff.toFixed(2),
                             avg: avg.toFixed(2),
                             classification: this.getClassification(diff)
                         });
                     }
                 }
             });
         });
     });
     
     this.opportunities.sort((a, b) => b.diff - a.diff);
  }

  static toggleModal() {
     const m = document.getElementById('dash-settings-modal');
     if (m) m.classList.toggle('hidden');
  }

  static savePrefs() {
     this.prefs.showOpportunities = document.getElementById('pref-opp').checked;
     this.prefs.showEvents = document.getElementById('pref-events').checked;
     this.prefs.showMetrics = document.getElementById('pref-metrics').checked;
     localStorage.setItem('sb_dash_prefs', JSON.stringify(this.prefs));
     this.toggleModal();
     this.renderContent(document.getElementById('app-main'), window.sbState.getState().user?.name || 'Guilherme');
  }

  static renderContent(main, userName) {
    const endOfToday = new Date().setHours(23, 59, 59, 999);
    
    let filteredEvents = this.allEvents;
    
    // Date filter
    if (this.currentFilterDate === 'today') {
       filteredEvents = filteredEvents.filter(e => e.startTime <= endOfToday);
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
          e.awayTeam.toLowerCase().includes(q)
       );
    }

    const numEvents = filteredEvents.length;
    const updateTimestamp = new Date().toLocaleTimeString('pt-BR');

    // Filter Buttons HTML
    const renderFilterBtn = (type, val, label) => {
       const current = type === 'date' ? this.currentFilterDate : (type === 'status' ? this.currentFilterStatus : this.currentFilterSport);
       const isActive = current === val;
       return `<button onclick="window.DashboardView.setFilter('${type}', '${val}')" class="px-3 py-1.5 rounded-md text-[10px] uppercase tracking-wider font-bold transition-colors ${isActive ? 'bg-[#a3e635] text-black' : 'bg-[#141414] border border-[#262626] text-white hover:border-[#a3e635]'}">${label}</button>`;
    };

    main.innerHTML = `
      <div class="space-y-6 animate-in fade-in duration-300">
        
        <div class="evolua-card p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div class="flex flex-col">
            <div class="flex items-center gap-2 text-base md:text-lg font-bold text-white">
              <span>Bem-vindo à Central, ${userName}</span>
              <span>👋</span>
            </div>
            <span class="text-[11px] text-[#737373]">Terminal de Inteligência Esportiva e Comparação de Odds</span>
          </div>
          <div class="flex flex-wrap items-center gap-3 w-full md:w-auto">
             <div class="relative flex-1 md:w-64">
                <input type="text" id="dash-search" placeholder="Pesquisar times, eventos..." value="${this.searchQuery}"
                       class="w-full bg-surface-900 border border-surface-700 text-white text-xs rounded-lg pl-8 pr-3 py-2.5 focus:border-cyan-500 focus:outline-none"
                       onkeyup="window.DashboardView.handleSearch(event)">
                <svg class="absolute left-2.5 top-3 text-surface-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
             </div>
             <button onclick="window.DashboardView.toggleModal()" class="px-3 py-2.5 rounded-lg bg-surface-900 border border-surface-700 text-xs font-semibold text-surface-200 hover:text-white flex items-center gap-2 transition-all">
                ⚙️ Personalizar
             </button>
             <button onclick="window.DashboardView.render()" class="px-3 py-2.5 rounded-lg bg-[#a3e635] text-black text-xs font-bold hover:bg-[#86c820] flex items-center gap-2 transition-all">
                Atualizar Odds
             </button>
          </div>
        </div>

        <!-- Dynamic Filters -->
        <div class="flex flex-col md:flex-row md:items-center gap-4 bg-[#0f0f0f] border border-[#262626] rounded-xl p-4">
          <div class="flex items-center gap-2 border-r border-[#262626] pr-4">
             <span class="text-[9px] text-[#737373] uppercase font-bold mr-1">Data:</span>
             ${renderFilterBtn('date', 'all', 'Todos')}
             ${renderFilterBtn('date', 'today', 'Hoje')}
          </div>
          <div class="flex items-center gap-2 border-r border-[#262626] pr-4">
             <span class="text-[9px] text-[#737373] uppercase font-bold mr-1">Status:</span>
             ${renderFilterBtn('status', 'all', 'Todos')}
             ${renderFilterBtn('status', 'pre', 'Pré-Jogo')}
             ${renderFilterBtn('status', 'live', 'Ao Vivo')}
          </div>
          <div class="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 md:pb-0">
             <span class="text-[9px] text-[#737373] uppercase font-bold mr-1">Esporte:</span>
             ${renderFilterBtn('sport', 'all', 'Todos')}
             ${this.sports.slice(0, 5).map(s => renderFilterBtn('sport', s, s)).join('')}
          </div>
        </div>

        ${this.prefs.showMetrics ? `
        <!-- Row 1: Metrics -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="premium-card p-5 relative overflow-hidden group">
            <span class="text-xs font-semibold text-white flex items-center gap-2 mb-2"><span class="w-2 h-2 rounded-full bg-[#a3e635]"></span>Eventos Ativos</span>
            <div class="text-3xl font-black text-white font-mono tracking-tight">${this.allEvents.length}</div>
            <div class="text-[10px] text-[#737373] mt-2 border-t border-[#262626] pt-2">Base de dados The Odds API</div>
          </div>
          <div class="premium-card p-5 relative overflow-hidden group">
            <span class="text-xs font-semibold text-white flex items-center gap-2 mb-2"><span class="w-2 h-2 rounded-full bg-[#06b6d4]"></span>Casas Monitoradas</span>
            <div class="text-3xl font-black text-white font-mono tracking-tight">12+</div>
            <div class="text-[10px] text-[#737373] mt-2 border-t border-[#262626] pt-2">Cobertura global e regional</div>
          </div>
          <div class="premium-card p-5 relative overflow-hidden group">
            <span class="text-xs font-semibold text-white flex items-center gap-2 mb-2"><span class="w-2 h-2 rounded-full bg-[#fbbf24]"></span>Oportunidades</span>
            <div class="text-3xl font-black text-white font-mono tracking-tight">${this.opportunities.length}</div>
            <div class="text-[10px] text-[#737373] mt-2 border-t border-[#262626] pt-2">Desajustes detectados > 0.5%</div>
          </div>
          <div class="premium-card p-5 relative overflow-hidden group">
             <span class="text-xs font-semibold text-white flex items-center gap-2 mb-2"><span class="w-2 h-2 rounded-full bg-[#8b5cf6]"></span>Última Atualização</span>
             <div class="text-2xl font-black text-[#a3e635] font-mono tracking-tight pt-1">${updateTimestamp}</div>
             <div class="text-[10px] text-[#737373] mt-2 border-t border-[#262626] pt-2">Dados em tempo real</div>
          </div>
        </div>` : ''}

        <div class="flex flex-col lg:flex-row gap-4 lg:h-[500px]">
          
          ${this.prefs.showOpportunities ? `
          <!-- OPORTUNIDADES -->
          <div class="premium-card flex-[2] flex flex-col p-6 overflow-hidden">
            <div class="flex items-center justify-between mb-4 border-b border-[#262626] pb-3">
              <h3 class="text-sm font-bold text-white flex items-center gap-2"><span class="text-xl">🔥</span> OPORTUNIDADES DE ODDS</h3>
              <span class="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-1 rounded font-bold uppercase">Inteligência Automática</span>
            </div>
            <div class="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
              ${this.opportunities.length === 0 ? '<div class="text-center text-[#737373] text-xs pt-10">Nenhuma vantagem identificada no momento.</div>' : ''}
              ${this.opportunities.slice(0, 15).map((opp, i) => `
                <div class="bg-[#0f0f0f] border border-[#262626] rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#a3e635]/40 transition-colors">
                   <div class="flex-1">
                      <div class="flex items-center gap-2 mb-2">
                         <span class="flex items-center gap-1 text-[9px] font-bold ${opp.classification.color} ${opp.classification.bg} px-2 py-0.5 rounded uppercase tracking-wider">
                            <span class="w-1.5 h-1.5 rounded-full ${opp.classification.dot}"></span> ${opp.classification.text}
                         </span>
                      </div>
                      <p class="text-[11px] text-[#a3a3a3] font-bold uppercase tracking-wider mb-1">${opp.event.homeTeam} x ${opp.event.awayTeam}</p>
                      <div class="flex items-center gap-3">
                         <span class="text-sm font-black text-white">${opp.market.name}</span>
                         <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#737373" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                         <span class="text-sm font-bold text-[#06b6d4]">${opp.selection.fullName}</span>
                      </div>
                   </div>
                   <div class="flex items-center gap-4 lg:gap-8">
                      <div class="text-right">
                         <p class="text-[9px] text-[#737373] uppercase tracking-wider font-bold mb-0.5">${opp.bestOddObj.bookmaker}</p>
                         <p class="text-xl lg:text-2xl font-black text-[#a3e635] leading-none font-mono">@${parseFloat(opp.bestOddObj.odd).toFixed(2)}</p>
                      </div>
                      <div class="text-left hidden md:block border-l border-[#262626] pl-4 lg:pl-8">
                         <p class="text-[9px] text-[#737373] uppercase tracking-wider font-bold mb-0.5">Odd Média</p>
                         <p class="text-sm font-bold text-white leading-none font-mono">@${opp.avg}</p>
                         <p class="text-[10px] font-bold text-[#22c55e] mt-1">+${opp.diff}% Diff</p>
                      </div>
                      <button onclick="window.sbApp.navigateTo('scanner', { sportKey: '${opp.event.sportKey}', eventId: '${opp.event.id}' })" class="bg-[#1a1a1a] hover:bg-[#262626] text-white border border-[#262626] font-bold text-[10px] uppercase tracking-wider px-4 py-3 rounded-lg transition-colors whitespace-nowrap">
                         Analisar Odds
                      </button>
                   </div>
                </div>
              `).join('')}
            </div>
          </div>` : ''}

          ${this.prefs.showEvents ? `
          <!-- EVENTOS -->
          <div class="premium-card flex-1 flex flex-col p-6">
            <div class="flex items-center justify-between mb-4 border-b border-[#262626] pb-3">
              <h3 class="text-sm font-bold text-white uppercase tracking-wider">Mural de Eventos</h3>
              <span class="text-[10px] text-[#737373]">${numEvents} Encontrados</span>
            </div>
            <div class="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
              ${filteredEvents.length === 0 ? '<div class="text-center text-[#737373] text-xs pt-10">Nenhum evento corresponde aos filtros.</div>' : ''}
              ${filteredEvents.map((evt) => {
                  const isLive = evt.status === 'AO VIVO';
                  const dateStr = window.DateUtil ? window.DateUtil.formatEventDate(evt.startTime) : new Date(evt.startTime).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
                  return `
                <div onclick="window.sbApp.navigateTo('scanner', { sportKey: '${evt.sportKey}', eventId: '${evt.id}' })" class="flex flex-col p-3 rounded-lg bg-[#0f0f0f] border border-[#262626] hover:border-[#a3e635]/50 hover:bg-[#1a1a1a] transition-all cursor-pointer group">
                  <div class="flex items-center justify-between mb-2">
                     <div class="flex items-center gap-2">
                        <span class="text-[8px] bg-[#1a1a1a] text-[#737373] px-2 py-0.5 rounded uppercase font-bold">${evt.sportTitle}</span>
                        ${isLive ? '<span class="text-[8px] bg-red-500/20 text-red-500 border border-red-500/30 px-2 py-0.5 rounded uppercase font-bold animate-pulse">AO VIVO</span>' : ''}
                     </div>
                     <span class="text-[9px] text-[#737373] font-mono">${dateStr}</span>
                  </div>
                  <div class="flex items-center justify-between">
                     <div>
                        <p class="text-xs font-bold text-white group-hover:text-[#a3e635] transition-colors">${evt.homeTeam} <span class="text-[#737373] font-normal mx-1">x</span> ${evt.awayTeam}</p>
                     </div>
                     <div class="text-[#737373] group-hover:text-[#a3e635] transition-colors">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                     </div>
                  </div>
                  <div class="flex gap-2 mt-2">
                     <span class="text-[9px] text-[#737373] bg-[#1a1a1a] px-2 py-0.5 rounded flex items-center gap-1"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> Multi-Mercados</span>
                  </div>
                </div>
              `}).join('')}
            </div>
          </div>` : ''}
        </div>

      </div>
      
      <!-- Settings Modal -->
      <div id="dash-settings-modal" class="fixed inset-0 bg-black/80 z-50 flex items-center justify-center hidden backdrop-blur-sm">
         <div class="bg-[#0f0f0f] border border-[#262626] p-6 rounded-xl w-full max-w-sm shadow-2xl">
            <div class="flex items-center justify-between mb-4 pb-3 border-b border-[#262626]">
               <h3 class="text-sm font-bold text-white">Personalizar Dashboard</h3>
               <button onclick="window.DashboardView.toggleModal()" class="text-[#737373] hover:text-white"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
            </div>
            <div class="space-y-4 mb-6">
               <label class="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" id="pref-metrics" ${this.prefs.showMetrics ? 'checked' : ''} class="w-4 h-4 rounded border-[#262626] bg-[#1a1a1a] text-[#a3e635] focus:ring-[#a3e635] focus:ring-offset-[#0f0f0f]">
                  <span class="text-xs text-white">Métricas (KPIs)</span>
               </label>
               <label class="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" id="pref-opp" ${this.prefs.showOpportunities ? 'checked' : ''} class="w-4 h-4 rounded border-[#262626] bg-[#1a1a1a] text-[#a3e635] focus:ring-[#a3e635] focus:ring-offset-[#0f0f0f]">
                  <span class="text-xs text-white">Oportunidades em Destaque</span>
               </label>
               <label class="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" id="pref-events" ${this.prefs.showEvents ? 'checked' : ''} class="w-4 h-4 rounded border-[#262626] bg-[#1a1a1a] text-[#a3e635] focus:ring-[#a3e635] focus:ring-offset-[#0f0f0f]">
                  <span class="text-xs text-white">Mural de Eventos</span>
               </label>
            </div>
            <button onclick="window.DashboardView.savePrefs()" class="w-full bg-[#a3e635] text-black text-xs font-bold py-2 rounded hover:bg-[#86c820] transition-colors">Salvar Preferências</button>
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
