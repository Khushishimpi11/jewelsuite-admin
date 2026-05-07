import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Plus, 
  Edit, 
  Trash2, 
  FolderTree, 
  Package, 
  Loader2, 
  AlertTriangle, 
  X,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Trash2 as TrashIcon
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  icon: string;
  parentCategory: string | null;
  level: number;
  isActive: boolean;
  order: number;
  featured: boolean;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Dialog states
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [parentCategory, setParentCategory] = useState<string>("none");
  const [featured, setFeatured] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  // Delete All dialog
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);
  
  // Expand/Collapse for hierarchy
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // API Base URL
  const API_BASE_URL = "http://localhost:5000/api";
  
  // Get token from localStorage
  const getToken = () => localStorage.getItem("admin_token") || localStorage.getItem("customer_token");

  // Get auth headers
  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": getToken() ? `Bearer ${getToken()}` : "",
  });

  // Sync category product counts
  const syncCategoryCounts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories/sync-counts`, {
        headers: getAuthHeaders(),
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log("✅ Category counts synced");
      }
    } catch (err) {
      console.error("Sync counts error:", err);
    }
  };

  // Fetch categories from API
  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/categories`, {
        headers: getAuthHeaders(),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch categories");
      }
      
      setCategories(data.categories || []);
    } catch (err: any) {
      console.error("Fetch categories error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Refresh everything (sync + fetch)
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await syncCategoryCounts();
      await fetchCategories();
      toast({ title: "Refreshed", description: "Categories and product counts updated" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setRefreshing(false);
    }
  };

  // Delete all categories
  const handleDeleteAll = async () => {
    setDeletingAll(true);
    try {
      // First check if there are any categories with products
      const categoriesWithProducts = categories.filter(c => (c.productCount || 0) > 0);
      if (categoriesWithProducts.length > 0) {
        toast({ 
          title: "Cannot Delete", 
          description: `${categoriesWithProducts.length} categories have products. Delete products first.`, 
          variant: "destructive" 
        });
        setDeleteAllDialogOpen(false);
        return;
      }
      
      // Delete each category one by one
      for (const category of categories) {
        await deleteCategoryAPI(category._id);
      }
      
      toast({ title: "Success", description: "All categories deleted successfully" });
      await handleRefresh();
      setDeleteAllDialogOpen(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setDeletingAll(false);
    }
  };

  // Create category
  const createCategory = async (data: any) => {
    const token = getToken();
    if (!token) throw new Error("Not authenticated");
    
    const response = await fetch(`${API_BASE_URL}/categories/admin/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || "Failed to create category");
    }
    
    return result;
  };

  // Update category
  const updateCategory = async (id: string, data: any) => {
    const token = getToken();
    if (!token) throw new Error("Not authenticated");
    
    const response = await fetch(`${API_BASE_URL}/categories/admin/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || "Failed to update category");
    }
    
    return result;
  };

  // Delete category
  const deleteCategoryAPI = async (id: string) => {
    const token = getToken();
    if (!token) throw new Error("Not authenticated");
    
    const response = await fetch(`${API_BASE_URL}/categories/admin/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || "Failed to delete category");
    }
    
    return result;
  };

  // Initial load
  useEffect(() => {
    fetchCategories();
    syncCategoryCounts();
  }, []);

  // Get parent category name
  const getParentCategoryName = (parentId: string | null) => {
    if (!parentId) return "Main Category";
    const parent = categories.find(c => c._id === parentId);
    return parent ? parent.name : "Unknown";
  };

  // Get subcategories
  const getSubcategories = (parentId: string | null) => {
    return categories.filter(c => c.parentCategory === parentId);
  };

  // Build category tree
  const getCategoryTree = () => {
    return categories.filter(c => !c.parentCategory).sort((a, b) => a.order - b.order);
  };

  // Toggle expand
  const toggleExpand = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Render category tree
  const renderCategoryTree = (categoryList: Category[], level: number = 0) => {
    return categoryList.map((category) => {
      const subcategories = getSubcategories(category._id);
      const hasSubcategories = subcategories.length > 0;
      const isExpanded = expandedCategories.has(category._id);
      const productCount = category.productCount || 0;
      
      return (
        <div key={category._id}>
          <div 
            className={`flex items-center justify-between p-4 hover:bg-muted/20 transition-colors border-b border-border/30`}
            style={{ paddingLeft: `${level * 24 + 16}px` }}
          >
            <div className="flex items-center gap-3 flex-1">
              {hasSubcategories && (
                <button
                  onClick={() => toggleExpand(category._id)}
                  className="p-0.5 hover:bg-muted rounded"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              )}
              {!hasSubcategories && <div className="w-5" />}
              
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FolderTree className="h-5 w-5 text-primary" />
              </div>
              
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">
                    {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
                  </span>
                  {category.featured && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Featured</span>
                  )}
                  {!category.isActive && (
                    <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">Inactive</span>
                  )}
                </div>
                {category.description && (
                  <p className="text-xs text-muted-foreground">{category.description}</p>
                )}
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Package className="w-3 h-3" />
                    {productCount} products
                  </span>
                  <span>Slug: {category.slug}</span>
                  <span>Parent: {getParentCategoryName(category.parentCategory)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-lg hover:bg-primary/10 text-primary" 
                onClick={() => handleEdit(category)}
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-lg hover:bg-destructive/10 text-destructive" 
                onClick={() => openDeleteDialog(category)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          
          {hasSubcategories && isExpanded && (
            <div className="ml-4">
              {renderCategoryTree(subcategories, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast({ title: "Error", description: "Category name is required", variant: "destructive" });
      return;
    }
    
    setSaving(true);
    try {
      const parentValue = parentCategory === "none" ? null : parentCategory;
      
      const categoryData = {
        name: name.trim().toLowerCase(),
        description: description || undefined,
        parentCategory: parentValue,
        featured: featured,
      };
      
      if (editingId) {
        await updateCategory(editingId, categoryData);
        toast({ title: "Success", description: "Category updated successfully" });
      } else {
        await createCategory(categoryData);
        toast({ title: "Success", description: "Category created successfully" });
      }
      
      await handleRefresh();
      setOpen(false);
      resetForm();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingId(category._id);
    setName(category.name);
    setDescription(category.description || "");
    setParentCategory(category.parentCategory || "none");
    setFeatured(category.featured);
    setOpen(true);
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;
    
    setDeleting(true);
    try {
      await deleteCategoryAPI(categoryToDelete._id);
      toast({ title: "Success", description: "Category deleted successfully" });
      await handleRefresh();
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteDialog = (category: Category) => {
    const productCount = category.productCount || 0;
    if (productCount > 0) {
      toast({ 
        title: "Cannot Delete", 
        description: `Category has ${productCount} products. Delete or move products first.`, 
        variant: "destructive" 
      });
      return;
    }
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setParentCategory("none");
    setFeatured(false);
  };

  const categoryTree = getCategoryTree();
  const activeCategories = categories.filter(c => c.isActive).length;
  const totalProductsInCategories = categories.reduce((sum, c) => sum + (c.productCount || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading categories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive font-medium mb-2">Error loading categories</p>
          <p className="text-muted-foreground text-sm">{error}</p>
          <Button className="mt-4" onClick={handleRefresh}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-6 p-6" 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.3 }}
    >
      {/* Header with 3 buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-display font-bold">Category Management</h1>
          <p className="text-muted-foreground text-sm font-sans">
            {categories.length} categories • {totalProductsInCategories} total products • {activeCategories} active
          </p>
        </div>
        
        <div className="flex gap-2">
          {/* Refresh Button */}
          <Button 
            variant="outline" 
            size="default" 
            onClick={handleRefresh} 
            disabled={refreshing}
            className="gap-2 rounded-xl"
          >
            {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh
          </Button>
          
          {/* Delete All Button */}
          <Button 
            variant="destructive" 
            size="default" 
            onClick={() => setDeleteAllDialogOpen(true)} 
            disabled={categories.length === 0 || deletingAll}
            className="gap-2 rounded-xl"
          >
            {deletingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <TrashIcon className="h-4 w-4" />}
            Delete All
          </Button>
          
          {/* Add Category Button */}
          <Dialog open={open} onOpenChange={(v) => { 
            setOpen(v); 
            if (!v) resetForm(); 
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-xl">
                <Plus className="h-4 w-4" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl max-w-md">
              <DialogHeader>
                <DialogTitle className="font-display text-xl">
                  {editingId ? "Edit" : "Add"} Category
                </DialogTitle>
                <DialogDescription>
                  {editingId ? "Update the category details below." : "Create a new product category to organize your inventory."}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Category Name *</Label>
                  <Input 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    placeholder="e.g., Rings, Necklaces, Earrings"
                    className="rounded-xl"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Parent Category (Optional)</Label>
                  <Select value={parentCategory} onValueChange={setParentCategory}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select parent category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None (Main Category)</SelectItem>
                      {categories.filter(c => !c.parentCategory && c._id !== editingId).map(cat => (
                        <SelectItem key={cat._id} value={cat._id}>
                          {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Description (Optional)</Label>
                  <Input 
                    value={description} 
                    onChange={e => setDescription(e.target.value)} 
                    placeholder="Short description of the category"
                    className="rounded-xl"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="rounded border-border"
                  />
                  <Label htmlFor="featured" className="cursor-pointer">
                    Featured Category (show on homepage)
                  </Label>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)} disabled={saving} className="rounded-xl">
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving} className="rounded-xl">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {editingId ? "Save Changes" : "Add Category"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Categories", value: categories.length, icon: FolderTree, color: "text-primary" },
          { label: "Total Products", value: totalProductsInCategories, icon: Package, color: "text-primary" },
          { label: "Active Categories", value: activeCategories, icon: FolderTree, color: "text-emerald-500" },
          { label: "Main Categories", value: categories.filter(c => !c.parentCategory).length, icon: FolderTree, color: "text-blue-500" },
        ].map((s) => (
          <Card key={s.label} className="rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground font-medium">{s.label}</span>
                <div className={`h-11 w-11 rounded-xl bg-secondary flex items-center justify-center ${s.color}`}>
                  <s.icon className="h-5 w-5" />
                </div>
              </div>
              <p className="text-3xl font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Categories List with Hierarchy */}
      <Card className="rounded-xl overflow-hidden">
        <div className="bg-muted/30 px-6 py-4 border-b border-border/30">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-primary" />
                Categories Hierarchy
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Click on arrows to expand/collapse subcategories
              </p>
            </div>
          </div>
        </div>
        
        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <FolderTree className="w-12 h-12 text-primary/30 mb-4" />
            <p className="mb-2">No categories found</p>
            <p className="text-sm">Click "Add Category" to create your first category</p>
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {renderCategoryTree(categoryTree)}
          </div>
        )}
      </Card>

      {/* Delete Category Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Delete Category
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this category? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {categoryToDelete && (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
              <div className="flex items-center gap-3">
                <FolderTree className="h-8 w-8 text-destructive" />
                <div>
                  <p className="font-medium text-foreground">{categoryToDelete.name}</p>
                  {categoryToDelete.description && (
                    <p className="text-xs text-muted-foreground">{categoryToDelete.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {categoryToDelete.productCount || 0} products in this category
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={deleting} className="rounded-xl">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting} className="rounded-xl">
              {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              {deleting ? "Deleting..." : "Delete Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete All Categories Confirmation Dialog */}
      <Dialog open={deleteAllDialogOpen} onOpenChange={setDeleteAllDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Delete All Categories
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete all {categories.length} categories? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive">
              ⚠️ Warning: This will delete all {categories.length} categories. 
              Categories with products cannot be deleted. Delete products first.
            </p>
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteAllDialogOpen(false)} disabled={deletingAll} className="rounded-xl">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAll} disabled={deletingAll} className="rounded-xl">
              {deletingAll ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <TrashIcon className="h-4 w-4 mr-2" />}
              {deletingAll ? "Deleting..." : "Delete All Categories"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}