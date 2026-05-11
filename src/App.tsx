import { Navigate } from "react-router-dom";

// src/App.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DashboardLayout } from "@/components/DashboardLayout";
import DashboardPage from "@/pages/DashboardPage";
import ProductsPage from "@/pages/ProductsPage";
import OrdersPage from "@/pages/OrdersPage";
import CustomersPage from "@/pages/CustomersPage";
import InventoryPage from "@/pages/InventoryPage";
import PaymentsPage from "@/pages/PaymentsPage";
import MarketingPage from "@/pages/MarketingPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import BrandsPage from "@/pages/BrandsPage";
import SettingsPage from "@/pages/SettingsPage";
import CategoriesPage from "@/pages/CategoriesPage";
import RevenueDetailsPage from "@/pages/RevenueDetailsPage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import ReturnRequestsPage from "@/pages/ReturnRequestsPage";
import NotificationsPage from "@/pages/NotificationsPage";
import NotFound from "./pages/NotFound.tsx";

// 👇 Import Forgot Password & Reset Password Pages
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";

// 👇 Import ImageManager from pages folder
import ImageManager from "@/pages/ImageManager";

// 👇 Import AdminReviews component
import AdminReviews from "@/pages/AdminReviews";

// 👇 Import JewelleryCMSProvider
import { JewelleryCMSProvider } from "./context/JewelleryCMSContext";

const queryClient = new QueryClient();

// Google Client ID - Environment variable se lo ya direct daalo
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "328448157213-htfq8k1fe4igl4reb3vmdvfbmodu6u6l.apps.googleusercontent.com";

const App = () => (
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <QueryClientProvider client={queryClient}>
      <JewelleryCMSProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              
              {/* Protected Routes */}
              <Route element={<DashboardLayout />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/customers" element={<CustomersPage />} />
                <Route path="/inventory" element={<InventoryPage />} />
                <Route path="/payments" element={<PaymentsPage />} />
                <Route path="/marketing" element={<MarketingPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/brands" element={<BrandsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/revenue-details" element={<RevenueDetailsPage />} />
                <Route path="/returns" element={<ReturnRequestsPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/image-manager" element={<ImageManager />} />
                
                {/* 👇 Add Admin Reviews Route */}
                <Route path="/reviews" element={<AdminReviews />} />
              </Route>
              
              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </JewelleryCMSProvider>
    </QueryClientProvider>
  </GoogleOAuthProvider>
);

export default App;