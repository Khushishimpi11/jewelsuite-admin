import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Search, Eye, Clock, Package, Truck, CheckCircle2, XCircle, IndianRupee,
  ShoppingCart, ChevronDown, User, Calendar, Loader2,
  AlertTriangle, ArrowUpRight, Trash2, MapPin, Phone, Mail,
  CreditCard, Hash, CalendarDays, Building2, Copy, Check, Image as ImageIcon,
  RefreshCw, History, RotateCcw, Undo2,
  DollarSign, Settings, Home, Receipt, Banknote, ExternalLink, AlertCircle
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useJewelleryCMS } from "@/context/JewelleryCMSContext";
import type { Order } from "@/context/JewelleryCMSContext";
import { toast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";

declare global {
  interface Window {
    ZPayments?: any;
  }
}

type StatusFilter = "All" | "Confirmed" | "Processing" | "Shipped" | "Out for Delivery" | "Delivered" | "Cancelled" | "Returned" | "Return Requested" | "Exchange Requested" | "Return Approved" | "Exchange Approved" | "Return Completed" | "Exchange Completed";

const statusList = [
  "Confirmed", "Processing", "Shipped", "Out for Delivery", "Delivered",
  "Cancelled", "Returned", "Return Requested", "Return Approved", "Return Completed",
  "Exchange Requested", "Exchange Approved", "Exchange Completed"
];

const statusConfig: Record<string, { icon: any; bg: string; text: string; border: string }> = {
  Confirmed: { icon: CheckCircle2, bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/30" },
  Processing: { icon: Package, bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/30" },
  Shipped: { icon: Truck, bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/30" },
  "Out for Delivery": { icon: Truck, bg: "bg-purple-500/10", text: "text-purple-500", border: "border-purple-500/30" },
  Delivered: { icon: CheckCircle2, bg: "bg-green-500/10", text: "text-green-500", border: "border-green-500/30" },
  Cancelled: { icon: XCircle, bg: "bg-red-500/10", text: "text-red-500", border: "border-red-500/30" },
  Returned: { icon: XCircle, bg: "bg-orange-500/10", text: "text-orange-500", border: "border-orange-500/30" },
  "Return Requested": { icon: RefreshCw, bg: "bg-purple-500/10", text: "text-purple-500", border: "border-purple-500/30" },
  "Return Approved": { icon: CheckCircle2, bg: "bg-green-500/10", text: "text-green-500", border: "border-green-500/30" },
  "Return Completed": { icon: CheckCircle2, bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/30" },
  "Exchange Requested": { icon: RefreshCw, bg: "bg-cyan-500/10", text: "text-cyan-500", border: "border-cyan-500/30" },
  "Exchange Approved": { icon: CheckCircle2, bg: "bg-green-500/10", text: "text-green-500", border: "border-green-500/30" },
  "Exchange Completed": { icon: CheckCircle2, bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/30" },
};

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";


interface ReturnRequestInfo {
  _id: string;
  requestType: 'cancel' | 'return' | 'exchange';
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'return_received' | 'exchange_shipped';
  refundAmount: number;
  refundStatus: string;
  additionalPaymentAmount?: number;
  additionalPaymentStatus?: string;
  additionalPaymentId?: string;
  returnTrackingNumber?: string;
  exchangeTrackingNumber?: string;
  createdAt: string;
}

// ========== PAYMENT STATUS BADGE (Fixed - using span instead of Badge to avoid DOM nesting) ==========
const PaymentStatusBadge = ({ status }: { status: string }) => {
  const config: Record<string, { bg: string; text: string; icon: any; label: string }> = {
    SUCCESS: { bg: "bg-emerald-500/10", text: "text-emerald-500", icon: CheckCircle2, label: "Paid" },
    FAILED: { bg: "bg-red-500/10", text: "text-red-500", icon: AlertCircle, label: "Failed" },
    REFUNDED: { bg: "bg-gray-500/10", text: "text-gray-500", icon: Undo2, label: "Refunded" },
    PENDING: { bg: "bg-yellow-500/10", text: "text-yellow-500", icon: Clock, label: "Pending" },
  };
  const { bg, text, icon: Icon, label } = config[status] || config.SUCCESS;
  return (
    <span className={`inline-flex items-center gap-1 ${bg} ${text} border rounded-full px-2 py-0.5 text-xs`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
};

export default function OrdersPage() {
  const { token, isAuthenticated, fetchCustomers } = useJewelleryCMS();

  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<StatusFilter>("All");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [returnRequests, setReturnRequests] = useState<Record<string, ReturnRequestInfo>>({});

  const [searchParams] = useSearchParams();
  const orderParam = searchParams.get("order");

  // Payment States
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);
  const [paymentDetailsDialogOpen, setPaymentDetailsDialogOpen] = useState(false);
  const [selectedPaymentDetails, setSelectedPaymentDetails] = useState<any>(null);

  // Refund Dialog States
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [selectedRefundOrder, setSelectedRefundOrder] = useState<Order | null>(null);
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [processingRefund, setProcessingRefund] = useState(false);

  // Exchange Additional Payment Dialog
  const [exchangePaymentDialogOpen, setExchangePaymentDialogOpen] = useState(false);
  const [selectedExchangeOrder, setSelectedExchangeOrder] = useState<Order | null>(null);
  const [exchangeAdditionalAmount, setExchangeAdditionalAmount] = useState<number>(0);
  const [processingExchangePayment, setProcessingExchangePayment] = useState(false);

  const initialFetchDone = useRef(false);

  const getAuthHeaders = () => {
    return {
      "Content-Type": "application/json",
      "Authorization": token ? `Bearer ${token}` : "",
    };
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({ title: "Copied!", description: "Copied to clipboard" });
    setTimeout(() => setCopiedId(null), 2000);
  };

  // ========== LOAD ZOHO PAYMENTS SCRIPT ==========
  const loadZohoPaymentsScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.ZPayments) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://static.zohocdn.com/zpay/zpay-js/v1/zpayments.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // ========== RETRY PAYMENT (For Failed Order Payments) ==========
  const handleRetryPayment = async (order: Order) => {
    if (!order.total || order.total <= 0) {
      toast({ title: "Error", description: "Invalid amount", variant: "destructive" });
      return;
    }

    setProcessingPayment(order.id);

    try {
      const isLoaded = await loadZohoPaymentsScript();
      if (!isLoaded) throw new Error("Failed to load Zoho Payments SDK");

      const response = await fetch(`${API_BASE_URL}/payment/create-session`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          amount: order.total,
          currency: "INR",
          orderId: order.id,
          description: `Payment for Order ${order.orderNumber}`
        }),
      });

      const data = await response.json();
      if (!data.success || !data.payments_session_id) throw new Error(data.message || "Failed to create Zoho payment session");

      const accountId = import.meta.env.VITE_ZOHO_ACCOUNT_ID || data.account_id || "23137556";
      const apiKey = import.meta.env.VITE_ZOHO_API_KEY || data.api_key || "1003.6314fc4a7d42b81ac85f1ca3dbc545eb.7a647ed7a4a681800edd6c0e26878bbd";

      const config = {
        account_id: accountId,
        domain: "IN",
        otherOptions: { api_key: apiKey }
      };

      const zpayments = new window.ZPayments(config);

      const handlePaymentCompletion = async (paymentResult: any) => {
        try {
          const verifyResponse = await fetch(`${API_BASE_URL}/payment/verify`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({
              payment_id: paymentResult?.payment_id || paymentResult?.id || `ZPAY_${Date.now()}`,
              payments_session_id: data.payments_session_id,
              signature: paymentResult?.signature || "",
              orderId: order.id
            }),
          });

          const verifyData = await verifyResponse.json();
          if (verifyData.success) {
            toast({ title: "Payment Successful!", description: `Payment ID: ${paymentResult?.payment_id || 'Confirmed'}` });
            await fetchOrdersFromAPI();
            await fetchCustomers();
          } else {
            toast({ title: "Payment Failed", description: "Verification failed", variant: "destructive" });
          }
        } catch (vErr: any) {
          toast({ title: "Error", description: vErr.message, variant: "destructive" });
        }
      };

      if (typeof zpayments.requestPaymentMethod === 'function') {
        zpayments.requestPaymentMethod({
          session_id: data.payments_session_id,
          onSuccess: handlePaymentCompletion,
          onFailure: (err: any) => toast({ title: "Payment Failed", description: err?.message, variant: "destructive" }),
          onClose: () => toast({ title: "Cancelled", description: "Payment cancelled" })
        });
      } else if (typeof zpayments.open === 'function') {
        zpayments.open({ session_id: data.payments_session_id, handler: handlePaymentCompletion });
      } else {
        await handlePaymentCompletion({ session_id: data.payments_session_id });
      }

    } catch (error: any) {
      console.error("Payment error:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setProcessingPayment(null);
    }
  };

  // ========== INITIATE REFUND (For Returns - Only for Online Paid Orders) ==========
  const handleInitiateRefund = async () => {
    if (!selectedRefundOrder || !refundAmount || refundAmount <= 0) {
      toast({ title: "Error", description: "Invalid refund amount", variant: "destructive" });
      return;
    }

    // ✅ Check if order has paymentId (online payment) and not COD
    if (!selectedRefundOrder.paymentId || selectedRefundOrder.paymentMethod === "COD") {
      toast({
        title: "Cannot Process Refund",
        description: "This order was paid via COD. No refund needed.",
        variant: "default"
      });
      setRefundDialogOpen(false);
      setSelectedRefundOrder(null);
      setRefundAmount(0);
      return;
    }

    setProcessingRefund(true);

    try {
      const response = await fetch(`${API_BASE_URL}/payment/refund`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          paymentId: selectedRefundOrder.paymentId,
          amount: refundAmount,
          reason: "Customer return request",
          orderId: selectedRefundOrder.id,
          requestId: returnRequests[selectedRefundOrder.id]?._id,
          type: "return"
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Refund failed");

      toast({ title: "Refund Initiated", description: `Refund of ₹${refundAmount} initiated successfully` });

      setRefundDialogOpen(false);
      setSelectedRefundOrder(null);
      setRefundAmount(0);
      await fetchOrdersFromAPI();

    } catch (error: any) {
      console.error("Refund error:", error);
      toast({ title: "Refund Failed", description: error.message, variant: "destructive" });
    } finally {
      setProcessingRefund(false);
    }
  };

  // ========== EXCHANGE ADDITIONAL PAYMENT ==========
  const handleExchangeAdditionalPayment = async () => {
    if (!selectedExchangeOrder || !exchangeAdditionalAmount || exchangeAdditionalAmount <= 0) {
      toast({ title: "Error", description: "Invalid amount", variant: "destructive" });
      return;
    }

    setProcessingExchangePayment(true);

    try {
      const isLoaded = await loadZohoPaymentsScript();
      if (!isLoaded) throw new Error("Failed to load Zoho Payments SDK");

      const response = await fetch(`${API_BASE_URL}/payment/create-session`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          amount: exchangeAdditionalAmount,
          currency: "INR",
          orderId: selectedExchangeOrder.id,
          description: `Additional Payment for Exchange - Order ${selectedExchangeOrder.orderNumber}`
        }),
      });

      const data = await response.json();
      if (!data.success || !data.payments_session_id) throw new Error(data.message || "Failed to create Zoho payment session");

      const accountId = import.meta.env.VITE_ZOHO_ACCOUNT_ID || data.account_id || "23137556";
      const apiKey = import.meta.env.VITE_ZOHO_API_KEY || data.api_key || "1003.6314fc4a7d42b81ac85f1ca3dbc545eb.7a647ed7a4a681800edd6c0e26878bbd";

      const config = {
        account_id: accountId,
        domain: "IN",
        otherOptions: { api_key: apiKey }
      };

      const zpayments = new window.ZPayments(config);

      const handlePaymentCompletion = async (paymentResult: any) => {
        try {
          const verifyResponse = await fetch(`${API_BASE_URL}/payment/verify`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({
              payment_id: paymentResult?.payment_id || paymentResult?.id || `ZPAY_${Date.now()}`,
              payments_session_id: data.payments_session_id,
              signature: paymentResult?.signature || "",
              orderId: selectedExchangeOrder.id
            }),
          });

          const verifyData = await verifyResponse.json();
          if (verifyData.success) {
            toast({ title: "Additional Payment Successful!", description: `Payment ID: ${paymentResult?.payment_id || 'Confirmed'}` });
            setExchangePaymentDialogOpen(false);
            setSelectedExchangeOrder(null);
            setExchangeAdditionalAmount(0);
            await fetchOrdersFromAPI();
          } else {
            toast({ title: "Payment Failed", description: "Verification failed", variant: "destructive" });
          }
        } catch (vErr: any) {
          toast({ title: "Error", description: vErr.message, variant: "destructive" });
        }
      };

      if (typeof zpayments.requestPaymentMethod === 'function') {
        zpayments.requestPaymentMethod({
          session_id: data.payments_session_id,
          onSuccess: handlePaymentCompletion,
          onFailure: (err: any) => toast({ title: "Payment Failed", description: err?.message, variant: "destructive" }),
          onClose: () => toast({ title: "Cancelled", description: "Payment cancelled" })
        });
      } else if (typeof zpayments.open === 'function') {
        zpayments.open({ session_id: data.payments_session_id, handler: handlePaymentCompletion });
      } else {
        await handlePaymentCompletion({ session_id: data.payments_session_id });
      }

    } catch (error: any) {
      console.error("Exchange payment error:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setProcessingExchangePayment(false);
    }
  };

  // ========== FETCH PAYMENT DETAILS ==========
  const fetchPaymentDetails = async (order: Order) => {
    if (!order.paymentId) {
      toast({ title: "No Payment", description: "This order has no payment record", variant: "destructive" });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/payment/details/${order.paymentId}`, {
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (data.success) {
        setSelectedPaymentDetails(data.payment);
        setPaymentDetailsDialogOpen(true);
      } else {
        toast({ title: "Error", description: data.message, variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const fetchReturnRequests = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/returns/admin/all`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (data.success) {
        const requestsMap: Record<string, ReturnRequestInfo> = {};
        data.requests.forEach((req: any) => {
          requestsMap[req.orderId] = {
            _id: req._id,
            requestType: req.requestType,
            status: req.status,
            refundAmount: req.refundAmount,
            refundStatus: req.refundStatus,
            additionalPaymentAmount: req.additionalPaymentAmount,
            additionalPaymentStatus: req.additionalPaymentStatus,
            additionalPaymentId: req.additionalPaymentId,
            returnTrackingNumber: req.returnTrackingNumber || req.exchangeDetails?.returnShippingTracking,
            exchangeTrackingNumber: req.exchangeTrackingNumber || req.exchangeDetails?.exchangeShippingTracking,
            createdAt: req.createdAt,
          };
        });
        setReturnRequests(requestsMap);
      }
    } catch (error) {
      console.error("Error fetching return requests:", error);
    }
  };

  const fetchOrdersFromAPI = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/orders/admin/all`, {
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch orders");
      }

      const ordersArray = data.orders || [];
      const formattedOrders = ordersArray.map((o: any) => ({
        id: o._id,
        _id: o._id,
        orderNumber: o.orderNumber,
        userId: o.userId?._id || o.userId,
        customerId: o.customerId?._id || o.customerId || o.userId?._id,
        customerName: o.customerName || o.userId?.name || "Unknown",
        customerEmail: o.customerEmail || o.userId?.email || "",
        customerPhone: o.customerPhone || "",
        customerAddress: o.shippingAddress || {},
        billingAddress: o.billingAddress || o.shippingAddress || {},
        items: o.items?.map((item: any) => ({
          ...item,
          skuCode: item.skuCode || item.sku || item.productSku,
          image: item.image || item.productImage || item.imageUrl
        })) || [],
        subtotal: o.subtotal || 0,
        tax: o.tax || 0,
        gstAmount: o.gstAmount || o.tax || 0,
        totalExclGst: o.totalExclGst || (o.subtotal ? o.subtotal - (o.tax || 0) : 0),
        discount: o.discount || 0,
        shippingCharge: o.shippingCharge || 0,
        total: o.totalAmount || o.total || 0,
        status: o.orderStatus || o.status || "Confirmed",
        paymentStatus: o.paymentStatus || "SUCCESS",
        paymentMethod: o.paymentMethod || "ONLINE",
        paymentId: o.paymentId || null,
        date: new Date(o.createdAt).toLocaleDateString(),
        timestamp: new Date(o.createdAt).getTime(),
        trackingNumber: o.trackingNumber,
        trackingId: o.trackingNumber,
        notes: o.notes,
        createdAt: o.createdAt,
        estimatedDelivery: o.estimatedDelivery,
        returnTrackingNumber: o.returnTrackingNumber,
        exchangeTrackingNumber: o.exchangeTrackingNumber,
      }));

      setOrders(formattedOrders);
      await fetchReturnRequests();
    } catch (err: any) {
      console.error("Error fetching orders:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatusAPI = async (orderId: string, status: string, note?: string) => {
    if (!token) throw new Error("Not authenticated");

    try {
      const response = await fetch(`${API_BASE_URL}/orders/admin/${orderId}/status`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status, note }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      await syncCustomerStats();
      await fetchOrdersFromAPI();
      await fetchCustomers();

      return data;
    } catch (err: any) {
      throw err;
    }
  };

  const syncCustomerStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/admin/sync-customers`, {
        method: "POST",
        headers: getAuthHeaders(),
      });

      const data = await response.json();
      console.log("✅ Customer stats synced:", data);
      return data;
    } catch (err) {
      console.error("Sync error:", err);
    }
  };

  const deleteOrderAPI = async (orderId: string) => {
    if (!token) throw new Error("Not authenticated");

    try {
      const response = await fetch(`${API_BASE_URL}/orders/admin/${orderId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      await syncCustomerStats();
      await fetchOrdersFromAPI();
      await fetchCustomers();

      return data;
    } catch (err: any) {
      throw err;
    }
  };

  const deleteAllOrdersAPI = async () => {
    if (!token) throw new Error("Not authenticated");

    try {
      const response = await fetch(`${API_BASE_URL}/orders/admin/delete-all`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      await syncCustomerStats();
      await fetchOrdersFromAPI();
      await fetchCustomers();

      return data;
    } catch (err: any) {
      throw err;
    }
  };

  useEffect(() => {
    if (orderParam) {
      const orderElement = document.getElementById(`order-${orderParam}`);
      if (orderElement) {
        orderElement.scrollIntoView({ behavior: "smooth" });
        orderElement.classList.add("bg-yellow-50", "dark:bg-yellow-900/20");
      }
    }
  }, [orderParam, orders]);

  useEffect(() => {
    if (token && isAuthenticated && !initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchOrdersFromAPI();
    }
  }, [token, isAuthenticated]);

  // ✅ Refresh function - same as Products page
  const handleRefresh = () => {
    initialFetchDone.current = false;
    fetchOrdersFromAPI();
    fetchCustomers();
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(orderId);
    try {
      await updateOrderStatusAPI(orderId, newStatus);
      toast({ title: "Success", description: `Order status updated to ${newStatus}` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;

    setDeleting(true);
    try {
      await deleteOrderAPI(orderToDelete.id);
      toast({ title: "Success", description: "Order deleted successfully" });

      // ✅ Refresh orders list
      await fetchOrdersFromAPI();

      // ✅ Refresh customers to update stats
      await fetchCustomers();

      // ✅ Close dialog
      setDeleteDialogOpen(false);
      setOrderToDelete(null);

    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteAllOrders = async () => {
    setDeleting(true);
    try {
      await deleteAllOrdersAPI();
      toast({ title: "Success", description: "All orders deleted successfully" });
      setDeleteAllDialogOpen(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  const getFilteredOrders = () => {
    let filtered = orders;

    if (search) {
      filtered = filtered.filter(
        (o) => o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
          o.customerName?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (activeTab !== "All") {
      filtered = filtered.filter(o => o.status === activeTab);
    }

    return filtered;
  };

  const filteredOrders = getFilteredOrders();

  const totalRevenue = orders.filter(o => o.status !== "Cancelled").reduce((sum, o) => sum + (o.total || 0), 0);
  const totalOrders = orders.length;
  const confirmedOrders = orders.filter(o => o.status === "Confirmed").length;
  const deliveredOrders = orders.filter(o => o.status === "Delivered").length;
  const paidOrders = orders.filter(o => o.paymentStatus === "SUCCESS").length;

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatFullDateTime = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }) + ' at ' + date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return dateString;
    }
  };

  const getRequestStatusDisplay = (orderId: string) => {
    const request = returnRequests[orderId];
    if (!request) return null;

    const statusMap: Record<string, { label: string; color: string; icon: any }> = {
      pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
      approved: { label: 'Approved', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
      rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle },
      completed: { label: 'Completed', color: 'bg-blue-100 text-blue-700', icon: CheckCircle2 },
      return_received: { label: 'Return Received', color: 'bg-purple-100 text-purple-700', icon: Truck },
      exchange_shipped: { label: 'Exchange Shipped', color: 'bg-indigo-100 text-indigo-700', icon: Truck },
    };

    const info = statusMap[request.status] || statusMap.pending;
    const Icon = info.icon;

    const typeLabel = request.requestType === 'cancel' ? 'Cancellation' :
      request.requestType === 'return' ? 'Return' : 'Exchange';

    return {
      type: request.requestType,
      typeLabel,
      status: request.status,
      statusLabel: info.label,
      statusColor: info.color,
      icon: Icon,
      refundAmount: request.refundAmount,
      refundStatus: request.refundStatus,
      additionalPaymentAmount: request.additionalPaymentAmount,
      additionalPaymentStatus: request.additionalPaymentStatus,
    };
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error && orders.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive font-medium mb-2">Error loading orders</p>
          <p className="text-muted-foreground text-sm">{error}</p>
          <Button className="mt-4" onClick={handleRefresh}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-primary">Orders Management</h1>
          <p className="text-muted-foreground text-sm mt-1">Track and manage customer orders</p>
        </div>
        <div className="flex gap-2">
          {/* ✅ Refresh Button - Same as Products page */}
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Refresh
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteAllDialogOpen(true)}
            disabled={orders.length === 0 || deleting}
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
            Delete All
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Total Orders</span>
              <ShoppingCart className="h-5 w-5 text-primary" />
            </div>
            <p className="text-3xl font-bold">{totalOrders}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Total Revenue</span>
              <IndianRupee className="h-5 w-5 text-emerald-500" />
            </div>
            <p className="text-3xl font-bold">₹{totalRevenue.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Confirmed Orders</span>
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            </div>
            <p className="text-3xl font-bold">{confirmedOrders}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Delivered</span>
              <Truck className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold">{deliveredOrders}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Paid Orders</span>
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            </div>
            <p className="text-3xl font-bold">{paidOrders}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button variant={activeTab === "All" ? "default" : "outline"} size="sm" onClick={() => setActiveTab("All")}>
          All
          <Badge variant="secondary" className="ml-2">{orders.length}</Badge>
        </Button>
        {statusList.map(status => (
          <Button
            key={status}
            variant={activeTab === status ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab(status as StatusFilter)}
          >
            {status}
            <Badge variant="secondary" className="ml-2">
              {orders.filter(o => o.status === status).length}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by order ID or customer name..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => {
          const StatusIcon = statusConfig[order.status]?.icon || CheckCircle2;
          const statusBg = statusConfig[order.status]?.bg || statusConfig.Confirmed.bg;
          const statusText = statusConfig[order.status]?.text || statusConfig.Confirmed.text;
          const statusBorder = statusConfig[order.status]?.border || statusConfig.Confirmed.border;
          const isUpdating = updatingStatus === order.id;
          const requestInfo = getRequestStatusDisplay(order.id);
          const isPaymentFailed = order.paymentStatus === "FAILED";
          const isProcessingPayment = processingPayment === order.id;
          const isCOD = order.paymentMethod === "COD";
          const hasPaymentId = !!order.paymentId;

          return (
            <Card key={order.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="flex flex-wrap items-center justify-between p-5 gap-4">
                  <div className="flex items-center gap-4 min-w-[200px]">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Package className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-lg">{order.orderNumber}</p>
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-3.5 h-3.5" />
                        <span>{order.customerName}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{order.items?.length || 0} item(s)</p>
                    </div>
                  </div>

                  <div className="text-center min-w-[100px]">
                    <p className="text-xs text-muted-foreground">Amount</p>
                    <p className="font-bold text-primary text-lg">₹{order.total?.toLocaleString()}</p>
                  </div>

                  <div className="text-center min-w-[130px]">
                    <p className="text-xs text-muted-foreground">Date</p>
                    <div className="flex items-center gap-1 justify-center">
                      <Calendar className="w-3 h-3" />
                      <span className="text-sm">{formatDate(order.timestamp)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{formatTime(order.timestamp)}</p>
                  </div>

                  {/* Payment Section - COD vs Online */}
                  <div className="text-center min-w-[120px]">
                    <p className="text-xs text-muted-foreground">Payment</p>
                    <p className="text-sm font-medium">{isCOD ? "COD" : (order.paymentMethod || "ONLINE")}</p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      {isCOD ? (
                        <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 border border-blue-200 rounded-full px-2 py-0.5 text-xs">
                          💵 Cash on Delivery
                        </span>
                      ) : (
                        <PaymentStatusBadge status={order.paymentStatus || "SUCCESS"} />
                      )}
                      {!isCOD && isPaymentFailed && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2 text-xs"
                          onClick={() => handleRetryPayment(order)}
                          disabled={isProcessingPayment}
                        >
                          {isProcessingPayment ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <RefreshCw className="w-3 h-3" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 min-w-[180px]">
                    <div className="flex items-center gap-2">
                      <Badge className={`${statusBg} ${statusText} ${statusBorder} border rounded-full px-3 py-1.5`}>
                        <StatusIcon className="w-3.5 h-3.5 mr-1.5" />
                        {order.status}
                      </Badge>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" disabled={isUpdating} className="gap-1">
                            {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            Update
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64 max-h-96 overflow-y-auto">
                          <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground sticky top-0 bg-white z-10">
                            <Package className="w-3 h-3 inline mr-1" /> Order Status
                          </DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleStatusChange(order.id, "Confirmed")}>
                            <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" /> Confirmed
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(order.id, "Processing")}>
                            <Package className="w-4 h-4 mr-2 text-amber-500" /> Processing
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(order.id, "Shipped")}>
                            <Truck className="w-4 h-4 mr-2 text-blue-500" /> Shipped
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(order.id, "Out for Delivery")}>
                            <Truck className="w-4 h-4 mr-2 text-purple-500" /> Out for Delivery
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(order.id, "Delivered")}>
                            <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> Delivered
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground sticky top-0 bg-white z-10">
                            <RefreshCw className="w-3 h-3 inline mr-1 text-purple-500" /> Return Timeline
                          </DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleStatusChange(order.id, "Return Requested")}>
                            <RefreshCw className="w-4 h-4 mr-2 text-purple-500" /> 1. Return Request Submitted
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(order.id, "Return Under Review")}>
                            <Clock className="w-4 h-4 mr-2 text-yellow-500" /> 2. Under Review
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(order.id, "Return Approved")}>
                            <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> 3. Approved
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(order.id, "Return Pickup Scheduled")}>
                            <Truck className="w-4 h-4 mr-2 text-purple-500" /> 4. Pickup Scheduled
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(order.id, "Return Picked Up")}>
                            <Truck className="w-4 h-4 mr-2 text-indigo-500" /> 5. Picked Up
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(order.id, "Return Quality Check")}>
                            <Package className="w-4 h-4 mr-2 text-orange-500" /> 6. Quality Check
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(order.id, "Return Refund Initiated")}>
                            <DollarSign className="w-4 h-4 mr-2 text-blue-500" /> 7. Refund Initiated
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(order.id, "Return Refund Completed")}>
                            <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> 8. Refund Completed
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground sticky top-0 bg-white z-10">
                            <RotateCcw className="w-3 h-3 inline mr-1 text-cyan-500" /> Exchange Timeline
                          </DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleStatusChange(order.id, "Exchange Requested")}>
                            <RotateCcw className="w-4 h-4 mr-2 text-cyan-500" /> 1. Exchange Request Submitted
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(order.id, "Exchange Under Review")}>
                            <Clock className="w-4 h-4 mr-2 text-yellow-500" /> 2. Under Review
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(order.id, "Exchange Approved")}>
                            <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> 3. Approved
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(order.id, "Exchange Pickup Scheduled")}>
                            <Truck className="w-4 h-4 mr-2 text-cyan-500" /> 4. Pickup Scheduled
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(order.id, "Exchange Picked Up")}>
                            <Truck className="w-4 h-4 mr-2 text-indigo-500" /> 5. Picked Up
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(order.id, "Exchange Quality Check")}>
                            <Package className="w-4 h-4 mr-2 text-orange-500" /> 6. Quality Check
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(order.id, "Exchange Replacement Processing")}>
                            <Settings className="w-4 h-4 mr-2 text-blue-500" /> 7. Replacement Processing
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(order.id, "Exchange Shipped")}>
                            <Truck className="w-4 h-4 mr-2 text-blue-500" /> 8. Shipped
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(order.id, "Exchange Delivered")}>
                            <Home className="w-4 h-4 mr-2 text-green-500" /> 9. Delivered
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground sticky top-0 bg-white z-10">
                            <XCircle className="w-3 h-3 inline mr-1 text-red-500" /> Cancellation
                          </DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleStatusChange(order.id, "Cancelled")}>
                            <XCircle className="w-4 h-4 mr-2 text-red-500" /> Cancel Order
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Request Status Badge with Refund/Exchange Payment Info */}
                    {requestInfo && (
                      <div className="flex flex-col items-end gap-1">
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${requestInfo.statusColor}`}>
                          <requestInfo.icon className="w-3 h-3" />
                          <span>{requestInfo.typeLabel}: {requestInfo.statusLabel}</span>
                        </div>
                        {requestInfo.refundAmount > 0 && requestInfo.refundStatus === 'completed' && (
                          <div className="text-xs text-green-600">Refunded: ₹{requestInfo.refundAmount.toLocaleString()}</div>
                        )}
                        {requestInfo.additionalPaymentAmount && requestInfo.additionalPaymentAmount > 0 && (
                          <div className="flex items-center gap-1">
                            {requestInfo.additionalPaymentStatus === 'SUCCESS' ? (
                              <span className="text-xs text-emerald-600">Additional Paid: ₹{requestInfo.additionalPaymentAmount.toLocaleString()}</span>
                            ) : requestInfo.additionalPaymentStatus === 'PENDING' ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-6 text-xs"
                                onClick={() => {
                                  setSelectedExchangeOrder(order);
                                  setExchangeAdditionalAmount(requestInfo.additionalPaymentAmount || 0);
                                  setExchangePaymentDialogOpen(true);
                                }}
                              >
                                <Banknote className="w-3 h-3 mr-1" />
                                Pay Additional ₹{requestInfo.additionalPaymentAmount}
                              </Button>
                            ) : null}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="hover:bg-primary hover:text-white transition-colors"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    {order.paymentId && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="hover:bg-emerald-500 hover:text-white transition-colors"
                        onClick={() => fetchPaymentDetails(order)}
                      >
                        <Receipt className="w-4 h-4" />
                      </Button>
                    )}
                    {/* Refund Button - Only for online paid return requests */}
                    {returnRequests[order.id]?.requestType === 'return' &&
                      returnRequests[order.id]?.status === 'approved' &&
                      returnRequests[order.id]?.refundStatus !== 'completed' &&
                      !isCOD && hasPaymentId && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="hover:bg-yellow-500 hover:text-white transition-colors"
                          onClick={() => {
                            setSelectedRefundOrder(order);
                            setRefundAmount(order.total || 0);
                            setRefundDialogOpen(true);
                          }}
                        >
                          <Undo2 className="w-4 h-4" />
                        </Button>
                      )}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="hover:bg-red-500 hover:text-white transition-colors"
                      onClick={() => {
                        setOrderToDelete(order);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No orders found</p>
        </div>
      )}

      {/* ========== ORDER DETAILS DIALOG ========== */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Order Details - {selectedOrder?.orderNumber}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="bg-primary/5 rounded-lg p-4">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Order ID</p>
                    <p className="font-mono font-semibold">{selectedOrder.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Order Date</p>
                    <p className="font-medium">{formatFullDateTime(selectedOrder.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Products</p>
                    <p className="font-medium">{selectedOrder.items?.length || 0} items</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tracking ID</p>
                    <div className="flex items-center gap-1">
                      <p className="font-mono text-sm">{selectedOrder.trackingId || "Not assigned"}</p>
                      {selectedOrder.trackingId && (
                        <button onClick={() => copyToClipboard(selectedOrder.trackingId!, `detail-tracking`)}>
                          {copiedId === `detail-tracking` ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                        </button>
                      )}
                    </div>
                  </div>
                  {selectedOrder.paymentId && (
                    <div>
                      <p className="text-sm text-muted-foreground">Payment ID</p>
                      <div className="flex items-center gap-1">
                        <p className="font-mono text-sm">{selectedOrder.paymentId.slice(-12)}</p>
                        <button onClick={() => copyToClipboard(selectedOrder.paymentId!, `payment-id`)}>
                          {copiedId === `payment-id` ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Return/Exchange Request Details */}
              {(() => {
                const request = returnRequests[selectedOrder.id];
                if (request) {
                  return (
                    <div className={`rounded-lg p-4 ${request.requestType === 'cancel' ? 'bg-red-50 border border-red-200' :
                      request.requestType === 'return' ? 'bg-purple-50 border border-purple-200' :
                        'bg-cyan-50 border border-cyan-200'
                      }`}>
                      <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <RefreshCw className="w-4 h-4" />
                        {request.requestType === 'cancel' ? 'Cancellation Request' :
                          request.requestType === 'return' ? 'Return Request' : 'Exchange Request'}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Status:</span>
                          <Badge className={`ml-2 ${request.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            request.status === 'approved' ? 'bg-green-100 text-green-700' :
                              request.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                'bg-blue-100 text-blue-700'
                            }`}>
                            {request.status.toUpperCase()}
                          </Badge>
                        </div>
                        {request.refundAmount > 0 && (
                          <div>
                            <span className="text-muted-foreground">Refund Amount:</span>
                            <span className="ml-1 font-semibold">₹{request.refundAmount.toLocaleString()}</span>
                            {request.refundStatus === 'completed' && (
                              <Badge className="ml-2 bg-green-100 text-green-700">Refunded</Badge>
                            )}
                          </div>
                        )}
                        {request.additionalPaymentAmount && request.additionalPaymentAmount > 0 && (
                          <div>
                            <span className="text-muted-foreground">Additional Payment:</span>
                            <span className="ml-1 font-semibold">₹{request.additionalPaymentAmount.toLocaleString()}</span>
                            {request.additionalPaymentStatus === 'SUCCESS' ? (
                              <Badge className="ml-2 bg-green-100 text-green-700">Paid</Badge>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="ml-2 h-6 text-xs"
                                onClick={() => {
                                  setSelectedExchangeOrder(selectedOrder);
                                  setExchangeAdditionalAmount(request.additionalPaymentAmount || 0);
                                  setExchangePaymentDialogOpen(true);
                                }}
                              >
                                Pay Now
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Products Section */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Products</h3>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item, idx) => {
                    // Get size from item
                    const productSize = item.size || item.selectedSize || '';

                    return (
                      <div key={idx} className="border rounded-lg p-4">
                        <div className="flex gap-4">
                          <div className="flex-shrink-0">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name || item.productName || 'Product'}
                                className="w-20 h-20 object-cover rounded-lg"
                                onError={(e) => {
                                  e.currentTarget.src = 'https://placehold.co/200x200/3b82f6/white?text=No+Image';
                                }}
                              />
                            ) : (
                              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                                <Package className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold">{item.name || item.productName || 'Product'}</p>
                            <p className="text-sm text-muted-foreground">SKU: {item.skuCode || item.sku || item.productSku || "N/A"}</p>

                            {/* Size Badge */}
                            {productSize && productSize !== '' ? (
                              <span className="inline-flex items-center gap-1 text-xs bg-green-100 px-2 py-0.5 rounded-full text-green-700 font-medium mt-1">
                                Size: {productSize}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-500 mt-1">
                                📏 Size: Standard
                              </span>
                            )}

                            <p className="text-sm mt-2">
                              Qty: {item.quantity} × ₹{item.price?.toLocaleString()} = ₹{(item.price * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3">Price Breakdown</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Product Price (Excl. GST):</span>
                    <span>₹{(selectedOrder.totalExclGst || (selectedOrder.subtotal - (selectedOrder.tax || 0)))?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST (Tax):</span>
                    <span>₹{selectedOrder.tax?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span>₹{selectedOrder.shippingCharge?.toLocaleString() || 0}</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-bold">
                      <span>Grand Total:</span>
                      <span className="text-primary">₹{selectedOrder.total?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer & Payment Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Customer Details</h3>
                  <p>{selectedOrder.customerName}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.customerEmail}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.customerPhone || "N/A"}</p>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Payment Information</h3>
                  <p>Method: {selectedOrder.paymentMethod === "COD" ? "COD" : (selectedOrder.paymentMethod || "ONLINE")}</p>
                  <p>Status: {selectedOrder.paymentMethod === "COD" ? (
                    <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 border border-blue-200 rounded-full px-2 py-0.5 text-xs">COD</span>
                  ) : (
                    <PaymentStatusBadge status={selectedOrder.paymentStatus || "SUCCESS"} />
                  )}</p>
                  {selectedOrder.paymentId && (
                    <Button variant="link" className="p-0 h-auto mt-1" onClick={() => fetchPaymentDetails(selectedOrder)}>
                      View Payment Details →
                    </Button>
                  )}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Shipping Address</h3>
                <p>{selectedOrder.customerAddress?.street}</p>
                <p>{selectedOrder.customerAddress?.city}, {selectedOrder.customerAddress?.state} - {selectedOrder.customerAddress?.pincode}</p>
                <p>{selectedOrder.customerAddress?.country || "India"}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedOrder(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========== PAYMENT DETAILS DIALOG ========== */}
      <Dialog open={paymentDetailsDialogOpen} onOpenChange={setPaymentDetailsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
          </DialogHeader>
          {selectedPaymentDetails && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Payment ID</p>
                  <p className="font-mono text-sm">{selectedPaymentDetails.id}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Order ID</p>
                  <p className="font-mono text-sm">{selectedPaymentDetails.orderId}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Amount</p>
                  <p className="font-bold text-lg">₹{selectedPaymentDetails.amount?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <PaymentStatusBadge status={selectedPaymentDetails.status} />
                </div>
              </div>
              {selectedPaymentDetails.refundId && (
                <div className="border-t pt-3">
                  <p className="text-xs text-muted-foreground">Refund ID</p>
                  <p className="font-mono text-sm">{selectedPaymentDetails.refundId}</p>
                  <p className="text-xs text-muted-foreground mt-1">Refund Amount: ₹{selectedPaymentDetails.refundAmount?.toLocaleString()}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDetailsDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========== REFUND DIALOG ========== */}
      <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Initiate Refund</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm">Order: {selectedRefundOrder?.orderNumber}</p>
              <p className="text-sm">Customer: {selectedRefundOrder?.customerName}</p>
              <p className="text-lg font-bold mt-2">Max Refund: ₹{selectedRefundOrder?.total?.toLocaleString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Refund Amount (₹)</label>
              <Input
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(Number(e.target.value))}
                max={selectedRefundOrder?.total}
                min={0}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefundDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleInitiateRefund} disabled={processingRefund || refundAmount <= 0}>
              {processingRefund && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Process Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========== EXCHANGE ADDITIONAL PAYMENT DIALOG ========== */}
      <Dialog open={exchangePaymentDialogOpen} onOpenChange={setExchangePaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exchange Additional Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm">Order: {selectedExchangeOrder?.orderNumber}</p>
              <p className="text-sm">Customer: {selectedExchangeOrder?.customerName}</p>
              <p className="text-lg font-bold mt-2">Additional Amount: ₹{exchangeAdditionalAmount.toLocaleString()}</p>
            </div>
            <p className="text-sm text-muted-foreground">Please complete the additional payment for your exchange request.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExchangePaymentDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleExchangeAdditionalPayment} disabled={processingExchangePayment}>
              {processingExchangePayment && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Pay ₹{exchangeAdditionalAmount}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialogs */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete order #{orderToDelete?.orderNumber}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteOrder} className="bg-red-500">
              {deleting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteAllDialogOpen} onOpenChange={setDeleteAllDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete All Orders?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete all {orders.length} orders.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAllOrders} className="bg-red-500">
              {deleting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}