/**
 * SCANNERBET CENTRAL STATE STORE & SEED DATA ENGINE
 * Rich catalog of live & upcoming sports matches with complete bookmaker odds grids.
 */

class ScannerBetState {
  constructor() {
    this.subscribers = [];
    
    const savedTheme = localStorage.getItem('sb_theme') || 'dark';
    const savedSession = JSON.parse(localStorage.getItem('sb_session') || 'null');

    this.state = {
      currentView: 'landing',
      theme: savedTheme,
      user: savedSession || {
        id: 'usr_88321',
        name: 'Lucas Ferreira',
        email: 'lucas.apostador@gmail.com',
        role: 'Pro',
        planId: 'pro',
        aiCreditsRemaining: 114,
        aiCreditsTotal: 150,
        trialActive: false,
        onboardingCompleted: true,
        referralCode: 'LUCAS789',
        bio: 'Apostador entusiasta focado no Brasileirão, Champions League e NBA.',
        hitRate: 72.4,
        totalBets: 47,
        wins: 34,
        losses: 13,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces'
      },
      
      // Expanded Sports Matches Database (Sportsbook Layout Inspired)
      events: [
        {
          id: 'evt_101',
          sportId: 'futebol',
          leagueId: 'brasileirao',
          leagueName: 'Brasileirão Série A',
          homeTeam: 'Flamengo',
          awayTeam: 'Palmeiras',
          time: 'Hoje, 21:30',
          status: 'AO VIVO 68\'',
          isLive: true,
          scoreLive: '1 - 1',
          stadium: 'Maracanã',
          markets: [
            {
              id: 'mkt_1',
              name: 'Vencedor da Partida (1X2)',
              selections: [
                { name: 'Flamengo (Casa)', odds: { betano: 2.10, bet365: 2.15, superbet: 2.22, kto: 2.12 }, best: 'superbet' },
                { name: 'Empate', odds: { betano: 3.30, bet365: 3.40, superbet: 3.35, kto: 3.48 }, best: 'kto' },
                { name: 'Palmeiras (Fora)', odds: { betano: 3.50, bet365: 3.45, superbet: 3.40, kto: 3.58 }, best: 'kto' }
              ]
            },
            {
              id: 'mkt_2',
              name: 'Ambas Equipes Marcam',
              selections: [
                { name: 'Sim (BTTS)', odds: { betano: 1.85, bet365: 1.90, superbet: 1.94, kto: 1.88 }, best: 'superbet' },
                { name: 'Não', odds: { betano: 1.95, bet365: 1.90, superbet: 1.85, kto: 1.92 }, best: 'betano' }
              ]
            },
            {
              id: 'mkt_3',
              name: 'Total de Gols (Over/Under 2.5)',
              selections: [
                { name: 'Over 2.5 Gols', odds: { betano: 1.98, bet365: 2.06, superbet: 2.02, kto: 2.00 }, best: 'bet365' },
                { name: 'Under 2.5 Gols', odds: { betano: 1.82, bet365: 1.78, superbet: 1.80, kto: 1.85 }, best: 'kto' }
              ]
            },
            {
              id: 'mkt_3b',
              name: 'Escanteios (Over/Under 9.5)',
              selections: [
                { name: 'Over 9.5 Cantos', odds: { betano: 1.88, bet365: 1.92, superbet: 1.95, kto: 1.90 }, best: 'superbet' },
                { name: 'Under 9.5 Cantos', odds: { betano: 1.90, bet365: 1.88, superbet: 1.85, kto: 1.92 }, best: 'kto' }
              ]
            }
          ]
        },
        {
          id: 'evt_102',
          sportId: 'futebol',
          leagueId: 'brasileirao',
          leagueName: 'Brasileirão Série A',
          homeTeam: 'São Paulo',
          awayTeam: 'Corinthians',
          time: 'Hoje, 19:00',
          status: 'Em Breve',
          isLive: false,
          stadium: 'MorumBIS',
          markets: [
            {
              id: 'mkt_4',
              name: 'Vencedor da Partida (1X2)',
              selections: [
                { name: 'São Paulo', odds: { betano: 2.05, bet365: 2.10, superbet: 2.15, kto: 2.08 }, best: 'superbet' },
                { name: 'Empate', odds: { betano: 3.20, bet365: 3.25, superbet: 3.30, kto: 3.35 }, best: 'kto' },
                { name: 'Corinthians', odds: { betano: 3.80, bet365: 3.75, superbet: 3.70, kto: 3.85 }, best: 'kto' }
              ]
            },
            {
              id: 'mkt_5',
              name: 'Dupla Chance',
              selections: [
                { name: 'São Paulo ou Empate (1X)', odds: { betano: 1.28, bet365: 1.30, superbet: 1.33, kto: 1.29 }, best: 'superbet' },
                { name: 'Corinthians ou Empate (X2)', odds: { betano: 1.75, bet365: 1.72, superbet: 1.70, kto: 1.78 }, best: 'kto' }
              ]
            }
          ]
        },
        {
          id: 'evt_103',
          sportId: 'futebol',
          leagueId: 'champions',
          leagueName: 'UEFA Champions League',
          homeTeam: 'Real Madrid',
          awayTeam: 'Manchester City',
          time: 'Amanhã, 16:00',
          status: 'Em Breve',
          isLive: false,
          stadium: 'Santiago Bernabéu',
          markets: [
            {
              id: 'mkt_6',
              name: 'Vencedor da Partida (1X2)',
              selections: [
                { name: 'Real Madrid', odds: { betano: 2.65, bet365: 2.70, superbet: 2.75, kto: 2.68 }, best: 'superbet' },
                { name: 'Empate', odds: { betano: 3.60, bet365: 3.50, superbet: 3.65, kto: 3.72 }, best: 'kto' },
                { name: 'Manchester City', odds: { betano: 2.50, bet365: 2.58, superbet: 2.48, kto: 2.52 }, best: 'bet365' }
              ]
            },
            {
              id: 'mkt_7',
              name: 'Ambas Equipes Marcam',
              selections: [
                { name: 'Sim (BTTS)', odds: { betano: 1.55, bet365: 1.60, superbet: 1.62, kto: 1.58 }, best: 'superbet' },
                { name: 'Não', odds: { betano: 2.35, bet365: 2.30, superbet: 2.25, kto: 2.40 }, best: 'kto' }
              ]
            }
          ]
        },
        {
          id: 'evt_104',
          sportId: 'futebol',
          leagueId: 'premier-league',
          leagueName: 'Premier League',
          homeTeam: 'Liverpool',
          awayTeam: 'Arsenal',
          time: 'Sábado, 13:30',
          status: 'Em Breve',
          isLive: false,
          stadium: 'Anfield Road',
          markets: [
            {
              id: 'mkt_8',
              name: 'Vencedor da Partida (1X2)',
              selections: [
                { name: 'Liverpool', odds: { betano: 2.25, bet365: 2.30, superbet: 2.35, kto: 2.28 }, best: 'superbet' },
                { name: 'Empate', odds: { betano: 3.50, bet365: 3.60, superbet: 3.55, kto: 3.65 }, best: 'kto' },
                { name: 'Arsenal', odds: { betano: 3.10, bet365: 3.00, superbet: 3.05, kto: 3.15 }, best: 'kto' }
              ]
            }
          ]
        },
        {
          id: 'evt_201',
          sportId: 'basquete',
          leagueId: 'nba',
          leagueName: 'NBA Finals / Play-offs',
          homeTeam: 'Golden State Warriors',
          awayTeam: 'Boston Celtics',
          time: 'Hoje, 23:00',
          status: 'Em Breve',
          isLive: false,
          stadium: 'Chase Center',
          markets: [
            {
              id: 'mkt_9',
              name: 'Vencedor da Partida (Moneyline)',
              selections: [
                { name: 'Warriors', odds: { betano: 1.95, bet365: 2.02, superbet: 1.98, kto: 2.05 }, best: 'kto' },
                { name: 'Celtics', odds: { betano: 1.88, bet365: 1.83, superbet: 1.86, kto: 1.85 }, best: 'betano' }
              ]
            },
            {
              id: 'mkt_10',
              name: 'Total de Pontos (Over/Under 218.5)',
              selections: [
                { name: 'Over 218.5 Pontos', odds: { betano: 1.90, bet365: 1.92, superbet: 1.96, kto: 1.91 }, best: 'superbet' },
                { name: 'Under 218.5 Pontos', odds: { betano: 1.90, bet365: 1.88, superbet: 1.85, kto: 1.92 }, best: 'kto' }
              ]
            }
          ]
        },
        {
          id: 'evt_301',
          sportId: 'mma',
          leagueId: 'ufc-ppv',
          leagueName: 'UFC PPV Card Principal',
          homeTeam: 'Alex Pereira (Poatan)',
          awayTeam: 'Magomed Ankalaev',
          time: 'Sábado, 23:30',
          status: 'Em Breve',
          isLive: false,
          stadium: 'T-Mobile Arena',
          markets: [
            {
              id: 'mkt_11',
              name: 'Vencedor da Luta',
              selections: [
                { name: 'Alex Pereira', odds: { betano: 1.85, bet365: 1.90, superbet: 1.92, kto: 1.88 }, best: 'superbet' },
                { name: 'Ankalaev', odds: { betano: 1.95, bet365: 1.90, superbet: 1.88, kto: 1.92 }, best: 'betano' }
              ]
            }
          ]
        }
      ],

      // History Seed
      history: [
        {
          id: 'ans_501',
          match: 'Flamengo vs Palmeiras',
          league: 'Brasileirão Série A',
          selection: 'Ambas Marcam (Sim)',
          odd: 1.94,
          bookmaker: 'SUPERBET',
          score: 84,
          status: 'Pendente',
          date: '2026-08-10',
          verdict: '🟢 Favorável',
          confidence: '82%',
          justification: 'Ambas as equipes possuem média de xG superior a 1.6 nas últimas 5 partidas. Histórico de confrontos diretos teve ambas marcando em 4 dos últimos 5 jogos.'
        },
        {
          id: 'ans_500',
          match: 'São Paulo vs Corinthians',
          league: 'Brasileirão Série A',
          selection: 'Under 2.5 Gols',
          odd: 1.85,
          bookmaker: 'BETANO',
          score: 79,
          status: 'Ganhou',
          date: '2026-08-08',
          verdict: '🟢 Favorável',
          confidence: '78%',
          justification: 'Clássico com forte padrão defensivo e partidas truncadas nos últimos 3 encontros no Morumbi.'
        }
      ],

      // Community Feed Seed
      posts: [
        {
          id: 'pst_1',
          author: 'Equipe ScannerBet',
          role: 'Admin',
          official: true,
          avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop',
          time: 'Há 35 min',
          text: '🔥 PALPITE OFICIAL SCANNERBET DA RODADA!\nAnalisamos todas as odds do confronto Flamengo x Palmeiras. A Superbet está pagando 1.94 para Ambas Marcam, representando 8.4% de valor acima da média das outras casas. Scanner Score: 84/100.',
          attachedBet: {
            match: 'Flamengo vs Palmeiras',
            selection: 'Ambas Marcam - Sim',
            odd: 1.94,
            bookmaker: 'SUPERBET',
            score: 84
          },
          likes: 48,
          liked: false,
          saved: true,
          comments: [
            { author: 'Mateus Silva', text: 'Excelente análise! Já fiz a entrada na Superbet.', time: 'Há 20 min' },
            { author: 'Carla Dias', text: 'Concordo, o Palmeiras vem marcando fora de casa em todos os jogos.', time: 'Há 10 min' }
          ]
        }
      ],

      // Groups
      groups: [
        { id: 'grp_1', name: 'Brasileirão Pro', members: 1420, icon: '⚽', desc: 'Discussões e análises táticas do Campeonato Brasileiro.' },
        { id: 'grp_2', name: 'NBA & Basquete', members: 890, icon: '🏀', desc: 'Palpites e projeções de estatísticas individuais de jogadores.' },
        { id: 'grp_3', name: 'Champions & Futebol Europeu', members: 2150, icon: '🏆', desc: 'Tudo sobre as principais ligas europeias e torneios internacionais.' }
      ],

      // Referral Stats
      referralStats: {
        clicks: 142,
        signups: 18,
        activeSubscribers: 6,
        commissionEarned: 209.70,
        unpaidBalance: 139.80,
        rankPosition: 4
      },

      notifications: [
        { id: 'not_1', title: 'Novo Palpite Oficial', message: 'A equipe ScannerBet publicou uma nova análise para Flamengo x Palmeiras.', time: 'Há 35 min', read: false }
      ],

      adminMetrics: {
        totalUsers: 14850,
        activeSubscribers: 3420,
        mrr: 239400.00,
        churnRate: 2.1,
        totalAiAnalyses: 184500,
        oddsUpdateFrequencySec: 4,
        systemStatus: 'Operacional'
      }
    };
  }

  getState() {
    return this.state;
  }

  setState(partialState) {
    this.state = { ...this.state, ...partialState };
    if (partialState.theme) {
      localStorage.setItem('sb_theme', partialState.theme);
    }
    if (partialState.user) {
      localStorage.setItem('sb_session', JSON.stringify(partialState.user));
    }
    this.notifySubscribers();
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  notifySubscribers() {
    this.subscribers.forEach(cb => cb(this.state));
  }
}

window.sbState = new ScannerBetState();
