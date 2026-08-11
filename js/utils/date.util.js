/**
 * DATE UTILITY
 * Phase 6: Padronização de formato de data, hora e timezone (10 AGO • 19:30).
 */

class DateUtil {
  static meses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

  /**
   * Converte uma data (string ISO ou Date) para o formato "DD MES • HH:MM"
   */
  static formatEventDate(dateInput) {
    if (!dateInput) return 'Data Indisponível';
    
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return 'Data Inválida';

    const dia = String(d.getDate()).padStart(2, '0');
    const mes = DateUtil.meses[d.getMonth()];
    const horas = String(d.getHours()).padStart(2, '0');
    const minutos = String(d.getMinutes()).padStart(2, '0');

    const relStatus = DateUtil.getRelativeStatus(dateInput);
    if (relStatus === 'Hoje' || relStatus === 'Amanhã') {
        return `${relStatus} • ${horas}:${minutos}`;
    }

    return `${dia} ${mes} • ${horas}:${minutos}`;
  }

  /**
   * Retorna um status amigável relativo à data atual ("Hoje", "Amanhã", "Em X dias", "Finalizado")
   */
  static getRelativeStatus(dateInput) {
    if (!dateInput) return '';

    const d = new Date(dateInput);
    const now = new Date();
    
    // Normalize para meia noite
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const eventDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    
    const diffTime = eventDay.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

    if (diffDays < 0) return 'Finalizado / Ao Vivo';
    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Amanhã';
    return `Em ${diffDays} dias`;
  }
}

window.DateUtil = DateUtil;
