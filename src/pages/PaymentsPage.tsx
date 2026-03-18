import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IndianRupee, ArrowUpRight, Clock, CheckCircle2, XCircle, CreditCard } from "lucide-react";
import { AnimatedCounter } from "@/components/AnimatedCounter";

const transactions = [
  { id: "TXN-001", orderId: "#JK-1234", customer: "Priya Sharma", amount: "₹45,200", method: "UPI", status: "Success", date: "Mar 15, 2026" },
  { id: "TXN-002", orderId: "#JK-1235", customer: "Rahul Mehta", amount: "₹1,25,000", method: "Card", status: "Success", date: "Mar 15, 2026" },
  { id: "TXN-003", orderId: "#JK-1236", customer: "Anita Desai", amount: "₹32,800", method: "Net Banking", status: "Pending", date: "Mar 14, 2026" },
  { id: "TXN-004", orderId: "#JK-1239", customer: "Arjun Kapoor", amount: "₹92,000", method: "Card", status: "Refunded", date: "Mar 13, 2026" },
  { id: "TXN-005", orderId: "#JK-1238", customer: "Meera Joshi", amount: "₹56,200", method: "UPI", status: "Success", date: "Mar 13, 2026" },
];

const statusColors: Record<string, string> = {
  Success: "bg-emerald-100 text-emerald-700",
  Pending: "bg-amber-100 text-amber-700",
  Refunded: "bg-red-100 text-red-700",
};

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Payments</h1>
        <p className="text-muted-foreground text-sm font-sans">Payment tracking & transactions</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Received", value: 258200, icon: IndianRupee, color: "text-emerald-600" },
          { label: "Pending", value: 32800, icon: Clock, color: "text-amber-600" },
          { label: "Refunds", value: 92000, icon: XCircle, color: "text-destructive" },
        ].map((s) => (
          <Card key={s.label} className="glass-card rounded-xl card-hover">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <p className="text-2xl font-bold font-display">
                <AnimatedCounter target={s.value} prefix="₹" />
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass-card rounded-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-display">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-sans">
              <thead>
                <tr className="text-muted-foreground text-xs border-b">
                  <th className="text-left py-3 font-medium">Transaction ID</th>
                  <th className="text-left py-3 font-medium">Order</th>
                  <th className="text-left py-3 font-medium hidden md:table-cell">Customer</th>
                  <th className="text-left py-3 font-medium">Amount</th>
                  <th className="text-left py-3 font-medium hidden sm:table-cell">Method</th>
                  <th className="text-left py-3 font-medium">Status</th>
                  <th className="text-left py-3 font-medium hidden md:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id} className="border-b last:border-0 hover:bg-secondary/30 transition-colors">
                    <td className="py-3 font-medium">{t.id}</td>
                    <td className="py-3 text-muted-foreground">{t.orderId}</td>
                    <td className="py-3 hidden md:table-cell">{t.customer}</td>
                    <td className="py-3 font-medium">{t.amount}</td>
                    <td className="py-3 hidden sm:table-cell">
                      <span className="flex items-center gap-1"><CreditCard className="h-3 w-3" />{t.method}</span>
                    </td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[t.status]}`}>{t.status}</span>
                    </td>
                    <td className="py-3 text-muted-foreground hidden md:table-cell">{t.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
