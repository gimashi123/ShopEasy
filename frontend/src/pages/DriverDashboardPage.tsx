import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { deliveryService } from "@/services/deliveryService";
import { TaskCard } from "@/components/delivery/TaskCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  Loader2, 
  RefreshCcw, 
  PackageCheck, 
  ClipboardList, 
  User as UserIcon,
  Activity,
  History,
  Navigation,
  LogOut,
  MapPin,
  CheckCircle2,
  TrendingUp
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DeliveryTask, Driver } from "@/types";

export default function DriverDashboardPage() {
  const { user, logout } = useAuth();
  const [driverProfile, setDriverProfile] = useState<Driver | null>(null);
  const [pendingTasks, setPendingTasks] = useState<DeliveryTask[]>([]);
  const [myTasks, setMyTasks] = useState<DeliveryTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

  // Check if driver currently has an active task
  const activeTasks = myTasks.filter(t => t.status === "ACCEPTED" || t.status === "IN_TRANSIT");
  const hasActiveTask = activeTasks.length > 0;

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
        setIsOnline(profile.available);
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

  const handleToggleOnline = async (checked: boolean) => {
    if (!driverProfile?.id) return;
    try {
      setIsOnline(checked);
      toast.success(checked ? "Status: Receiving Jobs" : "Status: Off Duty");
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleAccept = async (taskId: string) => {
    if (!driverProfile?.id) {
      toast.error("Driver Profile required");
      return;
    }
    if (hasActiveTask) {
      toast.error("Complete your current task first!");
      return;
    }

    try {
      await deliveryService.acceptTask(taskId, driverProfile.id);
      toast.success("Job Assigned Successfully!");
      fetchData();
    } catch (error: any) {
      toast.error("Task already claimed by another driver");
    }
  };

  const handleUpdateStatus = async (taskId: string, status: DeliveryTask["status"]) => {
    try {
      await deliveryService.updateTaskStatus(taskId, status);
      toast.success(`Task status updated to ${status.toLowerCase()}`);
      fetchData();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  if (loading && pendingTasks.length === 0 && myTasks.length === 0) {
    return (
      <div className="flex flex-col h-[100vh] items-center justify-center bg-white">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="mt-4 text-slate-500 font-medium animate-pulse">Syncing Dispatch Console...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col pb-12">
      {/* Refined White Header */}
      <header className="bg-white border-b border-slate-100 pb-20 pt-8 px-4 md:px-8 shadow-sm relative overflow-hidden">
        {/* Very subtle background flourish */}
        <div className="absolute right-0 top-0 w-1/3 h-full bg-blue-50/30 blur-3xl -z-10 rounded-full translate-x-1/2 -translate-y-1/2" />
        
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#1e40af] rounded-2xl shadow-lg shadow-blue-900/20">
                <Navigation className="h-7 w-7 text-white" />
              </div>
              <div className="space-y-0.5">
                <h1 className="text-3xl font-black tracking-tighter uppercase italic text-slate-900 leading-none">
                  ShopEasy<span className="text-[#1e40af] not-italic ml-1">Driver</span>
                </h1>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-emerald-100 bg-emerald-50 text-emerald-600 py-0 px-2 rounded-lg">
                    Partner v1.0.9
                  </Badge>
                  <p className="text-slate-400 text-[10px] font-bold tracking-widest uppercase">Console Dispatch</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-slate-50 p-2.5 rounded-2xl flex items-center gap-4 border border-slate-100 shadow-inner">
                <div className="flex flex-col text-right pl-2">
                  <span className="text-[9px] font-black uppercase tracking-tighter text-slate-400">Status</span>
                  <span className={`text-xs font-black uppercase ${isOnline ? 'text-[#1e40af]' : 'text-slate-500'}`}>
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
                <Switch 
                  checked={isOnline} 
                  onCheckedChange={handleToggleOnline}
                  className="data-[state=checked]:bg-[#1e40af] data-[state=unchecked]:bg-slate-200"
                />
              </div>

              <div className="bg-white p-1 rounded-2xl flex items-center gap-2 shadow-sm border border-slate-100">
                <div className="h-10 w-10 rounded-[14px] bg-slate-50 flex items-center justify-center text-slate-400 font-black relative group cursor-pointer overflow-hidden border border-slate-100">
                  <UserIcon className="h-5 w-5 group-hover:text-blue-600 transition-colors" />
                </div>
                <div className="pr-3 hidden sm:flex flex-col">
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">Identity Verified</span>
                  <span className="text-xs font-black text-[#1e40af]">{(driverProfile?.name && driverProfile.name !== 'string') ? driverProfile.name : (user?.username !== 'string' ? user?.username : (user?.email || 'Authorized Driver'))}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => logout()} 
                  className="hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-[12px] h-10 w-10 transition-all"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Overlap Area */}
      <div className="max-w-6xl mx-auto w-full px-4 md:px-8 -mt-10 relative z-20 space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Active Mission", value: hasActiveTask ? "1" : "0", icon: Activity, color: "text-[#1e40af]", bg: "bg-blue-50" },
            { label: "Inbound Jobs", value: pendingTasks.length, icon: ClipboardList, color: "text-slate-600", bg: "bg-slate-100" },
            { label: "Completed", value: myTasks.filter(t => t.status === "DELIVERED").length, icon: PackageCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Performance", value: "99%", icon: TrendingUp, color: "text-[#1e40af]", bg: "bg-blue-50" },
          ].map((stat, i) => (
            <Card key={i} className="bg-white border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-slate-300/40 transition-all duration-300 rounded-[32px] overflow-hidden group border-b-2 hover:border-[#1e40af]">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} transition-all duration-300 group-hover:shadow-lg group-hover:shadow-current/10 group-hover:-translate-y-1`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-black tabular-nums tracking-tight text-slate-900 group-hover:text-[#1e40af] transition-colors">{stat.value}</span>
                  <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider mt-0.5">{stat.label}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Console Controls */}
        <Tabs defaultValue="pending" className="w-full space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="bg-white p-1 rounded-2xl shadow-sm border border-slate-100 inline-flex">
              <TabsList className="bg-transparent h-auto p-0 gap-1">
                <TabsTrigger 
                  value="pending" 
                  className="rounded-xl px-6 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-600/20 transition-all duration-300 font-black uppercase text-[10px] tracking-widest text-slate-400"
                >
                  Jobs Feed
                </TabsTrigger>
                <TabsTrigger 
                  value="active" 
                  className="rounded-xl px-6 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-600/20 transition-all duration-300 font-black uppercase text-[10px] tracking-widest text-slate-400"
                >
                  Logistics History
                </TabsTrigger>
              </TabsList>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchData}
              className="rounded-xl border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-blue-600 font-bold uppercase text-[9px] tracking-widest gap-2"
            >
              <RefreshCcw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
              Refresh Console
            </Button>
          </div>

          <TabsContent value="pending" className="mt-0 outline-none">
            {!isOnline ? (
              <Card className="border-2 border-dashed border-slate-200 bg-white py-24 rounded-[48px] text-center shadow-inner">
                <div className="flex flex-col items-center gap-6">
                  <div className="h-24 w-24 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 border border-slate-100">
                    <Activity className="h-10 w-10" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Interface Standby</h3>
                    <p className="text-slate-400 text-sm max-w-sm mx-auto font-medium leading-relaxed">Switch to 'Online' status in the header to receive new delivery assignments from headquarters.</p>
                  </div>
                  <Button 
                    onClick={() => handleToggleOnline(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-10 h-14 font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-600/20 transition-all active:scale-95"
                  >
                    Activate Console
                  </Button>
                </div>
              </Card>
            ) : pendingTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                <div className="p-8 bg-white border border-slate-100 rounded-full text-slate-200 shadow-sm animate-pulse">
                  <MapPin className="h-12 w-12" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Scanning Territory</h3>
                  <p className="text-slate-400 text-sm font-medium">Monitoring all active coordinates for logistics requests...</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {pendingTasks.map(task => (
                  <div key={task.id} className="relative group">
                    <TaskCard
                      task={task}
                      isDriverView
                      onAccept={handleAccept}
                    />
                    {hasActiveTask && (
                      <div className="absolute inset-x-4 inset-y-4 bg-white/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center rounded-[32px] p-8 text-center shadow-2xl border border-slate-100/50">
                        <div className="p-4 bg-slate-50 rounded-full mb-4 text-slate-300">
                          <Activity className="h-8 w-8" />
                        </div>
                        <p className="font-black uppercase text-[11px] tracking-widest text-slate-500 mb-4 px-4 line-clamp-2">Complete current mission to unlock more jobs</p>
                        <Badge variant="outline" className="border-blue-100 bg-blue-50 text-blue-600 py-2 px-4 rounded-xl font-black uppercase text-[9px] tracking-widest">Priority Active</Badge>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="active" className="mt-0 outline-none">
            {myTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
                <div className="p-6 bg-slate-50 rounded-full text-slate-200 border border-slate-100">
                  <PackageCheck className="h-12 w-12" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Archives Clean</h3>
                  <p className="text-slate-400 text-sm font-medium">Claim your first delivery ticket from the feed to begin your logs.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-16">
                {activeTasks.length > 0 && (
                  <div className="space-y-8">
                    <div className="flex items-center gap-6">
                      <span className="text-[12px] font-black uppercase tracking-[0.4em] text-blue-600 flex-shrink-0 flex items-center gap-3">
                        <Activity className="h-4 w-4" /> Live Operation
                      </span>
                      <div className="flex-1 h-px bg-slate-100 shadow-sm" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {activeTasks.map(task => (
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
                
                <div className="space-y-8">
                  <div className="flex items-center gap-6">
                    <span className="text-[12px] font-black uppercase tracking-[0.4em] text-slate-400 flex-shrink-0 flex items-center gap-3">
                      <History className="h-4 w-4" /> Mission History
                    </span>
                    <div className="flex-1 h-px bg-slate-100 shadow-sm" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 opacity-90 group-hover:opacity-100 transition-all">
                    {myTasks.filter(t => ["DELIVERED", "CANCELLED"].includes(t.status)).map(task => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        isDriverView
                        onUpdateStatus={handleUpdateStatus}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <footer className="mt-auto py-16 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-300">ShopEasy Systems • Logistic Ops Console • Core v1.0.9</p>
      </footer>
    </div>
  );
}
