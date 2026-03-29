import { useEffect, useState } from "react";
import { promotionService, Promotion } from "@/services/promotionService";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingBasket, Store, Tag, Percent, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function OffersPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const data = await promotionService.getActivePromotions();
        setPromotions(data || []);
      } catch (error) {
        console.error("Failed to fetch offers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, []);

  // Group promotions by supermarketName
  const groupedPromotions = Array.isArray(promotions) ? promotions.reduce((acc, promo) => {
    const supermarket = promo.supermarketName || "General Offers";
    if (!acc[supermarket]) {
      acc[supermarket] = [];
    }
    acc[supermarket].push(promo);
    return acc;
  }, {} as Record<string, Promotion[]>) : {};

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-10 px-4 pt-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-800">Exclusive Offers</h1>
          <p className="text-slate-500 mt-2 text-lg">Deals from your favorite supermarkets, curated for you.</p>
        </div>
        <Badge variant="secondary" className="px-4 py-1.5 text-sm font-bold bg-primary/10 text-primary border-primary/20">
          {promotions.length} Active Deals
        </Badge>
      </div>

      {loading ? (
        <div className="space-y-12">
          {[1, 2].map(i => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-8 w-48 rounded-lg" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(j => <Skeleton key={j} className="h-64 rounded-2xl" />)}
              </div>
            </div>
          ))}
        </div>
      ) : Object.keys(groupedPromotions).length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200">
          <div className="mx-auto h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center mb-6">
            <Tag className="h-10 w-10 text-slate-300" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800">No active offers right now</h3>
          <p className="text-slate-500 mt-2 max-w-md mx-auto">Check back soon for amazing discounts from our partner supermarkets.</p>
          <button className="mt-8 text-primary font-bold hover:underline">View all products</button>
        </div>
      ) : (
        Object.entries(groupedPromotions).map(([supermarket, supermarketPromos]) => (
          <div key={supermarket} className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="p-2.5 rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
                <Store className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{supermarket}</h2>
            </div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {supermarketPromos.map((promo) => (
                <motion.div key={promo.id} variants={itemVariants}>
                  <Card className="group relative overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-500 rounded-3xl bg-white h-full flex flex-col">
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={promo.imageUrl || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80"} 
                        alt={promo.productName || promo.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-rose-500 text-white font-black px-3 py-1.5 rounded-xl text-lg shadow-lg">
                          -{promo.discountPercent}%
                        </Badge>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                        <Link to="/orders/create" className="bg-white text-slate-800 w-full py-2.5 rounded-xl font-bold text-center translate-y-4 group-hover:translate-y-0 transition-transform flex items-center justify-center gap-2">
                          Add to Basket <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                    <CardContent className="p-6 flex-1 flex flex-col">
                      <div className="mb-4 flex-1">
                        <p className="text-xs font-black text-primary uppercase tracking-widest mb-1">{promo.name}</p>
                        <h3 className="text-xl font-black text-slate-800 leading-tight">
                          {promo.productName || "Various Products"}
                        </h3>
                        <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                          {promo.description || `Special discount available at ${promo.supermarketName}. Shop now and save!`}
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-auto">
                        <div className="flex items-center gap-2 text-emerald-600 font-bold">
                          <Percent className="h-4 w-4" />
                          <span>Guaranteed Savings</span>
                        </div>
                        <ShoppingBasket className="h-5 w-5 text-slate-300 group-hover:text-primary transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        ))
      )}
    </div>
  );
}