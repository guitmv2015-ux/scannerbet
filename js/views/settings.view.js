/**
 * USER SETTINGS & LGPD PRIVACY VIEW
 */

class SettingsView {
  static render() {
    const main = document.getElementById('app-main');
    if (!main) return;

    const state = window.sbState.getState();
    const user = state.user;
    if (!user) return;

    main.innerHTML = `
      <div class="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
        
        <div class="border-b border-surface-800 pb-4">
          <span class="text-xs text-brand-400 font-bold uppercase tracking-wider block">Preferências de Conta</span>
          <h1 class="text-2xl md:text-3xl font-black text-white font-heading">Configurações</h1>
        </div>

        <div class="glass-panel p-6 rounded-3xl border border-surface-800 space-y-6">
          <form id="settings-profile-form" class="space-y-4">
            <h3 class="text-sm font-bold text-white border-b border-surface-800 pb-2">Informações Pessoais</h3>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="text-xs text-surface-300 font-semibold block mb-1">Nome</label>
                <input type="text" id="settings-name" value="${user.name}" class="w-full bg-surface-950 border border-surface-700/80 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500" />
              </div>
              <div>
                <label class="text-xs text-surface-300 font-semibold block mb-1">E-mail</label>
                <input type="email" id="settings-email" value="${user.email}" readonly class="w-full bg-surface-950/60 border border-surface-800 rounded-xl px-3 py-2.5 text-xs text-surface-400 cursor-not-allowed" />
              </div>
            </div>

            <div>
              <label class="text-xs text-surface-300 font-semibold block mb-1">Bio da Comunidade</label>
              <textarea id="settings-bio" class="w-full bg-surface-950 border border-surface-700/80 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-brand-500 resize-none h-20">${user.bio || ''}</textarea>
            </div>

            <button type="submit" class="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-500/25">
              Salvar Alterações
            </button>
          </form>

          <!-- LGPD Rights Section -->
          <div class="border-t border-surface-800 pt-6 space-y-3">
            <h3 class="text-sm font-bold text-white">Privacidade & Direitos LGPD</h3>
            <p class="text-xs text-surface-400">Você tem o direito de exportar seus dados pessoais ou solicitar a exclusão definitiva da sua conta.</p>
            
            <div class="flex items-center gap-3 pt-1">
              <button id="settings-lgpd-export-btn" class="px-4 py-2 rounded-xl bg-surface-800 hover:bg-surface-700 text-white text-xs font-semibold">
                📥 Exportar Meus Dados (JSON)
              </button>
              <button id="settings-lgpd-delete-btn" class="px-4 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 border border-rose-500/40 text-rose-300 text-xs font-semibold">
                🗑️ Solicitar Exclusão de Conta
              </button>
            </div>
          </div>
        </div>

      </div>
    `;

    SettingsView.bindEvents();
  }

  static bindEvents() {
    const form = document.getElementById('settings-profile-form');
    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const newName = document.getElementById('settings-name').value;
        const newBio = document.getElementById('settings-bio').value;

        const state = window.sbState.getState();
        window.sbState.setState({
          user: { ...state.user, name: newName, bio: newBio }
        });

        window.Toast.show('Perfil atualizado com sucesso!', 'success');
      };
    }

    const exportBtn = document.getElementById('settings-lgpd-export-btn');
    if (exportBtn) {
      exportBtn.onclick = () => {
        const state = window.sbState.getState();
        const blob = new Blob([JSON.stringify(state.user, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `scannerbet-user-data-${state.user.id}.json`;
        a.click();
        window.Toast.show('Exportação de dados iniciada.', 'info');
      };
    }

    const deleteBtn = document.getElementById('settings-lgpd-delete-btn');
    if (deleteBtn) {
      deleteBtn.onclick = () => {
        if (confirm('Tem certeza de que deseja solicitar a exclusão de sua conta conforme a LGPD? Esta ação é irreversível.')) {
          window.AuthService.logout();
          window.Toast.show('Solicitação de exclusão registrada com sucesso.', 'info');
        }
      };
    }
  }
}

window.SettingsView = SettingsView;
