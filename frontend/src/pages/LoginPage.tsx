import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import AuthImagePattern from "../components/AuthImagePattern";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<any>({});
  const { login, isLoggingIn } = useAuthStore();

  const validate = () => {
    const newErrors: any = {};
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    }
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    login(formData);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side - Form */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col justify-center items-center p-6 sm:p-12 bg-base-100"
      >
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center 
                group-hover:bg-primary/20 transition-colors shadow-lg shadow-primary/5"
              >
                <MessageSquare className="w-8 h-8 text-primary" />
              </motion.div>
              <h1 className="text-3xl font-bold mt-4 tracking-tight">Welcome Back</h1>
              <p className="text-base-content/60 text-lg">Enter your details to access your account</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Email Address</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-all duration-300 group-focus-within:text-primary group-focus-within:scale-110">
                  <Mail className="h-5 w-5 text-base-content/40 transition-colors" />
                </div>
                <input
                  type="email"
                  autoComplete="email"
                  className={`input input-bordered w-full pl-12 h-12 rounded-xl transition-all duration-300
                  focus:ring-2 focus:ring-primary/20 bg-base-100/50 backdrop-blur-sm
                  ${errors.email ? "input-error" : "hover:border-primary/50"}`}
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              {errors.email && <span className="text-error text-sm mt-1 ml-1">{errors.email}</span>}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Password</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-all duration-300 group-focus-within:text-primary group-focus-within:scale-110">
                  <Lock className="h-5 w-5 text-base-content/40 transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className={`input input-bordered w-full pl-12 pr-12 h-12 rounded-xl transition-all duration-300
                  focus:ring-2 focus:ring-primary/20 bg-base-100/50 backdrop-blur-sm
                  ${errors.password ? "input-error" : "hover:border-primary/50"}`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-primary transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-base-content/40" />
                  ) : (
                    <Eye className="h-5 w-5 text-base-content/40" />
                  )}
                </button>
              </div>
              {errors.password && <span className="text-error text-sm mt-1 ml-1">{errors.password}</span>}
            </div>

            <motion.button 
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit" 
              className="btn btn-primary w-full h-12 rounded-xl text-lg font-bold shadow-lg shadow-primary/20 border-none
              bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary" 
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign in"
              )}
            </motion.button>
          </form>

          <div className="text-center pt-4 border-t border-base-200">
            <p className="text-base-content/60">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="link link-primary font-bold no-underline hover:underline underline-offset-4 transition-all">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Right Side - Image/Pattern */}
      <AuthImagePattern
        title={"Welcome back!"}
        subtitle={"Sign in to continue your conversations and catch up with your messages."}
        variant="glass"
      />
    </div>
  );
};
export default LoginPage;
