/**
 * ODDS PROVIDER SERVICE LAYER & NORMALIZER
 * Abstract architecture prepared for real sports API integration.
 */

// Base Abstract Provider Interface
class BaseOddsProvider {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.status = 'Online'; // Online, Warning, Offline
  }

  async fetchEventOdds(eventId) {
    throw new Error('fetchEventOdds must be implemented by concrete provider.');
  }
}

// Concrete Betano Provider
class BetanoProvider extends BaseOddsProvider {
  constructor() { super('betano', 'Betano'); }
  async fetchEventOdds(eventId) {
    return { provider: this.id, timestamp: Date.now() };
  }
}

// Concrete bet365 Provider
class Bet365Provider extends BaseOddsProvider {
  constructor() { super('bet365', 'bet365'); }
  async fetchEventOdds(eventId) {
    return { provider: this.id, timestamp: Date.now() };
  }
}

// Concrete Superbet Provider
class SuperbetProvider extends BaseOddsProvider {
  constructor() { super('superbet', 'Superbet'); }
  async fetchEventOdds(eventId) {
    return { provider: this.id, timestamp: Date.now() };
  }
}

// Concrete KTO Provider
class KtoProvider extends BaseOddsProvider {
  constructor() { super('kto', 'KTO'); }
  async fetchEventOdds(eventId) {
    return { provider: this.id, timestamp: Date.now() };
  }
}

// Odds Normalizer & Manager Service
class OddsProviderService {
  constructor() {
    this.providers = {
      betano: new BetanoProvider(),
      bet365: new Bet365Provider(),
      superbet: new SuperbetProvider(),
      kto: new KtoProvider()
    };
    
    // Start subtle odds variation background loop for realistic live demo
    this.startLiveSimulation();
  }

  // Find best odd among providers for a selection
  static identifyBestOdds(selectionOddsObj) {
    let maxOdd = 0;
    let bestProvider = null;

    Object.entries(selectionOddsObj).forEach(([providerId, oddValue]) => {
      if (oddValue > maxOdd) {
        maxOdd = oddValue;
        bestProvider = providerId;
      }
    });

    return { bestProvider, maxOdd };
  }

  // Simulate discrete odds fluctuations every 12 seconds
  startLiveSimulation() {
    setInterval(() => {
      const state = window.sbState.getState();
      if (!state.events || state.events.length === 0) return;

      const updatedEvents = state.events.map(event => {
        // Randomly pick a market selection to adjust slightly
        const markets = event.markets.map(market => {
          const selections = market.selections.map(sel => {
            const shouldFluctuate = Math.random() > 0.6;
            if (!shouldFluctuate) return sel;

            const providers = ['betano', 'bet365', 'superbet', 'kto'];
            const randomProv = providers[Math.floor(Math.random() * providers.length)];
            const currentOdd = sel.odds[randomProv];
            
            // Fluctuate by -0.05 to +0.05
            const delta = (Math.random() * 0.1 - 0.05);
            const newOdd = parseFloat(Math.max(1.05, currentOdd + delta).toFixed(2));

            const updatedOdds = { ...sel.odds, [randomProv]: newOdd };
            const { bestProvider } = OddsProviderService.identifyBestOdds(updatedOdds);

            return {
              ...sel,
              odds: updatedOdds,
              best: bestProvider,
              lastUpdate: Date.now()
            };
          });

          return { ...market, selections };
        });

        return { ...event, markets, lastUpdated: Date.now() };
      });

      window.sbState.setState({ events: updatedEvents });
    }, 12000);
  }

  // Get Health Status of All Odds Providers
  getProvidersStatus() {
    return Object.values(this.providers).map(p => ({
      id: p.id,
      name: p.name,
      status: p.status,
      latency: Math.floor(Math.random() * 45 + 15) + 'ms',
      lastSync: 'Há 4s'
    }));
  }
}

window.OddsProviderService = new OddsProviderService();
