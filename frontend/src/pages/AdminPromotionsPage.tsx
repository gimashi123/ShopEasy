import { useState, useEffect } from "react";
import { promotionService, Promotion } from "@/services/promotionService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Plus, Edit2, Trash2, Megaphone, Store, Tag, Image as ImageIcon, Percent, Check, X } from "lucide-react";

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    productId: "",
    productName: "",
    supermarketName: "",
    imageUrl: "",
    discountPercent: 0,
    active: true
  });

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const data = await promotionService.getAllPromotions();
      setPromotions(data || []);
    } catch (error) {
      toast.error("Failed to load promotions");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (promo?: Promotion) => {
    if (promo) {
      setEditingPromo(promo);
      setFormData({
        name: promo.name,
        description: promo.description || "",
        productId: promo.productId,
        productName: promo.productName || "",
        supermarketName: promo.supermarketName || "",
        imageUrl: promo.imageUrl || "",
        discountPercent: promo.discountPercent,
        active: promo.active
      });
    } else {
      setEditingPromo(null);
      setFormData({
        name: "",
        description: "",
        productId: "",
        productName: "",
        supermarketName: "",
        imageUrl: "",
        discountPercent: 0,
        active: true
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingPromo) {
        await promotionService.updatePromotion(editingPromo.id, formData);
        toast.success("Promotion updated successfully");
      } else {
        await promotionService.createPromotion(formData);
        toast.success("Promotion created successfully");
      }
      setIsDialogOpen(false);
      fetchPromotions();
    } catch (error) {
      toast.error("Failed to save promotion");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this promotion?")) return;
    try {
      await promotionService.deletePromotion(id);
      toast.success("Promotion deleted");
      fetchPromotions();
    } catch (error) {
      toast.error("Failed to delete promotion");
    }
  };

  const toggleStatus = async (promo: Promotion) => {
    try {
      await promotionService.updatePromotion(promo.id, { ...promo, active: !promo.active });
      toast.success(`Promotion ${!promo.active ? "activated" : "deactivated"}`);
      fetchPromotions();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
            <Megaphone className="h-8 w-8 text-primary" />
            Manage Promotions
          </h1>
          <p className="text-slate-500 mt-1 font-medium italic">Create and curate exclusive deals for your customers.</p>
        </div>
        <Button 
          onClick={() => handleOpenDialog()} 
          className="bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 px-6 py-6"
        >
          <Plus className="mr-2 h-5 w-5" /> New Campaign
        </Button>
      </div>

      <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="font-bold text-slate-600">Campaign / Product</TableHead>
                <TableHead className="font-bold text-slate-600">Supermarket</TableHead>
                <TableHead className="font-bold text-slate-600">Discount</TableHead>
                <TableHead className="font-bold text-slate-600">Status</TableHead>
                <TableHead className="font-bold text-slate-600 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
                    <p className="text-slate-400 mt-4 font-medium uppercase tracking-widest text-xs">Loading offers...</p>
                  </TableCell>
                </TableRow>
              ) : promotions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center text-slate-400 font-medium italic">
                    No active campaigns. Start by creating one!
                  </TableCell>
                </TableRow>
              ) : (
                promotions.map((promo) => (
                  <TableRow key={promo.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl overflow-hidden shadow-sm border border-slate-100 bg-white">
                          <img 
                            src={promo.imageUrl || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&q=80"} 
                            alt="" 
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-black text-slate-800 tracking-tight">{promo.name}</p>
                          <p className="text-xs text-primary font-bold uppercase tracking-widest">{promo.productName || promo.productId}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-slate-600 font-semibold">
                        <Store className="h-4 w-4 text-slate-400" />
                        {promo.supermarketName || "Global"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-rose-500 text-white font-black rounded-lg">
                        -{promo.discountPercent}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <button 
                        onClick={() => toggleStatus(promo)}
                        className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider transition-all ${
                          promo.active 
                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" 
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        }`}
                      >
                        {promo.active ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        {promo.active ? "Active" : "Inactive"}
                      </button>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(promo)} className="text-slate-400 hover:text-primary transition-colors">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(promo.id)} className="text-slate-400 hover:text-rose-500 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] border-none rounded-3xl p-8 overflow-hidden shadow-2xl">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-3xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
              {editingPromo ? <Edit2 className="h-7 w-7 text-primary" /> : <Plus className="h-7 w-7 text-primary" />}
              {editingPromo ? "Edit Campaign" : "New Campaign"}
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
                    onChange={(e) => setFormData({ ...formData, discountPercent: parseInt(e.target.value) })}
                    className="pl-10 rounded-xl border-slate-200 h-12 font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Product Name</Label>
                <div className="relative">
                  <Tag className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                  <Input 
                    placeholder="e.g. Fresh Milk" 
                    value={formData.productName}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                    className="pl-10 rounded-xl border-slate-200 h-12 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Product ID</Label>
                <Input 
                  placeholder="e.g. PROD-001" 
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  className="rounded-xl border-slate-200 h-12 font-mono"
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
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="h-5 w-5 rounded-lg border-slate-300 text-primary transition-all"
                />
                <Label htmlFor="active" className="text-sm font-black uppercase text-slate-600">Active Campaign</Label>
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
    </div>
  );
}
