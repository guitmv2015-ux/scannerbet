/**
 * SUBSCRIPTION & PAYMENT GATEWAY SERVICE
 * Decoupled gateway interface ready for Stripe / Mercado Pago / Asaas integrations.
 */

class SubscriptionService {
  // Validate Paywall Permissions
  static canAccessFeature(featureKey) {
    const state = window.sbState.getState();
    const user = state.user;
    if (!user) return false;

    // Admin has total access
    if (user.role === 'Admin') return true;

    // Feature checks
    if (featureKey === 'unlimited_ai') return user.role === 'Elite';
    if (featureKey === 'scanner_all_houses') return user.role === 'Pro' || user.role === 'Elite';
    if (featureKey === 'vip_groups') return user.role === 'Pro' || user.role === 'Elite';

    return true;
  }

  // Simulate Checkout Payment Flow
  static async processCheckout({ planId, paymentMethod, couponCode }) {
    // 1.5s simulation of gateway handshake
    await new Promise(resolve => setTimeout(resolve, 1500));

    const plan = window.SCANNERBET_CONFIG.PLANS.find(p => p.id === planId) || window.SCANNERBET_CONFIG.PLANS[1];
    let finalPrice = plan.price;

    // Apply Coupon Code
    if (couponCode && couponCode.toUpperCase() === 'DESCONTO20') {
      finalPrice = parseFloat((finalPrice * 0.8).toFixed(2));
    }

    const state = window.sbState.getState();
    const user = state.user;

    const updatedUser = {
      ...user,
      role: plan.name.includes('Elite') ? 'Elite' : (plan.name.includes('Pro') ? 'Pro' : 'Start'),
      planId: plan.id,
      subscriptionStatus: 'Ativa',
      aiCreditsTotal: plan.aiLimit,
      aiCreditsRemaining: plan.aiLimit === 9999 ? 9999 : plan.aiLimit,
      renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };

    window.sbState.setState({ user: updatedUser });

    // Push system notification
    const newNotification = {
      id: 'not_' + Date.now(),
      title: 'Assinatura Ativada! 🎉',
      message: `Sua assinatura do plano ${plan.name} foi confirmada com sucesso. Aproveite todos os recursos!`,
      time: 'Agora mesmo',
      read: false
    };

    window.sbState.setState({
      notifications: [newNotification, ...(state.notifications || [])]
    });

    return { success: true, plan: plan.name, price: finalPrice };
  }

  // Admin Plan Management
  static updatePlanDetails(planId, newDetails) {
    const plans = window.SCANNERBET_CONFIG.PLANS.map(p => {
      if (p.id === planId) {
        return { ...p, ...newDetails };
      }
      return p;
    });

    window.SCANNERBET_CONFIG.PLANS = plans;
    window.sbState.notifySubscribers();
  }
}

window.SubscriptionService = SubscriptionService;
