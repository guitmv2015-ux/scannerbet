/**
 * REFERRAL & AFFILIATE PROGRAM SERVICE
 */

class ReferralService {
  static getReferralLink(userCode) {
    const code = userCode || 'SCANNERBET';
    return `https://scannerbet.com.br/r/${code}`;
  }

  static trackReferralClick(code) {
    const state = window.sbState.getState();
    const stats = state.referralStats;

    window.sbState.setState({
      referralStats: {
        ...stats,
        clicks: stats.clicks + 1
      }
    });
  }

  static convertReferralSignup(code) {
    const state = window.sbState.getState();
    const stats = state.referralStats;

    window.sbState.setState({
      referralStats: {
        ...stats,
        signups: stats.signups + 1
      }
    });
  }

  static getLeaderboard() {
    return [
      { rank: 1, name: 'Rodrigo Trader', code: 'RODRIGO99', conversions: 42, reward: 'R$ 1.467,90' },
      { rank: 2, name: 'Felipe Apostador', code: 'FELIPE21', conversions: 31, reward: 'R$ 1.083,40' },
      { rank: 3, name: 'Camila Santos', code: 'CAMILA_SB', conversions: 24, reward: 'R$ 838,80' },
      { rank: 4, name: 'Lucas Ferreira (Você)', code: 'LUCAS789', conversions: 6, reward: 'R$ 209,70' },
      { rank: 5, name: 'Gabriel Tips', code: 'GABRIEL_TIPS', conversions: 5, reward: 'R$ 174,75' }
    ];
  }
}

window.ReferralService = ReferralService;
