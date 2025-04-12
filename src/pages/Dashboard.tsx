
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Wallet, ArrowDownIcon, ArrowUpIcon, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface Category {
  limit: number;
  spent: number;
}

interface WalletData {
  balance: number;
  usableAmount: number;
  buffer: number;
  categories: {
    [key: string]: Category;
  };
  transactions: any[];
  savings: number;
  budgetLocked?: boolean;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [userName, setUserName] = useState<string>('User');
  const [totalSpentToday, setTotalSpentToday] = useState<number>(0);
  const [bufferUsed, setBufferUsed] = useState<number>(0);
  const [isBudgetLocked, setIsBudgetLocked] = useState<boolean>(false);

  useEffect(() => {
    // Load user data
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserName(user.name || 'User');
    }
    
    // Load wallet data
    const walletStr = localStorage.getItem('wallet');
    if (walletStr) {
      const wallet = JSON.parse(walletStr) as WalletData;
      setWalletData(wallet);
      
      // Set budget lock status
      setIsBudgetLocked(wallet.budgetLocked || false);
      
      // Calculate total spent today
      const totalSpent = Object.values(wallet.categories).reduce(
        (sum: number, category: any) => sum + category.spent, 
        0
      );
      setTotalSpentToday(totalSpent);
      
      // Calculate buffer usage
      const totalBuffer = wallet.buffer;
      const usedBuffer = wallet.usableAmount * 0.8 < totalSpent 
        ? totalSpent - (wallet.usableAmount * 0.8) 
        : 0;
      
      setBufferUsed(usedBuffer);
    }
  }, []);

  const getBudgetProgressColor = (spent: number, limit: number) => {
    const percentage = (spent / limit) * 100;
    if (percentage < 50) return "bg-green-500";
    if (percentage < 80) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getSpendingPercentage = () => {
    if (!walletData) return 0;
    return Math.min(100, (totalSpentToday / walletData.usableAmount) * 100);
  };

  const getBufferPercentage = () => {
    if (!walletData) return 0;
    return Math.min(100, (bufferUsed / walletData.buffer) * 100);
  };

  if (!walletData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p>Loading dashboard data...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hello, {userName}!</h1>
          <p className="text-muted-foreground">
            Here's an overview of your daily budget and spending.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {/* Daily Budget Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Daily Budget</CardTitle>
              <CardDescription>Available for today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Wallet className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-2xl font-bold">
                    ₹{walletData.usableAmount.toFixed(2)}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => navigate('/wallet')}
                >
                  View Wallet
                </Button>
              </div>
              
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Today's Spending</span>
                  <span className="font-medium">
                    ₹{totalSpentToday.toFixed(2)} / ₹{walletData.usableAmount.toFixed(2)}
                  </span>
                </div>
                <Progress 
                  value={getSpendingPercentage()} 
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Buffer Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Buffer Status</CardTitle>
              <CardDescription>Your 20% emergency funds</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-2xl font-bold">
                    ₹{(walletData.buffer - bufferUsed).toFixed(2)}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  of ₹{walletData.buffer.toFixed(2)}
                </span>
              </div>
              
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Buffer Used</span>
                  <span className="font-medium">
                    ₹{bufferUsed.toFixed(2)} / ₹{walletData.buffer.toFixed(2)}
                  </span>
                </div>
                <Progress 
                  value={getBufferPercentage()} 
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Categories Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Spending Categories</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(walletData.categories).map(([category, data]) => (
              <Card key={category} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md font-medium capitalize">
                    {category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>Used</span>
                    <span className="font-medium">
                      ₹{data.spent.toFixed(2)} / ₹{data.limit.toFixed(2)}
                    </span>
                  </div>
                  <Progress 
                    value={(data.spent / data.limit) * 100} 
                    className="h-2"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-4">
          <Button 
            className="w-full justify-start" 
            onClick={() => navigate('/transactions/new')}
            disabled={isBudgetLocked}
          >
            <ArrowUpIcon className="mr-2 h-4 w-4" />
            Add Transaction
            {isBudgetLocked && (
              <span className="ml-2 text-xs">(Budget Locked)</span>
            )}
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => navigate('/transactions')}
          >
            <ArrowDownIcon className="mr-2 h-4 w-4" />
            View Transactions
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => navigate('/rewards')}
          >
            <ArrowDownIcon className="mr-2 h-4 w-4" />
            Financial Analysis
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
