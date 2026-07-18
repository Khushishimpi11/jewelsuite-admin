import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Save, Lock, UserCircle, ShieldCheck, Mail, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useJewelleryCMS } from "@/context/JewelleryCMSContext";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function ProfilePage() {
  const { admin, token } = useJewelleryCMS();

  const [name, setName] = useState(admin?.name || "");
  const [savingName, setSavingName] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleSaveName = async () => {
    if (!name.trim()) { toast({ title: "Name cannot be empty", variant: "destructive" }); return; }
    setSavingName(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/admin/update-profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast({ title: "Profile updated!", description: "Your name has been saved." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally { setSavingName(false); }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) { toast({ title: "All fields are required", variant: "destructive" }); return; }
    if (newPassword !== confirmPassword) { toast({ title: "Passwords do not match", variant: "destructive" }); return; }
    setSavingPassword(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/admin/update-profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast({ title: "Password changed!", description: "Your password has been updated." });
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally { setSavingPassword(false); }
  };

  const initials = admin?.name ? admin.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) : "A";

  return (
    <motion.div className="space-y-6 p-6 max-w-3xl" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div>
        <h1 className="text-2xl font-display font-bold">My Profile</h1>
        <p className="text-muted-foreground text-sm font-sans">Manage your admin account details</p>
      </div>

      <Card className="glass-card rounded-2xl">
        <CardContent className="pt-6">
          <div className="flex items-center gap-5">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-2xl font-bold font-display shadow-lg shrink-0 overflow-hidden">
              {admin?.profilePicture ? <img src={admin.profilePicture} alt={admin.name} className="h-full w-full object-cover" /> : initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xl font-display font-bold truncate">{admin?.name || "Admin"}</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5"><Mail className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{admin?.email || "—"}</span></p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge variant="secondary" className="gap-1 text-xs rounded-lg"><ShieldCheck className="h-3 w-3" />{admin?.role === "admin" ? "Super Admin" : admin?.role || "Admin"}</Badge>
                {admin?.isGoogleUser && <Badge variant="outline" className="text-xs rounded-lg gap-1"><span className="text-blue-500 font-bold text-xs">G</span>Google Account</Badge>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card rounded-2xl">
        <CardHeader><CardTitle className="text-base font-display flex items-center gap-2"><UserCircle className="h-4 w-4 text-accent" /> Account Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Display Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="h-11 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input value={admin?.email || ""} disabled className="h-11 rounded-xl bg-secondary/50 cursor-not-allowed" />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>
          </div>
          <Button className="gap-2 rounded-xl" onClick={handleSaveName} disabled={savingName}>
            {savingName ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {savingName ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      {!admin?.isGoogleUser ? (
        <Card className="glass-card rounded-2xl">
          <CardHeader><CardTitle className="text-base font-display flex items-center gap-2"><Lock className="h-4 w-4 text-accent" /> Change Password</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Current Password</Label>
              <div className="relative">
                <Input type={showCurrent ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password" className="h-11 rounded-xl pr-10" />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>New Password</Label>
                <div className="relative">
                  <Input type={showNew ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 8 chars, 1 number, 1 special" className="h-11 rounded-xl pr-10" />
                  <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Confirm New Password</Label>
                <div className="relative">
                  <Input type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter new password" className="h-11 rounded-xl pr-10" />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-secondary/40 text-xs text-muted-foreground">
              Password must be at least 8 characters with at least 1 number and 1 special character (!@#$%&amp;*).
            </div>
            <Button className="gap-2 rounded-xl" onClick={handleChangePassword} disabled={savingPassword}>
              {savingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              {savingPassword ? "Updating..." : "Update Password"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="glass-card rounded-2xl border-dashed">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Lock className="h-5 w-5 shrink-0" />
              <p className="text-sm">You signed in with Google. Password management is handled by your Google account.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
