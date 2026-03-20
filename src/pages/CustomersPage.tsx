import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Eye, Trash2, Edit, Users, IndianRupee, ShoppingCart, UserCheck, Mail, Phone, MapPin } from "lucide-react";
import { useState } from "react";
import { AnimatedCounter } from "@/components/AnimatedCounter";

interface Customer {
  id: number; name: string; email: string; phone: string; address: string;
  orders: number; spent: string; segment: string; joined: string; source: string;
  orderHistory: { id: string; product: string; price: string; date: string; image: string }[];
}

const customers: Customer[] = [
  { id: 1, name: "Priya Sharma", email: "priya@email.com", phone: "+91 98765 43210", address: "G-9, Lane C1, Rahul Housing, Koregaon Park, Pune", orders: 12, spent: "₹5,42,000", segment: "High Value", joined: "Jan 2025", source: "Website",
    orderHistory: [{ id: "#JK-1234", product: "Diamond Ring", price: "₹35,000", date: "Mar 15, 2026", image: "💍" }, { id: "#JK-1220", product: "Gold Chain", price: "₹22,000", date: "Feb 10, 2026", image: "📿" }] },
  { id: 2, name: "Rahul Mehta", email: "rahul@email.com", phone: "+91 87654 32109", address: "Krushna Rao Housing Society, Pachora", orders: 8, spent: "₹3,15,000", segment: "High Value", joined: "Mar 2025", source: "Website",
    orderHistory: [{ id: "#JK-1235", product: "Temple Necklace", price: "₹1,25,000", date: "Mar 15, 2026", image: "📿" }] },
  { id: 3, name: "Anita Desai", email: "anita@email.com", phone: "+91 76543 21098", address: "Mumbai, Maharashtra", orders: 5, spent: "₹1,28,000", segment: "Repeat", joined: "Jun 2025", source: "Manual",
    orderHistory: [{ id: "#JK-1236", product: "Pearl Earrings", price: "₹12,800", date: "Mar 14, 2026", image: "✨" }] },
  { id: 4, name: "Vikram Singh", email: "vikram@email.com", phone: "+91 65432 10987", address: "Jaipur, Rajasthan", orders: 2, spent: "₹78,500", segment: "New", joined: "Feb 2026", source: "Manual",
    orderHistory: [{ id: "#JK-1237", product: "Platinum Band", price: "₹78,500", date: "Mar 14, 2026", image: "💎" }] },
  { id: 5, name: "Meera Joshi", email: "meera@email.com", phone: "+91 54321 09876", address: "Delhi NCR", orders: 15, spent: "₹8,90,000", segment: "High Value", joined: "Nov 2024", source: "Website",
    orderHistory: [{ id: "#JK-1238", product: "Rose Gold Set", price: "₹56,200", date: "Mar 13, 2026", image: "👑" }] },
  { id: 6, name: "Arjun Kapoor", email: "arjun@email.com", phone: "+91 43210 98765", address: "Bangalore, Karnataka", orders: 3, spent: "₹1,45,000", segment: "Repeat", joined: "Sep 2025", source: "Manual",
    orderHistory: [{ id: "#JK-1239", product: "Kundan Set", price: "₹92,000", date: "Mar 13, 2026", image: "👑" }] },
];

const segmentColors: Record<string, string> = {
  "High Value": "bg-accent/20 text-accent",
  Repeat: "bg-blue-100 text-blue-700",
  New: "bg-emerald-100 text-emerald-700",
};

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [viewCustomer, setViewCustomer] = useState<Customer | null>(null);

  let filtered = customers.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  );
  if (filter !== "All") filtered = filtered.filter(c => c.source === filter);

  const totalRevenue = 98204;
  const webCustomers = customers.filter(c => c.source === "Website").length;
  const manualCustomers = customers.filter(c => c.source === "Manual").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold">Customers</h1>
          <p className="text-muted-foreground text-sm font-sans">Manage your customer database</p>
        </div>
        <Button className="gap-2"><Users className="h-4 w-4" />Add Customer</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Customers", value: customers.length, icon: Users, sub: `${webCustomers} Website  ${manualCustomers} Manual` },
          { label: "Total Revenue", value: totalRevenue, icon: IndianRupee, prefix: "₹", sub: `₹${(totalRevenue * 0.65).toLocaleString("en-IN")} from website` },
          { label: "Total Orders", value: 35, icon: ShoppingCart, sub: "All customers combined" },
          { label: "Active Customers", value: customers.length, icon: UserCheck, sub: `${webCustomers} Website • ${manualCustomers} Manual` },
        ].map(s => (
          <Card key={s.label} className="glass-card rounded-xl card-hover">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
              </div>
              <p className="text-2xl font-bold font-display"><AnimatedCounter target={s.value} prefix={s.prefix} /></p>
              <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search customers by name, email or phone..." className="pl-9 bg-secondary/50 border-0" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {["All", "Website", "Manual"].map(s => (
            <Button key={s} variant={filter === s ? "default" : "outline"} size="sm" onClick={() => setFilter(s)} className="text-xs">{s}</Button>
          ))}
        </div>
      </div>

      <p className="text-sm text-muted-foreground">Showing {filtered.length} of {customers.length} customers</p>

      {/* Customer Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(c => (
          <Card key={c.id} className="glass-card rounded-xl card-hover">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                    {c.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${c.source === "Website" ? "bg-blue-100 text-blue-700" : "bg-secondary text-muted-foreground"}`}>{c.source}</span>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Customer ID: {c.id}...</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setViewCustomer(c)}><Eye className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7"><Edit className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
              <h3 className="font-display font-bold">{c.name}</h3>
              <div className="space-y-1 mt-2 text-xs text-muted-foreground">
                <p className="flex items-center gap-1.5"><Mail className="h-3 w-3" />{c.email}</p>
                <p className="flex items-center gap-1.5"><Phone className="h-3 w-3" />{c.phone}</p>
                <p className="flex items-center gap-1.5"><MapPin className="h-3 w-3" />{c.address}</p>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                <div><p className="text-[10px] text-muted-foreground">Total Spent</p><p className="font-medium text-sm">{c.spent}</p></div>
                <span className="text-xs font-medium text-accent">{c.orders} Orders</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Customer Detail */}
      <Dialog open={!!viewCustomer} onOpenChange={() => setViewCustomer(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="font-display">{viewCustomer?.name}</DialogTitle></DialogHeader>
          {viewCustomer && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-muted-foreground">Email</p><p>{viewCustomer.email}</p></div>
                <div><p className="text-xs text-muted-foreground">Phone</p><p>{viewCustomer.phone}</p></div>
                <div><p className="text-xs text-muted-foreground">Address</p><p>{viewCustomer.address}</p></div>
                <div><p className="text-xs text-muted-foreground">Member Since</p><p>{viewCustomer.joined}</p></div>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase mb-2">Order History</p>
                {viewCustomer.orderHistory.map(o => (
                  <div key={o.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 mb-2">
                    <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center text-lg">{o.image}</div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{o.product}</p>
                      <p className="text-xs text-muted-foreground">{o.id} • {o.date}</p>
                    </div>
                    <p className="font-medium text-sm">{o.price}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
