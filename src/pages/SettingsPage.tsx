import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Receipt, Mail, CreditCard, Shield, Save } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-display font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm font-sans">Configure your JewelsKart CMS</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="bg-secondary/50">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="tax">Tax & GST</TabsTrigger>
          <TabsTrigger value="invoice">Invoice</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="payment">Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card className="glass-card rounded-xl">
            <CardHeader>
              <CardTitle className="text-base font-display flex items-center gap-2">
                <Building2 className="h-4 w-4 text-accent" /> Store Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Store Name</Label>
                  <Input defaultValue="JewelsKart" />
                </div>
                <div className="space-y-2">
                  <Label>Store Email</Label>
                  <Input defaultValue="info@jewelskart.com" />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input defaultValue="+91 98765 43210" />
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Input defaultValue="INR (₹)" disabled />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Store Address</Label>
                <Input defaultValue="123 Zaveri Bazaar, Mumbai, Maharashtra 400002" />
              </div>
              <Button className="gap-2"><Save className="h-4 w-4" />Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tax">
          <Card className="glass-card rounded-xl">
            <CardHeader>
              <CardTitle className="text-base font-display flex items-center gap-2">
                <Receipt className="h-4 w-4 text-accent" /> GST Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>GSTIN</Label>
                  <Input defaultValue="27AABCU9603R1ZM" />
                </div>
                <div className="space-y-2">
                  <Label>GST Rate (%)</Label>
                  <Input defaultValue="3" type="number" />
                </div>
                <div className="space-y-2">
                  <Label>HSN Code (Gold)</Label>
                  <Input defaultValue="7113" />
                </div>
                <div className="space-y-2">
                  <Label>HSN Code (Diamond)</Label>
                  <Input defaultValue="7102" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch defaultChecked />
                <Label>Include GST in displayed prices</Label>
              </div>
              <Button className="gap-2"><Save className="h-4 w-4" />Save Tax Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoice">
          <Card className="glass-card rounded-xl">
            <CardHeader>
              <CardTitle className="text-base font-display flex items-center gap-2">
                <Receipt className="h-4 w-4 text-accent" /> Invoice Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Invoice Prefix</Label>
                  <Input defaultValue="JK-INV" />
                </div>
                <div className="space-y-2">
                  <Label>Next Invoice Number</Label>
                  <Input defaultValue="1240" type="number" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Invoice Footer Note</Label>
                <Input defaultValue="Thank you for shopping with JewelsKart! All items are BIS hallmarked." />
              </div>
              <div className="flex items-center gap-3">
                <Switch defaultChecked />
                <Label>Show store logo on invoices</Label>
              </div>
              <Button className="gap-2"><Save className="h-4 w-4" />Save Invoice Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card className="glass-card rounded-xl">
            <CardHeader>
              <CardTitle className="text-base font-display flex items-center gap-2">
                <Mail className="h-4 w-4 text-accent" /> Email Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>SMTP Host</Label>
                  <Input defaultValue="smtp.gmail.com" />
                </div>
                <div className="space-y-2">
                  <Label>SMTP Port</Label>
                  <Input defaultValue="587" type="number" />
                </div>
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input defaultValue="noreply@jewelskart.com" />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input type="password" defaultValue="••••••••" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch defaultChecked />
                <Label>Enable TLS</Label>
              </div>
              <Button className="gap-2"><Save className="h-4 w-4" />Save Email Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment">
          <Card className="glass-card rounded-xl">
            <CardHeader>
              <CardTitle className="text-base font-display flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-accent" /> Payment Gateway
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-secondary/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center font-bold text-blue-700">R</div>
                  <div>
                    <p className="font-medium text-sm">Razorpay</p>
                    <p className="text-xs text-muted-foreground">UPI, Cards, Net Banking</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="p-4 rounded-lg bg-secondary/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center font-bold text-purple-700">S</div>
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
                <Input defaultValue="rzp_live_••••••••" type="password" />
              </div>
              <Button className="gap-2"><Save className="h-4 w-4" />Save Payment Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
