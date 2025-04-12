
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Wallet as WalletIcon, Coins, ArrowDown, ArrowUp, Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

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

export default function WalletPage() {
  const navigate = useNavigate();
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [totalSpentToday, setTotalSpentToday] = useState<number>(0);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [budgetLocked, setBudgetLocked] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load wallet data
    const walletStr = localStorage.getItem('wallet');
    if (walletStr) {
      const wallet = JSON.parse(walletStr) as WalletData;
      setWalletData(wallet);
      
      // Set budget lock status
      setBudgetLocked(wallet.budgetLocked || false);
      
      // Calculate total spent today
      const totalSpent = Object.values(wallet.categories).reduce(
        (sum: number, category: any) => sum + category.spent, 
        0
      );
      setTotalSpentToday(totalSpent);
      
      // Get recent transactions (if available)
      if (wallet.transactions && wallet.transactions.length > 0) {
        setRecentTransactions(wallet.transactions.slice(0, 3));
      }
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

  if (!walletData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p>Loading wallet data...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Wallet</h1>
            <p className="text-muted-foreground">
              Manage your daily budget and view your wallet status
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">
              {budgetLocked ? (
                <>
                  <Lock className="inline h-4 w-4 mr-1" />
                  Locked
                </>
              ) : (
                <>
                  <Unlock className="inline h-4 w-4 mr-1" />
                  Unlocked
                </>
              )}
            </span>
            <Switch 
              checked={budgetLocked}
              onCheckedChange={toggleBudgetLock}
            />
          </div>
        </div>

        {/* Main Wallet Card */}
        <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold">Smart Budget Wallet</CardTitle>
              <WalletIcon className="h-6 w-6 text-primary" />
            </div>
            <CardDescription>Your daily spending allocation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Available (80%)</div>
                <div className="text-3xl font-bold">
                  ₹{(walletData.usableAmount - totalSpentToday).toFixed(2)}
                  <span className="text-sm text-muted-foreground ml-2">
                    of ₹{walletData.usableAmount.toFixed(2)}
                  </span>
                </div>
                <Progress
                  value={(totalSpentToday / walletData.usableAmount) * 100}
                  className="h-2 mt-2"
                />
              </div>
              
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Buffer (20%)</div>
                <div className="text-3xl font-bold">
                  ₹{walletData.buffer.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Available for emergencies only
                </div>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-4">
              <Button 
                className="w-full"
                onClick={() => navigate('/transactions/new')}
                disabled={budgetLocked}
              >
                <ArrowUp className="mr-2 h-4 w-4" />
                Add Transaction
                {budgetLocked && (
                  <span className="ml-2 text-xs">(Locked)</span>
                )}
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/transactions')}
              >
                View History
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Daily Spending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <ArrowDown className="mr-2 h-4 w-4 text-destructive" />
                <span className="text-2xl font-bold">₹{totalSpentToday.toFixed(2)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {((totalSpentToday / walletData.usableAmount) * 100).toFixed(0)}% of daily budget used
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Savings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Coins className="mr-2 h-4 w-4 text-yellow-500" />
                <span className="text-2xl font-bold">₹{walletData.savings.toFixed(2)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Total unused funds saved
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Recent Transactions</CardTitle>
            <CardDescription>Your latest spending activities</CardDescription>
          </CardHeader>
          <CardContent>
            {recentTransactions.length > 0 ? (
              <div className="space-y-4">
                {recentTransactions.map((transaction, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded-md">
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground capitalize">{transaction.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-destructive">-₹{transaction.amount.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">{transaction.timestamp}</p>
                    </div>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  className="w-full mt-2"
                  onClick={() => navigate('/transactions')}
                >
                  View All Transactions
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No recent transactions</p>
                <Button 
                  className="mt-2"
                  onClick={() => navigate('/transactions/new')}
                  disabled={budgetLocked}
                >
                  Add Your First Transaction
                  {budgetLocked && (
                    <span className="ml-2 text-xs">(Locked)</span>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
