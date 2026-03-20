import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, AlertTriangle, PackageCheck, PackageMinus, Eye, TrendingUp, Package } from "lucide-react";
import { useState } from "react";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { useSearchParams } from "react-router-dom";

interface InvItem {
  id: number; name: string; sku: string; category: string; brand: string; stock: number;
  purchasePrice: string; sellingPrice: string; margin: string; status: string; description: string; image: string;
}

const inventory: InvItem[] = [
  { id: 1, name: "Diamond Solitaire Ring 18K", sku: "JK-DR-001", category: "Rings", brand: "JewelsKart", stock: 8, purchasePrice: "₹1,00,000", sellingPrice: "₹1,45,000", margin: "31.0%", status: "In Stock", description: "Premium 18K gold diamond solitaire ring", image: "💍" },
  { id: 2, name: "Gold Temple Necklace", sku: "JK-GN-002", category: "Necklaces", brand: "Rajdhani Jewels", stock: 3, purchasePrice: "₹2,00,000", sellingPrice: "₹2,85,000", margin: "29.8%", status: "Low Stock", description: "Traditional temple design gold necklace", image: "📿" },
  { id: 3, name: "Pearl Drop Earrings", sku: "JK-PE-003", category: "Earrings", brand: "Hyderabad Pearls", stock: 15, purchasePrice: "₹18,000", sellingPrice: "₹28,500", margin: "36.8%", status: "In Stock", description: "Elegant pearl drop earrings", image: "✨" },
  { id: 4, name: "Platinum Band Ring", sku: "JK-PR-004", category: "Rings", brand: "Platinum India", stock: 0, purchasePrice: "₹45,000", sellingPrice: "₹65,000", margin: "30.8%", status: "Out of Stock", description: "Pure platinum band ring", image: "💎" },
  { id: 5, name: "Kundan Bridal Set", sku: "JK-KB-005", category: "Sets", brand: "Jaipur Artisans", stock: 2, purchasePrice: "₹3,20,000", sellingPrice: "₹4,50,000", margin: "28.9%", status: "Low Stock", description: "Complete bridal kundan set", image: "👑" },
  { id: 6, name: "Rose Gold Bracelet", sku: "JK-RB-006", category: "Bracelets", brand: "Golden Touch", stock: 11, purchasePrice: "₹28,000", sellingPrice: "₹42,000", margin: "33.3%", status: "In Stock", description: "Rose gold charm bracelet", image: "⭐" },
];

const statusColors: Record<string, string> = {
  "In Stock": "bg-emerald-100 text-emerald-700",
  "Low Stock": "bg-amber-100 text-amber-700",
  "Out of Stock": "bg-red-100 text-red-700",
};

export default function InventoryPage() {
  const [searchParams] = useSearchParams();
  const filterParam = searchParams.get("filter");
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState("all");
  const [viewItem, setViewItem] = useState<InvItem | null>(null);

  const brands = [...new Set(inventory.map(i => i.brand))];

  let filtered = inventory.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()) || i.sku.toLowerCase().includes(search.toLowerCase()));
  if (brandFilter !== "all") filtered = filtered.filter(i => i.brand === brandFilter);
  if (filterParam === "out") filtered = filtered.filter(i => i.status === "Out of Stock");
  if (filterParam === "low") filtered = filtered.filter(i => i.status === "Low Stock");

  const totalValue = 255365;
  const inStock = inventory.filter((i) => i.status === "In Stock").length;
  const lowStock = inventory.filter((i) => i.status === "Low Stock").length;
  const outOfStock = inventory.filter((i) => i.status === "Out of Stock").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Inventory</h1>
        <p className="text-muted-foreground text-sm font-sans">Track and manage your stock levels</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Inventory Value", value: totalValue, prefix: "₹", icon: TrendingUp, color: "text-primary" },
          { label: "Total Products", value: inventory.length, icon: Package, color: "text-primary" },
          { label: "Low Stock", value: lowStock, icon: AlertTriangle, color: "text-amber-600" },
          { label: "Out of Stock", value: outOfStock, icon: PackageMinus, color: "text-destructive" },
        ].map((s) => (
          <Card key={s.label} className="glass-card rounded-xl card-hover">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <div className={`h-9 w-9 rounded-lg bg-secondary flex items-center justify-center ${s.color}`}>
                  <s.icon className="h-5 w-5" />
                </div>
              </div>
              <p className="text-2xl font-bold font-display">
                <AnimatedCounter target={s.value} prefix={s.prefix} />
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass-card rounded-xl">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by name or SKU..." className="pl-9 bg-secondary/50 border-0" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={brandFilter} onValueChange={setBrandFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Brands" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                {brands.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-sans">
              <thead>
                <tr className="text-muted-foreground text-xs border-b">
                  <th className="text-left py-3 font-medium">SKU</th>
                  <th className="text-left py-3 font-medium">Product</th>
                  <th className="text-left py-3 font-medium hidden md:table-cell">Category</th>
                  <th className="text-left py-3 font-medium hidden lg:table-cell">Brand</th>
                  <th className="text-left py-3 font-medium">Stock</th>
                  <th className="text-left py-3 font-medium hidden sm:table-cell">Purchase</th>
                  <th className="text-left py-3 font-medium hidden sm:table-cell">Selling</th>
                  <th className="text-left py-3 font-medium hidden md:table-cell">Margin</th>
                  <th className="text-right py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-b last:border-0 hover:bg-secondary/30 transition-colors">
                    <td className="py-3 text-xs text-muted-foreground font-mono">{item.sku}</td>
                    <td className="py-3 font-medium">{item.name}</td>
                    <td className="py-3 hidden md:table-cell">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-secondary">{item.category}</span>
                    </td>
                    <td className="py-3 text-muted-foreground hidden lg:table-cell">{item.brand}</td>
                    <td className="py-3">
                      <div className="text-center">
                        <span className="font-bold">{item.stock}</span>
                        <span className={`block text-[10px] px-1.5 py-0.5 rounded-full mt-0.5 ${statusColors[item.status]}`}>{item.status}</span>
                      </div>
                    </td>
                    <td className="py-3 hidden sm:table-cell">{item.purchasePrice}</td>
                    <td className="py-3 hidden sm:table-cell font-medium">{item.sellingPrice}</td>
                    <td className="py-3 hidden md:table-cell text-emerald-600 font-medium">{item.margin}</td>
                    <td className="py-3 text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewItem(item)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Product Detail Dialog */}
      <Dialog open={!!viewItem} onOpenChange={() => setViewItem(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle className="font-display flex items-center gap-2">{viewItem?.name} <span className={`text-xs px-2 py-0.5 rounded-full ${viewItem ? statusColors[viewItem.status] : ""}`}>{viewItem?.status}</span></DialogTitle></DialogHeader>
          {viewItem && (
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground">SKU: {viewItem.sku}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="h-40 rounded-xl bg-secondary flex items-center justify-center text-6xl">{viewItem.image}</div>
                <div className="space-y-3">
                  <div><p className="text-xs text-muted-foreground">Category</p><p className="font-medium">{viewItem.category}</p></div>
                  <div><p className="text-xs text-muted-foreground">Description</p><p className="text-sm">{viewItem.description}</p></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><p className="text-xs text-muted-foreground">Purchase Price</p><p className="font-medium">{viewItem.purchasePrice}</p></div>
                    <div><p className="text-xs text-muted-foreground">Selling Price</p><p className="font-medium">{viewItem.sellingPrice}</p></div>
                  </div>
                  <div><p className="text-xs text-muted-foreground">Profit Margin</p><p className="font-medium text-emerald-600">{viewItem.margin}</p></div>
                </div>
                <div className="space-y-4">
                  <Card className="glass-card rounded-xl"><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground font-medium">Current Stock</p><p className="text-4xl font-bold font-display mt-1">{viewItem.stock}</p><p className="text-xs text-accent">units available</p></CardContent></Card>
                  <Card className="glass-card rounded-xl"><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground">Inventory Value</p><p className="text-xl font-bold font-display">₹{(viewItem.stock * parseInt(viewItem.sellingPrice.replace(/[₹,]/g, ""))).toLocaleString("en-IN")}</p></CardContent></Card>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
