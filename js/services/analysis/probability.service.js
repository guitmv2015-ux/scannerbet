/**
 * PROBABILITY SERVICE (ANALYSIS ENGINE)
 * Handles implicit probability, overround (margin) calculation, and fair odds estimation.
 */

class ProbabilityService {
  
  /**
   * Calculates the implicit probability of a given decimal odd.
   * @param {number} decimalOdd - e.g. 2.10
   * @returns {number} Probability between 0 and 1 (e.g. 0.476)
   */
  calculateImplicitProbability(decimalOdd) {
    if (!decimalOdd || decimalOdd <= 1) return 0;
    return 1 / parseFloat(decimalOdd);
  }

  /**
   * Calculates the margin (overround) of a specific bookmaker for a given market.
   * @param {Array<number>} marketOdds - Array of decimal odds for all outcomes of the market (e.g. [2.10, 3.40, 3.20] for 1X2)
   * @returns {number} Margin percentage (e.g. 0.052 for 5.2%)
   */
  calculateMarketMargin(marketOdds) {
    if (!marketOdds || marketOdds.length === 0) return 0;
    
    const sumProbabilities = marketOdds.reduce((sum, odd) => {
      return sum + this.calculateImplicitProbability(odd);
    }, 0);
    
    // The margin is whatever exceeds 100% (1.0)
    return Math.max(0, sumProbabilities - 1);
  }

  /**
   * Calculates the Fair Odd by removing the bookmaker's margin proportionally.
   * @param {number} selectionOdd - The odd of the specific selection.
   * @param {number} marketMargin - The margin of the market calculated previously.
   * @param {number} numOutcomes - Total number of outcomes in this market (e.g., 3 for 1X2).
   * @returns {number} Fair Odd (Decimal)
   */
  calculateFairOdd(selectionOdd, marketMargin, numOutcomes) {
    const implicitProb = this.calculateImplicitProbability(selectionOdd);
    if (implicitProb === 0) return 0;
    
    // Proportional margin distribution (simple approach)
    // Fair Probability = Implicit Prob - (Margin / number_of_outcomes)
    // Note: Margin Proportional to Odds (MPO) is better: Fair Prob = Implicit Prob / (1 + Margin)
    
    const fairProbability = implicitProb / (1 + marketMargin);
    return fairProbability > 0 ? (1 / fairProbability) : 0;
  }

  /**
   * Recebe um array de odds (de um mesmo mercado) e retorna as probabilidades reais estimadas (soma exata de 1.0)
   * através da remoção proporcional da margem.
   * @param {Array<number>} marketOdds - Ex: [2.10, 3.40, 3.20]
   * @returns {Array<number>} Ex: [0.453, 0.279, 0.268]
   */
  calculateNormalizedProbabilities(marketOdds) {
    if (!marketOdds || marketOdds.length === 0) return [];
    
    const implicitProbs = marketOdds.map(odd => this.calculateImplicitProbability(odd));
    const sumProbs = implicitProbs.reduce((a, b) => a + b, 0);
    
    if (sumProbs === 0) return [];
    
    // MPO (Margin Proportional to Odds) Normalization: P_true = P_impl / Sum(P_impl)
    return implicitProbs.map(p => p / sumProbs);
  }
}

window.ProbabilityService = new ProbabilityService();
