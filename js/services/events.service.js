/**
 * EVENTS SERVICE - FASE 7
 * Fetches real sports and events via Backend Proxy to The Odds API
 * Includes advanced caching, filtering, and search mechanics for the Massive Dashboard.
 */

class EventsService {
  constructor() {
    this.eventsCache = new Map(); // sportKey -> { timestamp, events }
    this.sportsCache = [];
    this.userPreferences = this.loadPreferences();
  }

  loadPreferences() {
    try {
      const prefs = localStorage.getItem('sb_dashboard_prefs');
      return prefs ? JSON.parse(prefs) : {
        sports: ['soccer_brazil_campeonato'],
        period: 'today',
        status: ['pre', 'live']
      };
    } catch (e) {
      return { sports: ['soccer_brazil_campeonato'], period: 'today', status: ['pre', 'live'] };
    }
  }

  savePreferences(prefs) {
    this.userPreferences = { ...this.userPreferences, ...prefs };
    localStorage.setItem('sb_dashboard_prefs', JSON.stringify(this.userPreferences));
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
      console.warn("Failed to fetch sports, using demo/test data.", error);
      return this._getDemoSports();
    }
  }

  async getLiveEvents(sportKey = 'soccer_brazil_campeonato', forceRefresh = false) {
    const config = window.SCANNERBET_CONFIG.API_CONFIG;
    
    // Cache System (5 minutes) to protect The Odds API rate limits
    if (!forceRefresh && this.eventsCache.has(sportKey)) {
        const cachedData = this.eventsCache.get(sportKey);
        if (Date.now() - cachedData.timestamp < 5 * 60 * 1000) {
            return cachedData.events;
        }
    }

    try {
      if (!config.configured) {
          throw new Error("API Not configured");
      }
      // FASE 7: Múltiplos Mercados (h2h, spreads, totals)
      const oddsData = await this.fetchWithHandling(`${config.baseUrl}/sports/${sportKey}/odds?regions=eu,us,uk,au&markets=h2h,spreads,totals&oddsFormat=decimal`);
      
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

      this.eventsCache.set(sportKey, { timestamp: Date.now(), events });
      return events;

    } catch (error) {
      console.warn(`Using fallback test_odds.json data for ${sportKey}`, error);
      const demoData = await this._getDemoEventsFromTestFile(sportKey);
      this.eventsCache.set(sportKey, { timestamp: Date.now(), events: demoData });
      return demoData;
    }
  }

  // Gets multiple sports concurrently for the Massive Dashboard
  async getMassiveEvents(sportKeys = []) {
    if (sportKeys.length === 0) {
       try {
           const active = await this.getActiveSports();
           sportKeys = active.slice(0, 3).map(s => s.key);
       } catch(e) {
           sportKeys = this.userPreferences.sports;
       }
    }
    if (sportKeys.length === 0) sportKeys = ['soccer_brazil_campeonato'];
    
    const promises = sportKeys.map(key => this.getLiveEvents(key));
    const results = await Promise.allSettled(promises);
    
    let allEvents = [];
    results.forEach(res => {
       if (res.status === 'fulfilled') {
          allEvents = allEvents.concat(res.value);
       }
    });
    
    return allEvents;
  }

  // Applies active filters and search queries to an events array
  filterEvents(events, searchQuery = '', customPrefs = null) {
    const prefs = customPrefs || this.userPreferences;
    const now = Date.now();
    const endOfToday = new Date().setHours(23, 59, 59, 999);
    
    let filtered = events;
    
    // Period filter
    if (prefs.period === 'today') {
      filtered = filtered.filter(e => e.startTime <= endOfToday);
    } else if (prefs.period === 'tomorrow') {
      filtered = filtered.filter(e => e.startTime > endOfToday && e.startTime <= endOfToday + 86400000);
    }

    // Status filter
    if (!prefs.status.includes('pre')) {
      filtered = filtered.filter(e => e.status !== 'PRÉ-JOGO');
    }
    if (!prefs.status.includes('live')) {
      filtered = filtered.filter(e => e.status !== 'AO VIVO');
    }

    // Text Search
    if (searchQuery && searchQuery.trim() !== '') {
       const query = searchQuery.toLowerCase().trim();
       filtered = filtered.filter(e => 
         e.homeTeam.toLowerCase().includes(query) || 
         e.awayTeam.toLowerCase().includes(query) ||
         e.sportTitle.toLowerCase().includes(query)
       );
    }

    // Sort by start time
    return filtered.sort((a, b) => a.startTime - b.startTime);
  }

  async getEventById(sportKey, eventId) {
     const events = await this.getLiveEvents(sportKey);
     return events.find(e => e.id === eventId);
  }

  // Internal Fallback DEMO Data
  _getDemoSports() {
    return [
      { key: 'soccer_brazil_campeonato', group: 'Soccer', title: 'Brasileirão Série A' },
      { key: 'soccer_uefa_champs_league', group: 'Soccer', title: 'UEFA Champions League' },
      { key: 'basketball_nba', group: 'Basketball', title: 'NBA' },
      { key: 'tennis_atp', group: 'Tennis', title: 'ATP' }
    ];
  }

  async _getDemoEventsFromTestFile(sportKey) {
     try {
         // Tentamos carregar os dados reais que injetamos via test_odds.json
         const response = await fetch('/test_odds.json');
         if (!response.ok) throw new Error("Fallback failed");
         const arrayBuffer = await response.arrayBuffer();
         const decoder = new TextDecoder('utf-16');
         const text = decoder.decode(arrayBuffer);
         const data = JSON.parse(text);
         
         const eventsRaw = data.value || [];
         
         return eventsRaw.map(match => ({
            id: match.id,
            sportKey: match.sport_key,
            sportTitle: match.sport_title,
            homeTeam: match.home_team,
            awayTeam: match.away_team,
            startTime: new Date(match.commence_time).getTime(),
            status: new Date(match.commence_time).getTime() > Date.now() ? 'PRÉ-JOGO' : 'AO VIVO',
            rawBookmakers: match.bookmakers
         })).filter(e => sportKey === 'all' || e.sportKey === sportKey);
         
     } catch (e) {
         console.warn("Generating fake demo events", e);
         const now = Date.now();
         return [
           {
             id: 'evt_demo_1001',
             sportKey: 'soccer_brazil_campeonato',
             sportTitle: 'Brasileirão Série A',
             homeTeam: 'Flamengo',
             awayTeam: 'Palmeiras',
             startTime: now + 3600000,
             status: 'PRÉ-JOGO',
             rawBookmakers: []
           }
         ];
     }
  }
}

window.EventsService = new EventsService();
