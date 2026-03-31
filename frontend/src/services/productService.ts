import api from "@/lib/api";
import type { ApiResponse } from "@/types";

export interface ProductInventory {
  supermarketId: string;
  quantity: number;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  category?: string;
  brand?: string;
  imageUrl?: string;
  price: number;
  inventories: ProductInventory[];
  totalQuantity: number;
  available: boolean;
  lowStock?: boolean;
  stockStatus?: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
  createdAt: string;
  updatedAt: string;
}

export interface ProductRequest {
  sku: string;
  name: string;
  description?: string;
  category?: string;
  brand?: string;
  imageUrl?: string;
  price: number;
  inventories: ProductInventory[];
}

export const productService = {
  getAll: async (): Promise<Product[]> => {
    const res = await api.get<ApiResponse<Product[]>>("/product");
    return res.data.data;
  },

  getById: async (id: string): Promise<Product> => {
    const res = await api.get<ApiResponse<Product>>(`/product/${id}`);
    return res.data.data;
  },

  create: async (payload: ProductRequest): Promise<Product> => {
    const res = await api.post<ApiResponse<Product>>("/product", payload);
    return res.data.data;
  },

  update: async (id: string, payload: ProductRequest): Promise<Product> => {
    const res = await api.put<ApiResponse<Product>>(`/product/${id}`, payload);
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/product/${id}`);
  },
};
