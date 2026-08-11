/**
 * AUTHENTICATION & USER SESSION SERVICE
 * (Private Access Only)
 */

class AuthService {
  // Configura um listener global de estado (injetado no app.js no init)
  static initializeAuthListener() {
    if (window.sbFirebase && window.sbFirebase.isConfigured) {
      window.sbFirebase.auth.onAuthStateChanged(user => {
        if (user) {
          // Firebase User is logged in
          const sbUser = this._mapFirebaseUser(user);
          window.sbState.setState({ user: sbUser });
        } else {
          // Logged out
          window.sbState.setState({ user: null });
        }
      });
    } else {
      // Fallback para localStorage Session (MOCK MODO)
      const mockSession = localStorage.getItem('sb_session');
      if (mockSession) {
         window.sbState.setState({ user: JSON.parse(mockSession) });
      }
    }
  }

  static _mapFirebaseUser(fbUser) {
     return {
        id: fbUser.uid,
        name: fbUser.displayName || fbUser.email.split('@')[0],
        email: fbUser.email,
        role: 'Pro', // Padrão
        planId: 'pro',
        avatar: fbUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
        onboardingCompleted: true, 
        picksRef: `sb_user_picks_${fbUser.uid}`
     };
  }

  // Login with Email & Password
  static async login(email, password) {
    if (!email || !password) {
      throw new Error('E-mail e senha são obrigatórios.');
    }

    if (window.sbFirebase && window.sbFirebase.isConfigured) {
       try {
          const cred = await window.sbFirebase.auth.signInWithEmailAndPassword(email, password);
          return this._mapFirebaseUser(cred.user);
       } catch (e) {
          console.error("Firebase Login Error", e);
          if (e.code === 'auth/wrong-password') throw new Error("Senha incorreta.");
          if (e.code === 'auth/user-not-found') throw new Error("E-mail não cadastrado.");
          if (e.code === 'auth/invalid-email') throw new Error("E-mail inválido.");
          throw new Error("Erro ao fazer login. Verifique suas credenciais.");
       }
    } else {
       // Fallback mock (para quem nao configurou as chaves ainda)
       const user = this._mapFirebaseUser({ uid: 'mock_uid_123', email: email });
       localStorage.setItem('sb_session', JSON.stringify(user));
       window.sbState.setState({ user });
       return user;
    }
  }

  // Password Reset
  static async resetPassword(email) {
    if (!email) throw new Error('Forneça um e-mail.');
    
    if (window.sbFirebase && window.sbFirebase.isConfigured) {
       try {
          await window.sbFirebase.auth.sendPasswordResetEmail(email);
       } catch (e) {
          console.error("Firebase Reset Error", e);
          if (e.code === 'auth/user-not-found') throw new Error("E-mail não cadastrado.");
          if (e.code === 'auth/invalid-email') throw new Error("E-mail inválido.");
          throw new Error("Erro ao redefinir senha.");
       }
    } else {
       // Fallback mock
       console.log("Mock: Password reset sent to", email);
       return true;
    }
  }

  // Logout Session
  static async logout() {
    if (window.sbFirebase && window.sbFirebase.isConfigured) {
       await window.sbFirebase.auth.signOut();
    }
    localStorage.removeItem('sb_session');
    window.sbState.setState({ user: null });
  }
}

window.AuthService = AuthService;
