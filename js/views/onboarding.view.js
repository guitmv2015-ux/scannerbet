/**
 * INTERACTIVE ONBOARDING WIZARD VIEW
 */

class OnboardingView {
  static render() {
    const main = document.getElementById('app-main');
    if (!main) return;

    main.innerHTML = `
      <div class="max-w-2xl mx-auto py-8 space-y-6 animate-in fade-in duration-300">
        <div class="text-center space-y-2">
          <span class="text-xs text-brand-400 font-bold uppercase tracking-wider">Passo 1 de 1 • Personalização</span>
          <h2 class="text-3xl font-black text-white font-heading">Bem-vindo ao ScannerBet!</h2>
          <p class="text-xs text-surface-400">Responda 4 perguntas rápidas para personalizarmos seus alertas e comparações.</p>
        </div>

        <div class="glass-panel p-6 md:p-8 rounded-3xl border border-surface-800 space-y-6">
          <form id="onboarding-form" class="space-y-6">
            
            <!-- Question 1 -->
            <div class="space-y-2">
              <label class="text-xs font-bold text-white block">1. Como pretende utilizar o ScannerBet?</label>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label class="p-3 rounded-xl bg-surface-950 border border-surface-700/60 hover:border-brand-500 cursor-pointer flex items-center gap-2 text-xs text-surface-200">
                  <input type="checkbox" name="usage" value="odds" checked class="accent-brand-500" />
                  <span>Comparar Odds</span>
                </label>
                <label class="p-3 rounded-xl bg-surface-950 border border-surface-700/60 hover:border-brand-500 cursor-pointer flex items-center gap-2 text-xs text-surface-200">
                  <input type="checkbox" name="usage" value="ai" checked class="accent-brand-500" />
                  <span>Análises por IA</span>
                </label>
                <label class="p-3 rounded-xl bg-surface-950 border border-surface-700/60 hover:border-brand-500 cursor-pointer flex items-center gap-2 text-xs text-surface-200">
                  <input type="checkbox" name="usage" value="community" class="accent-brand-500" />
                  <span>Comunidade</span>
                </label>
              </div>
            </div>

            <!-- Question 2 -->
            <div class="space-y-2">
              <label class="text-xs font-bold text-white block">2. Qual seu nível de experiência com apostas?</label>
              <select id="onboarding-experience" class="w-full bg-surface-950 border border-surface-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500">
                <option value="iniciante">Iniciante (Começando agora)</option>
                <option value="intermediario" selected>Intermediário (Já conheço mercados)</option>
                <option value="avancado">Avançado / Trader Esportivo</option>
              </select>
            </div>

            <!-- Question 3 -->
            <div class="space-y-2">
              <label class="text-xs font-bold text-white block">3. Quais campeonatos você acompanha?</label>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <label class="p-2.5 rounded-xl bg-surface-950 border border-surface-700/60 text-xs text-surface-200 flex items-center gap-2">
                  <input type="checkbox" name="leagues" value="brasileirao" checked class="accent-brand-500" />
                  <span>Brasileirão Série A</span>
                </label>
                <label class="p-2.5 rounded-xl bg-surface-950 border border-surface-700/60 text-xs text-surface-200 flex items-center gap-2">
                  <input type="checkbox" name="leagues" value="champions" checked class="accent-brand-500" />
                  <span>Champions League</span>
                </label>
                <label class="p-2.5 rounded-xl bg-surface-950 border border-surface-700/60 text-xs text-surface-200 flex items-center gap-2">
                  <input type="checkbox" name="leagues" value="nba" class="accent-brand-500" />
                  <span>NBA</span>
                </label>
              </div>
            </div>

            <button type="submit" class="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-500/25 transition-all">
              CONCLUIR CONFIGURAÇÃO E IR PARA O DASHBOARD ➔
            </button>
          </form>
        </div>
      </div>
    `;

    OnboardingView.bindEvents();
  }

  static bindEvents() {
    const form = document.getElementById('onboarding-form');
    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        window.AuthService.completeOnboarding({
          experience: document.getElementById('onboarding-experience').value,
          completedAt: new Date().toISOString()
        });
        window.Toast.show('Perfil configurado com sucesso! Bem-vindo.', 'success');
        window.sbApp.navigateTo('dashboard');
      };
    }
  }
}

window.OnboardingView = OnboardingView;
