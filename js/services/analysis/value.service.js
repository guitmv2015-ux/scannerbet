/**
 * VALUE SERVICE (ANALYSIS ENGINE)
 * Handles Expected Value (EV+) calculations and comparisons.
 */

class ValueService {
  
  /**
   * Calculates the Expected Value (EV) of a bet.
   * EV = (True Probability * Decimal Odd) - 1
   * @param {number} fairProbability - The estimated true probability (0 to 1).
   * @param {number} bookmakerOdd - The decimal odd offered by the bookmaker.
   * @returns {number} EV percentage (e.g., 0.05 for 5% edge). Returns 0 if negative or invalid.
   */
  calculateEV(fairProbability, bookmakerOdd) {
    if (!fairProbability || !bookmakerOdd) return 0;
    const ev = (fairProbability * parseFloat(bookmakerOdd)) - 1;
    return ev;
  }

  /**
   * Compares an odd against a baseline (average) to calculate the absolute and percentage difference.
   * @param {number} odd - The odd to evaluate
   * @param {number} baselineOdd - The reference odd (e.g., the market average or lowest odd)
   * @returns {Object} { absoluteDiff, percentDiff }
   */
  compareOdd(odd, baselineOdd) {
    const o = parseFloat(odd);
    const b = parseFloat(baselineOdd);
    if (!o || !b || b === 0) return { absoluteDiff: 0, percentDiff: 0 };

    const absoluteDiff = o - b;
    const percentDiff = (absoluteDiff / b) * 100;

    return { absoluteDiff, percentDiff };
  }

  /**
   * Calculates market statistics for a specific selection across all bookmakers
   * @param {Array<Object>} oddsArray - Array of { odd: "2.10", bookmaker: "Betano" }
   * @returns {Object} Stats including min, max, avg, and standard deviation.
   */
  getSelectionStats(oddsArray) {
    if (!oddsArray || oddsArray.length === 0) return null;
    
    const numericOdds = oddsArray.map(o => parseFloat(o.odd)).filter(n => !isNaN(n));
    if (numericOdds.length === 0) return null;

    const max = Math.max(...numericOdds);
    const min = Math.min(...numericOdds);
    const avg = numericOdds.reduce((a, b) => a + b, 0) / numericOdds.length;

    return { max, min, avg, count: numericOdds.length };
  }
}

window.ValueService = new ValueService();
