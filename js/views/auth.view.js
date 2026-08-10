/**
 * AUTHENTICATION VIEWS (LOGIN / SIGNUP)
 */

class AuthView {
  static renderLogin() {
    const main = document.getElementById('app-main');
    if (!main) return;

    main.innerHTML = `
      <div class="max-w-md mx-auto py-12 space-y-6 animate-in fade-in duration-300">
        <div class="text-center space-y-2">
          <div class="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center text-white font-black text-2xl mx-auto shadow-lg shadow-brand-500/30">
            S
          </div>
          <h2 class="text-2xl font-black text-white font-heading">Acessar Conta ScannerBet</h2>
          <p class="text-xs text-surface-400">Entre para acessar suas comparações de odds e análises de IA.</p>
        </div>

        <div class="glass-panel p-6 rounded-3xl border border-surface-800 space-y-4">
          <!-- Google OAuth Button -->
          <button id="auth-google-btn" class="w-full py-3 rounded-xl bg-surface-950 hover:bg-surface-900 border border-surface-700 text-white font-semibold text-xs flex items-center justify-center gap-3 transition-all">
            <svg class="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
            Entrar com Google
          </button>

          <div class="flex items-center gap-3 my-2 text-surface-500 text-[10px] uppercase font-bold tracking-widest">
            <hr class="flex-1 border-surface-800" /> ou e-mail <hr class="flex-1 border-surface-800" />
          </div>

          <form id="auth-login-form" class="space-y-3">
            <div>
              <label class="text-xs text-surface-300 font-semibold block mb-1">E-mail</label>
              <input type="email" id="login-email" required placeholder="seu@email.com" class="w-full bg-surface-950 border border-surface-700/80 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500" />
            </div>

            <div>
              <label class="text-xs text-surface-300 font-semibold block mb-1">Senha</label>
              <input type="password" id="login-password" required placeholder="••••••••" class="w-full bg-surface-950 border border-surface-700/80 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500" />
            </div>

            <button type="submit" class="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-500/25 transition-all">
              ENTRAR NA PLATAFORMA
            </button>
          </form>
        </div>

        <div class="text-center text-xs text-surface-400">
          Ainda não tem conta? <button id="auth-goto-register" class="text-brand-400 font-bold hover:underline">Cadastre-se grátis</button>
        </div>
      </div>
    `;

    AuthView.bindLoginEvents();
  }

  static renderSignup() {
    const main = document.getElementById('app-main');
    if (!main) return;

    main.innerHTML = `
      <div class="max-w-md mx-auto py-12 space-y-6 animate-in fade-in duration-300">
        <div class="text-center space-y-2">
          <div class="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center text-white font-black text-2xl mx-auto shadow-lg shadow-brand-500/30">
            S
          </div>
          <h2 class="text-2xl font-black text-white font-heading">Criar Conta no ScannerBet</h2>
          <p class="text-xs text-surface-400">Ganhe 7 dias de teste gratuito sem precisar de cartão.</p>
        </div>

        <div class="glass-panel p-6 rounded-3xl border border-surface-800 space-y-4">
          <form id="auth-signup-form" class="space-y-3">
            <div>
              <label class="text-xs text-surface-300 font-semibold block mb-1">Nome Completo</label>
              <input type="text" id="signup-name" required placeholder="Seu nome" class="w-full bg-surface-950 border border-surface-700/80 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500" />
            </div>

            <div>
              <label class="text-xs text-surface-300 font-semibold block mb-1">E-mail</label>
              <input type="email" id="signup-email" required placeholder="seu@email.com" class="w-full bg-surface-950 border border-surface-700/80 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500" />
            </div>

            <div>
              <label class="text-xs text-surface-300 font-semibold block mb-1">Telefone (WhatsApp)</label>
              <input type="tel" id="signup-phone" placeholder="(11) 99999-9999" class="w-full bg-surface-950 border border-surface-700/80 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500" />
            </div>

            <div>
              <label class="text-xs text-surface-300 font-semibold block mb-1">Senha</label>
              <input type="password" id="signup-password" required placeholder="••••••••" class="w-full bg-surface-950 border border-surface-700/80 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500" />
            </div>

            <button type="submit" class="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-500/25 transition-all">
              CRIAR CONTA & INICIAR TESTE GRÁTIS
            </button>
          </form>
        </div>

        <div class="text-center text-xs text-surface-400">
          Já possui uma conta? <button id="auth-goto-login" class="text-brand-400 font-bold hover:underline">Fazer login</button>
        </div>
      </div>
    `;

    AuthView.bindSignupEvents();
  }

  static bindLoginEvents() {
    const form = document.getElementById('auth-login-form');
    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        try {
          const email = document.getElementById('login-email').value;
          const pass = document.getElementById('login-password').value;
          window.AuthService.login(email, pass);
          window.Toast.show('Login realizado com sucesso!', 'success');
          window.sbApp.navigateTo('dashboard');
        } catch (err) {
          window.Toast.show(err.message, 'error');
        }
      };
    }

    const googleBtn = document.getElementById('auth-google-btn');
    if (googleBtn) {
      googleBtn.onclick = () => {
        window.AuthService.loginWithGoogle();
        window.Toast.show('Autenticado com Google!', 'success');
        window.sbApp.navigateTo('dashboard');
      };
    }

    const gotoReg = document.getElementById('auth-goto-register');
    if (gotoReg) gotoReg.onclick = () => window.sbApp.navigateTo('auth-register');
  }

  static bindSignupEvents() {
    const form = document.getElementById('auth-signup-form');
    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        try {
          const name = document.getElementById('signup-name').value;
          const email = document.getElementById('signup-email').value;
          const phone = document.getElementById('signup-phone').value;
          const pass = document.getElementById('signup-password').value;

          window.AuthService.signup({ name, email, phone, password: pass });
          window.Toast.show('Conta criada! Bem-vindo ao Onboarding.', 'success');
          window.sbApp.navigateTo('onboarding');
        } catch (err) {
          window.Toast.show(err.message, 'error');
        }
      };
    }

    const gotoLogin = document.getElementById('auth-goto-login');
    if (gotoLogin) gotoLogin.onclick = () => window.sbApp.navigateTo('auth-login');
  }
}

window.AuthView = AuthView;
