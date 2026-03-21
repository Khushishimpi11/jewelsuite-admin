import { Bell, Search, User, LogOut, Settings, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";

export function TopNavbar() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    toast({ title: "Logged out", description: "You have been logged out successfully." });
    navigate("/login");
  };

  return (
    <header className="h-16 border-b bg-card/80 backdrop-blur-md flex items-center px-4 md:px-6 gap-3 sticky top-0 z-10">
      <SidebarTrigger className="shrink-0" />

      <div className="flex-1 max-w-lg">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products, orders, customers..."
            className="pl-9 h-10 bg-secondary/50 border-0 focus-visible:ring-1 focus-visible:ring-accent rounded-xl text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-1.5 ml-auto">
        <span className="text-xs text-muted-foreground hidden md:block font-sans mr-2">
          {currentTime.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}{" "}
          {currentTime.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
        </span>

        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-9 w-9">
              <Bell className="h-4 w-4" />
              <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-accent text-accent-foreground border-0">
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 rounded-xl">
            <DropdownMenuLabel className="text-base font-display">Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="py-3">
              <div>
                <p className="text-sm font-medium">New order #1234</p>
                <p className="text-xs text-muted-foreground">2 minutes ago</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="py-3">
              <div>
                <p className="text-sm font-medium">⚠️ Low stock: Gold Ring 18K</p>
                <p className="text-xs text-muted-foreground">1 hour ago</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="py-3">
              <div>
                <p className="text-sm font-medium">Payment received ₹45,000</p>
                <p className="text-xs text-muted-foreground">3 hours ago</p>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <User className="h-4 w-4 text-primary-foreground" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl w-56">
            <DropdownMenuLabel>
              <p className="font-medium font-display">Admin User</p>
              <p className="text-xs text-muted-foreground font-normal font-sans">admin@jewelskart.com</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/settings")} className="py-2.5">
              <UserCircle className="h-4 w-4 mr-2" />Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/settings")} className="py-2.5">
              <Settings className="h-4 w-4 mr-2" />Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive py-2.5" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
