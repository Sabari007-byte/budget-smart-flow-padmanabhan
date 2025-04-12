
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Award, Lock, Unlock, BadgePercent } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WalletData {
  balance: number;
  usableAmount: number;
  buffer: number;
  categories: {
    [key: string]: {
      limit: number;
      spent: number;
    };
  };
  transactions: any[];
  savings: number;
  budgetLocked?: boolean;
  rewards?: number;
}

export default function StatsPage() {
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [budgetLocked, setBudgetLocked] = useState(false);
  const [rewardsPoints, setRewardsPoints] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    // Load wallet data
    const walletStr = localStorage.getItem('wallet');
    if (walletStr) {
      const wallet = JSON.parse(walletStr) as WalletData;
      setWalletData(wallet);
      
      // Set budget lock status
      setBudgetLocked(wallet.budgetLocked || false);
      
      // Set rewards points
      setRewardsPoints(wallet.rewards || 0);
    }
  }, []);

  const toggleBudgetLock = () => {
    if (!walletData) return;
    
    const newLockedStatus = !budgetLocked;
    setBudgetLocked(newLockedStatus);
    
    // Update wallet data in localStorage
    const updatedWallet = {
      ...walletData,
      budgetLocked: newLockedStatus
    };
    
    localStorage.setItem('wallet', JSON.stringify(updatedWallet));
    
    // Show toast notification
    toast({
      title: newLockedStatus ? "Budget Locked" : "Budget Unlocked",
      description: newLockedStatus 
        ? "Your budget is now locked. No new transactions allowed." 
        : "Your budget is now unlocked. You can add transactions.",
    });
  };

  // Prepare chart data from categories
  const getCategoryData = () => {
    if (!walletData) return [];
    
    return Object.entries(walletData.categories).map(([category, data]) => ({
      name: category,
      spent: data.spent,
      limit: data.limit
    }));
  };

  // Calculate total spending percentage
  const getTotalSpendingPercentage = () => {
    if (!walletData) return 0;
    
    const totalSpent = Object.values(walletData.categories).reduce(
      (sum, cat) => sum + cat.spent, 0
    );
    
    return Math.min(100, (totalSpent / walletData.usableAmount) * 100);
  };

  if (!walletData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p>Loading statistics...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Statistics</h1>
            <p className="text-muted-foreground">
              Track your spending patterns and budget performance
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch 
                checked={budgetLocked} 
                onCheckedChange={toggleBudgetLock}
                aria-label="Toggle budget lock"
              />
              <span className="font-medium text-sm flex items-center">
                {budgetLocked ? <Lock className="h-4 w-4 mr-1" /> : <Unlock className="h-4 w-4 mr-1" />}
                {budgetLocked ? "Budget Locked" : "Budget Unlocked"}
              </span>
            </div>
          </div>
        </div>

        {/* Rewards Card */}
        <Card className="bg-gradient-to-r from-violet-50 to-amber-50 border-amber-200">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-medium">Rewards Program</CardTitle>
              <Award className="h-5 w-5 text-amber-500" />
            </div>
            <CardDescription>Earn points by staying under budget</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BadgePercent className="h-5 w-5 text-amber-500" />
                <span className="text-2xl font-bold">{rewardsPoints}</span>
                <span className="text-sm text-muted-foreground">points earned</span>
              </div>
              <Button variant="outline" size="sm">Redeem Rewards</Button>
            </div>
            
            <div className="mt-4">
              <div className="grid grid-cols-3 gap-2">
                <Badge variant="outline" className="justify-center py-1.5">
                  <span className="font-semibold">50</span>
                  <span className="text-xs text-muted-foreground ml-1">5% Off</span>
                </Badge>
                <Badge variant="outline" className="justify-center py-1.5">
                  <span className="font-semibold">100</span>
                  <span className="text-xs text-muted-foreground ml-1">10% Off</span>
                </Badge>
                <Badge variant="outline" className="justify-center py-1.5">
                  <span className="font-semibold">200</span>
                  <span className="text-xs text-muted-foreground ml-1">20% Off</span>
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Budget Overview Card */}
        <Card>
          <CardHeader>
            <CardTitle>Budget Overview</CardTitle>
            <CardDescription>Track your spending against budget limits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium">Total Spending</span>
                  <span>
                    {getTotalSpendingPercentage().toFixed(0)}% Used
                  </span>
                </div>
                <Progress value={getTotalSpendingPercentage()} className="h-2" />
              </div>
              
              <div className="pt-4">
                <h4 className="text-sm font-medium mb-3">Category Breakdown</h4>
                <div className="h-64">
                  <ChartContainer config={{}} className="h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getCategoryData()} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="spent" fill="#8884d8" name="Spent" />
                        <Bar dataKey="limit" fill="#82ca9d" name="Limit" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Budget Status Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Daily Budget</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">₹{walletData.usableAmount.toFixed(2)}</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Savings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">₹{walletData.savings.toFixed(2)}</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Safety Buffer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">₹{walletData.buffer.toFixed(2)}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <ChartTooltipContent>
        <div className="text-xs font-medium">{payload[0].payload.name}</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <span>Spent: ₹{payload[0].value.toFixed(2)}</span>
          <span>Limit: ₹{payload[1].value.toFixed(2)}</span>
        </div>
      </ChartTooltipContent>
    );
  }

  return null;
};
