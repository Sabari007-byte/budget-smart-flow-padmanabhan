
import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet } from "lucide-react";

export default function Welcome() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>('User');
  const [budgetAmount, setBudgetAmount] = useState<string>('0');

  useEffect(() => {
    // Fetch user data
    const userStr = localStorage.getItem('user');
    const financesStr = localStorage.getItem('userFinances');
    
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserName(user.name);
    }
    
    if (financesStr) {
      const finances = JSON.parse(financesStr);
      setBudgetAmount(finances.budgetAmount.toFixed(2));
    }
  }, []);

  const handleGetStarted = () => {
    navigate('/daily-preferences');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="pb-2">
          <CardTitle className="text-3xl">Welcome, {userName}!</CardTitle>
          <CardDescription className="text-xl">
            To Budget Smart Flow
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pb-6">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
            <Wallet className="h-12 w-12 text-primary" />
          </div>
          <div>
            <p className="text-lg text-muted-foreground">Your monthly budget is set to:</p>
            <p className="text-3xl font-bold text-primary">${budgetAmount}</p>
          </div>
          <p className="text-xl">
            Are you ready to start managing your expenses smartly?
          </p>
        </CardContent>
        <CardFooter>
          <Button className="w-full text-lg py-6" onClick={handleGetStarted}>
            Yes, I'm Ready
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
