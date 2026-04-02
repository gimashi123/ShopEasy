import api from "../lib/api";
import { ApiResponse } from "../types";

export interface Promotion {
  id: string;
  name: string;
  description: string;
  productId: string;
  productName: string;
  supermarketName: string;
  imageUrl: string;
  originalPrice: number;
  discountPercent: number;
  active: boolean;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const promotionService = {
  getAllPromotions: async () => {
    const response = await api.get<ApiResponse<Promotion[]>>("/promotions");
    return response.data.data;
  },

  getActivePromotions: async () => {
    const response = await api.get<ApiResponse<Promotion[]>>("/promotions/active");
    return response.data.data;
  },

  getPromotionById: async (id: string) => {
    const response = await api.get<ApiResponse<Promotion>>(`/promotions/${id}`);
    return response.data.data;
  },

  getPromotionsByProduct: async (productId: string) => {
    const response = await api.get<ApiResponse<Promotion[]>>(`/promotions/product/${productId}`);
    return response.data.data;
  },

  createPromotion: async (request: any) => {
    const response = await api.post<ApiResponse<Promotion>>("/promotions", request);
    return response.data.data;
  },

  updatePromotion: async (id: string, request: any) => {
    const response = await api.put<ApiResponse<Promotion>>(`/promotions/${id}`, request);
    return response.data.data;
  },

  deletePromotion: async (id: string) => {
    const response = await api.delete<ApiResponse<void>>(`/promotions/${id}`);
    return response.data.data;
  }
};
