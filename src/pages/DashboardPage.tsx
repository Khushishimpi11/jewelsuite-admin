import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { Badge } from "@/components/ui/badge";
import {
  IndianRupee, ShoppingCart, Users, TrendingUp, Package,
  ArrowUpRight, Clock, AlertTriangle, Gem, BarChart3,
  Warehouse, PackageMinus, FolderTree, Receipt, Tag,
  Plus, Truck, CheckCircle2, Activity,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "@/assets/logo.png";

const salesData = [
  { name: "Mon", revenue: 42000 }, { name: "Tue", revenue: 58000 },
  { name: "Wed", revenue: 35000 }, { name: "Thu", revenue: 72000 },
  { name: "Fri", revenue: 89000 }, { name: "Sat", revenue: 95000 },
  { name: "Sun", revenue: 67000 },
];

const categoryData = [
  { name: "Rings", value: 35, color: "hsl(340, 65%, 20%)" },
  { name: "Necklaces", value: 28, color: "hsl(42, 60%, 51%)" },
  { name: "Earrings", value: 20, color: "hsl(340, 40%, 35%)" },
  { name: "Bracelets", value: 17, color: "hsl(330, 15%, 70%)" },
];

const topProducts = [
  { name: "Diamond Ring", sales: 52 },
  { name: "Temple Necklace", sales: 38 },
  { name: "Pearl Earrings", sales: 31 },
  { name: "Gold Bracelet", sales: 24 },
  { name: "Kundan Set", sales: 18 },
];

const recentOrders = [
  { id: "#JK-1234", customer: "Priya Sharma", amount: "₹45,200", status: "Delivered", time: "2h ago" },
  { id: "#JK-1235", customer: "Rahul Mehta", amount: "₹1,25,000", status: "Shipped", time: "4h ago" },
  { id: "#JK-1236", customer: "Anita Desai", amount: "₹32,800", status: "Processing", time: "5h ago" },
  { id: "#JK-1237", customer: "Vikram Singh", amount: "₹78,500", status: "Pending", time: "6h ago" },
  { id: "#JK-1238", customer: "Meera Joshi", amount: "₹56,200", status: "Delivered", time: "8h ago" },
];

const insights = [
  { icon: TrendingUp, text: "Gold price up 2.3% — review margins on 22K items", type: "warning" as const },
  { icon: Gem, text: "Top category this week: Rings (35% of sales)", type: "success" as const },
  { icon: AlertTriangle, text: "Sales dropped 12% in last 3 days vs prior week", type: "danger" as const },
];

const recentActivity = [
  { icon: Plus, text: "Diamond Solitaire Ring added to catalog", time: "10 min ago", color: "text-emerald-600" },
  { icon: ShoppingCart, text: "New order #JK-1240 placed by Priya S.", time: "25 min ago", color: "text-primary" },
  { icon: Truck, text: "Order #JK-1235 marked as Shipped", time: "1h ago", color: "text-blue-600" },
  { icon: CheckCircle2, text: "Order #JK-1234 delivered successfully", time: "2h ago", color: "text-emerald-600" },
  { icon: AlertTriangle, text: "Low stock alert: Gold Temple Necklace (3 left)", time: "3h ago", color: "text-amber-600" },
];

const statusColors: Record<string, string> = {
  Delivered: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Shipped: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Processing: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Pending: "bg-muted text-muted-foreground",
};

const brands = [
  { name: "Tanishq", products: 24 },
  { name: "Kalyan Jewellers", products: 18 },
  { name: "Malabar Gold", products: 31 },
  { name: "JewelsKart Original", products: 42 },
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

  const quickStats = [
    { label: "PRODUCTS", value: 11, sub: "11 items", icon: Package, to: "/products", color: "text-primary" },
    { label: "ORDERS", value: 15, sub: "1 pending", icon: ShoppingCart, to: "/orders", color: "text-primary" },
    { label: "OUT OF STOCK", value: 0, sub: "All stocked", icon: PackageMinus, to: "/inventory?filter=out", color: "text-emerald-600" },
    { label: "LOW STOCK", value: 0, sub: "Healthy", icon: AlertTriangle, to: "/inventory?filter=low", color: "text-amber-600" },
    { label: "CUSTOMERS", value: 4, sub: "Active users", icon: Users, to: "/customers", color: "text-primary" },
    { label: "CATEGORIES", value: 20, sub: "Active", icon: FolderTree, to: "/categories", color: "text-primary" },
  ];

  return (
    <motion.div className="space-y-8" variants={container} initial="hidden" animate="show">
      {/* Welcome Banner */}
      <motion.div variants={item}>
        <Card className="rounded-2xl overflow-hidden relative border-0 bg-gradient-to-r from-primary via-primary to-primary/80">
          <CardContent className="p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <img src={logo} alt="JewelsKart" className="h-14 w-14 object-contain hidden sm:block drop-shadow-lg" />
              <div>
                <p className="text-xs text-accent font-sans flex items-center gap-1 font-medium">
                  <Gem className="h-3 w-3" /> Welcome Back, Admin
                </p>
                <h1 className="text-3xl font-display font-bold mt-1 text-primary-foreground">
                  Welcome to Admin Dashboard
                </h1>
                <p className="text-primary-foreground/70 text-sm font-sans mt-1">
                  Manage your premium jewellery store with elegance
                </p>
              </div>
            </div>
            <Button className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg" onClick={() => navigate("/orders")}>
              <Receipt className="h-4 w-4" /> Generate Bill
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Revenue KPI Cards */}
      <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" variants={item}>
        {[
          { label: "Total Products", value: 11, icon: Package, sub: "In catalog", prefix: "" },
          { label: "Total Orders", value: 15, icon: ShoppingCart, sub: "1 pending", prefix: "" },
          { label: "Total Revenue", value: 46177, icon: IndianRupee, sub: "All time", prefix: "₹" },
          { label: "Total Brands", value: 4, icon: Tag, sub: "Active", prefix: "" },
        ].map((kpi) => (
          <Card
            key={kpi.label}
            className="glass-card card-hover rounded-2xl cursor-pointer group"
            onClick={() => navigate(kpi.label.includes("Revenue") ? "/revenue-details" : kpi.label.includes("Product") ? "/products" : kpi.label.includes("Order") ? "/orders" : "/brands")}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground font-sans font-medium">{kpi.label}</span>
                <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <kpi.icon className="h-5 w-5 text-primary" />
                </div>
              </div>
              <p className="text-3xl font-bold font-display">
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
            className="glass-card card-hover rounded-2xl cursor-pointer group"
            onClick={() => navigate(s.to)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-sans font-medium">{s.label}</span>
                <s.icon className={`h-5 w-5 ${s.color} opacity-70 group-hover:opacity-100 transition-opacity`} />
              </div>
              <p className="text-2xl font-bold font-display">{s.value}</p>
              <p className="text-xs text-accent flex items-center gap-1 mt-1 font-medium">
                <ArrowUpRight className="h-3 w-3" />{s.sub}
              </p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Charts Row */}
      <motion.div className="grid grid-cols-1 lg:grid-cols-3 gap-4" variants={item}>
        <Card className="lg:col-span-2 glass-card rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-accent" /> Revenue Trend
              <span className="text-xs text-muted-foreground font-sans font-normal ml-1">Last 7 days</span>
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
                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid hsl(330, 15%, 88%)" }} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(340, 65%, 20%)" strokeWidth={2} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display">Orders by Status</CardTitle>
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
                <div key={c.name} className="flex items-center gap-2 text-xs font-sans">
                  <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                  <span className="text-muted-foreground">{c.name}</span>
                  <span className="ml-auto font-medium">{c.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Top Selling Products Bar Chart */}
      <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-4" variants={item}>
        <Card className="glass-card rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display flex items-center gap-2">
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
        <Card className="glass-card rounded-2xl">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-display flex items-center gap-2">
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
        <Card className="glass-card rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-accent" /> Smart Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights.map((insight, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 p-3 rounded-xl text-sm font-sans ${
                  insight.type === "warning" ? "bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300"
                    : insight.type === "success" ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300"
                    : "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                }`}
              >
                <insight.icon className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{insight.text}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 glass-card rounded-2xl cursor-pointer" onClick={() => navigate("/orders")}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-sans">
                <thead>
                  <tr className="text-muted-foreground text-xs border-b">
                    <th className="text-left py-2.5 font-medium">Order</th>
                    <th className="text-left py-2.5 font-medium">Customer</th>
                    <th className="text-left py-2.5 font-medium">Amount</th>
                    <th className="text-left py-2.5 font-medium">Status</th>
                    <th className="text-right py-2.5 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b last:border-0 hover:bg-secondary/30 transition-colors">
                      <td className="py-3 font-medium">{order.id}</td>
                      <td className="py-3">{order.customer}</td>
                      <td className="py-3 font-medium">{order.amount}</td>
                      <td className="py-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[order.status]}`}>{order.status}</span>
                      </td>
                      <td className="py-3 text-right text-muted-foreground text-xs">
                        <Clock className="h-3 w-3 inline mr-1" />{order.time}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      <motion.div variants={item}>
        <Card className="glass-card rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display flex items-center gap-2">
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
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{act.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
