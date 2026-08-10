/**
 * PLANS COMPARISON & CHECKOUT VIEW
 */

class PlansView {
  static render() {
    const main = document.getElementById('app-main');
    if (!main) return;

    const plans = window.SCANNERBET_CONFIG.PLANS;

    main.innerHTML = `
      <div class="space-y-8 py-4 animate-in fade-in duration-300">
        
        <!-- Header -->
        <div class="text-center space-y-2 max-w-xl mx-auto">
          <span class="text-xs text-brand-400 font-bold uppercase tracking-wider block">Assinatura & Upgrades</span>
          <h1 class="text-3xl font-black text-white font-heading">Planos ScannerBet</h1>
          <p class="text-xs text-surface-400">Escolha o plano ideal para alavancar suas análises esportivas.</p>
        </div>

        <!-- Coupon Code Bar -->
        <div class="max-w-md mx-auto bg-surface-900 p-4 rounded-2xl border border-surface-800 flex items-center gap-2">
          <input type="text" id="coupon-code-input" placeholder="Possui cupom? Ex: DESCONTO20" class="flex-1 bg-surface-950 border border-surface-700/80 rounded-xl px-3 py-2 text-xs text-white uppercase font-mono focus:outline-none focus:border-brand-500" />
          <button id="apply-coupon-btn" class="px-4 py-2 rounded-xl bg-surface-800 hover:bg-surface-700 text-white text-xs font-bold shrink-0">
            Aplicar Cupom
          </button>
        </div>

        <!-- Plans Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          ${plans.map(plan => `
            <div class="glass-panel p-6 rounded-3xl border ${plan.popular ? 'border-brand-500 glow-purple relative' : 'border-surface-800'} flex flex-col justify-between space-y-6">
              ${plan.popular ? `<span class="absolute -top-3 right-6 bg-brand-500 text-white font-bold text-[10px] uppercase px-3 py-1 rounded-full shadow-lg">Mais Popular</span>` : ''}
              <div class="space-y-4">
                <h3 class="text-xl font-bold text-white">${plan.name}</h3>
                <div class="flex items-baseline gap-1">
                  <span class="text-3xl font-black text-white">${plan.currency} ${plan.price.toFixed(2).replace('.', ',')}</span>
                  <span class="text-xs text-surface-400">/${plan.period}</span>
                </div>
                <ul class="space-y-2.5 text-xs text-surface-300 pt-2 border-t border-surface-800">
                  ${plan.features.map(f => `<li class="flex items-center gap-2"><span class="text-brand-400">✓</span> ${f}</li>`).join('')}
                </ul>
              </div>

              <button class="plans-subscribe-btn w-full py-3 rounded-xl ${plan.popular ? 'bg-brand-600 hover:bg-brand-500 text-white font-bold' : 'bg-surface-800 hover:bg-surface-700 text-white font-semibold'} text-xs shadow-lg transition-all" data-plan-id="${plan.id}">
                ASSINAR ${plan.name.toUpperCase()}
              </button>
            </div>
          `).join('')}
        </div>

      </div>
    `;

    PlansView.bindEvents();
  }

  static bindEvents() {
    const couponBtn = document.getElementById('apply-coupon-btn');
    if (couponBtn) {
      couponBtn.onclick = () => {
        const val = document.getElementById('coupon-code-input').value;
        if (val.toUpperCase() === 'DESCONTO20') {
          window.Toast.show('Cupom DESCONTO20 aplicado com 20% de desconto!', 'success');
        } else {
          window.Toast.show('Cupom inválido ou expirado.', 'error');
        }
      };
    }

    document.querySelectorAll('.plans-subscribe-btn').forEach(btn => {
      btn.onclick = async () => {
        const planId = btn.getAttribute('data-plan-id');
        const coupon = document.getElementById('coupon-code-input')?.value || '';

        window.Toast.show('Iniciando processamento seguro de checkout...', 'info');

        try {
          const res = await window.SubscriptionService.processCheckout({ planId, paymentMethod: 'PIX/Cartão', couponCode: coupon });
          window.Toast.show(`Assinatura do ${res.plan} ativada com sucesso!`, 'success');
          window.sbApp.navigateTo('dashboard');
        } catch (err) {
          window.Toast.show('Falha ao processar pagamento.', 'error');
        }
      };
    });
  }
}

window.PlansView = PlansView;
