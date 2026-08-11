class ScannerView {
  static async render(params) {
    const main = document.getElementById('app-main');
    if (!main) return;

    main.innerHTML = `
      <div class="flex-1 w-full p-4 flex items-center justify-center min-h-[calc(100vh-5rem)]">
        <div class="w-10 h-10 border-4 border-[#262626] border-t-[#a3e635] rounded-full animate-spin"></div>
      </div>
    `;

    try {
      let targetSport = params && params.sportKey ? params.sportKey : null;
      let targetEventId = params && params.eventId ? params.eventId : null;

      if (!targetEventId) {
          // Fallback: carregar o primeiro evento disponível para que a aba funcione livremente
          const allEvents = await window.EventsService.getMassiveEvents();
          if (allEvents && allEvents.length > 0) {
              targetSport = allEvents[0].sportKey;
              targetEventId = allEvents[0].id;
          } else {
              throw new Error("Nenhum evento ativo no momento para escanear.");
          }
      }

      const event = await window.EventsService.getEventById(targetSport, targetEventId);
      if (!event) throw new Error("Evento não encontrado");

      this.currentEvent = event;
      this.normalizedMarkets = window.OddsProviderService.getNormalizedOddsForEvent(event);
      this.activeTab = 'overview';

      this.renderFullScanner(main);
    } catch (error) {
       console.error(error);
       main.innerHTML = `
         <div class="p-8 text-center">
            <h3 class="text-white mb-4">Erro ao carregar evento</h3>
            <button onclick="window.sbApp.navigateTo('dashboard')" class="bg-[#262626] text-white px-4 py-2 rounded">Voltar</button>
         </div>
       `;
    }
  }

  static renderFullScanner(main) {
    const isLive = this.currentEvent.status === 'AO VIVO';
    const dateFormatted = window.DateUtil ? window.DateUtil.formatEventDate(this.currentEvent.startTime) : new Date(this.currentEvent.startTime).toLocaleString('pt-BR');

    // TABS
    let tabsHtml = `
      <button class="px-5 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-all ${this.activeTab === 'overview' ? 'border-[#a3e635] text-[#a3e635]' : 'border-transparent text-[#737373] hover:text-white hover:bg-[#141414]'}"
              onclick="window.ScannerView.switchTab('overview')">
         Visão Geral
      </button>
    `;
    
    this.normalizedMarkets.forEach(m => {
       tabsHtml += `
         <button class="px-5 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-all ${this.activeTab === m.id ? 'border-[#a3e635] text-white' : 'border-transparent text-[#737373] hover:text-white hover:bg-[#141414]'}"
                 onclick="window.ScannerView.switchTab('${m.id}')">
            ${m.name}
         </button>
       `;
    });

    main.innerHTML = `
      <div class="flex-1 w-full p-4 md:p-6 lg:p-8 flex flex-col bg-[#0a0a0a]">
         <!-- HEADER -->
         <div class="flex flex-col md:flex-row justify-between items-start md:items-end mb-6">
            <div>
               <button onclick="window.sbApp.navigateTo('dashboard')" class="text-[10px] text-[#737373] hover:text-white font-bold uppercase tracking-widest flex items-center gap-1 mb-4 transition-colors">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                  Voltar para Dashboard
               </button>
               <div class="flex flex-wrap gap-2 mb-3">
                  <span class="bg-[#141414] border border-[#262626] text-[#a3a3a3] text-[9px] px-2 py-1 rounded font-bold uppercase tracking-wider">${this.currentEvent.sportTitle}</span>
                  <span class="bg-[#141414] border border-[#262626] ${isLive ? 'text-red-500' : 'text-[#a3e635]'} text-[9px] px-2 py-1 rounded font-bold uppercase tracking-wider flex items-center gap-1.5">
                     ${isLive ? '<span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>' : ''} ${this.currentEvent.status}
                  </span>
                  <span class="bg-[#141414] border border-[#262626] text-[#a3a3a3] text-[9px] px-2 py-1 rounded font-bold uppercase tracking-wider">${this.normalizedMarkets.length} Mercados Ativos</span>
               </div>
               <h1 class="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                  ${this.currentEvent.homeTeam} <span class="text-[#404040]">x</span> ${this.currentEvent.awayTeam}
               </h1>
               <p class="text-[11px] text-[#737373] mt-2 font-mono flex items-center gap-2">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  ${dateFormatted}
               </p>
            </div>
         </div>

         <!-- TABS -->
         <div class="flex overflow-x-auto border-b border-[#262626] mb-8 no-scrollbar">
            ${tabsHtml}
         </div>

         <!-- CONTENT -->
         <div id="scanner-content-area" class="w-full">
            ${this.renderTabContent()}
         </div>
      </div>
    `;
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
        return `<div class="p-8 text-center text-[#737373] bg-[#141414] rounded-lg border border-[#262626]">Nenhuma cotação disponível para este evento no momento.</div>`;
    }

    if (this.activeTab === 'overview') {
        return this.renderOverview();
    }

    const market = this.normalizedMarkets.find(m => m.id === this.activeTab);
    if (!market) return '';

    return this.renderMarketTable(market);
  }

  static renderOverview() {
    let html = `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">`;
    
    this.normalizedMarkets.forEach(m => {
       html += `<div class="bg-[#141414] border border-[#262626] rounded-xl p-4 flex flex-col">
          <h4 class="text-sm font-bold text-white mb-4 uppercase tracking-wider">${m.name}</h4>
          <div class="flex flex-col gap-3 flex-1">
             ${m.selections.slice(0, 3).map(sel => `
                <div class="flex items-center justify-between">
                   <span class="text-xs text-[#a3a3a3] truncate max-w-[120px] font-medium" title="${sel.fullName}">${sel.fullName}</span>
                   ${sel.bestOdd ? `<div class="flex flex-col items-end">
                      <span class="text-sm font-black text-[#a3e635] leading-none mb-0.5">${parseFloat(sel.bestOdd.odd).toFixed(2)}</span>
                      <span class="text-[8px] text-[#737373] uppercase tracking-wider">${sel.bestOdd.bookmaker}</span>
                   </div>` : '<span class="text-[10px] text-[#404040]">-</span>'}
                </div>
             `).join('')}
             ${m.selections.length > 3 ? `<div class="text-[10px] text-[#737373] text-center mt-2">+ ${m.selections.length - 3} seleções</div>` : ''}
          </div>
          <button onclick="window.ScannerView.switchTab('${m.id}')" class="mt-4 w-full bg-[#1a1a1a] hover:bg-[#262626] text-white text-[10px] font-bold py-2 rounded border border-[#262626] transition-colors">
             ABRIR MATRIZ
          </button>
       </div>`;
    });

    html += `</div>`;
    return html;
  }

  static renderMarketTable(market) {
     // Identify all unique bookmakers in this market
     const bookmakersSet = new Set();
     market.selections.forEach(sel => {
         sel.allOdds.forEach(odd => bookmakersSet.add(odd.bookmaker));
     });
     const bookmakersList = Array.from(bookmakersSet).sort();
     
     // Top Opportunity Calculation
     let topOppHtml = '';
     let topOddData = null;
     
     // Find the single best odd in the entire market (simplistic approach for now)
     let highestOddValue = 0;
     market.selections.forEach(sel => {
        if (sel.bestOdd && parseFloat(sel.bestOdd.odd) > highestOddValue) {
            highestOddValue = parseFloat(sel.bestOdd.odd);
            topOddData = { selection: sel, odd: sel.bestOdd };
        }
     });

     if (topOddData) {
         const score = Math.floor(Math.random() * 20) + 75; // 75-95 mock score
         topOppHtml = `
            <div class="bg-[#141414] border border-[#a3e635]/30 p-5 rounded-xl mb-6 shadow-[0_0_20px_rgba(163,230,53,0.05)] relative overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
               <div class="absolute top-0 left-0 w-1 h-full bg-[#a3e635]"></div>
               <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div>
                     <div class="flex items-center gap-2 mb-2">
                        <span class="bg-[#a3e635]/20 text-[#a3e635] text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-widest flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-[#a3e635]"></span>Top Oportunidade</span>
                        <span class="text-[10px] text-[#737373] uppercase tracking-wider font-bold">${market.name}</span>
                     </div>
                     <h3 class="text-lg font-black text-white flex items-center gap-2">
                        ${topOddData.selection.fullName} @ ${parseFloat(topOddData.odd.odd).toFixed(2)}
                     </h3>
                     <p class="text-xs text-[#a3a3a3] mt-1">A casa <strong class="text-white">${topOddData.odd.bookmaker}</strong> apresenta distorção positiva na matriz.</p>
                  </div>
                  
                  <div class="flex items-center gap-6 w-full md:w-auto bg-[#0a0a0a] p-3 rounded-lg border border-[#262626]">
                     <div class="flex flex-col">
                        <span class="text-[9px] text-[#737373] uppercase tracking-wider font-bold mb-1">Scanner Score</span>
                        <div class="flex items-end gap-1"><span class="text-2xl font-black ${score >= 85 ? 'text-[#a3e635]' : 'text-white'} leading-none">${score}</span><span class="text-xs text-[#737373] mb-0.5">/100</span></div>
                     </div>
                     <div class="w-px h-8 bg-[#262626]"></div>
                     <button onclick="window.ScannerView.openPickModal('${market.id}', '${topOddData.selection.fullName.replace(/'/g, "\\'")}', '${topOddData.odd.bookmaker}', ${topOddData.odd.odd}, '${topOddData.selection.line}')" class="bg-[#a3e635] hover:bg-[#84cc16] text-black font-black text-[11px] uppercase tracking-wider px-5 py-3 rounded-lg transition-transform active:scale-95 shadow-[0_0_15px_rgba(163,230,53,0.3)]">
                        Salvar Palpite Ouro
                     </button>
                  </div>
               </div>
            </div>
         `;
     }

     // TABLE
     let thHtml = `<th class="px-4 py-3 text-left text-[10px] font-bold text-[#737373] uppercase tracking-wider bg-[#141414] sticky left-0 z-10 border-b border-[#262626]">Casa de Aposta</th>`;
     market.selections.forEach(sel => {
         thHtml += `<th class="px-4 py-3 text-center text-[10px] font-black text-white uppercase tracking-wider bg-[#141414] border-b border-[#262626] min-w-[120px]">${sel.fullName}</th>`;
     });

     let rowsHtml = '';
     bookmakersList.forEach(bookie => {
         rowsHtml += `<tr class="border-b border-[#262626] hover:bg-[#141414]/50 transition-colors group">
            <td class="px-4 py-3 font-medium text-sm text-white sticky left-0 bg-[#0a0a0a] group-hover:bg-[#141414] border-r border-[#262626]/50">
               <div class="flex items-center gap-2">
                  <div class="w-4 h-4 rounded-full bg-[#262626] flex items-center justify-center text-[8px] font-black text-[#737373]">${bookie.charAt(0)}</div>
                  ${bookie}
               </div>
            </td>
         `;
         
         market.selections.forEach(sel => {
             const oddData = sel.allOdds.find(o => o.bookmaker === bookie);
             if (oddData) {
                 const isBest = sel.bestOdd && sel.bestOdd.bookmaker === bookie;
                 const oddVal = parseFloat(oddData.odd).toFixed(2);
                 rowsHtml += `
                    <td class="px-4 py-2.5 text-center">
                       <button onclick="window.ScannerView.openPickModal('${market.id}', '${sel.fullName.replace(/'/g, "\\'")}', '${bookie}', ${oddVal}, '${sel.line}')" 
                               class="w-full font-mono font-bold text-sm py-1.5 rounded-md border transition-all 
                               ${isBest ? 'bg-[#a3e635]/10 border-[#a3e635]/50 text-[#a3e635] hover:bg-[#a3e635] hover:text-black hover:shadow-[0_0_10px_rgba(163,230,53,0.3)]' : 'bg-transparent border-transparent text-[#a3a3a3] hover:border-[#404040] hover:bg-[#1a1a1a] hover:text-white'}">
                          ${oddVal}
                       </button>
                    </td>
                 `;
             } else {
                 rowsHtml += `<td class="px-4 py-3 text-center text-[#404040] text-sm">-</td>`;
             }
         });
         rowsHtml += `</tr>`;
     });

     return `
        ${topOppHtml}
        <div class="bg-[#0a0a0a] border border-[#262626] rounded-xl overflow-x-auto shadow-xl animate-in fade-in duration-300">
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

  static openPickModal(marketId, selection, bookmaker, odd, line) {
    if (!window.sbApp || !window.sbApp.components || !window.sbApp.components.Modal) return;
    
    const evt = this.currentEvent;
    const market = this.normalizedMarkets.find(m => m.id === marketId);
    
    const html = `
      <div class="bg-[#141414] p-4 rounded-lg border border-[#262626] mb-5">
         <div class="flex justify-between items-start mb-3 border-b border-[#262626] pb-3">
            <div>
               <span class="text-[9px] text-[#737373] uppercase tracking-wider font-bold block mb-1">Evento</span>
               <h4 class="text-sm font-black text-white">${evt.homeTeam} x ${evt.awayTeam}</h4>
            </div>
            <div class="text-right">
               <span class="text-[9px] text-[#737373] uppercase tracking-wider font-bold block mb-1">Mercado</span>
               <h4 class="text-sm font-bold text-[#a3a3a3]">${market.name}</h4>
            </div>
         </div>
         
         <div class="flex justify-between items-center bg-[#0a0a0a] p-3 rounded border border-[#262626]">
            <div>
               <span class="text-[9px] text-[#737373] uppercase tracking-wider font-bold block mb-1">Seleção</span>
               <h4 class="text-base font-black text-white truncate max-w-[150px]">${selection}</h4>
            </div>
            <div class="text-right">
               <span class="text-[9px] text-[#737373] uppercase tracking-wider font-bold block mb-1">${bookmaker}</span>
               <h4 class="text-2xl font-black text-[#a3e635] leading-none">${parseFloat(odd).toFixed(2)}</h4>
            </div>
         </div>
      </div>
      
      <div class="mb-2">
         <label class="text-[10px] text-[#737373] font-bold uppercase tracking-wider mb-2 block">Valor da Stake (R$)</label>
         <div class="relative">
            <span class="absolute left-3 top-2.5 text-[#737373] font-bold">R$</span>
            <input type="number" id="pick-stake" value="100" min="1" step="1" 
                   class="w-full bg-[#0a0a0a] border border-[#262626] text-white text-lg font-black font-mono rounded-lg pl-10 pr-4 py-2 focus:border-[#a3e635] focus:outline-none transition-colors"
                   oninput="window.ScannerView.updateModalCalculations(${odd})">
         </div>
      </div>
      
      <div class="flex justify-between items-center mt-4 px-1">
         <div class="flex flex-col">
            <span class="text-[9px] text-[#737373] font-bold uppercase tracking-wider">Lucro Líquido</span>
            <span id="pick-profit" class="text-sm font-black text-[#a3e635] font-mono">+ R$ ${(100 * parseFloat(odd) - 100).toFixed(2)}</span>
         </div>
      </div>
    `;

    window.sbApp.components.Modal.show({
      title: 'Salvar Oportunidade',
      content: html,
      primaryText: 'Registrar Palpite',
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
                 line: line !== 'null' ? parseFloat(line) : null,
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
        profitDisplay.className = 'text-sm font-black text-[#a3e635] font-mono';
     } else {
        profitDisplay.textContent = `R$ ${profit.toFixed(2)}`;
        profitDisplay.className = 'text-sm font-black text-red-500 font-mono';
     }
  }
}

window.ScannerView = ScannerView;
