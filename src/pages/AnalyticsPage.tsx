import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell,
} from "recharts";

const revenueData = [
  { month: "Oct", revenue: 320000 },
  { month: "Nov", revenue: 410000 },
  { month: "Dec", revenue: 580000 },
  { month: "Jan", revenue: 390000 },
  { month: "Feb", revenue: 450000 },
  { month: "Mar", revenue: 520000 },
];

const categoryPerf = [
  { name: "Rings", revenue: 185000, orders: 52 },
  { name: "Necklaces", revenue: 145000, orders: 28 },
  { name: "Earrings", revenue: 92000, orders: 41 },
  { name: "Bracelets", revenue: 68000, orders: 22 },
  { name: "Sets", revenue: 125000, orders: 8 },
];

const conversionData = [
  { name: "Visitors", value: 12400 },
  { name: "Cart Added", value: 3200 },
  { name: "Checkout", value: 1800 },
  { name: "Purchased", value: 850 },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Analytics</h1>
        <p className="text-muted-foreground text-sm font-sans">Advanced performance insights</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="glass-card rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display">Revenue Trend (6 months)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(330, 15%, 88%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 12 }} />
                <Line type="monotone" dataKey="revenue" stroke="hsl(340, 65%, 20%)" strokeWidth={2} dot={{ fill: "hsl(42, 60%, 51%)", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display">Category Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={categoryPerf}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(330, 15%, 88%)" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 12 }} />
                <Bar dataKey="revenue" fill="hsl(340, 65%, 20%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display">Conversion Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {conversionData.map((step, i) => {
                const maxVal = conversionData[0].value;
                const pct = (step.value / maxVal) * 100;
                return (
                  <div key={step.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-sans">{step.name}</span>
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
                    {i < conversionData.length - 1 && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {((conversionData[i + 1].value / step.value) * 100).toFixed(1)}% conversion
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display">Customer Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={[
                { month: "Oct", customers: 1800 },
                { month: "Nov", customers: 2050 },
                { month: "Dec", customers: 2300 },
                { month: "Jan", customers: 2480 },
                { month: "Feb", customers: 2650 },
                { month: "Mar", customers: 2840 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(330, 15%, 88%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 12 }} />
                <Line type="monotone" dataKey="customers" stroke="hsl(42, 60%, 51%)" strokeWidth={2} dot={{ fill: "hsl(340, 65%, 20%)", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
