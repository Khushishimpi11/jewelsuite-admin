import { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo, useRef } from "react";
import { toast } from "@/hooks/use-toast";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ==================== TYPES & INTERFACES ====================

export interface Product {
  _id?: string;
  id: string;
  name: string;
  sku: string;
  price: number;
  purchasePrice: number;
  category: string;
  subCategory?: string;
  collections?: string[];
  stock: number;
  icon: string;
  description?: string;
  images: string[];
  tags?: string[];
  status?: string;
  goldDetails?: {
    weight: number;
    purity: "9K" | "10K" | "14K" | "18K" | "21K" | "22K" | "23K" | "24K";
    makingCharge: number;
  };
  specifications?: any;
  careInstructions?: any;
  additionalInfo?: any;
  reviews?: any;
  createdAt?: string;
}

export interface Order {
  _id?: string;
  id: string;
  orderNumber: string;
  userId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  items: any[];
  subtotal: number;
  tax: number;
  discount: number;
  shippingCharge: number;
  total: number;
  status: "Pending" | "Confirmed" | "Processing" | "Shipped" | "Delivered" | "Cancelled" | "Returned";
  paymentStatus: "Pending" | "Paid" | "Failed" | "Refunded";
  paymentMethod: string;
  date: string;
  timestamp: number;
  transactionType: string;
  trackingNumber?: string;
  notes?: string;
  createdAt?: string;
}

export interface Customer {
  _id?: string;
  id: string;
  customerId?: string;
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  totalSpent: number;
  orderCount: number;
  lastOrderDate?: number;
  notes: string;
  createdAt: number;
  isActive?: boolean;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
  featured: boolean;
  productCount: number;
}

export interface InventoryLog {
  id: string;
  productId: string;
  productName: string;
  action: "added" | "removed" | "order_deduction" | "adjusted";
  quantity: number;
  previousStock: number;
  newStock: number;
  notes: string;
  timestamp: number;
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: string;
  profilePicture?: string;
  isGoogleUser?: boolean;
}

// ==================== CONTEXT TYPE ====================

interface JewelleryCMSContextType {
  products: Product[];
  orders: Order[];
  customers: Customer[];
  categories: Category[];
  inventoryLogs: InventoryLog[];
  loading: boolean;
  error: string | null;
  token: string | null;
  isAuthenticated: boolean;
  admin: Admin | null;
  adminLogin: (email: string, password: string) => Promise<void>;
  adminRegister: (name: string, email: string, password: string, secretKey: string) => Promise<void>;
  googleAdminLogin: (accessToken: string, secretKey: string) => Promise<boolean>;
  logout: () => void;
  fetchProducts: () => Promise<void>;
  fetchOrders: () => Promise<void>;
  fetchCustomers: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  addProduct: (product: any) => Promise<void>;
  updateProduct: (id: string, product: any) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateStock: (id: string, stock: number, action?: string, notes?: string) => Promise<void>;
  updateProductStatus: (id: string, status: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status'], note?: string) => Promise<void>;
  updatePaymentStatus: (orderId: string, paymentStatus: Order['paymentStatus']) => Promise<void>;
  getOrderById: (orderId: string) => Promise<Order | null>;
  addCustomer: (customer: any) => Promise<void>;
  updateCustomer: (id: string, customerData: any) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  toggleCustomerStatus: (id: string, isActive: boolean) => Promise<void>;
  getCustomerById: (id: string) => Promise<Customer | null>;
  getCustomerOrders: (customerId: string) => Order[];

  // Analytics functions
  getTotalRevenue: () => number;
  getTotalOrders: () => number;
  getTotalCustomers: () => number;
  getProductCount: () => number;
  getPendingOrdersCount: () => number;
  getLowStockProducts: () => Product[];
  getOutOfStockCount: () => number;
  getInStockCount: () => number;
  getCategoryCount: () => number;
  getInventoryValue: () => number;
  getGoldInventoryValue: () => { totalWeight: number; totalValue: number };
  getCurrentGoldRate: (purity: string) => number;
  getInventoryLogs: () => InventoryLog[];
  goldRates: any[];
  updateGoldRate: (purity: string, rate: number) => Promise<void>;
  settings: any;
  fetchSettings: () => Promise<void>;
  updateSettings: (settingsData: any) => Promise<void>;
  getSystemStatus: () => Promise<any>;
  clearCache: () => Promise<void>;
  downloadBackup: () => Promise<void>;
}

const JewelleryCMSContext = createContext<JewelleryCMSContextType | undefined>(undefined);

const getAuthHeaders = (token: string | null) => {
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

export function JewelleryCMSProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [goldRates, setGoldRates] = useState<any[]>(() => {
    const saved = localStorage.getItem("gold_rates_history");
    return saved ? JSON.parse(saved) : [
      { purity: "24K", rate: 6500, timestamp: Date.now() },
      { purity: "22K", rate: 6000, timestamp: Date.now() },
      { purity: "18K", rate: 5000, timestamp: Date.now() }
    ];
  });

  const [settings, setSettings] = useState<any>(null);

  const initialFetchDone = useRef(false);

  // ==================== AUTH FUNCTIONS ====================

  const adminLogin = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("admin_token", data.token);
      localStorage.setItem("admin_data", JSON.stringify(data.user));
      setToken(data.token);
      setAdmin(data.user);
      setIsAuthenticated(true);
      toast({ title: "Success", description: "Admin login successful" });
    } catch (err: any) {
      setError(err.message);
      toast({ title: "Login Failed", description: err.message, variant: "destructive" });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const adminRegister = useCallback(async (name: string, email: string, password: string, secretKey: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/admin/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, secretKey }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      localStorage.setItem("admin_token", data.token);
      localStorage.setItem("admin_data", JSON.stringify(data.user));
      setToken(data.token);
      setAdmin(data.user);
      setIsAuthenticated(true);
      toast({ title: "Success", description: "Admin registered successfully" });
    } catch (err: any) {
      setError(err.message);
      toast({ title: "Registration Failed", description: err.message, variant: "destructive" });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ NEW: Google Admin Login
  const googleAdminLogin = useCallback(async (accessToken: string, secretKey: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/admin/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken, secretKey }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Google login failed");
      }

      localStorage.setItem("admin_token", data.token);
      localStorage.setItem("admin_data", JSON.stringify(data.user));
      setToken(data.token);
      setAdmin(data.user);
      setIsAuthenticated(true);
      toast({ title: "Success", description: data.message || "Successfully logged in with Google" });
      return true;
    } catch (err: any) {
      setError(err.message);
      toast({ title: "Google Login Failed", description: err.message, variant: "destructive" });
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_data");
    setToken(null);
    setAdmin(null);
    setIsAuthenticated(false);
    setProducts([]);
    setOrders([]);
    setCustomers([]);
    setCategories([]);
    setInventoryLogs([]);
    initialFetchDone.current = false;
    toast({ title: "Logged Out", description: "You have been logged out" });
  }, []);

  // ==================== PRODUCT FUNCTIONS ====================

  const fetchProducts = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        headers: getAuthHeaders(token),
      });
      const data = await response.json();

      let productsArray = [];
      if (data.products && Array.isArray(data.products)) {
        productsArray = data.products;
      } else if (Array.isArray(data)) {
        productsArray = data;
      }

      const formattedProducts = productsArray.map((p: any) => ({
        id: p._id || p.id,
        _id: p._id,
        name: p.name,
        sku: p.sku,
        price: p.price,
        purchasePrice: p.purchasePrice,
        category: p.category,
        stock: p.stock,
        icon: "💍",
        description: p.description,
        images: p.images || [],
        tags: p.tags,
        status: p.status,
        goldDetails: p.goldDetails,
        specifications: p.specifications,
        careInstructions: p.careInstructions,
        additionalInfo: p.additionalInfo,
        reviews: p.reviews,
        createdAt: p.createdAt,
      }));

      setProducts(formattedProducts);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const addProduct = useCallback(async (product: any) => {
    if (!token) throw new Error("Not authenticated");
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/products/add`, {
        method: "POST",
        headers: getAuthHeaders(token),
        body: JSON.stringify(product),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      await fetchProducts();
      toast({ title: "Success", description: "Product added successfully" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token, fetchProducts]);

  const updateProduct = useCallback(async (id: string, productData: any) => {
    if (!token) throw new Error("Not authenticated");
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(token),
        body: JSON.stringify(productData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      await fetchProducts();
      toast({ title: "Success", description: "Product updated successfully" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token, fetchProducts]);

  const deleteProduct = useCallback(async (id: string) => {
    if (!token) throw new Error("Not authenticated");
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(token),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      await fetchProducts();
      toast({ title: "Success", description: "Product deleted successfully" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token, fetchProducts]);

  const updateStock = useCallback(async (id: string, stock: number, action?: string, notes?: string) => {
    if (!token) throw new Error("Not authenticated");
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}/stock`, {
        method: "PATCH",
        headers: getAuthHeaders(token),
        body: JSON.stringify({ stock }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      await fetchProducts();
      toast({ title: "Success", description: "Stock updated successfully" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      throw err;
    }
  }, [token, fetchProducts]);

  const updateProductStatus = useCallback(async (id: string, status: string) => {
    if (!token) throw new Error("Not authenticated");
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}/status`, {
        method: "PATCH",
        headers: getAuthHeaders(token),
        body: JSON.stringify({ status }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      await fetchProducts();
      toast({ title: "Success", description: `Product status updated to ${status}` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      throw err;
    }
  }, [token, fetchProducts]);

  // ==================== ORDER FUNCTIONS ====================

  const fetchOrders = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/orders/admin/all`, {
        headers: getAuthHeaders(token),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      const ordersArray = data.orders || [];

      const formattedOrders = ordersArray.map((o: any) => {
        let userId = null;
        if (o.userId) {
          if (typeof o.userId === 'object' && o.userId._id) {
            userId = o.userId._id;
          } else if (typeof o.userId === 'string') {
            userId = o.userId;
          }
        }

        return {
          id: o._id,
          _id: o._id,
          orderNumber: o.orderNumber,
          userId: userId,
          customerId: o.customerId || userId,
          customerName: o.customerName || o.userId?.name || "Unknown",
          customerEmail: o.customerEmail || o.userId?.email || "",
          customerPhone: o.customerPhone || "",
          customerAddress: o.shippingAddress || {},
          items: o.items || [],
          subtotal: o.subtotal,
          tax: o.tax,
          discount: o.discount,
          shippingCharge: o.shippingCharge,
          total: o.totalAmount,
          status: o.orderStatus,
          paymentStatus: o.paymentStatus,
          paymentMethod: o.paymentMethod,
          date: new Date(o.createdAt).toLocaleDateString(),
          timestamp: new Date(o.createdAt).getTime(),
          transactionType: "online",
          trackingNumber: o.trackingNumber,
          notes: o.notes,
          createdAt: o.createdAt,
        };
      });

      console.log("✅ Fetched orders:", formattedOrders.length);
      setOrders(formattedOrders);
    } catch (err: any) {
      console.error("Error fetching orders:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const updateOrderStatus = useCallback(async (orderId: string, status: Order['status'], note?: string) => {
    if (!token) throw new Error("Not authenticated");
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/orders/admin/${orderId}/status`, {
        method: "PUT",
        headers: getAuthHeaders(token),
        body: JSON.stringify({ status, note }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      await fetchOrders();
      toast({ title: "Success", description: `Order status updated to ${status}` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token, fetchOrders]);

  const updatePaymentStatus = useCallback(async (orderId: string, paymentStatus: Order['paymentStatus']) => {
    if (!token) throw new Error("Not authenticated");
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/orders/admin/${orderId}/payment`, {
        method: "PUT",
        headers: getAuthHeaders(token),
        body: JSON.stringify({ paymentStatus }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      await fetchOrders();
      toast({ title: "Success", description: `Payment status updated to ${paymentStatus}` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token, fetchOrders]);

  const getOrderById = useCallback(async (orderId: string): Promise<Order | null> => {
    if (!token) return null;
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        headers: getAuthHeaders(token),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      const o = data.order;
      return {
        id: o._id,
        _id: o._id,
        orderNumber: o.orderNumber,
        userId: o.userId?._id || o.userId,
        customerId: o.customerId || o.userId?._id,
        customerName: o.customerName || o.userId?.name || "Unknown",
        customerEmail: o.customerEmail || o.userId?.email || "",
        customerPhone: o.customerPhone || "",
        customerAddress: o.shippingAddress || {},
        items: o.items || [],
        subtotal: o.subtotal,
        tax: o.tax,
        discount: o.discount,
        shippingCharge: o.shippingCharge,
        total: o.totalAmount,
        status: o.orderStatus,
        paymentStatus: o.paymentStatus,
        paymentMethod: o.paymentMethod,
        date: new Date(o.createdAt).toLocaleDateString(),
        timestamp: new Date(o.createdAt).getTime(),
        transactionType: "online",
        trackingNumber: o.trackingNumber,
        notes: o.notes,
        createdAt: o.createdAt,
      };
    } catch (err: any) {
      console.error("Error fetching order:", err);
      return null;
    }
  }, [token]);

  // ==================== CUSTOMER FUNCTIONS ====================

  const fetchCustomers = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/customers`, {
        headers: getAuthHeaders(token),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      const customersArray = data.customers || [];
      const formattedCustomers = customersArray.map((c: any) => ({
        id: c._id,
        _id: c._id,
        customerId: c.customerId,
        name: c.name,
        email: c.email,
        phone: c.phone || "",
        address: c.address || { street: "", city: "", state: "", pincode: "", country: "India" },
        totalSpent: c.totalSpent || 0,
        orderCount: c.orderCount || 0,
        notes: "",
        createdAt: new Date(c.createdAt).getTime(),
        isActive: c.isActive !== false,
      }));

      setCustomers(formattedCustomers);
    } catch (err: any) {
      console.error("Error fetching customers:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // ✅ FIXED: getCustomerOrders function
  const getCustomerOrders = useCallback((customerId: string): Order[] => {
    const customer = customers.find(c => c.id === customerId || c._id === customerId);

    if (!customer) {
      console.log(`❌ Customer not found: ${customerId}`);
      return [];
    }

    const customerOrders = orders.filter(order =>
      order.customerId === customerId ||
      order.customerId === customer._id ||
      order.userId === customerId ||
      order.userId === customer._id ||
      order.customerEmail === customer.email
    );

    console.log(`📦 Found ${customerOrders.length} orders for ${customer.name} (${customer.email})`);
    return customerOrders;
  }, [orders, customers]);

  const addCustomer = useCallback(async (customerData: any) => {
    if (!token) throw new Error("Not authenticated");
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/customer/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: customerData.name,
          email: customerData.email,
          password: "customer123",
          phone: customerData.phone,
          address: customerData.address,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      await fetchCustomers();
      toast({ title: "Success", description: "Customer added successfully" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token, fetchCustomers]);

  const updateCustomer = useCallback(async (id: string, customerData: any) => {
    if (!token) throw new Error("Not authenticated");
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/customers/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(token),
        body: JSON.stringify({
          name: customerData.name,
          phone: customerData.phone,
          address: customerData.address,
          isActive: customerData.isActive,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      await fetchCustomers();
      toast({ title: "Success", description: "Customer updated successfully" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token, fetchCustomers]);

  const deleteCustomer = useCallback(async (id: string) => {
    if (!token) throw new Error("Not authenticated");
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/customers/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(token),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      await fetchCustomers();
      toast({ title: "Success", description: "Customer deleted successfully" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token, fetchCustomers]);

  const toggleCustomerStatus = useCallback(async (id: string, isActive: boolean) => {
    if (!token) throw new Error("Not authenticated");
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/customers/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(token),
        body: JSON.stringify({ isActive }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      await fetchCustomers();
      toast({ title: "Success", description: `Customer ${isActive ? "activated" : "deactivated"} successfully` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token, fetchCustomers]);

  const getCustomerById = useCallback(async (id: string): Promise<Customer | null> => {
    if (!token) return null;
    try {
      const response = await fetch(`${API_BASE_URL}/auth/customers/${id}`, {
        headers: getAuthHeaders(token),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      const c = data.customer;
      return {
        id: c._id,
        _id: c._id,
        customerId: c.customerId,
        name: c.name,
        email: c.email,
        phone: c.phone || "",
        address: c.address || {},
        totalSpent: c.totalSpent || 0,
        orderCount: c.orderCount || 0,
        notes: "",
        createdAt: new Date(c.createdAt).getTime(),
        isActive: c.isActive,
      };
    } catch (err: any) {
      console.error("Error fetching customer:", err);
      return null;
    }
  }, [token]);

  // ==================== CATEGORY FUNCTIONS ====================

  const fetchCategories = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/categories`, {
        headers: getAuthHeaders(token),
      });
      const data = await response.json();
      if (data.success && data.categories) {
        setCategories(data.categories);
      }
    } catch (err: any) {
      console.error("Error fetching categories:", err);
    }
  }, [token]);

  // ==================== ANALYTICS FUNCTIONS ====================

  const getTotalRevenue = useCallback(() => {
    return orders.filter(o => o.status !== "Cancelled").reduce((sum, o) => sum + (o.total || 0), 0);
  }, [orders]);

  const getTotalOrders = useCallback(() => orders.length, [orders]);
  const getTotalCustomers = useCallback(() => customers.length, [customers]);
  const getProductCount = useCallback(() => products.length, [products]);
  const getPendingOrdersCount = useCallback(() => orders.filter(o => o.status === "Pending").length, [orders]);
  const getLowStockProducts = useCallback(() => products.filter(p => p.stock > 0 && p.stock < 5), [products]);
  const getOutOfStockCount = useCallback(() => products.filter(p => p.stock === 0).length, [products]);
  const getInStockCount = useCallback(() => products.filter(p => p.stock > 0).length, [products]);
  const getCategoryCount = useCallback(() => {
    const uniqueCategories = new Set(products.map(p => p.category));
    return uniqueCategories.size;
  }, [products]);

  const getInventoryValue = useCallback(() => {
    return products.reduce((sum, p) => sum + (p.price * p.stock), 0);
  }, [products]);

  const getGoldInventoryValue = useCallback(() => {
    let totalWeight = 0;
    let totalValue = 0;

    products.forEach(product => {
      if (product.goldDetails && product.goldDetails.weight) {
        const weight = product.goldDetails.weight * product.stock;
        totalWeight += weight;
        const goldRate = product.goldDetails.purity === "24K" ? 6500 :
          product.goldDetails.purity === "22K" ? 6000 : 5000;
        totalValue += weight * goldRate;
      }
    });

    return { totalWeight, totalValue };
  }, [products]);

  const updateGoldRate = useCallback(async (purity: string, rate: number) => {
    setGoldRates(prev => {
      const newRates = [
        ...prev,
        { purity, rate, timestamp: Date.now() }
      ];
      localStorage.setItem("gold_rates_history", JSON.stringify(newRates));
      return newRates;
    });
  }, []);

  const getCurrentGoldRate = useCallback((purity: string) => {
    const relevantRates = goldRates.filter(r => r.purity === purity);
    if (relevantRates.length > 0) {
      return relevantRates[relevantRates.length - 1].rate;
    }
    const rates: Record<string, number> = {
      "24K": 6500,
      "22K": 6000,
      "18K": 5000
    };
    return rates[purity] || 5500;
  }, [goldRates]);

  const getInventoryLogs = useCallback(() => {
    return inventoryLogs;
  }, [inventoryLogs]);

  const fetchSettings = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/settings`);
      const data = await response.json();
      if (data.success) {
        setSettings(data.settings);
      }
    } catch (err) {
      console.error("Error fetching settings:", err);
    }
  }, []);

  const updateSettings = useCallback(async (settingsData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(settingsData),
      });
      const data = await response.json();
      if (data.success) {
        setSettings(data.settings);
        toast({ title: "Success", description: "Settings updated successfully" });
      } else {
        throw new Error(data.message);
      }
    } catch (err: any) {
      console.error("Error updating settings:", err);
      toast({ title: "Error", description: err.message, variant: "destructive" });
      throw err;
    }
  }, [token]);

  const getSystemStatus = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/settings/status`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        }
      });
      const data = await response.json();
      return data;
    } catch (err) {
      console.error("Error getting system status:", err);
      return null;
    }
  }, [token]);

  const clearCache = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/settings/clear-cache`, {
        method: "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        }
      });
      const data = await response.json();
      if (data.success) {
        toast({ title: "Success", description: data.message });
      } else {
        throw new Error(data.message);
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      throw err;
    }
  }, [token]);

  const downloadBackup = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/settings/backup`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        }
      });
      if (!response.ok) throw new Error("Failed to download backup");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `jewelskart_backup_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast({ title: "Success", description: "Database backup downloaded successfully!" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  }, [token]);


  // ==================== INITIAL TOKEN LOAD ====================

  useEffect(() => {
    const savedToken = localStorage.getItem("admin_token");
    const savedAdmin = localStorage.getItem("admin_data");

    if (savedToken && savedAdmin) {
      try {
        setToken(savedToken);
        setAdmin(JSON.parse(savedAdmin));
        setIsAuthenticated(true);
      } catch (err) {
        console.error("Error parsing admin data:", err);
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_data");
      }
    }
  }, []);

  // Auto-fetch data when authenticated
  useEffect(() => {
    if (token && !initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchProducts();
      fetchOrders();
      fetchCustomers();
      fetchCategories();
      fetchSettings();
    }
  }, [token, fetchProducts, fetchOrders, fetchCustomers, fetchCategories, fetchSettings]);

  // ==================== CONTEXT VALUE ====================

  const value = useMemo(() => ({
    products,
    orders,
    customers,
    categories,
    inventoryLogs,
    loading,
    error,
    token,
    isAuthenticated,
    admin,
    adminLogin,
    adminRegister,
    googleAdminLogin,
    logout,
    fetchProducts,
    fetchOrders,
    fetchCustomers,
    fetchCategories,
    addProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    updateProductStatus,
    updateOrderStatus,
    updatePaymentStatus,
    getOrderById,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    toggleCustomerStatus,
    getCustomerById,
    getCustomerOrders,
    getTotalRevenue,
    getTotalOrders,
    getTotalCustomers,
    getProductCount,
    getPendingOrdersCount,
    getLowStockProducts,
    getOutOfStockCount,
    getInStockCount,
    getCategoryCount,
    getInventoryValue,
    getGoldInventoryValue,
    getCurrentGoldRate,
    getInventoryLogs,
    goldRates,
    updateGoldRate,
    settings,
    fetchSettings,
    updateSettings,
    getSystemStatus,
    clearCache,
    downloadBackup,
  }), [
    products,
    orders,
    customers,
    categories,
    inventoryLogs,
    loading,
    error,
    token,
    isAuthenticated,
    admin,
    adminLogin,
    adminRegister,
    googleAdminLogin,
    logout,
    fetchProducts,
    fetchOrders,
    fetchCustomers,
    fetchCategories,
    addProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    updateProductStatus,
    updateOrderStatus,
    updatePaymentStatus,
    getOrderById,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    toggleCustomerStatus,
    getCustomerById,
    getCustomerOrders,
    getTotalRevenue,
    getTotalOrders,
    getTotalCustomers,
    getProductCount,
    getPendingOrdersCount,
    getLowStockProducts,
    getOutOfStockCount,
    getInStockCount,
    getCategoryCount,
    getInventoryValue,
    getGoldInventoryValue,
    getCurrentGoldRate,
    getInventoryLogs,
    goldRates,
    updateGoldRate,
    settings,
    fetchSettings,
    updateSettings,
    getSystemStatus,
    clearCache,
    downloadBackup,
  ]);

  return (
    <JewelleryCMSContext.Provider value={value}>
      {children}
    </JewelleryCMSContext.Provider>
  );
}

export function useJewelleryCMS() {
  const context = useContext(JewelleryCMSContext);
  if (context === undefined) {
    throw new Error('useJewelleryCMS must be used within a JewelleryCMSProvider');
  }
  return context;
}