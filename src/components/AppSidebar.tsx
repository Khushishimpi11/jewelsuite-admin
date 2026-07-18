import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  Tag,
  CreditCard,
  Warehouse,
  FolderTree,
  RefreshCw,
  Image,
  MessageSquare,
} from "lucide-react";

import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
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

const businessNav = [
  { title: "Payments", url: "/payments", icon: CreditCard },
  { title: "Brands", url: "/brands", icon: Tag },
  { title: "Returns", url: "/returns", icon: RefreshCw },
];

const contentNav = [
  { title: "Section Images", url: "/image-manager", icon: Image },
  { title: "Reviews", url: "/reviews", icon: MessageSquare },
];

const systemNav = [
  { title: "Settings", url: "/settings", icon: Settings },
];

type NavItem = (typeof mainNav)[number];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  const isActive = (path: string) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(path);

  const renderGroup = (label: string, items: NavItem[]) => (
    <SidebarGroup key={label} className="px-2 py-1">
      {!collapsed && (
        <SidebarGroupLabel className="mb-1 h-auto px-2 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-sidebar-foreground/50">
          {label}
        </SidebarGroupLabel>
      )}

      <SidebarGroupContent>
        <SidebarMenu className="gap-0.5">
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              {collapsed ? (
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.url)}
                        className="h-9 w-full justify-center p-0"
                      >
                        <NavLink
                          to={item.url}
                          end={item.url === "/"}
                          className="flex h-9 w-full items-center justify-center rounded-md transition-colors duration-200 hover:bg-sidebar-accent"
                          activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                        >
                          <item.icon className="h-4 w-4 shrink-0" />
                        </NavLink>
                      </SidebarMenuButton>
                    </TooltipTrigger>

                    <TooltipContent
                      side="right"
                      sideOffset={8}
                      className="bg-sidebar text-sidebar-foreground"
                    >
                      <p className="text-sm">{item.title}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <SidebarMenuButton
                  asChild
                  isActive={isActive(item.url)}
                  className="h-9 p-0"
                >
                  <NavLink
                    to={item.url}
                    end={item.url === "/"}
                    className="flex h-9 w-full items-center rounded-md px-3 transition-colors duration-200 hover:bg-sidebar-accent"
                    activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                  >
                    <item.icon className="mr-3 h-4 w-4 shrink-0" />
                    <span className="truncate text-sm">
                      {item.title}
                    </span>
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
      <SidebarHeader className="shrink-0 px-2 py-2">
        <div className="flex h-16 items-center justify-center">
          {collapsed ? (
            <img
              src={logoIcon}
              alt="JewelsKart"
              className="h-10 w-10 shrink-0 object-contain"
            />
          ) : (
            <img
              src={logo}
              alt="JewelsKart"
              className="h-16 w-auto max-w-[170px] shrink-0 object-contain"
            />
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="gap-0 overflow-x-hidden overflow-y-auto py-1">
        {renderGroup("Main", mainNav)}
        {renderGroup("Business", businessNav)}
        {renderGroup("Content", contentNav)}
        {renderGroup("System", systemNav)}
      </SidebarContent>

      <SidebarFooter className="shrink-0 px-3 py-3">
        {!collapsed && (
          <p className="text-center text-[10px] text-sidebar-foreground/40">
            © 2026 JewelsKart CMS
          </p>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}