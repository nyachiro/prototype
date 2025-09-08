import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Shield, Eye, EyeOff } from "lucide-react";
import { authStorage, User } from "@/utils/auth";

interface AuthFormProps {
  onAuthSuccess: (user: User) => void;
}

const AuthForm = ({ onAuthSuccess }: AuthFormProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        const user = authStorage.login(formData.email, formData.password);
        if (user) {
          onAuthSuccess(user);
        } else {
          setError('Invalid email or password');
        }
      } else {
        if (!formData.name.trim()) {
          setError('Name is required');
          return;
        }
        const user = authStorage.register(formData.email, formData.password, formData.name);
        onAuthSuccess(user);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-hero">
      {/* Header */}
      <div className="px-6 py-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <Shield className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Truth Guard Kenya</h1>
        <p className="text-white/90 text-sm">
          {isLogin ? 'Sign in to your account' : 'Create your account'}
        </p>
      </div>

      {/* Form */}
      <div className="flex-1 bg-white rounded-t-3xl px-6 py-8">
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your full name"
                  required={!isLogin}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter your password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <Button 
              type="submit"
              className="w-full h-12 bg-gradient-primary hover:opacity-90 text-white font-semibold rounded-xl shadow-truth"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setFormData({ email: '', password: '', name: '' });
                }}
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </Button>
            </div>
          </form>

          {isLogin && (
            <div className="mt-6 bg-blue-50 p-4 rounded-xl">
              <p className="text-sm text-blue-800">
                <strong>Demo Credentials:</strong><br />
                Admin: admin@crecokenya.org / admin123
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AuthForm;