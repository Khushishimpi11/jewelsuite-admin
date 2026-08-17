import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import {
  IndianRupee, ShoppingCart, Users, TrendingUp, Package,
  ArrowUpRight, Clock, AlertTriangle, Gem, BarChart3,
  PackageMinus, FolderTree, Receipt, Tag, CheckCircle2,
  Activity,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "@/assets/logoicon.png";
import { useJewelleryCMS } from "@/context/JewelleryCMSContext";
import { useEffect, useState } from "react";

// Status colors for orders
const statusColors: Record<string, string> = {
  Delivered: "bg-emerald-100 text-emerald-700",
  Shipped: "bg-blue-100 text-blue-700",
  "Out for Delivery": "bg-purple-100 text-purple-700",
  Processing: "bg-amber-100 text-amber-700",
  Confirmed: "bg-indigo-100 text-indigo-700",
  Pending: "bg-gray-100 text-gray-700",
  Cancelled: "bg-red-100 text-red-700",
};

const categoryColors = [
  "hsl(340, 65%, 20%)",
  "hsl(42, 60%, 51%)",
  "hsl(340, 40%, 35%)",
  "hsl(330, 15%, 70%)",
  "hsl(200, 70%, 45%)",
  "hsl(120, 50%, 45%)",
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function DashboardPage() {
  const navigate = useNavigate();
  
  const {
    products,
    orders,
    customers,
    getTotalRevenue,
    getProductCount,
    getTotalOrders,
    getTotalCustomers,
    getCategoryCount,
    loading,
    error,
  } = useJewelleryCMS();

  const [salesData, setSalesData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);

  const totalProducts = getProductCount();
  const totalOrders = getTotalOrders();
  const totalRevenue = getTotalRevenue();
  const totalCustomers = getTotalCustomers();
  const totalCategories = getCategoryCount();
  const unavailableCount = products.filter(p => (p as any).isAvailableForOrder === false).length;
  const pendingOrders = orders.filter(o => o.status === "Pending" || o.status === "pending").length;

  // Generate sales data from real orders
  useEffect(() => {
    if (orders.length > 0) {
      const last7Days = [...Array(7)].map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toLocaleDateString('en-IN', { weekday: 'short' });
      }).reverse();
      
      const salesByDay = last7Days.map(day => {
        const dayOrders = orders.filter(order => {
          const orderDate = new Date(order.createdAt || order.date).toLocaleDateString('en-IN', { weekday: 'short' });
          return orderDate === day && order.status !== "Cancelled";
        });
        const revenue = dayOrders.reduce((sum, o) => sum + (o.total || o.totalAmount || 0), 0);
        return { name: day, revenue };
      });
      
      setSalesData(salesByDay);
    }
  }, [orders]);

  // Generate category data from real products
  useEffect(() => {
    if (products.length > 0) {
      const categoryCount: Record<string, number> = {};
      products.forEach(product => {
        const catName = product.category || "Uncategorized";
        categoryCount[catName] = (categoryCount[catName] || 0) + 1;
      });
      
      const catData = Object.entries(categoryCount).map(([name, count], index) => ({
        name,
        value: Math.round((count / products.length) * 100),
        color: categoryColors[index % categoryColors.length]
      }));
      setCategoryData(catData);
    }
  }, [products]);

  // Generate top selling products from real orders
  useEffect(() => {
    if (orders.length > 0) {
      const productSales: Record<string, number> = {};
      orders.forEach(order => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach((item: any) => {
            const productName = item.name || item.productName;
            if (productName) {
              productSales[productName] = (productSales[productName] || 0) + (item.quantity || 1);
            }
          });
        }
      });
      
      const top5 = Object.entries(productSales)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, sales]) => ({ name: name.length > 20 ? name.slice(0, 20) + '...' : name, sales }));
      
      setTopProducts(top5);
    }
  }, [orders]);

  // Generate recent orders from real data
  useEffect(() => {
    if (orders.length > 0) {
      const recent = orders.slice(0, 5).map(order => ({
        id: order.orderNumber || order.id?.slice(-8) || "#N/A",
        customer: order.customerName || "Guest",
        amount: `₹${(order.total || order.totalAmount || 0).toLocaleString()}`,
        status: order.status || "Pending",
        date: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"
      }));
      setRecentOrders(recent);
    }
  }, [orders]);

  // Generate brands from real products
  useEffect(() => {
    if (products.length > 0) {
      const brandCount: Record<string, number> = {};
      products.forEach(product => {
        const brand = product.brand || "JewelsKart Original";
        brandCount[brand] = (brandCount[brand] || 0) + 1;
      });
      
      const brandList = Object.entries(brandCount).map(([name, count]) => ({
        name,
        products: count
      }));
      setBrands(brandList);
    }
  }, [products]);

  // Generate insights from real data
  useEffect(() => {
    const newInsights = [];
    
    if (unavailableCount > 0) {
      newInsights.push({
        icon: AlertTriangle,
        text: `${unavailableCount} products marked as Currently Unavailable`,
        type: "warning"
      });
    }
    
    if (categoryData.length > 0) {
      const topCategory = categoryData.reduce((max, cat) => cat.value > max.value ? cat : max, categoryData[0]);
      newInsights.push({
        icon: Gem,
        text: `Top category: ${topCategory.name} (${topCategory.value}% of products)`,
        type: "success"
      });
    }
    
    if (pendingOrders > 0) {
      newInsights.push({
        icon: Clock,
        text: `${pendingOrders} pending orders need attention`,
        type: "warning"
      });
    }
    
    if (newInsights.length === 0) {
      newInsights.push({
        icon: TrendingUp,
        text: "All systems operational. Store is running smoothly!",
        type: "success"
      });
    }
    
    setInsights(newInsights);
  }, [unavailableCount, categoryData, pendingOrders]);

  // Generate recent activity from real data
  useEffect(() => {
    const activity = [];
    
    if (orders.length > 0) {
      const lastOrder = orders[0];
      if (lastOrder) {
        activity.push({
          icon: ShoppingCart,
          text: `New order ${lastOrder.orderNumber || lastOrder.id?.slice(-8)} placed`,
          date: lastOrder.createdAt ? new Date(lastOrder.createdAt).toLocaleDateString() : "Recently",
          color: "text-primary"
        });
      }
    }
    
    setRecentActivity(activity.slice(0, 5));
  }, [orders]);

  // Quick stats with navigation
  const quickStats = [
    { label: "PRODUCTS", value: totalProducts, sub: `${totalProducts} items`, icon: Package, to: "/products", color: "text-primary" },
    { label: "ORDERS", value: totalOrders, sub: `${pendingOrders} pending`, icon: ShoppingCart, to: "/orders", color: "text-primary" },
    { label: "UNAVAILABLE", value: products.filter(p => (p as any).isAvailableForOrder === false).length, sub: products.filter(p => (p as any).isAvailableForOrder === false).length === 0 ? "All Available" : `${products.filter(p => (p as any).isAvailableForOrder === false).length} disabled`, icon: PackageMinus, to: "/inventory?filter=out", color: products.filter(p => (p as any).isAvailableForOrder === false).length === 0 ? "text-emerald-600" : "text-red-500" },
    { label: "MADE TO ORDER", value: products.filter(p => (p as any).isAvailableForOrder !== false).length, sub: "Ready for order", icon: CheckCircle2, to: "/inventory", color: "text-emerald-600" },
    { label: "CUSTOMERS", value: totalCustomers, sub: "Active users", icon: Users, to: "/customers", color: "text-primary" },
    { label: "CATEGORIES", value: totalCategories, sub: "Active", icon: FolderTree, to: "/categories", color: "text-primary" },
  ];

  const revenueKPIs = [
    { label: "Total Products", value: totalProducts, icon: Package, sub: "In catalog", prefix: "" },
    { label: "Total Orders", value: totalOrders, icon: ShoppingCart, sub: `${pendingOrders} pending`, prefix: "" },
    { label: "Total Revenue", value: totalRevenue, icon: IndianRupee, sub: "All time", prefix: "₹" },
    { label: "Total Brands", value: brands.length, icon: Tag, sub: "Active", prefix: "" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive font-medium mb-2">Error loading data</p>
          <p className="text-muted-foreground text-sm">{error}</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div className="space-y-8 p-6" variants={container} initial="hidden" animate="show">
      {/* Welcome Banner */}
      <motion.div variants={item}>
        <Card className="rounded-2xl overflow-hidden border-0 bg-gradient-to-r from-primary via-primary to-primary/80">
          <CardContent className="p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div>
                <p className="text-xs text-white flex items-center gap-1 font-medium">
                  <img src={logo} alt="logo" className="h-5 w-5 object-contain" />
                  Welcome Back, Admin
                </p>
                <h1 className="text-3xl font-bold mt-1 text-white">
                  Welcome to Admin Dashboard
                </h1>
                <p className="text-white/70 text-sm mt-1">
                  Manage your premium jewellery store with elegance
                </p>
                <p className="text-white/60 text-xs mt-2">
                  {totalProducts} Products • {totalOrders} Orders • {totalCustomers} Customers
                </p>
              </div>
            </div>
            <Button className="gap-2 bg-white text-primary hover:bg-white/90 shadow-lg" onClick={() => navigate("/orders")}>
              <Receipt className="h-4 w-4" /> Manage Orders
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Revenue KPI Cards */}
      <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" variants={item}>
        {revenueKPIs.map((kpi) => (
          <Card
            key={kpi.label}
            className="cursor-pointer hover:shadow-lg transition-shadow rounded-2xl"
            onClick={() => {
              if (kpi.label.includes("Revenue")) navigate("/revenue-details");
              else if (kpi.label.includes("Product")) navigate("/products");
              else if (kpi.label.includes("Order")) navigate("/orders");
              else navigate("/brands");
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground font-medium">{kpi.label}</span>
                <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
                  <kpi.icon className="h-5 w-5 text-primary" />
                </div>
              </div>
              <p className="text-3xl font-bold">
                <AnimatedCounter target={kpi.value} prefix={kpi.prefix} />
              </p>
              <p className="text-xs text-accent mt-1.5 flex items-center gap-1 font-medium">
                <ArrowUpRight className="h-3 w-3" />{kpi.sub}
              </p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Quick Stats Navigation Cards */}
      <motion.div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3" variants={item}>
        {quickStats.map((s) => (
          <Card
            key={s.label}
            className="cursor-pointer hover:shadow-md transition-shadow rounded-2xl"
            onClick={() => navigate(s.to)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{s.label}</span>
                <s.icon className={`h-5 w-5 ${s.color} opacity-70`} />
              </div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-accent flex items-center gap-1 mt-1 font-medium">
                <ArrowUpRight className="h-3 w-3" />{s.sub}
              </p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Charts Row */}
      <motion.div className="grid grid-cols-1 lg:grid-cols-3 gap-4" variants={item}>
        <Card className="lg:col-span-2 rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-accent" /> Revenue Trend
              <span className="text-xs text-muted-foreground font-normal ml-1">Last 7 days</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(340, 65%, 20%)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(340, 65%, 20%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(330, 15%, 88%)" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(340, 10%, 45%)" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(340, 10%, 45%)" />
                <Tooltip contentStyle={{ borderRadius: "12px" }} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(340, 65%, 20%)" strokeWidth={2} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Products by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={210}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={4}>
                  {categoryData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-3">
              {categoryData.map((c) => (
                <div key={c.name} className="flex items-center gap-2 text-xs">
                  <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                  <span className="text-muted-foreground">{c.name}</span>
                  <span className="ml-auto font-medium">{c.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Top Selling Products */}
      <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-4" variants={item}>
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-accent" /> Top Selling Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(330, 15%, 88%)" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={100} />
                <Tooltip contentStyle={{ borderRadius: "12px" }} />
                <Bar dataKey="sales" fill="hsl(42, 60%, 51%)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Brands Overview */}
        <Card className="rounded-2xl">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Tag className="h-4 w-4 text-accent" /> Brands Overview
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate("/brands")}>View All</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {brands.map((b) => (
                <div key={b.name} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/40 hover:bg-secondary/70 transition-colors cursor-pointer" onClick={() => navigate("/brands")}>
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Tag className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{b.name}</p>
                    <p className="text-xs text-muted-foreground">{b.products} Products</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Insights + Recent Orders */}
      <motion.div className="grid grid-cols-1 lg:grid-cols-3 gap-4" variants={item}>
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-accent" /> Smart Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights.map((insight, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 p-3 rounded-xl text-sm ${
                  insight.type === "warning" ? "bg-amber-50 text-amber-800" :
                  insight.type === "success" ? "bg-emerald-50 text-emerald-800" :
                  "bg-red-50 text-red-800"
                }`}
              >
                <insight.icon className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{insight.text}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Orders with View All Button */}
        <Card className="lg:col-span-2 rounded-2xl">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Orders</CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate("/orders")}
              className="gap-1"
            >
              View All Orders
              <ArrowUpRight className="h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground text-xs border-b">
                    <th className="text-left py-2.5 font-medium">Order</th>
                    <th className="text-left py-2.5 font-medium">Customer</th>
                    <th className="text-left py-2.5 font-medium">Amount</th>
                    <th className="text-left py-2.5 font-medium">Status</th>
                    <th className="text-right py-2.5 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr 
                      key={order.id} 
                      className="border-b last:border-0 hover:bg-secondary/30 transition-colors cursor-pointer"
                      onClick={() => navigate("/orders")}
                    >
                      <td className="py-3 font-medium">{order.id}</td>
                      <td className="py-3">{order.customer}</td>
                      <td className="py-3 font-medium">{order.amount}</td>
                      <td className="py-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[order.status] || statusColors.Pending}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 text-right text-muted-foreground text-xs">
                        <Clock className="h-3 w-3 inline mr-1" />{order.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {recentOrders.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No orders yet
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      <motion.div variants={item}>
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-accent" /> Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {recentActivity.map((act, i) => (
                <div key={i} className="flex items-center gap-3 py-3 border-b last:border-0">
                  <div className={`h-8 w-8 rounded-lg bg-secondary flex items-center justify-center shrink-0 ${act.color}`}>
                    <act.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{act.text}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{act.date}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}