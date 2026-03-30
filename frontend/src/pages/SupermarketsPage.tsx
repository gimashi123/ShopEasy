import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supermarketService, Supermarket } from "@/services/supermarketService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Plus, Search, Store, Pencil, Trash2, Link2, MapPin } from "lucide-react";
import { toast } from "sonner";

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
  lat: string;
  lng: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  address: "",
  phone: "",
  email: "",
  openingFrom: "09:00",
  openingTo: "21:00",
  locationMode: "link",
  mapLink: "",
  lat: "",
  lng: "",
};

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
      name: s.name ?? "",
      address: s.address ?? "",
      phone: s.phone ?? "",
      email: s.email ?? "",
      openingFrom: parts[0] ? parseTimeToInput(parts[0]) : "09:00",
      openingTo: parts[1] ? parseTimeToInput(parts[1]) : "21:00",
      locationMode: s.mapLink ? "link" : "manual",
      mapLink: s.mapLink ?? "",
      lat: s.location?.lat?.toString() ?? "",
      lng: s.location?.lng?.toString() ?? "",
    });
    setErrors({});
    setDialogOpen(true);
  };

  const handlePhoneChange = (value: string) => {
    // Only allow digits, max 10
    const digits = value.replace(/\D/g, "").slice(0, 10);
    setForm(f => ({ ...f, phone: digits }));
  };

  const handleMapLinkChange = (value: string) => {
    setForm(f => ({ ...f, mapLink: value }));
    if (value) {
      const coords = extractCoordsFromMapLink(value);
      if (coords) {
        setForm(f => ({ ...f, mapLink: value, lat: coords.lat.toString(), lng: coords.lng.toString() }));
      }
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.address.trim()) newErrors.address = "Address is required";
    if (!form.phone) newErrors.phone = "Phone is required";
    else if (form.phone.length !== 10) newErrors.phone = "Phone must be exactly 10 digits";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "Must include a valid @ email address";
    if (!form.openingFrom || !form.openingTo) newErrors.openingHours = "Opening hours are required";
    if (form.locationMode === "link") {
      if (!form.mapLink.trim()) newErrors.mapLink = "Map link is required";
      else if (!form.mapLink.startsWith("http")) newErrors.mapLink = "Enter a valid URL starting with http";
    } else {
      if (!form.lat || !form.lng) newErrors.mapLink = "Latitude and Longitude are required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);

    const payload = {
      name: form.name,
      address: form.address,
      phone: form.phone,
      email: form.email,
      openingHours: `${formatTime(form.openingFrom)} - ${formatTime(form.openingTo)}`,
      mapLink: form.locationMode === "link" ? form.mapLink || undefined : undefined,
      location: form.lat && form.lng
        ? { lat: parseFloat(form.lat), lng: parseFloat(form.lng) }
        : undefined,
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Supermarkets</h1>
          {isAdmin && (
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />Add Supermarket
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or address..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12">
                <Store className="mx-auto h-10 w-10 text-muted-foreground/40" />
                <p className="mt-2 text-sm font-medium text-foreground">No supermarkets found</p>
                <p className="text-sm text-muted-foreground">
                  {search ? "Try adjusting your search" : "No supermarkets have been added yet"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Opening Hours</TableHead>
                      <TableHead>Status</TableHead>
                      {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((s) => (
                      <TableRow key={s.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell>
                          <Link to={`/supermarkets/${s.id}`} className="text-primary hover:underline font-medium">
                            {s.name}
                          </Link>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{s.address || "—"}</TableCell>
                        <TableCell className="text-sm">{s.phone || "—"}</TableCell>
                        <TableCell className="text-sm">{s.openingHours || "—"}</TableCell>
                        <TableCell>
                          <Badge variant={s.active ? "default" : "secondary"}>
                            {s.active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        {isAdmin && (
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => openEdit(s)}>
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(s)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Supermarket" : "Add Supermarket"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">

            {/* Name */}
            <div className="space-y-1">
              <Label>Name <span className="text-destructive">*</span></Label>
              <Input
                value={form.name}
                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Keells Super"
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            {/* Address */}
            <div className="space-y-1">
              <Label>Address *</Label>
              <Input
                value={form.address}
                onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))}
                placeholder="e.g. 123 Main St, Colombo"
              />
              {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
            </div>

            {/* Phone + Email */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Phone *</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="e.g. 0112345678"
                  inputMode="numeric"
                  maxLength={10}
                />
                {errors.phone
                  ? <p className="text-xs text-destructive">{errors.phone}</p>
                  : form.phone && <p className="text-xs text-muted-foreground">{form.phone.length}/10 digits</p>
                }
              </div>
              <div className="space-y-1">
                <Label>Email *</Label>
                <Input
                  value={form.email}
                  onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="e.g. info@keells.com"
                  type="email"
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>
            </div>

            {/* Opening Hours */}
            <div className="space-y-1">
              <Label>Opening Hours *</Label>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">From</p>
                  <input
                    type="time"
                    value={form.openingFrom}
                    onChange={(e) => setForm(f => ({ ...f, openingFrom: e.target.value }))}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <span className="mt-5 text-muted-foreground">—</span>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">To</p>
                  <input
                    type="time"
                    value={form.openingTo}
                    onChange={(e) => setForm(f => ({ ...f, openingTo: e.target.value }))}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>
              {errors.openingHours
                ? <p className="text-xs text-destructive">{errors.openingHours}</p>
                : form.openingFrom && form.openingTo && (
                    <p className="text-xs text-muted-foreground">
                      Preview: {formatTime(form.openingFrom)} — {formatTime(form.openingTo)}
                    </p>
                  )
              }
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label>Location *</Label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, locationMode: "link" }))}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                    form.locationMode === "link"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground border-input hover:bg-muted"
                  }`}
                >
                  <Link2 className="h-3.5 w-3.5" /> Map Link
                </button>
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, locationMode: "manual" }))}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                    form.locationMode === "manual"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground border-input hover:bg-muted"
                  }`}
                >
                  <MapPin className="h-3.5 w-3.5" /> Coordinates
                </button>
              </div>

              {form.locationMode === "link" ? (
                <div className="space-y-1">
                  <Input
                    value={form.mapLink}
                    onChange={(e) => handleMapLinkChange(e.target.value)}
                    placeholder="Paste Google Maps link..."
                  />
                  {errors.mapLink && <p className="text-xs text-destructive">{errors.mapLink}</p>}
                  {form.lat && form.lng && (
                    <p className="text-xs text-green-600">
                      Coordinates extracted: {parseFloat(form.lat).toFixed(4)}, {parseFloat(form.lng).toFixed(4)}
                    </p>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Latitude</p>
                    <Input
                      type="number"
                      value={form.lat}
                      onChange={(e) => setForm(f => ({ ...f, lat: e.target.value }))}
                      placeholder="e.g. 6.9271"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Longitude</p>
                    <Input
                      type="number"
                      value={form.lng}
                      onChange={(e) => setForm(f => ({ ...f, lng: e.target.value }))}
                      placeholder="e.g. 79.8612"
                    />
                  </div>
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
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
