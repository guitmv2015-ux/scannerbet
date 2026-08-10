/**
 * SCANNERBET DEFINITIVE SCANNER VIEW
 * Real-time Odds API Integration - Phase 2
 */

class ScannerView {
  static async render() {
    const main = document.getElementById('app-main');
    if (!main) return;

    main.innerHTML = `
      <div class="flex flex-col h-[calc(100vh-5rem)]">
        <!-- Top Toolbar / Filters -->
        <div class="h-16 border-b border-[#262626] bg-[#0a0a0a] flex items-center px-6 gap-4 shrink-0">
          <div class="flex items-center gap-2 text-[#a3a3a3]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <span class="text-sm font-bold tracking-widest uppercase">Scanner em Tempo Real</span>
          </div>

          <div class="h-8 w-px bg-[#262626] mx-2"></div>

          <!-- Select Sport -->
          <select id="scanner-sport-select" class="bg-[#141414] border border-[#262626] text-white text-xs font-bold rounded px-3 py-1.5 focus:outline-none focus:border-[#a3e635]">
            <option value="">Carregando esportes...</option>
          </select>
          
          <button id="scanner-search-btn" class="btn-primary py-1.5 px-6 ml-auto" disabled>
            Buscar Partidas
          </button>
        </div>

        <!-- Content Area -->
        <div class="flex-1 overflow-hidden flex">
          
          <!-- Events List (Sidebar) -->
          <div class="w-[350px] border-r border-[#262626] bg-[#0a0a0a] flex flex-col h-full">
            <div class="p-4 border-b border-[#262626] flex items-center justify-between">
              <span class="text-xs font-bold text-[#737373] uppercase">Eventos Disponíveis</span>
              <span id="scanner-event-count" class="badge bg-[#262626] text-white">0</span>
            </div>
            <div id="scanner-events-list" class="flex-1 overflow-y-auto p-2 space-y-2">
              <div class="text-center p-6 text-[11px] text-[#737373]">
                Selecione um esporte e clique em buscar para carregar os eventos.
              </div>
            </div>
          </div>

          <!-- Main Analysis Area -->
          <div class="flex-1 bg-surface-950 flex flex-col h-full relative">
            <div id="scanner-main-content" class="absolute inset-0 overflow-y-auto p-8">
              <div class="flex flex-col items-center justify-center h-full text-center">
                <div class="w-16 h-16 rounded-full bg-[#1a1a1a] flex items-center justify-center text-[#737373] mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                </div>
                <h3 class="text-lg font-bold text-white mb-2">Nenhum evento selecionado</h3>
                <p class="text-sm text-[#737373] max-w-md">Selecione uma partida na lista lateral para carregar a matriz de comparação de odds em tempo real.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    `;

    await ScannerView.loadSports();
    ScannerView.bindEvents();
  }

  static async loadSports() {
    const select = document.getElementById('scanner-sport-select');
    const searchBtn = document.getElementById('scanner-search-btn');
    
    try {
      const sports = await window.EventsService.getActiveSports();
      select.innerHTML = sports.map(s => `<option value="${s.key}">${s.title}</option>`).join('');
      searchBtn.disabled = false;
    } catch (e) {
      select.innerHTML = `<option value="">Erro ao carregar esportes</option>`;
      console.error(e);
      window.sbApp.showToast('Erro de API', 'Não foi possível carregar os esportes. Verifique se a API_KEY está configurada.', 'error');
    }
  }

  static bindEvents() {
    const searchBtn = document.getElementById('scanner-search-btn');
    const select = document.getElementById('scanner-sport-select');
    
    searchBtn.addEventListener('click', async () => {
      const sportKey = select.value;
      if (!sportKey) return;
      
      const listContainer = document.getElementById('scanner-events-list');
      const countEl = document.getElementById('scanner-event-count');
      const mainContent = document.getElementById('scanner-main-content');
      
      searchBtn.disabled = true;
      searchBtn.innerHTML = 'Buscando...';
      listContainer.innerHTML = `<div class="text-center p-4 text-[#a3e635] text-xs font-bold animate-pulse">Consultando The Odds API...</div>`;
      mainContent.innerHTML = ''; // Clear main area
      
      try {
        const events = await window.EventsService.getLiveEvents(sportKey);
        countEl.textContent = events.length;
        
        if (events.length === 0) {
          listContainer.innerHTML = `<div class="text-center p-6 text-[11px] text-[#737373]">Nenhum evento encontrado para este esporte no momento.</div>`;
        } else {
          listContainer.innerHTML = events.map(evt => `
            <div class="scanner-event-card p-3 rounded-lg bg-[#0f0f0f] border border-[#262626] hover:border-[#a3e635] cursor-pointer transition-colors" data-id="${evt.id}">
              <div class="flex items-center justify-between mb-2">
                <span class="text-[9px] font-bold text-[#737373] tracking-widest">${new Date(evt.startTime).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
                <span class="text-[9px] font-bold ${evt.status === 'AO VIVO' ? 'text-red-500' : 'text-emerald-500'} bg-white/5 px-2 py-0.5 rounded">${evt.status}</span>
              </div>
              <p class="text-xs font-bold text-white mb-1 truncate">${evt.homeTeam}</p>
              <p class="text-xs font-bold text-white truncate">${evt.awayTeam}</p>
            </div>
          `).join('');
          
          // Bind click to load odds
          const cards = listContainer.querySelectorAll('.scanner-event-card');
          cards.forEach(card => {
            card.addEventListener('click', () => {
              // visual selection
              cards.forEach(c => c.classList.remove('border-[#a3e635]', 'bg-[#1a1a1a]'));
              card.classList.add('border-[#a3e635]', 'bg-[#1a1a1a]');
              
              const evtId = card.getAttribute('data-id');
              const selectedEvent = events.find(e => e.id === evtId);
              ScannerView.renderEventAnalysis(selectedEvent);
            });
          });
        }
      } catch (e) {
        listContainer.innerHTML = `<div class="text-center p-4 text-red-500 text-xs">Falha na integração com a API.</div>`;
      } finally {
        searchBtn.disabled = false;
        searchBtn.innerHTML = 'Buscar Partidas';
      }
    });
  }

  static renderEventAnalysis(event) {
    const mainContent = document.getElementById('scanner-main-content');
    
    // Convert Raw Bookmakers to normalized ScannerBet structure
    const normalizedMarkets = window.OddsProviderService.getNormalizedOddsForEvent(event);
    
    if (normalizedMarkets.length === 0) {
      mainContent.innerHTML = `
        <div class="premium-card p-8 text-center max-w-lg mx-auto mt-10">
          <h2 class="text-xl font-bold text-white mb-2">${event.homeTeam} x ${event.awayTeam}</h2>
          <p class="text-[#737373] text-sm">Nenhuma odd disponível nas casas de apostas monitoradas para este evento no momento.</p>
        </div>
      `;
      return;
    }

    // Render Event Header
    let html = `
      <div class="mb-8">
        <div class="flex items-center gap-3 mb-2">
          <span class="badge bg-[#141414] border border-[#262626] text-[#a3a3a3]">${event.sportTitle}</span>
          <span class="badge ${event.status === 'AO VIVO' ? 'badge-primary bg-red-500/10 text-red-500' : 'badge-accent'}">${event.status}</span>
        </div>
        <h1 class="text-3xl font-black text-white tracking-tight">${event.homeTeam} <span class="text-[#737373] font-normal mx-2">vs</span> ${event.awayTeam}</h1>
        <p class="text-sm text-[#737373] mt-2">Data do Evento: ${new Date(event.startTime).toLocaleString('pt-BR')}</p>
      </div>
      
      <div class="space-y-8">
    `;

    // Render each market table
    normalizedMarkets.forEach(market => {
      html += `
        <div class="premium-card overflow-hidden">
          <div class="bg-[#1a1a1a] p-4 border-b border-[#262626] flex items-center justify-between">
            <h3 class="text-sm font-bold text-white uppercase tracking-wider">${market.name}</h3>
          </div>
          
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-[#262626] bg-[#0a0a0a]">
                  <th class="p-4 text-xs font-bold text-[#737373] uppercase tracking-wider font-mono">Seleção</th>
                  <th class="p-4 text-xs font-bold text-[#737373] uppercase tracking-wider font-mono">⭐ Melhor Odd</th>
                  <th class="p-4 text-xs font-bold text-[#737373] uppercase tracking-wider font-mono">Casa</th>
                  <th class="p-4 text-xs font-bold text-[#737373] uppercase tracking-wider font-mono">Última Atualização</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#262626]">
                ${market.selections.map(sel => {
                  if (!sel.bestOdd) return '';
                  const timeStr = new Date(sel.bestOdd.timestamp).toLocaleTimeString('pt-BR');
                  return `
                    <tr class="hover:bg-[#141414] transition-colors group">
                      <td class="p-4">
                        <span class="text-sm font-bold text-white">${sel.name}</span>
                      </td>
                      <td class="p-4">
                        <span class="text-lg font-black text-[#a3e635] tracking-tighter">${parseFloat(sel.bestOdd.odd).toFixed(2)}</span>
                      </td>
                      <td class="p-4">
                        <span class="inline-flex items-center gap-2 text-xs font-bold text-white bg-[#262626] px-2 py-1 rounded">
                          ${sel.bestOdd.bookmaker}
                        </span>
                      </td>
                      <td class="p-4 text-xs font-mono text-[#737373]">
                        ${timeStr}
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    });

    html += `</div>`;
    mainContent.innerHTML = html;
  }
}

window.ScannerView = ScannerView;
