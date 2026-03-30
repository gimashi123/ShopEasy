import api from "@/lib/api";
import type { ApiResponse, Driver, DeliveryTask } from "@/types";

const unwrap = <T>(res: { data: ApiResponse<T> }): T => res.data.data;

export const deliveryService = {
  // --- Drivers ---
  getDrivers: async (): Promise<Driver[]> => {
    const res = await api.get<ApiResponse<Driver[]>>("/delivery/drivers");
    return unwrap(res);
  },
  getAvailableDrivers: async (): Promise<Driver[]> => {
    const res = await api.get<ApiResponse<Driver[]>>("/delivery/drivers/available");
    return unwrap(res);
  },
  getDriverById: async (id: string): Promise<Driver> => {
    const res = await api.get<ApiResponse<Driver>>(`/delivery/drivers/${id}`);
    return unwrap(res);
  },
  createDriver: async (data: Omit<Driver, "id" | "available" | "createdAt" | "updatedAt">): Promise<Driver> => {
    const res = await api.post<ApiResponse<Driver>>("/delivery/drivers", data);
    return unwrap(res);
  },
  updateDriver: async (id: string, data: Partial<Driver>): Promise<Driver> => {
    const res = await api.put<ApiResponse<Driver>>(`/delivery/drivers/${id}`, data);
    return unwrap(res);
  },
  deleteDriver: async (id: string): Promise<null> => {
    const res = await api.delete<ApiResponse<null>>(`/delivery/drivers/${id}`);
    return unwrap(res);
  },

  // --- Tasks ---
  getTasks: async (): Promise<DeliveryTask[]> => {
    const res = await api.get<ApiResponse<DeliveryTask[]>>("/delivery/tasks");
    return unwrap(res);
  },
  getPendingTasks: async (): Promise<DeliveryTask[]> => {
    const res = await api.get<ApiResponse<DeliveryTask[]>>("/delivery/tasks/pending");
    return unwrap(res);
  },
  getTaskById: async (id: string): Promise<DeliveryTask> => {
    const res = await api.get<ApiResponse<DeliveryTask>>(`/delivery/tasks/${id}`);
    return unwrap(res);
  },
  createTask: async (data: { orderId: string; deliveryAddress: string }): Promise<DeliveryTask> => {
    const res = await api.post<ApiResponse<DeliveryTask>>("/delivery/tasks", data);
    return unwrap(res);
  },
  acceptTask: async (taskId: string, driverId: string): Promise<DeliveryTask> => {
    const res = await api.post<ApiResponse<DeliveryTask>>(`/delivery/tasks/${taskId}/accept/${driverId}`);
    return unwrap(res);
  },
  rejectTask: async (taskId: string, driverId: string): Promise<DeliveryTask> => {
    const res = await api.post<ApiResponse<DeliveryTask>>(`/delivery/tasks/${taskId}/reject/${driverId}`);
    return unwrap(res);
  },
  updateTaskStatus: async (taskId: string, status: DeliveryTask["status"]): Promise<DeliveryTask> => {
    const res = await api.patch<ApiResponse<DeliveryTask>>(`/delivery/tasks/${taskId}/status`, { status });
    return unwrap(res);
  },
  deleteTask: async (id: string): Promise<null> => {
    const res = await api.delete<ApiResponse<null>>(`/delivery/tasks/${id}`);
    return unwrap(res);
  },
};
