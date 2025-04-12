import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
}

export default function AddTransaction() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [recipient, setRecipient] = useState("");
  const [bufferReason, setBufferReason] = useState("");
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [showBufferAlert, setShowBufferAlert] = useState(false);
  const [isCategoryOverLimit, setIsCategoryOverLimit] = useState(false);
  const [isBudgetOver80Percent, setIsBudgetOver80Percent] = useState(false);
  const [isAskingForBuffer, setIsAskingForBuffer] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const walletStr = localStorage.getItem('wallet');
    if (walletStr) {
      const wallet = JSON.parse(walletStr) as WalletData;
      setWalletData(wallet);
      
      const totalSpent = Object.values(wallet.categories).reduce(
        (sum: number, category: any) => sum + category.spent, 
        0
      );
      setIsBudgetOver80Percent(totalSpent >= wallet.usableAmount * 0.8);
    }
  }, []);

  const checkCategoryLimit = (cat: string, amt: number) => {
    if (!walletData || !cat) return false;
    
    const categoryData = walletData.categories[cat];
    if (!categoryData) return false;
    
    return categoryData.spent + amt > categoryData.limit;
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value);
    
    if (category && value) {
      const amtValue = parseFloat(value);
      setIsCategoryOverLimit(checkCategoryLimit(category, amtValue));
    }
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    
    if (amount) {
      const amtValue = parseFloat(amount);
      setIsCategoryOverLimit(checkCategoryLimit(value, amtValue));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const amtValue = parseFloat(amount);
    
    if (!amount || amtValue <= 0 || !category || !description || !recipient) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please fill all required fields with valid values.",
      });
      setIsLoading(false);
      return;
    }
    
    if (isCategoryOverLimit) {
      setShowBufferAlert(true);
      setIsLoading(false);
      return;
    }
    
    if (walletData) {
      const totalSpent = Object.values(walletData.categories).reduce(
        (sum: number, cat: any) => sum + cat.spent, 
        0
      );
      
      if (totalSpent + amtValue > walletData.usableAmount * 0.8) {
        setIsBudgetOver80Percent(true);
        setShowBufferAlert(true);
        setIsLoading(false);
        return;
      }
    }
    
    processTransaction();
  };

  const processTransaction = () => {
    const amtValue = parseFloat(amount);
    
    try {
      const walletStr = localStorage.getItem('wallet');
      if (!walletStr) throw new Error('No wallet data found');
      
      const wallet = JSON.parse(walletStr) as WalletData;
      
      const newTransaction = {
        id: uuidv4(),
        amount: amtValue,
        category,
        description,
        recipient,
        timestamp: new Date().toLocaleString(),
        usedBuffer: isAskingForBuffer,
        bufferReason: isAskingForBuffer ? bufferReason : null
      };
      
      wallet.categories[category].spent += amtValue;
      
      wallet.transactions = [newTransaction, ...(wallet.transactions || [])];
      
      localStorage.setItem('wallet', JSON.stringify(wallet));
      
      toast({
        title: "Transaction added",
        description: `$${amtValue.toFixed(2)} has been recorded in your ${category} category.`,
      });
      
      navigate('/transactions');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process the transaction. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBufferRequest = () => {
    setIsAskingForBuffer(true);
    setShowBufferAlert(false);
    processTransaction();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Transaction</h1>
          <p className="text-muted-foreground">
            Record a new expense in your budget
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Transaction Details</CardTitle>
              <CardDescription>
                Enter the details of your expense
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={handleAmountChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={handleCategoryChange}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {walletData && Object.keys(walletData.categories).map((cat) => (
                      <SelectItem key={cat} value={cat} className="capitalize">
                        {cat} (₹{walletData.categories[cat].spent.toFixed(2)}/₹{walletData.categories[cat].limit.toFixed(2)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isCategoryOverLimit && category && (
                  <p className="text-sm text-destructive">
                    This amount exceeds your category limit. You'll need to use your buffer.
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="What did you purchase?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient</Label>
                <Input
                  id="recipient"
                  placeholder="Where did you spend this money?"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  required
                />
              </div>
              
              {isAskingForBuffer && (
                <div className="space-y-2">
                  <Label htmlFor="bufferReason">
                    Reason for Using Buffer
                    <span className="text-destructive ml-1">*</span>
                  </Label>
                  <Textarea
                    id="bufferReason"
                    placeholder="Please explain why you need to use the buffer funds"
                    value={bufferReason}
                    onChange={(e) => setBufferReason(e.target.value)}
                    required
                  />
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button" onClick={() => navigate('/dashboard')}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Processing..." : "Save Transaction"}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <AlertDialog open={showBufferAlert} onOpenChange={setShowBufferAlert}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Budget Limit Exceeded</AlertDialogTitle>
              <AlertDialogDescription>
                {isCategoryOverLimit ? (
                  <>This transaction exceeds your category limit.</>
                ) : (
                  <>You've reached 80% of your daily budget.</>
                )}
                <br /><br />
                Do you want to use your buffer funds for this transaction? You'll need to provide a valid reason.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel Transaction</AlertDialogCancel>
              <AlertDialogAction onClick={handleBufferRequest}>
                Use Buffer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
