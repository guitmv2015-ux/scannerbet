/**
 * PICKS SERVICE
 * Handles saving user analysis and tracking history locally.
 */

class PicksService {
  constructor() {
    this.storageKey = 'sb_user_picks';
    this.picks = this._loadPicks();
  }

  _loadPicks() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Failed to load picks", e);
      return [];
    }
  }

  _savePicks() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.picks));
    } catch (e) {
      console.error("Failed to save picks", e);
    }
  }

  // Schema Updated for Phase 7 / Phase B compatibility
  savePick(pickData) {
    const newPick = {
      id: 'pick_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      eventId: pickData.eventId || null,
      eventName: pickData.eventName,
      date: pickData.date || null,
      sportKey: pickData.sportKey || null,
      league: pickData.league || null,
      marketType: pickData.marketType,
      selection: pickData.selection,
      line: pickData.line !== undefined ? pickData.line : null,
      bookmaker: pickData.bookmaker,
      odd: parseFloat(pickData.odd),
      stake: pickData.stake || 100,
      marketSnapshot: pickData.marketSnapshot || null, // FASE 6: Fotografia do mercado (diff, media, bestOdd)
      status: 'PENDING',
      createdAt: Date.now(),
      timestamp: Date.now()
    };

    this.picks.unshift(newPick);
    this._savePicks();
    return newPick;
  }

  resolvePick(pickId, status) {
    const pick = this.picks.find(p => p.id === pickId);
    if (pick) {
      pick.status = status; // WON, LOST, PUSH
      
      if (status === 'WON') {
          pick.profit = (pick.stake * pick.odd) - pick.stake;
      } else if (status === 'LOST') {
          pick.profit = -pick.stake;
      } else if (status === 'PUSH') {
          pick.profit = 0;
      }
      this._savePicks();
    }
  }

  getPicks() {
    return this.picks;
  }

  getMetrics() {
    const won = this.picks.filter(p => p.status === 'WON').length;
    const lost = this.picks.filter(p => p.status === 'LOST').length;
    const totalResolved = won + lost + this.picks.filter(p => p.status === 'PUSH').length;
    const totalPicks = this.picks.length;
    
    // Win rate only calculates actual W/L (ignoring pushes for the rate)
    const effectiveResolved = won + lost;
    const winRate = effectiveResolved > 0 ? (won / effectiveResolved) * 100 : 0;
    
    let totalProfit = 0;
    this.picks.forEach(p => {
        if (p.profit !== undefined) totalProfit += p.profit;
    });

    return {
      totalPicks,
      totalResolved,
      won,
      lost,
      winRate,
      totalProfit
    };
  }
}

window.PicksService = new PicksService();
