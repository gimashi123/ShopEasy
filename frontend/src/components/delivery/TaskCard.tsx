import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Package, 
  Clock, 
  Truck, 
  ShieldCheck, 
  CheckCircle2, 
  Navigation2, 
  AlertCircle, 
  Activity,
  ChevronRight,
  MoreVertical
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { DeliveryTask } from "@/types";

interface TaskCardProps {
  task: DeliveryTask;
  isDriverView?: boolean;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onUpdateStatus?: (id: string, status: DeliveryTask["status"]) => void;
}

export function TaskCard({ task, isDriverView = false, onAccept, onReject, onUpdateStatus }: TaskCardProps) {
  
  const getStatusConfig = (status: DeliveryTask["status"]) => {
    switch(status) {
      case "PENDING": return { 
        label: "Ready to Claim", 
        color: "bg-blue-50 text-blue-600 border-blue-100",
        detail: "text-blue-500",
        icon: <Clock className="h-3 w-3" />
      };
      case "ACCEPTED": return { 
        label: "Assigned", 
        color: "bg-sky-50 text-sky-600 border-sky-100",
        detail: "text-sky-500",
        icon: <Package className="h-3 w-3" />
      };
      case "IN_TRANSIT": return { 
        label: "Out for Delivery", 
        color: "bg-indigo-50 text-indigo-600 border-indigo-100",
        detail: "text-indigo-500",
        icon: <Truck className="h-3 w-3" />
      };
      case "DELIVERED": return { 
        label: "Delivered", 
        color: "bg-emerald-50 text-emerald-600 border-emerald-100",
        detail: "text-emerald-500",
        icon: <CheckCircle2 className="h-3 w-3" />
      };
      case "CANCELLED": return { 
        label: "Cancelled", 
        color: "bg-slate-50 text-slate-500 border-slate-200",
        detail: "text-slate-400",
        icon: <AlertCircle className="h-3 w-3" />
      };
      default: return { 
        label: status, 
        color: "bg-slate-50 text-slate-500 border-slate-100",
        detail: "text-slate-400",
        icon: <Activity className="h-3 w-3" />
      };
    }
  };

  const config = getStatusConfig(task.status);
  const timeAgo = formatDistanceToNow(new Date(task.createdAt), { addSuffix: true });

  return (
    <Card className="overflow-hidden bg-white border-slate-100 shadow-lg shadow-slate-200/40 hover:shadow-xl hover:shadow-slate-300/40 transition-all duration-300 rounded-[32px] border-b-4 group">
      <CardHeader className="p-6 border-b border-slate-50 flex flex-row items-center justify-between space-y-0 bg-slate-50/30">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white rounded-2xl shadow-sm border border-slate-100 group-hover:border-blue-200 transition-colors">
            <Package className="h-4 w-4 text-blue-600" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Job Ticket</span>
            <span className="font-black text-xs text-slate-700 tracking-wider">#{task.orderId.toString().substring(0, 8).toUpperCase()}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`rounded-xl border shadow-none px-3 py-1 flex items-center gap-1.5 font-black uppercase text-[9px] tracking-widest ${config.color}`}>
            {config.icon}
            {config.label}
          </Badge>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-slate-500">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 group-hover:border-[#1e40af]/30 transition-colors">
            <MapPin className="h-5 w-5 text-slate-400 group-hover:text-[#1e40af]" />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Delivery Coordinates</p>
            <p className="text-slate-800 text-sm font-bold leading-tight group-hover:text-[#1e40af] transition-colors">{task.deliveryAddress}</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-slate-400" />
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">Recieved Box</span>
              <span className="text-[10px] font-black text-slate-600 tabular-nums">{timeAgo}</span>
            </div>
          </div>
          <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center border border-slate-200 group-hover:border-[#1e40af]/30 transition-colors">
            <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-[#1e40af]" />
          </div>
        </div>
      </CardContent>

      {isDriverView && (["PENDING", "ACCEPTED", "IN_TRANSIT"].includes(task.status)) && (
        <CardFooter className="p-6 pt-0 flex flex-wrap gap-3">
        {isDriverView && task.status === "PENDING" && onAccept && (
          <Button 
            onClick={() => onAccept(task.id)}
            className="w-full bg-[#1e40af] hover:bg-[#1d4bd1] text-white rounded-2xl h-14 font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-blue-900/20 transition-all active:scale-95 group"
          >
            <CheckCircle2 className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
            Accept Order
          </Button>
        )}

          {task.status === "ACCEPTED" && (
            <Button 
              variant="default" 
              className="w-full bg-[#1e40af] hover:bg-[#1d4bd1] text-white font-black uppercase text-[10px] tracking-widest h-12 rounded-2xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              onClick={() => onUpdateStatus?.(task.id, "IN_TRANSIT")}
            >
              <Truck className="h-4 w-4" />
              Mark as Picked Up
            </Button>
          )}

          {task.status === "IN_TRANSIT" && (
            <Button 
              variant="default" 
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase text-[10px] tracking-widest h-12 rounded-2xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              onClick={() => onUpdateStatus?.(task.id, "DELIVERED")}
            >
              <CheckCircle2 className="h-4 w-4" />
              Confirm Delivery
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
