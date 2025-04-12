
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { 
  Wallet, PiggyBank, TrendingUp, LineChart, BarChart3, 
  CircleDollarSign, ArrowUpRight, ArrowDownRight
} from "lucide-react";

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
  transactions: Array<{
    id: string;
    amount: number;
    description: string;
    category: string;
    timestamp: string;
  }>;
  savings: number;
  budgetLocked?: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function RewardsPage() {
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [savingsRate, setSavingsRate] = useState<number>(0);
  const [investmentSuggestion, setInvestmentSuggestion] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // Load wallet data
    const walletStr = localStorage.getItem('wallet');
    if (walletStr) {
      const wallet = JSON.parse(walletStr) as WalletData;
      setWalletData(wallet);
      
      // Calculate savings rate
      const totalBudget = wallet.usableAmount + wallet.buffer;
      const savingsRate = (wallet.savings / totalBudget) * 100;
      setSavingsRate(savingsRate);

      // Set initial investment suggestion
      generateInvestmentSuggestion(wallet);
    }
  }, []);

  const generateInvestmentSuggestion = (data: WalletData) => {
    setIsLoading(true);
    
    const totalSpent = Object.values(data.categories).reduce(
      (sum, cat) => sum + cat.spent, 0
    );
    
    const savingsAmount = data.savings;
    const expensesByCategory = Object.entries(data.categories)
      .map(([category, details]) => ({
        category,
        spent: details.spent,
        percentage: (details.spent / totalSpent) * 100
      }));
    
    // Sort expenses by highest to lowest
    expensesByCategory.sort((a, b) => b.spent - a.spent);
    
    const highestExpenseCategory = expensesByCategory[0]?.category || "unknown";
    
    // Simple algorithm for investment suggestion based on savings and spending
    let suggestion = "";
    
    if (savingsAmount > data.usableAmount * 3) {
      suggestion = `You have a healthy savings of ₹${savingsAmount.toFixed(2)}. Consider investing 30% in a mix of mutual funds and fixed deposits for long-term growth. Your highest expense category is ${highestExpenseCategory}, which accounts for ${expensesByCategory[0]?.percentage.toFixed(2)}% of your spending.`;
    } else if (savingsAmount > data.usableAmount) {
      suggestion = `You have saved ₹${savingsAmount.toFixed(2)}. Consider starting with a small investment in a liquid fund while building your emergency fund. Focus on reducing expenses in ${highestExpenseCategory} to increase your savings rate.`;
    } else {
      suggestion = `Your current savings of ₹${savingsAmount.toFixed(2)} are below optimal levels. Focus on building an emergency fund of at least 3 months of expenses before investing. Consider reducing spending in ${highestExpenseCategory} which is your highest expense category.`;
    }
    
    setInvestmentSuggestion(suggestion);
    setIsLoading(false);
  };

  // Prepare monthly expenses data
  const getMonthlyExpenseData = () => {
    if (!walletData?.transactions) return [];
    
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const months: {[key: string]: number} = {};
    
    // Initialize all months with zero
    monthNames.forEach(month => {
      months[month] = 0;
    });
    
    // Sum transactions by month
    walletData.transactions.forEach(transaction => {
      const date = new Date(transaction.timestamp);
      const monthName = monthNames[date.getMonth()];
      months[monthName] += transaction.amount;
    });
    
    // Convert to chart data format
    return Object.entries(months).map(([name, amount]) => ({
      name,
      amount
    }));
  };

  // Prepare category data for pie chart
  const getCategoryData = () => {
    if (!walletData) return [];
    
    return Object.entries(walletData.categories).map(([category, data]) => ({
      name: category,
      value: data.spent
    }));
  };

  // Custom tooltip for pie chart
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <ChartTooltipContent>
          <div className="text-xs font-medium">{payload[0].name}</div>
          <div className="text-xs">₹{payload[0].value.toFixed(2)}</div>
          <div className="text-xs text-muted-foreground">
            {((payload[0].value / getTotalExpenses()) * 100).toFixed(1)}%
          </div>
        </ChartTooltipContent>
      );
    }
    return null;
  };

  // Get total expenses
  const getTotalExpenses = () => {
    if (!walletData) return 0;
    return Object.values(walletData.categories).reduce(
      (sum, cat) => sum + cat.spent, 0
    );
  };

  if (!walletData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p>Loading analysis data...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Analysis</h1>
          <p className="text-muted-foreground">
            Track your spending patterns, savings performance, and get investment insights
          </p>
        </div>

        <Tabs defaultValue="expenses" className="space-y-4">
          <TabsList className="grid grid-cols-3 w-full md:w-1/2 lg:w-1/3">
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="savings">Savings</TabsTrigger>
            <TabsTrigger value="investment">Investment</TabsTrigger>
          </TabsList>

          {/* Expenses Analysis Tab */}
          <TabsContent value="expenses" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5" />
                    Expense Breakdown
                  </CardTitle>
                  <CardDescription>
                    Your spending by category
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ChartContainer config={{}} className="h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getCategoryData()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {getCategoryData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomPieTooltip />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <LineChart className="mr-2 h-5 w-5" />
                    Monthly Expenses
                  </CardTitle>
                  <CardDescription>
                    Your spending over time
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ChartContainer config={{}} className="h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={getMonthlyExpenseData()}
                        margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="amount" fill="#8884d8" name="Spent" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CircleDollarSign className="mr-2 h-5 w-5" />
                  Top Expense Categories
                </CardTitle>
                <CardDescription>
                  Your highest spending areas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(walletData.categories)
                    .sort(([, a], [, b]) => b.spent - a.spent)
                    .slice(0, 3)
                    .map(([category, data]) => (
                      <div key={category} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="capitalize">{category}</div>
                          <div className="flex items-center">
                            <span className="font-semibold">₹{data.spent.toFixed(2)}</span>
                            <ArrowDownRight className="ml-1 h-4 w-4 text-destructive" />
                          </div>
                        </div>
                        <Progress value={(data.spent / data.limit) * 100} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{((data.spent / getTotalExpenses()) * 100).toFixed(1)}% of total</span>
                          <span>{((data.spent / data.limit) * 100).toFixed(0)}% of limit</span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Savings Analysis Tab */}
          <TabsContent value="savings" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PiggyBank className="mr-2 h-5 w-5" />
                    Savings Overview
                  </CardTitle>
                  <CardDescription>
                    Your current savings status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    <div>
                      <div className="flex items-center justify-between">
                        <div>Total Savings</div>
                        <div className="font-semibold text-2xl">₹{walletData.savings.toFixed(2)}</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Savings Rate</span>
                        <span className="font-medium">{savingsRate.toFixed(1)}%</span>
                      </div>
                      <Progress value={Math.min(savingsRate, 100)} className="h-2" />
                      <div className="text-xs text-muted-foreground">
                        Recommended: 20% of income saved
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Budget Utilization</span>
                        <span className="font-medium">
                          {(getTotalExpenses() / walletData.usableAmount * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress 
                        value={(getTotalExpenses() / walletData.usableAmount) * 100} 
                        className="h-2" 
                      />
                      <div className="text-xs text-muted-foreground">
                        Lower utilization means higher potential savings
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5" />
                    Savings Potential
                  </CardTitle>
                  <CardDescription>
                    Opportunities to increase your savings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg bg-muted p-4">
                    <h4 className="font-medium mb-2">Reducing Top Expenses</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Cutting your highest expense category by 10% could save you:
                    </p>
                    
                    {Object.entries(walletData.categories)
                      .sort(([, a], [, b]) => b.spent - a.spent)
                      .slice(0, 1)
                      .map(([category, data]) => (
                        <div key={category} className="flex justify-between items-center">
                          <div className="capitalize">{category}</div>
                          <div className="flex items-center text-green-600">
                            <span className="font-semibold">₹{(data.spent * 0.1).toFixed(2)}</span>
                            <ArrowUpRight className="ml-1 h-4 w-4" />
                          </div>
                        </div>
                      ))}
                  </div>
                  
                  <div className="rounded-lg bg-muted p-4">
                    <h4 className="font-medium mb-2">Annual Projection</h4>
                    <div className="flex justify-between items-center text-lg">
                      <span>Current Rate:</span>
                      <span className="font-semibold">₹{(walletData.savings * 12).toFixed(2)}/year</span>
                    </div>
                    <div className="flex justify-between items-center text-lg text-green-600 mt-1">
                      <span>Optimized Rate:</span>
                      <span className="font-semibold">₹{(walletData.savings * 1.2 * 12).toFixed(2)}/year</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Based on improving your savings rate by 20%
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Investment Tab */}
          <TabsContent value="investment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wallet className="mr-2 h-5 w-5" />
                  Investment Recommendations
                </CardTitle>
                <CardDescription>
                  Personalized investment suggestions based on your financial profile
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 border rounded-lg bg-muted">
                    <h4 className="font-medium mb-2 text-lg">Analysis</h4>
                    <p className="text-sm">
                      {investmentSuggestion}
                    </p>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Safety First</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Low-risk options for emergency funds:
                      </p>
                      <ul className="text-sm space-y-1 list-disc pl-4">
                        <li>Fixed Deposits</li>
                        <li>Liquid Funds</li>
                        <li>Savings Accounts</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Growth Focus</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Medium-risk options for growth:
                      </p>
                      <ul className="text-sm space-y-1 list-disc pl-4">
                        <li>Index Funds</li>
                        <li>Balanced Mutual Funds</li>
                        <li>Corporate Bonds</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Wealth Building</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Higher-risk options for long-term:
                      </p>
                      <ul className="text-sm space-y-1 list-disc pl-4">
                        <li>Equity Mutual Funds</li>
                        <li>Stocks</li>
                        <li>Real Estate Funds</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div>
                    <Button className="w-full" variant="outline">
                      Get More Detailed Recommendations
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
