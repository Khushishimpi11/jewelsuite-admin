const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthToken = () => localStorage.getItem('admin_token') || localStorage.getItem('token');

export interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  actionLink?: string;
  createdAt: string;
}

const notificationApi = {
  // Get all admin notifications
  getAdminNotifications: async (limit = 50, skip = 0): Promise<{ 
    success: boolean; 
    notifications: Notification[]; 
    unreadCount: number;
    totalCount: number;
  }> => {
    try {
      const token = getAuthToken();
      if (!token) {
        console.log('No token found');
        return { success: false, notifications: [], unreadCount: 0, totalCount: 0 };
      }
      
      const response = await fetch(`${API_URL}/notifications/admin/notifications?limit=${limit}&skip=${skip}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return { success: false, notifications: [], unreadCount: 0, totalCount: 0 };
    }
  },

  // Mark as read
  markAsRead: async (id: string): Promise<boolean> => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/notifications/admin/notifications/${id}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.ok;
    } catch (error) {
      console.error('Error marking as read:', error);
      return false;
    }
  },

  // Mark all as read
  markAllAsRead: async (): Promise<boolean> => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/notifications/admin/notifications/read-all`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.ok;
    } catch (error) {
      console.error('Error marking all as read:', error);
      return false;
    }
  },

  // Delete notification
  deleteNotification: async (id: string): Promise<boolean> => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/notifications/admin/notifications/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.ok;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  },

  // Send notification from frontend
  sendNotification: async (data: {
    type: string;
    title: string;
    message: string;
    priority?: string;
    actionLink?: string;
  }): Promise<boolean> => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/notifications/admin/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      return response.ok;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  },

  // Get notification stats
  getNotificationStats: async (): Promise<any> => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/notifications/admin/notifications/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching stats:', error);
      return { success: false, stats: {} };
    }
  }
};

export default notificationApi;