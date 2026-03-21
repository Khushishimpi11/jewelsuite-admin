import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Eye, Edit, Trash2, PlusCircle, MinusCircle, Upload, Download, FileUp, IndianRupee, Gem } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface Product {
  id: number; name: string; sku: string; category: string; brand: string; price: string; purchasePrice: string;
  stock: number; status: string; image: string; description: string; weight: string; purity: string;
  tags: string[];
}

const initialProducts: Product[] = [
  { id: 1, name: "Diamond Solitaire Ring", sku: "JK-DR-001", category: "Rings", brand: "Tanishq", price: "₹1,45,000", purchasePrice: "₹1,00,000", stock: 8, status: "Published", image: "💍", description: "Premium 18K gold diamond solitaire", weight: "5.2", purity: "22K", tags: ["Best Seller"] },
  { id: 2, name: "Gold Temple Necklace", sku: "JK-GN-002", category: "Necklaces", brand: "Malabar Gold", price: "₹2,85,000", purchasePrice: "₹2,00,000", stock: 3, status: "Published", image: "📿", description: "Traditional temple design", weight: "18.5", purity: "22K", tags: ["Trending"] },
  { id: 3, name: "Pearl Drop Earrings", sku: "JK-PE-003", category: "Earrings", brand: "Kalyan Jewellers", price: "₹28,500", purchasePrice: "₹18,000", stock: 15, status: "Published", image: "✨", description: "Elegant pearl drop earrings", weight: "3.1", purity: "22K", tags: ["New Arrival"] },
  { id: 4, name: "Platinum Band Ring", sku: "JK-PR-004", category: "Rings", brand: "PC Jeweller", price: "₹65,000", purchasePrice: "₹45,000", stock: 0, status: "Draft", image: "💎", description: "Pure platinum band", weight: "4.0", purity: "24K", tags: [] },
  { id: 5, name: "Kundan Bridal Set", sku: "JK-KB-005", category: "Sets", brand: "JewelsKart Original", price: "₹4,50,000", purchasePrice: "₹3,20,000", stock: 2, status: "Published", image: "👑", description: "Complete bridal kundan set", weight: "45.0", purity: "22K", tags: ["Best Seller", "Trending"] },
  { id: 6, name: "Rose Gold Bracelet", sku: "JK-RB-006", category: "Bracelets", brand: "Tanishq", price: "₹42,000", purchasePrice: "₹28,000", stock: 11, status: "Archived", image: "⭐", description: "Rose gold charm bracelet", weight: "8.0", purity: "22K", tags: [] },
];

const statusColors: Record<string, string> = {
  Published: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Draft: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Archived: "bg-muted text-muted-foreground",
};

const tagColors: Record<string, string> = {
  "Best Seller": "bg-accent/20 text-accent",
  "New Arrival": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  "Trending": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

const brandsList = ["Tanishq", "Kalyan Jewellers", "Malabar Gold", "PC Jeweller", "JewelsKart Original"];
const tagsList = ["Best Seller", "New Arrival", "Trending"];

export default function ProductsPage() {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [autoPrice, setAutoPrice] = useState(true);

  const [form, setForm] = useState({ name: "", price: "", purchasePrice: "", category: "", brand: "", stock: "", description: "", images: "", weight: "", purity: "22K", tags: [] as string[] });

  const goldRate22K = 5800;
  const goldRate24K = 6300;
  const makingChargePercent = 12;

  const calcPrice = (weight: string, purity: string) => {
    const w = parseFloat(weight) || 0;
    const rate = purity === "24K" ? goldRate24K : goldRate22K;
    const base = w * rate;
    const making = base * (makingChargePercent / 100);
    return { base, making, total: base + making };
  };

  const filtered = products.filter(
    (p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    if (!form.name || !form.price) { toast({ title: "Error", description: "Name and price required", variant: "destructive" }); return; }
    const newP: Product = {
      id: Date.now(), name: form.name, sku: `JK-${Date.now().toString().slice(-6)}`,
      category: form.category || "Uncategorized", brand: form.brand || "Unbranded",
      price: `₹${form.price}`, purchasePrice: `₹${form.purchasePrice || "0"}`,
      stock: parseInt(form.stock) || 0, status: "Draft", image: "💎", description: form.description,
      weight: form.weight, purity: form.purity, tags: form.tags,
    };
    setProducts([newP, ...products]);
    setForm({ name: "", price: "", purchasePrice: "", category: "", brand: "", stock: "", description: "", images: "", weight: "", purity: "22K", tags: [] });
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
            category: cols[3] || "Uncategorized", brand: "Unbranded", stock: parseInt(cols[4]) || 0,
            description: cols[5] || "", image: "💎", status: "Draft", weight: "", purity: "22K", tags: [],
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

  const priceCalc = calcPrice(form.weight, form.purity);

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold">Products</h1>
          <p className="text-muted-foreground text-sm font-sans">{products.length} items in catalog</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="destructive" size="sm" onClick={handleDeleteAll} className="rounded-xl">Delete All</Button>
          <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1 rounded-xl"><Upload className="h-3.5 w-3.5" />Bulk Upload</Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <DialogTitle className="font-display flex items-center gap-2"><FileUp className="h-5 w-5" /> Bulk Upload Products</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-8 cursor-pointer hover:bg-secondary/30 transition-colors">
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="font-medium">Drop your CSV file here</span>
                  <span className="text-xs text-muted-foreground">Supports 50+ products at once</span>
                  <input type="file" accept=".csv" className="hidden" onChange={handleCSVUpload} />
                </label>
                <Card className="bg-secondary/30 rounded-xl">
                  <CardContent className="p-3 text-xs text-muted-foreground font-mono space-y-1">
                    <p className="font-sans font-medium text-foreground">CSV Format:</p>
                    <p>name, price, purchase_price, category, stock, description, images</p>
                  </CardContent>
                </Card>
                <Button variant="outline" className="w-full gap-2 rounded-xl" onClick={downloadTemplate}>
                  <Download className="h-4 w-4" /> Download CSV Template
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-xl"><Plus className="h-4 w-4" />Add Product</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl rounded-2xl">
              <DialogHeader>
                <DialogTitle className="font-display text-xl">Add Product</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
                <div className="space-y-2"><Label className="text-sm font-medium">Product Name</Label><Input className="h-11 rounded-xl" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Diamond Ring" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Weight (grams)</Label><Input className="h-11 rounded-xl" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} placeholder="5.2" /></div>
                  <div className="space-y-2">
                    <Label>Purity</Label>
                    <Select value={form.purity} onValueChange={v => setForm({ ...form, purity: v })}>
                      <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="22K">22K Gold</SelectItem><SelectItem value="24K">24K Gold</SelectItem></SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Brand</Label>
                    <Select value={form.brand} onValueChange={v => setForm({ ...form, brand: v })}>
                      <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Select brand" /></SelectTrigger>
                      <SelectContent>{brandsList.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>Category</Label><Input className="h-11 rounded-xl" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="Rings" /></div>
                </div>

                {/* Live Price Preview */}
                {form.weight && (
                  <Card className="rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border-accent/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Gem className="h-4 w-4 text-accent" />
                        <span className="font-display font-semibold text-sm">Live Price Preview</span>
                      </div>
                      <div className="space-y-1.5 text-sm">
                        <div className="flex justify-between"><span className="text-muted-foreground">Base ({form.purity} × {form.weight}g)</span><span>₹{priceCalc.base.toLocaleString("en-IN")}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Making ({makingChargePercent}%)</span><span>₹{priceCalc.making.toLocaleString("en-IN")}</span></div>
                        <div className="flex justify-between border-t pt-1.5 font-bold"><span>Final Price</span><span className="text-accent">₹{priceCalc.total.toLocaleString("en-IN")}</span></div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/40">
                  <Switch checked={autoPrice} onCheckedChange={setAutoPrice} />
                  <div>
                    <p className="text-sm font-medium">{autoPrice ? "Auto Price" : "Manual Price Override"}</p>
                    <p className="text-xs text-muted-foreground">{autoPrice ? "Price auto-calculated from gold rate" : "Enter price manually"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Selling Price (₹)</Label><Input className="h-11 rounded-xl" value={autoPrice && form.weight ? priceCalc.total.toString() : form.price} onChange={e => setForm({ ...form, price: e.target.value })} disabled={autoPrice && !!form.weight} /></div>
                  <div className="space-y-2"><Label>Purchase Price (₹)</Label><Input className="h-11 rounded-xl" value={form.purchasePrice} onChange={e => setForm({ ...form, purchasePrice: e.target.value })} placeholder="1,00,000" /></div>
                </div>

                <div className="space-y-2"><Label>Stock</Label><Input type="number" className="h-11 rounded-xl" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} placeholder="10" /></div>

                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex gap-2 flex-wrap">
                    {tagsList.map(tag => (
                      <Badge key={tag} variant={form.tags.includes(tag) ? "default" : "outline"} className="cursor-pointer rounded-lg py-1"
                        onClick={() => setForm({ ...form, tags: form.tags.includes(tag) ? form.tags.filter(t => t !== tag) : [...form.tags, tag] })}>
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2"><Label>Description</Label><Textarea className="rounded-xl min-h-[80px]" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Product description..." /></div>
                <div className="space-y-2">
                  <Label>Product Images</Label>
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-6 cursor-pointer hover:bg-secondary/30 transition-colors">
                    <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                    <span className="text-xs text-muted-foreground">Upload multiple images</span>
                    <input type="file" accept="image/*" multiple className="hidden" />
                  </label>
                </div>
                <Button onClick={handleAdd} className="w-full h-11 rounded-xl text-base">Add Product</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="glass-card rounded-2xl">
        <CardContent className="p-5">
          <div className="relative max-w-md mb-5">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name, SKU, or brand..." className="pl-9 bg-secondary/50 border-0 h-11 rounded-xl" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-sans">
              <thead>
                <tr className="text-muted-foreground text-xs border-b">
                  <th className="text-left py-3 font-medium">Product</th>
                  <th className="text-left py-3 font-medium hidden md:table-cell">SKU</th>
                  <th className="text-left py-3 font-medium hidden lg:table-cell">Brand</th>
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
                        <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center text-lg">{product.image}</div>
                        <div>
                          <span className="font-medium">{product.name}</span>
                          <div className="flex gap-1 mt-0.5">
                            {product.tags.map(t => <span key={t} className={`text-[9px] px-1.5 py-0.5 rounded-full ${tagColors[t] || "bg-muted text-muted-foreground"}`}>{t}</span>)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-muted-foreground hidden md:table-cell font-mono text-xs">{product.sku}</td>
                    <td className="py-3 hidden lg:table-cell text-muted-foreground">{product.brand}</td>
                    <td className="py-3"><span className="text-xs px-2 py-0.5 rounded-full bg-secondary">{product.category}</span></td>
                    <td className="py-3 font-medium">{product.price}</td>
                    <td className="py-3">
                      <span className={product.stock === 0 ? "text-destructive font-medium" : product.stock <= 3 ? "text-amber-600 font-medium" : ""}>{product.stock === 0 ? "Out of stock" : product.stock}</span>
                    </td>
                    <td className="py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[product.status]}`}>{product.status}</span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center justify-end gap-0.5">
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="View" onClick={() => setViewProduct(product)}><Eye className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit" onClick={() => setEditProduct(product)}><Edit className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Add Stock" onClick={() => handleStockChange(product.id, 1)}><PlusCircle className="h-3.5 w-3.5 text-emerald-600" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Remove Stock" onClick={() => handleStockChange(product.id, -1)}><MinusCircle className="h-3.5 w-3.5 text-amber-600" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Delete" onClick={() => handleDelete(product.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
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
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader><DialogTitle className="font-display text-xl">{viewProduct?.name}</DialogTitle></DialogHeader>
          {viewProduct && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-2xl bg-secondary flex items-center justify-center text-4xl">{viewProduct.image}</div>
                <div>
                  <p className="text-xs text-muted-foreground font-mono">SKU: {viewProduct.sku}</p>
                  <p className="text-xs text-muted-foreground">Brand: {viewProduct.brand}</p>
                  <div className="flex gap-1 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[viewProduct.status]}`}>{viewProduct.status}</span>
                    {viewProduct.tags.map(t => <span key={t} className={`text-xs px-2 py-0.5 rounded-full ${tagColors[t]}`}>{t}</span>)}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-muted-foreground text-xs">Category</p><p className="font-medium">{viewProduct.category}</p></div>
                <div><p className="text-muted-foreground text-xs">Stock</p><p className="font-medium">{viewProduct.stock}</p></div>
                <div><p className="text-muted-foreground text-xs">Weight</p><p className="font-medium">{viewProduct.weight}g ({viewProduct.purity})</p></div>
                <div><p className="text-muted-foreground text-xs">Selling Price</p><p className="font-medium">{viewProduct.price}</p></div>
              </div>
              <div><p className="text-muted-foreground text-xs">Description</p><p className="text-sm">{viewProduct.description}</p></div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={!!editProduct} onOpenChange={() => setEditProduct(null)}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader><DialogTitle className="font-display text-xl">Edit Product</DialogTitle></DialogHeader>
          {editProduct && (
            <div className="space-y-4">
              <div className="space-y-2"><Label>Name</Label><Input className="h-11 rounded-xl" value={editProduct.name} onChange={e => setEditProduct({ ...editProduct, name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Price</Label><Input className="h-11 rounded-xl" value={editProduct.price} onChange={e => setEditProduct({ ...editProduct, price: e.target.value })} /></div>
                <div className="space-y-2">
                  <Label>Brand</Label>
                  <Select value={editProduct.brand} onValueChange={v => setEditProduct({ ...editProduct, brand: v })}>
                    <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>{brandsList.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Weight (g)</Label><Input className="h-11 rounded-xl" value={editProduct.weight} onChange={e => setEditProduct({ ...editProduct, weight: e.target.value })} /></div>
                <div className="space-y-2"><Label>Category</Label><Input className="h-11 rounded-xl" value={editProduct.category} onChange={e => setEditProduct({ ...editProduct, category: e.target.value })} /></div>
              </div>
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2 flex-wrap">
                  {tagsList.map(tag => (
                    <Badge key={tag} variant={editProduct.tags.includes(tag) ? "default" : "outline"} className="cursor-pointer rounded-lg py-1"
                      onClick={() => setEditProduct({ ...editProduct, tags: editProduct.tags.includes(tag) ? editProduct.tags.filter(t => t !== tag) : [...editProduct.tags, tag] })}>
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-2"><Label>Description</Label><Textarea className="rounded-xl" value={editProduct.description} onChange={e => setEditProduct({ ...editProduct, description: e.target.value })} /></div>
              <Button onClick={handleEdit} className="w-full h-11 rounded-xl">Save Changes</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
