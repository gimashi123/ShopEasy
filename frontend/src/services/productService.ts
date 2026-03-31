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

  createWithImage: async (payload: ProductRequest, imageFile: File): Promise<Product> => {
    const formData = buildProductFormData(payload, imageFile);
    const res = await api.post<ApiResponse<Product>>("/product/with-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data;
  },

  update: async (id: string, payload: ProductRequest): Promise<Product> => {
    const res = await api.put<ApiResponse<Product>>(`/product/${id}`, payload);
    return res.data.data;
  },

  updateWithImage: async (id: string, payload: ProductRequest, imageFile: File): Promise<Product> => {
    const formData = buildProductFormData(payload, imageFile);
    const res = await api.put<ApiResponse<Product>>(`/product/${id}/with-image`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/product/${id}`);
  },
};

function buildProductFormData(payload: ProductRequest, imageFile: File): FormData {
  const formData = new FormData();
  formData.append("sku", payload.sku);
  formData.append("name", payload.name);
  formData.append("price", String(payload.price));

  if (payload.description) formData.append("description", payload.description);
  if (payload.category) formData.append("category", payload.category);
  if (payload.brand) formData.append("brand", payload.brand);
  if (payload.imageUrl) formData.append("imageUrl", payload.imageUrl);

  payload.inventories.forEach((inventory, index) => {
    // Spring @ModelAttribute binds list fields using indexed notation.
    formData.append(`inventories[${index}].supermarketId`, inventory.supermarketId);
    formData.append(`inventories[${index}].quantity`, String(inventory.quantity));
  });

  formData.append("imageFile", imageFile);
  return formData;
}
