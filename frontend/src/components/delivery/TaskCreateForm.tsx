import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const taskSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  deliveryAddress: z.string().min(5, "A valid delivery address is required"),
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface TaskCreateFormProps {
  onSubmit: (data: { orderId: string; deliveryAddress: string }) => void;
  onCancel: () => void;
}

export function TaskCreateForm({ onSubmit, onCancel }: TaskCreateFormProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      orderId: "",
      deliveryAddress: "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="orderId">Order ID #</Label>
        <Input 
          id="orderId" 
          type="number"
          {...register("orderId")} 
          placeholder="e.g. 1045" 
        />
        {errors.orderId && <p className="text-xs text-red-500">{errors.orderId.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="deliveryAddress">Delivery Address</Label>
        <Input 
          id="deliveryAddress" 
          {...register("deliveryAddress")} 
          placeholder="123 Main St, Springfield" 
        />
        {errors.deliveryAddress && <p className="text-xs text-red-500">{errors.deliveryAddress.message}</p>}
      </div>

      <div className="pt-4 flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Task"}
        </Button>
      </div>
    </form>
  );
}
