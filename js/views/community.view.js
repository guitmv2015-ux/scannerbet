/**
 * COMMUNITY & SOCIAL FEED VIEW
 * Shows feed of tips, Official Admin tips with SCANNERBET OFICIAL badge, groups, likes, and comments.
 */

class CommunityView {
  static render() {
    const main = document.getElementById('app-main');
    if (!main) return;

    const state = window.sbState.getState();
    const posts = state.posts || [];
    const groups = state.groups || [];
    const user = state.user;

    main.innerHTML = `
      <div class="space-y-6 animate-in fade-in duration-300">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-surface-800 pb-4">
          <div>
            <span class="text-xs text-brand-400 font-bold uppercase tracking-wider block">Comunidade & Palpites</span>
            <h1 class="text-2xl md:text-3xl font-black text-white font-heading">Feed da Comunidade</h1>
          </div>
          <button id="community-create-post-btn" class="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-500/25 transition-all flex items-center gap-2">
            <span>✏️</span> Publicar Palpite
          </button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <!-- Main Posts Feed (2 cols) -->
          <div class="lg:col-span-2 space-y-4">
            
            <!-- Quick New Post Box -->
            <div class="glass-panel p-4 rounded-2xl border border-surface-800 space-y-3">
              <textarea id="community-quick-text" placeholder="Escreva sua análise ou palpite para a comunidade..." class="w-full bg-surface-950 border border-surface-700/80 rounded-xl p-3 text-xs text-white placeholder-surface-400 focus:outline-none focus:border-brand-500 resize-none h-20"></textarea>
              <div class="flex items-center justify-between pt-1">
                <span class="text-[10px] text-surface-400">Postando como: <strong class="text-white">${user ? user.name : 'Visitante'}</strong></span>
                <button id="community-submit-quick-btn" class="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all">
                  Publicar ➔
                </button>
              </div>
            </div>

            <!-- Posts List -->
            <div class="space-y-4">
              ${posts.map(post => `
                <div class="glass-panel p-5 rounded-2xl border ${post.official ? 'border-brand-500/40 glow-purple bg-surface-900/90' : 'border-surface-800'} space-y-4">
                  <!-- Author Header -->
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <img src="${post.avatar}" alt="${post.author}" class="w-9 h-9 rounded-full border border-brand-500/40 object-cover" />
                      <div>
                        <div class="flex items-center gap-2">
                          <h4 class="font-bold text-xs md:text-sm text-white">${post.author}</h4>
                          ${post.official ? `
                            <span class="px-2 py-0.5 rounded-full bg-brand-500 text-white text-[9px] font-black uppercase tracking-wider">
                              SCANNERBET OFICIAL
                            </span>
                          ` : `
                            <span class="px-2 py-0.5 rounded-full bg-surface-800 text-brand-400 text-[10px] font-semibold border border-surface-700">
                              ${post.role}
                            </span>
                          `}
                        </div>
                        <span class="text-[10px] text-surface-400 block">${post.time}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Text -->
                  <p class="text-xs md:text-sm text-surface-200 leading-relaxed whitespace-pre-line">${post.text}</p>

                  <!-- Attached Bet Card if exists -->
                  ${post.attachedBet ? `
                    <div class="bg-surface-950 p-4 rounded-xl border border-surface-800/80 space-y-2">
                      <div class="flex items-center justify-between text-xs">
                        <span class="font-bold text-white">${post.attachedBet.match}</span>
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/20 text-brand-400 border border-brand-500/30">
                          Score ${post.attachedBet.score}/100
                        </span>
                      </div>
                      <div class="text-xs text-surface-300">
                        Seleção: <strong class="text-white">${post.attachedBet.selection}</strong> @ <strong class="text-emerald-400">${post.attachedBet.odd}</strong> (${post.attachedBet.bookmaker})
                      </div>
                    </div>
                  ` : ''}

                  <!-- Post Footer Controls (Likes, Comments, Save) -->
                  <div class="flex items-center justify-between border-t border-surface-800/60 pt-3 text-xs text-surface-400">
                    <div class="flex items-center gap-4">
                      <button class="community-like-btn flex items-center gap-1.5 hover:text-rose-400 ${post.liked ? 'text-rose-400 font-bold' : ''}" data-post-id="${post.id}">
                        <span>${post.liked ? '❤️' : '🤍'}</span>
                        <span>${post.likes}</span>
                      </button>
                      <span class="flex items-center gap-1.5">
                        <span>💬</span>
                        <span>${post.comments.length} comentários</span>
                      </span>
                    </div>
                    <button class="community-save-btn hover:text-brand-400" data-post-id="${post.id}">
                      ${post.saved ? '🔖 Salvo' : '🔖 Salvar'}
                    </button>
                  </div>

                  <!-- Comments List -->
                  ${post.comments.length > 0 ? `
                    <div class="bg-surface-950/60 p-3 rounded-xl space-y-2 text-xs border border-surface-800/40">
                      ${post.comments.map(c => `
                        <div class="text-surface-300">
                          <strong class="text-white">${c.author}:</strong> ${c.text}
                          <span class="text-[9px] text-surface-500 ml-1">${c.time}</span>
                        </div>
                      `).join('')}
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>

          </div>

          <!-- Sidebar Groups & Filters (1 col) -->
          <div class="space-y-4">
            <div class="glass-panel p-5 rounded-2xl border border-surface-800 space-y-4">
              <h3 class="font-bold text-sm text-white flex items-center gap-2">
                <span>👥</span> Grupos & Hubs VIP
              </h3>
              <div class="space-y-3">
                ${groups.map(g => `
                  <div class="p-3 rounded-xl bg-surface-950 border border-surface-800 flex items-center justify-between">
                    <div>
                      <h4 class="font-bold text-xs text-white flex items-center gap-1.5">
                        <span>${g.icon}</span> ${g.name}
                      </h4>
                      <p class="text-[10px] text-surface-400">${g.members} membros</p>
                    </div>
                    <button class="px-3 py-1 rounded-lg bg-surface-800 hover:bg-brand-600 text-white text-[11px] font-semibold transition-all">
                      Entrar
                    </button>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

        </div>

      </div>
    `;

    CommunityView.bindEvents();
  }

  static bindEvents() {
    const quickBtn = document.getElementById('community-submit-quick-btn');
    if (quickBtn) {
      quickBtn.onclick = () => {
        const text = document.getElementById('community-quick-text').value;
        if (!text.trim()) return;

        window.CommunityService.createPost({ text });
        window.Toast.show('Palpite publicado com sucesso!', 'success');
        CommunityView.render();
      };
    }

    document.querySelectorAll('.community-like-btn').forEach(btn => {
      btn.onclick = () => {
        const postId = btn.getAttribute('data-post-id');
        window.CommunityService.toggleLike(postId);
        CommunityView.render();
      };
    });

    document.querySelectorAll('.community-save-btn').forEach(btn => {
      btn.onclick = () => {
        const postId = btn.getAttribute('data-post-id');
        window.CommunityService.toggleSave(postId);
        window.Toast.show('Status do post salvo atualizado!', 'info');
        CommunityView.render();
      };
    });
  }
}

window.CommunityView = CommunityView;
