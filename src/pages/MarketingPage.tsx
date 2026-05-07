import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Ticket, Image, Mail, Percent, Calendar, Trash2, Edit, Loader2, AlertTriangle, X, Send, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface Coupon {
  id: string;
  code: string;
  type: "Percentage" | "Fixed";
  value: number;
  minOrder: number;
  usageLimit: number;
  used: number;
  expiry: string;
  active: boolean;
}

interface Banner {
  id: string;
  title: string;
  position: string;
  status: "Active" | "Draft";
  cta: string;
  image?: string;
}

interface Campaign {
  id: string;
  name: string;
  subject: string;
  status: "Draft" | "Scheduled" | "Sent";
  scheduledDate?: string;
  recipients: number;
  sentCount: number;
}

const initialCoupons: Coupon[] = [
  { id: "1", code: "WELCOME10", type: "Percentage", value: 10, minOrder: 5000, usageLimit: 100, used: 43, expiry: "2026-04-30", active: true },
  { id: "2", code: "BRIDAL25", type: "Fixed", value: 25000, minOrder: 200000, usageLimit: 20, used: 8, expiry: "2026-06-15", active: true },
  { id: "3", code: "SUMMER15", type: "Percentage", value: 15, minOrder: 10000, usageLimit: 50, used: 50, expiry: "2026-03-31", active: false },
];

const initialBanners: Banner[] = [
  { id: "1", title: "Summer Collection 2026", position: "Homepage Hero", status: "Active", cta: "/collections/summer" },
  { id: "2", title: "Bridal Season Sale", position: "Homepage Banner 2", status: "Active", cta: "/sale/bridal" },
  { id: "3", title: "New Arrivals", position: "Category Page", status: "Draft", cta: "/new-arrivals" },
];

const initialCampaigns: Campaign[] = [];

export default function MarketingPage() {
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [banners, setBanners] = useState<Banner[]>(initialBanners);
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  
  const [couponDialogOpen, setCouponDialogOpen] = useState(false);
  const [bannerDialogOpen, setBannerDialogOpen] = useState(false);
  const [campaignDialogOpen, setCampaignDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  
  const [couponForm, setCouponForm] = useState({
    code: "",
    type: "Percentage" as "Percentage" | "Fixed",
    value: 0,
    minOrder: 0,
    usageLimit: 0,
    expiry: "",
    active: true
  });
  
  const [bannerForm, setBannerForm] = useState({
    title: "",
    position: "",
    cta: "",
    status: "Draft" as "Active" | "Draft"
  });
  
  const [campaignForm, setCampaignForm] = useState({
    name: "",
    subject: "",
    content: "",
    scheduledDate: ""
  });
  
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: string; id: string } | null>(null);

  const handleSaveCoupon = () => {
    if (!couponForm.code || couponForm.value <= 0) {
      toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" });
      return;
    }
    
    setSaving(true);
    setTimeout(() => {
      if (editingCoupon) {
        setCoupons(coupons.map(c => c.id === editingCoupon.id ? { ...c, ...couponForm } : c));
        toast({ title: "Success", description: "Coupon updated successfully" });
      } else {
        const newCoupon: Coupon = {
          id: Date.now().toString(),
          ...couponForm,
          used: 0
        };
        setCoupons([...coupons, newCoupon]);
        toast({ title: "Success", description: "Coupon created successfully" });
      }
      setCouponDialogOpen(false);
      resetCouponForm();
      setSaving(false);
    }, 500);
  };

  const handleSaveBanner = () => {
    if (!bannerForm.title || !bannerForm.position) {
      toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" });
      return;
    }
    
    setSaving(true);
    setTimeout(() => {
      if (editingBanner) {
        setBanners(banners.map(b => b.id === editingBanner.id ? { ...b, ...bannerForm } : b));
        toast({ title: "Success", description: "Banner updated successfully" });
      } else {
        const newBanner: Banner = {
          id: Date.now().toString(),
          ...bannerForm
        };
        setBanners([...banners, newBanner]);
        toast({ title: "Success", description: "Banner created successfully" });
      }
      setBannerDialogOpen(false);
      resetBannerForm();
      setSaving(false);
    }, 500);
  };

  const handleSaveCampaign = () => {
    if (!campaignForm.name || !campaignForm.subject) {
      toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" });
      return;
    }
    
    setSaving(true);
    setTimeout(() => {
      if (editingCampaign) {
        setCampaigns(campaigns.map(c => c.id === editingCampaign.id ? { ...c, ...campaignForm } : c));
        toast({ title: "Success", description: "Campaign updated successfully" });
      } else {
        const newCampaign: Campaign = {
          id: Date.now().toString(),
          name: campaignForm.name,
          subject: campaignForm.subject,
          status: campaignForm.scheduledDate ? "Scheduled" : "Draft",
          scheduledDate: campaignForm.scheduledDate,
          recipients: 0,
          sentCount: 0
        };
        setCampaigns([...campaigns, newCampaign]);
        toast({ title: "Success", description: "Campaign created successfully" });
      }
      setCampaignDialogOpen(false);
      resetCampaignForm();
      setSaving(false);
    }, 500);
  };

  const handleDelete = () => {
    if (!itemToDelete) return;
    
    if (itemToDelete.type === "coupon") {
      setCoupons(coupons.filter(c => c.id !== itemToDelete.id));
      toast({ title: "Success", description: "Coupon deleted successfully" });
    } else if (itemToDelete.type === "banner") {
      setBanners(banners.filter(b => b.id !== itemToDelete.id));
      toast({ title: "Success", description: "Banner deleted successfully" });
    } else if (itemToDelete.type === "campaign") {
      setCampaigns(campaigns.filter(c => c.id !== itemToDelete.id));
      toast({ title: "Success", description: "Campaign deleted successfully" });
    }
    
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const resetCouponForm = () => {
    setCouponForm({
      code: "",
      type: "Percentage",
      value: 0,
      minOrder: 0,
      usageLimit: 0,
      expiry: "",
      active: true
    });
    setEditingCoupon(null);
  };

  const resetBannerForm = () => {
    setBannerForm({
      title: "",
      position: "",
      cta: "",
      status: "Draft"
    });
    setEditingBanner(null);
  };

  const resetCampaignForm = () => {
    setCampaignForm({
      name: "",
      subject: "",
      content: "",
      scheduledDate: ""
    });
    setEditingCampaign(null);
  };

  const editCoupon = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setCouponForm({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      minOrder: coupon.minOrder,
      usageLimit: coupon.usageLimit,
      expiry: coupon.expiry,
      active: coupon.active
    });
    setCouponDialogOpen(true);
  };

  const editBanner = (banner: Banner) => {
    setEditingBanner(banner);
    setBannerForm({
      title: banner.title,
      position: banner.position,
      cta: banner.cta,
      status: banner.status
    });
    setBannerDialogOpen(true);
  };

  const editCampaign = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setCampaignForm({
      name: campaign.name,
      subject: campaign.subject,
      content: "",
      scheduledDate: campaign.scheduledDate || ""
    });
    setCampaignDialogOpen(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const isExpired = (expiry: string) => {
    return new Date(expiry) < new Date();
  };

  return (
    <motion.div className="space-y-6 p-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div>
        <h1 className="text-3xl font-display font-bold">Marketing Management</h1>
        <p className="text-muted-foreground text-sm font-sans">Coupons, banners & email campaigns</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground font-medium">Active Coupons</span>
              <Ticket className="h-5 w-5 text-emerald-500" />
            </div>
            <p className="text-3xl font-bold">{coupons.filter(c => c.active && !isExpired(c.expiry)).length}</p>
          </CardContent>
        </Card>
        <Card className="glass-card rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground font-medium">Active Banners</span>
              <Image className="h-5 w-5 text-primary" />
            </div>
            <p className="text-3xl font-bold">{banners.filter(b => b.status === "Active").length}</p>
          </CardContent>
        </Card>
        <Card className="glass-card rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground font-medium">Campaigns Sent</span>
              <Mail className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold">{campaigns.filter(c => c.status === "Sent").length}</p>
          </CardContent>
        </Card>
        <Card className="glass-card rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground font-medium">Total Coupon Uses</span>
              <Percent className="h-5 w-5 text-amber-500" />
            </div>
            <p className="text-3xl font-bold">{coupons.reduce((sum, c) => sum + c.used, 0)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Coupons */}
      <Card className="glass-card rounded-xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <Ticket className="h-4 w-4 text-accent" /> Coupons
          </CardTitle>
          <Button size="sm" className="gap-1 rounded-xl" onClick={() => setCouponDialogOpen(true)}>
            <Plus className="h-3 w-3" />Create Coupon
          </Button>
        </CardHeader>
        <CardContent>
          {coupons.length > 0 ? (
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
                    <th className="text-right py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((c) => {
                    const expired = isExpired(c.expiry);
                    const isActive = c.active && !expired;
                    
                    return (
                      <tr key={c.id} className="border-b last:border-0 hover:bg-secondary/30 transition-colors">
                        <td className="py-3 font-mono font-medium">{c.code}</td>
                        <td className="py-3">{c.type}</td>
                        <td className="py-3 font-medium">
                          {c.type === "Percentage" ? `${c.value}%` : formatCurrency(c.value)}
                        </td>
                        <td className="py-3 text-muted-foreground hidden sm:table-cell">{formatCurrency(c.minOrder)}</td>
                        <td className="py-3 hidden md:table-cell">{c.used}/{c.usageLimit}</td>
                        <td className="py-3 text-muted-foreground">
                          <Calendar className="h-3 w-3 inline mr-1" />
                          {formatDate(c.expiry)}
                          {expired && <span className="ml-1 text-red-500 text-xs">(Expired)</span>}
                        </td>
                        <td className="py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${isActive ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}`}>
                            {isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => editCoupon(c)}>
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 rounded-lg text-destructive hover:bg-destructive/10" 
                              onClick={() => {
                                setItemToDelete({ type: "coupon", id: c.id });
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Ticket className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No coupons yet. Create your first coupon to attract customers.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Banners */}
      <Card className="glass-card rounded-xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <Image className="h-4 w-4 text-accent" /> Banners
          </CardTitle>
          <Button size="sm" className="gap-1 rounded-xl" onClick={() => setBannerDialogOpen(true)}>
            <Plus className="h-3 w-3" />Add Banner
          </Button>
        </CardHeader>
        <CardContent>
          {banners.length > 0 ? (
            <div className="space-y-3">
              {banners.map((b) => (
                <div key={b.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{b.title}</p>
                    <p className="text-xs text-muted-foreground">{b.position} · CTA: {b.cta}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${b.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {b.status}
                    </span>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => editBanner(b)}>
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 rounded-lg text-destructive hover:bg-destructive/10" 
                      onClick={() => {
                        setItemToDelete({ type: "banner", id: b.id });
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Image className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No banners yet. Create banners to promote your collections.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Campaigns */}
      <Card className="glass-card rounded-xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <Mail className="h-4 w-4 text-accent" /> Email Campaigns
          </CardTitle>
          <Button size="sm" className="gap-1 rounded-xl" onClick={() => setCampaignDialogOpen(true)}>
            <Plus className="h-3 w-3" />New Campaign
          </Button>
        </CardHeader>
        <CardContent>
          {campaigns.length > 0 ? (
            <div className="space-y-3">
              {campaigns.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.subject} · {c.status}</p>
                    {c.scheduledDate && (
                      <p className="text-xs text-muted-foreground mt-1">Scheduled: {formatDate(c.scheduledDate)}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs ${c.status === "Sent" ? "bg-emerald-100 text-emerald-700" : c.status === "Scheduled" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
                      {c.status}
                    </Badge>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => editCampaign(c)}>
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 rounded-lg text-destructive hover:bg-destructive/10" 
                      onClick={() => {
                        setItemToDelete({ type: "campaign", id: c.id });
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p>No campaigns yet. Create your first campaign to notify customers about offers.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Coupon Dialog */}
      <Dialog open={couponDialogOpen} onOpenChange={setCouponDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">{editingCoupon ? "Edit" : "Create"} Coupon</DialogTitle>
            <DialogDescription>
              {editingCoupon ? "Update coupon details below." : "Create a new discount coupon for your customers."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Coupon Code *</Label>
              <Input 
                value={couponForm.code} 
                onChange={e => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                placeholder="e.g., WELCOME10"
                className="rounded-xl font-mono"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={couponForm.type} onValueChange={(v: any) => setCouponForm({ ...couponForm, type: v })}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Percentage">Percentage (%)</SelectItem>
                    <SelectItem value="Fixed">Fixed Amount (₹)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Value *</Label>
                <Input 
                  type="number"
                  value={couponForm.value} 
                  onChange={e => setCouponForm({ ...couponForm, value: parseFloat(e.target.value) || 0 })}
                  placeholder={couponForm.type === "Percentage" ? "e.g., 10" : "e.g., 500"}
                  className="rounded-xl"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Minimum Order (₹)</Label>
                <Input 
                  type="number"
                  value={couponForm.minOrder} 
                  onChange={e => setCouponForm({ ...couponForm, minOrder: parseFloat(e.target.value) || 0 })}
                  placeholder="e.g., 5000"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Usage Limit</Label>
                <Input 
                  type="number"
                  value={couponForm.usageLimit} 
                  onChange={e => setCouponForm({ ...couponForm, usageLimit: parseInt(e.target.value) || 0 })}
                  placeholder="e.g., 100"
                  className="rounded-xl"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Expiry Date</Label>
              <Input 
                type="date"
                value={couponForm.expiry} 
                onChange={e => setCouponForm({ ...couponForm, expiry: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch 
                checked={couponForm.active} 
                onCheckedChange={v => setCouponForm({ ...couponForm, active: v })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCouponDialogOpen(false)} disabled={saving} className="rounded-xl">
              Cancel
            </Button>
            <Button onClick={handleSaveCoupon} disabled={saving} className="rounded-xl">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {editingCoupon ? "Save Changes" : "Create Coupon"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Banner Dialog */}
      <Dialog open={bannerDialogOpen} onOpenChange={setBannerDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">{editingBanner ? "Edit" : "Add"} Banner</DialogTitle>
            <DialogDescription>
              {editingBanner ? "Update banner details below." : "Create a new banner for your website."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Banner Title *</Label>
              <Input 
                value={bannerForm.title} 
                onChange={e => setBannerForm({ ...bannerForm, title: e.target.value })}
                placeholder="e.g., Summer Collection 2026"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Position *</Label>
              <Input 
                value={bannerForm.position} 
                onChange={e => setBannerForm({ ...bannerForm, position: e.target.value })}
                placeholder="e.g., Homepage Hero"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>CTA Link</Label>
              <Input 
                value={bannerForm.cta} 
                onChange={e => setBannerForm({ ...bannerForm, cta: e.target.value })}
                placeholder="e.g., /collections/summer"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={bannerForm.status} onValueChange={(v: any) => setBannerForm({ ...bannerForm, status: v })}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBannerDialogOpen(false)} disabled={saving} className="rounded-xl">
              Cancel
            </Button>
            <Button onClick={handleSaveBanner} disabled={saving} className="rounded-xl">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {editingBanner ? "Save Changes" : "Add Banner"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Campaign Dialog */}
      <Dialog open={campaignDialogOpen} onOpenChange={setCampaignDialogOpen}>
        <DialogContent className="rounded-2xl max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">{editingCampaign ? "Edit" : "Create"} Campaign</DialogTitle>
            <DialogDescription>
              {editingCampaign ? "Update campaign details below." : "Create an email campaign to reach your customers."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Campaign Name *</Label>
              <Input 
                value={campaignForm.name} 
                onChange={e => setCampaignForm({ ...campaignForm, name: e.target.value })}
                placeholder="e.g., Summer Sale Announcement"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Email Subject *</Label>
              <Input 
                value={campaignForm.subject} 
                onChange={e => setCampaignForm({ ...campaignForm, subject: e.target.value })}
                placeholder="e.g., Up to 50% off on Summer Collection!"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Email Content</Label>
              <Textarea 
                value={campaignForm.content} 
                onChange={e => setCampaignForm({ ...campaignForm, content: e.target.value })}
                placeholder="Write your email content here..."
                rows={5}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Schedule (Optional)</Label>
              <Input 
                type="datetime-local"
                value={campaignForm.scheduledDate} 
                onChange={e => setCampaignForm({ ...campaignForm, scheduledDate: e.target.value })}
                className="rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCampaignDialogOpen(false)} disabled={saving} className="rounded-xl">
              Cancel
            </Button>
            <Button onClick={handleSaveCampaign} disabled={saving} className="rounded-xl">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {editingCampaign ? "Save Changes" : "Create Campaign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Delete {itemToDelete?.type === "coupon" ? "Coupon" : itemToDelete?.type === "banner" ? "Banner" : "Campaign"}
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this {itemToDelete?.type}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="rounded-xl">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} className="rounded-xl">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}