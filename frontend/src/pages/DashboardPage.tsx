import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { orderService, Order } from "@/services/orderService";
import { paymentService } from "@/services/paymentService";
import type { Payment } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  ShoppingCart, Clock, CreditCard, Package, ShoppingBasket, 
  DollarSign, Zap, ChevronDown, ChevronRight, ChevronLeft, Apple, Milk, Baby, Cookie, 
  Coffee, Home, Search, ArrowRight, Percent
} from "lucide-react";
import { Link } from "react-router-dom";
import { getOrderStatusVariant, formatCurrency, formatDate } from "@/lib/helpers";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const CATEGORIES = [
  { name: "Baby Products", icon: Baby },
  { name: "Dairy", icon: Milk },
  { name: "Beverages", icon: Coffee },
  { name: "Food Cupboard", icon: Cookie },
  { name: "Household", icon: Home },
  { name: "Tea & Coffee", icon: Coffee },
];

const CIRCLE_CATEGORIES = [
  { name: "Vegetables", image: "https://images.unsplash.com/photo-1566385101042-1a0aa0c12e8c?w=200&h=200&fit=crop" },
  { name: "Fruits", image: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=200&h=200&fit=crop" },
  { name: "Baby Products", image: "https://images.unsplash.com/photo-1622295023583-61c1bc9aa8ad?w=200&h=200&fit=crop" },
  { name: "Dairy", image: "https://images.unsplash.com/photo-1550583724-125581fe2f8a?w=200&h=200&fit=crop" },
  { name: "Beverages", image: "https://images.unsplash.com/photo-1625772290748-39126ddd6940?w=200&h=200&fit=crop" },
  { name: "Food Cupboard", image: "https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=200&h=200&fit=crop" },
  { name: "Household", image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=200&h=200&fit=crop" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.roles.includes("ROLE_ADMIN");

  useEffect(() => {
    if (!user?.id) return;

    const fetchDashboardData = async () => {
      try {
        let orderData = [];
        let paymentsData = [];

        if (isAdmin) {
          orderData = await orderService.getAllOrders();
          paymentsData = await paymentService.getAll();
        } else {
          orderData = await orderService.getOrdersByCustomer(user.id);
          paymentsData = await paymentService.getByCustomer(user.id);
        }

        setOrders(orderData || []);
        setPayments(paymentsData || []);
      } catch (e) {
        setOrders([]);
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "PENDING").length;
  const completedPayments = payments.filter((p) => p.status === "COMPLETED").length;
  const recentOrders = orders.slice(0, 5);

  const stats = [
    { label: "Total Shop", value: totalOrders, icon: ShoppingBasket, color: "text-primary" },
    { label: "Pending Delivery", value: pendingOrders, icon: Clock, color: "text-status-pending-fg" },
    { label: "Saved Today", value: formatCurrency(25.50), icon: DollarSign, color: "text-emerald-600" }, // Simulated savings
    { label: "Reward Points", value: "450", icon: Zap, iconColor: "text-orange-500", color: "text-orange-500" },
  ];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      {/* Category Navigation Bar */}
      <div className="bg-white border-b border-border -mx-4 md:-mx-8 lg:px-8 px-4 py-2 flex items-center justify-between sticky top-0 z-40 bg-white/95 backdrop-blur">
        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
          <Button className="bg-[#FFCC00] hover:bg-[#E6B800] text-black font-bold h-10 px-4 shrink-0 rounded-none md:rounded-sm">
            Shop By Category <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
          <div className="flex items-center gap-6">
            {CATEGORIES.map(cat => (
              <Link key={cat.name} to="/orders/create" className="text-sm font-medium text-slate-600 hover:text-primary whitespace-nowrap transition-colors">
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 text-sm text-slate-500 whitespace-nowrap">
          <span className="font-medium text-slate-800">Delivery Today</span>
          <span className="bg-slate-100 px-2 py-0.5 rounded text-xs tabular-nums">04:00PM-09:00PM</span>
        </div>
      </div>

      {/* Main Hero Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative h-[300px] md:h-[400px] rounded-2xl overflow-hidden bg-gradient-to-r from-emerald-600 to-green-500 group"
      >
        <img 
          src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=2070&auto=format&fit=crop" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40 group-hover:scale-105 transition-transform duration-700" 
          alt="Fresh Vegetables"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-8 md:p-12">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest animate-pulse">
              <Percent className="h-3 w-3" /> Save Big
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">
              SAVE ON <br />
              <span className="text-yellow-400">VEGETABLES</span> & FRUITS
            </h2>
            <div className="flex flex-wrap items-center gap-6">
              <Button size="lg" className="bg-white text-emerald-700 hover:bg-yellow-400 hover:text-black font-black text-lg px-8 py-7 h-auto rounded-xl transition-all shadow-xl shadow-black/20">
                SHOP NOW
              </Button>
              <div className="text-white font-bold opacity-90 border-l-2 border-white/30 pl-6">
                <p className="text-sm uppercase tracking-wider">Every Tuesday & Saturday</p>
                <p className="text-xs font-medium text-emerald-100">Apply promo code at checkout</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Sub-promotional Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "SNACK MANIA", subtitle: "FLAT 30% OFF!", desc: "For Maliban Savoury Biscuits", color: "from-orange-500 to-amber-500" },
          { title: "Safe-on-skin", subtitle: "Protection you know", desc: "Get up to 40% OFF", color: "from-sky-500 to-blue-600" },
          { title: "KIST MAYO/SAUCE", subtitle: "TRUSTED TASTE", desc: "Perfect with everything", color: "from-red-500 to-rose-600" },
          { title: "THE FRESHNESS", subtitle: "THAT KEEPS UP WITH YOU", desc: "Shop Now", color: "from-indigo-600 to-violet-700" },
        ].map((promo, idx) => (
          <motion.div
            key={promo.title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 * idx }}
            className={cn("relative h-48 rounded-2xl overflow-hidden bg-gradient-to-br p-6 flex flex-col justify-between text-white shadow-lg", promo.color)}
          >
            <div className="relative z-10">
              <h4 className="font-black text-lg leading-tight uppercase">{promo.title}</h4>
              <p className="text-3xl font-black text-white/90 leading-tight mt-1">{promo.subtitle}</p>
            </div>
            <div className="relative z-10 flex justify-between items-end">
              <p className="text-xs font-bold text-white/80 max-w-[120px]">{promo.desc}</p>
              <div className="p-2 rounded-full bg-white/20 backdrop-blur">
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
            {/* Abstract shapes for vibe */}
            <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/10 blur-2xl" />
          </motion.div>
        ))}
      </div>

      {/* Shop by Category Circular Section */}
      <div className="bg-white rounded-3xl p-8 border border-border shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black text-slate-800">Shop by Category</h2>
          <Link to="/orders/create" className="text-primary font-bold hover:underline flex items-center gap-1">
            View more <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2">
          {CIRCLE_CATEGORIES.map((cat, i) => (
            <motion.div 
              key={cat.name}
              whileHover={{ y: -5 }}
              className="flex flex-col items-center gap-4 min-w-[120px]"
            >
              <div className="w-24 h-24 rounded-full border-2 border-slate-100 overflow-hidden bg-white shadow-sm hover:border-primary/50 p-1 transition-colors">
                <img src={cat.image} className="w-full h-full object-cover rounded-full" alt={cat.name} />
              </div>
              <span className="text-sm font-bold text-slate-700 text-center">{cat.name}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Legacy Recent Orders Section (Optional, kept minimized) */}
      <div className="mt-12 opacity-60 hover:opacity-100 transition-opacity">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-700">Recent Purchase History</h2>
          <Link to="/orders" className="text-sm font-medium text-primary hover:underline">View All</Link>
        </div>
        {recentOrders.length > 0 && (
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <Table>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-slate-50 border-b-slate-100">
                    <TableCell className="font-bold py-4">#{order.id}</TableCell>
                    <TableCell>{order.serviceType === 'STANDARD' ? 'Standard Pack' : 'Custom Basket'}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(order.totalPrice)}</TableCell>
                    <TableCell><Badge variant={getOrderStatusVariant(order.status)} className="text-[9px]">{order.status}</Badge></TableCell>
                    <TableCell className="text-right text-muted-foreground text-xs">{formatDate(order.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}

// Add custom styles for the e-commerce components
const style = document.createElement('style');
style.innerHTML = `
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;
document.head.appendChild(style);
