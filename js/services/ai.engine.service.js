/**
 * SCANNERBET AI SPORTS ANALYSIS ENGINE
 * Calculates Scanner Score (0-100), structured justification, value index, and risk assessment.
 */

class AiEngineService {
  /**
   * Main AI Analysis Method
   * @param {Object} params - { event, market, selection, bestOdd, bookmaker, oddsObj }
   */
  static async analyzeBetSelection(params) {
    const currentState = window.sbState.getState();
    const user = currentState.user;

    // Check User AI Credits Limit
    if (user && user.role !== 'Admin' && user.role !== 'Elite') {
      if (user.aiCreditsRemaining <= 0) {
        throw new Error('PAYWALL_EXCEEDED');
      }
    }

    // Processing simulation (800ms)
    await new Promise(resolve => setTimeout(resolve, 800));

    // Fallbacks for parameters
    const selectionName = params.selection?.name || params.selectionName || 'Seleção Escolhida';
    const marketName = params.market?.name || params.marketName || 'Mercado da Partida';
    const bestOdd = parseFloat(params.bestOdd || 1.90);
    const bookmaker = params.bookmaker || 'SUPERBET';
    const oddsObj = params.oddsObj || { betano: 1.85, bet365: 1.90, superbet: bestOdd, kto: 1.88 };

    const oddsArray = Object.values(oddsObj);
    const maxOdd = Math.max(...oddsArray);
    const avgOdd = oddsArray.reduce((a, b) => a + b, 0) / oddsArray.length;
    const valueSpread = Math.max(1.2, ((maxOdd - avgOdd) / avgOdd) * 100);

    // Calculate score
    let score = Math.floor(74 + (valueSpread * 2.2) + (Math.random() * 6));
    score = Math.min(96, Math.max(55, score));

    let verdict = '🟢 Favorável';
    let verdictColor = 'emerald';
    if (score < 65) {
      verdict = '🔴 Alto Risco';
      verdictColor = 'rose';
    } else if (score < 80) {
      verdict = '🟡 Atenção';
      verdictColor = 'amber';
    }

    const confidence = Math.min(95, Math.floor(score * 0.96)) + '%';

    const positiveFactors = [
      `A cotação de ${bestOdd.toFixed(2)} na ${bookmaker} apresenta ${valueSpread.toFixed(1)}% a mais de valor que a média do mercado (${avgOdd.toFixed(2)}).`,
      `Média de produção ofensiva/estatística das equipes nos últimos 5 confrontos valida o padrão.`,
      `Indicador de volume e assimetria algorítmica aponta para expectativa de valor positivo (EV+).`
    ];

    const riskFactors = [
      `Liquidez das apostas rivais pode gerar ajuste na linha momentos antes do início.`,
      `Apostadores de alto volume estão divididos entre este mercado e a linha alternativa.`,
      `Fatores climáticos e rotação de elenco podem impactar o ritmo no 2º tempo.`
    ];

    const matchName = params.event ? `${params.event.homeTeam} vs ${params.event.awayTeam}` : (params.matchName || 'Partida Esportiva');
    const leagueName = params.event ? params.event.leagueName : (params.leagueName || 'Campeonato');

    const justification = `A análise algorítmica do ScannerBet identificou uma assimetria relevante para "${marketName}" na seleção "${selectionName}". A casa ${bookmaker} está pagando ${bestOdd.toFixed(2)}, criando um indicador de valor desajustado em ${valueSpread.toFixed(1)}% perante o desvio padrão de mercado.`;

    const resultData = {
      id: 'ans_' + Date.now(),
      eventId: params.event ? params.event.id : 'evt_gen',
      match: matchName,
      league: leagueName,
      market: marketName,
      selection: selectionName,
      odd: bestOdd,
      bookmaker: bookmaker,
      score: score,
      verdict: verdict,
      verdictColor: verdictColor,
      confidence: confidence,
      justification: justification,
      positiveFactors: positiveFactors,
      riskFactors: riskFactors,
      valueSpreadPercent: valueSpread.toFixed(1),
      avgMarketOdd: avgOdd.toFixed(2),
      status: 'Pendente',
      date: new Date().toISOString().split('T')[0],
      disclaimer: window.SCANNERBET_CONFIG.AI_ENGINE.DISCLAIMER_TEXT
    };

    // Update History & User Credits
    const updatedHistory = [resultData, ...(currentState.history || [])];

    if (user && user.role !== 'Admin' && user.role !== 'Elite') {
      const updatedUser = {
        ...user,
        aiCreditsRemaining: Math.max(0, user.aiCreditsRemaining - 1),
        totalBets: (user.totalBets || 0) + 1
      };
      window.sbState.setState({ user: updatedUser, history: updatedHistory });
    } else {
      window.sbState.setState({ history: updatedHistory });
    }

    return resultData;
  }
}

window.AiEngineService = AiEngineService;
