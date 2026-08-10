/**
 * SPORTSBOOK STRUCTURED SCANNERBET VIEW
 * Real betting platform layout with Sports Navigation Tree (Left), Matches & Odds Grid (Center), and Betslip Comparator (Right).
 */

class ScannerView {
  static render(params = {}) {
    const main = document.getElementById('app-main');
    if (!main) return;

    const state = window.sbState.getState();
    const sports = window.SCANNERBET_CONFIG.SPORTS;
    const bookmakers = window.SCANNERBET_CONFIG.BOOKMAKERS;
    const events = state.events || [];

    let selectedSportId = params.sportId || 'futebol';
    let selectedEventId = params.eventId || (events[0] ? events[0].id : null);
    let selectedSelectionIndex = params.selIndex || 0;

    const activeSport = sports.find(s => s.id === selectedSportId) || sports[0];
    const activeEvent = events.find(e => e.id === selectedEventId) || events[0];

    // Current selected market and selection for the betslip panel
    const currentMarket = (activeEvent && activeEvent.markets[0]) ? activeEvent.markets[0] : null;
    const currentSelection = (currentMarket && currentMarket.selections[selectedSelectionIndex]) 
      ? currentMarket.selections[selectedSelectionIndex] 
      : (currentMarket ? currentMarket.selections[0] : null);

    main.innerHTML = `
      <div class="space-y-6 animate-in fade-in duration-300">
        
        <!-- Header -->
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-surface-800 pb-4">
          <div>
            <div class="flex items-center gap-2 text-xs font-mono font-bold text-brand-400 uppercase tracking-widest">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span>ESTRUTURA SPORTSBOOK • SCANNERBET V3</span>
            </div>
            <h1 class="text-2xl md:text-3xl font-black text-white font-heading">Painel de Comparação & Análise</h1>
          </div>

          <div class="flex items-center gap-2 bg-surface-950 px-4 py-2 rounded-2xl border border-surface-800 text-xs">
            <span class="text-surface-400">Status dos Providers:</span>
            <span class="text-emerald-400 font-bold flex items-center gap-1">
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span> 4 Casas Ativas
            </span>
          </div>
        </div>

        <!-- MAIN THREE-COLUMN SPORTSBOOK LAYOUT -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <!-- LEFT COLUMN: SPORTS & LEAGUES NAVIGATION TREE (3 cols) -->
          <div class="lg:col-span-3 space-y-4">
            <div class="glass-panel p-4 rounded-3xl border border-surface-800 space-y-4">
              <div class="flex items-center justify-between border-b border-surface-800 pb-3">
                <h3 class="font-black text-white text-xs uppercase tracking-wider flex items-center gap-2">
                  <span>🏆</span> Esportes & Ligas
                </h3>
                <span class="text-[10px] bg-brand-500/20 text-brand-400 font-bold px-2 py-0.5 rounded-full">Ao Vivo</span>
              </div>

              <!-- Sports List -->
              <div class="space-y-1">
                ${sports.map(sport => `
                  <button data-sport="${sport.id}" class="scanner-sport-tree-item w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    selectedSportId === sport.id 
                      ? 'btn-primary-gradient text-white shadow-lg' 
                      : 'text-surface-300 hover:text-white hover:bg-surface-800/60'
                  }">
                    <span class="flex items-center gap-2">
                      <span class="text-base">${sport.icon}</span>
                      <span>${sport.name}</span>
                    </span>
                    <span class="text-[10px] px-2 py-0.5 rounded-full bg-surface-950/60 text-surface-400 font-mono">
                      ${events.filter(e => e.sportId === sport.id).length}
                    </span>
                  </button>
                `).join('')}
              </div>

              <!-- Top Leagues Quick Links -->
              <div class="pt-3 border-t border-surface-800 space-y-2">
                <span class="text-[10px] text-surface-400 uppercase font-mono font-bold tracking-widest block">Ligas em Destaque</span>
                <div class="space-y-1 text-xs">
                  <div class="p-2 rounded-xl bg-surface-950/80 border border-surface-800/80 text-surface-200 font-semibold flex items-center gap-2 cursor-pointer hover:border-brand-500">
                    <span>🇧🇷</span> Brasileirão Série A
                  </div>
                  <div class="p-2 rounded-xl bg-surface-950/80 border border-surface-800/80 text-surface-200 font-semibold flex items-center gap-2 cursor-pointer hover:border-brand-500">
                    <span>🇪🇺</span> Champions League
                  </div>
                  <div class="p-2 rounded-xl bg-surface-950/80 border border-surface-800/80 text-surface-200 font-semibold flex items-center gap-2 cursor-pointer hover:border-brand-500">
                    <span>🇺🇸</span> NBA Basketball
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- CENTER COLUMN: MATCHES & ODDS MATRIX GRID (6 cols) -->
          <div class="lg:col-span-6 space-y-4">
            
            <div class="flex items-center justify-between bg-surface-900/90 p-3 rounded-2xl border border-surface-800 text-xs">
              <span class="font-bold text-white flex items-center gap-2">
                <span>⚽</span> Partidas Disponíveis (${events.filter(e => e.sportId === selectedSportId).length})
              </span>
              <div class="flex items-center gap-2 text-[11px]">
                <button class="px-3 py-1 rounded-lg bg-brand-600 text-white font-bold">Todas</button>
                <button class="px-3 py-1 rounded-lg bg-surface-800 text-surface-300">Ao Vivo</button>
              </div>
            </div>

            <!-- Matches Catalog List -->
            <div class="space-y-4">
              ${events.filter(e => e.sportId === selectedSportId).map(ev => `
                <div class="glass-panel p-5 rounded-3xl border ${
                  activeEvent && activeEvent.id === ev.id ? 'glow-card-purple bg-surface-900/95' : 'border-surface-800 hover:border-surface-700'
                } space-y-4 transition-all">
                  
                  <!-- Match Header -->
                  <div class="flex items-center justify-between text-xs border-b border-surface-800/60 pb-3">
                    <div class="flex items-center gap-2">
                      <span class="font-black text-brand-400 uppercase tracking-wider">${ev.leagueName}</span>
                      ${ev.isLive ? `
                        <span class="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[10px] font-bold animate-pulse">
                          ${ev.status}
                        </span>
                      ` : `
                        <span class="text-surface-400 font-mono text-[11px]">${ev.time}</span>
                      `}
                    </div>
                    <span class="text-[11px] text-surface-400">${ev.stadium}</span>
                  </div>

                  <!-- Teams & Scores -->
                  <div class="flex items-center justify-between py-1">
                    <div class="font-black text-white text-base font-heading flex items-center gap-3">
                      <span>${ev.homeTeam}</span>
                      ${ev.isLive ? `<span class="text-rose-400 text-sm font-mono">[${ev.scoreLive.split('-')[0].trim()}]</span>` : ''}
                    </div>
                    <span class="text-xs font-black text-brand-500 px-3 py-1 bg-brand-500/10 rounded-xl border border-brand-500/30">VS</span>
                    <div class="font-black text-white text-base font-heading flex items-center gap-3">
                      ${ev.isLive ? `<span class="text-rose-400 text-sm font-mono">[${ev.scoreLive.split('-')[1].trim()}]</span>` : ''}
                      <span>${ev.awayTeam}</span>
                    </div>
                  </div>

                  <!-- Quick Odds Grid Buttons (Sportsbook Style) -->
                  ${ev.markets[0] ? `
                    <div class="space-y-2 pt-2 border-t border-surface-800/60">
                      <div class="flex items-center justify-between text-[11px] text-surface-400 font-semibold">
                        <span>${ev.markets[0].name}</span>
                        <span class="text-brand-400 font-mono">Melhor Cotação Destacada</span>
                      </div>

                      <div class="grid grid-cols-3 gap-2 text-xs">
                        ${ev.markets[0].selections.map((sel, sIdx) => `
                          <button 
                            class="scanner-select-odd-pill p-3 rounded-2xl bg-surface-950 border ${
                              activeEvent.id === ev.id && selectedSelectionIndex === sIdx ? 'border-brand-500 bg-brand-500/20 text-white glow-card-purple' : 'border-surface-800 text-surface-200 hover:border-surface-700'
                            } flex flex-col items-center justify-between gap-1 transition-all"
                            data-event-id="${ev.id}"
                            data-selection-index="${sIdx}"
                          >
                            <span class="text-[10px] text-surface-400 font-semibold truncate w-full text-center">${sel.name}</span>
                            <span class="text-sm font-black ${sel.best ? 'text-emerald-400' : 'text-white'} font-mono">${sel.odds[sel.best].toFixed(2)}</span>
                            <span class="text-[9px] uppercase font-bold text-surface-500">${sel.best}</span>
                          </button>
                        `).join('')}
                      </div>
                    </div>
                  ` : ''}

                </div>
              `).join('')}
            </div>

          </div>

          <!-- RIGHT COLUMN: BOLETIM DE APOSTAS & COMPARADOR (3 cols) -->
          <div class="lg:col-span-3 space-y-4">
            <div class="glass-panel p-5 rounded-3xl border border-brand-500/40 glow-card-purple space-y-5 sticky top-20">
              
              <div class="flex items-center justify-between border-b border-surface-800 pb-3">
                <h3 class="font-black text-white text-xs uppercase tracking-wider flex items-center gap-2">
                  <span>⚡</span> Boletim do Scanner
                </h3>
                <span class="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2.5 py-0.5 rounded-full font-bold">EV+ Calculado</span>
              </div>

              ${activeEvent && currentSelection ? `
                <div class="space-y-4 text-xs">
                  <!-- Match Summary -->
                  <div class="bg-surface-950 p-4 rounded-2xl border border-surface-800 space-y-2">
                    <span class="text-[10px] text-brand-400 font-bold uppercase tracking-wider block">${activeEvent.leagueName}</span>
                    <h4 class="font-black text-white text-sm">${activeEvent.homeTeam} vs ${activeEvent.awayTeam}</h4>
                    <div class="text-surface-300 pt-1">
                      Seleção: <strong class="text-white">${currentSelection.name}</strong>
                    </div>
                  </div>

                  <!-- Bookmakers Comparison Matrix -->
                  <div class="space-y-2">
                    <span class="text-[10px] text-surface-400 font-mono font-bold uppercase tracking-widest block">Comparação nas Casas:</span>
                    <div class="grid grid-cols-2 gap-2 text-center">
                      <div class="p-2.5 rounded-xl bg-surface-950 border ${currentSelection.best === 'betano' ? 'best-odd' : 'border-surface-800'}">
                        <span class="text-[10px] text-surface-400 block font-semibold">Betano</span>
                        <strong class="text-sm font-black font-mono">${currentSelection.odds.betano.toFixed(2)}</strong>
                      </div>
                      <div class="p-2.5 rounded-xl bg-surface-950 border ${currentSelection.best === 'bet365' ? 'best-odd' : 'border-surface-800'}">
                        <span class="text-[10px] text-surface-400 block font-semibold">bet365</span>
                        <strong class="text-sm font-black font-mono">${currentSelection.odds.bet365.toFixed(2)}</strong>
                      </div>
                      <div class="p-2.5 rounded-xl bg-surface-950 border ${currentSelection.best === 'superbet' ? 'best-odd' : 'border-surface-800'}">
                        <span class="text-[10px] text-surface-400 block font-semibold">Superbet</span>
                        <strong class="text-sm font-black font-mono">${currentSelection.odds.superbet.toFixed(2)}</strong>
                      </div>
                      <div class="p-2.5 rounded-xl bg-surface-950 border ${currentSelection.best === 'kto' ? 'best-odd' : 'border-surface-800'}">
                        <span class="text-[10px] text-surface-400 block font-semibold">KTO</span>
                        <strong class="text-sm font-black font-mono">${currentSelection.odds.kto.toFixed(2)}</strong>
                      </div>
                    </div>
                  </div>

                  <!-- Value Index Banner -->
                  <div class="p-3 bg-emerald-950/40 rounded-xl border border-emerald-500/40 text-emerald-200 text-[11px] leading-tight">
                    💡 <strong>Melhor Odd:</strong> <span class="text-emerald-400 font-bold">${currentSelection.odds[currentSelection.best].toFixed(2)}</span> na <strong>${currentSelection.best.toUpperCase()}</strong>.
                  </div>

                  <!-- MAIN TRIGGER ACTION BUTTON -->
                  <button 
                    id="scanner-main-run-ai-btn"
                    class="btn-primary-gradient w-full py-4 rounded-2xl text-white font-black text-xs transition-all shadow-xl flex items-center justify-center gap-2"
                  >
                    <span>⚡</span> ANALISAR COM SCANNERBET
                  </button>
                </div>
              ` : `
                <div class="p-6 text-center text-xs text-surface-400">Selecione uma aposta no painel central para analisar.</div>
              `}

            </div>
          </div>

        </div>

      </div>
    `;

    ScannerView.bindEvents(activeEvent, currentSelection);
  }

  static bindEvents(activeEvent, currentSelection) {
    // Sport Tree Items Click
    document.querySelectorAll('.scanner-sport-tree-item').forEach(btn => {
      btn.onclick = () => {
        const sportId = btn.getAttribute('data-sport');
        ScannerView.render({ sportId });
      };
    });

    // Odd Pill Click
    document.querySelectorAll('.scanner-select-odd-pill').forEach(pill => {
      pill.onclick = () => {
        const eventId = pill.getAttribute('data-event-id');
        const selIndex = parseInt(pill.getAttribute('data-selection-index') || '0');
        ScannerView.render({ eventId, selIndex });
      };
    });

    // Main Run AI Button Click Action
    const runAiBtn = document.getElementById('scanner-main-run-ai-btn');
    if (runAiBtn && activeEvent && currentSelection) {
      runAiBtn.onclick = async () => {
        window.Toast.show(`Analisando "${currentSelection.name}" com Inteligência Artificial...`, 'info');

        try {
          const res = await window.AiEngineService.analyzeBetSelection({
            event: activeEvent,
            market: { name: activeEvent.markets[0]?.name || 'Mercado da Partida' },
            selection: { name: currentSelection.name },
            bestOdd: currentSelection.odds[currentSelection.best],
            bookmaker: currentSelection.best.toUpperCase(),
            oddsObj: currentSelection.odds
          });

          window.ModalManager.openAiAnalysisModal(res);
          window.Toast.show('Análise do ScannerBet gerada com sucesso!', 'success');
        } catch (err) {
          if (err.message === 'PAYWALL_EXCEEDED') {
            window.ModalManager.openPaywallModal();
          } else {
            window.Toast.show(err.message || 'Erro ao processar análise.', 'error');
          }
        }
      };
    }
  }
}

window.ScannerView = ScannerView;
