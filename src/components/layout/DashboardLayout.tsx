
import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  useEffect(() => {
    // Check if user is logged in
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/');
      return;
    }
    
    const user = JSON.parse(userStr);
    if (!user.isLoggedIn) {
      navigate('/');
      return;
    }
    
    // Check if setup is complete
    if (!user.setupComplete) {
      navigate('/setup');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className={`flex-1 p-6 ${isMobile ? 'ml-0' : 'ml-64'}`}>
        {children}
      </main>
    </div>
  );
}
