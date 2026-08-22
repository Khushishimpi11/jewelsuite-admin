import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Search, Eye, Trash2, Edit, Users, IndianRupee, ShoppingCart, UserCheck, Mail, Phone, MapPin, Loader2, AlertTriangle, X, UserPlus, Copy, Check, Package, Trash, Calendar, CreditCard, Home, ShoppingBag, Clock, ChevronRight, Award, Star, Heart, Truck } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { calculateEstimatedDelivery } from "@/utils/deliveryCalculator";
import { useJewelleryCMS } from "@/context/JewelleryCMSContext";
import type { Customer, Order } from "@/context/JewelleryCMSContext";

type StatusFilter = "All" | "Active" | "Inactive";

// Helper function to format order date
const formatOrderDate = (order: any) => {
  // Try multiple possible date fields from your backend
  const dateValue = order?.createdAt || order?.date || order?.orderDate || order?.updatedAt;

  if (!dateValue) {
    return 'Date not recorded';
  }

  try {
    const date = new Date(dateValue);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Date pending';
    }

    // Format: 17 Apr 2026
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch (error) {
    return 'Date error';
  }
};

export default function CustomersPage() {
  const {
    customers: apiCustomers,
    orders: allOrders,
    fetchCustomers,
    updateCustomer,
    deleteCustomer,
    toggleCustomerStatus,
    getCustomerOrders,
    loading: contextLoading,
    error: contextError,
    isAuthenticated,
    token
  } = useJewelleryCMS();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [viewCustomer, setViewCustomer] = useState<Customer | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [localCustomers, setLocalCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [fetchingOrdersForCustomer, setFetchingOrdersForCustomer] = useState(false);

  const initialFetchDone = useRef(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({ title: "Copied!", description: "Copied to clipboard" });
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Get orders for a specific customer from allOrders context
  const getCustomerOrdersFromContext = (customer: Customer): Order[] => {
    if (!allOrders || !Array.isArray(allOrders)) return [];

    return allOrders.filter((order: Order) => {
      const matchesCustomerId =
        order.customerId === customer.id ||
        order.customerId === customer._id ||
        order.userId === customer.id ||
        order.userId === customer._id;

      const matchesEmail =
        order.customerEmail === customer.email ||
        order.email === customer.email ||
        (order.customer && order.customer.email === customer.email);

      const matchesName =
        order.customerName === customer.name ||
        (order.customer && order.customer.name === customer.name);

      const matchesPhone =
        order.customerPhone === customer.phone ||
        (order.customer && order.customer.phone === customer.phone);

      return matchesCustomerId || matchesEmail || matchesName || matchesPhone;
    });
  };

  // Fetch customers from API
  const fetchCustomersFromAPI = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch customers only (orders will come from context)
      console.log("👥 Fetching customers...");
      const response = await fetch(`${API_BASE_URL}/auth/customers`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch customers");
      }

      const customersArray = data.customers || [];
      console.log(`👥 Retrieved ${customersArray.length} customers`);

      // Format customers with their order information from context
      const formattedCustomers = customersArray.map((c: any) => {
        // Get orders for this customer from the allOrders context
        const customerOrdersList = allOrders && Array.isArray(allOrders)
          ? allOrders.filter((order: Order) => {
            const matchesById =
              order.customerId === c._id ||
              order.userId === c._id ||
              (order.customer && (order.customer._id === c._id || order.customer.id === c._id));

            const matchesByEmail =
              order.customerEmail === c.email ||
              order.email === c.email ||
              (order.customer && order.customer.email === c.email);

            const matchesByName =
              order.customerName === c.name ||
              (order.customer && order.customer.name === c.name);

            const matchesByPhone =
              order.customerPhone === c.phone ||
              order.customerPhone === c.mobile ||
              (order.customer && (order.customer.phone === c.phone || order.customer.phone === c.mobile));

            return matchesById || matchesByEmail || matchesByName || matchesByPhone;
          })
          : [];

        const totalSpent = customerOrdersList.reduce((sum: number, order: Order) =>
          sum + (order.totalAmount || order.total || 0), 0);

        const address = c.address || {};

        return {
          id: c._id,
          _id: c._id,
          customerId: c.customerId || `CUST${String(customersArray.indexOf(c) + 1).padStart(4, '0')}`,
          name: c.name || "",
          email: c.email || "",
          phone: c.phone || c.mobile || "",
          address: {
            street: address.street || address.line1 || address.address || "",
            city: address.city || "",
            state: address.state || "",
            pincode: address.pincode || address.zipcode || address.postalCode || "",
            country: address.country || "India"
          },
          totalSpent: totalSpent,
          orderCount: customerOrdersList.length,
          orders: customerOrdersList,
          notes: c.notes || "",
          createdAt: c.createdAt ? new Date(c.createdAt).getTime() : Date.now(),
          isActive: c.isActive !== false,
          emailVerified: c.emailVerified || false,
          phoneVerified: c.phoneVerified || false
        };
      });

      setLocalCustomers(formattedCustomers);

      const totalOrdersCount = formattedCustomers.reduce((sum, c) => sum + (c.orderCount || 0), 0);
      console.log(`✅ Successfully loaded ${formattedCustomers.length} customers with ${totalOrdersCount} orders`);

    } catch (err: any) {
      console.error("Error fetching customers:", err);
      setError(err.message);
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Delete all customers
  const deleteAllCustomers = async () => {
    if (!token) return;

    setDeletingAll(true);
    let deletedCount = 0;
    let failedCount = 0;

    try {
      for (const customer of localCustomers) {
        try {
          const response = await fetch(`${API_BASE_URL}/auth/customers/${customer.id}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            }
          });

          if (response.ok) {
            deletedCount++;
          } else {
            failedCount++;
          }
        } catch (err) {
          failedCount++;
        }
      }

      await fetchCustomersFromAPI();

      toast({
        title: "Bulk Delete Complete",
        description: `Deleted ${deletedCount} customers${failedCount > 0 ? `, ${failedCount} failed` : ''}`,
      });

      setDeleteAllDialogOpen(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setDeletingAll(false);
    }
  };

  // Delete customer from API
  const deleteCustomerFromAPI = async (id: string) => {
    if (!token) throw new Error("Not authenticated");

    try {
      const response = await fetch(`${API_BASE_URL}/auth/customers/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      await fetchCustomersFromAPI();
      return data;
    } catch (err: any) {
      throw err;
    }
  };

  // Toggle customer status
  const toggleCustomerStatusInAPI = async (id: string, isActive: boolean) => {
    if (!token) throw new Error("Not authenticated");

    try {
      const response = await fetch(`${API_BASE_URL}/auth/customers/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ isActive }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      await fetchCustomersFromAPI();
      return data;
    } catch (err: any) {
      throw err;
    }
  };

  // View customer details with orders
  const viewCustomerDetails = async (customer: Customer) => {
    setViewCustomer(customer);
    setFetchingOrdersForCustomer(true);

    try {
      // Get orders from context
      const orders = getCustomerOrdersFromContext(customer);
      console.log(`Found ${orders.length} orders for customer ${customer.name}`);
      setCustomerOrders(orders);

      // Update the customer's order count in local state
      if (orders.length > 0) {
        setLocalCustomers(prev =>
          prev.map(c =>
            c.id === customer.id
              ? { ...c, orderCount: orders.length, totalSpent: orders.reduce((sum, o) => sum + (o.total || o.totalAmount || 0), 0), orders: orders }
              : c
          )
        );
      }
    } catch (err) {
      console.error("Error fetching customer orders:", err);
      setCustomerOrders([]);
    } finally {
      setFetchingOrdersForCustomer(false);
    }
  };

  // Handle delete customer
  const handleDeleteCustomer = async () => {
    if (!customerToDelete) return;
    setDeleting(true);
    try {
      await deleteCustomerFromAPI(customerToDelete.id);
      toast({ title: "Success!", description: "Customer deleted successfully" });
      setDeleteDialogOpen(false);
      setCustomerToDelete(null);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (customer: Customer) => {
    try {
      await toggleCustomerStatusInAPI(customer.id, !customer.isActive);
      toast({ title: "Success!", description: `Customer ${!customer.isActive ? "activated" : "deactivated"} successfully` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    initialFetchDone.current = false;
    fetchCustomersFromAPI();
  };

  // Format address
  const formatAddress = (address: any) => {
    if (!address) return "No address";
    const parts = [];
    if (address.street) parts.push(address.street);
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    if (address.pincode) parts.push(address.pincode);
    if (parts.length === 0) return "No address";
    return parts.join(", ");
  };

  // Get status color
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      "Confirmed": "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      "Processing": "bg-amber-500/10 text-amber-500 border-amber-500/20",
      "Shipped": "bg-blue-500/10 text-blue-500 border-blue-500/20",
      "Out for Delivery": "bg-purple-500/10 text-purple-500 border-purple-500/20",
      "Delivered": "bg-green-500/10 text-green-500 border-green-500/20",
      "Cancelled": "bg-red-500/10 text-red-500 border-red-500/20",
    };
    return colors[status] || "bg-gray-500/10 text-gray-500 border-gray-500/20";
  };

  // Format date
  const formatDate = (date: any) => {
    if (!date) return "N/A";
    try {
      return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return "Invalid date";
    }
  };

  // Initial fetch - only when token is available
  useEffect(() => {
    if (token && !initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchCustomersFromAPI();
    }
  }, [token]);

  // Refetch when orders context changes
  useEffect(() => {
    if (initialFetchDone.current && token && allOrders && Array.isArray(allOrders)) {
      console.log("Orders updated, refreshing customer data...");
      fetchCustomersFromAPI();
    }
  }, [allOrders]);

  // Filter customers
  let filtered = localCustomers.filter((c) => {
    const matchesSearch =
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search) ||
      c.customerId?.toLowerCase().includes(search.toLowerCase());

    let matchesStatus = true;
    if (statusFilter === "Active") {
      matchesStatus = c.isActive !== false;
    } else if (statusFilter === "Inactive") {
      matchesStatus = c.isActive === false;
    }

    return matchesSearch && matchesStatus;
  });

  // Calculate stats - safely handle allOrders
  const totalCustomers = localCustomers.length;
  const activeCustomers = localCustomers.filter(c => c.isActive !== false).length;
  const inactiveCustomers = localCustomers.filter(c => c.isActive === false).length;
  const totalRevenue = (allOrders && Array.isArray(allOrders) ? allOrders.filter((o: Order) => o.status !== "Cancelled").reduce((sum, o) => sum + (o.total || o.totalAmount || 0), 0) : 0);
  const totalOrders = (allOrders && Array.isArray(allOrders) ? allOrders.length : 0);

  if (loading && localCustomers.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading customers...</p>
        </div>
      </div>
    );
  }

  if (error && localCustomers.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive font-medium mb-2">Error loading customers</p>
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
          <h1 className="text-3xl font-bold text-primary">Customers Management</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your customer database</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Refresh
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setDeleteAllDialogOpen(true)} disabled={localCustomers.length === 0}>
            <Trash className="h-4 w-4 mr-2" />
            Delete All
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Customers</span>
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>
            <p className="text-2xl font-bold">{totalCustomers}</p>
            <p className="text-xs text-muted-foreground mt-1">{activeCustomers} Active • {inactiveCustomers} Inactive</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Revenue</span>
              <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <IndianRupee className="h-5 w-5 text-emerald-500" />
              </div>
            </div>
            <p className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">From {totalOrders} orders</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Orders</span>
              <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-blue-500" />
              </div>
            </div>
            <p className="text-2xl font-bold">{totalOrders}</p>
            <p className="text-xs text-muted-foreground mt-1">All customers combined</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Active Customers</span>
              <div className="h-9 w-9 rounded-lg bg-green-500/10 flex items-center justify-center">
                <UserCheck className="h-5 w-5 text-green-500" />
              </div>
            </div>
            <p className="text-2xl font-bold">{activeCustomers}</p>
            <p className="text-xs text-muted-foreground mt-1">With orders</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, phone or customer ID..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant={statusFilter === "All" ? "default" : "outline"} size="sm" onClick={() => setStatusFilter("All")}>All</Button>
          <Button variant={statusFilter === "Active" ? "default" : "outline"} size="sm" onClick={() => setStatusFilter("Active")}>Active</Button>
          <Button variant={statusFilter === "Inactive" ? "default" : "outline"} size="sm" onClick={() => setStatusFilter("Inactive")}>Inactive</Button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">Showing {filtered.length} of {localCustomers.length} customers</p>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((customer) => (
          <Card key={customer.id} className="hover:shadow-xl transition-all duration-300 group">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-lg font-bold text-primary">
                    {customer.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "C"}
                  </div>
                  <div>
                    <Badge className={`text-[10px] px-2 py-0.5 ${customer.isActive !== false ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
                      {customer.isActive !== false ? "Active" : "Inactive"}
                    </Badge>
                    <div className="flex items-center gap-1 mt-0.5">
                      <p className="text-[10px] text-muted-foreground">ID: {customer.customerId || 'Not assigned'}</p>
                      {customer.customerId && (
                        <button onClick={() => copyToClipboard(customer.customerId!, `cust-${customer.id}`)} className="p-0.5 hover:bg-primary/10 rounded">
                          {copiedId === `cust-${customer.id}` ? <Check className="h-2.5 w-2.5 text-green-500" /> : <Copy className="h-2.5 w-2.5 text-muted-foreground" />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary hover:text-white transition-all" onClick={() => viewCustomerDetails(customer)} title="View Details">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-red-500 hover:text-white transition-all" onClick={() => { setCustomerToDelete(customer); setDeleteDialogOpen(true); }} title="Delete Customer">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <h3 className="font-bold text-lg mb-2">{customer.name}</h3>

              <div className="space-y-1.5 mt-2 text-xs text-muted-foreground">
                <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> {customer.email}</p>
                <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> {customer.phone || "Not provided"}</p>
                <p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" /> {formatAddress(customer.address)}</p>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="text-center flex-1">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Total Spent</p>
                  <p className="font-bold text-primary text-sm">₹{(customer.totalSpent || 0).toLocaleString()}</p>
                </div>
                <div className="text-center flex-1 border-x px-4">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Orders</p>
                  <p className="font-bold text-foreground text-sm">{customer.orderCount || 0}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(customer)} className="text-xs hover:bg-primary/10 transition-all">
                  {customer.isActive !== false ? "Deactivate" : "Activate"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No customers found</p>
        </div>
      )}

      {/* Customer Detail Dialog with Orders */}
      <Dialog open={!!viewCustomer} onOpenChange={() => setViewCustomer(null)}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto p-0 rounded-2xl">
          {viewCustomer && (
            <div className="relative">
              {/* Hero Header */}
              <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent p-6 border-b">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                      {viewCustomer.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "C"}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">{viewCustomer.name}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={viewCustomer.isActive !== false ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}>
                          {viewCustomer.isActive !== false ? "Active" : "Inactive"}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground">ID:</span>
                          <code className="text-xs bg-muted px-2 py-0.5 rounded">{viewCustomer.customerId || 'Not assigned'}</code>
                          {viewCustomer.customerId && (
                            <button onClick={() => copyToClipboard(viewCustomer.customerId!, `detail-cust`)} className="p-0.5 hover:bg-primary/10 rounded">
                              {copiedId === `detail-cust` ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3 text-muted-foreground" />}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <DialogHeader className="p-0">
                    <DialogTitle className="sr-only">Customer Details</DialogTitle>
                  </DialogHeader>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Loading indicator for orders */}
                {fetchingOrdersForCustomer && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2 text-muted-foreground">Loading orders...</span>
                  </div>
                )}

                {!fetchingOrdersForCustomer && (
                  <>
                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-primary/5 rounded-xl p-4 text-center">
                        <IndianRupee className="w-5 h-5 text-primary mx-auto mb-2" />
                        <p className="text-2xl font-bold text-primary">₹{(viewCustomer.totalSpent || 0).toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Total Spent</p>
                      </div>
                      <div className="bg-primary/5 rounded-xl p-4 text-center">
                        <ShoppingBag className="w-5 h-5 text-primary mx-auto mb-2" />
                        <p className="text-2xl font-bold text-primary">{customerOrders.length}</p>
                        <p className="text-xs text-muted-foreground">Total Orders</p>
                      </div>
                      <div className="bg-primary/5 rounded-xl p-4 text-center">
                        <Award className="w-5 h-5 text-primary mx-auto mb-2" />
                        <p className="text-2xl font-bold text-primary">{viewCustomer.orderCount || 0}</p>
                        <p className="text-xs text-muted-foreground">Items Purchased</p>
                      </div>
                    </div>

                    {/* Two Column Layout */}
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Contact Information */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                          <UserCheck className="w-4 h-4" /> Contact Information
                        </h3>
                        <div className="bg-muted/30 rounded-xl p-4 space-y-3">
                          <div className="flex items-center gap-3">
                            <Mail className="w-4 h-4 text-primary" />
                            <div>
                              <p className="text-xs text-muted-foreground">Email Address</p>
                              <p className="text-sm font-medium">{viewCustomer.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Phone className="w-4 h-4 text-primary" />
                            <div>
                              <p className="text-xs text-muted-foreground">Phone Number</p>
                              <p className="text-sm font-medium">{viewCustomer.phone || "Not provided"}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-primary" />
                            <div>
                              <p className="text-xs text-muted-foreground">Customer Since</p>
                              <p className="text-sm font-medium">{formatDate(viewCustomer.createdAt)}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Shipping Address */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                          <MapPin className="w-4 h-4" /> Shipping Address
                        </h3>
                        <div className="bg-muted/30 rounded-xl p-4">
                          {viewCustomer.address?.street || viewCustomer.address?.city || viewCustomer.address?.pincode ? (
                            <div className="space-y-1">
                              {viewCustomer.address.street && <p className="text-sm">{viewCustomer.address.street}</p>}
                              <p className="text-sm">
                                {viewCustomer.address.city && `${viewCustomer.address.city}, `}
                                {viewCustomer.address.state && `${viewCustomer.address.state}`}
                                {viewCustomer.address.pincode && ` - ${viewCustomer.address.pincode}`}
                              </p>
                              <p className="text-sm">{viewCustomer.address.country || "India"}</p>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground italic">No address provided</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Order History Section with Fixed Date Display */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4" /> Order History ({customerOrders.length})
                      </h3>

                      {customerOrders.length > 0 ? (
                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                          {customerOrders.map((order, idx) => (
                            <div key={order.id || idx} className="bg-muted/20 rounded-xl p-4 hover:shadow-md transition-all">
                              <div className="flex items-center gap-4">
                                {/* Left side - Product Images */}
                                <div className="flex-shrink-0">
                                  {order.items && order.items.length > 0 ? (
                                    <div className="relative">
                                      <img
                                        src={order.items[0]?.productImage || order.items[0]?.image || '/placeholder-image.jpg'}
                                        alt={order.items[0]?.productName || order.items[0]?.name || 'Product'}
                                        className="w-16 h-16 rounded-lg object-cover border bg-white"
                                        onError={(e) => (e.currentTarget.src = '/placeholder-image.jpg')}
                                      />
                                      {order.items.length > 1 && (
                                        <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center">
                                          +{order.items.length - 1}
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                                      <Package className="w-6 h-6 text-muted-foreground" />
                                    </div>
                                  )}
                                </div>

                                {/* Right side - Order Details */}
                                <div className="flex-1 flex items-center justify-between">
                                  <div className="space-y-1">
                                    {/* Order ID */}
                                    <div className="flex items-center gap-2">
                                      <p className="font-mono font-semibold text-primary">#{order.orderNumber || order.id?.slice(-8) || 'N/A'}</p>
                                      <button
                                        onClick={() => copyToClipboard(order.orderNumber || order.id, `order-${order.id}`)}
                                        className="p-1 hover:bg-primary/10 rounded transition-all"
                                      >
                                        {copiedId === `order-${order.id}` ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3 text-muted-foreground" />}
                                      </button>
                                    </div>

                                    {/* Date and Items - Fixed Date Display */}
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                      <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {formatOrderDate(order)}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Package className="w-3 h-3" />
                                        {order.items?.length || 0} items
                                      </span>
                                      <span className="flex items-center gap-1 text-emerald-600 font-medium">
                                        <Truck className="w-3 h-3" />
                                        Est: {calculateEstimatedDelivery(order.createdAt || order.date)}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Amount and Status */}
                                  <div className="text-right">
                                    <p className="text-lg font-bold text-primary">₹{(order.total || order.totalAmount || 0).toLocaleString()}</p>
                                    <Badge className={`text-[10px] mt-1 ${getStatusColor(order.orderStatus || order.status || "Confirmed")}`}>
                                      {order.orderStatus || order.status || "Confirmed"}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-muted/30 rounded-xl p-8 text-center">
                          <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                          <p className="text-muted-foreground">No orders yet</p>
                          <p className="text-xs text-muted-foreground mt-1">Orders placed by this customer will appear here</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Footer Actions */}
              <div className="border-t p-4 bg-muted/20 flex justify-end rounded-b-2xl">
                <Button variant="outline" onClick={() => setViewCustomer(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Customer Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete Customer</DialogTitle>
            <DialogDescription>Are you sure you want to delete this customer? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          {customerToDelete && (
            <div className="p-3 bg-destructive/10 rounded-lg">
              <p className="font-medium">{customerToDelete.name}</p>
              <p className="text-sm text-muted-foreground">{customerToDelete.email}</p>
              <p className="text-xs text-muted-foreground mt-1">{customerToDelete.orderCount || 0} orders • ₹{(customerToDelete.totalSpent || 0).toLocaleString()} spent</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteCustomer} disabled={deleting}>
              {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete All Customers Dialog */}
      <Dialog open={deleteAllDialogOpen} onOpenChange={setDeleteAllDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete All Customers</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete all {localCustomers.length} customers? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="p-3 bg-destructive/10 rounded-lg">
            <p className="font-medium text-destructive">Warning: This will permanently delete:</p>
            <ul className="text-sm text-muted-foreground mt-2 space-y-1">
              <li>• {localCustomers.length} customer records</li>
              <li>• All associated order histories</li>
              <li>• Customer contact information</li>
            </ul>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteAllDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={deleteAllCustomers} disabled={deletingAll}>
              {deletingAll && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete All Customers
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}