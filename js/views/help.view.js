/**
 * HELP CENTER & AI ASSISTANT VIEW
 */

class HelpView {
  static render() {
    const main = document.getElementById('app-main');
    if (!main) return;

    main.innerHTML = `
      <div class="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
        
        <div class="border-b border-surface-800 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span class="text-xs text-brand-400 font-bold uppercase tracking-wider block">Suporte & FAQ</span>
            <h1 class="text-2xl md:text-3xl font-black text-white font-heading">Central de Ajuda</h1>
          </div>
          <button id="help-open-ai-bot-btn" class="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-500/25 flex items-center gap-2">
            <span>🤖</span> Falar com ScannerBot IA
          </button>
        </div>

        <div class="space-y-4">
          <div class="glass-panel p-5 rounded-2xl border border-surface-800 space-y-2">
            <h3 class="font-bold text-white text-sm">Como funciona o ScannerBet?</h3>
            <p class="text-xs text-surface-300 leading-relaxed">
              O ScannerBet é um agregador e comparador de odds esportivas em tempo real. Ele analisa as cotações oferecidas por casas como Betano, bet365 e Superbet e aplica um algoritmo de IA para gerar o Scanner Score (0-100), destacando a melhor entrada estatística.
            </p>
          </div>

          <div class="glass-panel p-5 rounded-2xl border border-surface-800 space-y-2">
            <h3 class="font-bold text-white text-sm">O ScannerBet garante lucros ou 100% de acerto?</h3>
            <p class="text-xs text-surface-300 leading-relaxed">
              Não. O ScannerBet é estritamente uma ferramenta de suporte à tomada de decisão. Apostas esportivas envolvem risco e não existem lucros garantidos.
            </p>
          </div>

          <div class="glass-panel p-5 rounded-2xl border border-surface-800 space-y-2">
            <h3 class="font-bold text-white text-sm">Como funciona o programa Indique e Ganhe?</h3>
            <p class="text-xs text-surface-300 leading-relaxed">
              Cada usuário possui um link exclusivo na aba "Indique e Ganhe". Ao convidar amigos que assinem a plataforma, você recebe 30% de comissão recorrente.
            </p>
          </div>
        </div>

      </div>
    `;

    HelpView.bindEvents();
  }

  static bindEvents() {
    const botBtn = document.getElementById('help-open-ai-bot-btn');
    if (botBtn) {
      botBtn.onclick = () => {
        const drawer = document.getElementById('ai-assistant-drawer');
        if (drawer) {
          drawer.classList.remove('translate-y-full', 'opacity-0', 'pointer-events-none');
        }
      };
    }
  }
}

window.HelpView = HelpView;
