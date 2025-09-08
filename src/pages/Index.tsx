import { useState, useEffect } from "react";
import MobileFrame from "@/components/MobileFrame";
import TruthGuardApp from "@/components/TruthGuardApp";
import AuthForm from "@/components/AuthForm";
import AdminDashboard from "@/components/AdminDashboard";
import { authStorage, User } from "@/utils/auth";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = authStorage.getUser();
    setUser(storedUser);
    setIsLoading(false);
  }, []);

  const handleAuthSuccess = (user: User) => {
    setUser(user);
  };

  const handleLogout = () => {
    authStorage.logout();
    setUser(null);
  };

  if (isLoading) {
    return (
      <MobileFrame>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MobileFrame>
    );
  }

  if (!user) {
    return (
      <MobileFrame>
        <AuthForm onAuthSuccess={handleAuthSuccess} />
      </MobileFrame>
    );
  }

  if (user.role === 'admin') {
    return (
      <MobileFrame>
        <AdminDashboard user={user} onLogout={handleLogout} />
      </MobileFrame>
    );
  }

  return (
    <MobileFrame>
      <TruthGuardApp />
    </MobileFrame>
  );
};

export default Index;
