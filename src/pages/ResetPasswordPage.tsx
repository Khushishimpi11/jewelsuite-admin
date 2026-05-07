import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    const emailParam = searchParams.get("email");
    
    if (!tokenParam || !emailParam) {
      toast({
        title: "Error",
        description: "Invalid reset link. Please request a new one.",
        variant: "destructive",
      });
      navigate("/forgot-password");
      return;
    }
    
    setToken(tokenParam);
    setEmail(emailParam);
  }, [searchParams, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }
    
    if (password.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/admin/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, newPassword: password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to reset password");
      }
      
      setIsSuccess(true);
      toast({
        title: "Success",
        description: data.message || "Password reset successfully",
      });
      
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reset password",
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
                  className="h-20 w-20 object-contain brightness-110 contrast-125"
                  style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))" }}
                />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Create New Password</h1>
              <p className="text-[11px] text-muted-foreground">
                {isSuccess ? "Password reset successful!" : "Enter your new password"}
              </p>
            </div>
          </CardHeader>
          
          <CardContent className="px-5 pb-5">
            {!isSuccess ? (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-0.5">
                  <Label className="text-[11px] font-medium">New Password</Label>
                  <div className="relative">
                    <Input 
                      type={showPassword ? "text" : "password"} 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      placeholder="Min 6 characters"
                      className="h-8 text-xs rounded-md pr-7"
                      autoFocus
                    />
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="absolute right-0.5 top-1/2 -translate-y-1/2 h-6 w-6 
                                 hover:bg-primary hover:text-white transition-all rounded-full"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <Label className="text-[11px] font-medium">Confirm Password</Label>
                  <div className="relative">
                    <Input 
                      type={showConfirmPassword ? "text" : "password"} 
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)} 
                      placeholder="Confirm your password"
                      className="h-8 text-xs rounded-md pr-7"
                    />
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="absolute right-0.5 top-1/2 -translate-y-1/2 h-6 w-6 
                                 hover:bg-primary hover:text-white transition-all rounded-full"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-8 text-xs rounded-md font-semibold mt-2"
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />}
                  Reset Password
                </Button>

                <div className="text-center pt-2">
                  <Link 
                    to="/login" 
                    className="text-[10px] text-muted-foreground hover:text-primary transition-all inline-flex items-center gap-1"
                  >
                    Back to Login
                  </Link>
                </div>
              </form>
            ) : (
              <div className="text-center space-y-3">
                <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-3">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-xs text-green-700 dark:text-green-400">
                    Password reset successfully!
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-2">
                    Redirecting to login page...
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}