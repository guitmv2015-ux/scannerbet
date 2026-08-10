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

  savePick(pickData) {
    const newPick = {
      id: 'pick_' + Date.now(),
      eventTitle: pickData.eventTitle,
      marketName: pickData.marketName,
      selectionName: pickData.selectionName,
      bookmaker: pickData.bookmaker,
      odd: parseFloat(pickData.odd),
      implicitProb: pickData.implicitProb,
      ev: pickData.ev,
      stake: pickData.stake || 1, // unit
      status: 'PENDENTE',
      createdAt: Date.now()
    };

    this.picks.unshift(newPick);
    this._savePicks();
    return newPick;
  }

  resolvePick(pickId, status) {
    const pick = this.picks.find(p => p.id === pickId);
    if (pick) {
      pick.status = status; // GREEN or RED
      // Naive ROI calculation basis
      if (status === 'GREEN') {
          pick.profit = (pick.stake * pick.odd) - pick.stake;
      } else {
          pick.profit = -pick.stake;
      }
      this._savePicks();
    }
  }

  getPicks() {
    return this.picks;
  }

  getMetrics() {
    const greens = this.picks.filter(p => p.status === 'GREEN').length;
    const reds = this.picks.filter(p => p.status === 'RED').length;
    const totalResolved = greens + reds;
    const totalPicks = this.picks.length;
    
    const winRate = totalResolved > 0 ? (greens / totalResolved) * 100 : 0;
    
    let totalProfit = 0;
    this.picks.forEach(p => {
        if (p.profit) totalProfit += p.profit;
    });

    return {
      totalPicks,
      totalResolved,
      greens,
      reds,
      winRate,
      totalProfit
    };
  }
}

window.PicksService = new PicksService();
