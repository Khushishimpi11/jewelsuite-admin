import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { IndianRupee, TrendingUp, ArrowUpRight, Calendar } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from "recharts";

const dailyData = [
  { day: "Mon", revenue: 42000 }, { day: "Tue", revenue: 58000 }, { day: "Wed", revenue: 35000 },
  { day: "Thu", revenue: 72000 }, { day: "Fri", revenue: 89000 }, { day: "Sat", revenue: 95000 }, { day: "Sun", revenue: 67000 },
];

const monthlyTrend = [
  { month: "Oct", revenue: 320000 }, { month: "Nov", revenue: 450000 }, { month: "Dec", revenue: 680000 },
  { month: "Jan", revenue: 520000 }, { month: "Feb", revenue: 410000 }, { month: "Mar", revenue: 458000 },
];

const sourceData = [
  { name: "Website", value: 55, color: "hsl(340, 65%, 20%)" },
  { name: "In-Store", value: 30, color: "hsl(42, 60%, 51%)" },
  { name: "WhatsApp", value: 15, color: "hsl(340, 40%, 35%)" },
];

export default function RevenueDetailsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Revenue Details</h1>
        <p className="text-muted-foreground text-sm font-sans">Detailed revenue analytics & breakdown</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Today's Revenue", value: 0, sub: "Orders + Bills" },
          { label: "This Week", value: 0, sub: "+8%" },
          { label: "This Month", value: 458000, sub: "85% of goal" },
          { label: "Total Revenue", value: 4617700, sub: "All time" },
        ].map(s => (
          <Card key={s.label} className="glass-card rounded-xl card-hover">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <IndianRupee className="h-4 w-4 text-primary" />
                </div>
              </div>
              <p className="text-2xl font-bold font-display">
                <AnimatedCounter target={s.value} prefix="₹" />
              </p>
              <p className="text-xs text-accent mt-1 flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" />{s.sub}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="glass-card rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display">30-Day Sales Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={monthlyTrend}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(340, 65%, 20%)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(340, 65%, 20%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(330, 15%, 88%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: "12px" }} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(340, 65%, 20%)" strokeWidth={2} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display">Revenue by Source</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={sourceData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={4}>
                  {sourceData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {sourceData.map(s => (
                <div key={s.name} className="flex items-center gap-2 text-xs font-sans">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                  <span>{s.name} {s.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card rounded-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-display">Daily Breakdown (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(330, 15%, 88%)" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: "12px" }} />
              <Bar dataKey="revenue" fill="hsl(42, 60%, 51%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
