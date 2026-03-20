import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Eye, Edit, Trash2, PlusCircle, MinusCircle, Upload, Download, FileUp } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Product {
  id: number; name: string; sku: string; category: string; price: string; purchasePrice: string;
  stock: number; status: string; image: string; description: string;
}

const initialProducts: Product[] = [
  { id: 1, name: "Diamond Solitaire Ring", sku: "JK-DR-001", category: "Rings", price: "₹1,45,000", purchasePrice: "₹1,00,000", stock: 8, status: "Published", image: "💍", description: "Premium 18K gold diamond solitaire" },
  { id: 2, name: "Gold Temple Necklace", sku: "JK-GN-002", category: "Necklaces", price: "₹2,85,000", purchasePrice: "₹2,00,000", stock: 3, status: "Published", image: "📿", description: "Traditional temple design" },
  { id: 3, name: "Pearl Drop Earrings", sku: "JK-PE-003", category: "Earrings", price: "₹28,500", purchasePrice: "₹18,000", stock: 15, status: "Published", image: "✨", description: "Elegant pearl drop earrings" },
  { id: 4, name: "Platinum Band Ring", sku: "JK-PR-004", category: "Rings", price: "₹65,000", purchasePrice: "₹45,000", stock: 0, status: "Draft", image: "💎", description: "Pure platinum band" },
  { id: 5, name: "Kundan Bridal Set", sku: "JK-KB-005", category: "Sets", price: "₹4,50,000", purchasePrice: "₹3,20,000", stock: 2, status: "Published", image: "👑", description: "Complete bridal kundan set" },
  { id: 6, name: "Rose Gold Bracelet", sku: "JK-RB-006", category: "Bracelets", price: "₹42,000", purchasePrice: "₹28,000", stock: 11, status: "Archived", image: "⭐", description: "Rose gold charm bracelet" },
];

const statusColors: Record<string, string> = {
  Published: "bg-emerald-100 text-emerald-700",
  Draft: "bg-amber-100 text-amber-700",
  Archived: "bg-muted text-muted-foreground",
};

export default function ProductsPage() {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  // Form state
  const [form, setForm] = useState({ name: "", price: "", purchasePrice: "", category: "", stock: "", description: "", images: "" });

  const filtered = products.filter(
    (p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    if (!form.name || !form.price) { toast({ title: "Error", description: "Name and price required", variant: "destructive" }); return; }
    const newP: Product = {
      id: Date.now(), name: form.name, sku: `JK-${Date.now().toString().slice(-6)}`,
      category: form.category || "Uncategorized", price: `₹${form.price}`, purchasePrice: `₹${form.purchasePrice || "0"}`,
      stock: parseInt(form.stock) || 0, status: "Draft", image: "💎", description: form.description,
    };
    setProducts([newP, ...products]);
    setForm({ name: "", price: "", purchasePrice: "", category: "", stock: "", description: "", images: "" });
    setAddOpen(false);
    toast({ title: "Product added!" });
  };

  const handleEdit = () => {
    if (!editProduct) return;
    setProducts(products.map(p => p.id === editProduct.id ? editProduct : p));
    setEditProduct(null);
    toast({ title: "Product updated!" });
  };

  const handleDelete = (id: number) => {
    setProducts(products.filter(p => p.id !== id));
    toast({ title: "Product deleted" });
  };

  const handleDeleteAll = () => {
    if (window.confirm("Delete all products? This cannot be undone.")) {
      setProducts([]);
      toast({ title: "All products deleted" });
    }
  };

  const handleStockChange = (id: number, delta: number) => {
    setProducts(products.map(p => p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p));
    toast({ title: delta > 0 ? "Stock added" : "Stock removed" });
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split("\n").filter(l => l.trim());
      const newProducts: Product[] = [];
      lines.slice(1).forEach((line, i) => {
        const cols = line.split(",").map(c => c.trim());
        if (cols[0]) {
          newProducts.push({
            id: Date.now() + i, name: cols[0], sku: `JK-CSV-${Date.now() + i}`,
            price: `₹${cols[1] || "0"}`, purchasePrice: `₹${cols[2] || "0"}`,
            category: cols[3] || "Uncategorized", stock: parseInt(cols[4]) || 0,
            description: cols[5] || "", image: "💎", status: "Draft",
          });
        }
      });
      setProducts([...newProducts, ...products]);
      setBulkOpen(false);
      toast({ title: `${newProducts.length} products uploaded!` });
    };
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const csv = "name,price,purchase_price,category,stock,description,images\n";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "products_template.csv"; a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold">Products</h1>
          <p className="text-muted-foreground text-sm font-sans">{products.length} items in catalog</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="destructive" size="sm" onClick={handleDeleteAll}>Delete All</Button>
          <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1"><Upload className="h-3.5 w-3.5" />Bulk Upload</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display flex items-center gap-2"><FileUp className="h-5 w-5" /> Bulk Upload Products (50+ Supported)</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-8 cursor-pointer hover:bg-secondary/30 transition-colors">
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="font-medium">Drop your CSV file here</span>
                  <span className="text-xs text-muted-foreground">Supports 50+ products at once</span>
                  <input type="file" accept=".csv" className="hidden" onChange={handleCSVUpload} />
                </label>
                <Card className="bg-secondary/30">
                  <CardContent className="p-3 text-xs text-muted-foreground font-mono space-y-1">
                    <p className="font-sans font-medium text-foreground">CSV Format:</p>
                    <p>name, price, purchase_price, category, stock, description, images</p>
                    <p className="font-sans">• For multiple images, separate URLs with | (pipe)</p>
                  </CardContent>
                </Card>
                <Button variant="outline" className="w-full gap-2" onClick={downloadTemplate}>
                  <Download className="h-4 w-4" /> Download CSV Template
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" />Add Product</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-display">Add Product</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                <div className="space-y-1"><Label>Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Diamond Ring" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><Label>Selling Price (₹)</Label><Input value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="1,45,000" /></div>
                  <div className="space-y-1"><Label>Purchase Price (₹)</Label><Input value={form.purchasePrice} onChange={e => setForm({ ...form, purchasePrice: e.target.value })} placeholder="1,00,000" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><Label>Category</Label><Input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="Rings" /></div>
                  <div className="space-y-1"><Label>Stock</Label><Input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} placeholder="10" /></div>
                </div>
                <div className="space-y-1"><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Product description..." /></div>
                <div className="space-y-1"><Label>Image URLs (comma separated)</Label><Input value={form.images} onChange={e => setForm({ ...form, images: e.target.value })} placeholder="https://..." /></div>
                <Button onClick={handleAdd} className="w-full">Add Product</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="glass-card rounded-xl">
        <CardContent className="p-4">
          <div className="relative max-w-md mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name or SKU..." className="pl-9 bg-secondary/50 border-0" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-sans">
              <thead>
                <tr className="text-muted-foreground text-xs border-b">
                  <th className="text-left py-3 font-medium">Product</th>
                  <th className="text-left py-3 font-medium hidden md:table-cell">SKU</th>
                  <th className="text-left py-3 font-medium">Category</th>
                  <th className="text-left py-3 font-medium">Price</th>
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
                        <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center text-lg">{product.image}</div>
                        <span className="font-medium">{product.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-muted-foreground hidden md:table-cell">{product.sku}</td>
                    <td className="py-3">{product.category}</td>
                    <td className="py-3 font-medium">{product.price}</td>
                    <td className="py-3">
                      <span className={product.stock === 0 ? "text-destructive font-medium" : ""}>{product.stock === 0 ? "Out of stock" : product.stock}</span>
                    </td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[product.status]}`}>{product.status}</span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" title="View" onClick={() => setViewProduct(product)}><Eye className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" title="Edit" onClick={() => setEditProduct(product)}><Edit className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" title="Add Stock" onClick={() => handleStockChange(product.id, 1)}><PlusCircle className="h-3.5 w-3.5 text-emerald-600" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" title="Remove Stock" onClick={() => handleStockChange(product.id, -1)}><MinusCircle className="h-3.5 w-3.5 text-amber-600" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" title="Delete" onClick={() => handleDelete(product.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* View Product Dialog */}
      <Dialog open={!!viewProduct} onOpenChange={() => setViewProduct(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="font-display">{viewProduct?.name}</DialogTitle></DialogHeader>
          {viewProduct && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-xl bg-secondary flex items-center justify-center text-4xl">{viewProduct.image}</div>
                <div>
                  <p className="text-xs text-muted-foreground">SKU: {viewProduct.sku}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[viewProduct.status]}`}>{viewProduct.status}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-muted-foreground text-xs">Category</p><p className="font-medium">{viewProduct.category}</p></div>
                <div><p className="text-muted-foreground text-xs">Stock</p><p className="font-medium">{viewProduct.stock}</p></div>
                <div><p className="text-muted-foreground text-xs">Purchase Price</p><p className="font-medium">{viewProduct.purchasePrice}</p></div>
                <div><p className="text-muted-foreground text-xs">Selling Price</p><p className="font-medium">{viewProduct.price}</p></div>
              </div>
              <div><p className="text-muted-foreground text-xs">Description</p><p className="text-sm">{viewProduct.description}</p></div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={!!editProduct} onOpenChange={() => setEditProduct(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="font-display">Edit Product</DialogTitle></DialogHeader>
          {editProduct && (
            <div className="space-y-3">
              <div className="space-y-1"><Label>Name</Label><Input value={editProduct.name} onChange={e => setEditProduct({ ...editProduct, name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label>Price</Label><Input value={editProduct.price} onChange={e => setEditProduct({ ...editProduct, price: e.target.value })} /></div>
                <div className="space-y-1"><Label>Category</Label><Input value={editProduct.category} onChange={e => setEditProduct({ ...editProduct, category: e.target.value })} /></div>
              </div>
              <div className="space-y-1"><Label>Description</Label><Textarea value={editProduct.description} onChange={e => setEditProduct({ ...editProduct, description: e.target.value })} /></div>
              <Button onClick={handleEdit} className="w-full">Save Changes</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
