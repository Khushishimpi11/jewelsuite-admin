import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useJewelleryCMS } from "@/context/JewelleryCMSContext";
import { useGoogleLogin } from '@react-oauth/google';
import logo from "@/assets/logo.png";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const { adminRegister, googleAdminLogin, isAuthenticated } = useJewelleryCMS();

  // Redirect if already logged in
  if (isAuthenticated) {
    navigate("/");
    return null;
  }

  // Google Sign-In Handler for Admin
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log("Google Success:", tokenResponse);
      setIsGoogleLoading(true);
      try {
        const success = await googleAdminLogin(tokenResponse.access_token, secretKey);
        if (success) {
          navigate("/");
        }
      } catch (error) {
        console.error("Google login error:", error);
        toast({
          title: "Error",
          description: "Google sign up failed. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsGoogleLoading(false);
      }
    },
    onError: (error) => {
      console.log("Google error:", error);
      toast({
        title: "Error",
        description: "Google sign up failed. Please try again.",
        variant: "destructive",
      });
      setIsGoogleLoading(false);
    },
  });

  const handleGoogleButtonClick = () => {
    if (!secretKey) {
      toast({
        title: "Error",
        description: "Please enter admin secret key before Google sign up",
        variant: "destructive",
      });
      return;
    }
    console.log("🔵 Google Sign-Up button clicked!");
    handleGoogleLogin();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword || !secretKey) {
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
      await adminRegister(name, email, password, secretKey);
      navigate("/");
    } catch (error) {
      // Error already handled in context
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
             <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center overflow-hidden">
  <img 
    src={logo} 
    alt="JewelsKart" 
    className="h-20 w-20 object-contain"
  />
</div>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Create Account</h1>
              <p className="text-[11px] text-muted-foreground">Register as Admin</p>
            </div>
          </CardHeader>
          
          <CardContent className="px-5 pb-5">
            <form onSubmit={handleSubmit} className="space-y-2">
              {/* Full Name Field */}
              <div className="space-y-0.5">
                <Label className="text-[11px] font-medium">Full Name</Label>
                <Input 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Admin User"
                  autoComplete="name"
                  disabled={isLoading || isGoogleLoading}
                  className="h-8 text-xs rounded-md px-2"
                />
              </div>

              {/* Email Field */}
              <div className="space-y-0.5">
                <Label className="text-[11px] font-medium">Email</Label>
                <Input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="admin@jewelskart.com"
                  autoComplete="email"
                  disabled={isLoading || isGoogleLoading}
                  className="h-8 text-xs rounded-md px-2"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-0.5">
                <Label className="text-[11px] font-medium">Password</Label>
                <div className="relative">
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="Min 6 characters"
                    autoComplete="new-password"
                    disabled={isLoading || isGoogleLoading}
                    className="h-8 text-xs rounded-md pr-7 px-2"
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-0.5 top-1/2 -translate-y-1/2 h-6 w-6 
                               hover:bg-primary hover:text-white transition-all duration-200 rounded-full"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading || isGoogleLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-3 w-3" />
                    ) : (
                      <Eye className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-0.5">
                <Label className="text-[11px] font-medium">Confirm Password</Label>
                <div className="relative">
                  <Input 
                    type={showConfirmPassword ? "text" : "password"} 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    placeholder="Confirm password"
                    autoComplete="new-password"
                    disabled={isLoading || isGoogleLoading}
                    className="h-8 text-xs rounded-md pr-7 px-2"
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-0.5 top-1/2 -translate-y-1/2 h-6 w-6 
                               hover:bg-primary hover:text-white transition-all duration-200 rounded-full"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading || isGoogleLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-3 w-3" />
                    ) : (
                      <Eye className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Secret Key Field */}
              <div className="space-y-0.5">
                <Label className="text-[11px] font-medium">Admin Secret Key</Label>
                <div className="relative">
                  <Input 
                    type={showSecretKey ? "text" : "password"} 
                    value={secretKey} 
                    onChange={(e) => setSecretKey(e.target.value)} 
                    placeholder="Enter admin secret key"
                    disabled={isLoading || isGoogleLoading}
                    className="h-8 text-xs rounded-md pr-7 px-2"
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-0.5 top-1/2 -translate-y-1/2 h-6 w-6 
                               hover:bg-primary hover:text-white transition-all duration-200 rounded-full"
                    onClick={() => setShowSecretKey(!showSecretKey)}
                    disabled={isLoading || isGoogleLoading}
                  >
                    {showSecretKey ? (
                      <EyeOff className="h-3 w-3" />
                    ) : (
                      <Eye className="h-3 w-3" />
                    )}
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Required. Contact administrator for key.
                </p>
              </div>

              {/* Sign Up Button */}
              <Button 
                type="submit" 
                className="w-full h-8 text-xs rounded-md font-semibold mt-1"
                disabled={isLoading || isGoogleLoading}
              >
                {isLoading && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                Create Account
              </Button>

              {/* Divider */}
              <div className="relative my-1.5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-card px-2 text-[9px] text-muted-foreground">Or sign up with</span>
                </div>
              </div>

              {/* Google Sign Up Button */}
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleButtonClick}
                disabled={isLoading || isGoogleLoading}
                className="w-full h-8 text-xs rounded-md font-semibold gap-1.5 
                           border hover:bg-primary hover:text-white transition-all duration-200"
              >
                {isGoogleLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <>
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span>Sign up with Google</span>
                  </>
                )}
              </Button>

              {/* Sign In Link */}
              <p className="text-center text-[10px] text-muted-foreground pt-0.5">
                Already have an account?{" "}
                <Link to="/login" className="text-primary font-semibold hover:underline">
                  Sign in
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}