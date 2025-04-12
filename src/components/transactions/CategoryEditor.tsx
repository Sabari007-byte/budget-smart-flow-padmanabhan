import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, Edit, Tag } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Category {
  name: string;
  limit: number;
}

export function CategoryEditor() {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryLimit, setNewCategoryLimit] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    // Load wallet data to get categories
    const walletStr = localStorage.getItem('wallet');
    if (walletStr) {
      const wallet = JSON.parse(walletStr);
      if (wallet.categories) {
        const categoriesArray = Object.entries(wallet.categories).map(
          ([name, data]: [string, any]) => ({
            name,
            limit: data.limit,
          })
        );
        setCategories(categoriesArray);
      }
    }
  }, []);

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Error",
        description: "Category name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    const limit = parseFloat(newCategoryLimit);
    if (isNaN(limit) || limit <= 0) {
      toast({
        title: "Error",
        description: "Category limit must be a positive number",
        variant: "destructive",
      });
      return;
    }

    // Check if category already exists
    if (categories.some(cat => cat.name.toLowerCase() === newCategoryName.toLowerCase())) {
      toast({
        title: "Error",
        description: "This category already exists",
        variant: "destructive",
      });
      return;
    }

    const newCategories = [
      ...categories,
      { name: newCategoryName, limit }
    ];
    
    setCategories(newCategories);
    setNewCategoryName("");
    setNewCategoryLimit("");
    
    saveCategoriesToStorage(newCategories);
    
    toast({
      title: "Success",
      description: "Category added successfully",
    });
  };

  const handleRemoveCategory = (categoryName: string) => {
    const updatedCategories = categories.filter(cat => cat.name !== categoryName);
    setCategories(updatedCategories);
    saveCategoriesToStorage(updatedCategories);
    
    toast({
      title: "Success",
      description: "Category removed successfully",
    });
  };

  const saveCategoriesToStorage = (categoriesArray: Category[]) => {
    const walletStr = localStorage.getItem('wallet');
    if (walletStr) {
      const wallet = JSON.parse(walletStr);
      
      // Convert array to object format
      const categoriesObject: Record<string, { limit: number, spent: number }> = {};
      categoriesArray.forEach(cat => {
        // Preserve spent amount if category exists or initialize to 0
        categoriesObject[cat.name] = {
          limit: cat.limit,
          spent: wallet.categories[cat.name]?.spent || 0
        };
      });
      
      wallet.categories = categoriesObject;
      localStorage.setItem('wallet', JSON.stringify(wallet));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Tag className="mr-2 h-4 w-4" />
          Edit Categories
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Manage Spending Categories</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Add new category */}
          <div className="space-y-2">
            <h4 className="font-medium">Add New Category</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="categoryName">Name</Label>
                <Input
                  id="categoryName"
                  placeholder="e.g., Food"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="categoryLimit">Daily Limit (₹)</Label>
                <Input
                  id="categoryLimit"
                  type="number"
                  min="0"
                  step="100"
                  placeholder="500"
                  value={newCategoryLimit}
                  onChange={(e) => setNewCategoryLimit(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={handleAddCategory} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </div>
          
          {/* Existing categories */}
          <div className="space-y-2">
            <h4 className="font-medium">Existing Categories</h4>
            {categories.length > 0 ? (
              <div className="rounded-md border">
                <div className="grid grid-cols-[1fr,auto,auto] gap-2 p-2 font-medium bg-muted">
                  <div>Name</div>
                  <div>Limit (₹)</div>
                  <div></div>
                </div>
                {categories.map((category) => (
                  <div 
                    key={category.name} 
                    className="grid grid-cols-[1fr,auto,auto] gap-2 p-2 items-center border-t"
                  >
                    <div className="capitalize">{category.name}</div>
                    <div>₹{category.limit.toFixed(2)}</div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleRemoveCategory(category.name)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-sm text-muted-foreground">
                No categories defined yet
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={() => setOpen(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
