import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Tag, Package, Percent, FileCheck } from "lucide-react";

const brands = [
  { id: 1, name: "Tanishq", products: 24, commission: "12%", contract: "Active", inventory: 156 },
  { id: 2, name: "Kalyan Jewellers", products: 18, commission: "10%", contract: "Active", inventory: 98 },
  { id: 3, name: "Malabar Gold", products: 31, commission: "15%", contract: "Renewal", inventory: 210 },
  { id: 4, name: "PC Jeweller", products: 12, commission: "8%", contract: "Expired", inventory: 45 },
  { id: 5, name: "JewelsKart Original", products: 42, commission: "—", contract: "In-house", inventory: 320 },
];

const contractColors: Record<string, string> = {
  Active: "bg-emerald-100 text-emerald-700",
  Renewal: "bg-amber-100 text-amber-700",
  Expired: "bg-red-100 text-red-700",
  "In-house": "bg-primary/10 text-primary",
};

export default function BrandsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold">Brands</h1>
          <p className="text-muted-foreground text-sm font-sans">Multi-brand management</p>
        </div>
        <Button className="gap-2"><Plus className="h-4 w-4" />Add Brand</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {brands.map((b) => (
          <Card key={b.id} className="glass-card rounded-xl card-hover">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Tag className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold">{b.name}</h3>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${contractColors[b.contract]}`}>
                  {b.contract}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <Package className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-sm font-bold">{b.products}</p>
                  <p className="text-[10px] text-muted-foreground">Products</p>
                </div>
                <div>
                  <Percent className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-sm font-bold">{b.commission}</p>
                  <p className="text-[10px] text-muted-foreground">Commission</p>
                </div>
                <div>
                  <FileCheck className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-sm font-bold">{b.inventory}</p>
                  <p className="text-[10px] text-muted-foreground">In Stock</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
