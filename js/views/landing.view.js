/**
 * ULTRA-STYLIZED LANDING PAGE VIEW
 */

class LandingView {
  static render() {
    const main = document.getElementById('app-main');
    if (!main) return;

    main.innerHTML = `
      <div class="space-y-28 py-6 animate-in fade-in duration-500">
        
        <!-- HERO SECTION -->
        <section class="relative text-center max-w-5xl mx-auto space-y-8 pt-10">
          <!-- Ambient Radial Flares -->
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-brand-600/30 via-purple-600/20 to-cyan-500/20 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse"></div>

          <!-- Feature Badge -->
          <div class="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-surface-900/90 border border-brand-500/50 text-brand-300 text-xs font-bold shadow-xl shadow-brand-500/10 backdrop-blur-xl">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>NOVO ENGINE V3.0 — Comparador de Odds & IA Esportiva</span>
          </div>

          <!-- Main Title -->
          <h1 class="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tight leading-[1.05] font-heading">
            Pare de procurar odds em vários lugares.<br/>
            <span class="text-gradient-purple drop-shadow-[0_10px_35px_rgba(124,58,237,0.4)]">
              Analise em um só lugar.
            </span>
          </h1>

          <!-- Subtitle -->
          <p class="text-base md:text-xl text-surface-300 max-w-3xl mx-auto font-normal leading-relaxed">
            Centralize cotações da <strong class="text-white">Betano, bet365, Superbet e KTO</strong> instantaneamente. Obtenha recomendações calculadas com <strong class="text-emerald-400">Scanner Score (0-100)</strong> e acompanhe palpites oficiais.
          </p>

          <!-- Action CTAs -->
          <div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button id="hero-cta-start" class="btn-primary-gradient w-full sm:w-auto px-10 py-5 rounded-2xl text-white font-black text-base transition-all transform hover:scale-105">
              TESTAR AGORA GRÁTIS ⚡
            </button>
            <button id="hero-cta-demo" class="w-full sm:w-auto px-10 py-5 rounded-2xl bg-surface-900/80 hover:bg-surface-800 border border-surface-700/80 text-white font-bold text-base transition-all backdrop-blur-md">
              VER COMO FUNCIONA
            </button>
          </div>

          <!-- Proof Badges -->
          <div class="pt-6 flex flex-wrap items-center justify-center gap-8 text-xs text-surface-400 font-semibold">
            <span class="flex items-center gap-2">✓ Teste Grátis de 7 Dias</span>
            <span class="flex items-center gap-2">✓ Sem Necessidade de Cartão</span>
            <span class="flex items-center gap-2">✓ Conteúdo 18+ Responsável</span>
          </div>
        </section>

        <!-- INTERACTIVE LIVE SCANNER DEMO PREVIEW -->
        <section id="demo-section" class="glass-panel p-6 md:p-10 rounded-[32px] space-y-6 glow-card-purple relative overflow-hidden">
          <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-surface-800/80 pb-6">
            <div>
              <span class="text-xs text-brand-400 font-mono font-bold uppercase tracking-widest block mb-1">⚡ Demonstração em Tempo Real</span>
              <h2 class="text-2xl md:text-3xl font-black text-white">ScannerBet em Ação</h2>
            </div>
            <div class="flex items-center gap-2.5 text-xs bg-surface-950/80 px-4 py-2 rounded-2xl border border-surface-800 text-surface-200">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Casas Sincronizadas: <strong>4 Provedores</strong></span>
            </div>
          </div>

          <!-- Preview Match Event Card -->
          <div class="bg-surface-950/80 p-6 rounded-2xl border border-surface-800/80 space-y-6">
            <div class="flex items-center justify-between text-xs">
              <span class="font-black text-brand-400 uppercase tracking-wider">⚽ Brasileirão Série A</span>
              <span class="text-surface-400 font-mono">Hoje às 21:30 • Maracanã</span>
            </div>

            <div class="flex items-center justify-around py-4">
              <div class="text-center">
                <span class="text-2xl md:text-4xl font-black text-white block font-heading">Flamengo</span>
                <span class="text-xs text-surface-400 font-semibold">Mandante</span>
              </div>
              <div class="text-base font-black text-brand-400 px-5 py-2 rounded-2xl bg-brand-500/10 border border-brand-500/30">VS</div>
              <div class="text-center">
                <span class="text-2xl md:text-4xl font-black text-white block font-heading">Palmeiras</span>
                <span class="text-xs text-surface-400 font-semibold">Visitante</span>
              </div>
            </div>

            <!-- Table Matrix Preview -->
            <div class="overflow-x-auto rounded-xl border border-surface-800">
              <table class="w-full text-left text-xs border-collapse">
                <thead>
                  <tr class="bg-surface-900/80 border-b border-surface-800 text-surface-400 font-semibold uppercase text-[10px]">
                    <th class="py-3 px-4">Mercado Selecionado</th>
                    <th class="py-3 px-4 text-center">Betano</th>
                    <th class="py-3 px-4 text-center">bet365</th>
                    <th class="py-3 px-4 text-center">Superbet</th>
                    <th class="py-3 px-4 text-center">KTO</th>
                    <th class="py-3 px-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-surface-800/50">
                  <tr>
                    <td class="py-4 px-4 font-bold text-white text-sm">Ambas Marcam (Sim)</td>
                    <td class="py-4 px-4 text-center text-surface-300">1.85</td>
                    <td class="py-4 px-4 text-center text-surface-300">1.90</td>
                    <td class="py-4 px-4 text-center"><span class="best-odd px-3 py-1.5 rounded-xl">1.92</span></td>
                    <td class="py-4 px-4 text-center text-surface-300">1.88</td>
                    <td class="py-4 px-4 text-right">
                      <button id="landing-demo-analyze-btn" class="btn-primary-gradient px-5 py-2.5 rounded-xl text-white font-extrabold text-xs transition-all">
                        ⚡ ANALISAR COM SCANNERBET
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <!-- PROBLEM VS SOLUTION STYLIZED -->
        <section class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="glass-panel p-8 rounded-3xl border border-rose-500/30 space-y-4">
            <div class="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center text-3xl font-bold">❌</div>
            <h3 class="text-2xl font-black text-white">Método Antigo e Lento</h3>
            <ul class="space-y-3.5 text-sm text-surface-300">
              <li class="flex items-start gap-3"><span>•</span> Múltiplas abas abertas travando seu computador ou celular.</li>
              <li class="flex items-start gap-3"><span>•</span> Perda de odds de valor por falta de comparador instantâneo.</li>
              <li class="flex items-start gap-3"><span>•</span> Entradas baseadas em intuição sem validação de dados por IA.</li>
              <li class="flex items-start gap-3"><span>•</span> Ausência de controle estatístico de taxa de acerto real.</li>
            </ul>
          </div>

          <div class="glass-panel p-8 rounded-3xl glow-card-emerald space-y-4">
            <div class="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-3xl font-bold">⚡</div>
            <h3 class="text-2xl font-black text-white">Com o ScannerBet</h3>
            <ul class="space-y-3.5 text-sm text-surface-300">
              <li class="flex items-start gap-3"><span>✓</span> <strong>Centralização total:</strong> Betano, bet365 e Superbet reunidos em 1 tela.</li>
              <li class="flex items-start gap-3"><span>✓</span> <strong>Scanner Score 0-100:</strong> Inteligência Artificial indicando assimetria +EV.</li>
              <li class="flex items-start gap-3"><span>✓</span> <strong>Comunidade Verificada:</strong> Palpites Oficiais do Administrador com selo.</li>
              <li class="flex items-start gap-3"><span>✓</span> <strong>Gestão Transparente:</strong> Acompanhamento automático de acertos e derrotas.</li>
            </ul>
          </div>
        </section>

        <!-- 3 SUBSCRIPTION PLANS SECTION -->
        <section class="space-y-10 text-center" id="plans-section">
          <div class="space-y-3">
            <span class="text-xs text-brand-400 font-mono font-bold uppercase tracking-widest">Assinatura Transparente</span>
            <h2 class="text-3xl md:text-5xl font-black text-white font-heading">Planos ScannerBet</h2>
            <p class="text-sm text-surface-400 max-w-xl mx-auto">Sem fidelidade. Cancele a qualquer momento direto pelo painel.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto text-left">
            ${window.SCANNERBET_CONFIG.PLANS.map(plan => `
              <div class="glass-panel p-8 rounded-[32px] border ${plan.popular ? 'glow-card-purple relative' : 'border-surface-800'} flex flex-col justify-between space-y-6">
                ${plan.popular ? `<span class="absolute -top-3.5 right-6 bg-gradient-to-r from-brand-500 to-indigo-600 text-white font-extrabold text-[10px] uppercase px-4 py-1 rounded-full shadow-lg">Mais Escolhido</span>` : ''}
                <div class="space-y-4">
                  <h3 class="text-2xl font-black text-white">${plan.name}</h3>
                  <div class="flex items-baseline gap-1">
                    <span class="text-4xl font-black text-white">${plan.currency} ${plan.price.toFixed(2).replace('.', ',')}</span>
                    <span class="text-xs text-surface-400 font-semibold">/${plan.period}</span>
                  </div>
                  <ul class="space-y-3 text-xs text-surface-300 pt-4 border-t border-surface-800">
                    ${plan.features.map(f => `<li class="flex items-center gap-2.5"><span class="text-brand-400 font-bold">✓</span> ${f}</li>`).join('')}
                  </ul>
                </div>
                <button class="landing-plan-btn w-full py-3.5 rounded-2xl ${plan.popular ? 'btn-primary-gradient text-white font-extrabold' : 'bg-surface-800 hover:bg-surface-700 text-white font-bold'} text-xs transition-all shadow-lg" data-plan="${plan.id}">
                  ASSINAR ${plan.name.toUpperCase()}
                </button>
              </div>
            `).join('')}
          </div>
        </section>

        <!-- FOOTER -->
        <footer class="border-t border-surface-800/80 pt-10 text-center text-xs text-surface-400 space-y-4">
          <p>© 2026 ScannerBet SaaS. Todos os direitos reservados.</p>
          <p class="max-w-xl mx-auto text-[11px] text-surface-500 leading-relaxed">
            🔞 Conteúdo destinado exclusivamente a maiores de 18 anos. As análises do ScannerBet são informativas baseadas em algoritmos e não garantem resultados. Aposte com responsabilidade.
          </p>
        </footer>
      </div>
    `;

    LandingView.bindEvents();
  }

  static bindEvents() {
    const startBtn = document.getElementById('hero-cta-start');
    if (startBtn) startBtn.onclick = () => window.sbApp.navigateTo('auth-register');

    const demoBtn = document.getElementById('hero-cta-demo');
    if (demoBtn) {
      demoBtn.onclick = () => {
        const sec = document.getElementById('demo-section');
        if (sec) sec.scrollIntoView({ behavior: 'smooth' });
      };
    }

    const analyzeDemoBtn = document.getElementById('landing-demo-analyze-btn');
    if (analyzeDemoBtn) {
      analyzeDemoBtn.onclick = async () => {
        window.Toast.show('Executando motor de inteligência artificial...', 'info');
        const res = await window.AiEngineService.analyzeBetSelection({
          event: { id: 'evt_101', homeTeam: 'Flamengo', awayTeam: 'Palmeiras', leagueName: 'Brasileirão Série A' },
          market: { name: 'Ambas Marcam' },
          selection: { name: 'Sim' },
          bestOdd: 1.92,
          bookmaker: 'Superbet',
          oddsObj: { betano: 1.85, bet365: 1.90, superbet: 1.92, kto: 1.88 }
        });
        window.ModalManager.openAiAnalysisModal(res);
      };
    }

    document.querySelectorAll('.landing-plan-btn').forEach(btn => {
      btn.onclick = () => window.sbApp.navigateTo('auth-register');
    });
  }
}

window.LandingView = LandingView;
