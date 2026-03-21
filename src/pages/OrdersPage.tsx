import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Search, Eye, Clock, Package, Truck, CheckCircle2, XCircle, IndianRupee, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const statusList = ["Pending", "Processing", "Shipped", "In Transit", "Delivered", "Cancelled"];
const statusConfig: Record<string, { icon: typeof CheckCircle2; class: string }> = {
  Delivered: { icon: CheckCircle2, class: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  Shipped: { icon: Truck, class: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  "In Transit": { icon: Truck, class: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400" },
  Processing: { icon: Package, class: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  Pending: { icon: Clock, class: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  Cancelled: { icon: XCircle, class: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

interface Order {
  id: string; customer: string; email: string; items: { name: string; price: string; qty: number; image: string }[];
  total: string; date: string; status: string; payment: string;
}

const initialOrders: Order[] = [
  { id: "#JK-1234", customer: "Priya Sharma", email: "priya@email.com", items: [{ name: "Diamond Ring", price: "₹35,000", qty: 1, image: "💍" }, { name: "Gold Chain", price: "₹10,200", qty: 1, image: "📿" }], total: "₹45,200", date: "Mar 15, 2026 10:30 AM", status: "Delivered", payment: "Paid" },
  { id: "#JK-1235", customer: "Rahul Mehta", email: "rahul@email.com", items: [{ name: "Temple Necklace", price: "₹1,25,000", qty: 1, image: "📿" }], total: "₹1,25,000", date: "Mar 15, 2026 2:15 PM", status: "Shipped", payment: "Paid" },
  { id: "#JK-1236", customer: "Anita Desai", email: "anita@email.com", items: [{ name: "Pearl Earrings", price: "₹12,800", qty: 2, image: "✨" }, { name: "Bracelet", price: "₹8,000", qty: 1, image: "⭐" }], total: "₹32,800", date: "Mar 14, 2026 4:00 PM", status: "Processing", payment: "Paid" },
  { id: "#JK-1237", customer: "Vikram Singh", email: "vikram@email.com", items: [{ name: "Platinum Band", price: "₹78,500", qty: 1, image: "💎" }], total: "₹78,500", date: "Mar 14, 2026 11:00 AM", status: "Pending", payment: "Pending" },
  { id: "#JK-1238", customer: "Meera Joshi", email: "meera@email.com", items: [{ name: "Rose Gold Set", price: "₹56,200", qty: 1, image: "👑" }], total: "₹56,200", date: "Mar 13, 2026 3:30 PM", status: "Delivered", payment: "Paid" },
  { id: "#JK-1239", customer: "Arjun Kapoor", email: "arjun@email.com", items: [{ name: "Kundan Set", price: "₹92,000", qty: 1, image: "👑" }], total: "₹92,000", date: "Mar 13, 2026 9:45 AM", status: "Cancelled", payment: "Refunded" },
];

const timelineSteps = ["Placed", "Processing", "Shipped", "In Transit", "Delivered"];

export default function OrdersPage() {
  const [orders, setOrders] = useState(initialOrders);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [drawerOrder, setDrawerOrder] = useState<Order | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  let filtered = orders.filter(
    (o) => o.id.toLowerCase().includes(search.toLowerCase()) || o.customer.toLowerCase().includes(search.toLowerCase())
  );
  if (activeTab !== "All") filtered = filtered.filter(o => o.status === activeTab);

  const handleStatusChange = (orderId: string, newStatus: string) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    toast({ title: `Order ${orderId} → ${newStatus}` });
  };

  const handleDeleteAll = () => {
    if (window.confirm("Delete all orders?")) {
      setOrders([]);
      toast({ title: "All orders deleted" });
    }
  };

  const handleBulkStatus = (status: string) => {
    setOrders(orders.map(o => selectedOrders.includes(o.id) ? { ...o, status } : o));
    toast({ title: `${selectedOrders.length} orders → ${status}` });
    setSelectedOrders([]);
  };

  const toggleSelect = (id: string) => {
    setSelectedOrders(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const getTimelineIndex = (status: string) => {
    if (status === "Cancelled") return -1;
    const map: Record<string, number> = { Pending: 0, Processing: 1, Shipped: 2, "In Transit": 3, Delivered: 4 };
    return map[status] ?? 0;
  };

  const tabs = ["All", ...statusList];

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold">Orders</h1>
          <p className="text-muted-foreground text-sm font-sans">{orders.length} total orders</p>
        </div>
        <Button variant="destructive" size="sm" onClick={handleDeleteAll} className="rounded-xl">Delete All Orders</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="glass-card rounded-2xl card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground font-medium">Total Orders</span>
              <ShoppingCart className="h-5 w-5 text-primary" />
            </div>
            <p className="text-3xl font-bold font-display"><AnimatedCounter target={orders.length} /></p>
          </CardContent>
        </Card>
        <Card className="glass-card rounded-2xl card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground font-medium">Total Revenue</span>
              <IndianRupee className="h-5 w-5 text-accent" />
            </div>
            <p className="text-3xl font-bold font-display"><AnimatedCounter target={429700} prefix="₹" /></p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {tabs.map(tab => (
          <Button key={tab} variant={activeTab === tab ? "default" : "outline"} size="sm"
            className={`rounded-xl text-xs whitespace-nowrap ${activeTab === tab ? "" : "bg-secondary/50"}`}
            onClick={() => setActiveTab(tab)}>
            {tab}
          </Button>
        ))}
      </div>

      {/* Bulk Actions */}
      {selectedOrders.length > 0 && (
        <Card className="glass-card rounded-2xl border-accent/30">
          <CardContent className="p-4 flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium">{selectedOrders.length} selected</span>
            <Select onValueChange={handleBulkStatus}>
              <SelectTrigger className="w-[160px] h-9 rounded-xl text-xs"><SelectValue placeholder="Bulk update status" /></SelectTrigger>
              <SelectContent>{statusList.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setSelectedOrders([])}>Clear</Button>
          </CardContent>
        </Card>
      )}

      <Card className="glass-card rounded-2xl">
        <CardContent className="p-5">
          <div className="relative max-w-md mb-5">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search orders..." className="pl-9 bg-secondary/50 border-0 h-11 rounded-xl" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-sans">
              <thead>
                <tr className="text-muted-foreground text-xs border-b">
                  <th className="text-left py-3 font-medium w-8"></th>
                  <th className="text-left py-3 font-medium">Order ID</th>
                  <th className="text-left py-3 font-medium">Customer</th>
                  <th className="text-left py-3 font-medium hidden md:table-cell">Products</th>
                  <th className="text-left py-3 font-medium">Amount</th>
                  <th className="text-left py-3 font-medium hidden sm:table-cell">Date & Time</th>
                  <th className="text-left py-3 font-medium">Status</th>
                  <th className="text-right py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => {
                  const cfg = statusConfig[order.status] || statusConfig.Pending;
                  return (
                    <tr key={order.id} className="border-b last:border-0 hover:bg-secondary/30 transition-colors">
                      <td className="py-3">
                        <Checkbox checked={selectedOrders.includes(order.id)} onCheckedChange={() => toggleSelect(order.id)} />
                      </td>
                      <td className="py-3 font-medium">{order.id}</td>
                      <td className="py-3">
                        <p className="font-medium">{order.customer}</p>
                        <p className="text-xs text-muted-foreground">{order.email}</p>
                      </td>
                      <td className="py-3 hidden md:table-cell">{order.items.length} items</td>
                      <td className="py-3 font-medium">{order.total}</td>
                      <td className="py-3 text-muted-foreground hidden sm:table-cell text-xs">{order.date}</td>
                      <td className="py-3">
                        <Select value={order.status} onValueChange={(v) => handleStatusChange(order.id, v)}>
                          <SelectTrigger className="h-8 w-[140px] text-xs rounded-xl border-0 bg-transparent p-0">
                            <span className={`flex items-center gap-1.5 ${cfg.class} px-2.5 py-1 rounded-full font-medium`}>
                              <cfg.icon className="h-3 w-3" />{order.status}
                            </span>
                          </SelectTrigger>
                          <SelectContent>
                            {statusList.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-3 text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDrawerOrder(order)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Order Detail Drawer */}
      <Sheet open={!!drawerOrder} onOpenChange={() => setDrawerOrder(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader><SheetTitle className="font-display text-xl">Order {drawerOrder?.id}</SheetTitle></SheetHeader>
          {drawerOrder && (
            <div className="space-y-6 mt-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-muted-foreground text-xs">Customer</p><p className="font-medium">{drawerOrder.customer}</p></div>
                <div><p className="text-muted-foreground text-xs">Date</p><p className="font-medium">{drawerOrder.date}</p></div>
                <div><p className="text-muted-foreground text-xs">Payment</p><p className="font-medium">{drawerOrder.payment}</p></div>
                <div><p className="text-muted-foreground text-xs">Total</p><p className="font-medium text-accent">{drawerOrder.total}</p></div>
              </div>

              {/* Order Timeline */}
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase mb-3">Order Timeline</p>
                <div className="flex items-center justify-between relative">
                  <div className="absolute top-3 left-0 right-0 h-0.5 bg-secondary" />
                  {timelineSteps.map((step, i) => {
                    const current = getTimelineIndex(drawerOrder.status);
                    const active = i <= current && current >= 0;
                    return (
                      <div key={step} className="relative flex flex-col items-center z-10">
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                          {active ? "✓" : i + 1}
                        </div>
                        <p className={`text-[10px] mt-1 ${active ? "text-foreground font-medium" : "text-muted-foreground"}`}>{step}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase">Products</p>
                {drawerOrder.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30">
                    <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center text-xl">{item.image}</div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.qty}</p>
                    </div>
                    <p className="font-medium text-sm">{item.price}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </motion.div>
  );
}
