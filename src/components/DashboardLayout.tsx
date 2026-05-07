import { Outlet, Navigate } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { TopNavbar } from "@/components/TopNavbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useJewelleryCMS } from "@/context/JewelleryCMSContext";
import { useEffect, useRef, useState } from "react";

export function DashboardLayout() {
  const { 
    isAuthenticated, 
    token, 
    fetchProducts,
    fetchOrders,
    fetchCustomers,
    fetchCategories
  } = useJewelleryCMS();
  
  const [isReady, setIsReady] = useState(false);
  const initialFetchDone = useRef(false);

  // ✅ Fetch ALL data - Products, Orders, Customers, Categories
  useEffect(() => {
    if (isAuthenticated && token && !initialFetchDone.current) {
      initialFetchDone.current = true;
      console.log("📦 DashboardLayout: Fetching all data...");
      
      // Fetch all data in parallel
      Promise.all([
        fetchProducts(),
        fetchOrders(),
        fetchCustomers(),
        fetchCategories()
      ])
        .catch(error => {
          console.error("Error fetching dashboard data:", error);
        })
        .finally(() => {
          setTimeout(() => setIsReady(true), 100);
        });
    } else if (!isAuthenticated) {
      setIsReady(true);
    }
  }, [isAuthenticated, token, fetchProducts, fetchOrders, fetchCustomers, fetchCategories]);

  // Show loading state while checking auth or fetching initial data
  if (!isReady && isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopNavbar />
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}