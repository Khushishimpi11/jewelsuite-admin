import React, { useState, useEffect } from 'react';
import { 
  Bell, CheckCheck, Trash2, CalendarDays, ShoppingBag, XCircle, Truck, 
  PackageCheck, RefreshCw, Coins, AlertTriangle, AlertOctagon, UserPlus, Star, 
  Database, ServerCrash, Layers, ShieldCheck, Loader2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthToken = () => localStorage.getItem('admin_token');

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
  },

  clearAllNotifications: async () => {
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_URL}/notifications/admin/notifications/clear-all`, {
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
  const [activeTab, setActiveTab] = useState<'all' | 'orders' | 'inventory' | 'payments' | 'customers' | 'system'>('all');

  const fetchNotifications = async () => {
    setLoading(true);
    const result = await notificationApi.getAdminNotifications(100);
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
      toast({ title: "Success", description: "Notification marked as read" });
    }
  };

  const handleMarkAllAsRead = async () => {
    const success = await notificationApi.markAllAsRead();
    if (success) {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast({ title: "Success", description: "All notifications marked as read" });
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

  const handleClearAll = async () => {
    const success = await notificationApi.clearAllNotifications();
    if (success) {
      setNotifications([]);
      setUnreadCount(0);
      toast({ title: "Cleared", description: "All notifications cleared successfully" });
    }
  };

  const formatTime = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityBadge = (priority: string) => {
    switch(priority) {
      case 'urgent': return <Badge className="bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg text-xs uppercase px-2 py-0.5">Urgent</Badge>;
      case 'high': return <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-lg text-xs uppercase px-2 py-0.5">High</Badge>;
      case 'medium': return <Badge className="bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-lg text-xs uppercase px-2 py-0.5">Medium</Badge>;
      default: return <Badge className="bg-slate-500/10 text-slate-500 border border-slate-500/20 rounded-lg text-xs uppercase px-2 py-0.5">Low</Badge>;
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'new_order':
        return <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500"><ShoppingBag className="h-5 w-5" /></div>;
      case 'order_cancelled':
        return <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500"><XCircle className="h-5 w-5" /></div>;
      case 'order_shipped':
        return <div className="h-10 w-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-500"><Truck className="h-5 w-5" /></div>;
      case 'order_delivered':
        return <div className="h-10 w-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500"><PackageCheck className="h-5 w-5" /></div>;
      case 'return_request':
      case 'exchange_request':
        return <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500"><RefreshCw className="h-5 w-5" /></div>;
      case 'refund_completed':
      case 'refund_processed':
      case 'payment_received':
        return <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500"><Coins className="h-5 w-5" /></div>;
      case 'payment_failed':
        return <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500"><AlertOctagon className="h-5 w-5" /></div>;
      case 'low_stock':
        return <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600"><AlertTriangle className="h-5 w-5" /></div>;
      case 'out_of_stock':
        return <div className="h-10 w-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500"><AlertTriangle className="h-5 w-5" /></div>;
      case 'back_in_stock':
        return <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500"><Layers className="h-5 w-5" /></div>;
      case 'new_customer':
        return <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500"><UserPlus className="h-5 w-5" /></div>;
      case 'new_review':
        return <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500"><Star className="h-5 w-5" /></div>;
      case 'db_backup':
        return <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500"><Database className="h-5 w-5" /></div>;
      case 'system_error':
        return <div className="h-10 w-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500"><ServerCrash className="h-5 w-5" /></div>;
      case 'cms_update':
        return <div className="h-10 w-10 rounded-xl bg-fuchsia-500/10 flex items-center justify-center text-fuchsia-500"><ShieldCheck className="h-5 w-5" /></div>;
      default:
        return <div className="h-10 w-10 rounded-xl bg-slate-500/10 flex items-center justify-center text-slate-500"><Bell className="h-5 w-5" /></div>;
    }
  };

  const getFilteredNotifications = () => {
    return notifications.filter(notif => {
      if (activeTab === 'all') return true;
      if (activeTab === 'orders') {
        return ['new_order', 'order_cancelled', 'order_shipped', 'order_delivered', 'return_request', 'exchange_request', 'refund_completed'].includes(notif.type);
      }
      if (activeTab === 'inventory') {
        return ['low_stock', 'out_of_stock', 'back_in_stock'].includes(notif.type);
      }
      if (activeTab === 'payments') {
        return ['payment_received', 'payment_failed', 'refund_processed'].includes(notif.type);
      }
      if (activeTab === 'customers') {
        return ['new_customer', 'customer_complaint', 'new_review'].includes(notif.type);
      }
      if (activeTab === 'system') {
        return ['system', 'system_error', 'db_backup', 'cms_update'].includes(notif.type);
      }
      return true;
    });
  };

  const filteredList = getFilteredNotifications();

  return (
    <motion.div 
      className="p-6 max-w-4xl space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">CMS Notifications</h1>
          <p className="text-muted-foreground text-sm font-sans">Monitor orders, inventory status, payments, and system health</p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button onClick={handleMarkAllAsRead} className="gap-2 rounded-xl" variant="outline">
              <CheckCheck className="h-4 w-4" />
              Mark all read ({unreadCount})
            </Button>
          )}
          {notifications.length > 0 && (
            <Button onClick={handleClearAll} className="gap-2 rounded-xl" variant="outline">
              <Trash2 className="h-4 w-4 text-destructive" />
              <span className="text-destructive">Clear all</span>
            </Button>
          )}
        </div>
      </div>

      <div className="flex bg-secondary/50 p-1 rounded-xl w-full justify-start overflow-x-auto gap-1">
        <button 
          onClick={() => setActiveTab('all')} 
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 ${activeTab === 'all' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          All
        </button>
        <button 
          onClick={() => setActiveTab('orders')} 
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 ${activeTab === 'orders' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Orders
        </button>
        <button 
          onClick={() => setActiveTab('inventory')} 
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 ${activeTab === 'inventory' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Inventory
        </button>
        <button 
          onClick={() => setActiveTab('payments')} 
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 ${activeTab === 'payments' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Payments
        </button>
        <button 
          onClick={() => setActiveTab('customers')} 
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 ${activeTab === 'customers' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Customers &amp; Reviews
        </button>
        <button 
          onClick={() => setActiveTab('system')} 
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 ${activeTab === 'system' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          System
        </button>
      </div>

      <Card className="glass-card rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
              <p className="text-sm">Loading notifications...</p>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="p-16 text-center text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-semibold text-foreground">No alerts found</p>
              <p className="text-sm mt-1">There are no notifications in this category.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              <AnimatePresence initial={false}>
                {filteredList.map((notif) => (
                  <motion.div 
                    key={notif._id} 
                    className={`p-4 transition-colors relative flex items-start gap-4 ${!notif.isRead ? 'bg-accent/5' : ''}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {/* Unread dot indicator */}
                    {!notif.isRead && (
                      <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary" />
                    )}
                    
                    {/* Category Icon */}
                    <div className="shrink-0">
                      {getIcon(notif.type)}
                    </div>
                    
                    {/* Main Content */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={`font-display text-sm font-semibold truncate ${!notif.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>{notif.title}</h3>
                        {getPriorityBadge(notif.priority)}
                      </div>
                      <p className="text-sm text-muted-foreground font-sans line-clamp-2">{notif.message}</p>
                      
                      <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                        <span className="flex items-center gap-1 font-sans">
                          <CalendarDays className="h-3 w-3" />
                          {formatTime(notif.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                      {!notif.isRead && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleMarkAsRead(notif._id)} 
                          className="h-8 rounded-lg text-primary hover:text-primary hover:bg-primary/5 text-xs font-semibold px-2.5"
                        >
                          Mark read
                        </Button>
                      )}
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => handleDelete(notif._id)} 
                        className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}