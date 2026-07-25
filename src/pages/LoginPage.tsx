import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useJewelleryCMS } from "@/context/JewelleryCMSContext";
import { useGoogleLogin } from '@react-oauth/google';
import logo from "@/assets/logo.png";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const { adminLogin, googleAdminLogin, isAuthenticated, loading: authLoading } = useJewelleryCMS();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate("/");
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Show session expired toast when redirected from a revoked session
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('session_expired') === '1') {
      toast({
        title: "Session Expired",
        description: "Your session was logged out from another device. Please login again.",
        variant: "destructive",
      });
      // Remove the query param without reload
      window.history.replaceState({}, '', '/login');
    }
  }, []);


  // Google Sign-In Handler for Admin
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log("Google Success:", tokenResponse);
      setIsGoogleLoading(true);
      try {
        if (!secretKey) {
          toast({
            title: "Error",
            description: "Please enter admin secret key for Google login",
            variant: "destructive",
          });
          setIsGoogleLoading(false);
          return;
        }
        const success = await googleAdminLogin(tokenResponse.access_token, secretKey);
        if (success) {
          navigate("/");
        }
      } catch (error) {
        console.error("Google login error:", error);
        toast({
          title: "Error",
          description: "Google sign in failed. Please try again.",
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
        description: "Google sign in failed. Please try again.",
        variant: "destructive",
      });
      setIsGoogleLoading(false);
    },
  });

  const handleGoogleButtonClick = () => {
    console.log("🔵 Google Sign-In button clicked!");
    handleGoogleLogin();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }
    
    setIsLoading(true);
    try {
      await adminLogin(email, password);
    } catch (error) {
      // Error already handled in context
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-none shadow-2xl rounded-2xl overflow-hidden">
          <CardHeader className="text-center space-y-2 pb-3 pt-6">
            <div className="flex justify-center mb-1">
              <div className="h-24 w-24 rounded-full bg-primary flex items-center justify-center shadow-md">
                <img 
                  src={logo} 
                  alt="JewelsKart" 
                  className="h-20 w-20 object-contain brightness-110 contrast-125"
                  style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))" }}
                />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Welcome Back</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Sign in to your account</p>
            </div>
          </CardHeader>
          
          <CardContent className="px-6 pb-6">
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Email Field */}
              <div className="space-y-1">
                <Label className="text-xs font-medium">Email</Label>
                <Input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="admin@jewelskart.com"
                  autoComplete="email"
                  disabled={isLoading || isGoogleLoading}
                  className="h-9 text-sm rounded-lg focus:ring-2 focus:ring-primary/20"
                />
              </div>
              
              {/* Password Field */}
              <div className="space-y-1">
                <Label className="text-xs font-medium">Password</Label>
                <div className="relative">
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    disabled={isLoading || isGoogleLoading}
                    className="h-9 text-sm rounded-lg pr-8 focus:ring-2 focus:ring-primary/20"
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 
                               hover:bg-primary hover:text-white transition-all duration-200 rounded-full"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading || isGoogleLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Secret Key Field */}
              <div className="space-y-1">
                <Label className="text-xs font-medium">Admin Secret Key</Label>
                <div className="relative">
                  <Input 
                    type={showSecretKey ? "text" : "password"} 
                    value={secretKey} 
                    onChange={(e) => setSecretKey(e.target.value)} 
                    placeholder="Enter admin secret key"
                    disabled={isLoading || isGoogleLoading}
                    className="h-9 text-sm rounded-lg pr-8 focus:ring-2 focus:ring-primary/20"
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 
                               hover:bg-primary hover:text-white transition-all duration-200 rounded-full"
                    onClick={() => setShowSecretKey(!showSecretKey)}
                    disabled={isLoading || isGoogleLoading}
                  >
                    {showSecretKey ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Required for Google login
                </p>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between py-0.5">
                <div className="flex items-center gap-1.5">
                  <Checkbox 
                    id="remember" 
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    disabled={isLoading || isGoogleLoading}
                    className="h-3.5 w-3.5 rounded border-gray-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <Label htmlFor="remember" className="text-xs font-normal cursor-pointer">
                    Remember me
                  </Label>
                </div>
                <button 
                  type="button" 
                  onClick={() => navigate("/forgot-password")}
                  className="text-xs text-primary hover:underline transition-all"
                >
                  Forgot password?
                </button>
              </div>

              {/* Sign In Button */}
              <Button 
                type="submit" 
                className="w-full h-9 text-sm rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={isLoading || isGoogleLoading}
              >
                {isLoading && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
                Sign In
              </Button>

              {/* Divider */}
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-[10px] text-muted-foreground">Or continue with</span>
                </div>
              </div>

              {/* Google Sign In Button */}
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleButtonClick}
                disabled={isLoading || isGoogleLoading}
                className="w-full h-9 text-sm rounded-lg font-semibold gap-2 
                           border hover:bg-primary hover:text-white hover:border-primary 
                           transition-all duration-200"
              >
                {isGoogleLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <>
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
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
                    <span>Sign in with Google</span>
                  </>
                )}
              </Button>

              {/* Sign Up Link */}
              <p className="text-center text-xs text-muted-foreground pt-1">
                Don't have an account?{" "}
                <Link to="/signup" className="text-primary font-semibold hover:underline transition-all">
                  Sign up
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}