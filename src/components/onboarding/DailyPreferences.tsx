
import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Coffee, UtensilsCrossed, Car, CircleDollarSign } from "lucide-react";

export default function DailyPreferences() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dailySpend, setDailySpend] = useState<string>('');
  const [tiffin, setTiffin] = useState<string>('');
  const [lunch, setLunch] = useState<string>('');
  const [dinner, setDinner] = useState<string>('');
  const [transport, setTransport] = useState<string>('');
  
  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Save daily habits
      localStorage.setItem('dailyHabits', JSON.stringify({
        dailySpend: parseFloat(dailySpend),
        categories: {
          tiffin: parseFloat(tiffin),
          lunch: parseFloat(lunch),
          dinner: parseFloat(dinner),
          transport: parseFloat(transport),
          other: parseFloat(dailySpend) - parseFloat(tiffin) - parseFloat(lunch) - parseFloat(dinner) - parseFloat(transport)
        }
      }));
      
      // Update finance object
      const financesStr = localStorage.getItem('userFinances');
      if (financesStr) {
        const finances = JSON.parse(financesStr);
        localStorage.setItem('userFinances', JSON.stringify({
          ...finances,
          dailyHabitsSet: true,
          dailyBudget: parseFloat(dailySpend)
        }));
      }
      
      // Initialize wallet and spending
      const walletData = {
        balance: parseFloat(dailySpend),
        usableAmount: parseFloat(dailySpend) * 0.8, // 80% rule
        buffer: parseFloat(dailySpend) * 0.2, // 20% buffer
        transactions: [],
        savings: 0,
        categories: {
          tiffin: { limit: parseFloat(tiffin), spent: 0 },
          lunch: { limit: parseFloat(lunch), spent: 0 },
          dinner: { limit: parseFloat(dinner), spent: 0 },
          transport: { limit: parseFloat(transport), spent: 0 },
          other: { 
            limit: parseFloat(dailySpend) - parseFloat(tiffin) - parseFloat(lunch) - parseFloat(dinner) - parseFloat(transport), 
            spent: 0 
          }
        }
      };
      
      localStorage.setItem('wallet', JSON.stringify(walletData));
      
      toast({
        title: "Preferences saved!",
        description: "Your daily spending habits have been recorded.",
      });
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to save preferences",
        description: "Please check your information and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Daily Spending Habits</CardTitle>
          <CardDescription>
            Please enter your usual daily spending amounts to help us set up your budget categories
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSavePreferences}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dailySpend" className="flex items-center gap-2">
                <CircleDollarSign className="h-5 w-5" />
                Total Daily Spending
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <Input 
                  id="dailySpend" 
                  type="number"
                  className="pl-7" 
                  placeholder="50" 
                  required
                  value={dailySpend}
                  onChange={(e) => setDailySpend(e.target.value)}
                />
              </div>
            </div>
            
            <div className="pt-4">
              <h3 className="text-lg font-medium mb-4">How much do you usually spend on:</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="tiffin" className="flex items-center gap-2">
                    <Coffee className="h-5 w-5" />
                    Tiffin/Breakfast
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <Input 
                      id="tiffin" 
                      type="number"
                      className="pl-7" 
                      placeholder="10" 
                      required
                      value={tiffin}
                      onChange={(e) => setTiffin(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lunch" className="flex items-center gap-2">
                    <UtensilsCrossed className="h-5 w-5" />
                    Lunch
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <Input 
                      id="lunch" 
                      type="number"
                      className="pl-7" 
                      placeholder="15" 
                      required
                      value={lunch}
                      onChange={(e) => setLunch(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dinner" className="flex items-center gap-2">
                    <UtensilsCrossed className="h-5 w-5" />
                    Dinner
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <Input 
                      id="dinner" 
                      type="number"
                      className="pl-7" 
                      placeholder="15" 
                      required
                      value={dinner}
                      onChange={(e) => setDinner(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="transport" className="flex items-center gap-2">
                    <Car className="h-5 w-5" />
                    Transport
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <Input 
                      id="transport" 
                      type="number"
                      className="pl-7" 
                      placeholder="10" 
                      required
                      value={transport}
                      onChange={(e) => setTransport(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Saving..." : "Continue to Wallet Setup"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
