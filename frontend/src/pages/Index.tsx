import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { 
  ShoppingBasket, 
  Truck, 
  ShieldCheck, 
  Zap, 
  ArrowRight,
  Leaf,
  Apple,
  Milk,
  Cookie
} from "lucide-react";
import { motion } from "framer-motion";

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBasket className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold tracking-tight">ShopEasy</span>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <Link to="/dashboard">
                <Button variant="outline" className="gap-2">
                  Go to Dashboard <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link to="/register">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Leaf className="h-4 w-4" />
                <span>Freshness Guaranteed</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6 leading-tight">
                Your Daily Essentials, <span className="text-primary italic">Delivered Fast.</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl">
                Experience the easiest way to shop for premium groceries. From farm-fresh produce to pantry staples, get everything you need delivered to your doorstep in minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to={user ? "/dashboard" : "/register"}>
                  <Button size="lg" className="h-14 px-8 text-lg gap-2">
                    {user ? "Go to Dashboard" : "Start Shopping"} <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link to={user ? "/orders" : "/login"}>
                  <Button size="lg" variant="outline" className="h-14 px-8 text-lg">
                    {user ? "My Orders" : "View Catalog"}
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -z-10 w-1/3 h-full bg-gradient-to-l from-primary/5 to-transparent blur-3xl opacity-50" />
      </section>

      {/* Categories */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Shop by Category</h2>
          <p className="text-muted-foreground mb-12 max-w-lg mx-auto">Explore our wide range of premium products selected just for you.</p>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Fresh Produce", icon: Apple, color: "bg-green-500/10 text-green-600" },
              { name: "Dairy & Eggs", icon: Milk, color: "bg-blue-500/10 text-blue-600" },
              { name: "Pantry Staples", icon: Cookie, color: "bg-orange-500/10 text-orange-600" },
              { name: "Household", icon: ShoppingBasket, color: "bg-purple-500/10 text-purple-600" },
            ].map((cat, i) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className="group p-8 rounded-3xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5"
              >
                <div className={`w-16 h-16 rounded-2xl ${cat.color} flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform`}>
                  <cat.icon className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold">{cat.name}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Lightning Fast Delivery</h3>
              <p className="text-muted-foreground">Get your order delivered in as little as 30 minutes. We value your time as much as you do.</p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Highest Quality Standards</h3>
              <p className="text-muted-foreground">Each item is hand-picked and checked for quality before it reaches your door.</p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Best Deals & Savings</h3>
              <p className="text-muted-foreground">Enjoy exclusive promotions and discounts everyday on your favorite grocery brands.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border py-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 text-foreground font-semibold">
            <ShoppingBasket className="h-5 w-5 text-primary" />
            <span>ShopEasy</span>
          </div>
          <p>© 2026 ShopEasy Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Help</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
