

// import api from "@/lib/api";
//
// export interface Review {
//     id: string;
//     userId: string;
//     productId: string;
//     rating: number;
//     comment: string;
//     createdAt: string;
//     updatedAt: string;
// }
//
// export type NewReviewParams = {
//     productId: string;
//     rating: number;
//     comment: string;
//     userId?: string;
// };
//
// export const reviewService = {
//
//     async getByProductId(productId: string): Promise<Review[]> {
//         console.log("📥 [GET REVIEWS] Product ID:", productId);
//
//         try {
//             const res = await api.get<Review[]>(`/reviews/product/${productId}`);
//
//             console.log("✅ [GET REVIEWS SUCCESS]:", res.data);
//
//             return res.data;
//
//         } catch (error: any) {
//             console.error("❌ [GET REVIEWS ERROR]:", error.response?.data || error.message);
//             throw error;
//         }
//     },
//
//     async addReview(review: NewReviewParams): Promise<Review> {
//
//         const token = localStorage.getItem("token");
//
//         console.log("📤 [ADD REVIEW REQUEST]:", review);
//         console.log("🔑 Token exists:", !!token);
//         console.log("🔑 Token value:", token);
//
//         try {
//             const res = await api.post<Review>(`/reviews`, review);
//
//             console.log("✅ [ADD REVIEW SUCCESS]:", res.data);
//
//             return res.data;
//
//         } catch (error: any) {
//
//             console.error("❌ [ADD REVIEW ERROR]:", error);
//
//             if (error.response) {
//                 console.error("📛 Status:", error.response.status);
//                 console.error("📛 Data:", error.response.data);
//             }
//
//             throw error;
//         }
//     },
//
//     async updateReview(id: string, review: Partial<NewReviewParams>): Promise<Review> {
//
//         console.log("📤 [UPDATE REVIEW]:", id, review);
//
//         try {
//             const res = await api.put<Review>(`/reviews/${id}`, review);
//
//             console.log("✅ [UPDATE SUCCESS]:", res.data);
//
//             return res.data;
//
//         } catch (error: any) {
//             console.error("❌ [UPDATE ERROR]:", error.response?.data || error.message);
//             throw error;
//         }
//     },
//
//     async deleteReview(id: string): Promise<void> {
//
//         console.log("🗑️ [DELETE REVIEW]:", id);
//
//         try {
//             await api.delete(`/reviews/${id}`);
//
//             console.log("✅ [DELETE SUCCESS]");
//
//         } catch (error: any) {
//             console.error("❌ [DELETE ERROR]:", error.response?.data || error.message);
//             throw error;
//         }
//     },
//
//     async getMyReviews(): Promise<Review[]> {
//
//         console.log("📥 [GET MY REVIEWS]");
//
//         try {
//             const res = await api.get<Review[]>(`/reviews/my`);
//
//             console.log("✅ [MY REVIEWS SUCCESS]:", res.data);
//
//             return res.data;
//
//         } catch (error: any) {
//             console.error("❌ [MY REVIEWS ERROR]:", error.response?.data || error.message);
//             throw error;
//         }
//     }
// };
import api from "@/lib/api";

// 1. Define your backend wrapper type
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    timestamp: string;
}

export interface Review {
    id: string;
    userId: string;
    productId: string;
    rating: number;
    comment: string;
    createdAt: string;
    updatedAt: string;
}

export type NewReviewParams = {
    productId: string;
    rating: number;
    comment: string;
    userId?: string;
};

export const reviewService = {
    async getByProductId(productId: string): Promise<Review[]> {
        console.log("📥 [GET REVIEWS] Product ID:", productId);
        try {
            // Unwrapping the backend ApiResponse format
            const res = await api.get<ApiResponse<Review[]>>(`/reviews/product/${productId}`);
            console.log("✅ [GET REVIEWS SUCCESS]:", res.data.message);
            return res.data.data || [];
        } catch (error: any) {
            console.error("❌ [GET REVIEWS ERROR]:", error.response?.data || error.message);
            throw error;
        }
    },

    async addReview(review: NewReviewParams): Promise<Review> {
        console.log("📤 [ADD REVIEW REQUEST]:", review);
        try {
            const res = await api.post<ApiResponse<Review>>(`/reviews`, review);
            console.log("✅ [ADD REVIEW SUCCESS]:", res.data.message);
            return res.data.data;
        } catch (error: any) {
            console.error("❌ [ADD REVIEW ERROR]:", error);
            throw error;
        }
    },

    async updateReview(id: string, review: Partial<NewReviewParams>): Promise<Review> {
        try {
            const res = await api.put<ApiResponse<Review>>(`/reviews/${id}`, review);
            return res.data.data;
        } catch (error: any) {
            console.error("❌ [UPDATE ERROR]:", error.response?.data || error.message);
            throw error;
        }
    },

    async deleteReview(id: string): Promise<void> {
        try {
            await api.delete(`/reviews/${id}`);
            console.log("✅ [DELETE SUCCESS]");
        } catch (error: any) {
            console.error("❌ [DELETE ERROR]:", error.response?.data || error.message);
            throw error;
        }
    },

    async getMyReviews(): Promise<Review[]> {
        try {
            const res = await api.get<ApiResponse<Review[]>>(`/reviews/my`);
            return res.data.data || [];
        } catch (error: any) {
            console.error("❌ [MY REVIEWS ERROR]:", error.response?.data || error.message);
            throw error;
        }
    }
};