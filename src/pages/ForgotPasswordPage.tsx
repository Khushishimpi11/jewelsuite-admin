import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, Mail } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({ title: "Error", description: "Please enter your email", variant: "destructive" });
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/admin/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to send reset link");
      }
      
      setIsSent(true);
      toast({
        title: "Success",
        description: data.message || "Password reset link sent to your email",
      });
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send reset link",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-none shadow-2xl rounded-2xl overflow-hidden">
          <CardHeader className="text-center space-y-1 pb-2 pt-5">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center shadow-md">
                <img 
                  src={logo} 
                  alt="JewelsKart" 
                  className="h-18 w-18 object-contain brightness-110 contrast-125"
                  style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))" }}
                />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Reset Password</h1>
              <p className="text-[11px] text-muted-foreground">
                {isSent ? "Check your email" : "Enter your email to reset password"}
              </p>
            </div>
          </CardHeader>
          
          <CardContent className="px-5 pb-5">
            {!isSent ? (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-0.5">
                  <Label className="text-[11px] font-medium">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      placeholder="admin@jewelskart.com"
                      className="h-8 text-xs rounded-md pl-8"
                      autoFocus
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-8 text-xs rounded-md font-semibold mt-2"
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />}
                  Send Reset Link
                </Button>

                <div className="text-center pt-2">
                  <Link 
                    to="/login" 
                    className="text-[10px] text-muted-foreground hover:text-primary transition-all inline-flex items-center gap-1"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    Back to Login
                  </Link>
                </div>
              </form>
            ) : (
              <div className="text-center space-y-3">
                <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-3">
                  <p className="text-xs text-green-700 dark:text-green-400">
                    We've sent a password reset link to:
                  </p>
                  <p className="text-sm font-semibold mt-1">{email}</p>
                </div>
                
                <p className="text-[10px] text-muted-foreground">
                  Click the link in the email to reset your password.
                  The link will expire in 15 minutes.
                </p>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/login")}
                  className="w-full h-8 text-xs rounded-md"
                >
                  Back to Login
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}