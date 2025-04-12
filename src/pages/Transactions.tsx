
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search } from "lucide-react";

interface Transaction {
  id: string;
  amount: number;
  category: string;
  description: string;
  recipient: string;
  timestamp: string;
}

export default function TransactionsPage() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  useEffect(() => {
    // Load wallet data to get transactions
    const walletStr = localStorage.getItem('wallet');
    if (walletStr) {
      const wallet = JSON.parse(walletStr);
      if (wallet.transactions) {
        setTransactions(wallet.transactions);
        setFilteredTransactions(wallet.transactions);
      }
    }
  }, []);

  useEffect(() => {
    // Filter transactions based on search query and category
    let filtered = [...transactions];
    
    if (searchQuery) {
      filtered = filtered.filter(
        (tx) => 
          tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tx.recipient.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (categoryFilter) {
      filtered = filtered.filter((tx) => tx.category === categoryFilter);
    }
    
    setFilteredTransactions(filtered);
  }, [searchQuery, categoryFilter, transactions]);

  // Get unique categories for the filter dropdown
  const categories = [...new Set(transactions.map((tx) => tx.category))];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
            <p className="text-muted-foreground">
              View and manage your spending history
            </p>
          </div>
          <Button onClick={() => navigate('/transactions/new')}>
            <Plus className="mr-2 h-4 w-4" />
            New Transaction
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>
              View all your past transactions and apply filters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select
                value={categoryFilter}
                onValueChange={setCategoryFilter}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-categories">All Categories</SelectItem>
                  <SelectGroup>
                    <SelectLabel>Categories</SelectLabel>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category} className="capitalize">
                        {category}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {filteredTransactions.length > 0 ? (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Recipient</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell className="capitalize">{transaction.category}</TableCell>
                        <TableCell>{transaction.recipient}</TableCell>
                        <TableCell className="text-right font-medium text-destructive">
                          -${transaction.amount.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {transaction.timestamp}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground mb-4">No transactions found</p>
                <Button onClick={() => navigate('/transactions/new')}>
                  Add Your First Transaction
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
