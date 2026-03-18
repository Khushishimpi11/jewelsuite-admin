import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, AlertTriangle, PackageCheck, PackageMinus, Truck } from "lucide-react";
import { useState } from "react";

const inventory = [
  { id: 1, name: "Diamond Solitaire Ring 18K", sku: "JK-DR-001", stock: 8, reorderLevel: 5, supplier: "Rajdhani Jewels", lastRestocked: "Mar 10, 2026", status: "In Stock" },
  { id: 2, name: "Gold Temple Necklace", sku: "JK-GN-002", stock: 3, reorderLevel: 5, supplier: "Mumbai Gold Co.", lastRestocked: "Mar 5, 2026", status: "Low Stock" },
  { id: 3, name: "Pearl Drop Earrings", sku: "JK-PE-003", stock: 15, reorderLevel: 5, supplier: "Hyderabad Pearls", lastRestocked: "Mar 12, 2026", status: "In Stock" },
  { id: 4, name: "Platinum Band Ring", sku: "JK-PR-004", stock: 0, reorderLevel: 3, supplier: "Platinum India", lastRestocked: "Feb 20, 2026", status: "Out of Stock" },
  { id: 5, name: "Kundan Bridal Set", sku: "JK-KB-005", stock: 2, reorderLevel: 3, supplier: "Jaipur Artisans", lastRestocked: "Mar 1, 2026", status: "Low Stock" },
  { id: 6, name: "Rose Gold Bracelet", sku: "JK-RB-006", stock: 11, reorderLevel: 5, supplier: "Golden Touch Ltd", lastRestocked: "Mar 8, 2026", status: "In Stock" },
];

const statusColors: Record<string, string> = {
  "In Stock": "bg-emerald-100 text-emerald-700",
  "Low Stock": "bg-amber-100 text-amber-700",
  "Out of Stock": "bg-red-100 text-red-700",
};

export default function InventoryPage() {
  const [search, setSearch] = useState("");
  const filtered = inventory.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));

  const inStock = inventory.filter((i) => i.status === "In Stock").length;
  const lowStock = inventory.filter((i) => i.status === "Low Stock").length;
  const outOfStock = inventory.filter((i) => i.status === "Out of Stock").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Inventory</h1>
        <p className="text-muted-foreground text-sm font-sans">Stock management & supplier tracking</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "In Stock", value: inStock, icon: PackageCheck, color: "text-emerald-600" },
          { label: "Low Stock", value: lowStock, icon: AlertTriangle, color: "text-amber-600" },
          { label: "Out of Stock", value: outOfStock, icon: PackageMinus, color: "text-destructive" },
        ].map((s) => (
          <Card key={s.label} className="glass-card rounded-xl card-hover">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`h-10 w-10 rounded-lg bg-secondary flex items-center justify-center ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold font-display">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass-card rounded-xl">
        <CardContent className="p-4">
          <div className="relative max-w-md mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search inventory..." className="pl-9 bg-secondary/50 border-0" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-sans">
              <thead>
                <tr className="text-muted-foreground text-xs border-b">
                  <th className="text-left py-3 font-medium">Product</th>
                  <th className="text-left py-3 font-medium hidden md:table-cell">SKU</th>
                  <th className="text-left py-3 font-medium">Stock</th>
                  <th className="text-left py-3 font-medium hidden sm:table-cell">Reorder Level</th>
                  <th className="text-left py-3 font-medium hidden md:table-cell">Supplier</th>
                  <th className="text-left py-3 font-medium">Status</th>
                  <th className="text-right py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-b last:border-0 hover:bg-secondary/30 transition-colors">
                    <td className="py-3 font-medium">{item.name}</td>
                    <td className="py-3 text-muted-foreground hidden md:table-cell">{item.sku}</td>
                    <td className="py-3">{item.stock}</td>
                    <td className="py-3 text-muted-foreground hidden sm:table-cell">{item.reorderLevel}</td>
                    <td className="py-3 text-muted-foreground hidden md:table-cell">{item.supplier}</td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[item.status]}`}>{item.status}</span>
                    </td>
                    <td className="py-3 text-right">
                      <Button variant="outline" size="sm" className="text-xs gap-1">
                        <Truck className="h-3 w-3" />
                        Reorder
                      </Button>
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
