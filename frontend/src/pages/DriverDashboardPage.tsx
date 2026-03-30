import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { deliveryService } from "@/services/deliveryService";
import { TaskCard } from "@/components/delivery/TaskCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCcw, PackageCheck, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import type { DeliveryTask, Driver } from "@/types";

export default function DriverDashboardPage() {
  const { user } = useAuth();
  const [driverProfile, setDriverProfile] = useState<Driver | null>(null);
  const [pendingTasks, setPendingTasks] = useState<DeliveryTask[]>([]);
  const [myTasks, setMyTasks] = useState<DeliveryTask[]>([]);
  const [loading, setLoading] = useState(true);

  // Check if driver currently has an active task
  const hasActiveTask = myTasks.some(t => t.status === "ACCEPTED" || t.status === "IN_TRANSIT");

  const fetchData = async () => {
    setLoading(true);
    try {
      const results = await Promise.all([
        deliveryService.getPendingTasks(),
        deliveryService.getTasks(),
        deliveryService.getDrivers(),
      ]);
      const [pending, allTasks, drivers] = results as [DeliveryTask[], DeliveryTask[], Driver[]];
      setPendingTasks(pending);
      
      const profile = drivers.find(d => d.email === user?.email) || null;
      setDriverProfile(profile);

      if (profile) {
        setMyTasks(allTasks.filter(t => t.driverId === profile.id));
      } else {
        setMyTasks([]);
      }
    } catch (error) {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email) fetchData();
  }, [user]);

  const handleAccept = async (taskId: string) => {
    if (!driverProfile?.id) {
      toast.error("You need a registered Driver Profile to accept tasks.");
      return;
    }
    if (hasActiveTask) {
      toast.error("You must complete your current task before accepting a new one.");
      return;
    }

    try {
      await deliveryService.acceptTask(taskId, driverProfile.id);
      toast.success("Task accepted!");
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Could not accept task. It might have been taken by someone else.");
    }
  };

  const handleReject = async (taskId: string) => {
    if (!driverProfile?.id) return;
    try {
      await deliveryService.rejectTask(taskId, driverProfile.id);
      toast.info("Task rejected");
      fetchData();
    } catch (error) {
      toast.error("Failed to reject task");
    }
  };

  const handleUpdateStatus = async (taskId: string, status: DeliveryTask["status"]) => {
    try {
      await deliveryService.updateTaskStatus(taskId, status);
      toast.success(`Task marked as ${status.replace("_", " ").toLowerCase()}`);
      fetchData();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  if (loading && pendingTasks.length === 0 && myTasks.length === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!loading && !driverProfile) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto pb-10">
        <div className="text-center py-20 border-2 border-dashed rounded-lg bg-orange-50 mt-10">
          <h2 className="text-xl font-semibold mb-2 text-orange-800">No Driver Profile Found</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            You are logged in as a driver, but we couldn't find a matching driver profile for <strong>{user?.email}</strong>. 
            Please ask an administrator to register your driver profile with this exact email address.
          </p>
          <Button className="mt-6" variant="outline" onClick={fetchData}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Check Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Driver Portal</h1>
          <p className="text-muted-foreground mt-1">Manage your delivery tasks and availability.</p>
        </div>
        <Button variant="outline" size="icon" onClick={fetchData} disabled={loading}>
          <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="w-full max-w-md">
          <TabsTrigger value="pending" className="flex-1 gap-2">
            <ClipboardList className="h-4 w-4" />
            Pending Tasks ({pendingTasks.length})
          </TabsTrigger>
          <TabsTrigger value="active" className="flex-1 gap-2">
            <PackageCheck className="h-4 w-4" />
            My Active Tasks ({myTasks.filter(t => ["ACCEPTED", "IN_TRANSIT"].includes(t.status)).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {pendingTasks.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed rounded-lg bg-muted/30">
              <p className="text-muted-foreground italic">No pending tasks in your area right now.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingTasks.map(task => (
                <div key={task.id} className="relative">
                  <TaskCard
                    task={task}
                    isDriverView
                    onAccept={handleAccept}
                    onReject={handleReject}
                  />
                  {hasActiveTask && (
                    <div className="absolute inset-0 bg-background/50 flex items-center justify-center rounded-xl backdrop-blur-[1px]">
                      <span className="bg-background px-3 py-1 rounded-md text-sm font-medium border shadow-sm text-muted-foreground">
                        Finish current task to unlock
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="active" className="mt-6 text-2xl">
          {myTasks.filter(t => ["ACCEPTED", "IN_TRANSIT", "DELIVERED"].includes(t.status)).length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed rounded-lg bg-muted/30">
              <p className="text-muted-foreground italic text-lg">You haven't accepted any tasks yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold px-1">Recent Activity</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-base">
                {myTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    isDriverView
                    onUpdateStatus={handleUpdateStatus}
                  />
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
