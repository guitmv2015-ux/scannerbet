/**
 * ODDS NORMALIZER SERVICE
 * Consumes raw bookmaker data from The Odds API and normalizes it to the ScannerBet Standard Model.
 */

class OddsProviderService {
  
  // Normalizes raw bookmakers from The Odds API for a specific event
  getNormalizedOddsForEvent(event) {
    const config = window.SCANNERBET_CONFIG.API_CONFIG;
    
    if (!config.configured) {
      return this._getDemoOdds(event);
    }

    if (!event.rawBookmakers || event.rawBookmakers.length === 0) {
      return [];
    }

    const normalizedMarkets = [];

    // The Odds API usually returns data organized by bookmaker -> markets -> outcomes
    // We want to pivot this to: market -> outcomes -> bookmakers
    
    // Step 1: Collect all unique markets
    const marketMap = new Map();

    event.rawBookmakers.forEach(bookmaker => {
      bookmaker.markets.forEach(market => {
        if (!marketMap.has(market.key)) {
          marketMap.set(market.key, {
            id: market.key,
            name: this._translateMarketName(market.key),
            selections: new Map() // selectionName -> { outcomeName, oddsByBookmaker }
          });
        }
        
        const mktObj = marketMap.get(market.key);
        
        market.outcomes.forEach(outcome => {
          const point = outcome.point ? ` ${outcome.point > 0 && market.key === 'spreads' ? '+' : ''}${outcome.point}` : '';
          const selectionKey = `${outcome.name}${point}`;
          
          if (!mktObj.selections.has(selectionKey)) {
            mktObj.selections.set(selectionKey, {
              name: outcome.name,
              line: outcome.point || null,
              fullName: selectionKey,
              odds: []
            });
          }
          
          mktObj.selections.get(selectionKey).odds.push({
            bookmaker: bookmaker.title,
            bookmakerKey: bookmaker.key,
            odd: outcome.price,
            timestamp: new Date(bookmaker.last_update).getTime()
          });
        });
      });
    });

    // Step 2: Convert Maps to Arrays and calculate Stats
    window._oddsHistory = window._oddsHistory || {};

    for (const [mktKey, mktVal] of marketMap.entries()) {
      const selectionsArray = Array.from(mktVal.selections.values()).map(sel => {
        // Calculate Stats
        const bestOddObj = this.identifyBestOdd(sel.odds);
        let lowestOdd = null;
        let sum = 0;
        let sumSquaredDiffs = 0;
        
        sel.odds.forEach(o => {
            const val = parseFloat(o.odd);
            
            // HISTORY TRACKING
            const histKey = `${event.id}_${mktKey}_${sel.fullName}_${o.bookmakerKey}`;
            const lastVal = window._oddsHistory[histKey];
            o.trend = 0; // 0 = same, 1 = up, -1 = down
            if (lastVal && lastVal !== val) {
                o.trend = val > lastVal ? 1 : -1;
            }
            window._oddsHistory[histKey] = val;
            
            // MATH
            o.impliedProb = (1 / val) * 100;
            
            if (lowestOdd === null || val < lowestOdd) lowestOdd = val;
            sum += val;
        });

        const numOdds = sel.odds.length;
        const avgOdd = numOdds > 0 ? (sum / numOdds) : 0;
        const diff = bestOddObj && avgOdd > 0 ? ((parseFloat(bestOddObj.odd) - avgOdd) / avgOdd) * 100 : 0;

        // Dispersion (Standard Deviation)
        if (numOdds > 1) {
            sel.odds.forEach(o => {
                sumSquaredDiffs += Math.pow(parseFloat(o.odd) - avgOdd, 2);
            });
            sel.dispersion = Math.sqrt(sumSquaredDiffs / numOdds);
        } else {
            sel.dispersion = 0;
        }

        return {
          name: sel.name,
          fullName: sel.fullName,
          line: sel.line,
          bestOdd: bestOddObj,
          allOdds: sel.odds.sort((a,b) => parseFloat(b.odd) - parseFloat(a.odd)), // sort odds descending
          stats: {
              lowestOdd: lowestOdd,
              averageOdd: avgOdd,
              diff: diff,
              dispersion: sel.dispersion,
              numBookmakers: numOdds
          }
        };
      });

      normalizedMarkets.push({
        id: mktKey,
        name: mktVal.name,
        selections: selectionsArray
      });
    }

    return normalizedMarkets;
  }

  // Identify highest odd and its provider
  identifyBestOdd(oddsArray) {
    if (!oddsArray || oddsArray.length === 0) return null;
    
    return oddsArray.reduce((best, current) => {
      return (parseFloat(current.odd) > parseFloat(best.odd)) ? current : best;
    }, oddsArray[0]);
  }

  _translateMarketName(key) {
    const translations = {
      'h2h': 'Resultado Final (1X2)',
      'spreads': 'Handicap',
      'totals': 'Mais/Menos Gols (Over/Under)',
      'outrights': 'Vencedor do Campeonato'
    };
    return translations[key] || key;
  }

  // Internal Fallback DEMO Data
  _getDemoOdds(event) {
    const now = Date.now();
    return [
      {
        id: 'h2h',
        name: 'Resultado Final (1X2) [DEMO]',
        selections: [
          {
            name: event.homeTeam,
            bestOdd: { bookmaker: 'Betano', odd: '2.10', timestamp: now },
            allOdds: [
              { bookmaker: 'Betano', odd: '2.10', timestamp: now },
              { bookmaker: 'bet365', odd: '2.05', timestamp: now - 5000 }
            ]
          },
          {
            name: event.awayTeam,
            bestOdd: { bookmaker: 'Superbet', odd: '3.40', timestamp: now },
            allOdds: [
              { bookmaker: 'Betano', odd: '3.20', timestamp: now },
              { bookmaker: 'Superbet', odd: '3.40', timestamp: now }
            ]
          }
        ]
      }
    ];
  }
}

window.OddsProviderService = new OddsProviderService();
