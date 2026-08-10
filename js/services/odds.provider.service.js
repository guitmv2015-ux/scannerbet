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
          if (!mktObj.selections.has(outcome.name)) {
            mktObj.selections.set(outcome.name, {
              name: outcome.name,
              odds: []
            });
          }
          
          mktObj.selections.get(outcome.name).odds.push({
            bookmaker: bookmaker.title,
            bookmakerKey: bookmaker.key,
            odd: outcome.price,
            timestamp: new Date(bookmaker.last_update).getTime()
          });
        });
      });
    });

    // Step 2: Convert Maps to Arrays and calculate Best Odds
    for (const [mktKey, mktVal] of marketMap.entries()) {
      const selectionsArray = Array.from(mktVal.selections.values()).map(sel => {
        // Find Best Odd
        const bestOddObj = this.identifyBestOdd(sel.odds);
        return {
          name: sel.name,
          bestOdd: bestOddObj,
          allOdds: sel.odds
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
