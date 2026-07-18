import { Bell, Search, User, LogOut, Settings, UserCircle, CheckCheck, Trash2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useJewelleryCMS } from "@/context/JewelleryCMSContext";
import notificationApi, { Notification } from "@/services/notificationApi";

export function TopNavbar() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { logout, admin } = useJewelleryCMS();

  // Fetch notifications from API
  const fetchNotifications = async () => {
    setLoading(true);
    const result = await notificationApi.getAdminNotifications(20, 0);
    if (result.success) {
      setNotifications(result.notifications || []);
      setUnreadCount(result.unreadCount || 0);
    }
    setLoading(false);
  };

  // Fetch on mount and every 30 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Time update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await notificationApi.markAsRead(id);
    if (success) {
      setNotifications(prev => prev.map(n => 
        n._id === id ? { ...n, isRead: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
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

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const deletedNotif = notifications.find(n => n._id === id);
    const success = await notificationApi.deleteNotification(id);
    if (success) {
      setNotifications(prev => prev.filter(n => n._id !== id));
      if (!deletedNotif?.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      toast({ title: "Deleted", description: "Notification removed" });
    }
  };

  // ✅ FIXED: Notification click - goes to notifications page with ID
  const handleNotificationClick = (notif: Notification) => {
    // Mark as read if not already
    if (!notif.isRead) {
      notificationApi.markAsRead(notif._id);
      setNotifications(prev => prev.map(n => 
        n._id === notif._id ? { ...n, isRead: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    // Close dropdown and navigate to notifications page with this notification ID
    setOpen(false);
    navigate(`/notifications?id=${notif._id}`);
  };

  // ✅ FIXED: View all button - goes to notifications page
  const goToNotificationsPage = () => {
    setOpen(false);
    navigate("/notifications");
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  const getIcon = (type: string) => {
    const icons: Record<string, string> = {
      'out_of_stock': '🚫',
      'low_stock': '⚠️',
      'back_in_stock': '✅',
      'new_order': '🛍️',
      'order_cancelled': '❌',
      'order_shipped': '🚚',
      'order_delivered': '📦',
      'payment_received': '💰',
      'payment_failed': '⚠️',
      'refund_processed': '💸',
      'refund_completed': '✅',
      'return_request': '🔄',
      'exchange_request': '🔄',
      'return_exchange_approved': '✅',
      'return_exchange_rejected': '❌',
      'new_customer': '👤',
      'customer_complaint': '📢',
      'new_review': '⭐',
      'db_backup': '💾',
      'system_error': '🔴',
      'cms_update': '🆕',
      'system': '🔔'
    };
    return icons[type] || '🔔';
  };

  const formatTime = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)} hours ago`;
    return `${Math.floor(minutes / 1440)} days ago`;
  };

  return (
    <header className="h-16 border-b bg-white flex items-center px-4 md:px-6 gap-3 sticky top-0 z-10">
      <SidebarTrigger className="h-9 w-9 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary/90" />
      <div className="flex-1 max-w-lg">
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
            <Search className="h-3 w-3 text-white" />
          </div>
          <Input
            placeholder="Search products, orders, customers..."
            className="pl-12 h-10 bg-secondary/50 border-0 rounded-xl text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-1.5 ml-auto">
        <span className="text-xs text-muted-foreground hidden md:block">
          {currentTime.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
        </span>

        <ThemeToggle />

        {/* Notification Dropdown */}
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <Button size="icon" className="relative h-9 w-9 bg-primary text-white hover:bg-primary/90 rounded-full">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-red-500 text-white rounded-full">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-96 rounded-xl p-0 max-h-[500px] overflow-y-auto">
            <div className="sticky top-0 bg-white z-10 p-3 border-b">
              <div className="flex justify-between items-center">
                <DropdownMenuLabel className="text-base p-0">Notifications</DropdownMenuLabel>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead} className="h-7 text-xs gap-1">
                      <CheckCheck className="h-3 w-3" /> Mark all read
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={goToNotificationsPage} 
                    className="h-7 text-xs gap-1 text-primary"
                  >
                    View all
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
            <DropdownMenuSeparator />
            
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm mt-2">Loading...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No notifications</p>
              </div>
            ) : (
              notifications.slice(0, 5).map((notif) => (
                <div 
                  key={notif._id} 
                  className={`border-b last:border-0 cursor-pointer hover:bg-gray-50 transition-colors ${!notif.isRead ? 'bg-blue-50/50' : ''}`}
                  onClick={() => handleNotificationClick(notif)}
                >
                  <div className="p-3">
                    <div className="flex gap-3">
                      <div className="text-xl">{getIcon(notif.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium truncate">{notif.title}</p>
                          <div className={`h-2 w-2 rounded-full ${getPriorityColor(notif.priority)}`} />
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{notif.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{formatTime(notif.createdAt)}</p>
                      </div>
                      <div className="flex gap-1">
                        {!notif.isRead && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6" 
                            onClick={(e) => handleMarkAsRead(notif._id, e)}
                          >
                            <div className="h-2 w-2 rounded-full bg-blue-500" />
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 text-muted-foreground hover:text-red-500" 
                          onClick={(e) => handleDelete(notif._id, e)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {notifications.length > 5 && (
              <>
                <DropdownMenuSeparator />
                <div className="p-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full text-xs"
                    onClick={goToNotificationsPage}
                  >
                    View all {notifications.length} notifications
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 p-0">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl w-56">
            <DropdownMenuLabel>
              <p className="font-medium">{admin?.name || 'Admin User'}</p>
              <p className="text-xs text-muted-foreground">{admin?.email || 'admin@jewelskart.com'}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/profile")}>
              <UserCircle className="h-4 w-4 mr-2" />Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              <Settings className="h-4 w-4 mr-2" />Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}