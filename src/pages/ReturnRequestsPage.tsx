import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { 
  Eye, CheckCircle, XCircle, RefreshCw, DollarSign, ImageIcon, 
  User, Package, Phone, ZoomIn, Copy, Check, Truck, Loader2,
  ArrowUpRight, ArrowDownRight, CreditCard, Banknote, Wallet, Info
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useJewelleryCMS } from '@/context/JewelleryCMSContext';
import { Input } from '@/components/ui/input';

// ========== RAZORPAY DECLARATION ==========
declare global {
  interface Window {
    Razorpay: any;
  }
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const RAZORPAY_KEY_ID = "rzp_test_Sg6bppZOCOWIL6";

interface ReturnRequest {
  _id: string;
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  productId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  price: number;
  reason: string;
  description: string;
  requestType: 'cancel' | 'return' | 'exchange';
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'return_received' | 'exchange_shipped';
  adminNote: string;
  refundAmount: number;
  refundStatus: string;
  images: string[];
  video?: string;
  originalPaymentId?: string;
  paymentMethod?: string;  // ✅ ADDED: To track if order was COD
  refundDetails?: {
    method: string;
    refundId?: string;
    refundTransactionId?: string;
    upiId?: string;
    bankDetails?: {
      accountHolderName: string;
      accountNumber: string;
      bankName: string;
      ifscCode: string;
    };
  };
  exchangeDetails?: {
    exchangeProductId: string;
    exchangeProductName: string;
    exchangeProductImage: string;
    exchangeProductPrice: number;
    originalProductPrice: number;
    priceDifference: number;
    differencePaymentMethod: string;
    differencePaymentStatus: string;
    differencePaymentId?: string;
    differencePaymentAmount?: number;
    refundAmount?: number;
    refundStatus?: string;
    refundId?: string;
    returnShippingTracking: string;
    exchangeShippingTracking: string;
    returnReceived: boolean;
    exchangeShipped: boolean;
    returnReceivedDate?: string;
    exchangeShippedDate?: string;
  };
  createdAt: string;
}

const ReturnRequestsPage = () => {
  const { token } = useJewelleryCMS();
  const [requests, setRequests] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ReturnRequest | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [processing, setProcessing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [returnTracking, setReturnTracking] = useState('');
  const [exchangeTracking, setExchangeTracking] = useState('');
  
  // Payment processing states
  const [processingPayment, setProcessingPayment] = useState(false);
  const [processingRefund, setProcessingRefund] = useState(false);
  const [processingExchangeRefund, setProcessingExchangeRefund] = useState(false);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({ title: "Copied!", description: "Copied to clipboard" });
    setTimeout(() => setCopiedId(null), 2000);
  };

  // ========== CHECK IF ORDER IS COD ==========
  const isCODOrder = (request: ReturnRequest) => {
    return request.paymentMethod === 'COD' || !request.originalPaymentId;
  };

  // ========== LOAD RAZORPAY SCRIPT ==========
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // ========== 1. EXCHANGE ADDITIONAL PAYMENT (Customer pays extra) ==========
  const handleExchangeAdditionalPayment = async (request: ReturnRequest) => {
    if (!request.exchangeDetails || request.exchangeDetails.priceDifference <= 0) {
      toast({ title: "Error", description: "No additional payment required", variant: "destructive" });
      return;
    }

    setProcessingPayment(true);
    
    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) throw new Error("Failed to load Razorpay SDK");

      const amount = request.exchangeDetails.priceDifference;
      const orderId = request.orderId;

      const response = await fetch(`${API_BASE_URL}/payment/create-order`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: amount,
          currency: "INR",
          orderId: orderId,
          type: "exchange_additional_payment",
          requestId: request._id
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to create payment order");
      }

      const options = {
        key: data.key_id,
        amount: data.amount,
        currency: data.currency,
        name: "JewelsKart",
        description: `Additional Payment for Exchange - Order ${request.orderNumber}`,
        order_id: data.order_id,
        handler: async (razorpayResponse: any) => {
          const verifyResponse = await fetch(`${API_BASE_URL}/payment/verify-exchange-payment`, {
            method: "POST",
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              order_id: razorpayResponse.razorpay_order_id,
              payment_id: razorpayResponse.razorpay_payment_id,
              signature: razorpayResponse.razorpay_signature,
              requestId: request._id,
              amount: amount
            }),
          });

          const verifyData = await verifyResponse.json();

          if (verifyData.success) {
            toast({ 
              title: "Payment Successful!", 
              description: `Additional payment of ₹${amount} completed` 
            });
            await fetchRequests();
            setSelectedRequest(null);
          } else {
            toast({ 
              title: "Payment Failed", 
              description: "Verification failed", 
              variant: "destructive" 
            });
          }
        },
        prefill: {
          name: request.customerName,
          email: request.customerEmail,
          contact: request.customerPhone || ""
        },
        theme: { color: "#F37254" },
        modal: {
          ondismiss: () => {
            toast({ title: "Payment Cancelled", description: "You cancelled the payment" });
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', (response: any) => {
        toast({ 
          title: "Payment Failed", 
          description: response.error.description, 
          variant: "destructive" 
        });
      });
      razorpay.open();

    } catch (error: any) {
      console.error("Payment error:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setProcessingPayment(false);
    }
  };

  // ========== 2. REFUND TO CUSTOMER (Only for non-COD orders) ==========
  const handleProcessRefund = async (request: ReturnRequest) => {
    if (isCODOrder(request)) {
      toast({ 
        title: "COD Order", 
        description: "No refund needed as customer paid via Cash on Delivery", 
        variant: "default" 
      });
      return;
    }

    if (!request.originalPaymentId && !request.refundAmount) {
      toast({ title: "Error", description: "No payment ID or refund amount found", variant: "destructive" });
      return;
    }

    setProcessingRefund(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/payments/refund`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          paymentId: request.originalPaymentId,
          amount: request.refundAmount,
          reason: request.requestType === 'return' ? 'Customer return request' : 'Exchange price difference refund',
          requestId: request._id,
          type: request.requestType
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Refund failed");
      }

      toast({ 
        title: "Refund Successful!", 
        description: `Refund of ₹${request.refundAmount} processed to original payment method` 
      });
      
      await fetchRequests();
      setSelectedRequest(null);
      
    } catch (error: any) {
      console.error("Refund error:", error);
      toast({ title: "Refund Failed", description: error.message, variant: "destructive" });
    } finally {
      setProcessingRefund(false);
    }
  };

  // ========== 3. EXCHANGE PRICE DIFFERENCE REFUND (Only for non-COD orders) ==========
  const handleExchangeRefund = async (request: ReturnRequest) => {
    if (isCODOrder(request)) {
      toast({ 
        title: "COD Order", 
        description: "No refund needed for COD exchange", 
        variant: "default" 
      });
      return;
    }

    if (!request.exchangeDetails || !request.exchangeDetails.refundAmount || request.exchangeDetails.refundAmount <= 0) {
      toast({ title: "Error", description: "No refund amount to process", variant: "destructive" });
      return;
    }

    if (!request.originalPaymentId) {
      toast({ title: "Error", description: "Original payment ID not found", variant: "destructive" });
      return;
    }

    setProcessingExchangeRefund(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/payments/refund`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          paymentId: request.originalPaymentId,
          amount: request.exchangeDetails.refundAmount,
          reason: 'Exchange - Product price difference refund',
          requestId: request._id,
          type: 'exchange_refund'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Refund failed");
      }

      toast({ 
        title: "Refund Successful!", 
        description: `Refund of ₹${request.exchangeDetails.refundAmount} processed to original payment method` 
      });
      
      await fetchRequests();
      setSelectedRequest(null);
      
    } catch (error: any) {
      console.error("Exchange refund error:", error);
      toast({ title: "Refund Failed", description: error.message, variant: "destructive" });
    } finally {
      setProcessingExchangeRefund(false);
    }
  };

  const fetchRequests = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/returns/admin/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setRequests(data.requests);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast({ title: "Error", description: "Failed to fetch requests", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchRequests();
  }, [token]);
  
  const handleApprove = async (id: string) => {
    setProcessing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/returns/admin/${id}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ adminNote })
      });
      const data = await response.json();
      if (data.success) {
        toast({ title: "Success", description: "Request approved successfully" });
        fetchRequests();
        setSelectedRequest(null);
        setAdminNote('');
      } else {
        toast({ title: "Error", description: data.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to approve", variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };
  
  const handleReject = async (id: string) => {
    setProcessing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/returns/admin/${id}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ adminNote })
      });
      const data = await response.json();
      if (data.success) {
        toast({ title: "Success", description: "Request rejected" });
        fetchRequests();
        setSelectedRequest(null);
        setAdminNote('');
      } else {
        toast({ title: "Error", description: data.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to reject", variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  const handleMarkReturnReceived = async (id: string) => {
    setProcessing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/returns/admin/${id}/return-received`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ returnShippingTracking: returnTracking })
      });
      const data = await response.json();
      if (data.success) {
        toast({ title: "Success", description: "Return marked as received" });
        fetchRequests();
        setSelectedRequest(null);
        setReturnTracking('');
      } else {
        toast({ title: "Error", description: data.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to mark return", variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  const handleShipExchange = async (id: string) => {
    setProcessing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/returns/admin/${id}/ship-exchange`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ exchangeShippingTracking: exchangeTracking })
      });
      const data = await response.json();
      if (data.success) {
        toast({ title: "Success", description: "Exchange product shipped" });
        fetchRequests();
        setSelectedRequest(null);
        setExchangeTracking('');
      } else {
        toast({ title: "Error", description: data.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to ship exchange", variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      approved: 'bg-green-500/10 text-green-500 border-green-500/20',
      rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
      completed: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      return_received: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      exchange_shipped: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
    };
    return styles[status] || 'bg-gray-500/10 text-gray-500';
  };
  
  const getTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      cancel: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
      return: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      exchange: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20'
    };
    return styles[type] || 'bg-gray-500/10 text-gray-500';
  };

  const getPaymentMethodBadge = (request: ReturnRequest) => {
    if (isCODOrder(request)) {
      return (
        <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
          💵 COD - No Refund
        </Badge>
      );
    }
    return (
      <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
        💳 Online Payment
      </Badge>
    );
  };

  const getTypeLabel = (type: string) => {
    switch(type) {
      case 'cancel': return 'Cancellation';
      case 'return': return 'Return';
      case 'exchange': return 'Exchange';
      default: return type;
    }
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'cancel': return '❌';
      case 'return': return '🔄';
      case 'exchange': return '🔄';
      default: return '📦';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price || 0);
  };

  const filteredRequests = requests.filter((r) => {
    if (activeTab === 'pending' && r.requestType === 'cancel') return false;
    if (activeTab === 'approved' && r.requestType === 'cancel') return false;
    if (activeTab === 'all') return true;
    if (activeTab === 'cancelled') return r.requestType === 'cancel';
    return r.status === activeTab;
  });
  
  const stats = {
    pending: requests.filter((r) => r.status === 'pending' && r.requestType !== 'cancel').length,
    approved: requests.filter((r) => r.status === 'approved' && r.requestType !== 'cancel').length,
    rejected: requests.filter((r) => r.status === 'rejected').length,
    total: requests.length,
    cancelled: requests.filter((r) => r.requestType === 'cancel').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading requests...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">Return & Exchange Requests</h1>
          <p className="text-muted-foreground mt-1">Manage customer cancellation, return and exchange requests</p>
        </div>
        <Button variant="outline" onClick={fetchRequests} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-sm text-muted-foreground">Pending Requests</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            <p className="text-sm text-muted-foreground">Approved</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            <p className="text-sm text-muted-foreground">Rejected</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-orange-600">{stats.cancelled}</p>
            <p className="text-sm text-muted-foreground">Cancelled Orders</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-primary">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Total Requests</p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-flex">
          <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({stats.approved})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({stats.rejected})</TabsTrigger>
          <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({stats.cancelled})</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-4">
          <div className="grid gap-4">
            {filteredRequests.length === 0 ? (
              <div className="text-center py-12 bg-muted/20 rounded-lg">
                <Package className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No {activeTab} requests found</p>
              </div>
            ) : (
              filteredRequests.map((req) => {
                const isCancelRequest = req.requestType === 'cancel';
                const needsAdditionalPayment = req.requestType === 'exchange' && 
                  req.exchangeDetails && 
                  req.exchangeDetails.priceDifference > 0 && 
                  req.exchangeDetails.differencePaymentStatus !== 'completed';
                const needsRefund = req.requestType === 'exchange' && 
                  req.exchangeDetails && 
                  req.exchangeDetails.priceDifference < 0 && 
                  req.exchangeDetails.refundStatus !== 'completed';
                const isCOD = isCODOrder(req);
                
                return (
                  <Card key={req._id} className="hover:shadow-lg transition-all duration-200">
                    <CardContent className="p-5">
                      <div className="flex flex-wrap justify-between items-start gap-4">
                        <div className="flex gap-4 flex-1">
                          <div className="w-16 h-16 flex-shrink-0">
                            {req.productImage ? (
                              <img 
                                src={req.productImage} 
                                alt={req.productName}
                                className="w-full h-full object-cover rounded-lg border"
                                onError={(e) => (e.currentTarget.src = '/placeholder-image.jpg')}
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                                <Package className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <Badge className={getStatusBadge(isCancelRequest ? 'completed' : req.status)}>
                                {isCancelRequest ? 'COMPLETED' : req.status.toUpperCase()}
                              </Badge>
                              <Badge className={getTypeBadge(req.requestType)}>
                                {getTypeIcon(req.requestType)} {getTypeLabel(req.requestType)}
                              </Badge>
                              {getPaymentMethodBadge(req)}
                              {req.refundStatus === 'completed' && (
                                <Badge className="bg-emerald-500/10 text-emerald-500">REFUNDED</Badge>
                              )}
                              {needsAdditionalPayment && (
                                <Badge className="bg-orange-500/10 text-orange-500">PAYMENT PENDING</Badge>
                              )}
                              {needsRefund && (
                                <Badge className="bg-blue-500/10 text-blue-500">REFUND PENDING</Badge>
                              )}
                            </div>
                            
                            <p className="font-semibold">Order: #{req.orderNumber}</p>
                            <p className="text-sm text-muted-foreground">{req.customerName}</p>
                            <p className="text-sm">{req.productName} (Qty: {req.quantity})</p>
                            <p className="text-sm text-muted-foreground">Reason: {req.reason}</p>
                            {req.requestType === 'return' && !isCOD && (
                              <p className="text-sm font-semibold text-primary">Refund: {formatPrice(req.refundAmount)}</p>
                            )}
                            {req.requestType === 'return' && isCOD && (
                              <p className="text-sm font-semibold text-blue-600">COD Order - No Refund</p>
                            )}
                            {req.requestType === 'exchange' && req.exchangeDetails && (
                              <div className="flex items-center gap-2 mt-1">
                                {req.exchangeDetails.priceDifference > 0 ? (
                                  <p className="text-sm font-semibold text-orange-600">
                                    + Additional: {formatPrice(req.exchangeDetails.priceDifference)}
                                  </p>
                                ) : req.exchangeDetails.priceDifference < 0 ? (
                                  <p className="text-sm font-semibold text-green-600">
                                    - Refund: {formatPrice(Math.abs(req.exchangeDetails.priceDifference))}
                                  </p>
                                ) : null}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">{formatDate(req.createdAt)}</p>
                          <Button variant="outline" size="sm" onClick={() => setSelectedRequest(req)} className="mt-3">
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Image Zoom Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-3xl p-0 bg-black/90">
          <img src={selectedImage!} alt="Full size" className="w-full h-auto max-h-[80vh] object-contain" />
          <Button variant="outline" className="absolute top-4 right-4 bg-black/50 text-white" onClick={() => setSelectedImage(null)}>
            Close
          </Button>
        </DialogContent>
      </Dialog>
      
      {/* Details Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => { setSelectedRequest(null); setAdminNote(''); setReturnTracking(''); setExchangeTracking(''); }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              {getTypeIcon(selectedRequest?.requestType || '')} Request Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-5">
              {/* Status Banner */}
              <div className={`p-3 rounded-lg ${
                selectedRequest.requestType === 'cancel' ? 'bg-orange-50 border border-orange-200' :
                selectedRequest.status === 'pending' ? 'bg-yellow-50 border border-yellow-200' :
                selectedRequest.status === 'approved' ? 'bg-green-50 border border-green-200' :
                selectedRequest.status === 'rejected' ? 'bg-red-50 border border-red-200' :
                selectedRequest.status === 'completed' ? 'bg-blue-50 border border-blue-200' :
                selectedRequest.status === 'return_received' ? 'bg-purple-50 border border-purple-200' :
                'bg-indigo-50 border border-indigo-200'
              }`}>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    {selectedRequest.requestType === 'cancel' && <XCircle className="w-5 h-5 text-orange-600" />}
                    {selectedRequest.status === 'pending' && <RefreshCw className="w-5 h-5 text-yellow-600 animate-spin" />}
                    {selectedRequest.status === 'approved' && <CheckCircle className="w-5 h-5 text-green-600" />}
                    {selectedRequest.status === 'rejected' && <XCircle className="w-5 h-5 text-red-600" />}
                    {selectedRequest.status === 'completed' && <DollarSign className="w-5 h-5 text-blue-600" />}
                    {selectedRequest.status === 'return_received' && <Truck className="w-5 h-5 text-purple-600" />}
                    {selectedRequest.status === 'exchange_shipped' && <Truck className="w-5 h-5 text-indigo-600" />}
                    <span className="font-semibold">
                      {selectedRequest.requestType === 'cancel' ? 'CANCELLED' : `Status: ${selectedRequest.status.toUpperCase()}`}
                    </span>
                  </div>
                  {getPaymentMethodBadge(selectedRequest)}
                </div>
              </div>
              
              {/* COD Info Banner */}
              {isCODOrder(selectedRequest) && selectedRequest.requestType === 'return' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-600" />
                  <p className="text-sm text-blue-700">
                    This is a <strong>COD order</strong>. No refund will be processed as customer hasn't paid yet.
                  </p>
                </div>
              )}
              
              {/* Cancel Request Details */}
              {selectedRequest.requestType === 'cancel' && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-orange-800 mb-3">Cancellation Details</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Reason:</span> {selectedRequest.reason}</p>
                    {selectedRequest.description && <p><span className="font-medium">Description:</span> {selectedRequest.description}</p>}
                    <p><span className="font-medium">Cancelled on:</span> {formatDate(selectedRequest.createdAt)}</p>
                    {selectedRequest.adminNote && <p><span className="font-medium">Admin Note:</span> {selectedRequest.adminNote}</p>}
                  </div>
                </div>
              )}
              
              {/* Exchange Details Section with Price Difference */}
              {selectedRequest.requestType === 'exchange' && selectedRequest.exchangeDetails && (
                <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-cyan-800 mb-3">Exchange Details</h3>
                  
                  {/* Price Difference Card */}
                  <div className={`p-3 rounded-lg mb-3 ${
                    selectedRequest.exchangeDetails.priceDifference > 0 ? 'bg-orange-100 border border-orange-200' : 
                    selectedRequest.exchangeDetails.priceDifference < 0 ? 'bg-green-100 border border-green-200' : 
                    'bg-gray-100'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold">Price Difference</p>
                        <p className="text-2xl font-bold">
                          {selectedRequest.exchangeDetails.priceDifference > 0 ? '+' : ''}
                          ₹{Math.abs(selectedRequest.exchangeDetails.priceDifference)}
                        </p>
                      </div>
                      <div className="text-right">
                        {selectedRequest.exchangeDetails.priceDifference > 0 ? (
                          <div className="flex items-center gap-1 text-orange-600">
                            <ArrowUpRight className="w-5 h-5" />
                            <span className="text-sm">Customer needs to pay</span>
                          </div>
                        ) : selectedRequest.exchangeDetails.priceDifference < 0 ? (
                          <div className="flex items-center gap-1 text-green-600">
                            <ArrowDownRight className="w-5 h-5" />
                            <span className="text-sm">Refund to customer</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-600">No payment required</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Payment/Refund Status */}
                    {selectedRequest.exchangeDetails.priceDifference > 0 && (
                      <div className="mt-2 pt-2 border-t border-orange-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Payment Status:</span>
                          {selectedRequest.exchangeDetails.differencePaymentStatus === 'completed' ? (
                            <Badge className="bg-green-100 text-green-700">Payment Received</Badge>
                          ) : (
                            <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>
                          )}
                        </div>
                        {selectedRequest.exchangeDetails.differencePaymentId && (
                          <div className="mt-1">
                            <p className="text-xs text-muted-foreground">Payment ID:</p>
                            <code className="text-xs bg-white px-2 py-1 rounded block mt-1">
                              {selectedRequest.exchangeDetails.differencePaymentId}
                            </code>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {selectedRequest.exchangeDetails.priceDifference < 0 && !isCODOrder(selectedRequest) && (
                      <div className="mt-2 pt-2 border-t border-green-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Refund Status:</span>
                          {selectedRequest.exchangeDetails.refundStatus === 'completed' ? (
                            <Badge className="bg-green-100 text-green-700">Refunded</Badge>
                          ) : (
                            <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>
                          )}
                        </div>
                        {selectedRequest.exchangeDetails.refundId && (
                          <div className="mt-1">
                            <p className="text-xs text-muted-foreground">Refund ID:</p>
                            <code className="text-xs bg-white px-2 py-1 rounded block mt-1">
                              {selectedRequest.exchangeDetails.refundId}
                            </code>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {selectedRequest.exchangeDetails.priceDifference < 0 && isCODOrder(selectedRequest) && (
                      <div className="mt-2 pt-2 border-t border-green-200">
                        <div className="flex items-center gap-2 text-blue-600">
                          <Info className="w-4 h-4" />
                          <span className="text-sm">COD Order - No refund needed</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Products Comparison */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground">Original Product</p>
                      <div className="flex gap-2 mt-1">
                        {selectedRequest.productImage && (
                          <img src={selectedRequest.productImage} alt={selectedRequest.productName} className="w-12 h-12 object-cover rounded" />
                        )}
                        <div>
                          <p className="font-medium text-sm">{selectedRequest.productName}</p>
                          <p className="text-sm text-primary">{formatPrice(selectedRequest.price)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground">Exchange Product</p>
                      <div className="flex gap-2 mt-1">
                        {selectedRequest.exchangeDetails.exchangeProductImage && (
                          <img src={selectedRequest.exchangeDetails.exchangeProductImage} alt={selectedRequest.exchangeDetails.exchangeProductName} className="w-12 h-12 object-cover rounded" />
                        )}
                        <div>
                          <p className="font-medium text-sm">{selectedRequest.exchangeDetails.exchangeProductName}</p>
                          <p className="text-sm text-primary">{formatPrice(selectedRequest.exchangeDetails.exchangeProductPrice)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Return Shipping Tracking */}
                  <div className="mb-3">
                    <p className="text-sm font-medium mb-1">Return Shipping Tracking</p>
                    {selectedRequest.exchangeDetails.returnShippingTracking ? (
                      <div className="flex items-center gap-2">
                        <code className="text-sm bg-white px-2 py-1 rounded">{selectedRequest.exchangeDetails.returnShippingTracking}</code>
                        <button onClick={() => copyToClipboard(selectedRequest.exchangeDetails!.returnShippingTracking, 'returnTrack')}>
                          {copiedId === 'returnTrack' ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">Not yet provided</p>
                    )}
                  </div>
                  
                  {/* Exchange Shipping Tracking */}
                  <div>
                    <p className="text-sm font-medium mb-1">Exchange Shipping Tracking</p>
                    {selectedRequest.exchangeDetails.exchangeShippingTracking ? (
                      <div className="flex items-center gap-2">
                        <code className="text-sm bg-white px-2 py-1 rounded">{selectedRequest.exchangeDetails.exchangeShippingTracking}</code>
                        <button onClick={() => copyToClipboard(selectedRequest.exchangeDetails!.exchangeShippingTracking, 'exchangeTrack')}>
                          {copiedId === 'exchangeTrack' ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">Not yet shipped</p>
                    )}
                  </div>
                </div>
              )}
              
              {/* Return Refund Details */}
              {selectedRequest.requestType === 'return' && selectedRequest.refundDetails && !isCODOrder(selectedRequest) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-blue-800 mb-3">Refund Details</h3>
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Refund Amount</p>
                      <p className="text-2xl font-bold text-primary">{formatPrice(selectedRequest.refundAmount)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Refund Status</p>
                      <Badge className={`mt-1 ${
                        selectedRequest.refundStatus === 'completed' ? 'bg-green-100 text-green-700' :
                        selectedRequest.refundStatus === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {selectedRequest.refundStatus?.toUpperCase() || 'PENDING'}
                      </Badge>
                    </div>
                  </div>
                  
                  {selectedRequest.originalPaymentId && (
                    <div className="border-t border-blue-200 pt-3">
                      <p className="text-sm text-muted-foreground">Original Payment ID (Refund will be sent to same source)</p>
                      <code className="text-sm bg-white px-2 py-1 rounded block mt-1">
                        {selectedRequest.originalPaymentId}
                      </code>
                    </div>
                  )}
                </div>
              )}
              
              {/* COD Return Info (No Refund) */}
              {selectedRequest.requestType === 'return' && isCODOrder(selectedRequest) && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">COD Order Information</h3>
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Cash on Delivery Order</p>
                      <p className="text-sm text-muted-foreground">
                        Customer paid via COD. No refund will be processed for this return.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Product Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-semibold mb-3 flex items-center gap-2"><Package className="w-4 h-4" /> Product Information</p>
                <div className="flex gap-4">
                  <div className="w-24 h-24 flex-shrink-0">
                    {selectedRequest.productImage ? (
                      <img src={selectedRequest.productImage} alt={selectedRequest.productName} className="w-full h-full object-cover rounded-lg border" />
                    ) : (
                      <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center"><Package className="w-8 h-8 text-gray-400" /></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-lg">{selectedRequest.productName}</p>
                    <p className="text-sm text-muted-foreground">Quantity: {selectedRequest.quantity}</p>
                    <p className="text-sm text-muted-foreground">Original Price: {formatPrice(selectedRequest.price)}</p>
                  </div>
                </div>
              </div>
              
              {/* Customer Uploaded Images */}
              {selectedRequest.images && selectedRequest.images.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-semibold mb-3 flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Customer Uploaded Proof ({selectedRequest.images.length} images)</p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {selectedRequest.images.map((img: string, idx: number) => (
                      <div key={idx} className="relative group cursor-pointer aspect-square" onClick={() => setSelectedImage(img)}>
                        <img src={img} alt={`Proof ${idx + 1}`} className="w-full h-full object-cover rounded-lg border hover:opacity-80 transition-opacity" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center"><ZoomIn className="w-5 h-5 text-white" /></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Customer Details */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-semibold mb-2">Customer Details</p>
                  <p className="text-sm font-medium">{selectedRequest.customerName}</p>
                  <p className="text-xs text-muted-foreground">{selectedRequest.customerEmail}</p>
                  {selectedRequest.customerPhone && <p className="text-xs flex items-center gap-1 mt-1"><Phone className="w-3 h-3" /> {selectedRequest.customerPhone}</p>}
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-semibold mb-2">Request Details</p>
                  <p className="text-sm font-medium text-orange-700">{selectedRequest.reason}</p>
                  {selectedRequest.description && <p className="text-sm text-muted-foreground mt-2">{selectedRequest.description}</p>}
                  <p className="text-xs text-muted-foreground mt-2">Requested on: {formatDate(selectedRequest.createdAt)}</p>
                </div>
              </div>
              
              {/* Admin Note */}
              {selectedRequest.adminNote && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-semibold mb-1">Admin Note</p>
                  <p className="text-sm">{selectedRequest.adminNote}</p>
                </div>
              )}
              
              {/* ========== ACTION BUTTONS ========== */}
              
              {/* Approve/Reject Buttons (for pending requests) */}
              {selectedRequest.requestType !== 'cancel' && selectedRequest.status === 'pending' && (
                <div className="space-y-3">
                  <Textarea 
                    placeholder="Add admin note (optional)..." 
                    value={adminNote} 
                    onChange={(e) => setAdminNote(e.target.value)} 
                    rows={2} 
                    className="resize-none" 
                  />
                  <div className="flex gap-3">
                    <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={() => handleApprove(selectedRequest._id)} disabled={processing}>
                      <CheckCircle className="w-4 h-4 mr-2" /> Approve Request
                    </Button>
                    <Button variant="destructive" className="flex-1" onClick={() => handleReject(selectedRequest._id)} disabled={processing}>
                      <XCircle className="w-4 h-4 mr-2" /> Reject Request
                    </Button>
                  </div>
                </div>
              )}
              
              {/* ========== EXCHANGE - ADDITIONAL PAYMENT BUTTON (Customer pays extra) ========== */}
              {selectedRequest.requestType === 'exchange' && 
               selectedRequest.exchangeDetails && 
               selectedRequest.exchangeDetails.priceDifference > 0 && 
               selectedRequest.exchangeDetails.differencePaymentStatus !== 'completed' && (
                <Button 
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                  onClick={() => handleExchangeAdditionalPayment(selectedRequest)}
                  disabled={processingPayment}
                >
                  {processingPayment ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Banknote className="w-4 h-4 mr-2" />
                  )}
                  Pay Additional ₹{selectedRequest.exchangeDetails.priceDifference}
                </Button>
              )}
              
              {/* ========== EXCHANGE - REFUND BUTTON (Only for non-COD orders) ========== */}
              {selectedRequest.requestType === 'exchange' && 
               selectedRequest.exchangeDetails && 
               selectedRequest.exchangeDetails.priceDifference < 0 && 
               selectedRequest.exchangeDetails.refundStatus !== 'completed' && 
               !isCODOrder(selectedRequest) && (
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => handleExchangeRefund(selectedRequest)}
                  disabled={processingExchangeRefund}
                >
                  {processingExchangeRefund ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <DollarSign className="w-4 h-4 mr-2" />
                  )}
                  Process Refund ₹{Math.abs(selectedRequest.exchangeDetails.priceDifference)} to Original Payment
                </Button>
              )}
              
              {/* ========== EXCHANGE - COD Info (No Refund) ========== */}
              {selectedRequest.requestType === 'exchange' && 
               selectedRequest.exchangeDetails && 
               selectedRequest.exchangeDetails.priceDifference < 0 && 
               isCODOrder(selectedRequest) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                  <p className="text-sm text-blue-700">
                    📦 COD Order - No refund needed for exchange
                  </p>
                </div>
              )}
              
              {/* ========== RETURN - REFUND BUTTON (Only for non-COD orders) ========== */}
              {selectedRequest.requestType === 'return' && 
               selectedRequest.status === 'approved' && 
               selectedRequest.refundStatus !== 'completed' && 
               !isCODOrder(selectedRequest) && (
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => handleProcessRefund(selectedRequest)}
                  disabled={processingRefund}
                >
                  {processingRefund ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <DollarSign className="w-4 h-4 mr-2" />
                  )}
                  Process Refund ₹{selectedRequest.refundAmount} to Original Payment
                </Button>
              )}
              
              {/* ========== RETURN - COD Info (No Refund) ========== */}
              {selectedRequest.requestType === 'return' && 
               selectedRequest.status === 'approved' && 
               isCODOrder(selectedRequest) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                  <p className="text-sm text-blue-700">
                    📦 COD Order - No refund to process. Customer paid on delivery.
                  </p>
                </div>
              )}
              
              {/* Exchange Process Actions (After Approval) */}
              {selectedRequest.requestType === 'exchange' && selectedRequest.status === 'approved' && (
                <div className="space-y-3 border-t pt-4">
                  <h4 className="font-semibold">Exchange Process</h4>
                  <div>
                    <Label>Return Shipping Tracking Number</Label>
                    <div className="flex gap-2 mt-1">
                      <Input 
                        placeholder="Enter tracking number"
                        value={returnTracking}
                        onChange={(e) => setReturnTracking(e.target.value)}
                        className="flex-1"
                      />
                      <Button onClick={() => handleMarkReturnReceived(selectedRequest._id)} disabled={processing}>
                        Mark Return Received
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Ship Exchange Product */}
              {selectedRequest.requestType === 'exchange' && selectedRequest.status === 'return_received' && (
                <div className="space-y-3 border-t pt-4">
                  <h4 className="font-semibold">Ship Exchange Product</h4>
                  <div>
                    <Label>Exchange Shipping Tracking Number</Label>
                    <div className="flex gap-2 mt-1">
                      <Input 
                        placeholder="Enter tracking number"
                        value={exchangeTracking}
                        onChange={(e) => setExchangeTracking(e.target.value)}
                        className="flex-1"
                      />
                      <Button onClick={() => handleShipExchange(selectedRequest._id)} disabled={processing}>
                        <Truck className="w-4 h-4 mr-2" />
                        Ship Exchange Product
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReturnRequestsPage;