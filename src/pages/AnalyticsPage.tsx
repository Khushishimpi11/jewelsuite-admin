import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell,
} from "recharts";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useJewelleryCMS } from "@/context/JewelleryCMSContext";
import { IndianRupee, TrendingUp, Users, ShoppingBag, Package } from "lucide-react";
import { AnimatedCounter } from "@/components/AnimatedCounter";

export default function AnalyticsPage() {
  const { 
    orders, 
    products, 
    customers,
    getSalesData,
    getTopSellingProducts,
    getTotalRevenue,
    getTotalOrders,
    getTotalCustomers,
    getProductCount,
    loading,
    error
  } = useJewelleryCMS();
  
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [categoryPerf, setCategoryPerf] = useState<any[]>([]);
  const [customerGrowth, setCustomerGrowth] = useState<any[]>([]);
  const [conversionData, setConversionData] = useState<any[]>([]);

  // Calculate revenue trend from sales data
  useEffect(() => {
    const salesData = getSalesData();
    setRevenueData(salesData.map(item => ({
      month: item.date,
      revenue: item.revenue
    })));
  }, [orders]);

  // Calculate category performance
  useEffect(() => {
    const categoryMap = new Map<string, { revenue: number; orders: number }>();
    
    orders.forEach(order => {
      order.products.forEach(product => {
        const productData = products.find(p => p.id === product.productId);
        if (productData) {
          const category = productData.category;
          const existing = categoryMap.get(category);
          const revenue = product.price * product.quantity;
          
          if (existing) {
            existing.revenue += revenue;
            existing.orders += product.quantity;
          } else {
            categoryMap.set(category, { revenue, orders: product.quantity });
          }
        }
      });
    });
    
    const categoryArray = Array.from(categoryMap.entries())
      .map(([name, data]) => ({ name, revenue: data.revenue, orders: data.orders }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
    
    setCategoryPerf(categoryArray);
  }, [orders, products]);

  // Calculate customer growth (based on customer creation dates)
  useEffect(() => {
    const monthMap = new Map<string, number>();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    customers.forEach(customer => {
      const date = new Date(customer.createdAt);
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      const key = `${month} ${year}`;
      monthMap.set(key, (monthMap.get(key) || 0) + 1);
    });
    
    let cumulative = 0;
    const growthData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = months[date.getMonth()];
      const key = `${month} ${date.getFullYear()}`;
      cumulative += monthMap.get(key) || 0;
      growthData.push({ month, customers: cumulative });
    }
    
    setCustomerGrowth(growthData);
  }, [customers]);

  // Calculate conversion funnel
  useEffect(() => {
    // Get unique visitors (estimated from customers who placed orders)
    const totalVisitors = customers.length + (customers.length * 0.5); // Estimate
    const cartAdded = orders.length * 1.2; // Estimate
    const checkout = orders.length * 0.9; // Estimate
    const purchased = orders.length;
    
    setConversionData([
      { name: "Visitors", value: Math.round(totalVisitors) },
      { name: "Cart Added", value: Math.round(cartAdded) },
      { name: "Checkout", value: Math.round(checkout) },
      { name: "Purchased", value: purchased },
    ]);
  }, [customers, orders]);

  const totalRevenue = getTotalRevenue();
  const totalOrders = getTotalOrders();
  const totalCustomers = getTotalCustomers();
  const totalProducts = getProductCount();

  // Colors for charts
  const COLORS = ["hsl(340, 65%, 20%)", "hsl(42, 60%, 51%)", "hsl(340, 40%, 35%)", "hsl(330, 15%, 70%)"];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-destructive text-6xl mb-4">⚠️</div>
          <p className="text-destructive font-medium mb-2">Error loading analytics</p>
          <p className="text-muted-foreground text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div className="space-y-6 p-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div>
        <h1 className="text-3xl font-display font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground text-sm font-sans">Advanced performance insights from your store</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: totalRevenue, prefix: "₹", icon: IndianRupee, color: "text-emerald-600" },
          { label: "Total Orders", value: totalOrders, icon: ShoppingBag, color: "text-primary" },
          { label: "Total Customers", value: totalCustomers, icon: Users, color: "text-blue-600" },
          { label: "Total Products", value: totalProducts, icon: Package, color: "text-purple-600" },
        ].map((s) => (
          <Card key={s.label} className="glass-card rounded-2xl card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground font-medium">{s.label}</span>
                <div className={`h-11 w-11 rounded-xl bg-secondary flex items-center justify-center ${s.color}`}>
                  <s.icon className="h-5 w-5" />
                </div>
              </div>
              <p className="text-3xl font-bold font-display">
                <AnimatedCounter target={s.value} prefix={s.prefix} />
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue Trend Chart */}
        <Card className="glass-card rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-accent" />
              Revenue Trend (Last 6 months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(330, 15%, 88%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `₹${(value / 1000)}k`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: 12, border: "1px solid hsl(330, 15%, 88%)" }}
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, "Revenue"]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="hsl(340, 65%, 20%)" 
                    strokeWidth={2} 
                    dot={{ fill: "hsl(42, 60%, 51%)", r: 4 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <p>No revenue data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Performance Chart */}
        <Card className="glass-card rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display">Category Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryPerf.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={categoryPerf}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(330, 15%, 88%)" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `₹${(value / 1000)}k`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: 12 }}
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, "Revenue"]}
                  />
                  <Bar dataKey="revenue" fill="hsl(340, 65%, 20%)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <p>No category data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Conversion Funnel */}
        <Card className="glass-card rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display">Conversion Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {conversionData.map((step, i) => {
                const maxVal = conversionData[0]?.value || 1;
                const pct = (step.value / maxVal) * 100;
                const prevValue = i > 0 ? conversionData[i - 1].value : step.value;
                const conversionRate = i > 0 ? ((step.value / prevValue) * 100).toFixed(1) : null;
                
                return (
                  <div key={step.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-sans font-medium">{step.name}</span>
                      <span className="font-medium">{step.value.toLocaleString()}</span>
                    </div>
                    <div className="h-3 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${pct}%`,
                          background: `linear-gradient(90deg, hsl(340, 65%, 20%), hsl(42, 60%, 51%))`,
                        }}
                      />
                    </div>
                    {conversionRate && (
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {conversionRate}% conversion from {step.name === "Cart Added" ? "Visitors" : 
                          step.name === "Checkout" ? "Cart Added" : 
                          step.name === "Purchased" ? "Checkout" : ""}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-3 border-t text-center text-xs text-muted-foreground">
              Overall Conversion Rate: {((conversionData[3]?.value / conversionData[0]?.value) * 100 || 0).toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        {/* Customer Growth Chart */}
        <Card className="glass-card rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <Users className="h-4 w-4 text-accent" />
              Customer Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            {customerGrowth.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={customerGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(330, 15%, 88%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: 12 }}
                    formatter={(value: number) => [value.toLocaleString(), "Total Customers"]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="customers" 
                    stroke="hsl(42, 60%, 51%)" 
                    strokeWidth={2} 
                    dot={{ fill: "hsl(340, 65%, 20%)", r: 4 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <p>No customer growth data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="glass-card rounded-xl">
          <CardHeader>
            <CardTitle className="text-base font-display">Top Performing Products</CardTitle>
          </CardHeader>
          <CardContent>
            {getTopSellingProducts(5).length > 0 ? (
              <div className="space-y-3">
                {getTopSellingProducts(5).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                    <div>
                      <p className="font-medium text-sm">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">SKU: {item.product.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary text-sm">{item.totalSold} units</p>
                      <p className="text-xs text-muted-foreground">₹{item.revenue.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No sales data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card rounded-xl">
          <CardHeader>
            <CardTitle className="text-base font-display">Order Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-secondary/30 text-center">
                  <p className="text-xs text-muted-foreground">Average Order Value</p>
                  <p className="text-xl font-bold text-primary">
                    ₹{(totalRevenue / (totalOrders || 1)).toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/30 text-center">
                  <p className="text-xs text-muted-foreground">Orders per Customer</p>
                  <p className="text-xl font-bold text-primary">
                    {(totalOrders / (totalCustomers || 1)).toFixed(1)}
                  </p>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-secondary/30">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Online Orders</span>
                  <span className="font-medium">{orders.filter(o => o.transactionType === "online").length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">POS Orders</span>
                  <span className="font-medium">{orders.filter(o => o.transactionType === "pos").length}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}