
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface UserData {
  name: string;
  email: string;
  age: string;
  contact: string;
  isLoggedIn: boolean;
  setupComplete: boolean;
}

interface FinanceData {
  income: number;
  budgetAmount: number;
  walletBalance: number;
  dailyHabitsSet: boolean;
  dailyBudget?: number;
}

export default function ProfilePage() {
  const { toast } = useToast();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [financeData, setFinanceData] = useState<FinanceData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<Partial<UserData>>({});
  const [editedFinance, setEditedFinance] = useState<Partial<FinanceData>>({});
  const [userInitials, setUserInitials] = useState("U");

  useEffect(() => {
    // Load user data
    const userStr = localStorage.getItem('user');
    const financeStr = localStorage.getItem('userFinances');
    
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserData(user);
      setEditedUser(user);
      
      // Create initials from name
      if (user.name) {
        const names = user.name.split(' ');
        if (names.length > 1) {
          setUserInitials(`${names[0][0]}${names[1][0]}`);
        } else {
          setUserInitials(names[0][0]);
        }
      }
    }
    
    if (financeStr) {
      const finance = JSON.parse(financeStr);
      setFinanceData(finance);
      setEditedFinance(finance);
    }
  }, []);

  const handleSaveProfile = () => {
    if (!userData || !financeData) return;
    
    // Update user data
    const updatedUser = { ...userData, ...editedUser };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUserData(updatedUser);
    
    // Update finance data
    const updatedFinance = { ...financeData, ...editedFinance };
    localStorage.setItem('userFinances', JSON.stringify(updatedFinance));
    setFinanceData(updatedFinance);
    
    toast({
      title: "Profile updated",
      description: "Your profile information has been saved.",
    });
    
    setIsEditing(false);
  };

  if (!userData || !financeData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p>Loading profile data...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">
            View and manage your personal information
          </p>
        </div>

        <Tabs defaultValue="personal">
          <TabsList className="mb-6">
            <TabsTrigger value="personal">Personal Information</TabsTrigger>
            <TabsTrigger value="financial">Financial Details</TabsTrigger>
          </TabsList>
          
          <TabsContent value="personal">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Your personal details and contact information
                  </CardDescription>
                </div>
                <Avatar className="h-16 w-16">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={editedUser.name || ''}
                        onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                      />
                    ) : (
                      <p className="text-lg font-medium">{userData.name}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={editedUser.email || ''}
                        onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                      />
                    ) : (
                      <p className="text-lg">{userData.email}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    {isEditing ? (
                      <Input
                        id="age"
                        type="number"
                        min="18"
                        value={editedUser.age || ''}
                        onChange={(e) => setEditedUser({ ...editedUser, age: e.target.value })}
                      />
                    ) : (
                      <p className="text-lg">{userData.age}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contact">Contact Number</Label>
                    {isEditing ? (
                      <Input
                        id="contact"
                        value={editedUser.contact || ''}
                        onChange={(e) => setEditedUser({ ...editedUser, contact: e.target.value })}
                      />
                    ) : (
                      <p className="text-lg">{userData.contact}</p>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                {isEditing ? (
                  <div className="flex w-full justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveProfile}>
                      Save Changes
                    </Button>
                  </div>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </Button>
                )}
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="financial">
            <Card>
              <CardHeader>
                <CardTitle>Financial Information</CardTitle>
                <CardDescription>
                  Your income and budget settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="income">Monthly Income</Label>
                    {isEditing ? (
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                        <Input
                          id="income"
                          type="number"
                          className="pl-7"
                          value={editedFinance.income || ''}
                          onChange={(e) => setEditedFinance({ ...editedFinance, income: parseFloat(e.target.value) })}
                        />
                      </div>
                    ) : (
                      <p className="text-lg">₹{financeData.income.toFixed(2)}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="budget">Monthly Budget</Label>
                    {isEditing ? (
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                        <Input
                          id="budget"
                          type="number"
                          className="pl-7"
                          value={editedFinance.budgetAmount || ''}
                          onChange={(e) => setEditedFinance({ ...editedFinance, budgetAmount: parseFloat(e.target.value) })}
                        />
                      </div>
                    ) : (
                      <p className="text-lg">₹{financeData.budgetAmount.toFixed(2)}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="daily">Daily Budget</Label>
                    {isEditing ? (
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                        <Input
                          id="daily"
                          type="number"
                          className="pl-7"
                          value={editedFinance.dailyBudget || ''}
                          onChange={(e) => setEditedFinance({ ...editedFinance, dailyBudget: parseFloat(e.target.value) })}
                        />
                      </div>
                    ) : (
                      <p className="text-lg">₹{financeData.dailyBudget?.toFixed(2) || "Not set"}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="wallet">Current Wallet Balance</Label>
                    <p className="text-lg">₹{financeData.walletBalance.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">
                      This is updated automatically based on transactions
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                {isEditing ? (
                  <div className="flex w-full justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveProfile}>
                      Save Changes
                    </Button>
                  </div>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>
                    Edit Financial Info
                  </Button>
                )}
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
