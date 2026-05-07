import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Search, AlertTriangle, PackageCheck, PackageMinus, Eye, TrendingUp, Package, 
  X, ZoomIn, Star, IndianRupee, Tag, Info, Weight, Gem,
  Building2, PlusCircle, MinusCircle, History, Clock, Calendar, 
  ArrowUpCircle, ArrowDownCircle, Loader2, Truck, Shield, HeartHandshake,
  Award, BadgeCheck, Medal, Sparkles, GemIcon, Layers, ClipboardList,
  ChevronLeft, ChevronRight, FolderTree
} from "lucide-react";
import { useState, useEffect } from "react";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useJewelleryCMS } from "@/context/JewelleryCMSContext";
import type { Product } from "@/context/JewelleryCMSContext";
import { toast } from "@/hooks/use-toast";

const statusColors: Record<string, string> = {
  "In Stock": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  "Low Stock": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  "Out of Stock": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

// Helper function for stock status
const getStockStatus = (stock: number): "In Stock" | "Low Stock" | "Out of Stock" => {
  if (stock === 0) return "Out of Stock";
  if (stock <= 5) return "Low Stock";
  return "In Stock";
};

// ==================== INVENTORY VIEW DIALOG WITH FULL DETAILS ====================

const InventoryViewDialog = ({ 
  item, 
  onClose,
  onUpdateStock 
}: { 
  item: Product | null; 
  onClose: () => void;
  onUpdateStock: (id: string, quantity: number, action: "add" | "remove", notes: string) => Promise<void>;
}) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [stockAdjustAmount, setStockAdjustAmount] = useState<number>(1);
  const [showStockDialog, setShowStockDialog] = useState<"add" | "remove" | null>(null);
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "specs" | "care" | "reviews">("details");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { inventoryLogs, getCurrentGoldRate } = useJewelleryCMS();

  if (!item) return null;

  const productLogs = (inventoryLogs || []).filter(log => log.productId === item.id).slice(0, 10);
  const inventoryValue = (item.stock || 0) * (item.price || 0);
  const stockPct = item.stock > 0 ? Math.min(100, Math.round((item.stock / (item.stock + 10)) * 100)) : 0;
  const profitMargin = item.price && item.purchasePrice 
    ? ((item.price - item.purchasePrice) / item.price * 100).toFixed(1) 
    : "0";
  const goldRate = item.goldDetails && getCurrentGoldRate 
    ? getCurrentGoldRate(item.goldDetails.purity) 
    : 0;
  const reviewRating = item.reviews?.rating || 4.5;
  const reviewCount = item.reviews?.count || 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR', 
      maximumFractionDigits: 0 
    }).format(value);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % (item.images?.length || 1));
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + (item.images?.length || 1)) % (item.images?.length || 1));
  };

  const handleStockUpdate = async () => {
    if (!item) return;
    setUpdating(true);
    try {
      const notes = showStockDialog === "add" 
        ? `Added ${stockAdjustAmount} units to stock`
        : `Removed ${stockAdjustAmount} units from stock`;
      await onUpdateStock(item.id, stockAdjustAmount, showStockDialog === "add" ? "add" : "remove", notes);
      toast({ 
        title: "Success", 
        description: `${showStockDialog === "add" ? "Added" : "Removed"} ${stockAdjustAmount} units to ${item.name}` 
      });
      setShowStockDialog(null);
      setStockAdjustAmount(1);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      <Dialog open={!!item} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl p-0">
          <DialogHeader>
            <DialogTitle className="sr-only">Product Details</DialogTitle>
            <DialogDescription className="sr-only">
              View complete product information including specifications, care instructions, and reviews.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid md:grid-cols-[0.8fr_1.2fr] gap-0">
            {/* Left Column - Images */}
            <div className="p-4 bg-gradient-to-br from-secondary/20 to-secondary/5">
              <div className="space-y-3">
                <div className="relative group">
                  <div className="overflow-hidden rounded-xl bg-secondary/30">
                    <img
                      src={item.images?.[currentImageIndex] || item.images?.[0] || '/placeholder-image.jpg'}
                      alt={item.name}
                      className="w-full h-60 object-cover transition-transform duration-300 group-hover:scale-105 cursor-pointer"
                      onClick={() => setIsZoomed(true)}
                    />
                  </div>
                  
                  {(item.images?.length || 0) > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  )}
                  
                  <button
                    onClick={() => setIsZoomed(true)}
                    className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                </div>

                {(item.images?.length || 0) > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {item.images?.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                          currentImageIndex === idx 
                            ? 'border-primary ring-2 ring-primary/20' 
                            : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="p-6 space-y-5">
              {/* Header */}
              <div>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-foreground line-clamp-2">{item.name}</h2>
                    <p className="text-xs text-muted-foreground font-mono mt-1">SKU: {item.sku}</p>
                  </div>
                  <Badge className={`${statusColors[getStockStatus(item.stock)]} shrink-0 px-3 py-1`}>
                    {getStockStatus(item.stock)}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < Math.floor(reviewRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">{reviewRating}</span>
                  <span className="text-xs text-muted-foreground">({reviewCount} reviews)</span>
                </div>
                
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <Badge variant="outline" className="rounded-full text-xs px-3 py-1 flex items-center gap-1">
                    <FolderTree className="h-3 w-3" />
                    {item.category || "Uncategorized"}
                  </Badge>
                  {item.brand && (
                    <Badge variant="outline" className="rounded-full text-xs px-3 py-1">{item.brand}</Badge>
                  )}
                  {item.specifications?.material && (
                    <Badge variant="outline" className="rounded-full text-xs px-3 py-1">{item.specifications.material}</Badge>
                  )}
                </div>
              </div>

              {/* Price and Stock Info */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-primary/5 border border-primary/20">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Selling Price</p>
                  <p className="text-2xl font-bold text-primary flex items-center justify-center gap-0.5">
                    <IndianRupee className="h-5 w-5" />
                    {(item.price || 0).toLocaleString()}
                  </p>
                </div>
                <div className="text-center border-l border-border px-3">
                  <p className="text-xs text-muted-foreground mb-1">Purchase Price</p>
                  <p className="text-lg font-semibold text-muted-foreground">
                    ₹{(item.purchasePrice || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Stock Management */}
              <div className="space-y-3 p-4 rounded-xl bg-secondary/20 border border-border/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Current Stock</p>
                    <p className="text-3xl font-bold">
                      {item.stock || 0} <span className="text-base font-normal text-muted-foreground">units</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-muted-foreground">Inventory Value</p>
                    <p className="text-2xl font-bold text-primary">{formatCurrency(inventoryValue)}</p>
                  </div>
                </div>
                <Progress value={stockPct} className="h-2" />
                <p className="text-xs text-muted-foreground">Profit Margin: {profitMargin}%</p>
                
                <div className="flex gap-3 pt-2">
                  <Button 
                    onClick={() => setShowStockDialog("add")}
                    className="flex-1 gap-2 h-10 rounded-xl"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Add Stock
                  </Button>
                  <Button 
                    onClick={() => setShowStockDialog("remove")}
                    className="flex-1 gap-2 h-10 rounded-xl"
                    variant="outline"
                    disabled={item.stock === 0}
                  >
                    <MinusCircle className="h-4 w-4" />
                    Remove Stock
                  </Button>
                </div>
              </div>

              {/* Ring Sizes (if Rings category) */}
              {item.category === "Rings" && 
                item.specifications?.ringSizes && 
                item.specifications.ringSizes.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Available Ring Sizes</p>
                    <div className="flex gap-2 flex-wrap">
                      {item.specifications.ringSizes.map(size => (
                        <span
                          key={size}
                          className="w-10 h-10 rounded-full border border-border bg-secondary/50 flex items-center justify-center text-sm font-medium"
                        >
                          {size}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
              {/* Tabs for Details, Specs, Care, Reviews */}
              <div className="border-b">
                <div className="flex gap-4 overflow-x-auto">
                  {[
                    { id: "details", label: "Details", icon: Info },
                    { id: "specs", label: "Specifications", icon: Tag },
                    { id: "care", label: "Care Instructions", icon: HeartHandshake },
                    { id: "reviews", label: "Reviews", icon: Star },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-all relative whitespace-nowrap ${
                        activeTab === tab.id ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <tab.icon className="h-4 w-4" />
                      {tab.label}
                      {activeTab === tab.id && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Details Tab */}
              {activeTab === "details" && (
                <div className="space-y-4">
                  {item.description && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Description</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                    </div>
                  )}
                  
                  {/* Gold Details */}
                  {item.goldDetails && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-secondary/30">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Weight className="h-3 w-3" /> Weight
                        </p>
                        <p className="font-semibold text-sm mt-1">{item.goldDetails.weight || 0} grams</p>
                      </div>
                      <div className="p-3 rounded-lg bg-secondary/30">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Gem className="h-3 w-3" /> Purity
                        </p>
                        <p className="font-semibold text-sm mt-1">{item.goldDetails.purity || "N/A"}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-secondary/30">
                        <p className="text-xs text-muted-foreground">Gold Rate</p>
                        <p className="font-semibold text-sm mt-1">₹{goldRate}/g</p>
                      </div>
                      <div className="p-3 rounded-lg bg-secondary/30">
                        <p className="text-xs text-muted-foreground">Making Charges</p>
                        <p className="font-semibold text-sm mt-1">{item.goldDetails.makingCharge || 0}%</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Additional Info */}
                  {(item.additionalInfo?.delivery || item.additionalInfo?.returns || item.additionalInfo?.payment) && (
                    <div className="grid grid-cols-2 gap-3 p-4 bg-secondary/30 rounded-xl">
                      {item.additionalInfo?.delivery && (
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4 text-primary" />
                          <div>
                            <p className="text-xs font-medium">Delivery</p>
                            <p className="text-xs text-muted-foreground">{item.additionalInfo.delivery}</p>
                          </div>
                        </div>
                      )}
                      {item.additionalInfo?.returns && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-primary" />
                          <div>
                            <p className="text-xs font-medium">Returns</p>
                            <p className="text-xs text-muted-foreground">{item.additionalInfo.returns}</p>
                          </div>
                        </div>
                      )}
                      {item.additionalInfo?.payment && (
                        <div className="flex items-center gap-2 col-span-2">
                          <Shield className="h-4 w-4 text-primary" />
                          <div>
                            <p className="text-xs font-medium">Payment</p>
                            <p className="text-xs text-muted-foreground">{item.additionalInfo.payment}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Tags</p>
                      <div className="flex gap-2 flex-wrap">
                        {item.tags.map(tag => (
                          <span key={tag} className="text-xs px-3 py-1.5 rounded-full bg-muted">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Specifications Tab */}
              {activeTab === "specs" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-secondary/30">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Gem className="h-3 w-3" /> Material
                      </p>
                      <p className="font-semibold text-sm mt-1">{item.specifications?.material || item.goldDetails?.purity || "18K Gold"}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/30">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Weight className="h-3 w-3" /> Weight
                      </p>
                      <p className="font-semibold text-sm mt-1">{item.goldDetails?.weight || 0}g</p>
                    </div>
                    
                    <div className="p-3 rounded-lg bg-secondary/30">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Sparkles className="h-3 w-3" /> Finish
                      </p>
                      <p className="font-semibold text-sm mt-1">{item.specifications?.finish || "High Polish"}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/30">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <BadgeCheck className="h-3 w-3" /> Hallmark
                      </p>
                      <p className="font-semibold text-sm mt-1">{item.specifications?.hallmark || "BIS Hallmarked"}</p>
                    </div>
                    
                    <div className="p-3 rounded-lg bg-secondary/30">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Medal className="h-3 w-3" /> Certification
                      </p>
                      <p className="font-semibold text-sm mt-1">{item.specifications?.certification || "IGI Certified"}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/30">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <GemIcon className="h-3 w-3" /> Purity
                      </p>
                      <p className="font-semibold text-sm mt-1">{item.goldDetails?.purity || "18K / 22K"}</p>
                    </div>
                    
                    {item.specifications?.stoneType && item.specifications.stoneType !== "No Stone" && (
                      <>
                        <div className="p-3 rounded-lg bg-secondary/30">
                          <p className="text-xs text-muted-foreground">Stone Type</p>
                          <p className="font-semibold text-sm mt-1">{item.specifications.stoneType}</p>
                        </div>
                        {item.specifications.stoneWeight && item.specifications.stoneWeight > 0 && (
                          <div className="p-3 rounded-lg bg-secondary/30">
                            <p className="text-xs text-muted-foreground">Stone Weight</p>
                            <p className="font-semibold text-sm mt-1">{item.specifications.stoneWeight} ct</p>
                          </div>
                        )}
                      </>
                    )}
                    
                    {item.specifications?.occasion && (
                      <div className="p-3 rounded-lg bg-secondary/30">
                        <p className="text-xs text-muted-foreground">Occasion</p>
                        <p className="font-semibold text-sm mt-1">{item.specifications.occasion}</p>
                      </div>
                    )}
                    {item.specifications?.gender && (
                      <div className="p-3 rounded-lg bg-secondary/30">
                        <p className="text-xs text-muted-foreground">Gender</p>
                        <p className="font-semibold text-sm mt-1">{item.specifications.gender}</p>
                      </div>
                    )}
                    
                    {item.specifications?.warranty && (
                      <div className="p-3 rounded-lg bg-secondary/30 col-span-2">
                        <p className="text-xs text-muted-foreground">Warranty</p>
                        <p className="font-semibold text-sm mt-1">{item.specifications.warranty}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Care Instructions Tab */}
              {activeTab === "care" && (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-secondary/30">
                    <p className="text-sm font-medium mb-3 flex items-center gap-2">
                      <HeartHandshake className="h-4 w-4 text-primary" />
                      Care Instructions
                    </p>
                    <ul className="space-y-2">
                      {item.careInstructions?.instructions?.map((instruction, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-primary">•</span>
                          {instruction}
                        </li>
                      )) || (
                        <li className="text-sm text-muted-foreground">No care instructions available</li>
                      )}
                    </ul>
                  </div>
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === "reviews" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30">
                    <div className="text-center">
                      <p className="text-4xl font-bold text-primary">{reviewRating}</p>
                      <div className="flex items-center justify-center mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${i < Math.floor(reviewRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{reviewCount} reviews</p>
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">Customer Reviews Summary</p>
                      <p className="text-xs text-muted-foreground">
                        Based on {reviewCount} customer reviews. Average rating {reviewRating} out of 5.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Close Button */}
              <div className="flex gap-3 pt-4 border-t">
                <Button className="flex-1 gap-2 h-10 rounded-xl text-sm" onClick={onClose}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stock Adjustment Dialog */}
      <Dialog open={!!showStockDialog} onOpenChange={() => setShowStockDialog(null)}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {showStockDialog === "add" ? "Add Stock" : "Remove Stock"}
            </DialogTitle>
            <DialogDescription>
              {showStockDialog === "add" 
                ? "Increase the inventory quantity for this product."
                : "Decrease the inventory quantity for this product."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Product: <span className="font-medium text-foreground">{item?.name}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Current Stock: <span className="font-bold text-foreground">{item?.stock || 0} units</span>
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Quantity</label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-xl"
                  onClick={() => setStockAdjustAmount(Math.max(1, stockAdjustAmount - 1))}
                  disabled={updating}
                >
                  <MinusCircle className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={stockAdjustAmount}
                  onChange={(e) => setStockAdjustAmount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="text-center h-10 rounded-xl"
                  min={1}
                  max={showStockDialog === "remove" ? item?.stock : undefined}
                  disabled={updating}
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-xl"
                  onClick={() => setStockAdjustAmount(stockAdjustAmount + 1)}
                  disabled={updating}
                >
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                className="flex-1 rounded-xl" 
                onClick={() => setShowStockDialog(null)}
                disabled={updating}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 rounded-xl"
                onClick={handleStockUpdate}
                disabled={updating}
              >
                {updating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {showStockDialog === "add" ? "Add Stock" : "Remove Stock"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Zoom Dialog */}
      <Dialog open={isZoomed} onOpenChange={setIsZoomed}>
        <DialogContent className="max-w-md p-0 bg-black/95 border-0">
          <DialogHeader>
            <DialogTitle className="sr-only">Product Image Zoom</DialogTitle>
            <DialogDescription className="sr-only">Zoomed product image view</DialogDescription>
          </DialogHeader>
          <div className="relative p-8 flex items-center justify-center">
            {item?.images && item.images[currentImageIndex] ? (
              <img src={item.images[currentImageIndex]} alt={item.name} className="max-h-[70vh] object-contain" />
            ) : (
              <Gem className="h-32 w-32 text-white/50" />
            )}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 text-white hover:bg-white/20 rounded-full"
              onClick={() => setIsZoomed(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

// ==================== MAIN INVENTORY PAGE ====================

export default function InventoryPage() {
  const [searchParams] = useSearchParams();
  const filterParam = searchParams.get("filter");
  const { 
    products, 
    updateStock,
    getLowStockProducts,
    getOutOfStockCount,
    getInventoryValue,
    loading,
    error
  } = useJewelleryCMS();
  
  // Create local versions of missing functions
  const getGoldInventoryValue = () => {
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
  };
  
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState(filterParam === "out" ? "Out of Stock" : filterParam === "low" ? "Low Stock" : "all");
  const [viewItem, setViewItem] = useState<Product | null>(null);

  // Get unique categories from products
  const categories = [...new Set(products.map(p => p.category))];

  // Filter products
  let filtered = products.filter((p) => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase())
  );
  
  if (categoryFilter !== "all") {
    filtered = filtered.filter(p => p.category === categoryFilter);
  }
  
  if (stockFilter !== "all") {
    if (stockFilter === "In Stock") {
      filtered = filtered.filter(p => p.stock > 5);
    } else if (stockFilter === "Low Stock") {
      filtered = filtered.filter(p => p.stock > 0 && p.stock <= 5);
    } else if (stockFilter === "Out of Stock") {
      filtered = filtered.filter(p => p.stock === 0);
    }
  }

  const totalValue = getInventoryValue();
  const lowStock = getLowStockProducts().length;
  const outOfStock = getOutOfStockCount();
  const goldInventory = getGoldInventoryValue();

  const handleUpdateStock = async (id: string, quantity: number, action: "add" | "remove", notes: string) => {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    let newStock = product.stock;
    if (action === "add") {
      newStock = product.stock + quantity;
    } else {
      newStock = Math.max(0, product.stock - quantity);
    }
    
    await updateStock(id, newStock, "set", notes);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading inventory...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive font-medium mb-2">Error loading inventory</p>
          <p className="text-muted-foreground text-sm">{error}</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div className="space-y-6 p-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-display font-bold">Inventory Management</h1>
          <p className="text-muted-foreground text-sm font-sans">Track and manage your jewelry stock levels</p>
        </div>
      </div>

      {lowStock > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">⚠️ {lowStock} products are low in stock</p>
            <p className="text-xs text-amber-600 dark:text-amber-400">Review and reorder to avoid stockouts</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Inventory Value", value: totalValue, prefix: "₹", icon: TrendingUp, color: "text-primary" },
          { label: "Gold Inventory Value", value: goldInventory.totalValue, prefix: "₹", icon: Gem, color: "text-primary", sub: `${goldInventory.totalWeight.toFixed(1)}g gold` },
          { label: "Low Stock", value: lowStock, icon: AlertTriangle, color: "text-amber-600" },
          { label: "Out of Stock", value: outOfStock, icon: PackageMinus, color: "text-destructive" },
        ].map((s) => (
          <Card key={s.label} className="rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground font-medium">{s.label}</span>
                <div className={`h-11 w-11 rounded-xl bg-secondary flex items-center justify-center ${s.color}`}>
                  <s.icon className="h-5 w-5" />
                </div>
              </div>
              <p className="text-3xl font-bold">
                <AnimatedCounter target={s.value} prefix={s.prefix} />
              </p>
              {(s as any).sub && (
                <p className="text-xs text-muted-foreground mt-1">{(s as any).sub}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name or SKU..." 
            className="pl-9 bg-secondary/50 border-0 h-11 rounded-xl" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px] h-11 rounded-xl">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={stockFilter} onValueChange={setStockFilter}>
          <SelectTrigger className="w-[160px] h-11 rounded-xl">
            <SelectValue placeholder="Stock Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stock</SelectItem>
            <SelectItem value="In Stock">In Stock</SelectItem>
            <SelectItem value="Low Stock">Low Stock</SelectItem>
            <SelectItem value="Out of Stock">Out of Stock</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {filtered.map((item) => {
          const status = getStockStatus(item.stock);
          const stockPct = Math.min(100, Math.round((item.stock / (item.stock + 10)) * 100));
          const profitMargin = ((item.price - item.purchasePrice) / item.price * 100).toFixed(1);
          
          return (
            <Card key={item.id} className="overflow-hidden group hover:border-primary/20 transition-all duration-300">
              <CardContent className="p-0">
                <div className="flex flex-wrap items-center justify-between p-5 gap-4">
                  <div className="min-w-[200px]">
                    <p className="font-bold text-foreground text-lg">{item.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">SKU: {item.sku}</p>
                  </div>

                  <div className="min-w-[120px]">
                    <p className="text-xs text-muted-foreground mb-1">Category</p>
                    <p className="font-medium text-foreground flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 text-primary" />
                      {item.category}
                    </p>
                  </div>

                  <div className="text-center min-w-[120px]">
                    <p className="text-xs text-muted-foreground mb-1">Selling Price</p>
                    <p className="font-bold text-primary text-lg flex items-center justify-center">
                      <IndianRupee className="w-4 h-4" />
                      {item.price.toLocaleString()}
                    </p>
                  </div>

                  <div className="text-center min-w-[100px]">
                    <p className="text-xs text-muted-foreground mb-1">Purchase</p>
                    <p className="font-medium text-foreground">₹{item.purchasePrice.toLocaleString()}</p>
                  </div>

                  <div className="min-w-[140px]">
                    <p className="text-xs text-muted-foreground mb-1">Stock</p>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-sm ${status === "Out of Stock" ? "text-destructive" : status === "Low Stock" ? "text-amber-500" : "text-emerald-600"}`}>
                        {item.stock}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${statusColors[status]}`}>
                        {status}
                      </span>
                    </div>
                    <Progress value={stockPct} className="h-1.5 mt-1" />
                  </div>

                  <div className="min-w-[100px] text-center">
                    <p className="text-xs text-muted-foreground mb-1">Margin</p>
                    <p className="font-bold text-emerald-600 text-lg">{profitMargin}%</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setViewItem(item)}
                      className="h-9 w-9 rounded-xl hover:bg-primary hover:text-white transition-all duration-200 text-primary"
                      title="View details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <Package className="w-12 h-12 text-primary/30 mb-4" />
          <p className="mb-2">No inventory items found</p>
          <p className="text-sm">Try adjusting your search or filters</p>
        </div>
      )}

      <InventoryViewDialog 
        item={viewItem} 
        onClose={() => setViewItem(null)}
        onUpdateStock={handleUpdateStock}
      />
    </motion.div>
  );
}