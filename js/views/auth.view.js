/**
 * AUTHENTICATION VIEWS (PRIVATE LOGIN ONLY)
 */

class AuthView {
  static renderLogin() {
    const main = document.getElementById('app-main');
    if (!main) return;

    main.innerHTML = `
      <div class="max-w-md mx-auto py-12 space-y-6 animate-in fade-in duration-300">
        <div class="text-center space-y-2">
          <div class="w-12 h-12 rounded-2xl bg-[#06b6d4] flex items-center justify-center text-black font-black text-2xl mx-auto shadow-lg shadow-[#06b6d4]/30">
            S
          </div>
          <h2 class="text-2xl font-black text-white font-heading tracking-tight">ACESSAR SCANNERBET</h2>
          <p class="text-xs text-[#a3a3a3] uppercase tracking-widest font-bold">Ambiente Privado</p>
        </div>

        <div class="bg-[#141414] p-8 rounded-3xl border border-[#262626] space-y-6 shadow-2xl">
          <form id="auth-login-form" class="space-y-5">
            <div>
              <label class="text-xs text-[#a3a3a3] font-bold uppercase tracking-widest block mb-2">E-mail ou Usuário</label>
              <input type="email" id="login-email" required placeholder="seu@email.com" style="color: #ffffff; background-color: #0a0a0a;" class="w-full border border-[#333] rounded-xl px-4 py-3.5 text-sm font-semibold focus:outline-none focus:border-[#06b6d4] transition-colors placeholder-[#737373]" />
            </div>

            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="text-xs text-[#a3a3a3] font-bold uppercase tracking-widest block">Senha</label>
                <button type="button" id="auth-forgot-password" class="text-[10px] text-[#06b6d4] font-bold uppercase tracking-widest hover:underline">Esqueci minha senha</button>
              </div>
              <input type="password" id="login-password" required placeholder="••••••••" style="color: #ffffff; background-color: #0a0a0a;" class="w-full border border-[#333] rounded-xl px-4 py-3.5 text-sm font-semibold focus:outline-none focus:border-[#06b6d4] transition-colors placeholder-[#737373]" />
            </div>

            <button type="submit" id="auth-login-submit" class="w-full py-4 mt-2 rounded-xl bg-[#06b6d4] hover:bg-[#0891b2] text-black font-black text-xs uppercase tracking-widest shadow-lg shadow-[#06b6d4]/20 transition-all disabled:opacity-50">
              ENTRAR
            </button>
          </form>
        </div>
      </div>
    `;

    AuthView.bindLoginEvents();
  }

  // Removemos renderSignup pois o cadastro é privado.

  static bindLoginEvents() {
    const form = document.getElementById('auth-login-form');
    if (form) {
      form.onsubmit = async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('auth-login-submit');
        submitBtn.disabled = true;
        submitBtn.innerText = 'AUTENTICANDO...';

        try {
          const email = document.getElementById('login-email').value;
          const pass = document.getElementById('login-password').value;
          await window.AuthService.login(email, pass);
          window.Toast.show('Login realizado com sucesso!', 'success');
          window.sbApp.navigateTo('dashboard');
        } catch (err) {
          window.Toast.show(err.message, 'error');
          submitBtn.disabled = false;
          submitBtn.innerText = 'ENTRAR';
        }
      };
    }

    const forgotBtn = document.getElementById('auth-forgot-password');
    if (forgotBtn) {
      forgotBtn.onclick = async () => {
        const email = document.getElementById('login-email').value;
        if (!email) {
          window.Toast.show('Digite seu e-mail primeiro para recuperar a senha.', 'error');
          return;
        }
        try {
          await window.AuthService.resetPassword(email);
          window.Toast.show('Instruções de recuperação enviadas para o e-mail.', 'success');
        } catch(err) {
          window.Toast.show(err.message, 'error');
        }
      };
    }
  }
}

window.AuthView = AuthView;
