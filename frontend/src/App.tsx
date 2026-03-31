import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import DashboardPage from "@/pages/DashboardPage";
import OrdersPage from "@/pages/OrdersPage";
import OrderDetailPage from "@/pages/OrderDetailPage";
import CreateOrderPage from "@/pages/CreateOrderPage";
import UpdateOrderPage from "@/pages/UpdateOrderPage";
import PaymentsPage from "@/pages/PaymentsPage";
import MakePaymentPage from "@/pages/MakePaymentPage";
import PaymentDetailPage from "@/pages/PaymentDetailPage";
import CustomerProfilePage from "@/pages/CustomerProfilePage";
import AdminSettingsPage from "@/pages/AdminSettingsPage";
import AdminPromotionsPage from "@/pages/AdminPromotionsPage";
import AdminProductsPage from "@/pages/AdminProductsPage";
import AdminProductDetailPage from "@/pages/AdminProductDetailPage";
import NotFound from "@/pages/NotFound";
import AddressesPage from "@/pages/AddressesPage.tsx";
import LoyaltyPage from "@/pages/LoyaltyPage.tsx";
import PreferencesPage from "@/pages/PreferencesPage.tsx";
import Index from "@/pages/Index";
import OffersPage from "@/pages/OffersPage";
import SupermarketsPage from "@/pages/SupermarketsPage";
import SupermarketDetailPage from "@/pages/SupermarketDetailPage";
import ProductsPage from "@/pages/ProductsPage";
import ProductDetailPage from "@/pages/ProductDetailPage";
import AdminDriversPage from "@/pages/AdminDriversPage";
import AdminTasksPage from "@/pages/AdminTasksPage";
import DriverDashboardPage from "@/pages/DriverDashboardPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="bottom-right" />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/orders/create" element={<CreateOrderPage />} />
              <Route path="/orders/:id/edit" element={<UpdateOrderPage />} />
              <Route path="/orders/:id" element={<OrderDetailPage />} />
              <Route path="/profile" element={<CustomerProfilePage />} />
              <Route path="/addresses" element={<AddressesPage />} />
              <Route path="/offers" element={<OffersPage />} />
              <Route path="/loyalty" element={<LoyaltyPage />} />
              <Route path="/preferences" element={<PreferencesPage />} />
              <Route path="/payments" element={<PaymentsPage />} />
              <Route path="/payments/create" element={<MakePaymentPage />} />
              <Route path="/payments/:id" element={<PaymentDetailPage />} />
              <Route path="/admin/settings" element={<AdminSettingsPage />} />
              <Route path="/admin/promotions" element={<AdminPromotionsPage />} />
              <Route path="/admin/products" element={<AdminProductsPage />} />
              <Route path="/admin/products/:id" element={<AdminProductDetailPage />} />
              <Route path="/supermarkets" element={<SupermarketsPage />} />
              <Route path="/supermarkets/:id" element={<SupermarketDetailPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/admin/drivers" element={<AdminDriversPage />} />
              <Route path="/admin/tasks" element={<AdminTasksPage />} />
              <Route path="/supermarkets" element={<SupermarketsPage />} />
              <Route path="/supermarkets/:id" element={<SupermarketDetailPage />} />
              <Route path="/driver/dashboard" element={<DriverDashboardPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
