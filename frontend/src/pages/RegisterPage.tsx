import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/authService";
import { deliveryService } from "@/services/deliveryService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ShoppingBasket, Truck } from "lucide-react";

export default function RegisterPage() {
  const [isDriver, setIsDriver] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Driver specific fields
  const [phone, setPhone] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");

  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !password.trim()) {
      toast.error("Please fill in main details");
      return;
    }

    if (isDriver && (!phone.trim() || !vehicleType.trim() || !vehicleNumber.trim())) {
      toast.error("Please fill in all driver details");
      return;
    }

    setLoading(true);
    try {
      // 1. Create Auth user (either ROLE_USER or ROLE_DRIVER)
      const role = isDriver ? "ROLE_DRIVER" : undefined;
      const res = await authService.register(username, email, password, role);
      
      if (!res.success) {
        toast.error(res.message || "Registration failed");
        setLoading(false);
        return;
      }

      // 2. If Driver, create Delivery Profile
      if (isDriver) {
        try {
          await deliveryService.createDriver({
            name: username,
            email: email,
            phone: phone,
            vehicleType: vehicleType,
            vehicleNumber: vehicleNumber
          });
        } catch (deliveryErr) {
          toast.error("Account created, but failed to create driver profile. Please contact Support.");
          // Still log them in
        }
      }

      // 3. Log in and route
      login(res.data);
      toast.success(res.message || (isDriver ? "Driver registered successfully" : "Registered successfully"));
      if (isDriver) {
        navigate("/driver/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[90vh] items-center justify-center bg-background p-4 py-12">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            {isDriver ? <Truck className="h-6 w-6 text-primary" /> : <ShoppingBasket className="h-6 w-6 text-primary" />}
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            {isDriver ? "Driver Registration" : "Create Account"}
          </CardTitle>
          <CardDescription>
            {isDriver ? "Join our fleet and start delivering orders" : "Start managing your grocery orders"}
          </CardDescription>
          
          <div className="pt-2">
            <Button
              variant="outline"
              type="button"
              className="w-full text-xs font-semibold"
              onClick={() => setIsDriver(!isDriver)}
            >
              {isDriver ? "Actually, I want a standard customer account" : "Want to join as a Delivery Driver?"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Full Name / Username</Label>
                <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Choose a secure password" />
            </div>

            {isDriver && (
              <div className="p-4 bg-muted/30 rounded-lg space-y-4 border border-dashed border-slate-300 mt-6 relative">
                <span className="absolute -top-3 left-4 bg-background px-2 text-xs font-semibold text-muted-foreground uppercase">Driver Details</span>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 234 567 8900" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vehicleType">Vehicle Type</Label>
                    <Select value={vehicleType} onValueChange={setVehicleType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select vehicle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BICYCLE">Bicycle</SelectItem>
                        <SelectItem value="MOTORCYCLE">Motorcycle</SelectItem>
                        <SelectItem value="CAR">Car</SelectItem>
                        <SelectItem value="VAN">Van</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vehicleNumber">Vehicle Number</Label>
                    <Input id="vehicleNumber" value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)} placeholder="ABC-1234" />
                  </div>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full mt-6" disabled={loading}>
              {loading ? "Processing..." : (isDriver ? "Register as Driver" : "Create Account")}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
