/**
 * STYLIZED MODAL MANAGER COMPONENT
 * Renders AI Analysis Modal, Paywall, and confirmation actions.
 */

class ModalManager {
  static open(htmlContent) {
    const container = document.getElementById('modal-container');
    const content = document.getElementById('modal-content');
    if (!container || !content) return;

    content.innerHTML = htmlContent;
    container.classList.remove('hidden');
    container.classList.add('flex');
    document.body.style.overflow = 'hidden';

    const closeBtn = content.querySelector('.modal-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => ModalManager.close());
    }

    container.onclick = (e) => {
      if (e.target === container) ModalManager.close();
    };
  }

  static close() {
    const container = document.getElementById('modal-container');
    if (!container) return;
    container.classList.add('hidden');
    container.classList.remove('flex');
    document.body.style.overflow = 'auto';
  }

  /**
   * Renders AI Analysis Result Modal
   */
  static openAiAnalysisModal(res) {
    const isFavoravel = res.score >= 80;
    const isAtencao = res.score >= 65 && res.score < 80;
    const borderColor = isFavoravel ? '#10b981' : (isAtencao ? '#f59e0b' : '#f43f5e');
    const glowClass = isFavoravel ? 'glow-card-emerald' : (isAtencao ? 'glow-card-amber' : 'border-rose-500/50 shadow-rose-500/20');

    const html = `
      <div class="p-6 md:p-8 space-y-6 bg-surface-900/95 backdrop-blur-2xl">
        <!-- Modal Header -->
        <div class="flex items-center justify-between border-b border-surface-800 pb-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 border border-brand-400/40 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-brand-500/30">
              ⚡
            </div>
            <div>
              <h3 class="text-xl font-black text-white flex items-center gap-2 font-heading">
                Análise ScannerBet
                <span class="text-[10px] px-3 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/40 font-mono font-bold uppercase tracking-wider">IA V3.0 ENGINE</span>
              </h3>
              <p class="text-xs text-surface-400 font-medium">${res.match} — ${res.league}</p>
            </div>
          </div>
          <button class="modal-close-btn text-surface-400 hover:text-white p-2 rounded-xl hover:bg-surface-800 transition-colors">
            ✕
          </button>
        </div>

        <!-- Scanner Score Meter & Verdict Hero -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 bg-surface-950/90 p-6 rounded-3xl border border-surface-800/90 items-center ${glowClass}">
          <!-- Radial Score Circle -->
          <div class="flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-surface-800 pb-4 md:pb-0 pr-0 md:pr-6">
            <div class="score-circle mb-3" style="border: 4px solid ${borderColor}; box-shadow: 0 0 25px ${borderColor}40">
              <div class="text-center">
                <span class="text-4xl font-black text-white block leading-none font-heading">${res.score}</span>
                <span class="text-[10px] text-surface-400 font-mono font-bold block pt-1">/100 SCORE</span>
              </div>
            </div>
            <span class="text-xs font-mono font-bold text-surface-300 tracking-wider uppercase">Scanner Score</span>
          </div>

          <!-- Verdict & Selection Details -->
          <div class="md:col-span-2 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs text-surface-400 uppercase tracking-widest font-mono font-bold">Seleção Analisada</span>
              <span class="text-xs px-3.5 py-1 rounded-full font-black uppercase tracking-wider shadow-lg" style="background: ${borderColor}20; color: ${borderColor}; border: 1px solid ${borderColor}50">
                ${res.verdict}
              </span>
            </div>
            <h4 class="text-2xl font-black text-white font-heading">${res.selection}</h4>
            <div class="flex flex-wrap items-center gap-3 text-xs pt-1">
              <span class="bg-surface-900 px-3.5 py-2 rounded-xl border border-surface-700/80 font-medium text-surface-300">
                Mercado: <strong class="text-white">${res.market}</strong>
              </span>
              <span class="bg-surface-900 px-3.5 py-2 rounded-xl border border-surface-700/80 font-medium text-surface-300">
                Odd: <strong class="text-emerald-400 font-bold">${res.odd}</strong> (${res.bookmaker})
              </span>
              <span class="bg-surface-900 px-3.5 py-2 rounded-xl border border-surface-700/80 font-medium text-surface-300">
                Confiança: <strong class="text-brand-300 font-bold">${res.confidence}</strong>
              </span>
            </div>
          </div>
        </div>

        <!-- Justification & Key Factors -->
        <div class="space-y-4 text-xs md:text-sm">
          <div>
            <h5 class="text-xs font-mono font-bold text-surface-400 uppercase tracking-widest mb-2">Justificativa Preditiva da IA</h5>
            <p class="text-surface-200 bg-surface-950/80 p-4 rounded-2xl border border-surface-800 leading-relaxed">
              ${res.justification}
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Positive Factors -->
            <div class="bg-emerald-950/25 border border-emerald-500/30 p-4 rounded-2xl space-y-2.5">
              <h6 class="font-bold text-emerald-400 flex items-center gap-2 text-xs uppercase tracking-wider">
                <span>🟢</span> Fatores Positivos (+EV)
              </h6>
              <ul class="space-y-2 text-xs text-emerald-100/90 list-disc list-inside">
                ${res.positiveFactors.map(f => `<li>${f}</li>`).join('')}
              </ul>
            </div>

            <!-- Risk Factors -->
            <div class="bg-rose-950/25 border border-rose-500/30 p-4 rounded-2xl space-y-2.5">
              <h6 class="font-bold text-rose-400 flex items-center gap-2 text-xs uppercase tracking-wider">
                <span>🔴</span> Pontos de Atenção & Risco
              </h6>
              <ul class="space-y-2 text-xs text-rose-100/90 list-disc list-inside">
                ${res.riskFactors.map(f => `<li>${f}</li>`).join('')}
              </ul>
            </div>
          </div>
        </div>

        <!-- Responsible Gambling Disclaimer Banner -->
        <div class="p-3.5 bg-surface-950 rounded-2xl border border-surface-800 text-[11px] text-surface-400 leading-tight">
          <strong class="text-amber-400">🔞 Jogo Responsável (18+):</strong> ${res.disclaimer}
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-surface-800 pt-4">
          <button id="modal-save-history-btn" class="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-surface-800 hover:bg-surface-700 border border-surface-700 text-xs font-bold text-surface-200 flex items-center justify-center gap-2 transition-all">
            📜 Salvo no Histórico
          </button>
          <button id="publish-to-community-btn" class="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-surface-800 hover:bg-surface-700 border border-surface-700 text-xs font-bold text-white flex items-center justify-center gap-2 transition-all">
            💬 Compartilhar na Comunidade
          </button>
          <button class="modal-close-btn btn-primary-gradient w-full sm:w-auto px-7 py-2.5 rounded-2xl text-xs font-extrabold text-white transition-all">
            Concluído
          </button>
        </div>
      </div>
    `;

    ModalManager.open(html);

    // Bind event handlers for action buttons
    setTimeout(() => {
      const shareBtn = document.getElementById('publish-to-community-btn');
      if (shareBtn) {
        shareBtn.onclick = () => {
          window.CommunityService.createPost({
            text: `Análise ScannerBet realizada! ${res.match} — ${res.selection} @${res.odd} na ${res.bookmaker}. Score ${res.score}/100.`,
            attachedBet: {
              match: res.match,
              selection: res.selection,
              odd: res.odd,
              bookmaker: res.bookmaker,
              score: res.score
            }
          });
          ModalManager.close();
          window.Toast.show('Análise publicada na comunidade com sucesso!', 'success');
          window.sbApp.navigateTo('community');
        };
      }

      const saveHistBtn = document.getElementById('modal-save-history-btn');
      if (saveHistBtn) {
        saveHistBtn.onclick = () => {
          window.Toast.show('Esta análise já está salva em seu Histórico!', 'success');
          ModalManager.close();
          window.sbApp.navigateTo('history');
        };
      }
    }, 50);
  }

  /**
   * Renders Paywall / Upgrade Modal
   */
  static openPaywallModal() {
    const html = `
      <div class="p-8 text-center space-y-6 bg-surface-900/95 backdrop-blur-2xl">
        <div class="w-20 h-20 rounded-3xl bg-brand-500/20 border border-brand-500 flex items-center justify-center text-4xl mx-auto text-brand-400 glow-card-purple animate-bounce">
          ⚡
        </div>
        <div class="space-y-2">
          <h3 class="text-3xl font-black text-white font-heading">Limite de Análises Atingido</h3>
          <p class="text-xs md:text-sm text-surface-400 max-w-md mx-auto">
            Você utilizou todas as suas análises de Inteligência Artificial do plano atual. Faça o upgrade para ter análises ilimitadas.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto text-left">
          <div class="p-5 rounded-2xl bg-surface-950 border border-brand-500/50 relative overflow-hidden">
            <span class="absolute top-3 right-3 text-[9px] bg-brand-500 text-white font-black px-2.5 py-0.5 rounded-full uppercase">Recomendado</span>
            <h4 class="font-bold text-white text-base">Scanner Pro</h4>
            <div class="text-2xl font-black text-white my-1">R$ 69,90<span class="text-xs text-surface-400 font-normal">/mês</span></div>
            <p class="text-xs text-surface-400">150 análises de IA/mês + Acesso a todas as casas</p>
          </div>

          <div class="p-5 rounded-2xl bg-surface-950 border border-surface-800">
            <h4 class="font-bold text-white text-base">Scanner Elite</h4>
            <div class="text-2xl font-black text-white my-1">R$ 99,90<span class="text-xs text-surface-400 font-normal">/mês</span></div>
            <p class="text-xs text-surface-400">Análises ILIMITADAS + Alertas VIP</p>
          </div>
        </div>

        <div class="flex items-center justify-center gap-3 pt-2">
          <button class="modal-close-btn px-5 py-3 rounded-2xl bg-surface-800 text-surface-300 text-xs font-bold hover:bg-surface-700">
            Agora Não
          </button>
          <button id="upgrade-now-btn" class="btn-primary-gradient px-7 py-3 rounded-2xl text-white font-black text-xs transition-all">
            Ver Planos & Assinar
          </button>
        </div>
      </div>
    `;

    ModalManager.open(html);

    setTimeout(() => {
      const upgradeBtn = document.getElementById('upgrade-now-btn');
      if (upgradeBtn) {
        upgradeBtn.onclick = () => {
          ModalManager.close();
          window.sbApp.navigateTo('plans');
        });
      }
    }, 50);
  }
}

window.ModalManager = ModalManager;
