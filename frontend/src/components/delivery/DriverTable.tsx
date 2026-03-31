import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, Trash2, Truck, CheckCircle2, XCircle } from "lucide-react";
import type { Driver } from "@/types";

interface DriverTableProps {
  drivers: Driver[];
  onEdit: (driver: Driver) => void;
  onDelete: (id: string) => void;
}

export function DriverTable({ drivers, onEdit, onDelete }: DriverTableProps) {
  if (drivers.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center h-64 text-center">
          <Truck className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold">No drivers found</h3>
          <p className="text-muted-foreground mt-1 max-w-sm">
            Your fleet is currently empty. Add a new driver to start assigning delivery tasks.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead>Driver Name</TableHead>
            <TableHead>Contact Info</TableHead>
            <TableHead>Vehicle Details</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {drivers.map((driver) => (
            <TableRow key={driver.id} className="hover:bg-slate-50/50">
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {driver.name.charAt(0).toUpperCase()}
                  </div>
                  {driver.name}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col text-sm">
                  <span>{driver.phone}</span>
                  <span className="text-muted-foreground text-xs">{driver.email}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col text-sm">
                  <span className="capitalize">{driver.vehicleType.replace('_', ' ').toLowerCase()}</span>
                  <span className="text-muted-foreground text-xs font-mono">{driver.vehicleNumber}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge 
                  variant={driver.available ? "success" : "secondary"}
                  className="gap-1 px-2 py-0.5"
                >
                  {driver.available ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                  {driver.available ? "Available" : "On Task"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onEdit(driver)}
                    className="h-8 w-8 text-slate-500 hover:text-blue-600"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onDelete(driver.id)}
                    className="h-8 w-8 text-slate-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
