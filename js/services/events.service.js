/**
 * EVENTS SERVICE
 * Fetches real sports and events via Backend Proxy to The Odds API
 */

class EventsService {
  constructor() {
    this.events = [];
    this.sportsCache = [];
    this.lastFetch = null;
  }

  async fetchWithHandling(url) {
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      return data;
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      throw error;
    }
  }

  async getActiveSports() {
    const config = window.SCANNERBET_CONFIG.API_CONFIG;
    if (!config.configured) return this._getDemoSports();

    if (this.sportsCache.length > 0) return this.sportsCache;

    try {
      // The Odds API: GET /sports
      const sports = await this.fetchWithHandling(`${config.baseUrl}/sports`);
      
      // Filter out only active sports and normalize
      this.sportsCache = sports
        .filter(s => s.active)
        .map(s => ({
          key: s.key,
          group: s.group,
          title: s.title,
          description: s.description,
          hasOutrights: s.has_outrights
        }));
        
      return this.sportsCache;
    } catch (error) {
      console.error("Failed to fetch sports", error);
      throw error;
    }
  }

  async getLiveEvents(sportKey = 'soccer_brazil_campeonato', forceRefresh = false) {
    const config = window.SCANNERBET_CONFIG.API_CONFIG;
    
    if (!config.configured) {
      return this._generateDemoEvents();
    }

    // Cache System (5 minutes) to protect The Odds API rate limits
    const cacheKey = `sb_events_cache_${sportKey}`;
    if (!forceRefresh) {
        const cachedDataStr = localStorage.getItem(cacheKey);
        if (cachedDataStr) {
            try {
               const cachedData = JSON.parse(cachedDataStr);
               if (Date.now() - cachedData.timestamp < 5 * 60 * 1000) {
                   return cachedData.events;
               }
            } catch(e) {}
        }
    }

    try {
      // FASE 7: Múltiplos Mercados (h2h, spreads, totals)
      const oddsData = await this.fetchWithHandling(`${config.baseUrl}/sports/${sportKey}/odds?regions=eu,us,uk&markets=h2h,spreads,totals&oddsFormat=decimal`);
      
      // Normalize The Odds API response to ScannerBet Event Model
      const events = oddsData.map(match => ({
        id: match.id,
        sportKey: match.sport_key,
        sportTitle: match.sport_title,
        homeTeam: match.home_team,
        awayTeam: match.away_team,
        startTime: new Date(match.commence_time).getTime(),
        status: new Date(match.commence_time).getTime() > Date.now() ? 'PRÉ-JOGO' : 'AO VIVO',
        rawBookmakers: match.bookmakers // Pass raw bookmakers down for OddsProviderService to process
      }));

      localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), events }));
      return events;

    } catch (error) {
      console.error("Failed to fetch events", error);
      throw error;
    }
  }

  // Internal Fallback DEMO Data
  _getDemoSports() {
    return [
      { key: 'soccer_brazil_campeonato', group: 'Soccer', title: 'Brasileirão Série A' },
      { key: 'soccer_uefa_champs_league', group: 'Soccer', title: 'UEFA Champions League' },
      { key: 'basketball_nba', group: 'Basketball', title: 'NBA' }
    ];
  }

  _generateDemoEvents() {
    const now = Date.now();
    return [
      {
        id: 'evt_demo_1001',
        sportKey: 'soccer_brazil_campeonato',
        sportTitle: 'Brasileirão Série A',
        homeTeam: 'Flamengo',
        awayTeam: 'Palmeiras',
        startTime: now + 3600000,
        status: 'AGENDADO',
        rawBookmakers: []
      }
    ];
  }
}

window.EventsService = new EventsService();
