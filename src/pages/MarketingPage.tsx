import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Ticket, Image, Mail, Percent, Calendar, Trash2 } from "lucide-react";

const coupons = [
  { code: "WELCOME10", type: "Percentage", value: "10%", minOrder: "₹5,000", usageLimit: 100, used: 43, expiry: "Apr 30, 2026", active: true },
  { code: "BRIDAL25", type: "Fixed", value: "₹25,000", minOrder: "₹2,00,000", usageLimit: 20, used: 8, expiry: "Jun 15, 2026", active: true },
  { code: "SUMMER15", type: "Percentage", value: "15%", minOrder: "₹10,000", usageLimit: 50, used: 50, expiry: "Mar 31, 2026", active: false },
];

const banners = [
  { id: 1, title: "Summer Collection 2026", position: "Homepage Hero", status: "Active", cta: "/collections/summer" },
  { id: 2, title: "Bridal Season Sale", position: "Homepage Banner 2", status: "Active", cta: "/sale/bridal" },
  { id: 3, title: "New Arrivals", position: "Category Page", status: "Draft", cta: "/new-arrivals" },
];

export default function MarketingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Marketing</h1>
        <p className="text-muted-foreground text-sm font-sans">Coupons, banners & campaigns</p>
      </div>

      {/* Coupons */}
      <Card className="glass-card rounded-xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <Ticket className="h-4 w-4 text-accent" /> Coupons
          </CardTitle>
          <Button size="sm" className="gap-1"><Plus className="h-3 w-3" />Create Coupon</Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-sans">
              <thead>
                <tr className="text-muted-foreground text-xs border-b">
                  <th className="text-left py-3 font-medium">Code</th>
                  <th className="text-left py-3 font-medium">Type</th>
                  <th className="text-left py-3 font-medium">Value</th>
                  <th className="text-left py-3 font-medium hidden sm:table-cell">Min Order</th>
                  <th className="text-left py-3 font-medium hidden md:table-cell">Usage</th>
                  <th className="text-left py-3 font-medium">Expiry</th>
                  <th className="text-left py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => (
                  <tr key={c.code} className="border-b last:border-0 hover:bg-secondary/30 transition-colors">
                    <td className="py-3 font-mono font-medium">{c.code}</td>
                    <td className="py-3"><Percent className="h-3 w-3 inline mr-1" />{c.type}</td>
                    <td className="py-3 font-medium">{c.value}</td>
                    <td className="py-3 text-muted-foreground hidden sm:table-cell">{c.minOrder}</td>
                    <td className="py-3 hidden md:table-cell">{c.used}/{c.usageLimit}</td>
                    <td className="py-3 text-muted-foreground"><Calendar className="h-3 w-3 inline mr-1" />{c.expiry}</td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${c.active ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}`}>
                        {c.active ? "Active" : "Expired"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Banners */}
      <Card className="glass-card rounded-xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <Image className="h-4 w-4 text-accent" /> Banners
          </CardTitle>
          <Button size="sm" className="gap-1"><Plus className="h-3 w-3" />Add Banner</Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {banners.map((b) => (
              <div key={b.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                <div>
                  <p className="font-medium text-sm">{b.title}</p>
                  <p className="text-xs text-muted-foreground">{b.position} · CTA: {b.cta}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${b.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    {b.status}
                  </span>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Email Campaigns */}
      <Card className="glass-card rounded-xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <Mail className="h-4 w-4 text-accent" /> Email Campaigns
          </CardTitle>
          <Button size="sm" className="gap-1"><Plus className="h-3 w-3" />New Campaign</Button>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground text-sm font-sans">
            <Mail className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p>No campaigns yet. Create your first campaign to notify customers about offers.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
