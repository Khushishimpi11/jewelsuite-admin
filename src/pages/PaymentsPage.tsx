import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { IndianRupee, Clock, CheckCircle2, XCircle, CreditCard, Eye, FileText } from "lucide-react";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { useState } from "react";
import { motion } from "framer-motion";

interface Transaction {
  id: string; orderId: string; customer: string; amount: string; method: string; status: string; date: string;
  product: string; brand: string; qty: number; image: string;
}

const transactions: Transaction[] = [
  { id: "TXN-001", orderId: "#JK-1234", customer: "Priya Sharma", amount: "₹45,200", method: "UPI", status: "Success", date: "Mar 15, 2026", product: "Diamond Ring", brand: "Tanishq", qty: 1, image: "💍" },
  { id: "TXN-002", orderId: "#JK-1235", customer: "Rahul Mehta", amount: "₹1,25,000", method: "Card", status: "Success", date: "Mar 15, 2026", product: "Temple Necklace", brand: "Malabar Gold", qty: 1, image: "📿" },
  { id: "TXN-003", orderId: "#JK-1236", customer: "Anita Desai", amount: "₹32,800", method: "Net Banking", status: "Pending", date: "Mar 14, 2026", product: "Pearl Earrings", brand: "Kalyan", qty: 2, image: "✨" },
  { id: "TXN-004", orderId: "#JK-1239", customer: "Arjun Kapoor", amount: "₹92,000", method: "Card", status: "Failed", date: "Mar 13, 2026", product: "Kundan Set", brand: "Jaipur Artisans", qty: 1, image: "👑" },
  { id: "TXN-005", orderId: "#JK-1238", customer: "Meera Joshi", amount: "₹56,200", method: "UPI", status: "Success", date: "Mar 13, 2026", product: "Rose Gold Set", brand: "Golden Touch", qty: 1, image: "👑" },
];

const statusColors: Record<string, string> = {
  Success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  Failed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function PaymentsPage() {
  const [viewTxn, setViewTxn] = useState<Transaction | null>(null);
  const [invoiceTxn, setInvoiceTxn] = useState<Transaction | null>(null);

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div>
        <h1 className="text-2xl font-display font-bold">Payments</h1>
        <p className="text-muted-foreground text-sm font-sans">Payment tracking & transactions</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Received", value: 258200, icon: IndianRupee, color: "text-emerald-600" },
          { label: "Pending", value: 32800, icon: Clock, color: "text-amber-600" },
          { label: "Failed", value: 92000, icon: XCircle, color: "text-destructive" },
        ].map((s) => (
          <Card key={s.label} className="glass-card rounded-2xl card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground font-medium">{s.label}</span>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <p className="text-3xl font-bold font-display">
                <AnimatedCounter target={s.value} prefix="₹" />
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass-card rounded-2xl">
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
                  <th className="text-right py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id} className="border-b last:border-0 hover:bg-secondary/30 transition-colors">
                    <td className="py-3 font-medium font-mono text-xs">{t.id}</td>
                    <td className="py-3 text-muted-foreground">{t.orderId}</td>
                    <td className="py-3 hidden md:table-cell">{t.customer}</td>
                    <td className="py-3 font-medium">{t.amount}</td>
                    <td className="py-3 hidden sm:table-cell">
                      <span className="flex items-center gap-1"><CreditCard className="h-3 w-3" />{t.method}</span>
                    </td>
                    <td className="py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[t.status]}`}>{t.status}</span>
                    </td>
                    <td className="py-3 text-muted-foreground hidden md:table-cell">{t.date}</td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-0.5">
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="View" onClick={() => setViewTxn(t)}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Invoice" onClick={() => setInvoiceTxn(t)}>
                          <FileText className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* View Transaction Detail */}
      <Dialog open={!!viewTxn} onOpenChange={() => setViewTxn(null)}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader><DialogTitle className="font-display text-xl">Transaction Details</DialogTitle></DialogHeader>
          {viewTxn && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30">
                <div className="h-14 w-14 rounded-xl bg-secondary flex items-center justify-center text-3xl">{viewTxn.image}</div>
                <div>
                  <p className="font-medium">{viewTxn.product}</p>
                  <p className="text-xs text-muted-foreground">{viewTxn.brand} · Qty: {viewTxn.qty}</p>
                </div>
                <p className="ml-auto font-bold text-accent">{viewTxn.amount}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-xs text-muted-foreground">Transaction ID</p><p className="font-mono font-medium">{viewTxn.id}</p></div>
                <div><p className="text-xs text-muted-foreground">Order</p><p className="font-medium">{viewTxn.orderId}</p></div>
                <div><p className="text-xs text-muted-foreground">Customer</p><p className="font-medium">{viewTxn.customer}</p></div>
                <div><p className="text-xs text-muted-foreground">Method</p><p className="font-medium">{viewTxn.method}</p></div>
                <div><p className="text-xs text-muted-foreground">Date</p><p className="font-medium">{viewTxn.date}</p></div>
                <div><p className="text-xs text-muted-foreground">Status</p><span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[viewTxn.status]}`}>{viewTxn.status}</span></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Invoice Modal */}
      <Dialog open={!!invoiceTxn} onOpenChange={() => setInvoiceTxn(null)}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader><DialogTitle className="font-display text-xl">Invoice Preview</DialogTitle></DialogHeader>
          {invoiceTxn && (
            <div className="space-y-4">
              <div className="text-center p-4 border-b">
                <h3 className="font-display font-bold text-lg">JEWELSKART</h3>
                <p className="text-xs text-muted-foreground">123 Zaveri Bazaar, Mumbai · GSTIN: 27AABCU9603R1ZM</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-muted-foreground">Invoice</p><p className="font-mono font-medium">JK-INV-{invoiceTxn.id.replace("TXN-", "")}</p></div>
                <div><p className="text-xs text-muted-foreground">Date</p><p className="font-medium">{invoiceTxn.date}</p></div>
                <div><p className="text-xs text-muted-foreground">Customer</p><p className="font-medium">{invoiceTxn.customer}</p></div>
                <div><p className="text-xs text-muted-foreground">Payment</p><p className="font-medium">{invoiceTxn.method}</p></div>
              </div>
              <div className="p-3 rounded-xl bg-secondary/30">
                <div className="flex justify-between text-sm"><span>{invoiceTxn.product} × {invoiceTxn.qty}</span><span className="font-medium">{invoiceTxn.amount}</span></div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>GST (3%)</span><span>Included</span></div>
                <div className="flex justify-between text-sm font-bold border-t mt-2 pt-2"><span>Total</span><span className="text-accent">{invoiceTxn.amount}</span></div>
              </div>
              <p className="text-[10px] text-center text-muted-foreground">Thank you for shopping with JewelsKart! All items are BIS hallmarked.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
