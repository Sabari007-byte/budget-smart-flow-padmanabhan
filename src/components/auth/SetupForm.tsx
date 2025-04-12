
import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

export default function SetupForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [income, setIncome] = useState<string>('');
  const [budgetAmount, setBudgetAmount] = useState<string>('');
  
  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        navigate('/');
        return;
      }
      
      const user = JSON.parse(userStr);
      
      // Save financial info
      localStorage.setItem('userFinances', JSON.stringify({
        income: parseFloat(income),
        budgetAmount: parseFloat(budgetAmount),
        walletBalance: parseFloat(budgetAmount),
        dailyHabitsSet: false
      }));
      
      // Update user object
      localStorage.setItem('user', JSON.stringify({
        ...user,
        setupComplete: true
      }));
      
      toast({
        title: "Setup complete!",
        description: "Your financial information has been saved.",
      });
      
      // Navigate to welcome page
      navigate('/welcome');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Setup failed",
        description: "Please check your information and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Financial Setup</CardTitle>
          <CardDescription>
            Please enter your financial information to get started
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSetup}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="income">Monthly Income</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <Input 
                  id="income" 
                  type="number"
                  className="pl-7" 
                  placeholder="5000" 
                  required
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="budgetAmount">
                Monthly Budget Amount
                <span className="text-xs text-muted-foreground ml-2">
                  (how much you want to allocate for spending)
                </span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <Input 
                  id="budgetAmount" 
                  type="number"
                  className="pl-7" 
                  placeholder="2000" 
                  required
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Saving..." : "Continue"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
