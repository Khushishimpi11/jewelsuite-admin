import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { IndianRupee, Clock, CheckCircle2, XCircle, CreditCard, Eye, FileText, Loader2, AlertTriangle, Copy, Check, ExternalLink, RefreshCw, Receipt, Banknote, Undo2, Package, ArrowRight } from "lucide-react";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useJewelleryCMS } from "@/context/JewelleryCMSContext";
import type { Order } from "@/context/JewelleryCMSContext";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const statusColors: Record<string, string> = {
  SUCCESS: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  PENDING: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  FAILED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  REFUNDED: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  Paid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  COD: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
};

// Payment Status Badge Component
const PaymentStatusBadge = ({ status }: { status: string }) => {
  const getStatusDisplay = (s: string) => {
    if (s === "SUCCESS" || s === "Paid") return { label: "Paid", color: "success" };
    if (s === "FAILED") return { label: "Failed", color: "failed" };
    if (s === "REFUNDED") return { label: "Refunded", color: "refunded" };
    if (s === "PENDING") return { label: "Pending", color: "pending" };
    if (s === "COD") return { label: "COD", color: "cod" };
    return { label: s, color: "default" };
  };

  const display = getStatusDisplay(status);

  const colorClasses: Record<string, string> = {
    success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    failed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    refunded: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    cod: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    default: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  };

  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${colorClasses[display.color]}`}>
      {display.label}
    </span>
  );
};

interface ZohoPaymentDetails {
  id: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  email: string;
  contact: string;
  createdAt: string;
  orderId: string;
  refundId?: string;
  description?: string;
}

export default function PaymentsPage() {
  const navigate = useNavigate();
  const {
    orders,
    products,
    loading,
    error,
    token
  } = useJewelleryCMS();

  const [viewTxn, setViewTxn] = useState<Order | null>(null);
  const [invoiceTxn, setInvoiceTxn] = useState<Order | null>(null);
  const [localTransactions, setLocalTransactions] = useState<any[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Zoho payment details state
  const [paymentDetailsDialogOpen, setPaymentDetailsDialogOpen] = useState(false);
  const [selectedPaymentDetails, setSelectedPaymentDetails] = useState<ZohoPaymentDetails | null>(null);
  const [loadingPaymentDetails, setLoadingPaymentDetails] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({ title: "Copied!", description: "Copied to clipboard" });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getAuthHeaders = () => {
    return {
      "Content-Type": "application/json",
      "Authorization": token ? `Bearer ${token}` : "",
    };
  };

  // Navigate to Orders Page with specific order
  const goToOrderPage = (orderNumber: string) => {
    navigate(`/orders?order=${orderNumber}`);
    setViewTxn(null);
  };

  // Fetch Zoho payment details
  const fetchPaymentDetails = async (paymentId: string) => {
    if (!paymentId) {
      toast({ title: "Error", description: "No payment ID found", variant: "destructive" });
      return;
    }

    setLoadingPaymentDetails(true);
    try {
      const response = await fetch(`${API_BASE_URL}/payment/details/${paymentId}`, {
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (data.success) {
        setSelectedPaymentDetails(data.payment);
        setPaymentDetailsDialogOpen(true);
      } else {
        toast({ title: "Error", description: data.message || "Failed to fetch payment details", variant: "destructive" });
      }
    } catch (error: any) {
      console.error("Error fetching payment details:", error);
      toast({ title: "Error", description: error.message || "An error occurred", variant: "destructive" });
    } finally {
      setLoadingPaymentDetails(false);
    }
  };

  // Fetch refund status
  const fetchRefundStatus = async (refundId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/payment/refund-status/${refundId}`, {
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Refund Status",
          description: `Refund ${data.refund.status.toUpperCase()} for ₹${data.refund.amount}`
        });
      }
    } catch (error: any) {
      console.error("Error fetching refund status:", error);
    }
  };

  // Get product by ID for image
  const getProductById = (productId: string) => {
    return products.find(p => p.id === productId);
  };

  // Helper function to get order items (supports both 'products' and 'items' arrays)
  const getOrderItems = (order: Order) => {
    // Try products array first, then items array
    if (order.products && order.products.length > 0) {
      return order.products;
    }
    if (order.items && order.items.length > 0) {
      return order.items;
    }
    return [];
  };

  // Generate transactions from orders with Zoho payment IDs
  useEffect(() => {
    const transactions = orders.map(order => {
      // Map payment status to display status
      let displayStatus = order.paymentStatus || "PENDING";
      if (order.paymentStatus === "Paid") displayStatus = "SUCCESS";
      else if (order.paymentStatus === "Failed") displayStatus = "FAILED";
      else if (order.paymentStatus === "Refunded") displayStatus = "REFUNDED";
      else if (order.paymentStatus === "Pending") displayStatus = "PENDING";

      // Get order items (supports both products and items)
      const orderItems = getOrderItems(order);
      const firstItem = orderItems[0];

      // Try to get product from products list
      let productImage = null;
      let productName = firstItem?.name || firstItem?.productName || "Multiple Items";

      if (firstItem?.productId) {
        const product = products.find(p => p.id === firstItem.productId);
        productImage = product?.images?.[0];
        productName = firstItem.name || product?.name || productName;
      }

      return {
        id: order.paymentId ? `pay_${order.paymentId.slice(-8)}` : `TXN-${order.id?.slice(-6) || '000000'}`,
        fullPaymentId: order.paymentId || null,
        orderId: order.orderNumber,
        orderNumber: order.orderNumber,
        customer: order.customerName,
        amount: order.total,
        method: order.paymentMethod || "ONLINE",
        status: displayStatus,
        date: order.date,
        product: productName,
        brand: firstItem?.category || "JewelsKart",
        qty: firstItem?.quantity || orderItems.length || 0,
        image: productImage || "📦",
        order: order,
        refundId: order.refundId || null,
        refundAmount: order.refundAmount || null,
        items: orderItems  // Store items for display
      };
    });

    setLocalTransactions(transactions);
  }, [orders, products]);

  // Calculate stats
  const totalReceived = localTransactions
    .filter(t => t.status === "SUCCESS" || t.status === "Paid")
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingAmount = localTransactions
    .filter(t => t.status === "PENDING")
    .reduce((sum, t) => sum + t.amount, 0);

  const failedAmount = localTransactions
    .filter(t => t.status === "FAILED")
    .reduce((sum, t) => sum + t.amount, 0);

  const refundedAmount = localTransactions
    .filter(t => t.status === "REFUNDED")
    .reduce((sum, t) => sum + t.amount, 0);

  const getPaymentMethodIcon = (method: string) => {
    switch (method?.toLowerCase()) {
      case "upi": return "📱";
      case "card": return "💳";
      case "netbanking": return "🏦";
      case "cod": return "💵";
      case "wallet": return "👛";
      default: return "💳";
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading payments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive font-medium mb-2">Error loading payments</p>
          <p className="text-muted-foreground text-sm">{error}</p>
          <Button className="mt-4" onClick={handleRefresh}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div className="space-y-6 p-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold">Payment Management</h1>
          <p className="text-muted-foreground text-sm font-sans">{localTransactions.length} transactions • Payment tracking</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
          {refreshing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Received", value: totalReceived, icon: IndianRupee, color: "text-emerald-600" },
          { label: "Pending", value: pendingAmount, icon: Clock, color: "text-amber-600" },
          { label: "Failed", value: failedAmount, icon: XCircle, color: "text-destructive" },
          { label: "Refunded", value: refundedAmount, icon: CheckCircle2, color: "text-orange-600" },
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
                {localTransactions.map((t) => (
                  <tr key={t.id} className="border-b last:border-0 hover:bg-secondary/30 transition-colors">
                    <td className="py-3 font-medium font-mono text-xs">
                      <div className="flex items-center gap-1">
                        <span>{t.id}</span>
                        {t.fullPaymentId && (
                          <button
                            onClick={() => copyToClipboard(t.fullPaymentId, `payment-${t.id}`)}
                            className="p-0.5 hover:bg-primary/10 rounded"
                          >
                            {copiedId === `payment-${t.id}` ?
                              <Check className="w-3 h-3 text-green-500" /> :
                              <Copy className="w-3 h-3 text-muted-foreground" />
                            }
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => goToOrderPage(t.orderId)}
                        className="text-primary hover:underline font-medium cursor-pointer"
                      >
                        {t.orderId}
                      </button>
                    </td>
                    <td className="py-3 hidden md:table-cell">{t.customer}</td>
                    <td className="py-3 font-medium">₹{t.amount.toLocaleString()}</td>
                    <td className="py-3 hidden sm:table-cell">
                      <span className="flex items-center gap-1">
                        <span>{getPaymentMethodIcon(t.method)}</span>
                        <span>{t.method}</span>
                      </span>
                    </td>
                    <td className="py-3">
                      <PaymentStatusBadge status={t.status} />
                    </td>
                    <td className="py-3 text-muted-foreground hidden md:table-cell">{t.date}</td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-0.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg hover:bg-primary/10"
                          title="View Order Details"
                          onClick={() => setViewTxn(t.order)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        {t.fullPaymentId && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg hover:bg-emerald-500/10"
                            title="View Zoho Payment Details"
                            onClick={() => fetchPaymentDetails(t.fullPaymentId)}
                          >
                            <Receipt className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg hover:bg-primary/10"
                          title="Invoice"
                          onClick={() => setInvoiceTxn(t.order)}
                        >
                          <FileText className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {localTransactions.length === 0 && (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <CreditCard className="h-12 w-12 text-primary/30 mb-4" />
              <p className="mb-2">No transactions found</p>
              <p className="text-sm">Complete orders to see payment transactions</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ========== TRANSACTION DETAILS DIALOG ========== */}
      <Dialog open={!!viewTxn} onOpenChange={() => setViewTxn(null)}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Transaction Details</DialogTitle>
          </DialogHeader>
          {viewTxn && (
            <div className="space-y-4">
              {/* Products Section - Supports both 'products' and 'items' arrays */}
              <div className="space-y-3">
                {getOrderItems(viewTxn).length > 0 ? (
                  getOrderItems(viewTxn).map((product: any, idx: number) => {
                    // Get product name (supports different field names)
                    const productName = product.name || product.productName || product.title || "Product";
                    const productPrice = product.price || product.productPrice || 0;
                    const productQuantity = product.quantity || 1;
                    const productTotal = productPrice * productQuantity;
                    const productSku = product.skuCode || product.sku || product.productSku;

                    // Get product image
                    let productImage = product.image || product.productImage || product.imageUrl;
                    if (!productImage && product.productId) {
                      const fullProduct = products.find(p => p.id === product.productId);
                      productImage = fullProduct?.images?.[0];
                    }

                    return (
                      <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30">
                        {/* Product Image */}
                        <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
                          {productImage ? (
                            <img
                              src={productImage}
                              alt={productName}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48?text=No+Image';
                              }}
                            />
                          ) : (
                            <Package className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>

                        {/* Product Info - Name and SKU */}
                        <div className="flex-1">
                          <p className="font-medium text-sm">{productName}</p>
                          {productSku && (
                            <p className="text-xs text-muted-foreground font-mono">SKU: {productSku}</p>
                          )}
                        </div>

                        {/* Product Price and Quantity - Right side */}
                        <div className="text-right">
                          <p className="font-semibold text-sm">₹{productTotal.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">Qty: {productQuantity}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-6 text-muted-foreground bg-secondary/20 rounded-lg">
                    <Package className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No products found in this order</p>
                  </div>
                )}
              </div>

              {/* Order Total */}
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="font-semibold">Total Amount</span>
                <span className="font-bold text-lg text-primary">₹{viewTxn.total?.toLocaleString() || 0}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Transaction ID</p>
                  <p className="font-mono font-medium text-xs">TXN-{viewTxn.id?.slice(-6) || '000000'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Order</p>
                  <button
                    onClick={() => goToOrderPage(viewTxn.orderNumber)}
                    className="font-medium text-primary hover:underline flex items-center gap-1"
                  >
                    {viewTxn.orderNumber}
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Customer</p>
                  <p className="font-medium">{viewTxn.customerName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Method</p>
                  <p className="font-medium">{viewTxn.paymentMethod || "ONLINE"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="font-medium">{viewTxn.date}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <PaymentStatusBadge status={viewTxn.paymentStatus || "PENDING"} />
                </div>
              </div>

              {/* View Order Button */}
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => goToOrderPage(viewTxn.orderNumber)}
              >
                <Eye className="w-4 h-4 mr-2" />
                View Full Order Details
              </Button>

              {/* Zoho Payment ID Section */}
              {viewTxn.paymentId && (
                <div className="border-t pt-3">
                  <p className="text-xs text-muted-foreground mb-2">Zoho Payment ID</p>
                  <div className="flex items-center gap-2 bg-secondary/30 p-2 rounded-lg">
                    <code className="text-xs font-mono flex-1">{viewTxn.paymentId}</code>
                    <button onClick={() => copyToClipboard(viewTxn.paymentId!, 'zoho-pid')}>
                      {copiedId === 'zoho-pid' ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                    </button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => fetchPaymentDetails(viewTxn.paymentId!)}
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Details
                    </Button>
                  </div>
                </div>
              )}

              {/* Refund Info Section */}
              {viewTxn.refundId && (
                <div className="border-t pt-3">
                  <p className="text-xs text-muted-foreground mb-2">Refund Information</p>
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-muted-foreground">Refund ID</p>
                        <code className="text-xs font-mono">{viewTxn.refundId}</code>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Refund Amount</p>
                        <p className="font-semibold text-orange-600">₹{viewTxn.refundAmount?.toLocaleString() || 0}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="link"
                      className="p-0 h-auto mt-2 text-xs"
                      onClick={() => fetchRefundStatus(viewTxn.refundId!)}
                    >
                      Check Refund Status
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Zoho Payment Details Dialog */}
      <Dialog open={paymentDetailsDialogOpen} onOpenChange={setPaymentDetailsDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl flex items-center gap-2">
              <Banknote className="w-5 h-5" />
              Zoho Payment Details
            </DialogTitle>
          </DialogHeader>
          {loadingPaymentDetails ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : selectedPaymentDetails && (
            <div className="space-y-4">
              <div className="bg-primary/5 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-sm text-muted-foreground">Payment ID</p>
                  <div className="flex items-center gap-1">
                    <code className="text-xs font-mono">{selectedPaymentDetails.id}</code>
                    <button onClick={() => copyToClipboard(selectedPaymentDetails.id, 'zoho-pid-detail')}>
                      {copiedId === 'zoho-pid-detail' ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-2xl font-bold">₹{selectedPaymentDetails.amount.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{selectedPaymentDetails.currency}</p>
                  </div>
                  <PaymentStatusBadge status={selectedPaymentDetails.status} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Payment Method</p>
                  <p className="font-medium capitalize">{selectedPaymentDetails.method?.toLowerCase() || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Order ID</p>
                  <p className="font-mono text-xs">{selectedPaymentDetails.orderId}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Customer Email</p>
                  <p className="text-sm">{selectedPaymentDetails.email || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Customer Contact</p>
                  <p className="text-sm">{selectedPaymentDetails.contact || "N/A"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Date & Time</p>
                  <p className="text-sm">{new Date(selectedPaymentDetails.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {selectedPaymentDetails.refundId && (
                <div className="border-t pt-3">
                  <p className="text-xs text-muted-foreground mb-2">Refund Information</p>
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">Refund ID</p>
                    <code className="text-xs font-mono">{selectedPaymentDetails.refundId}</code>
                  </div>
                </div>
              )}

              {selectedPaymentDetails.description && (
                <div className="border-t pt-3">
                  <p className="text-xs text-muted-foreground">Description</p>
                  <p className="text-sm">{selectedPaymentDetails.description}</p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setPaymentDetailsDialogOpen(false)}>
                  Close
                </Button>
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => window.open(`https://payments.zoho.in`, '_blank')}
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  View on Zoho Payments
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Invoice Modal */}
      <Dialog open={!!invoiceTxn} onOpenChange={() => setInvoiceTxn(null)}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Invoice Preview</DialogTitle>
          </DialogHeader>
          {invoiceTxn && (
            <div className="space-y-4">
              <div className="text-center p-4 border-b">
                <h3 className="font-display font-bold text-lg">JEWELSKART</h3>
                <p className="text-xs text-muted-foreground">123 Zaveri Bazaar, Mumbai · GSTIN: 27AABCU9603R1ZM</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Invoice No.</p>
                  <p className="font-mono font-medium">INV-{invoiceTxn.orderNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="font-medium">{invoiceTxn.date}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Customer</p>
                  <p className="font-medium">{invoiceTxn.customerName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Payment</p>
                  <p className="font-medium">{invoiceTxn.paymentMethod || "ONLINE"}</p>
                </div>
              </div>

              {invoiceTxn.paymentId && (
                <div className="bg-secondary/20 p-2 rounded-lg">
                  <p className="text-xs text-muted-foreground">Zoho Payment ID</p>
                  <code className="text-xs font-mono">{invoiceTxn.paymentId}</code>
                </div>
              )}

              <div className="p-3 rounded-xl bg-secondary/30">
                {getOrderItems(invoiceTxn).map((product: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-sm py-1">
                    <span>{product.name || product.productName} × {product.quantity}</span>
                    <span className="font-medium">₹{(product.price * product.quantity).toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between text-xs text-muted-foreground mt-2 pt-2 border-t">
                  <span>Product Price (Excl. GST)</span>
                  <span>₹{(invoiceTxn.totalExclGst || ((invoiceTxn.subtotal || 0) - (invoiceTxn.tax || 0)))?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>GST (Tax)</span>
                  <span>₹{invoiceTxn.tax?.toLocaleString() || 0}</span>
                </div>
                {invoiceTxn.discount > 0 && (
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Discount</span>
                    <span>-₹{invoiceTxn.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Shipping</span>
                  <span>₹{invoiceTxn.shippingCharge?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between text-sm font-bold border-t mt-2 pt-2">
                  <span>Grand Total</span>
                  <span className="text-accent">₹{invoiceTxn.total?.toLocaleString()}</span>
                </div>
              </div>
              <p className="text-[10px] text-center text-muted-foreground">
                Thank you for shopping with JewelsKart! All items are BIS hallmarked.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}