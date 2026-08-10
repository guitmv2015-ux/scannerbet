/**
 * LIGHTWEIGHT SVG CHARTS RENDERER COMPONENT
 */

class ChartRenderer {
  // Render Performance Bar Chart
  static renderBarChart(containerId, data = [65, 78, 84, 72, 90, 88, 92]) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const maxVal = Math.max(...data, 100);
    const height = 140;
    const width = container.clientWidth || 320;
    const barWidth = Math.floor((width - (data.length * 12)) / data.length);

    let barsSvg = '';
    data.forEach((val, idx) => {
      const barHeight = Math.floor((val / maxVal) * (height - 30));
      const x = idx * (barWidth + 12) + 10;
      const y = height - barHeight - 20;

      barsSvg += `
        <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" rx="6" fill="url(#barGradient)" class="transition-all duration-300 hover:opacity-80"></rect>
        <text x="${x + barWidth / 2}" y="${height - 5}" font-size="10" fill="#a1a1aa" text-anchor="middle">J${idx + 1}</text>
        <text x="${x + barWidth / 2}" y="${y - 4}" font-size="9" font-weight="bold" fill="#ffffff" text-anchor="middle">${val}%</text>
      `;
    });

    container.innerHTML = `
      <svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#8b5cf6" />
            <stop offset="100%" stop-color="#6d28d9" />
          </linearGradient>
        </defs>
        ${barsSvg}
      </svg>
    `;
  }

  // Render Mini Sparkline
  static renderSparkline(data = [10, 25, 18, 30, 45, 60, 52, 75]) {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const points = data.map((val, idx) => {
      const x = (idx / (data.length - 1)) * 100;
      const y = 30 - ((val - min) / (max - min || 1)) * 24;
      return `${x},${y}`;
    }).join(' ');

    return `
      <svg class="w-24 h-8 overflow-visible" viewBox="0 0 100 30">
        <polyline fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" points="${points}" />
      </svg>
    `;
  }
}

window.ChartRenderer = ChartRenderer;
