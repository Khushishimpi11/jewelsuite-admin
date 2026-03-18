import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Eye, Mail, Star, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

const customers = [
  { id: 1, name: "Priya Sharma", email: "priya@email.com", phone: "+91 98765 43210", orders: 12, spent: "₹5,42,000", segment: "High Value", joined: "Jan 2025" },
  { id: 2, name: "Rahul Mehta", email: "rahul@email.com", phone: "+91 87654 32109", orders: 8, spent: "₹3,15,000", segment: "High Value", joined: "Mar 2025" },
  { id: 3, name: "Anita Desai", email: "anita@email.com", phone: "+91 76543 21098", orders: 5, spent: "₹1,28,000", segment: "Repeat", joined: "Jun 2025" },
  { id: 4, name: "Vikram Singh", email: "vikram@email.com", phone: "+91 65432 10987", orders: 2, spent: "₹78,500", segment: "New", joined: "Feb 2026" },
  { id: 5, name: "Meera Joshi", email: "meera@email.com", phone: "+91 54321 09876", orders: 15, spent: "₹8,90,000", segment: "High Value", joined: "Nov 2024" },
  { id: 6, name: "Arjun Kapoor", email: "arjun@email.com", phone: "+91 43210 98765", orders: 3, spent: "₹1,45,000", segment: "Repeat", joined: "Sep 2025" },
];

const segmentColors: Record<string, string> = {
  "High Value": "bg-accent/20 text-accent",
  Repeat: "bg-blue-100 text-blue-700",
  New: "bg-emerald-100 text-emerald-700",
};

export default function CustomersPage() {
  const [search, setSearch] = useState("");

  const filtered = customers.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold">Customers</h1>
          <p className="text-muted-foreground text-sm font-sans">{customers.length} registered customers</p>
        </div>
        <div className="flex gap-2">
          {["All", "High Value", "Repeat", "New"].map((s) => (
            <Button key={s} variant={s === "All" ? "default" : "outline"} size="sm" className="text-xs">
              {s}
            </Button>
          ))}
        </div>
      </div>

      <Card className="glass-card rounded-xl">
        <CardContent className="p-4">
          <div className="relative max-w-md mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search customers..." className="pl-9 bg-secondary/50 border-0" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm font-sans">
              <thead>
                <tr className="text-muted-foreground text-xs border-b">
                  <th className="text-left py-3 font-medium">Customer</th>
                  <th className="text-left py-3 font-medium hidden md:table-cell">Phone</th>
                  <th className="text-left py-3 font-medium">Orders</th>
                  <th className="text-left py-3 font-medium">Total Spent</th>
                  <th className="text-left py-3 font-medium">Segment</th>
                  <th className="text-left py-3 font-medium hidden sm:table-cell">Since</th>
                  <th className="text-right py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b last:border-0 hover:bg-secondary/30 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                          {c.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div>
                          <p className="font-medium">{c.name}</p>
                          <p className="text-xs text-muted-foreground">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-muted-foreground hidden md:table-cell">{c.phone}</td>
                    <td className="py-3">{c.orders}</td>
                    <td className="py-3 font-medium">{c.spent}</td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${segmentColors[c.segment]}`}>
                        {c.segment}
                      </span>
                    </td>
                    <td className="py-3 text-muted-foreground hidden sm:table-cell">{c.joined}</td>
                    <td className="py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem><Eye className="h-4 w-4 mr-2" />View Profile</DropdownMenuItem>
                          <DropdownMenuItem><Mail className="h-4 w-4 mr-2" />Send Email</DropdownMenuItem>
                          <DropdownMenuItem><Star className="h-4 w-4 mr-2" />View Wishlist</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
