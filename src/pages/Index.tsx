import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if the user is already logged in
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.isLoggedIn) {
        if (!user.setupComplete) {
          navigate('/setup');
        } else {
          navigate('/dashboard');
        }
        return;
      }
    }
    
    // Otherwise go to login/signup
    navigate('/');
  }, [navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Redirecting to login...</p>
    </div>
  );
};

export default Index;
