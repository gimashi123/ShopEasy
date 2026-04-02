import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { promotionService } from "@/services/promotionService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Plus, Store, Tag, Image as ImageIcon, Percent } from "lucide-react";
import type { Product } from "@/services/productService";

interface PromotionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
}

export function PromotionFormDialog({ open, onOpenChange, product }: PromotionFormDialogProps) {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    productId: "",
    productName: "",
    supermarketName: "",
    imageUrl: "",
    originalPrice: 0,
    discountPercent: 0,
    active: true
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: `${product.name} Special Offer`,
        description: `Exclusive discount on ${product.name}!`,
        productId: product.id,
        productName: product.name,
        supermarketName: "", 
        imageUrl: product.imageUrl || "",
        originalPrice: Number(product.price),
        discountPercent: 10, 
        active: true
      });
    }
  }, [product]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      console.log("Saving promotion with data:", formData);
      await promotionService.createPromotion(formData);
      toast.success("Promotion created successfully! Redirecting...");
      onOpenChange(false);
      // Short delay for the toast to be seen before redirect
      setTimeout(() => navigate("/offers"), 1000);
    } catch (error) {
      toast.error("Failed to create promotion. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] border-none rounded-3xl p-8 overflow-hidden shadow-2xl">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-3xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
            <Plus className="h-7 w-7 text-primary" />
            New Campaign
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2 col-span-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Campaign Name</Label>
              <Input 
                placeholder="e.g. Summer Super Sale" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="rounded-xl border-slate-200 focus:ring-primary h-12 font-medium"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Supermarket</Label>
              <div className="relative">
                <Store className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                <Input 
                  placeholder="e.g. Keells" 
                  value={formData.supermarketName}
                  onChange={(e) => setFormData({ ...formData, supermarketName: e.target.value })}
                  required
                  className="pl-10 rounded-xl border-slate-200 h-12 font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Discount %</Label>
              <div className="relative">
                <Percent className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                <Input 
                  type="number" 
                  min="0" 
                  max="100"
                  value={formData.discountPercent}
                  onChange={(e) => setFormData({ ...formData, discountPercent: parseInt(e.target.value) || 0 })}
                  required
                  className="pl-10 rounded-xl border-slate-200 h-12 font-bold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Product Name</Label>
              <div className="relative">
                <Tag className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                <Input 
                  value={formData.productName}
                  readOnly
                  className="pl-10 rounded-xl border-slate-100 bg-slate-50 h-12 font-medium text-slate-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Product ID</Label>
              <Input 
                value={formData.productId}
                readOnly
                className="rounded-xl border-slate-100 bg-slate-50 h-12 font-mono text-slate-500"
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Image URL</Label>
              <div className="relative">
                <ImageIcon className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                <Input 
                  placeholder="https://images.unsplash.com/..." 
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="pl-10 rounded-xl border-slate-200 h-12 font-mono"
                />
              </div>
            </div>

            <div className="space-y-2 col-span-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Description</Label>
              <Textarea 
                placeholder="Details about the offer..." 
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="rounded-2xl border-slate-200 min-h-[100px] p-4 font-medium"
              />
            </div>
          </div>

          <DialogFooter className="mt-8 gap-4 sm:justify-between">
            <div className="flex items-center gap-2">
              <input 
                type="checkbox"
                id="active-promo"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="h-5 w-5 rounded-lg border-slate-300 text-primary transition-all"
              />
              <Label htmlFor="active-promo" className="text-sm font-black uppercase text-slate-600">Active Campaign</Label>
            </div>
            <Button 
              type="submit" 
              disabled={isSaving}
              className="bg-primary hover:bg-primary/90 text-white font-bold rounded-xl px-10 h-12 shadow-xl shadow-primary/20"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publish Offer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
