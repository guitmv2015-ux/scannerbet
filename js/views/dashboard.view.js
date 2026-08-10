/**
 * SCANNERBET DEFINITIVE DASHBOARD VIEW
 * Premium SaaS Style inspired by Raven UI
 * PHASE 1 ARCHITECTURE: Consuming Real-Time Ready Services
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

    // Add padding to main container for maximum space utilization like Raven
    main.className = "flex-1 w-full p-6 lg:p-8 min-h-[calc(100vh-5rem)] flex flex-col";

    // Show initial loading skeleton or spinner while fetching architecture data
    main.innerHTML = `
      <div class="flex-1 flex items-center justify-center text-[#a3a3a3] text-sm animate-pulse">
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-[#a3e635]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        Sincronizando com Provedores de Odds...
      </div>
    `;

    // Phase 1: Fetch events via the new architecture
    let events = [];
    try {
      events = await window.EventsService.getLiveEvents();
    } catch (e) {
      console.error(e);
    }

    // Pre-calculate demo odds for the first event for mockup rendering
    let firstEventMockupHTML = '';
    
    if (events.length > 0) {
      const e1 = events[0];
      const m1 = e1.markets[0]; // Match Odds
      const homeSel = m1.selections[0];
      const awaySel = m1.selections[2];
      
      const homeOdds = await window.OddsProviderService.getOddsForSelection(e1.id, m1.id, homeSel.id);
      const betanoHome = homeOdds.find(o => o.provider === 'betano')?.odd || '-';
      const bet365Home = homeOdds.find(o => o.provider === 'bet365')?.odd || '-';

      const awayOdds = await window.OddsProviderService.getOddsForSelection(e1.id, m1.id, awaySel.id);
      const betanoAway = awayOdds.find(o => o.provider === 'betano')?.odd || '-';
      const bet365Away = awayOdds.find(o => o.provider === 'bet365')?.odd || '-';
      
      const updateTimestamp = new Date(homeOdds[0].timestamp).toLocaleTimeString('pt-BR');

      firstEventMockupHTML = `
        <div class="premium-card p-0 flex flex-col overflow-hidden">
          <div class="bg-[#1a1a1a] p-4 border-b border-[#262626] flex items-center justify-between">
            <span class="badge badge-accent">⚡ EVENTO REAL (TESTE)</span>
            <span class="text-[10px] text-[#737373]">${e1.leagueName}</span>
          </div>
          <div class="p-5">
            <div class="flex items-center justify-between mb-4">
              <span class="text-sm font-bold text-white">${e1.homeTeam}</span>
              <span class="text-xs font-bold text-[#737373]">VS</span>
              <span class="text-sm font-bold text-white">${e1.awayTeam}</span>
            </div>
            
            <div class="bg-[#0f0f0f] border border-[#262626] rounded-lg p-3 mb-2 space-y-2">
              <div class="flex justify-between text-[11px] items-center">
                <span class="text-[#737373]">Betano</span>
                <div class="flex gap-4">
                  <span class="font-mono text-white text-center"><span class="block text-[8px] text-[#737373]">1</span>${betanoHome}</span>
                  <span class="font-mono text-white text-center"><span class="block text-[8px] text-[#737373]">2</span>${betanoAway}</span>
                </div>
              </div>
              <div class="flex justify-between text-[11px] items-center">
                <span class="text-[#737373]">bet365</span>
                <div class="flex gap-4">
                  <span class="font-mono text-[#a3e635] font-bold text-center"><span class="block text-[8px] text-[#737373]">1</span>${bet365Home}</span>
                  <span class="font-mono text-[#a3e635] font-bold text-center"><span class="block text-[8px] text-[#737373]">2</span>${bet365Away}</span>
                </div>
              </div>
            </div>
            
            <div class="text-[9px] text-[#737373] text-right mb-4">
              Atualizado: ${updateTimestamp}
            </div>

            <div class="grid grid-cols-3 gap-2 text-center mb-5">
              <div class="bg-[#0a0a0a] rounded p-2 border border-[#262626]">
                <p class="text-[9px] text-[#737373]">Probabilidade</p>
                <p class="text-[12px] font-bold text-white mt-1">68%</p>
              </div>
              <div class="bg-[#a3e635]/10 rounded p-2 border border-[#a3e635]/20">
                <p class="text-[9px] text-[#a3e635]">Valor (EV)</p>
                <p class="text-[12px] font-bold text-[#a3e635] mt-1">+6.4%</p>
              </div>
              <div class="bg-[#0a0a0a] rounded p-2 border border-[#262626]">
                <p class="text-[9px] text-[#737373]">Confiança</p>
                <p class="text-[12px] font-bold text-[#06b6d4] mt-1">Alta</p>
              </div>
            </div>
            <button class="w-full btn-primary py-2.5">Analisar Mercado</button>
          </div>
        </div>
      `;
    }

    // Now render the actual dashboard grid
    main.innerHTML = `
      <div class="space-y-6 animate-in fade-in duration-300">
        
        <!-- Top Filters -->
        <div class="flex items-center gap-2">
          <button class="bg-[#a3e635] text-black px-4 py-1.5 rounded-md text-[11px] font-bold">Hoje</button>
          <button class="bg-[#141414] border border-[#262626] text-white hover:border-[#a3e635] transition-colors px-4 py-1.5 rounded-md text-[11px] font-semibold">7 Dias</button>
          <button class="bg-[#141414] border border-[#262626] text-white hover:border-[#a3e635] transition-colors px-4 py-1.5 rounded-md text-[11px] font-semibold">30 Dias</button>
        </div>

        <!-- Row 1: Premium Metric Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div class="premium-card p-5 relative overflow-hidden group">
            <div class="absolute -right-4 -top-4 w-16 h-16 bg-[#a3e635]/5 rounded-full blur-xl group-hover:bg-[#a3e635]/10 transition-colors"></div>
            <div class="flex items-center gap-2 mb-4">
              <div class="w-7 h-7 rounded bg-[#a3e635]/10 flex items-center justify-center text-[#a3e635]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
              </div>
              <span class="text-xs font-semibold text-white">Win Rate (IA)</span>
            </div>
            <div class="text-[32px] font-black text-white leading-none font-mono tracking-tight">72.4%</div>
            <div class="flex items-center justify-between mt-6 pt-3 border-t border-[#262626] text-[10px] text-[#737373] font-mono">
              <div class="flex justify-between w-full"><span class="text-white">Ontem:</span> <span>68.2%</span></div>
            </div>
          </div>

          <div class="premium-card p-5 relative overflow-hidden group">
            <div class="absolute -right-4 -top-4 w-16 h-16 bg-[#06b6d4]/5 rounded-full blur-xl group-hover:bg-[#06b6d4]/10 transition-colors"></div>
            <div class="flex items-center gap-2 mb-4">
              <div class="w-7 h-7 rounded bg-[#06b6d4]/10 flex items-center justify-center text-[#06b6d4]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
              </div>
              <span class="text-xs font-semibold text-white">Apostas Analisadas</span>
            </div>
            <div class="text-[32px] font-black text-white leading-none font-mono tracking-tight">340</div>
            <div class="flex items-center justify-between mt-6 pt-3 border-t border-[#262626] text-[10px] text-[#737373] font-mono">
              <div class="flex justify-between w-full"><span class="text-white">Últimos 7 dias:</span> <span>+142</span></div>
            </div>
          </div>

          <div class="premium-card p-5 relative overflow-hidden group">
            <div class="absolute -right-4 -top-4 w-16 h-16 bg-[#22c55e]/5 rounded-full blur-xl group-hover:bg-[#22c55e]/10 transition-colors"></div>
            <div class="flex items-center gap-2 mb-4">
              <div class="w-7 h-7 rounded bg-[#22c55e]/10 flex items-center justify-center text-[#22c55e]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
              </div>
              <span class="text-xs font-semibold text-white">Oportunidades EV+</span>
            </div>
            <div class="text-[32px] font-black text-white leading-none font-mono tracking-tight">1,204</div>
            <div class="flex items-center justify-between mt-6 pt-3 border-t border-[#262626] text-[10px] text-[#737373] font-mono">
              <div class="flex justify-between w-full"><span class="text-white">Hoje:</span> <span>34 Oportunidades</span></div>
            </div>
          </div>

          <div class="premium-card p-5 relative overflow-hidden group">
            <div class="absolute -right-4 -top-4 w-16 h-16 bg-[#8b5cf6]/5 rounded-full blur-xl group-hover:bg-[#8b5cf6]/10 transition-colors"></div>
            <div class="flex items-center gap-2 mb-4">
              <div class="w-7 h-7 rounded bg-[#8b5cf6]/10 flex items-center justify-center text-[#8b5cf6]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
              </div>
              <span class="text-xs font-semibold text-white">ROI Projetado (Mês)</span>
            </div>
            <div class="text-[32px] font-black text-[#a3e635] leading-none font-mono tracking-tight">+18.5%</div>
            <div class="flex items-center justify-between mt-6 pt-3 border-t border-[#262626] text-[10px] text-[#737373] font-mono">
              <div class="flex justify-between w-full"><span class="text-white">Meta:</span> <span>20.0%</span></div>
            </div>
          </div>

        </div>

        <!-- Row 2: Charts & Ranking -->
        <div class="flex flex-col lg:flex-row gap-4 h-auto lg:h-96">
          
          <!-- Left: Desempenho (Wide) -->
          <div class="premium-card flex-1 flex flex-col p-6">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-sm font-bold text-white">Desempenho de Acertos e Erros</h3>
              <button class="text-[10px] text-[#a3a3a3] hover:text-white">VER DETALHES ➔</button>
            </div>
            <div class="flex-1 flex items-center justify-center">
               <div id="dash-bar-chart-container" class="w-full h-full min-h-[200px]"></div>
            </div>
          </div>

          <!-- Right: Eventos Agendados List -->
          <div class="premium-card w-full lg:w-[400px] flex flex-col p-6">
            <div class="flex items-center justify-between mb-4 border-b border-[#262626] pb-3">
              <h3 class="text-sm font-bold text-white uppercase tracking-wider">Eventos do Dia (Fase 1)</h3>
              <button class="text-[10px] text-[#a3a3a3] hover:text-white">VER TODOS</button>
            </div>
            <div class="flex-1 space-y-3 overflow-y-auto pr-2">
              ${events.map((evt, i) => `
                <div class="flex items-center justify-between p-3 rounded-lg bg-[#0f0f0f] border border-[#262626] hover:border-[#a3e635]/50 transition-colors group cursor-pointer">
                  <div class="flex items-center gap-3">
                    <div class="w-6 h-6 rounded-full bg-[#1a1a1a] flex items-center justify-center text-[10px] font-bold text-[#737373] group-hover:text-white">${i+1}</div>
                    <div>
                      <p class="text-[11px] font-bold text-white">${evt.homeTeam} x ${evt.awayTeam}</p>
                      <p class="text-[9px] text-[#737373] mt-0.5">${evt.leagueName} • <span class="text-[#a3e635]">${evt.status}</span></p>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Row 3: Live Scanner Integration -->
        <h3 class="text-xs font-bold text-[#737373] uppercase tracking-widest mt-8 mb-2">Motor de Integração de Odds (Monitoramento)</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          <!-- Mockup 1: Análise Dinâmica (Carregado do Service) -->
          ${firstEventMockupHTML}

          <!-- Mockup 2: Recomendação IA ScannerBot -->
          <div class="premium-card p-0 flex flex-col overflow-hidden border-[#8b5cf6]/30 shadow-[0_0_20px_rgba(139,92,246,0.05)]">
            <div class="bg-gradient-to-r from-[#1a1a1a] to-[#2a1b38] p-4 border-b border-[#262626] flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="w-6 h-6 rounded bg-[#8b5cf6]/20 flex items-center justify-center text-[10px]">🤖</div>
                <span class="text-xs font-bold text-[#8b5cf6]">ScannerBot IA</span>
              </div>
              <span class="text-[10px] text-[#737373]">Há 2 minutos</span>
            </div>
            <div class="p-5 flex flex-col justify-between h-full">
              <div>
                <p class="text-xs text-[#a3a3a3] leading-relaxed mb-4">
                  "Nossa análise identificou uma discrepância de <strong class="text-white">12.5%</strong> no mercado de Escanteios Asiáticos para a partida entre Arsenal x Chelsea. As odds da Superbet estão desajustadas em relação às exchanges asiáticas."
                </p>
                <div class="flex items-center gap-2 mb-2">
                  <span class="w-1.5 h-1.5 rounded-full bg-[#a3e635]"></span>
                  <span class="text-[11px] text-white">Mercado: Over 9.5 Escanteios</span>
                </div>
                <div class="flex items-center gap-2 mb-4">
                  <span class="w-1.5 h-1.5 rounded-full bg-[#a3e635]"></span>
                  <span class="text-[11px] text-white">Odd Mínima Recomendada: @1.80</span>
                </div>
              </div>
              <button class="w-full btn-premium py-2.5">Ver Recomendação na Íntegra</button>
            </div>
          </div>

          <!-- Mockup 3: Status dos Provedores (Carregado do Service) -->
          <div class="premium-card p-0 flex flex-col overflow-hidden lg:col-span-1 md:col-span-2">
            <div class="bg-[#1a1a1a] p-4 border-b border-[#262626] flex items-center justify-between">
              <span class="text-xs font-bold text-white flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20V10M18 20V4M6 20v-4"></path></svg>
                Saúde das Integrações API
              </span>
            </div>
            <div class="p-0 overflow-x-auto">
              <table class="premium-table w-full">
                <thead>
                  <tr>
                    <th>Provedor</th>
                    <th>Status</th>
                    <th>Latência</th>
                    <th>Sincronização</th>
                  </tr>
                </thead>
                <tbody>
                  ${window.OddsProviderService.getProvidersStatus().map(prov => `
                    <tr>
                      <td class="font-bold text-white capitalize">${prov.name}</td>
                      <td>
                        <span class="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold">
                          ${prov.status}
                        </span>
                      </td>
                      <td class="font-mono text-[11px] text-[#737373]">${prov.latency}</td>
                      <td class="font-mono text-[11px] text-[#737373]">${prov.lastSync}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    `;

    DashboardView.bindEvents();
  }

  static bindEvents() {
    setTimeout(() => {
      // Dummy data for ScannerBet bar chart
      if (window.ChartRenderer) {
        window.ChartRenderer.renderBarChart('dash-bar-chart-container', [45, 60, 35, 80, 55, 90]);
      }
    }, 50);
  }
}

window.DashboardView = DashboardView;
