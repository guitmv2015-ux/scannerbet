/**
 * BLOG & EDUCATIONAL CONTENT VIEW
 */

class BlogView {
  static render() {
    const main = document.getElementById('app-main');
    if (!main) return;

    const state = window.sbState.getState();
    const blogPosts = state.blogPosts || [];

    main.innerHTML = `
      <div class="space-y-6 animate-in fade-in duration-300">
        
        <!-- Header -->
        <div class="border-b border-surface-800 pb-4">
          <span class="text-xs text-brand-400 font-bold uppercase tracking-wider block">Conteúdo & Educação</span>
          <h1 class="text-2xl md:text-3xl font-black text-white font-heading">Blog ScannerBet</h1>
          <p class="text-xs text-surface-400">Artigos sobre análise esportiva, desvio padrão de odds e gestão de banca.</p>
        </div>

        <!-- Articles Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          ${blogPosts.map(post => `
            <div class="glass-panel p-6 rounded-3xl border border-surface-800 space-y-4 hover:border-surface-700 transition-all">
              <div class="flex items-center justify-between text-xs text-surface-400">
                <span class="font-bold text-brand-400">${post.category}</span>
                <span>${post.date}</span>
              </div>
              <h3 class="text-xl font-bold text-white hover:text-brand-300 cursor-pointer">${post.title}</h3>
              <p class="text-xs text-surface-300 leading-relaxed">${post.summary}</p>
              <div class="flex items-center justify-between pt-2 border-t border-surface-800/60 text-xs">
                <span class="text-surface-400">Por ${post.author}</span>
                <span class="text-brand-400 font-semibold cursor-pointer hover:underline">Ler Artigo Completo ➔</span>
              </div>
            </div>
          `).join('')}
        </div>

      </div>
    `;
  }
}

window.BlogView = BlogView;
