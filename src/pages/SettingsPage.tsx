import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, CreditCard, Receipt, Bell, Shield, Save, Loader2, Database, Trash2, HardDrive, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useJewelleryCMS } from "@/context/JewelleryCMSContext";

export default function SettingsPage() {
  const {
    settings,
    updateSettings,
    getSystemStatus,
    clearCache,
    downloadBackup,
    loading
  } = useJewelleryCMS();

  // Real JewelsKart default values
  const DEFAULT_STORE_NAME = "JewelsKart";
  const DEFAULT_STORE_LOGO = "https://res.cloudinary.com/dkawppfwu/image/upload/v1777292088/logo_1777288427544_z5hkug.png";
  const DEFAULT_FAVICON = "https://res.cloudinary.com/dkawppfwu/image/upload/v1777292088/logo_1777288427544_z5hkug.png";
  const DEFAULT_BUSINESS_EMAIL = "info@jewelskartindia.com";
  const DEFAULT_CONTACT_NUMBER = "+91 75585 72001";
  const DEFAULT_WHATSAPP_NUMBER = "+91 75585 72001";
  const DEFAULT_STORE_ADDRESS = "Boulevard Towers - JEWELSKART, A-1008, 10th Floor, Near Sadhu Vaswani Chowk, Opp Vijay Sales, Camp, Pune - 411001";
  const DEFAULT_ZOHO_ACCOUNT_ID = "60080771057";
  const DEFAULT_ZOHO_API_KEY = "1003.6314fc4a7d42b81ac85f1ca3dbc545eb.7a647ed7a4a681800edd6c0e26878bbd";
  const DEFAULT_GST_NUMBER = "27AABCU9603R1ZM";
  const DEFAULT_PAN_NUMBER = "AABCU9603R";
  const DEFAULT_INVOICE_FOOTER = "Thank you for shopping with JewelsKart! All items are BIS hallmarked & 100% certified.";

  // Local state for all fields
  const [storeName, setStoreName] = useState(DEFAULT_STORE_NAME);
  const [storeLogo, setStoreLogo] = useState(DEFAULT_STORE_LOGO);
  const [favicon, setFavicon] = useState(DEFAULT_FAVICON);
  const [businessEmail, setBusinessEmail] = useState(DEFAULT_BUSINESS_EMAIL);
  const [contactNumber, setContactNumber] = useState(DEFAULT_CONTACT_NUMBER);
  const [whatsAppNumber, setWhatsAppNumber] = useState(DEFAULT_WHATSAPP_NUMBER);
  const [storeAddress, setStoreAddress] = useState(DEFAULT_STORE_ADDRESS);

  const [zohoPaymentsEnabled, setZohoPaymentsEnabled] = useState(true);
  const [zohoAccountId, setZohoAccountId] = useState(DEFAULT_ZOHO_ACCOUNT_ID);
  const [zohoApiKey, setZohoApiKey] = useState(DEFAULT_ZOHO_API_KEY);
  const [codEnabled, setCodEnabled] = useState(true);

  const [gstNumber, setGstNumber] = useState(DEFAULT_GST_NUMBER);
  const [panNumber, setPanNumber] = useState(DEFAULT_PAN_NUMBER);
  const [invoiceFooterText, setInvoiceFooterText] = useState(DEFAULT_INVOICE_FOOTER);

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [newOrderAlerts, setNewOrderAlerts] = useState(true);
  const [lowStockAlerts, setLowStockAlerts] = useState(true);
  const [outOfStockAlerts, setOutOfStockAlerts] = useState(true);

  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // System stats
  const [cmsVersion, setCmsVersion] = useState("v1.0.0");
  const [databaseStatus, setDatabaseStatus] = useState("Connected");
  const [dbStats, setDbStats] = useState<any>({ products: 0, categories: 0, orders: 0, customers: 0 });
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load settings when loaded
  useEffect(() => {
    if (settings) {
      setStoreName(settings.storeName || DEFAULT_STORE_NAME);
      setStoreLogo(settings.storeLogo || DEFAULT_STORE_LOGO);
      setFavicon(settings.favicon || DEFAULT_FAVICON);
      setBusinessEmail(settings.businessEmail || DEFAULT_BUSINESS_EMAIL);
      setContactNumber(settings.contactNumber || DEFAULT_CONTACT_NUMBER);
      setWhatsAppNumber(settings.whatsAppNumber || DEFAULT_WHATSAPP_NUMBER);
      setStoreAddress(settings.storeAddress || DEFAULT_STORE_ADDRESS);

      setZohoPaymentsEnabled(settings.zohoPaymentsEnabled !== false);
      setZohoAccountId(settings.zohoAccountId || DEFAULT_ZOHO_ACCOUNT_ID);
      setZohoApiKey(settings.zohoApiKey || DEFAULT_ZOHO_API_KEY);
      setCodEnabled(settings.codEnabled !== false);

      setGstNumber(settings.gstNumber || DEFAULT_GST_NUMBER);
      setPanNumber(settings.panNumber || DEFAULT_PAN_NUMBER);
      setInvoiceFooterText(settings.invoiceFooterText || DEFAULT_INVOICE_FOOTER);

      setEmailNotifications(settings.emailNotifications !== false);
      setNewOrderAlerts(settings.newOrderAlerts !== false);
      setLowStockAlerts(settings.lowStockAlerts !== false);
      setOutOfStockAlerts(settings.outOfStockAlerts !== false);

      setMaintenanceMode(!!settings.maintenanceMode);
    }
  }, [settings]);

  // Load system/db status
  const fetchStatus = async () => {
    setLoadingStatus(true);
    const data = await getSystemStatus();
    if (data && data.success) {
      setCmsVersion(data.cmsVersion || "v1.0.0");
      setDatabaseStatus(data.databaseStatus || "Connected");
      if (data.stats) {
        setDbStats(data.stats);
      }
    }
    setLoadingStatus(false);
  };

  useEffect(() => {
    fetchStatus();
  }, [getSystemStatus]);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await updateSettings({
        storeName,
        storeLogo,
        favicon,
        businessEmail,
        contactNumber,
        whatsAppNumber,
        storeAddress,
        zohoPaymentsEnabled,
        zohoAccountId,
        zohoApiKey,
        codEnabled,
        gstNumber,
        panNumber,
        invoiceFooterText,
        emailNotifications,
        newOrderAlerts,
        lowStockAlerts,
        outOfStockAlerts,
        maintenanceMode
      });
    } catch (err) {
      // Error is already toasted by updateSettings
    } finally {
      setSaving(false);
    }
  };

  const handleClearCache = async () => {
    try {
      await clearCache();
    } catch (err) {}
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[65vh]">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading CMS Settings...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-6 p-6 max-w-4xl" 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">CMS Settings</h1>
          <p className="text-muted-foreground text-sm font-sans">Manage your JewelsKart system configuration</p>
        </div>
        <Button onClick={handleSaveSettings} disabled={saving} className="gap-2 rounded-xl h-11 px-6 shadow-sm">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving Changes..." : "Save Settings"}
        </Button>
      </div>

      <Tabs defaultValue="store" className="space-y-4">
        <TabsList className="bg-secondary/50 rounded-xl p-1 flex flex-wrap gap-1 w-full justify-start overflow-x-auto">
          <TabsTrigger value="store" className="rounded-lg gap-2"><Building2 className="h-4 w-4" />Store Info</TabsTrigger>
          <TabsTrigger value="payment" className="rounded-lg gap-2"><CreditCard className="h-4 w-4" />Payment Gateway</TabsTrigger>
          <TabsTrigger value="company" className="rounded-lg gap-2"><Receipt className="h-4 w-4" />Company Details</TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-lg gap-2"><Bell className="h-4 w-4" />Notifications</TabsTrigger>
          <TabsTrigger value="system" className="rounded-lg gap-2"><Shield className="h-4 w-4" />System</TabsTrigger>
        </TabsList>

        {/* 1. STORE INFORMATION */}
        <TabsContent value="store">
          <Card className="glass-card rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base font-display">Store Information</CardTitle>
              <CardDescription>Setup your public shop identity, contact details, logo, and favicon.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Store Name</Label>
                  <Input value={storeName} onChange={(e) => setStoreName(e.target.value)} className="h-11 rounded-xl" placeholder="JewelsKart" />
                </div>
                <div className="space-y-2">
                  <Label>Business Email</Label>
                  <Input type="email" value={businessEmail} onChange={(e) => setBusinessEmail(e.target.value)} className="h-11 rounded-xl" placeholder="info@jewelskartindia.com" />
                </div>
                <div className="space-y-2">
                  <Label>Contact Number</Label>
                  <Input value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} className="h-11 rounded-xl" placeholder="+91 75585 72001" />
                </div>
                <div className="space-y-2">
                  <Label>WhatsApp Number</Label>
                  <Input value={whatsAppNumber} onChange={(e) => setWhatsAppNumber(e.target.value)} className="h-11 rounded-xl" placeholder="+91 75585 72001" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <Label>Store Logo URL</Label>
                  <Input value={storeLogo} onChange={(e) => setStoreLogo(e.target.value)} className="h-11 rounded-xl font-mono text-xs" placeholder="https://res.cloudinary.com/dkawppfwu/image/upload/v1777292088/logo_1777288427544_z5hkug.png" />
                </div>
                <div className="space-y-2">
                  <Label>Favicon URL</Label>
                  <Input value={favicon} onChange={(e) => setFavicon(e.target.value)} className="h-11 rounded-xl font-mono text-xs" placeholder="https://res.cloudinary.com/dkawppfwu/image/upload/v1777292088/logo_1777288427544_z5hkug.png" />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Label>Store Address</Label>
                <Input value={storeAddress} onChange={(e) => setStoreAddress(e.target.value)} className="h-11 rounded-xl" placeholder="Boulevard Towers - JEWELSKART, A-1008, 10th Floor, Near Sadhu Vaswani Chowk, Opp Vijay Sales, Camp, Pune - 411001" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. PAYMENT GATEWAY */}
        <TabsContent value="payment">
          <Card className="glass-card rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base font-display">Payment Gateway Integration</CardTitle>
              <CardDescription>Configure customer checkout payment gateways for online transactions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 rounded-2xl bg-secondary/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-semibold">Enable Zoho Payments Gateway</Label>
                    <p className="text-xs text-muted-foreground">Accept online payments, credit cards, UPI, net banking via Zoho</p>
                  </div>
                  <Switch checked={zohoPaymentsEnabled} onCheckedChange={setZohoPaymentsEnabled} />
                </div>

                {zohoPaymentsEnabled && (
                  <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="space-y-2">
                      <Label>Zoho Account ID</Label>
                      <Input type="text" value={zohoAccountId} onChange={(e) => setZohoAccountId(e.target.value)} className="h-11 rounded-xl font-mono" placeholder="60080771057" />
                    </div>
                    <div className="space-y-2">
                      <Label>Zoho API Key</Label>
                      <Input type="password" value={zohoApiKey} onChange={(e) => setZohoApiKey(e.target.value)} className="h-11 rounded-xl font-mono" placeholder="1003.6314fc4a7d42b81ac85f1ca3dbc545eb..." />
                    </div>
                  </motion.div>
                )}
              </div>

              <Separator />

              <div className="p-4 rounded-2xl bg-secondary/30 flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold">Enable Cash on Delivery (COD)</Label>
                  <p className="text-xs text-muted-foreground">Allow customers to pay cash when product is delivered</p>
                </div>
                <Switch checked={codEnabled} onCheckedChange={setCodEnabled} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. COMPANY DETAILS */}
        <TabsContent value="company">
          <Card className="glass-card rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base font-display">Company Details &amp; Tax</CardTitle>
              <CardDescription>Setup tax invoice credentials and GSTIN values for billing.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>GST Number</Label>
                  <Input value={gstNumber} onChange={(e) => setGstNumber(e.target.value)} className="h-11 rounded-xl uppercase" placeholder="e.g. 27AABCU9603R1ZM" />
                </div>
                <div className="space-y-2">
                  <Label>PAN Number</Label>
                  <Input value={panNumber} onChange={(e) => setPanNumber(e.target.value)} className="h-11 rounded-xl uppercase" placeholder="e.g. AABCU9603R" />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Label>Invoice Footer Note</Label>
                <Input value={invoiceFooterText} onChange={(e) => setInvoiceFooterText(e.target.value)} className="h-11 rounded-xl" placeholder="Footer text printed on invoice PDFs" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. NOTIFICATIONS */}
        <TabsContent value="notifications">
          <Card className="glass-card rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base font-display">Notification Settings</CardTitle>
              <CardDescription>Toggle specific email alerts and CMS notifications for orders and customers.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/20 transition-colors">
                  <div className="space-y-0.5">
                    <Label className="font-semibold text-sm">Send Customer Email Notifications</Label>
                    <p className="text-xs text-muted-foreground">Automatically send emails on order receipt/update</p>
                  </div>
                  <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                </div>

                <Separator />

                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/20 transition-colors">
                  <div className="space-y-0.5">
                    <Label className="font-semibold text-sm">New Order Alerts</Label>
                    <p className="text-xs text-muted-foreground">Receive system notification when a customer places an order</p>
                  </div>
                  <Switch checked={newOrderAlerts} onCheckedChange={setNewOrderAlerts} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 5. SYSTEM */}
        <TabsContent value="system">
          <Card className="glass-card rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base font-display">System Status &amp; Maintenance</CardTitle>
              <CardDescription>Perform backups, manage cached data, and check database live health.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Maintenance Toggle */}
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                <div className="space-y-0.5 pr-4">
                  <Label className="text-sm font-semibold text-amber-800 dark:text-amber-300">Maintenance Mode</Label>
                  <p className="text-xs text-amber-700/80 dark:text-amber-400/80">Offline the consumer website for scheduled updates</p>
                </div>
                <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
              </div>

              {/* Status Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-secondary/40 space-y-1">
                  <p className="text-xs text-muted-foreground">CMS Version</p>
                  <p className="text-base font-semibold">{cmsVersion}</p>
                </div>
                <div className="p-4 rounded-xl bg-secondary/40 space-y-1 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Database Status</p>
                    <span className={`inline-flex items-center gap-1.5 text-sm font-bold mt-1 ${databaseStatus === "Connected" ? "text-emerald-500" : "text-rose-500"}`}>
                      <span className={`h-2.5 w-2.5 rounded-full ${databaseStatus === "Connected" ? "bg-emerald-500" : "bg-rose-500"} animate-pulse`} />
                      {databaseStatus}
                    </span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={fetchStatus} disabled={loadingStatus}>
                    <RefreshCw className={`h-4 w-4 ${loadingStatus ? "animate-spin" : ""}`} />
                  </Button>
                </div>
              </div>

              {/* DB Stats */}
              <div className="p-4 rounded-xl bg-secondary/20 border space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <HardDrive className="h-4 w-4" /> Database Collection Summary
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div className="space-y-0.5">
                    <p className="text-lg font-bold text-foreground">{dbStats.products}</p>
                    <p className="text-xs text-muted-foreground">Products</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-lg font-bold text-foreground">{dbStats.categories}</p>
                    <p className="text-xs text-muted-foreground">Categories</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-lg font-bold text-foreground">{dbStats.orders}</p>
                    <p className="text-xs text-muted-foreground">Orders</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-lg font-bold text-foreground">{dbStats.customers}</p>
                    <p className="text-xs text-muted-foreground">Customers</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" className="flex-1 gap-2 rounded-xl h-11 border-dashed hover:border-solid" onClick={downloadBackup}>
                  <Database className="h-4 w-4 text-accent" /> Trigger Database Backup (JSON)
                </Button>
                <Button variant="outline" className="flex-1 gap-2 rounded-xl h-11 text-destructive hover:bg-destructive/5 hover:text-destructive border-dashed hover:border-solid border-destructive/30" onClick={handleClearCache}>
                  <Trash2 className="h-4 w-4" /> Clear System Cache
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}