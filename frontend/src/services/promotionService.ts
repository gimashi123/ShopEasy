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
  }
};
