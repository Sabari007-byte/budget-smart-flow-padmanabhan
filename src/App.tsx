
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthForm from "./components/auth/AuthForm";
import SetupForm from "./components/auth/SetupForm";
import Welcome from "./components/onboarding/Welcome";
import DailyPreferences from "./components/onboarding/DailyPreferences";
import Dashboard from "./pages/Dashboard";
import WalletPage from "./pages/Wallet";
import TransactionsPage from "./pages/Transactions";
import AddTransaction from "./pages/AddTransaction";
import ProfilePage from "./pages/Profile";
import RewardsPage from "./pages/Rewards";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AuthForm />} />
          <Route path="/setup" element={<SetupForm />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/daily-preferences" element={<DailyPreferences />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/transactions/new" element={<AddTransaction />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/rewards" element={<RewardsPage />} />
          <Route path="/stats" element={<Dashboard />} /> {/* Placeholder for now */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
      <Sonner />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
