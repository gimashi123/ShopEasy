import api from "@/lib/api";

export interface SupermarketLocation {
  lat: number;
  lng: number;
}

export interface Supermarket {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  openingHours: string;
  mapLink?: string;
  imageUrl?: string;
  location?: SupermarketLocation;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface SupermarketRequest {
  name: string;
  address: string;
  phone: string;
  email: string;
  openingHours: string;
  mapLink?: string;
  imageUrl?: string;
  location?: SupermarketLocation;
}

const unwrap = (res: any) => res.data?.data ?? res.data;

class SupermarketService {
  async getAll(): Promise<Supermarket[]> {
    const res = await api.get("/supermarkets");
    return unwrap(res);
  }

  async getById(id: string): Promise<Supermarket> {
    const res = await api.get(`/supermarkets/${id}`);
    return unwrap(res);
  }

  async create(data: SupermarketRequest): Promise<Supermarket> {
    const res = await api.post("/supermarkets", data);
    return unwrap(res);
  }

  async update(id: string, data: SupermarketRequest): Promise<Supermarket> {
    const res = await api.put(`/supermarkets/${id}`, data);
    return unwrap(res);
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/supermarkets/${id}`);
  }
}

export const supermarketService = new SupermarketService();
