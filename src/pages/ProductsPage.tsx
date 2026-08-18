import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Plus, Search, Eye, Edit, Trash2, PlusCircle, MinusCircle, Upload, Download, FileUp, Gem, X,
  Image as ImageIcon, ChevronLeft, ChevronRight, ZoomIn, Star, Package,
  IndianRupee, Tag, Info, Award, Shield, Truck, Clock,
  AlertTriangle, XCircle, Weight, Sparkles, HeartHandshake,
  BadgeCheck, GemIcon, Medal, ClipboardList, Layers, RefreshCw, FolderTree,
  DollarSign, Scale, Calendar, Hash, User, Gift, Home, ShieldCheck, RotateCcw, CreditCard,
  CheckCircle2, CalendarDays, MapPin, Phone, Mail, Copy, Check, Loader2, Video, Bell
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import notificationApi from "@/services/notificationApi";

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Types
interface GoldDetails {
  weight: number;
  purity: "9K" | "10K" | "14K" | "18K" | "21K" | "22K" | "23K" | "24K";
  makingCharge: number;
}

interface ProductSpecifications {
  material?: string;
  finish?: string;
  hallmark?: string;
  certification?: string;
  ringSizes?: string[];
  gender?: string;
  occasion?: string;
  stoneType?: string;  // "none" | "diamond" | "semi_precious" | "both"
  stoneWeight?: number;
  diamondWeight?: number;
  semiPreciousWeight?: number;
  warranty?: string;
}

interface CareInstructions {
  instructions: string[];
}

interface AdditionalInfo {
  delivery?: string;
  returns?: string;
  payment?: string;
}

interface CloudinaryImage {
  url: string;
  publicId: string;
}

interface GalleryImage {
  url: string;
  publicId: string;
  alt?: string;
}

interface ProductVideo {
  url: string;
  publicId: string;
  duration?: number;
  format?: string;
  thumbnail?: string;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  parentCategory: string | null;
  level: number;
  isActive: boolean;
}

interface CoupleRingDetails {
  womenPrice?: number;
  womenWeight?: number;
  menPrice?: number;
  menWeight?: number;
}

interface Product {
  _id?: string;
  id?: string;
  name: string;
  price: number;
  purchasePrice: number;
  gst?: number;
  category: string | Category;
  categoryId?: string;
  categoryName?: string;
  brand?: string;
  stock?: number;
  isAvailableForOrder?: boolean;
  description: string;
  images: string[];
  mainImage?: CloudinaryImage;
  galleryImages?: GalleryImage[];
  productVideo?: ProductVideo;
  sku: string;
  tags: string[];
  status: "Published" | "Draft" | "Archived";
  featured?: boolean;
  bestSeller?: boolean;
  goldDetails?: GoldDetails;
  coupleRing?: CoupleRingDetails;
  specifications?: ProductSpecifications;
  careInstructions?: CareInstructions;
  additionalInfo?: AdditionalInfo;
  reviews?: {
    rating: number;
    count: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

// Default care instructions
const DEFAULT_CARE_INSTRUCTIONS = [
  "Store in a cool, dry place away from direct sunlight",
  "Clean with a soft, lint-free cloth",
  "Avoid contact with perfumes, lotions, and chemicals",
  "Remove before swimming or bathing"
];

const statusColors: Record<string, string> = {
  Published: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
  Draft: "bg-amber-500/10 text-amber-500 border-amber-500/30",
  Archived: "bg-gray-500/10 text-gray-500 border-gray-500/30",
};

const tagDisplayNames: Record<string, string> = {
  "signature": "Signature",
  "jewellery": "Jewellery",
  "limited-edition": "Limited Edition",
  "bestseller": "Bestseller",
  "premium-pick": "Premium Pick"
};

const tagColors: Record<string, string> = {
  "signature": "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400",
  "jewellery": "bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-900/30 dark:text-teal-400",
  "limited-edition": "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/30 dark:text-rose-400",
  "bestseller": "bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-900/30 dark:text-indigo-400",
  "premium-pick": "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-400",
};

const brandsList = ["JewelsKart Original"];
const tagsList = ["signature", "jewellery", "limited-edition", "bestseller", "premium-pick"];
const ringSizes = ["5", "6", "7", "8", "9", "10", "11", "12"];
const purityOptions = ["9K", "10K", "14K", "18K", "21K", "22K", "23K", "24K"];
const finishOptions = ["High Polish", "Matte", "Brushed", "Antique", "Diamond Cut"];
const hallmarkOptions = ["BIS Hallmarked", "Hallmark Certified", "No Hallmark"];
const certificationOptions = ["IGI Certified", "GIA Certified", "SGL Certified", "Not Certified"];
const genderOptions = ["Women", "Men", "Unisex", "Kids"];
const materialOptions = ["Gold", "Rose Gold"];
const stoneTypeOptions = [
  { label: "No Stone", value: "none" },
  { label: "💎 Diamond", value: "diamond" },
  { label: "💠 Semi Precious", value: "semi_precious" },
  { label: "💎Diamond + 💠 BothSemi Precious stone", value: "both" },  // ✅ YEH NAYA OPTION
];

const getStoneTypeFromOldData = (type?: string): string => {
  if (!type || type === "None" || type === "none") return "none";
  if (type === "Diamond" || type === "diamond") return "diamond";
  if (type === "Semi Precious Stone" || type === "semi_precious") return "semi_precious";
  if (type === "both") return "both";
  return "none";
};
const gstOptions = [
  { label: "0% (Exempt)", value: 0 },
  { label: "3% (Jewellery Standard)", value: 3 },
  { label: "5%", value: 5 },
  { label: "12%", value: 12 },
  { label: "18%", value: 18 },
  { label: "28%", value: 28 },
];

const getSkuPrefix = (category: string): string => {
  const prefixMap: Record<string, string> = {
    "Rings": "R",
    "Earrings": "E",
    "Pendants": "P",
    "Necklaces": "N",
    "Bracelets": "B",
    "Sets": "S",
    "Chains": "C"
  };
  return prefixMap[category] || "PR";
};

const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
};

// Helper to parse saved material specification into selected options
const parseMaterials = (val?: string | string[]): string[] => {
  if (!val) return ["Gold"];
  if (Array.isArray(val)) {
    const list = val.map(s => String(s).trim()).filter(Boolean);
    return list.length > 0 ? list : ["Gold"];
  }
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (!trimmed) return ["Gold"];
    const hasRose = /rose\s*gold/i.test(trimmed);
    const hasPureGold = /(^|[^a-zA-Z])gold([^a-zA-Z]|$)/i.test(trimmed.replace(/rose\s*gold/gi, ""));

    if (hasRose && hasPureGold) {
      return ["Gold", "Rose Gold"];
    } else if (hasRose) {
      return ["Rose Gold"];
    } else if (hasPureGold || trimmed.toLowerCase().includes("gold")) {
      return ["Gold"];
    }
    const parts = trimmed.split(/[,|\/]/).map(s => s.trim()).filter(Boolean);
    return parts.length > 0 ? parts : ["Gold"];
  }
  return ["Gold"];
};

// Helper to check if a category is Couple Ring
const isCoupleRingCategory = (cat?: string | Category, prodName?: string, coupleRing?: any): boolean => {
  if (coupleRing && (coupleRing.womenPrice || coupleRing.menPrice)) return true;
  const name = typeof cat === "string" ? cat : (cat?.name || "");
  const lower = name.trim().toLowerCase().replace(/[-_]/g, " ");
  if (lower === "couple ring" || lower === "couple rings" || lower.includes("couple ring") || lower.includes("couple")) return true;
  const pName = (prodName || "").toLowerCase().trim();
  if (pName.includes("couple ring") || pName.includes("couple set")) return true;
  return false;
};

// ========== PRODUCT FORM COMPONENT ==========
const ProductForm = ({
  product,
  onSubmit,
  onCancel,
  isEdit = false,
  categories = [],
  loading = false
}: {
  product?: Product;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isEdit?: boolean;
  categories?: Category[];
  loading?: boolean;
}) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [existingVideo, setExistingVideo] = useState<string | null>(product?.productVideo?.url || null);
  const [generatingSku, setGeneratingSku] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Separate state for preview images
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [galleryImagePreviews, setGalleryImagePreviews] = useState<string[]>([]);

  // Track removed images for edit mode
  const [removedImagePublicIds, setRemovedImagePublicIds] = useState<string[]>([]);
  const [removedImageUrls, setRemovedImageUrls] = useState<string[]>([]);

  // Initialize existing main image and existing gallery images safely (filtering out duplicate URLs if any)
  const getInitialImages = () => {
    const mainImg = product?.mainImage?.url || (product?.images && product.images[0]) || null;
    const galleryMap = new Map<string, GalleryImage>();

    if (product?.galleryImages) {
      product.galleryImages.forEach(img => {
        if (img.url && img.url !== mainImg && img.url !== '') {
          galleryMap.set(img.url, img);
        }
      });
    }

    if (product?.images) {
      product.images.forEach(url => {
        if (url && url !== mainImg && url !== '' && !galleryMap.has(url)) {
          galleryMap.set(url, { url, publicId: "" });
        }
      });
    }

    return {
      main: mainImg,
      gallery: Array.from(galleryMap.values())
    };
  };

  const initialImages = getInitialImages();
  const [existingMainImage, setExistingMainImage] = useState<string | null>(initialImages.main);
  const [existingGalleryImages, setExistingGalleryImages] = useState<GalleryImage[]>(initialImages.gallery);

  const getCategoryName = (cat: string | Category | undefined): string => {
    if (!cat) return "";
    if (typeof cat === "string") return cat;
    return cat.name || "";
  };

  const [form, setForm] = useState({
    name: product?.name || "",
    price: product?.price?.toString() || "",
    purchasePrice: product?.purchasePrice?.toString() || "",
    gst: product?.gst !== undefined ? product.gst : 3,
    category: getCategoryName(product?.category),
    brand: "JewelsKart Original",
    isAvailableForOrder: product?.isAvailableForOrder !== undefined ? product.isAvailableForOrder : true,
    description: product?.description || "",
    images: [] as string[],
    weight: product?.goldDetails?.weight?.toString() || "",
    purity: product?.goldDetails?.purity || "22K",
    tags: product?.tags || [] as string[],
    status: product?.status || "Draft",
    sku: product?.sku || "",
    womenPrice: product?.coupleRing?.womenPrice !== undefined ? product.coupleRing.womenPrice.toString() : "",
    womenWeight: product?.coupleRing?.womenWeight !== undefined ? product.coupleRing.womenWeight.toString() : "",
    menPrice: product?.coupleRing?.menPrice !== undefined ? product.coupleRing.menPrice.toString() : "",
    menWeight: product?.coupleRing?.menWeight !== undefined ? product.coupleRing.menWeight.toString() : "",
    material: product?.specifications?.material || "Gold",
    materials: parseMaterials(product?.specifications?.material),
    ringSizes: Array.isArray(product?.specifications?.ringSizes) ? product.specifications.ringSizes : [],
    finish: product?.specifications?.finish || "High Polish",
    hallmark: product?.specifications?.hallmark || "BIS Hallmarked",
    certification: product?.specifications?.certification || "IGI Certified",
    gender: product?.specifications?.gender || "Women",
    stoneType: product?.specifications?.stoneType || "none",
    stoneWeight: product?.specifications?.stoneWeight?.toString() || "",
    diamondWeight: product?.specifications?.diamondWeight?.toString() || "",
    semiPreciousWeight: product?.specifications?.semiPreciousWeight?.toString() || "",
    careInstructions: product?.careInstructions?.instructions || DEFAULT_CARE_INSTRUCTIONS,
    delivery: product?.additionalInfo?.delivery || "3-5 Days",
    returns: product?.additionalInfo?.returns || "7 Days Return Policy",
    payment: product?.additionalInfo?.payment || "Secure Payment Options Available",
    reviewRating: product?.reviews?.rating?.toString() || "4.5",
    reviewCount: product?.reviews?.count?.toString() || "0",
  });

  const generateSkuFromBackend = async (category: string) => {
    if (!category || isEdit) return;

    setGeneratingSku(true);
    try {
      const response = await fetch(`${API_BASE_URL}/products/next-sku/${encodeURIComponent(category)}`);

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Backend returned non-JSON response");
      }

      const data = await response.json();

      if (data.success && data.sku) {
        setForm(prev => ({ ...prev, sku: data.sku }));
        toast({ title: "SKU Generated", description: `SKU: ${data.sku}`, variant: "default" });
      } else {
        const prefix = getSkuPrefix(category);
        const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const fallbackSku = `${prefix}-${randomNum}`;
        setForm(prev => ({ ...prev, sku: fallbackSku }));
        toast({ title: "SKU Generated (Fallback)", description: `SKU: ${fallbackSku}`, variant: "default" });
      }
    } catch (error) {
      console.error("Error generating SKU:", error);
      const prefix = getSkuPrefix(category);
      const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const fallbackSku = `${prefix}-${randomNum}`;
      setForm(prev => ({ ...prev, sku: fallbackSku }));
      toast({ title: "SKU Generated (Local)", description: `SKU: ${fallbackSku}`, variant: "default" });
    } finally {
      setGeneratingSku(false);
    }
  };

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || "",
        price: product.price?.toString() || "",
        purchasePrice: product.purchasePrice?.toString() || "",
        gst: product.gst !== undefined ? product.gst : 3,
        category: getCategoryName(product.category),
        brand: "JewelsKart Original",
        isAvailableForOrder: product.isAvailableForOrder !== undefined ? product.isAvailableForOrder : true,
        description: product.description || "",
        images: [] as string[],
        weight: product.goldDetails?.weight?.toString() || "",
        purity: product.goldDetails?.purity || "22K",
        tags: product.tags || [] as string[],
        status: product.status || "Draft",
        sku: product.sku || "",
        womenPrice: product.coupleRing?.womenPrice !== undefined && product.coupleRing?.womenPrice !== null ? product.coupleRing.womenPrice.toString() : "",
        womenWeight: product.coupleRing?.womenWeight !== undefined && product.coupleRing?.womenWeight !== null ? product.coupleRing.womenWeight.toString() : "",
        menPrice: product.coupleRing?.menPrice !== undefined && product.coupleRing?.menPrice !== null ? product.coupleRing.menPrice.toString() : "",
        menWeight: product.coupleRing?.menWeight !== undefined && product.coupleRing?.menWeight !== null ? product.coupleRing.menWeight.toString() : "",
        material: product.specifications?.material || "Gold",
        materials: parseMaterials(product.specifications?.material),
        ringSizes: Array.isArray(product.specifications?.ringSizes) ? product.specifications.ringSizes : [],
        finish: product.specifications?.finish || "High Polish",
        hallmark: product.specifications?.hallmark || "BIS Hallmarked",
        certification: product.specifications?.certification || "IGI Certified",
        gender: product.specifications?.gender || "Women",

        // ✅ FIX 1: Stone Type ko "none" default rakhein
        stoneType: product.specifications?.stoneType || "none",

        // ✅ FIX 2: Stone Weight fields add karein
        stoneWeight: product.specifications?.stoneWeight?.toString() || "",
        diamondWeight: product.specifications?.diamondWeight?.toString() || "",
        semiPreciousWeight: product.specifications?.semiPreciousWeight?.toString() || "",

        careInstructions: product.careInstructions?.instructions || DEFAULT_CARE_INSTRUCTIONS,
        delivery: product.additionalInfo?.delivery || "3-5 Days",
        returns: product.additionalInfo?.returns || "7 Days Return Policy",
        payment: product.additionalInfo?.payment || "Secure Payment Options Available",
        reviewRating: product.reviews?.rating?.toString() || "4.5",
        reviewCount: product.reviews?.count?.toString() || "0",
      });
      const imgs = getInitialImages();
      setExistingMainImage(imgs.main);
      setExistingGalleryImages(imgs.gallery);
    }
  }, [product]);

  useEffect(() => {
    if (!isEdit && !form.sku && form.category) {
      generateSkuFromBackend(form.category);
    }
  }, []);

  const handleCategoryChange = async (value: string) => {
    setForm(prev => ({ ...prev, category: value }));
    if (!isEdit && value) {
      await generateSkuFromBackend(value);
    }
  };

  // Handle main image selection with immediate preview
  const handleMainImageSelect = (file: File) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setMainImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle gallery image selection with immediate previews
  const handleGalleryImageSelect = (files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files);
    const uniqueNewFiles: File[] = [];

    newFiles.forEach(file => {
      // Avoid duplicate files based on name and size
      const isDuplicateFile = galleryFiles.some(f => f.name === file.name && f.size === file.size);
      if (!isDuplicateFile) {
        uniqueNewFiles.push(file);
      }
    });

    if (uniqueNewFiles.length === 0) return;

    setGalleryFiles(prev => [...prev, ...uniqueNewFiles]);

    uniqueNewFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGalleryImagePreviews(prev => {
          // Avoid duplicate previews
          if (prev.includes(reader.result as string)) return prev;
          return [...prev, reader.result as string];
        });
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove main image
  const removeMainImage = () => {
    if (imageFile) {
      setImageFile(null);
      setMainImagePreview(null);
      toast({ title: "Image Removed", description: "Main image has been removed" });
    } else if (existingMainImage) {
      const publicId = product?.mainImage?.publicId;
      if (publicId) {
        setRemovedImagePublicIds(prev => [...prev, publicId]);
      }
      setRemovedImageUrls(prev => [...prev, existingMainImage]);
      setExistingMainImage(null);
      toast({ title: "Image Removed", description: "Main image has been removed" });
    }
  };

  // Remove gallery image
  const removeGalleryImage = (index: number, url: string) => {
    const isNewPreview = galleryImagePreviews.includes(url);
    const newImageIndex = galleryImagePreviews.indexOf(url);

    if (isNewPreview && newImageIndex !== -1) {
      setGalleryImagePreviews(prev => prev.filter((_, i) => i !== newImageIndex));
      setGalleryFiles(prev => prev.filter((_, i) => i !== newImageIndex));
      toast({ title: "Image Removed", description: "New gallery image has been removed" });
    } else {
      const galleryItem = existingGalleryImages.find(img => img.url === url);
      if (galleryItem) {
        if (galleryItem.publicId) {
          setRemovedImagePublicIds(prev => [...prev, galleryItem.publicId]);
        }
        setRemovedImageUrls(prev => [...prev, url]);
        setExistingGalleryImages(prev => prev.filter(img => img.url !== url));
        toast({ title: "Image Removed", description: "Gallery image has been removed" });
      }
    }
  };

  const [customSizeInput, setCustomSizeInput] = useState("");

  const isRingCategory = (cat?: string) => {
    if (!cat) return false;
    const lower = cat.trim().toLowerCase();
    if (lower.includes('earring')) return false;
    return lower === 'rings' || lower === 'ring' || lower.includes('ring');
  };

  const handleRingSizeToggle = (size: string) => {
    setForm(prev => ({
      ...prev,
      ringSizes: prev.ringSizes.includes(size)
        ? prev.ringSizes.filter(s => s !== size)
        : [...prev.ringSizes, size]
    }));
  };

  const handleAddCustomRingSize = () => {
    const trimmed = customSizeInput.trim();
    if (!trimmed) return;
    if (!form.ringSizes.includes(trimmed)) {
      setForm(prev => ({
        ...prev,
        ringSizes: [...prev.ringSizes, trimmed]
      }));
      toast({ title: "Size Added", description: `Added ring size ${trimmed}` });
    }
    setCustomSizeInput("");
  };

  const handleRemoveRingSize = (size: string) => {
    setForm(prev => ({
      ...prev,
      ringSizes: prev.ringSizes.filter(s => s !== size)
    }));
  };

  const handleCareInstructionChange = (index: number, value: string) => {
    const newInstructions = [...form.careInstructions];
    newInstructions[index] = value;
    setForm({ ...form, careInstructions: newInstructions });
  };

  const addCareInstruction = () => {
    setForm({ ...form, careInstructions: [...form.careInstructions, ""] });
  };

  const removeCareInstruction = (index: number) => {
    setForm({ ...form, careInstructions: form.careInstructions.filter((_, i) => i !== index) });
  };

  const handleMaterialToggle = (mat: "Gold" | "Rose Gold") => {
    setForm(prev => {
      const exists = prev.materials.includes(mat);
      let updated: string[];
      if (exists) {
        if (prev.materials.length === 1) {
          // If only 1 selected, switch to the other option so at least one is selected
          const other = mat === "Gold" ? "Rose Gold" : "Gold";
          updated = [other];
        } else {
          updated = prev.materials.filter(m => m !== mat);
        }
      } else {
        updated = [...prev.materials, mat];
      }

      const matString = updated.includes("Gold") && updated.includes("Rose Gold")
        ? "Gold, Rose Gold"
        : (updated[0] || "Gold");

      return {
        ...prev,
        materials: updated,
        material: matString
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isSubmitting || loading) return;

    if (!form.name) {
      toast({ title: "Error", description: "Product name is required", variant: "destructive" });
      return;
    }

    if (!form.sku) {
      toast({ title: "Error", description: "SKU is required. Please wait for auto-generation or select a category.", variant: "destructive" });
      return;
    }

    if (!form.category) {
      toast({ title: "Error", description: "Category is required", variant: "destructive" });
      return;
    }

    const isCouple = isCoupleRingCategory(form.category, form.name, product?.coupleRing) ||
      (parseFloat(form.womenPrice) > 0 || parseFloat(form.menPrice) > 0);

    if (isCouple) {
      if (!form.womenPrice || parseFloat(form.womenPrice) <= 0) {
        toast({ title: "Error", description: "Valid Women Ring Price is required", variant: "destructive" });
        return;
      }
      if (!form.womenWeight || parseFloat(form.womenWeight) <= 0) {
        toast({ title: "Error", description: "Valid Women Ring Weight is required", variant: "destructive" });
        return;
      }
      if (!form.menPrice || parseFloat(form.menPrice) <= 0) {
        toast({ title: "Error", description: "Valid Men Ring Price is required", variant: "destructive" });
        return;
      }
      if (!form.menWeight || parseFloat(form.menWeight) <= 0) {
        toast({ title: "Error", description: "Valid Men Ring Weight is required", variant: "destructive" });
        return;
      }
    } else {
      if (!form.price || parseFloat(form.price) <= 0) {
        toast({ title: "Error", description: "Valid selling price is required", variant: "destructive" });
        return;
      }
    }

    setIsSubmitting(true);

    const keptImages: string[] = [];
    if (existingMainImage) {
      keptImages.push(existingMainImage);
    }
    existingGalleryImages.forEach(img => {
      if (img.url) keptImages.push(img.url);
    });

    const savedMaterial = form.materials.includes("Gold") && form.materials.includes("Rose Gold")
      ? "Gold, Rose Gold"
      : (form.materials[0] || form.material || "Gold");

    const totalPrice = isCouple
      ? (parseFloat(form.womenPrice) || 0) + (parseFloat(form.menPrice) || 0)
      : (parseFloat(form.price) || 0);

    const totalWeight = isCouple
      ? (parseFloat(form.womenWeight) || 0) + (parseFloat(form.menWeight) || 0)
      : (parseFloat(form.weight) || 0);

    const coupleRingData = isCouple ? {
      womenPrice: parseFloat(form.womenPrice) || 0,
      womenWeight: parseFloat(form.womenWeight) || 0,
      menPrice: parseFloat(form.menPrice) || 0,
      menWeight: parseFloat(form.menWeight) || 0,
    } : undefined;

    const submitData = {
      ...form,
      material: savedMaterial,
      price: totalPrice,
      purchasePrice: parseFloat(form.purchasePrice) || 0,
      gst: form.gst,
      isAvailableForOrder: form.isAvailableForOrder,
      weight: totalWeight,
      coupleRing: coupleRingData,
      brand: "JewelsKart Original",
      imageFile: imageFile,
      galleryFiles: galleryFiles,
      videoFile: videoFile,
      stoneWeight: parseFloat(form.stoneWeight) || 0,
      reviewRating: parseFloat(form.reviewRating) || 0,
      reviewCount: parseInt(form.reviewCount) || 0,
      keptImages: keptImages,
      existingMainImage: existingMainImage ? { url: existingMainImage, publicId: product?.mainImage?.publicId || "" } : null,
      existingGalleryImages: existingGalleryImages,
      removedImagePublicIds: removedImagePublicIds,
    };

    onSubmit(submitData);

    setTimeout(() => setIsSubmitting(false), 2000);
  };

  const displayMainImage = mainImagePreview || existingMainImage;
  const displayGalleryImages = Array.from(new Set([
    ...existingGalleryImages.map(img => img.url),
    ...galleryImagePreviews
  ])).filter(url => url !== displayMainImage);

  const displayImages = [
    ...(displayMainImage ? [displayMainImage] : []),
    ...displayGalleryImages
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto px-1">
      {/* Basic Information Section */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Info className="h-5 w-5 text-primary" />
          Basic Information
        </h3>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Product Name *</Label>
          <Input
            className="h-11 rounded-xl w-full"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="Enter product name"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>SKU * {!isEdit && <span className="text-xs text-primary">(Auto-generated)</span>}</Label>
            <Input
              className={`h-11 rounded-xl w-full ${!isEdit ? 'bg-muted/30 font-mono' : ''}`}
              value={form.sku}
              onChange={e => setForm({ ...form, sku: e.target.value })}
              placeholder={!isEdit ? "Will be auto-generated based on category" : "SKU"}
              readOnly={!isEdit}
              disabled={generatingSku}
            />
            {generatingSku && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <RefreshCw className="h-3 w-3 animate-spin" />
                Generating SKU from server...
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Category *</Label>
            <Select
              value={form.category}
              onValueChange={handleCategoryChange}
              disabled={isEdit}
            >
              <SelectTrigger className="h-11 rounded-xl w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.length > 0 ? (
                  categories.map(cat => (
                    <SelectItem key={cat._id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))
                ) : (
                  <>
                    <SelectItem value="Rings">Rings</SelectItem>
                    <SelectItem value="Earrings">Earrings</SelectItem>
                    <SelectItem value="Pendants">Pendants</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
            {isEdit && (
              <p className="text-xs text-amber-600">⚠️ Category cannot be changed in edit mode</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Brand</Label>
            <Input
              className="h-11 rounded-xl w-full bg-muted/30"
              value="JewelsKart Original"
              disabled
            />
          </div>
          <div className="space-y-2">
            <Label className="font-medium text-foreground">Status</Label>
            <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
              <SelectTrigger className="h-11 rounded-xl w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Draft">📝 Draft</SelectItem>
                <SelectItem value="Published">✅ Published</SelectItem>
                <SelectItem value="Archived">📦 Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="font-medium text-foreground">Available for Order</Label>
          <Select
            value={form.isAvailableForOrder ? "yes" : "no"}
            onValueChange={v => setForm({ ...form, isAvailableForOrder: v === "yes" })}
          >
            <SelectTrigger className="h-11 rounded-xl w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">✨ Yes (Made to Order)</SelectItem>
              <SelectItem value="no">🚫 No (Currently Unavailable)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Tags</Label>
          <div className="flex gap-2 flex-wrap">
            {tagsList.map(tag => (
              <Badge
                key={tag}
                variant={form.tags.includes(tag) ? "default" : "outline"}
                className="cursor-pointer rounded-lg py-1.5 px-3 transition-all"
                onClick={() => setForm({
                  ...form,
                  tags: form.tags.includes(tag)
                    ? form.tags.filter(t => t !== tag)
                    : [...form.tags, tag]
                })}
              >
                {tagDisplayNames[tag] || tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Gold Details Section */}
      <div className="space-y-4 border-t pt-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Gem className="h-5 w-5 text-primary" />
          Gold & Weight Details
        </h3>

        {isCoupleRingCategory(form.category) ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Women Ring Weight */}
              <div className="p-4 rounded-xl border border-pink-200/80 dark:border-pink-900/40 bg-pink-50/30 dark:bg-pink-950/20 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-sm text-pink-700 dark:text-pink-300">
                  <Sparkles className="h-4 w-4" />
                  <span>Women</span>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-foreground">Women Ring Weight (grams) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    className="h-11 rounded-xl w-full bg-background"
                    value={form.womenWeight}
                    onChange={e => setForm({ ...form, womenWeight: e.target.value })}
                    placeholder="e.g., 2.35"
                  />
                </div>
              </div>

              {/* Men Ring Weight */}
              <div className="p-4 rounded-xl border border-blue-200/80 dark:border-blue-900/40 bg-blue-50/30 dark:bg-blue-950/20 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-sm text-blue-700 dark:text-blue-300">
                  <Sparkles className="h-4 w-4" />
                  <span>Men</span>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-foreground">Men Ring Weight (grams) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    className="h-11 rounded-xl w-full bg-background"
                    value={form.menWeight}
                    onChange={e => setForm({ ...form, menWeight: e.target.value })}
                    placeholder="e.g., 3.10"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Purity</Label>
              <Select value={form.purity} onValueChange={v => setForm({ ...form, purity: v as any })}>
                <SelectTrigger className="h-11 rounded-xl w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {purityOptions.map(p => (
                    <SelectItem key={p} value={p}>{p} Gold</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Weight (grams)</Label>
              <Input
                className="h-11 rounded-xl w-full"
                value={form.weight}
                onChange={e => setForm({ ...form, weight: e.target.value })}
                placeholder="e.g., 12g"
              />
            </div>
            <div className="space-y-2">
              <Label>Purity</Label>
              <Select value={form.purity} onValueChange={v => setForm({ ...form, purity: v as any })}>
                <SelectTrigger className="h-11 rounded-xl w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {purityOptions.map(p => (
                    <SelectItem key={p} value={p}>{p} Gold</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-sm font-medium">Material Type</Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleMaterialToggle("Gold")}
              className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all text-left ${form.materials.includes("Gold")
                ? "border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-300 font-semibold shadow-sm ring-1 ring-amber-500/30"
                : "border-border/60 hover:border-border bg-background hover:bg-muted/30 text-muted-foreground"
                }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 border border-amber-600 shadow-sm inline-block" />
                <span className="text-sm font-medium">Gold</span>
              </div>
              <div
                className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${form.materials.includes("Gold")
                  ? "bg-amber-500 border-amber-500 text-white"
                  : "border-muted-foreground/30 bg-background"
                  }`}
              >
                {form.materials.includes("Gold") && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleMaterialToggle("Rose Gold")}
              className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all text-left ${form.materials.includes("Rose Gold")
                ? "border-rose-400 bg-rose-500/10 text-rose-900 dark:text-rose-300 font-semibold shadow-sm ring-1 ring-rose-400/30"
                : "border-border/60 hover:border-border bg-background hover:bg-muted/30 text-muted-foreground"
                }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-rose-300 to-rose-400 border border-rose-500 shadow-sm inline-block" />
                <span className="text-sm font-medium">Rose Gold</span>
              </div>
              <div
                className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${form.materials.includes("Rose Gold")
                  ? "bg-rose-500 border-rose-500 text-white"
                  : "border-muted-foreground/30 bg-background"
                  }`}
              >
                {form.materials.includes("Rose Gold") && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Select Gold, Rose Gold, or both for this product.
          </p>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="space-y-4 border-t pt-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <IndianRupee className="h-5 w-5 text-primary" />
          Pricing (Manual Entry)
        </h3>

        {isCoupleRingCategory(form.category) ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Women Ring Price */}
              <div className="p-4 rounded-xl border border-pink-200/80 dark:border-pink-900/40 bg-pink-50/30 dark:bg-pink-950/20 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-sm text-pink-700 dark:text-pink-300">
                  <IndianRupee className="h-4 w-4" />
                  <span>Women</span>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-foreground">Women Ring Price (₹) *</Label>
                  <Input
                    type="number"
                    className="h-11 rounded-xl w-full bg-background"
                    value={form.womenPrice}
                    onChange={e => setForm({ ...form, womenPrice: e.target.value })}
                    placeholder="e.g., 12500"
                  />
                </div>
              </div>

              {/* Men Ring Price */}
              <div className="p-4 rounded-xl border border-blue-200/80 dark:border-blue-900/40 bg-blue-50/30 dark:bg-blue-950/20 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-sm text-blue-700 dark:text-blue-300">
                  <IndianRupee className="h-4 w-4" />
                  <span>Men</span>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-foreground">Men Ring Price (₹) *</Label>
                  <Input
                    type="number"
                    className="h-11 rounded-xl w-full bg-background"
                    value={form.menPrice}
                    onChange={e => setForm({ ...form, menPrice: e.target.value })}
                    placeholder="e.g., 14500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Purchase Price (₹)</Label>
                <Input
                  type="number"
                  className="h-11 rounded-xl w-full"
                  value={form.purchasePrice}
                  onChange={e => setForm({ ...form, purchasePrice: e.target.value })}
                  placeholder="Enter purchase price"
                />
              </div>
              <div className="space-y-2">
                <Label>GST (%)</Label>
                <Select
                  value={form.gst.toString()}
                  onValueChange={v => setForm({ ...form, gst: parseInt(v) })}
                >
                  <SelectTrigger className="h-11 rounded-xl w-full">
                    <SelectValue placeholder="Select GST rate" />
                  </SelectTrigger>
                  <SelectContent>
                    {gstOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value.toString()}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {((parseFloat(form.womenPrice) || 0) > 0 || (parseFloat(form.menPrice) || 0) > 0) && (
              <div className="space-y-2">
                <Label className="text-muted-foreground">Combined Price & GST Breakdown (Preview)</Label>
                <div className="p-3.5 rounded-xl border bg-muted/30 text-sm space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Women Ring Price:</span>
                    <span className="font-medium">₹{(parseFloat(form.womenPrice || "0")).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Men Ring Price:</span>
                    <span className="font-medium">₹{(parseFloat(form.menPrice || "0")).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t border-border/60 pt-1.5 font-semibold">
                    <span>Total Selling Price (Base):</span>
                    <span className="text-primary">
                      ₹{((parseFloat(form.womenPrice || "0")) + (parseFloat(form.menPrice || "0"))).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>GST ({form.gst}%):</span>
                    <span className="text-primary font-medium">
                      ₹{(((parseFloat(form.womenPrice || "0") + parseFloat(form.menPrice || "0")) * form.gst) / 100).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Selling Price (₹) * <span className="text-xs text-muted-foreground">(GST Exclusive — GST added on top)</span></Label>
                <Input
                  type="number"
                  className="h-11 rounded-xl w-full"
                  value={form.price}
                  onChange={e => setForm({ ...form, price: e.target.value })}
                  placeholder="Enter selling price"
                />
              </div>
              <div className="space-y-2">
                <Label>Purchase Price (₹)</Label>
                <Input
                  type="number"
                  className="h-11 rounded-xl w-full"
                  value={form.purchasePrice}
                  onChange={e => setForm({ ...form, purchasePrice: e.target.value })}
                  placeholder="Enter purchase price"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>GST (%)</Label>
                <Select
                  value={form.gst.toString()}
                  onValueChange={v => setForm({ ...form, gst: parseInt(v) })}
                >
                  <SelectTrigger className="h-11 rounded-xl w-full">
                    <SelectValue placeholder="Select GST rate" />
                  </SelectTrigger>
                  <SelectContent>
                    {gstOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value.toString()}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {form.price && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground">GST Breakdown (Preview)</Label>
                  <div className="h-11 rounded-xl border bg-muted/30 px-3 flex flex-col justify-center text-sm">
                    <span className="text-muted-foreground">Base Price: ₹{parseFloat(form.price || "0").toFixed(2)}</span>
                    <span className="text-primary font-medium">GST ({form.gst}%): ₹{(parseFloat(form.price || "0") * form.gst / 100).toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Ring Size Section (Only visible for Ring products) */}
      {isRingCategory(form.category) && (
        <div className="space-y-4 border-t pt-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              Ring Sizes (Multiple Selection)
            </h3>
            <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">
              Category: Ring Product
            </span>
          </div>

          {/* Currently Selected Ring Sizes with Remove (X) option */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Currently Added Sizes</Label>
            {form.ringSizes.length > 0 ? (
              <div className="flex flex-wrap gap-2 p-3 bg-muted/20 rounded-xl border border-border/50">
                {form.ringSizes.map(size => (
                  <span
                    key={size}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-medium shadow-sm"
                  >
                    Size {size}
                    <button
                      type="button"
                      onClick={() => handleRemoveRingSize(size)}
                      className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                      title={`Remove size ${size}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                ⚠️ No ring sizes added yet. Please select or add ring sizes below so customers can choose on the website.
              </div>
            )}
          </div>

          {/* Preset Quick Select Sizes */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground font-medium">Quick Select Preset Sizes</Label>
            <div className="flex flex-wrap gap-2">
              {["5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18"].map(size => (
                <button
                  key={size}
                  type="button"
                  onClick={() => handleRingSizeToggle(size)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${form.ringSizes.includes(size)
                    ? "bg-primary text-white shadow-md scale-105"
                    : "bg-muted hover:bg-muted/80 text-foreground border"
                    }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Size Adder */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground font-medium">Add Custom Ring Size</Label>
            <div className="flex gap-2 max-w-sm">
              <Input
                type="text"
                placeholder="e.g. 6.5, 12, S"
                value={customSizeInput}
                onChange={e => setCustomSizeInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomRingSize();
                  }
                }}
                className="h-10 text-sm rounded-lg"
              />
              <Button
                type="button"
                size="sm"
                onClick={handleAddCustomRingSize}
                className="h-10 px-4 bg-primary hover:bg-primary/90 text-white rounded-lg flex items-center gap-1 shrink-0"
              >
                <Plus className="w-4 h-4" /> Add Size
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Specifications Section */}
      {/* Specifications Section */}
      <div className="space-y-4 border-t pt-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          Specifications
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Finish</Label>
            <Select value={form.finish} onValueChange={v => setForm({ ...form, finish: v })}>
              <SelectTrigger className="h-11 rounded-xl w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {finishOptions.map(f => (
                  <SelectItem key={f} value={f}>{f}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Hallmark</Label>
            <Select value={form.hallmark} onValueChange={v => setForm({ ...form, hallmark: v })}>
              <SelectTrigger className="h-11 rounded-xl w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {hallmarkOptions.map(h => (
                  <SelectItem key={h} value={h}>{h}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Certification</Label>
            <Select value={form.certification} onValueChange={v => setForm({ ...form, certification: v })}>
              <SelectTrigger className="h-11 rounded-xl w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {certificationOptions.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Gender</Label>
            <Select value={form.gender} onValueChange={v => setForm({ ...form, gender: v })}>
              <SelectTrigger className="h-11 rounded-xl w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {genderOptions.map(g => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ✅ NAYA STONE TYPE SECTION */}
        <div className="space-y-4 mt-4 border-t pt-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label className="text-base font-semibold flex items-center gap-2">
                <span>💎 Stone Type</span>
                <span className="text-xs text-muted-foreground font-normal">(Select stone configuration)</span>
              </Label>
              <Select
                value={form.stoneType}
                onValueChange={v => {
                  setForm({
                    ...form,
                    stoneType: v,
                    // Reset weights when changing type
                    diamondWeight: v === "diamond" || v === "both" ? form.diamondWeight : "",
                    semiPreciousWeight: v === "semi_precious" || v === "both" ? form.semiPreciousWeight : "",
                  })
                }}
              >
                <SelectTrigger className="h-11 rounded-xl w-full bg-background">
                  <SelectValue placeholder="Select stone type" />
                </SelectTrigger>
                <SelectContent>
                  {stoneTypeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {form.stoneType === "none" && "No stones in this product"}
                {form.stoneType === "diamond" && "Only diamond stones will be added"}
                {form.stoneType === "semi_precious" && "Only semi-precious stones will be added"}
                {form.stoneType === "both" && "Both diamond and semi-precious stones will be added"}
              </p>
            </div>
          </div>

          {/* 🔹 Diamond Weight Field - Shows for "diamond" or "both" */}
          {(form.stoneType === "diamond" || form.stoneType === "both") && (
            <div className="space-y-2 mt-2">
              <Label className="flex items-center gap-2">
                <span>💎 Diamond Weight (carats)</span>
                <span className="text-xs text-red-500">*</span>
                {form.stoneType === "both" && (
                  <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-xs">
                    Required
                  </Badge>
                )}
              </Label>
              <Input
                className="h-11 rounded-xl w-full border-blue-200 focus:border-blue-500 focus:ring-blue-500/20"
                value={form.diamondWeight}
                onChange={e => setForm({ ...form, diamondWeight: e.target.value })}
                placeholder="e.g., 0.50"
                type="number"
                step="0.01"
                min="0"
              />
              <p className="text-xs text-muted-foreground">Total diamond weight in carats</p>
            </div>
          )}

          {/* 🔹 Semi Precious Weight Field - Shows for "semi_precious" or "both" */}
          {(form.stoneType === "semi_precious" || form.stoneType === "both") && (
            <div className="space-y-2 mt-2">
              <Label className="flex items-center gap-2">
                <span>💠 Semi Precious Weight (carats)</span>
                <span className="text-xs text-red-500">*</span>
                {form.stoneType === "both" && (
                  <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 text-xs">
                    Required
                  </Badge>
                )}
              </Label>
              <Input
                className="h-11 rounded-xl w-full border-purple-200 focus:border-purple-500 focus:ring-purple-500/20"
                value={form.semiPreciousWeight}
                onChange={e => setForm({ ...form, semiPreciousWeight: e.target.value })}
                placeholder="e.g., 1.20"
                type="number"
                step="0.01"
                min="0"
              />
              <p className="text-xs text-muted-foreground">Total semi-precious stone weight in carats</p>
            </div>
          )}

          {/* 🔹 Summary when Both is selected */}
          {form.stoneType === "both" && (
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-xl border border-blue-200/50 dark:border-blue-800/30">
              <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                <span>📊</span> Stone Weight Summary
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/50 dark:bg-black/20 p-3 rounded-lg border border-blue-200/50">
                  <p className="text-xs text-muted-foreground">💎 Diamond</p>
                  <p className="font-bold text-blue-600">
                    {form.diamondWeight || 0} ct
                  </p>
                </div>
                <div className="bg-white/50 dark:bg-black/20 p-3 rounded-lg border border-purple-200/50">
                  <p className="text-xs text-muted-foreground">💠 Semi Precious</p>
                  <p className="font-bold text-purple-600">
                    {form.semiPreciousWeight || 0} ct
                  </p>
                </div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground text-center border-t border-border/50 pt-2">
                Total Stone Weight: {(parseFloat(form.diamondWeight || "0") + parseFloat(form.semiPreciousWeight || "0")).toFixed(2)} ct
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Care Instructions Section */}
      <div className="space-y-4 border-t pt-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <HeartHandshake className="h-5 w-5 text-primary" />
          Care Instructions
        </h3>

        <div className="space-y-3">
          {form.careInstructions.map((instruction, index) => (
            <div key={index} className="flex gap-2 items-start">
              <Input
                className="flex-1 h-11 rounded-xl"
                value={instruction}
                onChange={e => handleCareInstructionChange(index, e.target.value)}
                placeholder={`Instruction ${index + 1}`}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeCareInstruction(index)}
                className="h-11 w-11 rounded-xl text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={addCareInstruction}
            className="w-full rounded-xl"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Care Instruction
          </Button>
        </div>
      </div>

      {/* Additional Info Section */}
      <div className="space-y-4 border-t pt-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary" />
          Additional Information
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Delivery Time</Label>
            <Input
              className="h-11 rounded-xl w-full"
              value={form.delivery}
              onChange={e => setForm({ ...form, delivery: e.target.value })}
              placeholder="e.g., 3-5 Days"
            />
          </div>
          <div className="space-y-2">
            <Label>Return Policy</Label>
            <Input
              className="h-11 rounded-xl w-full"
              value={form.returns}
              onChange={e => setForm({ ...form, returns: e.target.value })}
              placeholder="e.g., 7 Days Return"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Payment Information</Label>
          <Input
            className="h-11 rounded-xl w-full"
            value={form.payment}
            onChange={e => setForm({ ...form, payment: e.target.value })}
            placeholder="Payment options"
          />
        </div>
      </div>

      {/* Reviews Section */}
      <div className="space-y-4 border-t pt-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Star className="h-5 w-5 text-primary" />
          Reviews
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Rating (out of 5)</Label>
            <Input
              type="number"
              step="0.1"
              min="0"
              max="5"
              className="h-11 rounded-xl w-full"
              value={form.reviewRating}
              onChange={e => setForm({ ...form, reviewRating: e.target.value })}
              placeholder="e.g., 4.5"
            />
          </div>
          <div className="space-y-2">
            <Label>Number of Reviews</Label>
            <Input
              type="number"
              className="h-11 rounded-xl w-full"
              value={form.reviewCount}
              onChange={e => setForm({ ...form, reviewCount: e.target.value })}
              placeholder="e.g., 24"
            />
          </div>
        </div>
      </div>

      {/* Images Section - FIXED */}
      <div className="space-y-4 border-t pt-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-primary" />
          Product Images (Max 10 Images)
        </h3>

        {/* Main Image Upload */}
        <div className="space-y-2">
          <Label>Main Product Image *</Label>
          <div className="flex items-center gap-4 flex-wrap">
            {displayImages.length > 0 && displayImages[0] ? (
              <div className="relative">
                <img
                  src={displayImages[0]}
                  alt="Main preview"
                  className="w-24 h-24 object-cover rounded-lg border"
                />
                <button
                  type="button"
                  onClick={removeMainImage}
                  className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 hover:bg-destructive/80 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : null}

            <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-secondary/30 transition-colors">
              <ImageIcon className="h-6 w-6 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Upload Main</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleMainImageSelect(e.target.files[0]);
                  }
                  e.target.value = '';
                }}
              />
            </label>
          </div>
        </div>

        {/* Gallery Images Upload */}
        <div className="space-y-2">
          <Label>Gallery Images (Up to 9 additional images)</Label>
          <div className="flex flex-wrap gap-3">
            {displayImages.slice(1, 10).map((img, idx) => {
              const isNewPreview = galleryImagePreviews.includes(img);

              return (
                <div key={`gallery-${idx}-${Date.now()}`} className="relative">
                  <img
                    src={img}
                    alt={`Gallery ${idx + 1}`}
                    className="w-20 h-20 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(idx, img)}
                    className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 hover:bg-destructive/80 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  {isNewPreview && (
                    <span className="absolute bottom-0 left-0 right-0 bg-blue-500 text-white text-[8px] text-center py-0.5 rounded-b-lg">
                      New
                    </span>
                  )}
                </div>
              );
            })}

            {displayImages.length < 10 && (
              <label className="flex flex-col items-center justify-center w-20 h-20 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-secondary/30 transition-colors">
                <Plus className="h-5 w-5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Add</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleGalleryImageSelect(e.target.files);
                    }
                    e.target.value = '';
                  }}
                />
              </label>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {displayImages.length}/10 images used
          </p>
          {isEdit && removedImagePublicIds.length > 0 && (
            <p className="text-xs text-amber-600">
              ⚠️ {removedImagePublicIds.length} image(s) will be permanently deleted on save
            </p>
          )}
        </div>
      </div>

      {/* Video Upload Section */}
      <div className="space-y-4 border-t pt-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Video className="h-5 w-5 text-primary" />
          Product Video (Optional)
        </h3>

        <div className="space-y-2">
          <Label>Product Video (MP4, MOV - Max 100MB)</Label>
          <div className="flex items-center gap-4 flex-wrap">
            {existingVideo ? (
              <div className="relative">
                <video
                  src={existingVideo}
                  className="w-32 h-32 object-cover rounded-lg border"
                  controls
                />
                <button
                  type="button"
                  onClick={() => {
                    setExistingVideo(null);
                    setVideoFile(null);
                  }}
                  className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : videoFile ? (
              <div className="relative">
                <video
                  src={URL.createObjectURL(videoFile)}
                  className="w-32 h-32 object-cover rounded-lg border"
                  controls
                />
                <button
                  type="button"
                  onClick={() => setVideoFile(null)}
                  className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : null}

            <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-secondary/30">
              <Video className="h-6 w-6 text-muted-foreground" />
              <span className="text-xs text-muted-foreground text-center mt-1">Upload Video</span>
              <span className="text-[10px] text-muted-foreground">MP4, MOV</span>
              <input
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setVideoFile(e.target.files[0]);
                    setExistingVideo(null);
                  }
                  e.target.value = '';
                }}
              />
            </label>
          </div>
          <p className="text-xs text-muted-foreground">Upload a product video to showcase your product in action. Max 100MB.</p>
        </div>
      </div>

      {/* Description Section */}
      <div className="space-y-4 border-t pt-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary" />
          Product Description
        </h3>

        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            className="rounded-xl min-h-[120px] w-full"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="Enter detailed product description..."
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading || isSubmitting} className="flex-1 h-11 rounded-xl text-base font-medium">
          {(loading || isSubmitting) ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          {isEdit ? "Save Changes" : "Add Product"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1 h-11 rounded-xl">
          Cancel
        </Button>
      </div>
    </form>
  );
};

// ========== PRODUCT VIEW DIALOG ==========
const ProductViewDialog = ({ product, onClose }: { product: Product | null; onClose: () => void }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"details" | "specs" | "pricing">("details");

  if (!product) return null;

  const getAllImages = () => {
    const images = new Set<string>();
    if (product.mainImage?.url && product.mainImage.url !== '') images.add(product.mainImage.url);
    if (product.galleryImages) {
      product.galleryImages.forEach(img => {
        if (img.url && img.url !== '') images.add(img.url);
      });
    }
    if (product.images && product.images.length > 0) {
      product.images.forEach(img => {
        if (img && img !== '') images.add(img);
      });
    }
    return images.size > 0
      ? Array.from(images)
      : ['data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="%23999" stroke-width="1"%3E%3Crect x="3" y="3" width="18" height="18" rx="2"%3E%3C/rect%3E%3Ccircle cx="8.5" cy="8.5" r="1.5"%3E%3C/circle%3E%3Cpolyline points="21 15 16 10 5 21"%3E%3C/polyline%3E%3C/svg%3E'];
  };

  const nextImage = () => {
    const images = getAllImages();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    const images = getAllImages();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const getCategoryDisplay = () => {
    if (typeof product.category === "string") return product.category;
    return product.category?.name || product.categoryName || "Uncategorized";
  };

  const profitMargin = product.purchasePrice && product.price > 0
    ? ((product.price - product.purchasePrice) / product.price * 100).toFixed(1)
    : "0";
  const profitAmount = product.price - (product.purchasePrice || 0);
  const goldWeight = product.goldDetails?.weight || 0;
  const goldPurity = product.goldDetails?.purity || "22K";
  const pricePerGram = goldWeight > 0 ? (product.price / goldWeight).toFixed(0) : 0;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({ title: "Copied!", description: "SKU copied to clipboard" });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatFullDateTime = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const images = getAllImages();

  return (
    <Dialog open={!!product} onOpenChange={onClose}>
      <DialogContent
        className="max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl p-0"
        aria-describedby="product-dialog-description"
      >
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-2xl font-bold">Product Details</DialogTitle>
          <DialogDescription id="product-dialog-description">
            Complete product information for management
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-[0.8fr_1.2fr] gap-0">
          {/* Left Column - Images */}
          <div className="p-4 bg-gradient-to-br from-secondary/20 to-secondary/5">
            <div className="space-y-3">
              <div className="relative group">
                <div className="overflow-hidden rounded-xl bg-secondary/30">
                  <img
                    src={images[currentImageIndex]}
                    alt={product.name}
                    className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105 cursor-pointer rounded-xl"
                    onClick={() => setIsZoomed(true)}
                  />
                </div>

                {images.length > 1 && (
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

              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${currentImageIndex === idx
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

          {/* Right Column - Product Details */}
          <div className="p-6 space-y-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">{product.name}</h2>
              <p className="text-xs text-muted-foreground font-mono mt-1">{getCategoryDisplay()}</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">SKU Code:</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-mono font-semibold text-sm">{product.sku}</span>
                  <button
                    onClick={() => copyToClipboard(product.sku, `sku-${product.id || product._id}`)}
                    className="p-0.5 hover:bg-primary/10 rounded transition-colors"
                  >
                    {copiedId === `sku-${product.id || product._id}` ?
                      <Check className="w-3 h-3 text-green-500" /> :
                      <Copy className="w-3 h-3 text-muted-foreground" />
                    }
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FolderTree className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Category:</span>
                </div>
                <span className="font-medium text-sm">{getCategoryDisplay()}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Created Date:</span>
                </div>
                <span className="font-medium text-sm">{formatFullDateTime(product.createdAt)}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Status:</span>
                </div>
                <Badge className={`${statusColors[product.status]} border rounded-full px-3 py-0.5 text-xs`}>
                  {product.status}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Availability:</span>
                </div>
                <span className={`font-semibold text-sm ${product.isAvailableForOrder === false ? "text-red-500" : "text-emerald-600"}`}>
                  {product.isAvailableForOrder === false ? "Currently Unavailable" : "Made to Order"}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t mt-2">
                <div className="flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-muted-foreground">Price:</span>
                </div>
                <span className="text-2xl font-bold text-primary">₹{(product.price || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t px-6 pt-4">
          <div className="flex gap-4 overflow-x-auto pb-2">
            {[
              { id: "details", label: "Product Details", icon: Info },
              { id: "specs", label: "Specifications", icon: Award },
              { id: "pricing", label: "Pricing Details", icon: IndianRupee },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-all relative whitespace-nowrap ${activeTab === tab.id ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
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

        {/* Tab Content */}
        <div className="p-6 pt-4 space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === "details" && (
              <motion.div
                key="details"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="border rounded-lg p-4 bg-background">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Gem className="w-5 h-5 text-primary" />
                    Gold & Weight Details
                  </h3>
                  {isCoupleRingCategory(product.category) || product.coupleRing ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-pink-50/60 dark:bg-pink-950/20 border border-pink-200/80 rounded-lg">
                          <p className="text-xs font-semibold text-pink-700 mb-1">Women's Ring Weight</p>
                          <p className="font-bold text-lg text-foreground">{product.coupleRing?.womenWeight || 0}g</p>
                        </div>
                        <div className="p-3 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/80 rounded-lg">
                          <p className="text-xs font-semibold text-blue-700 mb-1">Men's Ring Weight</p>
                          <p className="font-bold text-lg text-foreground">{product.coupleRing?.menWeight || 0}g</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-1">
                        <div>
                          <p className="text-xs text-muted-foreground">Total Combined Weight</p>
                          <p className="font-semibold text-base">{goldWeight}g</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Purity</p>
                          <p className="font-semibold text-base">{goldPurity}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Weight</p>
                        <p className="font-semibold text-lg">{goldWeight}g</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Purity</p>
                        <p className="font-semibold text-lg">{goldPurity}</p>
                      </div>
                      {pricePerGram > 0 && (
                        <div className="col-span-2">
                          <p className="text-xs text-muted-foreground">Price per Gram</p>
                          <p className="font-semibold text-lg text-primary">₹{pricePerGram.toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="border rounded-lg p-4 bg-background">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-primary" />
                    Product Description
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {product.description || "No description available."}
                  </p>
                </div>

                {product.tags && product.tags.length > 0 && (
                  <div className="border rounded-lg p-4 bg-background">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Tag className="w-5 h-5 text-primary" />
                      Product Tags
                    </h3>
                    <div className="flex gap-2 flex-wrap">
                      {product.tags.map(tag => (
                        <Badge key={tag} className={`${tagColors[tag] || "bg-muted"} rounded-full px-3 py-1`}>
                          {tagDisplayNames[tag] || tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {getCategoryDisplay() === "Rings" && product.specifications?.ringSizes && product.specifications.ringSizes.length > 0 && (
                  <div className="border rounded-lg p-4 bg-background">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Layers className="w-5 h-5 text-primary" />
                      Available Ring Sizes
                    </h3>
                    <div className="flex gap-2 flex-wrap">
                      {product.specifications.ringSizes.map(size => (
                        <span
                          key={size}
                          className="w-12 h-12 rounded-full border border-border bg-secondary/50 flex items-center justify-center text-sm font-medium"
                        >
                          {size}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {product.careInstructions?.instructions && product.careInstructions.instructions.length > 0 && (
                  <div className="border rounded-lg p-4 bg-background">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <HeartHandshake className="w-5 h-5 text-primary" />
                      Care Instructions
                    </h3>
                    <ul className="space-y-2">
                      {product.careInstructions.instructions.map((instruction, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-primary">•</span>
                          {instruction}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "specs" && (
              <motion.div
                key="specs"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="border rounded-lg p-4 bg-background"
              >
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  Product Specifications
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Material</p>
                    <p className="font-medium">{product.specifications?.material || "Gold"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Finish</p>
                    <p className="font-medium">{product.specifications?.finish || "High Polish"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Hallmark</p>
                    <p className="font-medium">{product.specifications?.hallmark || "BIS Hallmarked"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Certification</p>
                    <p className="font-medium">{product.specifications?.certification || "IGI Certified"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Gender</p>
                    <p className="font-medium">{product.specifications?.gender || "Women"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Stone Type</p>
                    <p className="font-medium">
                      {product.specifications?.stoneType === "diamond" && "💎 Diamond"}
                      {product.specifications?.stoneType === "semi_precious" && "💠 Semi Precious"}
                      {product.specifications?.stoneType === "both" && "💎 + 💠 Both"}
                      {(!product.specifications?.stoneType || product.specifications?.stoneType === "none") && "No Stone"}
                    </p>
                  </div>
                </div>

                {/* ✅ Stone Weight Display Section */}
                {(product.specifications?.stoneType === "diamond" || product.specifications?.stoneType === "both") && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <span>💎</span> Diamond Weight
                        </p>
                        <p className="font-bold text-lg text-blue-600">
                          {product.specifications?.diamondWeight || product.specifications?.stoneWeight || 0} carats
                        </p>
                      </div>
                      {product.specifications?.stoneType === "both" && (
                        <Badge className="bg-blue-100 text-blue-700">Both</Badge>
                      )}
                    </div>
                  </div>
                )}

                {(product.specifications?.stoneType === "semi_precious" || product.specifications?.stoneType === "both") && (
                  <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <span>💠</span> Semi Precious Weight
                        </p>
                        <p className="font-bold text-lg text-purple-600">
                          {product.specifications?.semiPreciousWeight || 0} carats
                        </p>
                      </div>
                      {product.specifications?.stoneType === "both" && (
                        <Badge className="bg-purple-100 text-purple-700">Both</Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* ✅ Both Summary */}
                {product.specifications?.stoneType === "both" && (
                  <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg border border-border">
                    <p className="text-xs text-muted-foreground text-center">
                      Total Stone Weight: {(product.specifications?.diamondWeight || 0) + (product.specifications?.semiPreciousWeight || 0)} ct
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "pricing" && (
              <motion.div
                key="pricing"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="border rounded-lg p-4 bg-background"
              >
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <IndianRupee className="w-5 h-5 text-primary" />
                  Pricing Information
                </h3>
                {(isCoupleRingCategory(product.category) || product.coupleRing) && (
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="p-3 bg-pink-50/50 dark:bg-pink-950/20 border border-pink-200/60 dark:border-pink-900/40 rounded-lg">
                      <p className="text-xs font-semibold text-pink-700 dark:text-pink-300 mb-1">Women's Ring Price</p>
                      <p className="text-base font-bold text-foreground">₹{(product.coupleRing?.womenPrice || 0).toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Weight: {product.coupleRing?.womenWeight || 0}g</p>
                    </div>
                    <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 rounded-lg">
                      <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">Men's Ring Price</p>
                      <p className="text-base font-bold text-foreground">₹{(product.coupleRing?.menPrice || 0).toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Weight: {product.coupleRing?.menWeight || 0}g</p>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-primary/5 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Selling Price (Excl. GST)</p>
                    <p className="text-xl font-bold text-primary">₹{(product.price || 0).toLocaleString()}</p>
                  </div>
                  <div className="text-center p-3 bg-secondary/30 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Purchase Price</p>
                    <p className="text-lg font-semibold">₹{(product.purchasePrice || 0).toLocaleString()}</p>
                  </div>
                  <div className="text-center p-3 bg-blue-500/10 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">GST Rate</p>
                    <p className="text-lg font-semibold text-blue-600">{product.gst ?? 3}%</p>
                  </div>
                  <div className="text-center p-3 bg-orange-500/10 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">GST Amount</p>
                    <p className="text-lg font-semibold text-orange-600">
                      ₹{((product.price || 0) * (product.gst ?? 3) / 100).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-emerald-500/10 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Profit Amount</p>
                    <p className="text-lg font-semibold text-emerald-600">₹{profitAmount.toLocaleString()}</p>
                  </div>
                  <div className="text-center p-3 bg-emerald-500/10 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Profit Margin</p>
                    <p className="text-lg font-semibold text-emerald-600">{profitMargin}%</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-6 pt-0">
          <Button onClick={onClose} className="w-full h-11 rounded-xl text-base font-medium">
            Close
          </Button>
        </div>

        {/* Zoom Modal */}
        <Dialog open={isZoomed} onOpenChange={setIsZoomed}>
          <DialogContent className="max-w-4xl p-0 bg-black/95 border-0">
            <div className="relative">
              <img
                src={images[currentImageIndex]}
                alt={product.name}
                className="w-full h-auto max-h-[85vh] object-contain"
              />
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
      </DialogContent>
    </Dialog>
  );
};

// ========== MAIN PRODUCTS PAGE COMPONENT ==========
export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isInitialFetch, setIsInitialFetch] = useState(true);
  const [dbTotalCount, setDbTotalCount] = useState<number | null>(null);

  const fetchRef = useRef(false);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const deduplicateProducts = (productsArray: Product[]): Product[] => {
    const uniqueMap = new Map();
    productsArray.forEach(product => {
      const id = product._id || product.id;
      if (id && !uniqueMap.has(id)) {
        uniqueMap.set(id, product);
      }
    });
    return Array.from(uniqueMap.values());
  };

  const fetchProducts = async () => {
    if (fetchRef.current) return;
    fetchRef.current = true;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/products`);

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Backend returned non-JSON response");
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      let productsArray = [];
      if (data.products && Array.isArray(data.products)) {
        productsArray = data.products;
      } else if (Array.isArray(data)) {
        productsArray = data;
      } else {
        productsArray = [];
      }

      const uniqueProducts = deduplicateProducts(productsArray);
      setProducts(uniqueProducts);

    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
      setIsInitialFetch(false);
      setTimeout(() => {
        fetchRef.current = false;
      }, 500);
    }
  };

  // Fetch the true total product count from the database (unaffected by filters)
  const fetchProductCount = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/count`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && typeof data.total === "number") {
          setDbTotalCount(data.total);
        }
      }
    } catch (error) {
      console.error("Error fetching product count:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchProductCount();
    fetchCategories();

    return () => {
      fetchRef.current = false;
    };
  }, []);

  const addProductToAPI = async (productData: any) => {
    if (submitting) return;

    setSubmitting(true);
    try {
      const formData = new FormData();

      const productToSend = {
        name: productData.name,
        price: productData.price,
        purchasePrice: productData.purchasePrice,
        category: productData.category,
        brand: "JewelsKart Original",
        description: productData.description,
        sku: productData.sku,
        tags: productData.tags,
        status: productData.status,
        isAvailableForOrder: productData.isAvailableForOrder,
        coupleRing: productData.coupleRing,
        goldDetails: productData.weight ? {
          weight: productData.weight,
          purity: productData.purity,
          makingCharge: 0,
        } : undefined,
        specifications: {
          material: productData.material,
          finish: productData.finish,
          hallmark: productData.hallmark,
          certification: productData.certification,
          ringSizes: productData.ringSizes || [],
          gender: productData.gender,
          stoneType: productData.stoneType || "none",
          stoneWeight: productData.stoneWeight || 0,
          diamondWeight: productData.diamondWeight || 0,
          semiPreciousWeight: productData.semiPreciousWeight || 0,
        },
        careInstructions: {
          instructions: productData.careInstructions || DEFAULT_CARE_INSTRUCTIONS,
        },
        additionalInfo: {
          delivery: productData.delivery,
          returns: productData.returns,
          payment: productData.payment,
        },
        reviews: {
          rating: productData.reviewRating || 0,
          count: productData.reviewCount || 0,
        },
      };

      formData.append('productData', JSON.stringify(productToSend));

      if (productData.imageFile) {
        formData.append('mainImage', productData.imageFile);
      }

      if (productData.galleryFiles && productData.galleryFiles.length > 0) {
        productData.galleryFiles.forEach((file: File) => {
          formData.append('galleryImages', file);
        });
      }

      if (productData.videoFile) {
        formData.append('productVideo', productData.videoFile);
      }

      const response = await fetch(`${API_BASE_URL}/products/add-with-images`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add product");
      }

      const result = await response.json();
      const newProduct = result.product || result;

      setProducts(prev => {
        const exists = prev.some(p => (p._id === newProduct._id || p.id === newProduct.id));
        if (exists) return prev;
        return [...prev, newProduct];
      });

      // Refresh the DB count after adding a product
      fetchProductCount();

      // Silent notification
      try {
        const token = localStorage.getItem('admin_token');
        if (token) {
          await notificationApi.sendNotification({
            type: 'system',
            title: '✨ New Product Added',
            message: `${newProduct.name} has been added to inventory.`,
            priority: 'medium',
            actionLink: `/products/${newProduct._id || newProduct.id}`
          });
        }
      } catch (notifError) {
        console.log('Notification skipped');
      }

      toast({ title: "Success!", description: "Product added successfully!" });
      return newProduct;

    } catch (error) {
      console.error("Error adding product:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add product",
        variant: "destructive"
      });
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const updateProductInAPI = async (id: string, updates: any, imageFile?: File, galleryFiles?: File[], videoFile?: File) => {
    if (submitting) return;

    setSubmitting(true);
    try {
      const formData = new FormData();

      const updateData = {
        ...updates,
        images: updates.keptImages || [],
        existingMainImage: updates.existingMainImage,
        existingGalleryImages: updates.existingGalleryImages || [],
        removedImagePublicIds: updates.removedImagePublicIds || [],
      };

      delete updateData.keptImages;

      formData.append('productData', JSON.stringify(updateData));

      if (imageFile) {
        formData.append('mainImage', imageFile);
      }

      if (galleryFiles && galleryFiles.length > 0) {
        galleryFiles.forEach((file: File) => {
          formData.append('galleryImages', file);
        });
      }

      if (videoFile) {
        formData.append('productVideo', videoFile);
      }

      const response = await fetch(`${API_BASE_URL}/products/${id}/with-images`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update product");
      }

      const result = await response.json();
      const updatedProduct = result.product || result;

      setProducts(prev => prev.map(p => {
        const pId = p._id || p.id;
        const updatedId = updatedProduct._id || updatedProduct.id;
        return pId === updatedId ? updatedProduct : p;
      }));

      // Silent notification
      try {
        const token = localStorage.getItem('admin_token');
        if (token) {
          await notificationApi.sendNotification({
            type: 'system',
            title: '✏️ Product Updated',
            message: `${updatedProduct.name} details have been updated.`,
            priority: 'low',
            actionLink: `/products/${id}`
          });
        }
      } catch (notifError) {
        console.log('Notification skipped');
      }

      toast({ title: "Success!", description: "Product updated successfully" });
      return updatedProduct;

    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update product",
        variant: "destructive"
      });
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  // ========== FIXED DELETE FUNCTION ==========
  const deleteProductFromAPI = async (id: string) => {
    try {
      // Find product before deleting
      const productToDelete = products.find(p => (p._id === id || p.id === id));
      const productName = productToDelete?.name || "Product";

      console.log(`🗑️ Deleting product: ${productName} (${id})`);

      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log(`📡 Response status: ${response.status}`);

      const responseData = await response.json();
      console.log(`📡 Response data:`, responseData);

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to delete product");
      }

      // ✅ CRITICAL FIX: Update state by filtering out the deleted product
      setProducts(prev => {
        const newProducts = prev.filter(p => p._id !== id && p.id !== id);
        console.log(`📊 Products after deletion: ${newProducts.length}`);
        return newProducts;
      });

      // Refresh the DB count after deletion
      fetchProductCount();

      toast({
        title: "Success",
        description: responseData.message || "Product deleted successfully"
      });

      // Silent notification
      try {
        const token = localStorage.getItem('admin_token');
        if (token) {
          await notificationApi.sendNotification({
            type: 'system',
            title: '🗑️ Product Deleted',
            message: `${productName} has been deleted from inventory.`,
            priority: 'low',
            actionLink: '/products'
          });
        }
      } catch (notifError) {
        console.log('Notification skipped');
      }

    } catch (error) {
      console.error("❌ Error deleting product:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete product",
        variant: "destructive"
      });
    }
  };

  const updateStockInAPI = async (id: string, newStock: number) => {
    try {
      const oldProduct = products.find(p => (p._id === id || p.id === id));
      const oldStock = oldProduct?.stock || 0;
      const productName = oldProduct?.name || "Product";

      const response = await fetch(`${API_BASE_URL}/products/${id}/stock`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: newStock }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update stock");
      }

      const result = await response.json();
      const updatedProduct = result.product || result;

      setProducts(prev => prev.map(p => (p._id === id || p.id === id) ? updatedProduct : p));

      if (newStock === 0 && oldStock > 0) {
        try {
          const token = localStorage.getItem('admin_token');
          if (token) {
            await notificationApi.sendNotification({
              type: 'out_of_stock',
              title: '🚫 Product Marked Unavailable',
              message: `${productName} is currently marked unavailable for order.`,
              priority: 'urgent',
              actionLink: `/products/${id}`
            });
          }
        } catch (notifError) {
          console.log('Notification skipped');
        }
        toast({ title: "Product Updated", description: `${productName} is now marked unavailable.`, variant: "destructive" });
      }
      else if (newStock < 10 && newStock > 0 && oldStock >= 10) {
        try {
          const token = localStorage.getItem('admin_token');
          if (token) {
            await notificationApi.sendNotification({
              type: 'low_stock',
              title: '✨ Product Capacity Updated',
              message: `${productName} batch capacity updated to ${newStock} units.`,
              priority: 'high',
              actionLink: `/products/${id}`
            });
          }
        } catch (notifError) {
          console.log('Notification skipped');
        }
        toast({ title: "Product Updated", description: `${productName} batch capacity updated.`, variant: "default" });
      }
      else if (oldStock === 0 && newStock > 0) {
        try {
          const token = localStorage.getItem('admin_token');
          if (token) {
            await notificationApi.sendNotification({
              type: 'back_in_stock',
              title: '✅ Product Back in Stock',
              message: `${productName} is back in stock. Quantity: ${newStock}`,
              priority: 'medium',
              actionLink: `/products/${id}`
            });
          }
        } catch (notifError) {
          console.log('Notification skipped');
        }
        toast({ title: "Back in Stock", description: `${productName} is now back in stock!` });
      }
      else {
        toast({ title: "Success", description: "Stock updated successfully" });
      }

    } catch (error) {
      console.error("Error updating stock:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update stock",
        variant: "destructive"
      });
    }
  };

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSubmitting(true);
    const reader = new FileReader();

    reader.onload = async (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split("\n").filter(l => l.trim());
      const headers = lines[0].split(",").map(h => h.trim().toLowerCase());

      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];
      const addedProducts: Product[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length === 0 || !values[0]) continue;

        try {
          const productData: any = {};

          headers.forEach((header, idx) => {
            if (idx < values.length && values[idx]) {
              productData[header] = values[idx];
            }
          });

          const category = productData.category || "Rings";

          let sku = productData.sku || "";
          if (!sku || sku.trim() === "") {
            try {
              const skuResponse = await fetch(`${API_BASE_URL}/products/next-sku/${encodeURIComponent(category)}`);
              const skuData = await skuResponse.json();
              sku = skuData.success ? skuData.sku : `${getSkuPrefix(category)}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
            } catch {
              sku = `${getSkuPrefix(category)}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
            }
          }

          let imageUrls: string[] = [];
          if (productData.image_urls || productData.images) {
            const imagesStr = productData.image_urls || productData.images || "";
            imageUrls = imagesStr.split("|").map((url: string) => url.trim()).filter((url: string) => url);
          } else if (productData.image_url) {
            imageUrls = [productData.image_url];
          }

          const tags = productData.tags ? productData.tags.split("|").map((t: string) => t.trim()) : [];
          const ringSizes = productData.ring_sizes ? productData.ring_sizes.split("|").map((s: string) => s.trim()) : [];

          let careInstructions = DEFAULT_CARE_INSTRUCTIONS;
          if (productData.care_instructions && productData.care_instructions.trim() !== "") {
            careInstructions = productData.care_instructions.split("|").map((i: string) => i.trim());
          }

          const apiProductData = {
            name: productData.name || "",
            price: parseFloat(productData.price) || 0,
            purchasePrice: parseFloat(productData.purchase_price) || 0,
            category: category,
            brand: productData.brand || "JewelsKart Original",
            description: productData.description || "",
            sku: sku,
            tags: tags,
            status: productData.status === "Archived" ? "Archived" :
              productData.status === "Published" ? "Published" : "Draft",
            goldDetails: {
              weight: parseFloat(productData.weight) || 0,
              purity: productData.purity || "22K",
              makingCharge: parseFloat(productData.making_charge) || 0,
            },
            specifications: {
              material: productData.material || "Gold",
              finish: productData.finish || "High Polish",
              hallmark: productData.hallmark || "BIS Hallmarked",
              certification: productData.certification || "IGI Certified",
              ringSizes: ringSizes,
              gender: productData.gender || "Women",
              stoneType: productData.stone_type || "Diamond",
              stoneWeight: parseFloat(productData.stone_weight) || 0,
            },
            careInstructions: {
              instructions: careInstructions,
            },
            additionalInfo: {
              delivery: productData.delivery || "3-5 Days",
              returns: productData.returns || "7 Days Return Policy",
              payment: productData.payment || "Secure Payment Options Available",
            },
            reviews: {
              rating: parseFloat(productData.rating) || 4.5,
              count: parseInt(productData.review_count) || 0,
            },
          };

          const formData = new FormData();
          formData.append('productData', JSON.stringify(apiProductData));

          if (imageUrls.length > 0) {
            formData.append('imageUrls', JSON.stringify(imageUrls));
          }

          const response = await fetch(`${API_BASE_URL}/products/add-with-images`, {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to add product");
          }

          const result = await response.json();
          const newProduct = result.product || result;

          if (!addedProducts.some(p => p._id === newProduct._id || p.id === newProduct.id)) {
            addedProducts.push(newProduct);
          }

          successCount++;
          await new Promise(resolve => setTimeout(resolve, 100));

        } catch (err) {
          console.error(`Failed to add product at row ${i + 1}:`, err);
          errorCount++;
          errors.push(`Row ${i + 1}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      }

      setProducts(prev => {
        const existingIds = new Set(prev.map(p => p._id || p.id));
        const newProducts = addedProducts.filter(p => {
          const id = p._id || p.id;
          return id && !existingIds.has(id);
        });
        return [...prev, ...newProducts];
      });

      setSubmitting(false);
      setBulkOpen(false);

      if (successCount > 0) {
        try {
          const token = localStorage.getItem('admin_token');
          if (token) {
            await notificationApi.sendNotification({
              type: 'system',
              title: '📦 Bulk Upload Complete',
              message: `${successCount} products have been added via bulk upload.`,
              priority: 'low',
              actionLink: '/products'
            });
          }
        } catch (notifError) {
          console.log('Notification skipped');
        }
      }

      if (errors.length > 0) {
        toast({
          title: "Bulk Upload Completed with Errors",
          description: `${successCount} products added. ${errorCount} failed. Check console for details.`,
          variant: "destructive"
        });
        console.error("Bulk upload errors:", errors);
      } else {
        toast({
          title: "Bulk Upload Complete!",
          description: `${successCount} products added successfully.`,
          variant: "default"
        });
      }

      fetchProducts();
    };

    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const headers = [
      "name",
      "price",
      "purchase_price",
      "category",
      "brand",
      "description",
      "image_urls",
      "weight",
      "purity",
      "sku",
      "material",
      "finish",
      "hallmark",
      "tags",
      "certification",
      "ring_sizes",
      "care_instructions",
      "delivery",
      "returns",
      "payment",
      "gender",
      "stone_type",
      "stone_weight",
      "status",
      "rating",
      "review_count"
    ];

    const exampleRow = [
      "Example Diamond Ring",
      "43445",
      "35000",
      "Rings",
      "JewelsKart Original",
      "A stunning diamond ring with excellent craftsmanship",
      "https://example.com/image1.jpg|https://example.com/image2.jpg|https://example.com/image3.jpg",
      "12",
      "22K",
      "",
      "Gold",
      "High Polish",
      "BIS Hallmarked",
      "Best Seller|New Arrival",
      "IGI Certified",
      "5|6|7|8|9|10",
      "",
      "3-5 Days",
      "7 Days Return",
      "Secure Payment",
      "Women",
      "Diamond",
      "0.5",
      "Published",
      "4.5",
      "24"
    ];

    const csv = [headers.join(","), exampleRow.map(cell => `"${cell}"`).join(",")].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products_bulk_template.csv";
    a.click();
    URL.revokeObjectURL(url);

    toast({ title: "Template Downloaded", description: "Use this template for bulk upload. Leave care_instructions empty to use defaults." });
  };

  const filtered = products.filter((p) => {
    const name = p.name?.toLowerCase() || "";
    const sku = p.sku?.toLowerCase() || "";
    const category = typeof p.category === "string" ? p.category.toLowerCase() : p.category?.name?.toLowerCase() || "";
    const searchText = search.toLowerCase();
    return name.includes(searchText) || sku.includes(searchText) || category.includes(searchText);
  });

  // Use DB count if available (true total), otherwise fall back to fetched array length
  const totalProducts = dbTotalCount !== null ? dbTotalCount : products.length;
  const totalValue = products.reduce((sum, p) => sum + (p.price || 0), 0);
  const madeToOrderCount = products.filter(p => (p as any).isAvailableForOrder !== false).length;
  const unavailableCount = products.filter(p => (p as any).isAvailableForOrder === false).length;

  const handleAddProduct = async (formData: any) => {
    try {
      await addProductToAPI(formData);
      setAddOpen(false);
    } catch (error) {
      // Error already handled
    }
  };

  const handleEditProduct = async (formData: any) => {
    if (!editProduct) return;
    const productId = editProduct._id || editProduct.id;

    const updates: any = {
      name: formData.name,
      price: formData.price,
      purchasePrice: formData.purchasePrice,
      category: formData.category,
      description: formData.description,
      tags: formData.tags,
      brand: "JewelsKart Original",
      status: formData.status,
      isAvailableForOrder: formData.isAvailableForOrder,
      sku: formData.sku,
      coupleRing: formData.coupleRing,
      keptImages: formData.keptImages || [],
      existingMainImage: formData.existingMainImage,
      existingGalleryImages: formData.existingGalleryImages || [],
      removedImagePublicIds: formData.removedImagePublicIds || [],
      specifications: {
        material: formData.material,
        finish: formData.finish,
        hallmark: formData.hallmark,
        certification: formData.certification,
        ringSizes: formData.ringSizes,
        gender: formData.gender,
        stoneType: formData.stoneType,
        stoneWeight: formData.stoneWeight,
      },
      careInstructions: {
        instructions: formData.careInstructions || DEFAULT_CARE_INSTRUCTIONS,
      },
      additionalInfo: {
        delivery: formData.delivery,
        returns: formData.returns,
        payment: formData.payment,
      },
      reviews: {
        rating: formData.reviewRating,
        count: formData.reviewCount,
      },
    };

    if (formData.weight) {
      updates.goldDetails = {
        purity: formData.purity,
        weight: formData.weight,
        makingCharge: 0,
      };
    }

    try {
      await updateProductInAPI(
        productId!,
        updates,
        formData.imageFile,
        formData.galleryFiles,
        formData.videoFile
      );
      setEditProduct(null);
    } catch (error) {
      // Error already handled
    }
  };

  const handleDelete = async (id: string) => {
    if (!id) {
      toast({
        title: "Error",
        description: "Invalid product ID",
        variant: "destructive"
      });
      return;
    }

    const productToDelete = products.find(p => (p._id === id || p.id === id));
    const productName = productToDelete?.name || "this product";

    if (window.confirm(`Are you sure you want to delete "${productName}"?`)) {
      console.log(`🗑️ User confirmed deletion of: ${productName}`);
      await deleteProductFromAPI(id);
    } else {
      console.log('ℹ️ User cancelled deletion');
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm("Delete all products? This cannot be undone.")) return;

    try {
      for (const product of products) {
        const productId = product._id || product.id;
        await deleteProductFromAPI(productId!);
      }
      toast({ title: "Success", description: "All products deleted successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete all products", variant: "destructive" });
    }
  };

  const handleStockChange = async (id: string, delta: number) => {
    const product = products.find(p => (p._id === id || p.id === id));
    if (!product) return;
    const newStock = Math.max(0, (product.stock || 0) + delta);
    await updateStockInAPI(id, newStock);
  };

  const getCategoryDisplay = (product: Product) => {
    if (typeof product.category === "string") return product.category;
    return product.category?.name || product.categoryName || "Uncategorized";
  };

  const getProductImage = (product: Product) => {
    if (product.mainImage?.url && product.mainImage.url !== '') {
      return product.mainImage.url;
    }
    if (product.galleryImages && product.galleryImages.length > 0) {
      const firstGalleryImage = product.galleryImages[0];
      if (firstGalleryImage.url && firstGalleryImage.url !== '') {
        return firstGalleryImage.url;
      }
    }
    if (product.images && product.images.length > 0) {
      const firstImage = product.images[0];
      if (firstImage && firstImage !== '') {
        return firstImage;
      }
    }
    return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="%23999" stroke-width="1"%3E%3Crect x="3" y="3" width="18" height="18" rx="2"%3E%3C/rect%3E%3Ccircle cx="8.5" cy="8.5" r="1.5"%3E%3C/circle%3E%3Cpolyline points="21 15 16 10 5 21"%3E%3C/polyline%3E%3C/svg%3E';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div className="space-y-6 p-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-display font-bold">Product Management</h1>
          <p className="text-muted-foreground text-sm font-sans">{totalProducts} items in catalog</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {products.length > 0 && (
            <Button variant="destructive" size="sm" onClick={handleDeleteAll} className="rounded-xl">
              Delete All
            </Button>
          )}

          <Button variant="outline" size="sm" onClick={() => { fetchProducts(); fetchProductCount(); }} className="gap-1 rounded-xl">
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>

          <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1 rounded-xl">
                <Upload className="h-3.5 w-3.5" />
                Bulk Upload
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <DialogTitle className="font-display flex items-center gap-2">
                  <FileUp className="h-5 w-5" /> Bulk Upload Products
                </DialogTitle>
                <DialogDescription>
                  Upload multiple products at once using a CSV file.
                  <br />
                  <span className="text-xs text-muted-foreground mt-1 block">
                    Note: Leave "care_instructions" empty to use default instructions. Leave "sku" empty for auto-generation.
                  </span>
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-8 cursor-pointer hover:bg-secondary/30">
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="font-medium">Drop your CSV file here</span>
                  <span className="text-xs text-muted-foreground mt-1">Supports pipe-separated values for multiple items (|)</span>
                  <input type="file" accept=".csv" className="hidden" onChange={handleCSVUpload} disabled={submitting} />
                </label>
                {submitting && (
                  <div className="flex items-center justify-center gap-2 text-primary">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Uploading products...</span>
                  </div>
                )}
                <Button variant="outline" className="w-full gap-2 rounded-xl" onClick={downloadTemplate}>
                  <Download className="h-4 w-4" /> Download CSV Template
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-xl"><Plus className="h-4 w-4" />Add Product</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl rounded-2xl">
              <DialogHeader>
                <DialogTitle className="font-display text-xl">Add New Product</DialogTitle>
                <DialogDescription>Upload up to 10 images and 1 video for your product.</DialogDescription>
              </DialogHeader>
              <ProductForm onSubmit={handleAddProduct} onCancel={() => setAddOpen(false)} categories={categories} loading={submitting} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground font-medium">Total Products</span>
              <Package className="h-5 w-5 text-primary" />
            </div>
            <p className="text-3xl font-bold">{totalProducts}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground font-medium">Total Value</span>
              <IndianRupee className="h-5 w-5 text-emerald-500" />
            </div>
            <p className="text-3xl font-bold">₹{totalValue.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground font-medium">Made to Order</span>
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            </div>
            <p className="text-3xl font-bold">{madeToOrderCount}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground font-medium">Unavailable</span>
              <XCircle className="h-5 w-5 text-destructive" />
            </div>
            <p className="text-3xl font-bold">{unavailableCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, SKU, or category..."
          className="pl-9 bg-secondary/50 border-0 h-11 rounded-xl"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Products List */}
      {/* Products List */}
      <div className="space-y-4">
        {filtered.map((product) => {
          const imageUrl = getProductImage(product);
          const hasValidImage = imageUrl && !imageUrl.includes('data:image/svg+xml');
          const productId = product._id || product.id;

          return (
            <Card key={productId} className="border-border/20 overflow-hidden hover:border-primary/20 transition-all duration-300">
              <CardContent className="p-0">
                <div className="flex flex-wrap items-center justify-between p-5 gap-4">

                  {/* Left Section - Image + Name */}
                  <div className="flex items-center gap-4 min-w-[200px]">
                    <div className="h-14 w-14 rounded-xl bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
                      {hasValidImage ? (
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="%23999" stroke-width="1"%3E%3Crect x="3" y="3" width="18" height="18" rx="2"%3E%3C/rect%3E%3Ccircle cx="8.5" cy="8.5" r="1.5"%3E%3C/circle%3E%3Cpolyline points="21 15 16 10 5 21"%3E%3C/polyline%3E%3C/svg%3E';
                          }}
                        />
                      ) : (
                        <Gem className="h-6 w-6 text-primary" />
                      )}
                    </div>

                    <div>
                      <p className="font-bold text-foreground text-lg">{product.name}</p>
                      <div className="flex items-center gap-2 text-sm mt-1 flex-wrap">
                        <span className="font-medium">{getCategoryDisplay(product)}</span>
                        {product.brand && (
                          <>
                            <span className="text-muted-foreground">•</span>
                            <span className="font-medium text-muted-foreground">{product.brand}</span>
                          </>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 font-mono">SKU: {product.sku}</p>

                      {/* Stone Weight Display */}
                      <div className="flex items-center gap-2 flex-wrap mt-1">
                        {product.specifications?.stoneType === "diamond" && product.specifications?.diamondWeight && (
                          <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                            💎 {product.specifications.diamondWeight}ct
                          </span>
                        )}
                        {product.specifications?.stoneType === "semi_precious" && product.specifications?.semiPreciousWeight && (
                          <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full">
                            💠 {product.specifications.semiPreciousWeight}ct
                          </span>
                        )}
                        {product.specifications?.stoneType === "both" && (
                          <>
                            <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                              💎 {product.specifications.diamondWeight || 0}ct
                            </span>
                            <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full">
                              💠 {product.specifications.semiPreciousWeight || 0}ct
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Price Section */}
                  <div className="text-center min-w-[100px]">
                    <p className="text-xs text-muted-foreground mb-1">Price</p>
                    <p className="font-bold text-primary text-lg">₹{(product.price || 0).toLocaleString()}</p>
                  </div>

                  {/* Status Section */}
                  <div className="min-w-[120px]">
                    <p className="text-xs text-muted-foreground mb-1">Status</p>
                    <Badge className={`${statusColors[product.status]} border rounded-full px-3 py-1.5`}>
                      {product.status}
                    </Badge>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setViewProduct(product)}
                      className="h-9 w-9 rounded-xl text-primary hover:bg-primary hover:text-white transition-all duration-200"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditProduct(product)}
                      className="h-9 w-9 rounded-xl text-blue-500 hover:bg-blue-500 hover:text-white transition-all duration-200"
                      title="Edit Product"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(productId!)}
                      className="h-9 w-9 rounded-xl text-destructive hover:bg-destructive hover:text-white transition-all duration-200"
                      title="Delete Product"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                </div>  {/* This div closes the main flex container */}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {
        filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <Package className="w-12 h-12 text-primary/30 mb-4" />
            <p className="mb-2">No products found</p>
            <p className="text-sm">Try adjusting your search or add a new product</p>
          </div>
        )
      }

      {/* View Product Dialog */}
      <ProductViewDialog product={viewProduct} onClose={() => setViewProduct(null)} />

      {/* Edit Product Dialog */}
      <Dialog open={!!editProduct} onOpenChange={() => setEditProduct(null)}>
        <DialogContent className="max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Edit Product</DialogTitle>
            <DialogDescription>Update the product details below.</DialogDescription>
          </DialogHeader>
          {editProduct && (
            <ProductForm
              key={editProduct._id || editProduct.id}
              product={editProduct}
              onSubmit={handleEditProduct}
              onCancel={() => setEditProduct(null)}
              isEdit={true}
              categories={categories}
              loading={submitting}
            />
          )}
        </DialogContent>
      </Dialog>
    </motion.div >
  );
}
