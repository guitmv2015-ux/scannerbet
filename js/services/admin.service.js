/**
 * ADMIN CONTROL PANEL & MODERATION SERVICE
 */

class AdminService {
  // Get all registered users list
  static getUsersList() {
    return [
      { id: 'usr_88321', name: 'Lucas Ferreira', email: 'lucas.apostador@gmail.com', role: 'Pro', status: 'Ativo', registered: '12/01/2026', aiCredits: '114/150' },
      { id: 'usr_90122', name: 'Matheus Oliveira', email: 'matheus.trade@yahoo.com', role: 'Elite', status: 'Ativo', registered: '15/02/2026', aiCredits: 'Ilimitado' },
      { id: 'usr_44102', name: 'Ana Clara Souza', email: 'anaclara@outlook.com', role: 'Start', status: 'Ativo', registered: '01/03/2026', aiCredits: '22/30' },
      { id: 'usr_10293', name: 'Pedro Henrique', email: 'pedro.ph@gmail.com', role: 'Free', status: 'Bloqueado', registered: '10/03/2026', aiCredits: '0/10' },
      { id: 'usr_admin', name: 'Administrador ScannerBet', email: 'admin@scannerbet.com.br', role: 'Admin', status: 'Ativo', registered: '01/01/2026', aiCredits: 'Ilimitado' }
    ];
  }

  // Toggle user status (Block/Unblock)
  static toggleUserBlock(userId) {
    this.logAction('ALTERAR_STATUS_USUARIO', `Status do usuário ${userId} alterado.`);
    return true;
  }

  // Change user role
  static updateUserRole(userId, newRole) {
    this.logAction('ALTERAR_PAPEL_USUARIO', `Papel do usuário ${userId} alterado para ${newRole}.`);
    return true;
  }

  // System Audit Logs
  static getAuditLogs() {
    return [
      { id: 'log_1', action: 'ALTERAR_PRECO_PLANO', detail: 'Plano Pro atualizado para R$ 69,90 por Admin', timestamp: '10/08/2026 11:20' },
      { id: 'log_2', action: 'MODERACAO_POST', detail: 'Post #pst_99 remediado e removido do feed publico', timestamp: '09/08/2026 16:45' },
      { id: 'log_3', action: 'ATUALIZAR_PESO_IA', detail: 'Peso de OddsDiscrepancy ajustado para 0.35', timestamp: '07/08/2026 09:15' }
    ];
  }

  static logAction(action, detail) {
    console.log(`[ADMIN AUDIT LOG] ${action}: ${detail}`);
  }
}

window.AdminService = AdminService;
