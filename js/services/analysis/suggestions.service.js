/**
 * SUGGESTIONS SERVICE
 * Phase 4: Engine for analyzing events and generating suggestions
 * based on Mathematical Rules and Scanner Score.
 */

class SuggestionsService {
  
  /**
   * Generates an internal score (0-100) and a label for a specific odds selection.
   * Criteria:
   * - Difference from average (+ points for higher difference)
   * - Market Overround (+ points for lower margin)
   * - Number of bookmakers (+ points for higher liquidity/confidence in the average)
   * 
   * @param {Object} selection - The selection object from a normalized market (contains .allOdds, .bestOdd)
   * @param {Object} marketStats - The pre-calculated market stats (total bookmakers, margin)
   * @returns {Object} { score: number, label: string, color: string }
   */
  evaluateSelection(selection, marketStats) {
    if (!selection || !selection.bestOdd || !selection.allOdds || selection.allOdds.length < 3) {
      return { score: 0, label: 'DADOS INSUFICIENTES', color: 'text-[#737373]', bgColor: 'bg-[#262626]' };
    }

    const stats = window.ValueService.getSelectionStats(selection.allOdds);
    if (!stats) return { score: 0, label: 'DADOS INSUFICIENTES', color: 'text-[#737373]', bgColor: 'bg-[#262626]' };

    // BOOKMAKER DE REFERÊNCIA (Sharp Bookie)
    const refBookmakers = ['Pinnacle', 'pinnacle']; // The Odds API usa 'Pinnacle'
    let refOddValue = null;
    let refBookmakerName = 'Média de Mercado';

    // Tenta encontrar a Odd da Pinnacle
    const sharpOdd = selection.allOdds.find(o => refBookmakers.includes(o.bookmaker) || refBookmakers.includes(o.bookmakerKey));
    
    if (sharpOdd) {
       refOddValue = parseFloat(sharpOdd.odd);
       refBookmakerName = sharpOdd.bookmaker;
    } else {
       refOddValue = stats.avg;
    }

    // Calcula a Distorção percentual contra a Referência
    const bestOddValue = parseFloat(selection.bestOdd.odd);
    const percentDiff = refOddValue > 0 ? ((bestOddValue / refOddValue) - 1) * 100 : 0;
    
    const bookmakersCount = selection.allOdds.length;
    let score = 50; 

    // Score baseado na Distorção (Up to +40 points)
    if (percentDiff > 0) {
       score += Math.min(percentDiff * 4, 40);
    } else {
       score -= Math.abs(percentDiff * 2);
    }

    // Liquidez (Up to +10 points)
    const liquidityScore = Math.min((bookmakersCount / 20) * 10, 10);
    score += liquidityScore;

    // Normaliza
    score = Math.max(0, Math.min(Math.round(score), 100));

    // Determine Label based on Score
    let label = '🔴 ALINHADO COM O MERCADO';
    let color = 'text-red-500';
    let bgColor = 'bg-red-500/10 border-red-500/20';

    if (score >= 80 && percentDiff > 3) {
       label = '🟢 ALTA DISTORÇÃO';
       color = 'text-emerald-500';
       bgColor = 'bg-emerald-500/10 border-emerald-500/20';
    } else if (score >= 65) {
       label = '🟡 DISTORÇÃO DETECTADA';
       color = 'text-yellow-500';
       bgColor = 'bg-yellow-500/10 border-yellow-500/20';
    } else if (score >= 50) {
       label = '⚪ MONITORAR';
       color = 'text-[#a3a3a3]';
       bgColor = 'bg-[#262626] border-[#404040]';
    }

    return { 
       score, 
       label, 
       color, 
       bgColor, 
       percentDiff, 
       refOdd: refOddValue, 
       refBookmaker: refBookmakerName,
       avgOdd: stats.avg,
       bookmakersCount 
    };
  }

  /**
   * Scans all events and returns the top opportunities sorted by score.
   */
  findTopOpportunities(events) {
    const opportunities = [];

    events.forEach(evt => {
       const normalizedMarkets = window.OddsProviderService.getNormalizedOddsForEvent(evt);
       if (!normalizedMarkets) return;

       normalizedMarkets.forEach(market => {
          if (!market.selections) return;

          // Calculate Market Margin
          const bestOdds = market.selections.map(sel => sel.bestOdd ? parseFloat(sel.bestOdd.odd) : 0);
          const margin = window.ProbabilityService.calculateMarketMargin(bestOdds);
          
          market.selections.forEach(sel => {
             const evalResult = this.evaluateSelection(sel, { margin });
             
             // Only consider it an opportunity if score >= 65
             if (evalResult.score >= 65) {
                opportunities.push({
                   event: evt,
                   market: market,
                   selection: sel,
                   evaluation: evalResult
                });
             }
          });
       });
    });

    // Sort by Score descending
    opportunities.sort((a, b) => b.evaluation.score - a.evaluation.score);
    return opportunities;
  }
}

window.SuggestionsService = new SuggestionsService();
