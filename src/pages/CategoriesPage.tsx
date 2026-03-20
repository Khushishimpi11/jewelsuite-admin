import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, FolderTree, Package } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const initialCategories = [
  { id: 1, name: "Rings", products: 12, description: "Wedding bands, solitaires, cocktail rings" },
  { id: 2, name: "Necklaces", products: 8, description: "Chains, pendants, temple jewellery" },
  { id: 3, name: "Earrings", products: 15, description: "Studs, drops, jhumkas, hoops" },
  { id: 4, name: "Bracelets", products: 6, description: "Bangles, cuffs, charm bracelets" },
  { id: 5, name: "Sets", products: 4, description: "Bridal sets, matching combos" },
  { id: 6, name: "Anklets", products: 3, description: "Payals, ankle chains" },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState(initialCategories);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSave = () => {
    if (!name.trim()) return;
    if (editingId) {
      setCategories(categories.map(c => c.id === editingId ? { ...c, name, description } : c));
      toast({ title: "Category updated" });
    } else {
      setCategories([...categories, { id: Date.now(), name, description, products: 0 }]);
      toast({ title: "Category added" });
    }
    setOpen(false);
    setName("");
    setDescription("");
    setEditingId(null);
  };

  const handleEdit = (cat: typeof categories[0]) => {
    setEditingId(cat.id);
    setName(cat.name);
    setDescription(cat.description);
    setOpen(true);
  };

  const handleDelete = (id: number) => {
    setCategories(categories.filter(c => c.id !== id));
    toast({ title: "Category deleted" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold">Categories</h1>
          <p className="text-muted-foreground text-sm font-sans">{categories.length} categories</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditingId(null); setName(""); setDescription(""); } }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" />Add Category</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">{editingId ? "Edit" : "Add"} Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Rings" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Short description" />
              </div>
              <Button onClick={handleSave} className="w-full">Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(cat => (
          <Card key={cat.id} className="glass-card rounded-xl card-hover">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FolderTree className="h-5 w-5 text-primary" />
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(cat)}>
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(cat.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <h3 className="font-display font-bold text-lg">{cat.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">{cat.description}</p>
              <div className="flex items-center gap-1 mt-3 text-sm text-muted-foreground">
                <Package className="h-3.5 w-3.5" />
                <span>{cat.products} products</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
