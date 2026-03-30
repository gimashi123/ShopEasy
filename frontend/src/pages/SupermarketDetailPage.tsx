import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supermarketService, Supermarket } from "@/services/supermarketService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { ArrowLeft, MapPin, Phone, Mail, Clock, Store, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/helpers";

export default function SupermarketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.roles?.some(r => r.includes("ROLE_ADMIN"));

  const [supermarket, setSupermarket] = useState<Supermarket | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    supermarketService.getById(id)
      .then(setSupermarket)
      .catch(() => toast.error("Failed to load supermarket"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!supermarket) return;
    setDeleting(true);
    try {
      await supermarketService.delete(supermarket.id);
      toast.success("Supermarket deleted successfully");
      navigate("/supermarkets");
    } catch {
      toast.error("Failed to delete supermarket");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (!supermarket) {
    return (
      <div className="text-center py-20">
        <Store className="mx-auto h-10 w-10 text-muted-foreground/40" />
        <p className="mt-2 text-sm font-medium">Supermarket not found</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/supermarkets">Back to Supermarkets</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
    <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" size="sm">
              <Link to="/supermarkets"><ArrowLeft className="h-4 w-4 mr-1" />Back</Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{supermarket.name}</h1>
            <Badge variant={supermarket.active ? "default" : "secondary"}>
              {supermarket.active ? "Active" : "Inactive"}
            </Badge>
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm">
                <Link to={`/supermarkets/${supermarket.id}/edit`}>
                  <Pencil className="h-4 w-4 mr-1" />Edit
                </Link>
              </Button>
              <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
                <Trash2 className="h-4 w-4 mr-1" />Delete
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-medium tracking-wide">Address</p>
                  <p className="text-sm">{supermarket.address || "—"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-medium tracking-wide">Phone</p>
                  <p className="text-sm">{supermarket.phone || "—"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-medium tracking-wide">Email</p>
                  <p className="text-sm">{supermarket.email || "—"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-medium tracking-wide">Opening Hours</p>
                  <p className="text-sm">{supermarket.openingHours || "—"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location & Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Location & Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {supermarket.mapLink && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-medium tracking-wide">Map Link</p>
                    <a
                      href={supermarket.mapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline break-all"
                    >
                      Open in Google Maps
                    </a>
                  </div>
                </div>
              )}
              {supermarket.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-medium tracking-wide">Coordinates</p>
                    <p className="text-sm tabular-nums">
                      {supermarket.location.lat}, {supermarket.location.lng}
                    </p>
                  </div>
                </div>
              )}
              {!supermarket.mapLink && !supermarket.location && (
                <p className="text-sm text-muted-foreground">No location set</p>
              )}
              <div>
                <p className="text-xs text-muted-foreground uppercase font-medium tracking-wide">Added On</p>
                <p className="text-sm">{formatDate(supermarket.createdAt)}</p>
              </div>
              {supermarket.updatedAt && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-medium tracking-wide">Last Updated</p>
                  <p className="text-sm">{formatDate(supermarket.updatedAt)}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Supermarket</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{supermarket.name}</strong>? This action cannot be undone.
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
