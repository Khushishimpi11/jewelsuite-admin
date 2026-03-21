import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Tag, Package, Percent, FileCheck, Edit, Trash2, LayoutGrid, List, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface Brand {
  id: number; name: string; products: number; makingCharge: string; premium: string; contract: string; inventory: number; logo?: string;
}

const initialBrands: Brand[] = [
  { id: 1, name: "Tanishq", products: 24, makingCharge: "12%", premium: "₹500", contract: "Active", inventory: 156 },
  { id: 2, name: "Kalyan Jewellers", products: 18, makingCharge: "10%", premium: "₹300", contract: "Active", inventory: 98 },
  { id: 3, name: "Malabar Gold", products: 31, makingCharge: "15%", premium: "₹800", contract: "Renewal", inventory: 210 },
  { id: 4, name: "PC Jeweller", products: 12, makingCharge: "8%", premium: "₹200", contract: "Expired", inventory: 45 },
  { id: 5, name: "JewelsKart Original", products: 42, makingCharge: "—", premium: "—", contract: "In-house", inventory: 320 },
];

const contractColors: Record<string, string> = {
  Active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Renewal: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Expired: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  "In-house": "bg-primary/10 text-primary",
};

export default function BrandsPage() {
  const [brands, setBrands] = useState(initialBrands);
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [addOpen, setAddOpen] = useState(false);
  const [editBrand, setEditBrand] = useState<Brand | null>(null);
  const [form, setForm] = useState({ name: "", makingCharge: "", premium: "", contract: "Active" });

  const handleAdd = () => {
    if (!form.name) { toast({ title: "Brand name required", variant: "destructive" }); return; }
    setBrands([...brands, { id: Date.now(), name: form.name, products: 0, makingCharge: form.makingCharge || "0%", premium: form.premium || "₹0", contract: form.contract, inventory: 0 }]);
    setForm({ name: "", makingCharge: "", premium: "", contract: "Active" });
    setAddOpen(false);
    toast({ title: "Brand added!" });
  };

  const handleEdit = () => {
    if (!editBrand) return;
    setBrands(brands.map(b => b.id === editBrand.id ? editBrand : b));
    setEditBrand(null);
    toast({ title: "Brand updated!" });
  };

  const handleDelete = (id: number) => {
    setBrands(brands.filter(b => b.id !== id));
    toast({ title: "Brand deleted" });
  };

  const BrandForm = ({ isEdit }: { isEdit?: boolean }) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Brand Name</Label>
        <Input value={isEdit ? editBrand?.name : form.name} onChange={e => isEdit ? setEditBrand({ ...editBrand!, name: e.target.value }) : setForm({ ...form, name: e.target.value })} placeholder="Brand name" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Making Charge (%)</Label>
          <Input value={isEdit ? editBrand?.makingCharge : form.makingCharge} onChange={e => isEdit ? setEditBrand({ ...editBrand!, makingCharge: e.target.value }) : setForm({ ...form, makingCharge: e.target.value })} placeholder="12%" />
        </div>
        <div className="space-y-2">
          <Label>Fixed Premium (₹)</Label>
          <Input value={isEdit ? editBrand?.premium : form.premium} onChange={e => isEdit ? setEditBrand({ ...editBrand!, premium: e.target.value }) : setForm({ ...form, premium: e.target.value })} placeholder="₹500" />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Brand Logo</Label>
        <label className="flex items-center justify-center border-2 border-dashed border-border rounded-xl p-6 cursor-pointer hover:bg-secondary/30 transition-colors">
          <div className="text-center">
            <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
            <p className="text-xs text-muted-foreground">Upload logo image</p>
          </div>
          <input type="file" accept="image/*" className="hidden" />
        </label>
      </div>
      <Button onClick={isEdit ? handleEdit : handleAdd} className="w-full">{isEdit ? "Update" : "Add"} Brand</Button>
    </div>
  );

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold">Brands</h1>
          <p className="text-muted-foreground text-sm font-sans">{brands.length} brands · Multi-brand management</p>
        </div>
        <div className="flex gap-2">
          <div className="flex rounded-xl border bg-secondary/50 p-0.5">
            <Button variant={viewMode === "card" ? "default" : "ghost"} size="sm" className="h-8 rounded-lg" onClick={() => setViewMode("card")}><LayoutGrid className="h-3.5 w-3.5" /></Button>
            <Button variant={viewMode === "table" ? "default" : "ghost"} size="sm" className="h-8 rounded-lg" onClick={() => setViewMode("table")}><List className="h-3.5 w-3.5" /></Button>
          </div>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" />Add Brand</Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader><DialogTitle className="font-display">Add Brand</DialogTitle></DialogHeader>
              <BrandForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {viewMode === "card" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {brands.map((b) => (
            <Card key={b.id} className="glass-card rounded-2xl card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Tag className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-base">{b.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${contractColors[b.contract]}`}>{b.contract}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditBrand(b)}><Edit className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(b.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-2 rounded-xl bg-secondary/40">
                    <Package className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-sm font-bold">{b.products}</p>
                    <p className="text-[10px] text-muted-foreground">Products</p>
                  </div>
                  <div className="p-2 rounded-xl bg-secondary/40">
                    <Percent className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-sm font-bold">{b.makingCharge}</p>
                    <p className="text-[10px] text-muted-foreground">Making</p>
                  </div>
                  <div className="p-2 rounded-xl bg-secondary/40">
                    <FileCheck className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-sm font-bold">{b.inventory}</p>
                    <p className="text-[10px] text-muted-foreground">Stock</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="glass-card rounded-2xl">
          <CardContent className="p-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-sans">
                <thead>
                  <tr className="text-muted-foreground text-xs border-b">
                    <th className="text-left py-3 font-medium">Brand</th>
                    <th className="text-left py-3 font-medium">Products</th>
                    <th className="text-left py-3 font-medium">Making Charge</th>
                    <th className="text-left py-3 font-medium">Premium</th>
                    <th className="text-left py-3 font-medium">Stock</th>
                    <th className="text-left py-3 font-medium">Status</th>
                    <th className="text-right py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {brands.map((b) => (
                    <tr key={b.id} className="border-b last:border-0 hover:bg-secondary/30 transition-colors">
                      <td className="py-3 font-medium">{b.name}</td>
                      <td className="py-3">{b.products}</td>
                      <td className="py-3">{b.makingCharge}</td>
                      <td className="py-3">{b.premium}</td>
                      <td className="py-3">{b.inventory}</td>
                      <td className="py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${contractColors[b.contract]}`}>{b.contract}</span></td>
                      <td className="py-3 text-right">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditBrand(b)}><Edit className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(b.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Brand Dialog */}
      <Dialog open={!!editBrand} onOpenChange={() => setEditBrand(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle className="font-display">Edit Brand</DialogTitle></DialogHeader>
          {editBrand && <BrandForm isEdit />}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
