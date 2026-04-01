import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supermarketService, Supermarket } from "@/services/supermarketService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import {
  Plus, Search, Store, Pencil, Trash2,
  Link2, MapPin, Phone, Clock, ShoppingBag, ExternalLink, ImageIcon, ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import { resolveGoogleDriveUrl } from "@/lib/productImage";

// ─── helpers ────────────────────────────────────────────────────────────────

function formatTime(time: string): string {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${period}`;
}

function parseTimeToInput(formatted: string): string {
  const match = formatted.trim().match(/^(\d+):(\d+)\s*(AM|PM)$/i);
  if (!match) return "09:00";
  let h = parseInt(match[1]);
  const m = match[2];
  const period = match[3].toUpperCase();
  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  return `${h.toString().padStart(2, "0")}:${m}`;
}

function extractCoordsFromMapLink(url: string): { lat: number; lng: number } | null {
  const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };
  const qMatch = url.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (qMatch) return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) };
  return null;
}

// ─── types ───────────────────────────────────────────────────────────────────

interface FormState {
  name: string;
  address: string;
  phone: string;
  email: string;
  openingFrom: string;
  openingTo: string;
  locationMode: "link" | "manual";
  mapLink: string;
  imageUrl: string;
  lat: string;
  lng: string;
}

const EMPTY_FORM: FormState = {
  name: "", address: "", phone: "", email: "",
  openingFrom: "09:00", openingTo: "21:00",
  locationMode: "link", mapLink: "", imageUrl: "", lat: "", lng: "",
};

// Gradient placeholder colours when no image is provided
const PLACEHOLDER_GRADIENTS = [
  "from-blue-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-purple-500 to-violet-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
  "from-cyan-500 to-sky-600",
];

// ─── component ───────────────────────────────────────────────────────────────

export default function SupermarketsPage() {
  const { user } = useAuth();
  const isAdmin = user?.roles?.some(r => r.includes("ROLE_ADMIN"));

  const [supermarkets, setSupermarkets] = useState<Supermarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Supermarket | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Supermarket | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadSupermarkets = () => {
    setLoading(true);
    supermarketService.getAll()
      .then(setSupermarkets)
      .catch(() => toast.error("Failed to load supermarkets"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadSupermarkets(); }, []);

  const filtered = supermarkets.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.address?.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setDialogOpen(true);
  };

  const openEdit = (s: Supermarket) => {
    setEditing(s);
    const parts = s.openingHours?.split(" - ") ?? [];
    setForm({
      name: s.name ?? "", address: s.address ?? "",
      phone: s.phone ?? "", email: s.email ?? "",
      openingFrom: parts[0] ? parseTimeToInput(parts[0]) : "09:00",
      openingTo: parts[1] ? parseTimeToInput(parts[1]) : "21:00",
      locationMode: s.mapLink ? "link" : "manual",
      mapLink: s.mapLink ?? "",
      imageUrl: s.imageUrl ?? "",
      lat: s.location?.lat?.toString() ?? "",
      lng: s.location?.lng?.toString() ?? "",
    });
    setErrors({});
    setDialogOpen(true);
  };

  const handlePhoneChange = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    setForm(f => ({ ...f, phone: digits }));
  };

  const handleMapLinkChange = (value: string) => {
    const coords = value ? extractCoordsFromMapLink(value) : null;
    setForm(f => ({
      ...f, mapLink: value,
      lat: coords ? coords.lat.toString() : f.lat,
      lng: coords ? coords.lng.toString() : f.lng,
    }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.address.trim()) e.address = "Address is required";
    if (!form.phone) e.phone = "Phone is required";
    else if (form.phone.length !== 10) e.phone = "Phone must be exactly 10 digits";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email address";
    if (!form.openingFrom || !form.openingTo) e.openingHours = "Opening hours are required";
    if (form.locationMode === "link") {
      if (!form.mapLink.trim()) e.mapLink = "Map link is required";
      else if (!form.mapLink.startsWith("http")) e.mapLink = "Enter a valid URL starting with http";
    } else {
      if (!form.lat || !form.lng) e.mapLink = "Latitude and Longitude are required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    const payload = {
      name: form.name, address: form.address,
      phone: form.phone, email: form.email,
      openingHours: `${formatTime(form.openingFrom)} - ${formatTime(form.openingTo)}`,
      mapLink: form.locationMode === "link" ? form.mapLink || undefined : undefined,
      imageUrl: form.imageUrl.trim() || undefined,
      location: form.lat && form.lng ? { lat: parseFloat(form.lat), lng: parseFloat(form.lng) } : undefined,
    };
    try {
      if (editing) {
        await supermarketService.update(editing.id, payload);
        toast.success("Supermarket updated successfully");
      } else {
        await supermarketService.create(payload);
        toast.success("Supermarket added successfully");
      }
      setDialogOpen(false);
      loadSupermarkets();
    } catch {
      toast.error(editing ? "Failed to update supermarket" : "Failed to add supermarket");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await supermarketService.delete(deleteTarget.id);
      toast.success("Supermarket deleted successfully");
      setDeleteTarget(null);
      loadSupermarkets();
    } catch {
      toast.error("Failed to delete supermarket");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="space-y-6">

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
              <Store className="h-8 w-8 text-primary" />
              Supermarkets
            </h1>
            <p className="text-muted-foreground mt-2 text-lg max-w-xl">
              Browse stores near you and explore available products.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative w-full md:w-80 group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              </div>
              <Input
                placeholder="Search by name or address..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-11 h-12 rounded-2xl border-muted bg-secondary/20 focus-visible:ring-primary shadow-sm"
              />
            </div>
            {isAdmin && (
              <Button onClick={openCreate} className="h-12 px-5 rounded-2xl shrink-0">
                <Plus className="mr-2 h-4 w-4" />Add Supermarket
              </Button>
            )}
          </div>
        </div>

        {/* Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="rounded-3xl overflow-hidden shadow-sm">
                <Skeleton className="h-48 w-full" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-9 w-full rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 border-2 border-dashed rounded-3xl bg-secondary/10 flex flex-col items-center">
            <Store className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-2xl font-bold">No supermarkets found</h3>
            <p className="text-muted-foreground mt-2">
              {search ? "Try a different search term" : "No supermarkets have been added yet"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((s, idx) => (
              <div
                key={s.id}
                className="group relative rounded-3xl overflow-hidden border border-border/50 bg-background shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                {/* Cover Image */}
                <div className="relative h-48 overflow-hidden">
                  {s.imageUrl ? (
                    <img
                      src={resolveGoogleDriveUrl(s.imageUrl)}
                      alt={s.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${PLACEHOLDER_GRADIENTS[idx % PLACEHOLDER_GRADIENTS.length]} flex items-center justify-center`}>
                      <Store className="h-16 w-16 text-white/40" />
                    </div>
                  )}
                  {/* Gradient overlay for text legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Status badge top-right */}
                  <div className="absolute top-3 right-3">
                    <Badge className={`font-semibold text-xs px-3 py-1 shadow-md ${s.active ? "bg-green-500 text-white border-0" : "bg-gray-500 text-white border-0"}`}>
                      {s.active ? "Open" : "Closed"}
                    </Badge>
                  </div>

                  {/* Admin actions top-left */}
                  {isAdmin && (
                    <div className="absolute top-3 left-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button onClick={() => openEdit(s)}
                        className="h-8 w-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-md transition-colors">
                        <Pencil className="h-3.5 w-3.5 text-gray-700" />
                      </button>
                      <button onClick={() => setDeleteTarget(s)}
                        className="h-8 w-8 rounded-full bg-white/90 hover:bg-red-50 flex items-center justify-center shadow-md transition-colors">
                        <Trash2 className="h-3.5 w-3.5 text-red-500" />
                      </button>
                    </div>
                  )}

                  {/* Name overlaid at bottom of image */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-lg font-bold text-white leading-tight drop-shadow">{s.name}</h3>
                    <p className="text-xs text-white/70 mt-0.5">{s.id}</p>
                  </div>
                </div>

                {/* Info Section */}
                <div className="p-4 flex flex-col gap-2 flex-1">
                  <div className="space-y-1.5">
                    {s.address && (
                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5 text-primary/60" />
                        <span className="line-clamp-1">{s.address}</span>
                      </div>
                    )}
                    {s.phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                        <span>{s.phone}</span>
                      </div>
                    )}
                    {s.openingHours && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                        <span>{s.openingHours}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-auto pt-3">
                    <Button asChild className="flex-1 rounded-xl" size="sm">
                      <Link to={`/supermarkets/${s.id}`}>
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        View Products
                        <ArrowRight className="h-4 w-4 ml-auto" />
                      </Link>
                    </Button>
                    {s.mapLink && (
                      <Button asChild size="sm" variant="outline" className="rounded-xl px-3">
                        <a href={s.mapLink} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Supermarket" : "Add Supermarket"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Name <span className="text-destructive">*</span></Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Keells Super" />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-1">
              <Label className="flex items-center gap-1.5"><ImageIcon className="h-3.5 w-3.5" />Cover Image URL <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Input value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="https://example.com/store-image.jpg" />
              {form.imageUrl.trim() && (
                <div className="mt-2 rounded-xl overflow-hidden h-28 border">
                  <img src={resolveGoogleDriveUrl(form.imageUrl)} alt="Preview" className="w-full h-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                </div>
              )}
            </div>
            <div className="space-y-1">
              <Label>Address *</Label>
              <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="e.g. 123 Main St, Colombo" />
              {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Phone *</Label>
                <Input value={form.phone} onChange={e => handlePhoneChange(e.target.value)} placeholder="0112345678" inputMode="numeric" maxLength={10} />
                {errors.phone
                  ? <p className="text-xs text-destructive">{errors.phone}</p>
                  : form.phone && <p className="text-xs text-muted-foreground">{form.phone.length}/10 digits</p>}
              </div>
              <div className="space-y-1">
                <Label>Email *</Label>
                <Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="info@keells.com" type="email" />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>
            </div>
            <div className="space-y-1">
              <Label>Opening Hours *</Label>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">From</p>
                  <input type="time" value={form.openingFrom} onChange={e => setForm(f => ({ ...f, openingFrom: e.target.value }))}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring" />
                </div>
                <span className="mt-5 text-muted-foreground">—</span>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">To</p>
                  <input type="time" value={form.openingTo} onChange={e => setForm(f => ({ ...f, openingTo: e.target.value }))}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring" />
                </div>
              </div>
              {errors.openingHours
                ? <p className="text-xs text-destructive">{errors.openingHours}</p>
                : form.openingFrom && form.openingTo && (
                    <p className="text-xs text-muted-foreground">Preview: {formatTime(form.openingFrom)} — {formatTime(form.openingTo)}</p>
                  )}
            </div>
            <div className="space-y-2">
              <Label>Location *</Label>
              <div className="flex gap-2">
                {(["link", "manual"] as const).map(mode => (
                  <button key={mode} type="button" onClick={() => setForm(f => ({ ...f, locationMode: mode }))}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                      form.locationMode === mode ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-input hover:bg-muted"}`}>
                    {mode === "link" ? <><Link2 className="h-3.5 w-3.5" /> Map Link</> : <><MapPin className="h-3.5 w-3.5" /> Coordinates</>}
                  </button>
                ))}
              </div>
              {form.locationMode === "link" ? (
                <div className="space-y-1">
                  <Input value={form.mapLink} onChange={e => handleMapLinkChange(e.target.value)} placeholder="Paste Google Maps link..." />
                  {errors.mapLink && <p className="text-xs text-destructive">{errors.mapLink}</p>}
                  {form.lat && form.lng && (
                    <p className="text-xs text-green-600">Coordinates extracted: {parseFloat(form.lat).toFixed(4)}, {parseFloat(form.lng).toFixed(4)}</p>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Latitude</p>
                    <Input type="number" value={form.lat} onChange={e => setForm(f => ({ ...f, lat: e.target.value }))} placeholder="e.g. 6.9271" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Longitude</p>
                    <Input type="number" value={form.lng} onChange={e => setForm(f => ({ ...f, lng: e.target.value }))} placeholder="e.g. 79.8612" />
                  </div>
                  {errors.mapLink && <p className="text-xs text-destructive col-span-2">{errors.mapLink}</p>}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : editing ? "Save Changes" : "Add Supermarket"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Supermarket</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
