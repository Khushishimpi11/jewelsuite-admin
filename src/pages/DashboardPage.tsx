import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { Badge } from "@/components/ui/badge";
import {
  IndianRupee,
  ShoppingCart,
  Users,
  TrendingUp,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  AlertTriangle,
  Gem,
  BarChart3,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const salesData = [
  { name: "Mon", revenue: 42000, orders: 12 },
  { name: "Tue", revenue: 58000, orders: 18 },
  { name: "Wed", revenue: 35000, orders: 9 },
  { name: "Thu", revenue: 72000, orders: 24 },
  { name: "Fri", revenue: 89000, orders: 31 },
  { name: "Sat", revenue: 95000, orders: 28 },
  { name: "Sun", revenue: 67000, orders: 19 },
];

const categoryData = [
  { name: "Rings", value: 35, color: "hsl(340, 65%, 20%)" },
  { name: "Necklaces", value: 28, color: "hsl(42, 60%, 51%)" },
  { name: "Earrings", value: 20, color: "hsl(340, 40%, 35%)" },
  { name: "Bracelets", value: 17, color: "hsl(330, 15%, 70%)" },
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

const statusColors: Record<string, string> = {
  Delivered: "bg-emerald-100 text-emerald-700",
  Shipped: "bg-blue-100 text-blue-700",
  Processing: "bg-amber-100 text-amber-700",
  Pending: "bg-muted text-muted-foreground",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm font-sans">Welcome back to JewelsKart CMS</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: 458000, prefix: "₹", icon: IndianRupee, change: "+12.5%", up: true },
          { label: "Orders", value: 141, icon: ShoppingCart, change: "+8.2%", up: true },
          { label: "Customers", value: 2840, icon: Users, change: "+5.1%", up: true },
          { label: "Avg Order Value", value: 32400, prefix: "₹", icon: TrendingUp, change: "-2.3%", up: false },
        ].map((kpi) => (
          <Card key={kpi.label} className="glass-card card-hover rounded-xl">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground font-sans">{kpi.label}</span>
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <kpi.icon className="h-4 w-4 text-primary" />
                </div>
              </div>
              <p className="text-2xl font-bold font-display">
                <AnimatedCounter target={kpi.value} prefix={kpi.prefix} />
              </p>
              <div className="flex items-center gap-1 mt-1">
                {kpi.up ? (
                  <ArrowUpRight className="h-3 w-3 text-emerald-600" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-destructive" />
                )}
                <span className={`text-xs font-sans ${kpi.up ? "text-emerald-600" : "text-destructive"}`}>
                  {kpi.change} vs last week
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 glass-card rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display">Sales Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
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
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid hsl(330, 15%, 88%)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(340, 65%, 20%)"
                  strokeWidth={2}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display">Category Split</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={4}>
                  {categoryData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {categoryData.map((c) => (
                <div key={c.name} className="flex items-center gap-2 text-xs font-sans">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="text-muted-foreground">{c.name}</span>
                  <span className="ml-auto font-medium">{c.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Smart Insights */}
        <Card className="glass-card rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-accent" />
              Smart Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights.map((insight, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 p-3 rounded-lg text-sm font-sans ${
                  insight.type === "warning"
                    ? "bg-amber-50 text-amber-800"
                    : insight.type === "success"
                    ? "bg-emerald-50 text-emerald-800"
                    : "bg-red-50 text-red-800"
                }`}
              >
                <insight.icon className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{insight.text}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="lg:col-span-2 glass-card rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-sans">
                <thead>
                  <tr className="text-muted-foreground text-xs border-b">
                    <th className="text-left py-2 font-medium">Order</th>
                    <th className="text-left py-2 font-medium">Customer</th>
                    <th className="text-left py-2 font-medium">Amount</th>
                    <th className="text-left py-2 font-medium">Status</th>
                    <th className="text-right py-2 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b last:border-0 hover:bg-secondary/30 transition-colors">
                      <td className="py-2.5 font-medium">{order.id}</td>
                      <td className="py-2.5">{order.customer}</td>
                      <td className="py-2.5 font-medium">{order.amount}</td>
                      <td className="py-2.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[order.status]}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-right text-muted-foreground text-xs">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {order.time}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
