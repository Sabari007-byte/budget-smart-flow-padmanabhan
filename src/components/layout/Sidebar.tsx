
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Wallet, 
  Home, 
  BarChart3, 
  DollarSign, 
  User, 
  LogOut,
  PlusSquare,
  LineChart,
  Menu,
  X
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userName, setUserName] = useState<string>('User');
  const [userInitials, setUserInitials] = useState<string>('U');
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(!isMobile);

  useEffect(() => {
    // Load user data from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserName(user.name);
      
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
  }, []);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('userFinances');
    localStorage.removeItem('dailyHabits');
    localStorage.removeItem('wallet');
    
    toast({
      title: "Logged out successfully",
      description: "See you soon!",
    });
    
    navigate('/');
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile hamburger menu */}
      {isMobile && (
        <div className="fixed top-4 left-4 z-50">
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full" 
            onClick={toggleSidebar}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      )}
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-sidebar border-r transition-transform duration-200 ease-in-out 
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        ${isMobile ? 'shadow-xl' : ''}`}
      >
        <div className="flex h-full flex-col">
          {/* User profile section */}
          <div className="flex flex-col items-center p-6 border-b space-y-3">
            <Avatar className="h-16 w-16">
              <AvatarImage src="" />
              <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <p className="text-lg font-medium">{userName}</p>
              <p className="text-sm text-muted-foreground">Smart Budgeter</p>
            </div>
          </div>
          
          {/* Navigation links */}
          <nav className="flex-1 overflow-y-auto py-6 px-3">
            <div className="space-y-2">
              <Link to="/dashboard">
                <Button 
                  variant={isActive('/dashboard') ? "default" : "ghost"} 
                  className="w-full justify-start" 
                  onClick={() => isMobile && setIsOpen(false)}
                >
                  <Home className="mr-2 h-5 w-5" />
                  Dashboard
                </Button>
              </Link>
              
              <Link to="/wallet">
                <Button 
                  variant={isActive('/wallet') ? "default" : "ghost"} 
                  className="w-full justify-start"
                  onClick={() => isMobile && setIsOpen(false)}
                >
                  <Wallet className="mr-2 h-5 w-5" />
                  Wallet
                </Button>
              </Link>
              
              <Link to="/transactions/new">
                <Button 
                  variant={isActive('/transactions/new') ? "default" : "ghost"} 
                  className="w-full justify-start"
                  onClick={() => isMobile && setIsOpen(false)}
                >
                  <PlusSquare className="mr-2 h-5 w-5" />
                  Add Transaction
                </Button>
              </Link>
              
              <Link to="/transactions">
                <Button 
                  variant={isActive('/transactions') ? "default" : "ghost"} 
                  className="w-full justify-start"
                  onClick={() => isMobile && setIsOpen(false)}
                >
                  <DollarSign className="mr-2 h-5 w-5" />
                  Transactions
                </Button>
              </Link>
              
              <Link to="/stats">
                <Button 
                  variant={isActive('/stats') ? "default" : "ghost"} 
                  className="w-full justify-start"
                  onClick={() => isMobile && setIsOpen(false)}
                >
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Statistics
                </Button>
              </Link>
              
              <Link to="/rewards">
                <Button 
                  variant={isActive('/rewards') ? "default" : "ghost"} 
                  className="w-full justify-start"
                  onClick={() => isMobile && setIsOpen(false)}
                >
                  <LineChart className="mr-2 h-5 w-5" />
                  Financial Analysis
                </Button>
              </Link>
              
              <Link to="/profile">
                <Button 
                  variant={isActive('/profile') ? "default" : "ghost"} 
                  className="w-full justify-start"
                  onClick={() => isMobile && setIsOpen(false)}
                >
                  <User className="mr-2 h-5 w-5" />
                  Profile
                </Button>
              </Link>
            </div>
          </nav>
          
          {/* Logout button */}
          <div className="p-4 border-t">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-muted-foreground"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-5 w-5" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
