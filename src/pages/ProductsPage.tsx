import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Search, Filter, MoreVertical, Edit, Trash2, Eye, Package } from "lucide-react";

const products = [
  { id: 1, name: "Diamond Solitaire Ring", sku: "JK-DR-001", category: "Rings", price: "₹1,45,000", weight: "4.2g", stock: 8, status: "Published", image: "💍" },
  { id: 2, name: "Gold Temple Necklace", sku: "JK-GN-002", category: "Necklaces", price: "₹2,85,000", weight: "32g", stock: 3, status: "Published", image: "📿" },
  { id: 3, name: "Pearl Drop Earrings", sku: "JK-PE-003", category: "Earrings", price: "₹28,500", weight: "6.8g", stock: 15, status: "Published", image: "✨" },
  { id: 4, name: "Platinum Band Ring", sku: "JK-PR-004", category: "Rings", price: "₹65,000", weight: "5.1g", stock: 0, status: "Draft", image: "💎" },
  { id: 5, name: "Kundan Bridal Set", sku: "JK-KB-005", category: "Sets", price: "₹4,50,000", weight: "85g", stock: 2, status: "Published", image: "👑" },
  { id: 6, name: "Rose Gold Bracelet", sku: "JK-RB-006", category: "Bracelets", price: "₹42,000", weight: "12g", stock: 11, status: "Archived", image: "⭐" },
];

const statusColors: Record<string, string> = {
  Published: "bg-emerald-100 text-emerald-700",
  Draft: "bg-amber-100 text-amber-700",
  Archived: "bg-muted text-muted-foreground",
};

export default function ProductsPage() {
  const [search, setSearch] = useState("");

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold">Products</h1>
          <p className="text-muted-foreground text-sm font-sans">{products.length} items in catalog</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      <Card className="glass-card rounded-xl">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or SKU..."
                className="pl-9 bg-secondary/50 border-0"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm font-sans">
              <thead>
                <tr className="text-muted-foreground text-xs border-b">
                  <th className="text-left py-3 font-medium">Product</th>
                  <th className="text-left py-3 font-medium hidden md:table-cell">SKU</th>
                  <th className="text-left py-3 font-medium">Category</th>
                  <th className="text-left py-3 font-medium">Price</th>
                  <th className="text-left py-3 font-medium hidden sm:table-cell">Weight</th>
                  <th className="text-left py-3 font-medium">Stock</th>
                  <th className="text-left py-3 font-medium">Status</th>
                  <th className="text-right py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => (
                  <tr key={product.id} className="border-b last:border-0 hover:bg-secondary/30 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center text-lg">
                          {product.image}
                        </div>
                        <span className="font-medium">{product.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-muted-foreground hidden md:table-cell">{product.sku}</td>
                    <td className="py-3">{product.category}</td>
                    <td className="py-3 font-medium">{product.price}</td>
                    <td className="py-3 text-muted-foreground hidden sm:table-cell">{product.weight}</td>
                    <td className="py-3">
                      <span className={product.stock === 0 ? "text-destructive font-medium" : ""}>
                        {product.stock === 0 ? "Out of stock" : product.stock}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[product.status]}`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem><Eye className="h-4 w-4 mr-2" />View</DropdownMenuItem>
                          <DropdownMenuItem><Edit className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive"><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
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
