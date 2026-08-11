/**
 * SCANNERBET SCANNER VIEW - FASE 12
 * Terminal Multimercado, Comparador de Casas e Insights
 */

class ScannerView {
  static async render(params) {
    const main = document.getElementById('app-main');
    if (!main) return;

    main.innerHTML = `
      <div class="flex-1 w-full p-4 flex items-center justify-center min-h-[calc(100vh-5rem)]">
        <div class="flex flex-col items-center">
            <div class="w-10 h-10 border-4 border-[#262626] border-t-[#06b6d4] rounded-full animate-spin mb-4"></div>
            <span class="text-sm font-bold text-white">Construindo Matrizes de Odds...</span>
        </div>
      </div>
    `;

    try {
      this.allEvents = await window.EventsService.getMassiveEvents();
      
      let targetSport = params && params.sportKey ? params.sportKey : null;
      let targetEventId = params && params.eventId ? params.eventId : null;

      if (!targetEventId) {
          if (this.allEvents && this.allEvents.length > 0) {
              targetSport = this.allEvents[0].sportKey;
              targetEventId = this.allEvents[0].id;
          } else {
              throw new Error("Nenhum evento ativo no momento para escanear.");
          }
      }

      this.currentEvent = this.allEvents.find(e => e.id === targetEventId);
      if (!this.currentEvent) {
          this.currentEvent = await window.EventsService.getEventById(targetSport, targetEventId);
      }
      if (!this.currentEvent) throw new Error("Evento não encontrado");

      this.normalizedMarkets = window.OddsProviderService.getNormalizedOddsForEvent(this.currentEvent);
      this.activeTab = 'overview';
      this.activeLines = {}; 

      this.calculateOtherOpportunities();
      this.renderFullScanner(main);
    } catch (error) {
       console.error(error);
       main.innerHTML = `
         <div class="p-8 text-center bg-[#141414] border border-[#262626] rounded-xl max-w-2xl mx-auto mt-10">
            <h3 class="text-red-500 font-bold mb-2 uppercase tracking-widest">Erro no Scanner</h3>
            <p class="text-sm text-[#a3a3a3] mb-6">${error.message || 'Falha ao carregar as matrizes.'}</p>
            <button onclick="window.sbApp.navigateTo('dashboard')" class="bg-[#06b6d4]/10 hover:bg-[#06b6d4] text-[#06b6d4] hover:text-black border border-[#06b6d4]/30 px-6 py-2 rounded text-[11px] font-bold transition-all uppercase tracking-widest">Voltar ao Dashboard</button>
         </div>
       `;
    }
  }

  static calculateOtherOpportunities() {
     this.otherOpportunities = [];
     if (!this.normalizedMarkets) return;
     
     this.normalizedMarkets.forEach(market => {
         market.selections.forEach(sel => {
             if (sel.allOdds.length > 1) {
                 let highest = parseFloat(sel.allOdds[0].odd);
                 let bestOddObj = sel.allOdds[0];
                 let sum = 0;
                 
                 sel.allOdds.forEach(o => {
                     const val = parseFloat(o.odd);
                     if (val > highest) { highest = val; bestOddObj = o; }
                     sum += val;
                 });
                 
                 const avg = sum / sel.allOdds.length;
                 const diff = ((highest - avg) / avg) * 100;
                 
                 if (diff >= 0.5) { 
                     this.otherOpportunities.push({
                         market: market,
                         selection: sel,
                         bestOddObj: bestOddObj,
                         diff: diff.toFixed(2),
                         avg: avg.toFixed(2)
                     });
                 }
             }
         });
     });
     
     this.otherOpportunities.sort((a, b) => b.diff - a.diff);
  }

  static generateInsights(market, activeSelections) {
      if (!activeSelections || activeSelections.length === 0) return [];
      const insights = [];
      
      activeSelections.forEach(sel => {
          if (sel.allOdds.length > 1) {
              let highest = parseFloat(sel.allOdds[0].odd);
              let lowest = highest;
              let bestObj = sel.allOdds[0];
              let worstObj = sel.allOdds[0];
              let sum = 0;
              
              sel.allOdds.forEach(o => {
                  const val = parseFloat(o.odd);
                  if (val > highest) { highest = val; bestObj = o; }
                  if (val < lowest) { lowest = val; worstObj = o; }
                  sum += val;
              });
              
              const avg = sum / sel.allOdds.length;
              const diff = ((highest - avg) / avg) * 100;
              
              if (diff > 3) {
                  insights.push({ type: 'highlight', text: `${bestObj.bookmaker} apresenta a MAIOR cotação para ${sel.fullName} com uma discrepância de ${diff.toFixed(1)}% acima da média.` });
              } else if (diff > 1) {
                  insights.push({ type: 'normal', text: `Vale analisar a odd de @${highest.toFixed(2)} da ${bestObj.bookmaker} para ${sel.fullName}.` });
              }

              if (sel.allOdds.length > 3 && ((highest - lowest)/lowest)*100 > 10) {
                  insights.push({ type: 'warning', text: `Alta variação no mercado para ${sel.fullName}: Diferença entre a melhor (${bestObj.bookmaker}) e a pior odd (${worstObj.bookmaker}) é muito grande.` });
              }
          }
      });
      
      return insights;
  }

  static switchEvent(eventId) {
      const evt = this.allEvents.find(e => e.id === eventId);
      if (evt) {
          window.sbApp.navigateTo('scanner', { sportKey: evt.sportKey, eventId: evt.id });
      }
  }

  static handleEventSearch(e) {
      const query = e.target.value.toLowerCase();
      const dropdown = document.getElementById('scanner-event-dropdown');
      if (!query) {
          dropdown.classList.add('hidden');
          return;
      }
      
      const results = this.allEvents.filter(evt => 
          evt.homeTeam.toLowerCase().includes(query) || 
          evt.awayTeam.toLowerCase().includes(query)
      ).slice(0, 5);

      if (results.length > 0) {
          dropdown.innerHTML = results.map(r => `
             <div onclick="window.ScannerView.switchEvent('${r.id}')" class="p-3 hover:bg-[#262626] cursor-pointer border-b border-[#262626] last:border-0 transition-colors">
                <p class="text-sm font-bold text-white">${r.homeTeam} x ${r.awayTeam}</p>
                <p class="text-[10px] text-[#06b6d4]">${r.sportTitle}</p>
             </div>
          `).join('');
          dropdown.classList.remove('hidden');
      } else {
          dropdown.innerHTML = `<div class="p-3 text-sm text-[#737373]">Nenhum evento encontrado</div>`;
          dropdown.classList.remove('hidden');
      }
  }

  static renderFullScanner(main) {
    const isLive = this.currentEvent.status === 'AO VIVO';
    const dateFormatted = window.DateUtil ? window.DateUtil.formatEventDate(this.currentEvent.startTime) : new Date(this.currentEvent.startTime).toLocaleString('pt-BR');

    // TABS
    let tabsHtml = `
      <button class="px-5 py-3 text-[11px] uppercase tracking-widest font-bold whitespace-nowrap border-b-2 transition-all ${this.activeTab === 'overview' ? 'border-[#06b6d4] text-[#06b6d4]' : 'border-transparent text-[#737373] hover:text-white hover:bg-[#141414]'}"
              onclick="window.ScannerView.switchTab('overview')">
         VISÃO GERAL
      </button>
    `;
    
    this.normalizedMarkets.forEach(m => {
       tabsHtml += `
         <button class="px-5 py-3 text-[11px] uppercase tracking-widest font-bold whitespace-nowrap border-b-2 transition-all ${this.activeTab === m.id ? 'border-[#06b6d4] text-white' : 'border-transparent text-[#737373] hover:text-white hover:bg-[#141414]'}"
                 onclick="window.ScannerView.switchTab('${m.id}')">
            ${m.name}
         </button>
       `;
    });

    const updateTimeStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const totalBookies = new Set(this.normalizedMarkets.flatMap(m => m.selections.flatMap(s => s.allOdds.map(o => o.bookmaker)))).size;

    main.innerHTML = `
      <div class="flex-1 w-full p-4 lg:p-6 flex flex-col relative animate-in fade-in duration-500 max-w-[1600px] mx-auto pb-12">
         
         <!-- SEARCH TOP BAR -->
         <div class="w-full bg-[#0a0a0a] border border-[#262626] rounded-xl p-3 mb-6 flex items-center justify-between z-20">
             <div class="relative w-full max-w-md">
                <input type="text" placeholder="Consultar outro evento..." 
                       class="w-full bg-[#141414] border border-[#333] text-white text-sm rounded-lg pl-9 pr-4 py-2 focus:border-[#06b6d4] focus:outline-none transition-colors"
                       onkeyup="window.ScannerView.handleEventSearch(event)">
                <svg class="absolute left-3 top-2.5 text-[#737373]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                
                <div id="scanner-event-dropdown" class="absolute top-full left-0 w-full mt-2 bg-[#141414] border border-[#262626] rounded-xl shadow-2xl hidden z-50 max-h-60 overflow-y-auto"></div>
             </div>
             <button onclick="window.sbApp.navigateTo('dashboard')" class="text-[10px] text-[#737373] hover:text-white font-bold uppercase tracking-widest flex items-center gap-1 transition-colors">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
                Dashboard
             </button>
         </div>

         <!-- HEADER DO EVENTO (Fase 12) -->
         <div class="flex flex-col xl:flex-row gap-6 mb-8 relative overflow-hidden rounded-xl border border-[#262626]">
            <!-- Decorative bg -->
            <div class="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] to-[#141414] z-0"></div>
            
            <div class="flex-1 p-6 lg:p-8 relative z-10 flex flex-col justify-center">
                <div class="flex flex-wrap items-center gap-3 mb-5">
                   <span class="bg-[#1a1a1a] border border-[#333] text-[#06b6d4] text-[10px] px-3 py-1 rounded font-black uppercase tracking-widest shadow-lg">${this.currentEvent.sportTitle}</span>
                   <span class="bg-[#1a1a1a] border border-[#333] ${isLive ? 'text-red-500' : 'text-[#a3a3a3]'} text-[10px] px-3 py-1 rounded font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
                      ${isLive ? '<span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>' : ''} ${this.currentEvent.status}
                   </span>
                   <span class="bg-[#1a1a1a] border border-[#333] text-[#737373] text-[10px] px-3 py-1 rounded font-bold uppercase tracking-widest shadow-lg flex items-center gap-1.5">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                      ${dateFormatted}
                   </span>
                </div>
                <h1 class="text-3xl lg:text-5xl font-black text-white tracking-tight flex flex-col md:flex-row md:items-center gap-3 md:gap-5 leading-none">
                   <span>${this.currentEvent.homeTeam}</span> 
                   <span class="text-[#404040] text-2xl font-light">x</span> 
                   <span>${this.currentEvent.awayTeam}</span>
                </h1>
            </div>
            
            <div class="flex flex-wrap sm:flex-nowrap gap-px bg-[#262626] xl:w-[450px] relative z-10">
                <div class="flex-1 bg-[#0a0a0a] p-6 flex flex-col justify-center items-center text-center hover:bg-[#0f0f0f] transition-colors">
                   <p class="text-[9px] text-[#737373] uppercase tracking-widest font-bold mb-1">Última Atualização</p>
                   <p class="text-xl font-bold text-white font-mono">${updateTimeStr}</p>
                </div>
                <div class="flex-1 bg-[#0a0a0a] p-6 flex flex-col justify-center items-center text-center hover:bg-[#0f0f0f] transition-colors">
                   <p class="text-[9px] text-[#737373] uppercase tracking-widest font-bold mb-1">Casas Monitoradas</p>
                   <p class="text-3xl font-black text-white font-mono">${totalBookies}</p>
                </div>
                <div class="flex-1 bg-[#0a0a0a] p-6 flex flex-col justify-center items-center text-center hover:bg-[#0f0f0f] transition-colors">
                   <p class="text-[9px] text-[#737373] uppercase tracking-widest font-bold mb-1">Mercados</p>
                   <p class="text-3xl font-black text-[#06b6d4] font-mono">${this.normalizedMarkets.length}</p>
                </div>
            </div>
         </div>

         <!-- TABS -->
         <div class="flex overflow-x-auto border-b border-[#262626] mb-6 custom-scrollbar bg-[#0a0a0a]/50 backdrop-blur sticky top-0 z-30">
            ${tabsHtml}
         </div>

         <!-- CONTENT GRID -->
         <div class="flex flex-col xl:flex-row gap-6">
            <div id="scanner-content-area" class="w-full xl:w-3/4">
               ${this.renderTabContent()}
            </div>
            
            <div class="w-full xl:w-1/4 flex flex-col gap-6">
               ${this.renderActionPanel()}
               ${this.renderOpportunitiesPanel()}
            </div>
         </div>
      </div>
    `;
    
    document.addEventListener('click', (e) => {
        const dd = document.getElementById('scanner-event-dropdown');
        if (dd && !e.target.closest('.relative')) {
            dd.classList.add('hidden');
        }
    });
  }

  static switchTab(tabId) {
    this.activeTab = tabId;
    const contentArea = document.getElementById('scanner-content-area');
    if (contentArea) contentArea.innerHTML = this.renderTabContent();
    this.renderFullScanner(document.getElementById('app-main'));
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
    let html = `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">`;
    
    this.normalizedMarkets.forEach(m => {
       html += `<div class="bg-gradient-to-b from-[#141414] to-[#0a0a0a] border border-[#262626] rounded-xl p-5 flex flex-col hover:border-[#404040] transition-colors shadow-lg">
          <h4 class="text-[11px] font-black text-white mb-4 uppercase tracking-widest border-b border-[#262626] pb-3 flex items-center gap-2">
             <span class="w-1.5 h-1.5 rounded-full bg-[#06b6d4]"></span>
             ${m.name}
          </h4>
          <div class="flex flex-col gap-3 flex-1">
             ${m.selections.slice(0, 4).map(sel => `
                <div class="flex items-center justify-between group bg-[#0f0f0f] p-2 rounded-lg border border-[#1a1a1a]">
                   <span class="text-xs text-[#a3a3a3] font-bold truncate pr-2 group-hover:text-white transition-colors">${sel.fullName}</span>
                   ${sel.bestOdd ? `
                   <div class="flex flex-col items-end">
                      <span class="text-sm font-black text-[#a3e635] leading-none mb-1">@${parseFloat(sel.bestOdd.odd).toFixed(2)}</span>
                      <span class="text-[8px] bg-[#1a1a1a] text-[#737373] px-1.5 py-0.5 rounded border border-[#333] uppercase tracking-wider">${sel.bestOdd.bookmaker}</span>
                   </div>` : '<span class="text-[10px] text-[#404040]">-</span>'}
                </div>
             `).join('')}
             ${m.selections.length > 4 ? `<div class="text-[9px] text-[#06b6d4] text-center mt-2 uppercase font-bold tracking-widest py-1 bg-[#06b6d4]/10 rounded">+ ${m.selections.length - 4} LINHAS DISPONÍVEIS</div>` : ''}
          </div>
          <button onclick="window.ScannerView.switchTab('${m.id}')" class="mt-4 w-full bg-[#1a1a1a] hover:bg-[#06b6d4] text-white hover:text-black text-[10px] uppercase tracking-widest font-bold py-3 rounded-lg border border-[#333] hover:border-[#06b6d4] transition-all">
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
            <div class="mb-6 flex flex-col lg:flex-row lg:items-center gap-4 bg-[#0a0a0a] p-4 rounded-xl border border-[#262626]">
               <span class="text-[10px] uppercase text-[#737373] font-bold tracking-widest whitespace-nowrap"><svg class="inline mr-1 mb-0.5" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 9h16M4 15h16"/></svg> Selecione a Linha:</span>
               <div class="flex gap-2 overflow-x-auto custom-scrollbar pb-2 pt-1 w-full">
                  ${uniqueLines.map(line => `
                     <button onclick="window.ScannerView.setMarketLine('${market.id}', ${line})" 
                             class="px-4 py-2 rounded-lg text-sm font-black font-mono transition-all border ${currentLine === line ? 'bg-[#06b6d4] text-black border-[#06b6d4] shadow-[0_0_15px_rgba(6,182,212,0.4)] transform -translate-y-0.5' : 'bg-[#141414] text-[#a3a3a3] border-[#333] hover:border-[#404040] hover:text-white'}">
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
     const bookmakersList = Array.from(bookmakersSet).sort();

     if (bookmakersList.length === 0) {
         return `${lineSelectorHtml}<div class="p-8 text-center text-[#737373] bg-[#0a0a0a] rounded-xl border border-[#262626]">Nenhuma cotação para esta linha.</div>`;
     }

     // Calculate insights for current table
     const insights = this.generateInsights(market, activeSelections);

     let insightsHtml = '';
     if (insights.length > 0) {
         insightsHtml = `
            <div class="mb-6 space-y-2">
               <h4 class="text-[10px] text-[#06b6d4] uppercase tracking-widest font-black mb-3 flex items-center gap-2"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg> Scanner Insights (Robô)</h4>
               ${insights.map(ins => `
                   <div class="bg-[#0f0f0f] border-l-2 ${ins.type === 'highlight' ? 'border-[#06b6d4]' : (ins.type === 'warning' ? 'border-yellow-500' : 'border-[#404040]')} p-3 rounded-r-lg text-xs text-[#a3a3a3]">
                      ${ins.text}
                   </div>
               `).join('')}
            </div>
         `;
     }

     // TABLE (Comparativo Detalhado de Casas)
     let thHtml = `<th class="px-5 py-4 text-left text-[10px] font-black text-[#737373] uppercase tracking-wider bg-[#141414] sticky left-0 z-20 border-b border-[#262626] rounded-tl-xl w-48 shadow-[5px_0_15px_-5px_rgba(0,0,0,0.5)]">BOOKMAKER</th>`;
     activeSelections.forEach(sel => {
         thHtml += `<th class="px-5 py-4 text-center text-xs font-black text-white uppercase tracking-wider bg-[#141414] border-b border-[#262626] min-w-[140px]">${sel.fullName}</th>`;
     });

     let rowsHtml = '';
     bookmakersList.forEach(bookie => {
         rowsHtml += `<tr class="border-b border-[#262626] hover:bg-[#1a1a1a] transition-colors group">
            <td class="px-5 py-3 font-bold text-sm text-[#a3a3a3] group-hover:text-white sticky left-0 bg-[#0a0a0a] group-hover:bg-[#1a1a1a] border-r border-[#262626]/50 transition-colors z-10 shadow-[5px_0_15px_-5px_rgba(0,0,0,0.3)]">
               <div class="flex items-center gap-3">
                  <div class="w-6 h-6 rounded bg-[#262626] flex items-center justify-center text-[10px] font-black text-white border border-[#404040] shadow-inner">${bookie.charAt(0)}</div>
                  ${bookie}
               </div>
            </td>
         `;
         
         activeSelections.forEach(sel => {
             const oddData = sel.allOdds.find(o => o.bookmaker === bookie);
             if (oddData) {
                 const isBest = sel.bestOdd && sel.bestOdd.bookmaker === bookie;
                 const oddVal = parseFloat(oddData.odd).toFixed(2);
                 rowsHtml += `
                    <td class="px-5 py-2.5 text-center relative">
                       <button onclick="window.ScannerView.openPickModal('${market.id}', '${sel.fullName.replace(/'/g, "\\'")}', '${bookie}', ${oddVal}, '${sel.line}')" 
                               class="w-full relative font-mono font-black text-base py-2.5 rounded-lg border transition-all overflow-hidden
                               ${isBest ? 'bg-[#a3e635]/20 border-[#a3e635] text-[#a3e635] hover:bg-[#a3e635] hover:text-black shadow-[0_0_20px_rgba(163,230,53,0.15)]' : 'bg-[#141414] border-[#333] text-[#a3a3a3] hover:border-[#06b6d4] hover:text-white hover:bg-[#06b6d4]/10'}">
                          ${isBest ? `<span class="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></span>` : ''}
                          <span class="relative z-10 flex flex-col items-center justify-center">
                             ${isBest ? `<span class="text-[7px] text-[#a3e635] uppercase tracking-widest mb-0.5 leading-none">⭐ Maior Odd</span>` : ''}
                             ${oddVal}
                          </span>
                       </button>
                    </td>
                 `;
             } else {
                 rowsHtml += `<td class="px-5 py-2.5 text-center"><div class="w-full py-3 bg-[#0f0f0f] rounded-lg border border-dashed border-[#262626] text-[#404040] text-sm">-</div></td>`;
             }
         });
         rowsHtml += `</tr>`;
     });

     return `
        ${lineSelectorHtml}
        ${insightsHtml}
        <div class="bg-[#0a0a0a] border border-[#262626] rounded-xl overflow-x-auto custom-scrollbar shadow-2xl animate-in fade-in duration-300 relative mb-8">
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

  static renderActionPanel() {
      return `
         <div class="bg-[#0a0a0a] border border-[#262626] rounded-xl p-5 shadow-2xl">
            <h3 class="text-[10px] text-[#737373] uppercase tracking-widest font-black mb-4">Ações Rápidas</h3>
            <button onclick="window.sbApp.navigateTo('dashboard')" class="w-full mb-3 bg-[#141414] hover:bg-[#1a1a1a] text-[#a3a3a3] hover:text-white text-[11px] font-bold py-3 rounded-lg border border-[#333] transition-colors flex items-center justify-center gap-2">
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
               Voltar para Dashboard
            </button>
            <button onclick="window.ScannerView.render({ sportKey: '${this.currentEvent.sportKey}', eventId: '${this.currentEvent.id}' })" class="w-full bg-[#141414] hover:bg-[#06b6d4] text-[#06b6d4] hover:text-black text-[11px] font-bold py-3 rounded-lg border border-[#06b6d4]/30 transition-all flex items-center justify-center gap-2">
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>
               Atualizar Cotações
            </button>
         </div>
      `;
  }

  static renderOpportunitiesPanel() {
      let html = `
         <div class="bg-[#0a0a0a] border border-[#262626] rounded-xl flex flex-col h-[500px] overflow-hidden shadow-2xl">
            <div class="p-4 border-b border-[#262626] bg-[#141414]">
               <h3 class="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a3e635" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  📌 Sugestões para Análise
               </h3>
               <p class="text-[9px] text-[#737373] mt-1">Distorções neste evento</p>
            </div>
            <div class="p-4 flex-1 overflow-y-auto custom-scrollbar space-y-3">
      `;
      
      if (!this.otherOpportunities || this.otherOpportunities.length === 0) {
          html += `<div class="h-full flex items-center justify-center text-center"><p class="text-[11px] text-[#737373]">Nenhuma discrepância relevante encontrada no mercado no momento.</p></div>`;
      } else {
          this.otherOpportunities.slice(0, 8).forEach(opp => {
              html += `
                 <div class="bg-[#141414] border border-[#333] hover:border-[#06b6d4]/50 rounded-lg p-4 transition-colors cursor-pointer group"
                      onclick="window.ScannerView.switchTab('${opp.market.id}')">
                     <div class="flex items-center justify-between mb-3">
                       <span class="text-[9px] uppercase tracking-widest text-[#a3a3a3] font-black bg-[#1a1a1a] px-2 py-0.5 rounded border border-[#262626]">${opp.market.name}</span>
                       <span class="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-black">+${opp.diff}%</span>
                    </div>
                    <p class="text-base font-black text-white mb-3 truncate group-hover:text-[#06b6d4] transition-colors">${opp.selection.fullName}</p>
                    <div class="flex items-end justify-between bg-[#0a0a0a] p-2 rounded border border-[#262626]">
                       <div class="flex flex-col">
                          <span class="text-[8px] uppercase tracking-widest text-[#737373] font-bold">${opp.bestOddObj.bookmaker}</span>
                          <span class="text-sm font-black text-[#a3e635] font-mono leading-none mt-1">@${parseFloat(opp.bestOddObj.odd).toFixed(2)}</span>
                       </div>
                       <span class="text-[9px] text-[#737373] font-bold">Média: ${opp.avg}</span>
                    </div>
                 </div>
              `;
          });
      }

      html += `</div></div>`;
      return html;
  }

  static openPickModal(marketId, selection, bookmaker, odd, line) {
    if (!window.sbApp || !window.sbApp.components || !window.sbApp.components.Modal) return;
    
    const evt = this.currentEvent;
    const market = this.normalizedMarkets.find(m => m.id === marketId);
    
    const html = `
      <div class="bg-[#0a0a0a] p-4 rounded-xl border border-[#262626] mb-5">
         <div class="flex justify-between items-start mb-4 border-b border-[#262626] pb-3">
            <div>
               <span class="text-[9px] text-[#737373] uppercase tracking-wider font-bold block mb-1">Evento Escaneado</span>
               <h4 class="text-sm font-black text-white">${evt.homeTeam} x ${evt.awayTeam}</h4>
            </div>
            <div class="text-right">
               <span class="text-[9px] text-[#737373] uppercase tracking-wider font-bold block mb-1">Mercado</span>
               <h4 class="text-[11px] font-bold text-[#06b6d4] uppercase tracking-widest bg-[#06b6d4]/10 px-2 py-0.5 rounded border border-[#06b6d4]/20">${market.name}</h4>
            </div>
         </div>
         
         <div class="flex flex-col md:flex-row justify-between items-center gap-4 bg-[#141414] p-5 rounded-lg border border-[#333] shadow-inner">
            <div class="text-center md:text-left w-full md:w-auto">
               <span class="text-[9px] text-[#737373] uppercase tracking-wider font-bold block mb-1">Seleção de Aposta</span>
               <h4 class="text-xl font-black text-white">${selection}</h4>
            </div>
            <div class="text-center md:text-right w-full md:w-auto flex flex-col items-center md:items-end">
               <span class="text-[9px] bg-[#262626] text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider mb-2">${bookmaker}</span>
               <h4 class="text-4xl font-black text-[#a3e635] leading-none font-mono drop-shadow-md">@${parseFloat(odd).toFixed(2)}</h4>
            </div>
         </div>
      </div>
      
      <div class="mb-5">
         <label class="text-[10px] text-[#737373] font-bold uppercase tracking-wider mb-2 block pl-1">Valor da Stake (R$)</label>
         <div class="relative">
            <span class="absolute left-4 top-3.5 text-[#737373] font-bold">R$</span>
            <input type="number" id="pick-stake" value="100" min="1" step="1" 
                   class="w-full bg-[#0f0f0f] border border-[#333] text-white text-xl font-black font-mono rounded-xl pl-12 pr-4 py-3 focus:border-[#a3e635] focus:ring-1 focus:ring-[#a3e635] focus:outline-none transition-all shadow-inner"
                   oninput="window.ScannerView.updateModalCalculations(${odd})">
         </div>
      </div>
      
      <div class="flex justify-between items-center bg-[#1a1a1a] p-5 rounded-xl border border-[#333]">
         <div class="flex flex-col">
            <span class="text-[10px] text-[#737373] font-bold uppercase tracking-wider mb-1">Lucro Líquido Estimado</span>
            <span id="pick-profit" class="text-2xl font-black text-[#a3e635] font-mono">+ R$ ${(100 * parseFloat(odd) - 100).toFixed(2)}</span>
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
                 stake: stake
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
        profitDisplay.className = 'text-2xl font-black text-[#a3e635] font-mono';
     } else {
        profitDisplay.textContent = `R$ ${profit.toFixed(2)}`;
        profitDisplay.className = 'text-2xl font-black text-red-500 font-mono';
     }
  }
}

window.ScannerView = ScannerView;
