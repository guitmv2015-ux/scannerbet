/**
 * AUTHENTICATION & USER SESSION SERVICE
 */

class AuthService {
  // Login with Email & Password
  static login(email, password) {
    if (!email || !password) {
      throw new Error('E-mail e senha são obrigatórios.');
    }

    // Check if logging in as Admin
    if (email.toLowerCase().includes('admin')) {
      const adminUser = {
        id: 'usr_admin',
        name: 'Administrador ScannerBet',
        email: email,
        role: 'Admin',
        planId: 'elite',
        aiCreditsRemaining: 9999,
        aiCreditsTotal: 9999,
        trialActive: false,
        onboardingCompleted: true,
        referralCode: 'ADMINSB',
        bio: 'Administrador geral da plataforma ScannerBet.',
        hitRate: 85.0,
        totalBets: 120,
        wins: 102,
        losses: 18,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'
      };
      window.sbState.setState({ user: adminUser });
      return adminUser;
    }

    // Normal User Login
    const defaultUser = {
      id: 'usr_' + Math.floor(Math.random() * 90000 + 10000),
      name: email.split('@')[0],
      email: email,
      role: 'Pro',
      planId: 'pro',
      aiCreditsRemaining: 150,
      aiCreditsTotal: 150,
      trialActive: false,
      onboardingCompleted: true,
      referralCode: 'SB' + Math.floor(Math.random() * 9000 + 1000),
      bio: 'Apostador cadastrado no ScannerBet.',
      hitRate: 70.0,
      totalBets: 10,
      wins: 7,
      losses: 3,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'
    };
    window.sbState.setState({ user: defaultUser });
    return defaultUser;
  }

  // Google Single-Sign-On Simulation
  static loginWithGoogle() {
    return this.login('usuario.google@gmail.com', 'google_auth_token');
  }

  // Register New Account
  static signup({ name, email, phone, password }) {
    if (!name || !email || !password) {
      throw new Error('Preencha os campos obrigatórios.');
    }

    const newUser = {
      id: 'usr_' + Math.floor(Math.random() * 90000 + 10000),
      name: name,
      email: email,
      phone: phone || '',
      role: 'Trial', // Recebe 7 dias de trial gratuito
      planId: 'start',
      aiCreditsRemaining: 10,
      aiCreditsTotal: 10,
      trialActive: true,
      trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      onboardingCompleted: false,
      referralCode: 'REF' + Math.floor(Math.random() * 9000 + 1000),
      bio: 'Novo membro da comunidade ScannerBet.',
      hitRate: 0,
      totalBets: 0,
      wins: 0,
      losses: 0,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'
    };

    window.sbState.setState({ user: newUser });
    return newUser;
  }

  // Complete Onboarding Questionnaire
  static completeOnboarding(onboardingData) {
    const currentState = window.sbState.getState();
    if (!currentState.user) return;

    const updatedUser = {
      ...currentState.user,
      onboardingCompleted: true,
      preferences: onboardingData
    };

    window.sbState.setState({ user: updatedUser });
    return updatedUser;
  }

  // Logout Session
  static logout() {
    localStorage.removeItem('sb_session');
    window.sbState.setState({ user: null, currentView: 'landing' });
  }

  // Switch Role Utility (For testing Admin vs User features easily)
  static switchUserRole(newRole) {
    const currentState = window.sbState.getState();
    if (!currentState.user) return;

    const updatedUser = {
      ...currentState.user,
      role: newRole,
      aiCreditsRemaining: newRole === 'Admin' || newRole === 'Elite' ? 9999 : (newRole === 'Pro' ? 150 : 30)
    };

    window.sbState.setState({ user: updatedUser });
  }
}

window.AuthService = AuthService;
