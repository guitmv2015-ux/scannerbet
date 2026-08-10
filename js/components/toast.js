/**
 * TOAST NOTIFICATION COMPONENT
 */

class Toast {
  static show(message, type = 'info', duration = 3500) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `flex items-center gap-3 p-4 rounded-xl shadow-xl border backdrop-blur-md pointer-events-auto transition-all transform translate-y-2 opacity-0 text-sm font-medium animate-in fade-in duration-200`;

    let bgClass = 'bg-surface-900 border-surface-700 text-white';
    let icon = 'ℹ️';

    if (type === 'success') {
      bgClass = 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200';
      icon = '✅';
    } else if (type === 'error') {
      bgClass = 'bg-rose-950/90 border-rose-500/40 text-rose-200';
      icon = '⚠️';
    } else if (type === 'warning') {
      bgClass = 'bg-amber-950/90 border-amber-500/40 text-amber-200';
      icon = '⚡';
    }

    toast.className += ` ${bgClass}`;
    toast.innerHTML = `
      <span class="text-base">${icon}</span>
      <span class="flex-1">${message}</span>
    `;

    container.appendChild(toast);

    // Fade in
    setTimeout(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
    }, 10);

    // Auto remove
    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
}

window.Toast = Toast;
