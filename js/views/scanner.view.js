/**
 * SCANNERBET SCANNER VIEW - FASE 9
 * Terminal Multimercado
 */

class ScannerView {
  static async render(params) {
    const main = document.getElementById('app-main');
    if (!main) return;

    main.innerHTML = `
      <div class="flex-1 w-full p-4 flex items-center justify-center min-h-[calc(100vh-5rem)]">
        <div class="flex flex-col items-center">
            <div class="w-10 h-10 border-4 border-[#262626] border-t-[#06b6d4] rounded-full animate-spin mb-4"></div>
            <span class="text-sm font-bold text-white">Carregando Matrizes de Odds...</span>
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
      this.activeLines = {}; // Armazena a linha ativa para mercados que têm linhas

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
         Visão Geral
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

    main.innerHTML = `
      <div class="flex-1 w-full p-4 lg:p-6 flex flex-col relative animate-in fade-in duration-500 max-w-[1600px] mx-auto">
         
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
                Voltar
             </button>
         </div>

         <!-- HEADER DO EVENTO -->
         <div class="flex flex-col xl:flex-row gap-6 mb-8">
            <div class="flex-1 bg-[#0a0a0a] border border-[#262626] rounded-xl p-6">
                <div class="flex flex-wrap gap-2 mb-4">
                   <span class="bg-[#141414] border border-[#262626] text-[#a3a3a3] text-[9px] px-2 py-1 rounded font-bold uppercase tracking-wider">${this.currentEvent.sportTitle}</span>
                   <span class="bg-[#141414] border border-[#262626] ${isLive ? 'text-red-500' : 'text-[#06b6d4]'} text-[9px] px-2 py-1 rounded font-bold uppercase tracking-wider flex items-center gap-1.5">
                      ${isLive ? '<span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>' : ''} ${this.currentEvent.status}
                   </span>
                   <span class="bg-[#141414] border border-[#262626] text-[#a3a3a3] text-[9px] px-2 py-1 rounded font-bold uppercase tracking-wider">${dateFormatted}</span>
                </div>
                <h1 class="text-3xl lg:text-4xl font-black text-white tracking-tight flex flex-col md:flex-row md:items-center gap-2 md:gap-4 leading-none">
                   <span>${this.currentEvent.homeTeam}</span> 
                   <span class="text-[#404040] text-xl font-normal">x</span> 
                   <span>${this.currentEvent.awayTeam}</span>
                </h1>
            </div>
            
            <div class="flex gap-4 xl:w-96">
                <div class="flex-1 bg-[#0a0a0a] border border-[#262626] rounded-xl p-6 flex flex-col justify-center items-center text-center">
                   <p class="text-[10px] text-[#737373] uppercase tracking-widest font-bold mb-1">Bookmakers</p>
                   <p class="text-3xl font-black text-white font-mono">${new Set(this.normalizedMarkets.flatMap(m => m.selections.flatMap(s => s.allOdds.map(o => o.bookmaker)))).size}</p>
                </div>
                <div class="flex-1 bg-[#0a0a0a] border border-[#262626] rounded-xl p-6 flex flex-col justify-center items-center text-center">
                   <p class="text-[10px] text-[#737373] uppercase tracking-widest font-bold mb-1">Mercados</p>
                   <p class="text-3xl font-black text-[#06b6d4] font-mono">${this.normalizedMarkets.length}</p>
                </div>
            </div>
         </div>

         <!-- TABS -->
         <div class="flex overflow-x-auto border-b border-[#262626] mb-6 custom-scrollbar">
            ${tabsHtml}
         </div>

         <!-- CONTENT GRID -->
         <div class="flex flex-col xl:flex-row gap-6">
            <div id="scanner-content-area" class="w-full xl:w-3/4">
               ${this.renderTabContent()}
            </div>
            
            <div class="w-full xl:w-1/4">
               ${this.renderInsightsPanel()}
            </div>
         </div>
      </div>
    `;
    
    // Close dropdown on outside click
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
    
    // Update tabs visual state
    this.renderFullScanner(document.getElementById('app-main'));
  }

  static renderTabContent() {
    if (this.normalizedMarkets.length === 0) {
        return `<div class="p-10 text-center text-[#737373] bg-[#0a0a0a] rounded-xl border border-[#262626]">Nenhuma cotação disponível para este evento.</div>`;
    }

    if (this.activeTab === 'overview') {
        return this.renderOverview();
    }

    const market = this.normalizedMarkets.find(m => m.id === this.activeTab);
    if (!market) return '';

    return this.renderMarketTable(market);
  }

  static renderOverview() {
    let html = `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">`;
    
    this.normalizedMarkets.forEach(m => {
       html += `<div class="bg-[#0a0a0a] border border-[#262626] rounded-xl p-5 flex flex-col hover:border-[#404040] transition-colors">
          <h4 class="text-[11px] font-black text-white mb-4 uppercase tracking-widest border-b border-[#262626] pb-2">${m.name}</h4>
          <div class="flex flex-col gap-3 flex-1">
             ${m.selections.slice(0, 4).map(sel => `
                <div class="flex items-center justify-between">
                   <span class="text-xs text-[#a3a3a3] font-medium truncate pr-2">${sel.fullName}</span>
                   ${sel.bestOdd ? `
                   <div class="flex flex-col items-end">
                      <span class="text-sm font-black text-[#a3e635] leading-none mb-0.5">${parseFloat(sel.bestOdd.odd).toFixed(2)}</span>
                      <span class="text-[8px] text-[#737373] uppercase tracking-wider">${sel.bestOdd.bookmaker}</span>
                   </div>` : '<span class="text-[10px] text-[#404040]">-</span>'}
                </div>
             `).join('')}
             ${m.selections.length > 4 ? `<div class="text-[9px] text-[#06b6d4] text-center mt-2 uppercase font-bold tracking-widest">+ ${m.selections.length - 4} LINHAS</div>` : ''}
          </div>
          <button onclick="window.ScannerView.switchTab('${m.id}')" class="mt-4 w-full bg-[#141414] hover:bg-[#1a1a1a] text-white text-[10px] font-bold py-2 rounded-lg border border-[#333] hover:border-[#404040] transition-colors">
             ABRIR MATRIZ COMPLETA
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
     // Identificar todas as linhas únicas para este mercado (se for Over/Under ou Handicap)
     const uniqueLines = [...new Set(market.selections.map(s => s.line))].filter(l => l !== undefined && l !== null);
     uniqueLines.sort((a,b) => parseFloat(a) - parseFloat(b));

     let currentLine = this.activeLines[market.id];
     if (!currentLine && uniqueLines.length > 0) {
         currentLine = uniqueLines[Math.floor(uniqueLines.length / 2)]; // default middle
         this.activeLines[market.id] = currentLine;
     }

     // Filtrar seleções para a linha atual
     let activeSelections = market.selections;
     if (uniqueLines.length > 0 && currentLine !== undefined) {
         activeSelections = market.selections.filter(s => s.line === currentLine);
     }

     // Header de Linhas (se existirem)
     let lineSelectorHtml = '';
     if (uniqueLines.length > 0) {
         lineSelectorHtml = `
            <div class="mb-4 flex flex-col md:flex-row md:items-center gap-3 bg-[#0a0a0a] p-3 rounded-xl border border-[#262626]">
               <span class="text-[10px] uppercase text-[#737373] font-bold tracking-widest">Selecione a Linha:</span>
               <div class="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  ${uniqueLines.map(line => `
                     <button onclick="window.ScannerView.setMarketLine('${market.id}', ${line})" 
                             class="px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-colors border ${currentLine === line ? 'bg-[#06b6d4] text-black border-[#06b6d4] shadow-[0_0_10px_rgba(6,182,212,0.3)]' : 'bg-[#141414] text-[#a3a3a3] border-[#333] hover:border-[#404040] hover:text-white'}">
                        ${line > 0 ? '+'+line : line}
                     </button>
                  `).join('')}
               </div>
            </div>
         `;
     }

     // Identify all unique bookmakers for the active selections
     const bookmakersSet = new Set();
     activeSelections.forEach(sel => {
         sel.allOdds.forEach(odd => bookmakersSet.add(odd.bookmaker));
     });
     const bookmakersList = Array.from(bookmakersSet).sort();

     if (bookmakersList.length === 0) {
         return `${lineSelectorHtml}<div class="p-8 text-center text-[#737373] bg-[#0a0a0a] rounded-xl border border-[#262626]">Nenhuma cotação para esta linha.</div>`;
     }

     // TABLE
     let thHtml = `<th class="px-4 py-4 text-left text-[10px] font-bold text-[#737373] uppercase tracking-wider bg-[#141414] sticky left-0 z-10 border-b border-[#262626] rounded-tl-xl">CASA DE APOSTA</th>`;
     activeSelections.forEach(sel => {
         thHtml += `<th class="px-4 py-4 text-center text-[11px] font-black text-white uppercase tracking-wider bg-[#141414] border-b border-[#262626] min-w-[120px]">${sel.fullName}</th>`;
     });

     let rowsHtml = '';
     bookmakersList.forEach(bookie => {
         rowsHtml += `<tr class="border-b border-[#262626] hover:bg-[#1a1a1a] transition-colors group">
            <td class="px-4 py-3 font-medium text-sm text-white sticky left-0 bg-[#0a0a0a] group-hover:bg-[#1a1a1a] border-r border-[#262626]/50 transition-colors">
               <div class="flex items-center gap-2">
                  <div class="w-5 h-5 rounded-md bg-[#262626] flex items-center justify-center text-[9px] font-black text-white border border-[#404040]">${bookie.charAt(0)}</div>
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
                    <td class="px-4 py-2 text-center relative">
                       <button onclick="window.ScannerView.openPickModal('${market.id}', '${sel.fullName.replace(/'/g, "\\'")}', '${bookie}', ${oddVal}, '${sel.line}')" 
                               class="w-full relative font-mono font-bold text-sm py-2 rounded-lg border transition-all 
                               ${isBest ? 'bg-[#a3e635]/15 border-[#a3e635]/50 text-[#a3e635] hover:bg-[#a3e635] hover:text-black hover:shadow-[0_0_15px_rgba(163,230,53,0.3)]' : 'bg-[#141414] border-[#333] text-[#a3a3a3] hover:border-[#404040] hover:bg-[#262626] hover:text-white'}">
                          ${isBest ? `<span class="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#a3e635] text-black text-[7px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest whitespace-nowrap shadow-sm">⭐ Melhor Odd</span>` : ''}
                          ${oddVal}
                       </button>
                    </td>
                 `;
             } else {
                 rowsHtml += `<td class="px-4 py-2 text-center"><div class="w-full py-2 bg-[#0f0f0f] rounded-lg border border-[#1a1a1a] text-[#404040] text-sm">-</div></td>`;
             }
         });
         rowsHtml += `</tr>`;
     });

     return `
        ${lineSelectorHtml}
        <div class="bg-[#0a0a0a] border border-[#262626] rounded-xl overflow-x-auto shadow-2xl animate-in fade-in duration-300 relative">
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

  static renderInsightsPanel() {
      let html = `
         <div class="bg-[#0a0a0a] border border-[#262626] rounded-xl flex flex-col h-full sticky top-4 overflow-hidden">
            <div class="p-4 border-b border-[#262626] bg-[#141414]">
               <h3 class="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                  Scanner Insights
               </h3>
               <p class="text-[10px] text-[#737373] mt-1">Outras oportunidades deste evento</p>
            </div>
            <div class="p-4 flex-1 overflow-y-auto custom-scrollbar space-y-3">
      `;
      
      if (!this.otherOpportunities || this.otherOpportunities.length === 0) {
          html += `<p class="text-[11px] text-[#737373] text-center mt-4">Nenhuma distorção de mercado relevante encontrada.</p>`;
      } else {
          this.otherOpportunities.slice(0, 10).forEach(opp => {
              html += `
                 <div class="bg-[#141414] border border-[#333] hover:border-[#06b6d4]/50 rounded-lg p-3 transition-colors cursor-pointer"
                      onclick="window.ScannerView.switchTab('${opp.market.id}')">
                     <div class="flex items-center justify-between mb-2">
                       <span class="text-[9px] uppercase tracking-widest text-[#a3a3a3] font-bold">${opp.market.name}</span>
                       <span class="text-[9px] bg-[#06b6d4]/20 text-[#06b6d4] px-1.5 py-0.5 rounded font-black">+${opp.diff}%</span>
                    </div>
                    <p class="text-sm font-bold text-white mb-1 truncate">${opp.selection.fullName}</p>
                    <div class="flex items-end justify-between">
                       <div class="flex flex-col">
                          <span class="text-[8px] uppercase tracking-widest text-[#737373]">${opp.bestOddObj.bookmaker}</span>
                          <span class="text-sm font-black text-[#a3e635] font-mono leading-none">@${parseFloat(opp.bestOddObj.odd).toFixed(2)}</span>
                       </div>
                       <span class="text-[9px] text-[#737373]">Média: ${opp.avg}</span>
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
               <h4 class="text-[11px] font-bold text-[#06b6d4] uppercase tracking-widest bg-[#06b6d4]/10 px-2 py-0.5 rounded">${market.name}</h4>
            </div>
         </div>
         
         <div class="flex flex-col md:flex-row justify-between items-center gap-4 bg-[#141414] p-4 rounded-lg border border-[#333]">
            <div class="text-center md:text-left w-full md:w-auto">
               <span class="text-[9px] text-[#737373] uppercase tracking-wider font-bold block mb-1">Seleção de Aposta</span>
               <h4 class="text-lg font-black text-white">${selection}</h4>
            </div>
            <div class="text-center md:text-right w-full md:w-auto">
               <span class="text-[9px] text-[#737373] uppercase tracking-wider font-bold block mb-1">${bookmaker}</span>
               <h4 class="text-3xl font-black text-[#a3e635] leading-none font-mono">@${parseFloat(odd).toFixed(2)}</h4>
            </div>
         </div>
      </div>
      
      <div class="mb-4">
         <label class="text-[10px] text-[#737373] font-bold uppercase tracking-wider mb-2 block pl-1">Valor da Stake (R$)</label>
         <div class="relative">
            <span class="absolute left-4 top-3.5 text-[#737373] font-bold">R$</span>
            <input type="number" id="pick-stake" value="100" min="1" step="1" 
                   class="w-full bg-[#0f0f0f] border border-[#262626] text-white text-xl font-black font-mono rounded-xl pl-12 pr-4 py-3 focus:border-[#a3e635] focus:ring-1 focus:ring-[#a3e635] focus:outline-none transition-all shadow-inner"
                   oninput="window.ScannerView.updateModalCalculations(${odd})">
         </div>
      </div>
      
      <div class="flex justify-between items-center bg-[#1a1a1a] p-4 rounded-xl border border-[#333]">
         <div class="flex flex-col">
            <span class="text-[9px] text-[#737373] font-bold uppercase tracking-wider mb-1">Lucro Líquido Estimado</span>
            <span id="pick-profit" class="text-lg font-black text-[#a3e635] font-mono">+ R$ ${(100 * parseFloat(odd) - 100).toFixed(2)}</span>
         </div>
      </div>
    `;

    window.sbApp.components.Modal.show({
      title: 'Registrar Oportunidade',
      content: html,
      primaryText: 'Confirmar Palpite',
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
        profitDisplay.className = 'text-lg font-black text-[#a3e635] font-mono';
     } else {
        profitDisplay.textContent = `R$ ${profit.toFixed(2)}`;
        profitDisplay.className = 'text-lg font-black text-red-500 font-mono';
     }
  }
}

window.ScannerView = ScannerView;
