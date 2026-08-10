/**
 * NOTIFICATION SERVICE & BELL BADGE MANAGER
 */

class NotificationService {
  static getUnreadCount() {
    const state = window.sbState.getState();
    const notifications = state.notifications || [];
    return notifications.filter(n => !n.read).length;
  }

  static markAllAsRead() {
    const state = window.sbState.getState();
    const notifications = (state.notifications || []).map(n => ({ ...n, read: true }));
    window.sbState.setState({ notifications });
  }

  static markAsRead(notificationId) {
    const state = window.sbState.getState();
    const notifications = (state.notifications || []).map(n => {
      if (n.id === notificationId) {
        return { ...n, read: true };
      }
      return n;
    });
    window.sbState.setState({ notifications });
  }

  static pushNotification({ title, message }) {
    const state = window.sbState.getState();
    const newNotif = {
      id: 'not_' + Date.now(),
      title,
      message,
      time: 'Agora mesmo',
      read: false
    };

    window.sbState.setState({
      notifications: [newNotif, ...(state.notifications || [])]
    });
  }
}

window.NotificationService = NotificationService;
