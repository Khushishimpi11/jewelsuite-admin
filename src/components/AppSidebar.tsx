import {
  LayoutDashboard, Package, ShoppingCart, Users, BarChart3, Settings, Tag,
  CreditCard, Megaphone, Warehouse, FolderTree, Gem, RefreshCw, Image, // ✅ ADDED Image icon
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import logo from "@/assets/logo.png";
import logoIcon from "@/assets/logoicon.png";

const mainNav = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Products", url: "/products", icon: Package },
  { title: "Orders", url: "/orders", icon: ShoppingCart },
  { title: "Customers", url: "/customers", icon: Users },
  { title: "Inventory", url: "/inventory", icon: Warehouse },
  { title: "Categories", url: "/categories", icon: FolderTree },
];

// ✅ ADDED Returns in businessNav
const businessNav = [
  { title: "Payments", url: "/payments", icon: CreditCard },
  { title: "Marketing", url: "/marketing", icon: Megaphone },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Brands", url: "/brands", icon: Tag },
  { title: "Returns", url: "/returns", icon: RefreshCw },
];

// ✅ ADDED NEW NAVIGATION - Content Management section
const contentNav = [
  { title: "Section Images", url: "/image-manager", icon: Image },
];

const systemNav = [
  { title: "Gold Rate", url: "/settings?tab=goldrate", icon: Gem },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const renderGroup = (label: string, items: typeof mainNav) => (
    <SidebarGroup key={label}>
      <SidebarGroupLabel className="text-sidebar-foreground/50 uppercase text-[10px] tracking-widest font-sans">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              {collapsed ? (
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SidebarMenuButton asChild isActive={isActive(item.url)}>
                        <NavLink
                          to={item.url}
                          end={item.url === "/"}
                          className="transition-all duration-200 hover:bg-sidebar-accent py-2.5"
                          activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                        >
                          <item.icon className="h-4 w-4 shrink-0" />
                        </NavLink>
                      </SidebarMenuButton>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="bg-sidebar text-sidebar-foreground">
                      <p className="text-sm">{item.title}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <SidebarMenuButton asChild isActive={isActive(item.url)}>
                  <NavLink
                    to={item.url}
                    end={item.url === "/"}
                    className="transition-all duration-200 hover:bg-sidebar-accent py-2.5"
                    activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                  >
                    <item.icon className="h-4 w-4 mr-2.5 shrink-0" />
                    <span className="text-sm">{item.title}</span>
                  </NavLink>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="p-2 pb-2">
        <div className="flex items-center justify-center">
          {collapsed ? (
            <img 
              src={logoIcon} 
              alt="JewelsKart" 
              className="h-14 w-14 shrink-0 object-contain"
            />
          ) : (
            <img 
              src={logo} 
              alt="JewelsKart" 
              className="h-22 w-22 shrink-0 object-contain"
            />
          )}
        </div>
      </SidebarHeader>
      <SidebarContent className="px-1 overflow-hidden">
        {renderGroup("Main", mainNav)}
        {renderGroup("Business", businessNav)}
        {renderGroup("Content", contentNav)}  {/* ✅ NEW SECTION */}
        {renderGroup("System", systemNav)}
      </SidebarContent>
      <SidebarFooter className="p-4">
        {!collapsed && (
          <p className="text-[10px] text-sidebar-foreground/40 font-sans text-center">
            © 2026 JewelsKart CMS
          </p>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}