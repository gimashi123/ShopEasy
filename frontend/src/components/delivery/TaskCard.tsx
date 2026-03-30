import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Package, Clock, Truck, ShieldCheck } from "lucide-react";
import { format } from "date-fns";
import type { DeliveryTask } from "@/types";

interface TaskCardProps {
  task: DeliveryTask;
  isDriverView?: boolean;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onUpdateStatus?: (id: string, status: DeliveryTask["status"]) => void;
}

export function TaskCard({ task, isDriverView = false, onAccept, onReject, onUpdateStatus }: TaskCardProps) {
  
  const getStatusBadge = (status: DeliveryTask["status"]) => {
    switch(status) {
      case "PENDING": return <Badge variant="pending" className="uppercase text-[10px]">Pending</Badge>;
      case "ACCEPTED": return <Badge variant="active" className="uppercase text-[10px]">Accepted</Badge>;
      case "IN_TRANSIT": return <Badge variant="outline" className="bg-blue-100 text-blue-700 hover:bg-blue-100 uppercase text-[10px] border-transparent">In Transit</Badge>;
      case "DELIVERED": return <Badge variant="success" className="uppercase text-[10px]">Delivered</Badge>;
      case "CANCELLED": return <Badge variant="destructive" className="uppercase text-[10px]">Cancelled</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md border-slate-200">
      <CardHeader className="p-4 bg-slate-50/50 border-b flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span className="font-semibold text-sm tabular-nums">ORD-{task.orderId}</span>
        </div>
        {getStatusBadge(task.status)}
      </CardHeader>
      
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start gap-3 text-sm">
          <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-medium leading-none">Delivery Destination</p>
            <p className="text-muted-foreground text-xs leading-relaxed">{task.deliveryAddress}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2 border-t mt-2">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider flex items-center gap-1">
              <Clock className="h-3 w-3" /> Created
            </span>
            <span className="text-xs font-medium tabular-nums">
              {format(new Date(task.createdAt), "MMM d, h:mm a")}
            </span>
          </div>

          {!isDriverView && task.driverId && (
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider flex items-center gap-1">
                <Truck className="h-3 w-3" /> Driver ID
              </span>
              <span className="text-xs font-medium font-mono truncate" title={task.driverId}>
                {task.driverId.substring(0, 8)}...
              </span>
            </div>
          )}
        </div>
      </CardContent>

      {isDriverView && (
        <CardFooter className="p-4 bg-slate-50/80 border-t flex flex-wrap gap-2">
          {task.status === "PENDING" && (
            <>
              <Button 
                variant="default" 
                size="sm" 
                className="flex-1 bg-green-600 hover:bg-green-700 gap-1"
                onClick={() => onAccept?.(task.id)}
              >
                <ShieldCheck className="h-4 w-4" /> Accept Task
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => onReject?.(task.id)}
              >
                Reject Task
              </Button>
            </>
          )}

          {task.status === "ACCEPTED" && (
            <Button 
              variant="default" 
              size="sm" 
              className="w-full bg-blue-600 hover:bg-blue-700 gap-2"
              onClick={() => onUpdateStatus?.(task.id, "IN_TRANSIT")}
            >
              <Truck className="h-4 w-4" /> Mark as In Transit
            </Button>
          )}

          {task.status === "IN_TRANSIT" && (
            <Button 
              variant="default" 
              size="sm" 
              className="w-full bg-status-success-bg text-status-success-fg hover:bg-status-success-bg/90 hover:text-white gap-2 transition-colors"
              onClick={() => onUpdateStatus?.(task.id, "DELIVERED")}
            >
              <Package className="h-4 w-4" /> Confirm Delivery
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
