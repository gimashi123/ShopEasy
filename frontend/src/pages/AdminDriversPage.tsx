import { useState, useEffect } from "react";
import { deliveryService } from "@/services/deliveryService";
import { DriverTable } from "@/components/delivery/DriverTable";
import { DriverForm } from "@/components/delivery/DriverForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Loader2, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import type { Driver } from "@/types";

export default function AdminDriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | undefined>();

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const data = await deliveryService.getDrivers();
      setDrivers(data);
    } catch (error) {
      toast.error("Failed to load drivers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleCreateDriver = async (data: any) => {
    try {
      await deliveryService.createDriver(data);
      toast.success("Driver registered successfully");
      setIsDialogOpen(false);
      fetchDrivers();
    } catch (error) {
      toast.error("Failed to register driver");
    }
  };

  const handleUpdateDriver = async (data: any) => {
    if (!editingDriver) return;
    try {
      await deliveryService.updateDriver(editingDriver.id, data);
      toast.success("Driver updated successfully");
      setIsDialogOpen(false);
      setEditingDriver(undefined);
      fetchDrivers();
    } catch (error) {
      toast.error("Failed to update driver");
    }
  };

  const handleDeleteDriver = async (id: string) => {
    if (!confirm("Are you sure you want to remove this driver?")) return;
    try {
      await deliveryService.deleteDriver(id);
      toast.success("Driver removed successfully");
      fetchDrivers();
    } catch (error) {
      toast.error("Failed to remove driver");
    }
  };

  const openEditDialog = (driver: Driver) => {
    setEditingDriver(driver);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fleet Management</h1>
          <p className="text-muted-foreground mt-1">Manage and track your delivery drivers.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchDrivers} disabled={loading}>
            <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setEditingDriver(undefined);
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Driver
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editingDriver ? "Edit Driver" : "Register New Driver"}</DialogTitle>
                <DialogDescription>
                  Enter the driver's details below. They will be available for deliveries immediately after registration.
                </DialogDescription>
              </DialogHeader>
              <DriverForm
                initialData={editingDriver}
                onSubmit={editingDriver ? handleUpdateDriver : handleCreateDriver}
                onCancel={() => setIsDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading && drivers.length === 0 ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <DriverTable
          drivers={drivers}
          onEdit={openEditDialog}
          onDelete={handleDeleteDriver}
        />
      )}
    </div>
  );
}
