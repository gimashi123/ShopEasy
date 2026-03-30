import { useState, useEffect } from "react";
import { deliveryService } from "@/services/deliveryService";
import { TaskCard } from "@/components/delivery/TaskCard";
import { TaskCreateForm } from "@/components/delivery/TaskCreateForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, RefreshCcw, LayoutGrid, List, Plus } from "lucide-react";
import { toast } from "sonner";
import type { DeliveryTask } from "@/types";

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<DeliveryTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data: DeliveryTask[] = await deliveryService.getTasks();
      const sorted = [...data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setTasks(sorted);
    } catch (error) {
      toast.error("Failed to load delivery tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreateTask = async (data: { orderId: string; deliveryAddress: string }) => {
    try {
      await deliveryService.createTask(data);
      toast.success("Delivery task created successfully");
      setIsDialogOpen(false);
      fetchTasks();
    } catch (error) {
      toast.error("Failed to create task");
    }
  };

  const filterTasks = (status: string) => {
    if (status === "all") return tasks;
    return tasks.filter(t => t.status === status);
  };

  const TaskList = ({ status }: { status: string }) => {
    const filtered = filterTasks(status);
    
    if (filtered.length === 0) {
      return (
        <div className="text-center py-20 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">No tasks found in this category.</p>
        </div>
      );
    }

    return (
      <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}>
        {filtered.map(task => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Delivery Operations</h1>
          <p className="text-muted-foreground mt-1">Monitor and manage all delivery assignments.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border rounded-md p-1 mr-2 bg-muted/50">
            <Button 
              variant={viewMode === "grid" ? "secondary" : "ghost"} 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button 
              variant={viewMode === "list" ? "secondary" : "ghost"} 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" size="icon" onClick={fetchTasks} disabled={loading}>
            <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create Delivery Task</DialogTitle>
                <DialogDescription>
                  Manually create a delivery task. Generally, tasks are created automatically when orders are placed.
                </DialogDescription>
              </DialogHeader>
              <TaskCreateForm
                onSubmit={handleCreateTask}
                onCancel={() => setIsDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="PENDING">Pending</TabsTrigger>
          <TabsTrigger value="ACCEPTED">Accepted</TabsTrigger>
          <TabsTrigger value="IN_TRANSIT">In Transit</TabsTrigger>
          <TabsTrigger value="DELIVERED">Delivered</TabsTrigger>
        </TabsList>
        
        {loading && tasks.length === 0 ? (
          <div className="flex h-[40vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <TabsContent value="all" className="mt-6"><TaskList status="all" /></TabsContent>
            <TabsContent value="PENDING" className="mt-6"><TaskList status="PENDING" /></TabsContent>
            <TabsContent value="ACCEPTED" className="mt-6"><TaskList status="ACCEPTED" /></TabsContent>
            <TabsContent value="IN_TRANSIT" className="mt-6"><TaskList status="IN_TRANSIT" /></TabsContent>
            <TabsContent value="DELIVERED" className="mt-6"><TaskList status="DELIVERED" /></TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
