/**
 * SUREBET SERVICE (ARBITRAGE ENGINE)
 * Phase 4: Architectural foundation for Arbitrage detection.
 * 
 * Future implementation will use this to scan the normalized odds
 * across all bookmakers to find cross-market discrepancies where
 * the combined implied probability is < 100%.
 */

class SurebetService {
  
  /**
   * Identifica se existe uma oportunidade teórica de Surebet (Arbitragem).
   * Uma surebet ocorre quando a soma das probabilidades implícitas das 
   * melhores odds de cada seleção de um mercado é menor que 1.
   * 
   * @param {Array<number>} bestOddsPerSelection - Array contendo a MELHOR odd de CADA seleção do mercado. Ex: [2.15, 3.45, 3.25]
   * @returns {Object} { isSurebet: boolean, arbMargin: number, totalProb: number }
   */
  detectSurebet(bestOddsPerSelection) {
    if (!bestOddsPerSelection || bestOddsPerSelection.length === 0) {
      return { isSurebet: false, arbMargin: 0, totalProb: 0 };
    }

    const implicitProbs = bestOddsPerSelection.map(odd => window.ProbabilityService.calculateImplicitProbability(odd));
    const totalProb = implicitProbs.reduce((a, b) => a + b, 0);

    // Se a soma for menor que 1 (ex: 0.98 = 98%), existe margem de arbitragem de 2%
    const isSurebet = totalProb > 0 && totalProb < 1;
    const arbMargin = isSurebet ? (1 - totalProb) : 0;

    return {
      isSurebet,
      arbMargin,
      totalProb
    };
  }
}

window.SurebetService = new SurebetService();
