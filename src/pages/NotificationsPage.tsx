import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Trash2, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  actionLink?: string;
  createdAt: string;
}

const API_URL = 'http://localhost:5000/api';

const getAuthToken = () => localStorage.getItem('token');

const notificationApi = {
  getAdminNotifications: async (limit = 50) => {
    try {
      const token = getAuthToken();
      if (!token) return { success: false, notifications: [], unreadCount: 0 };
      
      const res = await fetch(`${API_URL}/notifications/admin/notifications?limit=${limit}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return await res.json();
    } catch (error) {
      return { success: false, notifications: [], unreadCount: 0 };
    }
  },
  
  markAsRead: async (id: string) => {
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_URL}/notifications/admin/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return res.ok;
    } catch { return false; }
  },
  
  markAllAsRead: async () => {
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_URL}/notifications/admin/notifications/read-all`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return res.ok;
    } catch { return false; }
  },
  
  deleteNotification: async (id: string) => {
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_URL}/notifications/admin/notifications/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return res.ok;
    } catch { return false; }
  }
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    setLoading(true);
    const result = await notificationApi.getAdminNotifications(50);
    if (result.success) {
      setNotifications(result.notifications || []);
      setUnreadCount(result.unreadCount || 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    const success = await notificationApi.markAsRead(id);
    if (success) {
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      toast({ title: "Success", description: "Marked as read" });
    }
  };

  const handleMarkAllAsRead = async () => {
    const success = await notificationApi.markAllAsRead();
    if (success) {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast({ title: "Success", description: "All marked as read" });
    }
  };

  const handleDelete = async (id: string) => {
    const success = await notificationApi.deleteNotification(id);
    if (success) {
      const deleted = notifications.find(n => n._id === id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      if (!deleted?.isRead) setUnreadCount(prev => Math.max(0, prev - 1));
      toast({ title: "Deleted", description: "Notification removed" });
    }
  };

  const formatTime = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)} hours ago`;
    return `${Math.floor(minutes / 1440)} days ago`;
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'urgent': return 'bg-red-100 text-red-700';
      case 'high': return 'bg-orange-100 text-orange-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  const getIcon = (type: string) => {
    const icons: Record<string, string> = {
      'out_of_stock': '🚫', 'low_stock': '⚠️', 'back_in_stock': '✅',
      'new_order': '🛍️', 'order_cancelled': '❌', 'payment_received': '💰',
      'payment_failed': '⚠️', 'return_request': '🔄', 'exchange_request': '🔄',
      'return_exchange_approved': '✅', 'return_exchange_rejected': '❌',
      'new_customer': '👤', 'customer_complaint': '📢'
    };
    return icons[type] || '🔔';
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground text-sm">Manage all your notifications</p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={handleMarkAllAsRead} variant="outline" className="gap-2">
            <CheckCheck className="h-4 w-4" />
            Mark all read ({unreadCount})
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notif) => (
                <div key={notif._id} className={`p-4 ${!notif.isRead ? 'bg-blue-50/50' : ''}`}>
                  <div className="flex gap-3">
                    <div className="text-2xl">{getIcon(notif.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold">{notif.title}</h3>
                        <Badge className={getPriorityColor(notif.priority)}>
                          {notif.priority}
                        </Badge>
                        {!notif.isRead && <Badge variant="outline" className="text-blue-600">New</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{notif.message}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          {formatTime(notif.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {!notif.isRead && (
                        <Button size="sm" variant="ghost" onClick={() => handleMarkAsRead(notif._id)}>
                          Mark read
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(notif._id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}