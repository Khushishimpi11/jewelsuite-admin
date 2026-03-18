import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Eye, Clock, Package, Truck, CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";

const orders = [
  { id: "#JK-1234", customer: "Priya Sharma", email: "priya@email.com", items: 2, total: "₹45,200", date: "Mar 15, 2026", status: "Delivered", payment: "Paid" },
  { id: "#JK-1235", customer: "Rahul Mehta", email: "rahul@email.com", items: 1, total: "₹1,25,000", date: "Mar 15, 2026", status: "Shipped", payment: "Paid" },
  { id: "#JK-1236", customer: "Anita Desai", email: "anita@email.com", items: 3, total: "₹32,800", date: "Mar 14, 2026", status: "Processing", payment: "Paid" },
  { id: "#JK-1237", customer: "Vikram Singh", email: "vikram@email.com", items: 1, total: "₹78,500", date: "Mar 14, 2026", status: "Pending", payment: "Pending" },
  { id: "#JK-1238", customer: "Meera Joshi", email: "meera@email.com", items: 2, total: "₹56,200", date: "Mar 13, 2026", status: "Delivered", payment: "Paid" },
  { id: "#JK-1239", customer: "Arjun Kapoor", email: "arjun@email.com", items: 1, total: "₹92,000", date: "Mar 13, 2026", status: "Cancelled", payment: "Refunded" },
];

const statusConfig: Record<string, { icon: typeof CheckCircle2; class: string }> = {
  Delivered: { icon: CheckCircle2, class: "bg-emerald-100 text-emerald-700" },
  Shipped: { icon: Truck, class: "bg-blue-100 text-blue-700" },
  Processing: { icon: Package, class: "bg-amber-100 text-amber-700" },
  Pending: { icon: Clock, class: "bg-muted text-muted-foreground" },
  Cancelled: { icon: XCircle, class: "bg-red-100 text-red-700" },
};

export default function OrdersPage() {
  const [search, setSearch] = useState("");

  const filtered = orders.filter(
    (o) => o.id.toLowerCase().includes(search.toLowerCase()) || o.customer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold">Orders</h1>
          <p className="text-muted-foreground text-sm font-sans">{orders.length} total orders</p>
        </div>
        <div className="flex gap-2">
          {["All", "Pending", "Processing", "Shipped", "Delivered"].map((s) => (
            <Button key={s} variant={s === "All" ? "default" : "outline"} size="sm" className="text-xs">
              {s}
            </Button>
          ))}
        </div>
      </div>

      <Card className="glass-card rounded-xl">
        <CardContent className="p-4">
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search orders..." className="pl-9 bg-secondary/50 border-0" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm font-sans">
              <thead>
                <tr className="text-muted-foreground text-xs border-b">
                  <th className="text-left py-3 font-medium">Order ID</th>
                  <th className="text-left py-3 font-medium">Customer</th>
                  <th className="text-left py-3 font-medium hidden md:table-cell">Items</th>
                  <th className="text-left py-3 font-medium">Total</th>
                  <th className="text-left py-3 font-medium hidden sm:table-cell">Date</th>
                  <th className="text-left py-3 font-medium">Status</th>
                  <th className="text-left py-3 font-medium hidden md:table-cell">Payment</th>
                  <th className="text-right py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => {
                  const cfg = statusConfig[order.status];
                  return (
                    <tr key={order.id} className="border-b last:border-0 hover:bg-secondary/30 transition-colors">
                      <td className="py-3 font-medium">{order.id}</td>
                      <td className="py-3">
                        <div>
                          <p className="font-medium">{order.customer}</p>
                          <p className="text-xs text-muted-foreground">{order.email}</p>
                        </div>
                      </td>
                      <td className="py-3 hidden md:table-cell">{order.items}</td>
                      <td className="py-3 font-medium">{order.total}</td>
                      <td className="py-3 text-muted-foreground hidden sm:table-cell">{order.date}</td>
                      <td className="py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${cfg.class}`}>
                          <cfg.icon className="h-3 w-3" />
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 hidden md:table-cell">
                        <span className={`text-xs ${order.payment === "Paid" ? "text-emerald-600" : order.payment === "Refunded" ? "text-destructive" : "text-amber-600"}`}>
                          {order.payment}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
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
    </div>
  );
}
