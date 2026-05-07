import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Receipt, Mail, CreditCard, Save, Gem, Loader2, AlertTriangle } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useJewelleryCMS } from "@/context/JewelleryCMSContext";

export default function SettingsPage() {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") === "goldrate" ? "goldrate" : "general";
  const { 
    goldRates, 
    updateGoldRate, 
    getCurrentGoldRate,
    loading,
    error 
  } = useJewelleryCMS();
  
  const [saving, setSaving] = useState(false);
  const [goldRate22K, setGoldRate22K] = useState("");
  const [goldRate24K, setGoldRate24K] = useState("");
  const [goldRate18K, setGoldRate18K] = useState("");

  // Load current gold rates
  useEffect(() => {
    const rate22K = getCurrentGoldRate("22K");
    const rate24K = getCurrentGoldRate("24K");
    const rate18K = getCurrentGoldRate("18K");
    
    setGoldRate22K(rate22K?.toString() || "5800");
    setGoldRate24K(rate24K?.toString() || "6300");
    setGoldRate18K(rate18K?.toString() || "4750");
  }, [goldRates, getCurrentGoldRate]);

  const handleSaveGoldRates = async () => {
    setSaving(true);
    try {
      const rate22 = parseFloat(goldRate22K);
      const rate24 = parseFloat(goldRate24K);
      const rate18 = parseFloat(goldRate18K);
      
      if (isNaN(rate22) || isNaN(rate24) || isNaN(rate18)) {
        toast({ title: "Error", description: "Please enter valid numbers", variant: "destructive" });
        return;
      }
      
      await updateGoldRate("22K", rate22);
      await updateGoldRate("24K", rate24);
      await updateGoldRate("18K", rate18);
      
      toast({ title: "Success", description: "Gold rates updated successfully" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveGeneral = () => {
    toast({ title: "Settings saved!", description: "Store details updated successfully" });
  };

  const handleSaveTax = () => {
    toast({ title: "Tax settings saved!", description: "GST configuration updated" });
  };

  const handleSaveInvoice = () => {
    toast({ title: "Invoice settings saved!", description: "Invoice configuration updated" });
  };

  const handleSaveEmail = () => {
    toast({ title: "Email settings saved!", description: "SMTP configuration updated" });
  };

  const handleSavePayment = () => {
    toast({ title: "Payment settings saved!", description: "Payment gateway configuration updated" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive font-medium mb-2">Error loading settings</p>
          <p className="text-muted-foreground text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div className="space-y-6 p-6 max-w-4xl" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div>
        <h1 className="text-2xl font-display font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm font-sans">Configure your JewelsKart CMS</p>
      </div>

      <Tabs defaultValue={defaultTab} className="space-y-4">
        <TabsList className="bg-secondary/50 rounded-xl p-1 flex flex-wrap gap-1">
          <TabsTrigger value="general" className="rounded-lg">General</TabsTrigger>
          <TabsTrigger value="goldrate" className="rounded-lg">Gold Rate</TabsTrigger>
          <TabsTrigger value="tax" className="rounded-lg">Tax & GST</TabsTrigger>
          <TabsTrigger value="invoice" className="rounded-lg">Invoice</TabsTrigger>
          <TabsTrigger value="email" className="rounded-lg">Email</TabsTrigger>
          <TabsTrigger value="payment" className="rounded-lg">Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card className="glass-card rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base font-display flex items-center gap-2">
                <Building2 className="h-4 w-4 text-accent" /> Store Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Store Name</Label>
                  <Input defaultValue="JewelsKart" className="h-11 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Store Email</Label>
                  <Input defaultValue="info@jewelskart.com" className="h-11 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input defaultValue="+91 98765 43210" className="h-11 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Input defaultValue="INR (₹)" disabled className="h-11 rounded-xl bg-secondary/50" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Store Address</Label>
                <Input defaultValue="123 Zaveri Bazaar, Mumbai, Maharashtra 400002" className="h-11 rounded-xl" />
              </div>
              <Button className="gap-2 rounded-xl" onClick={handleSaveGeneral}>
                <Save className="h-4 w-4" />Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goldrate">
          <Card className="glass-card rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base font-display flex items-center gap-2">
                <Gem className="h-4 w-4 text-accent" /> Gold Rate Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>22K Gold Rate (per gram)</Label>
                  <Input 
                    value={goldRate22K} 
                    onChange={(e) => setGoldRate22K(e.target.value)}
                    type="text" 
                    className="h-11 rounded-xl font-medium" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>24K Gold Rate (per gram)</Label>
                  <Input 
                    value={goldRate24K} 
                    onChange={(e) => setGoldRate24K(e.target.value)}
                    type="text" 
                    className="h-11 rounded-xl font-medium" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>18K Gold Rate (per gram)</Label>
                  <Input 
                    value={goldRate18K} 
                    onChange={(e) => setGoldRate18K(e.target.value)}
                    type="text" 
                    className="h-11 rounded-xl font-medium" 
                  />
                </div>
              </div>
              <div className="p-4 rounded-xl bg-secondary/40">
                <p className="text-xs text-muted-foreground">
                  Last Updated: <span className="text-foreground font-medium">
                    {goldRates.length > 0 ? new Date(goldRates[goldRates.length - 1].timestamp).toLocaleString() : "Not updated yet"}
                  </span>
                </p>
              </div>
              <Button 
                className="gap-2 rounded-xl" 
                onClick={handleSaveGoldRates}
                disabled={saving}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? "Saving..." : "Save Gold Rates"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tax">
          <Card className="glass-card rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base font-display flex items-center gap-2">
                <Receipt className="h-4 w-4 text-accent" /> GST Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>GSTIN</Label>
                  <Input defaultValue="27AABCU9603R1ZM" className="h-11 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>GST Rate (%)</Label>
                  <Input defaultValue="3" type="number" className="h-11 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>HSN Code (Gold)</Label>
                  <Input defaultValue="7113" className="h-11 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>HSN Code (Diamond)</Label>
                  <Input defaultValue="7102" className="h-11 rounded-xl" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch defaultChecked />
                <Label>Include GST in displayed prices</Label>
              </div>
              <Button className="gap-2 rounded-xl" onClick={handleSaveTax}>
                <Save className="h-4 w-4" />Save Tax Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoice">
          <Card className="glass-card rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base font-display flex items-center gap-2">
                <Receipt className="h-4 w-4 text-accent" /> Invoice Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Invoice Prefix</Label>
                  <Input defaultValue="JK-INV" className="h-11 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Next Invoice Number</Label>
                  <Input defaultValue="1240" type="number" className="h-11 rounded-xl" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Invoice Footer Note</Label>
                <Input 
                  defaultValue="Thank you for shopping with JewelsKart! All items are BIS hallmarked." 
                  className="h-11 rounded-xl" 
                />
              </div>
              <div className="flex items-center gap-3">
                <Switch defaultChecked />
                <Label>Show store logo on invoices</Label>
              </div>
              <Button className="gap-2 rounded-xl" onClick={handleSaveInvoice}>
                <Save className="h-4 w-4" />Save Invoice Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card className="glass-card rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base font-display flex items-center gap-2">
                <Mail className="h-4 w-4 text-accent" /> Email Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>SMTP Host</Label>
                  <Input defaultValue="smtp.gmail.com" className="h-11 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>SMTP Port</Label>
                  <Input defaultValue="587" type="number" className="h-11 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input defaultValue="noreply@jewelskart.com" className="h-11 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input type="password" defaultValue="••••••••" className="h-11 rounded-xl" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch defaultChecked />
                <Label>Enable TLS</Label>
              </div>
              <Button className="gap-2 rounded-xl" onClick={handleSaveEmail}>
                <Save className="h-4 w-4" />Save Email Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment">
          <Card className="glass-card rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base font-display flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-accent" /> Payment Gateway
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-secondary/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center font-bold text-blue-700 text-lg">R</div>
                  <div>
                    <p className="font-medium text-sm">Razorpay</p>
                    <p className="text-xs text-muted-foreground">UPI, Cards, Net Banking</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="p-4 rounded-xl bg-secondary/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center font-bold text-purple-700 text-lg">S</div>
                  <div>
                    <p className="font-medium text-sm">Stripe</p>
                    <p className="text-xs text-muted-foreground">International Cards</p>
                  </div>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Razorpay Key ID</Label>
                <Input defaultValue="rzp_live_••••••••" type="password" className="h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Razorpay Key Secret</Label>
                <Input type="password" defaultValue="••••••••" className="h-11 rounded-xl" />
              </div>
              <Button className="gap-2 rounded-xl" onClick={handleSavePayment}>
                <Save className="h-4 w-4" />Save Payment Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}