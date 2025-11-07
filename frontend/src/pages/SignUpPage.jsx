
import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare, User } from "lucide-react";
import { Link } from "react-router-dom";

import AuthImagePattern from "../components/AuthImagePattern";

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});

  const { signup, isSigningUp } = useAuthStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    signup(formData);
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* left side */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12 bg-base-100">
        <div className="w-full max-w-md space-y-8">
          {/* LOGO */}
          <div className="text-center mb-12">
            <div
              className={`flex flex-col items-center gap-3 transform transition-all duration-700 ${
                mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}
            >
              <div
                className="size-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 
                flex items-center justify-center shadow-lg shadow-primary/25 
                transition-all duration-500 hover:shadow-xl hover:shadow-primary/35
                hover:scale-110 hover:rotate-3 transform-gpu cursor-pointer group"
              >
                <MessageSquare className="size-7 text-white transition-transform duration-500 group-hover:scale-110" />
              </div>
              <h1 className="text-3xl font-bold mt-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Create Account
              </h1>
              <p className="text-base-content/70 text-lg">Get started with your free account</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Full Name Input */}
            <div
              className={`form-control space-y-2 transform transition-all duration-700 delay-100 ${
                mounted ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'
              }`}
            >
              <label className="label pb-2">
                <span className="label-text font-semibold text-base">Full Name</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-all duration-300 group-focus-within:scale-110 group-focus-within:text-primary">
                  <User className="size-5 text-base-content/50 transition-colors duration-300" />
                </div>
                <input
                  type="text"
                  autoComplete="name"
                  className={`input input-bordered w-full pl-12 pr-4 py-4 h-12
                  transition-all duration-300 border-2 bg-base-100/80 backdrop-blur-sm
                  focus:ring-2 focus:ring-primary/30 focus:border-primary
                  hover:border-base-content/40 rounded-xl
                  transform focus:translate-y-[-2px] focus:shadow-lg ${errors.fullName ? "input-error" : ""}`}
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
                <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-primary to-primary/70 transition-all duration-500 group-focus-within:w-full group-focus-within:left-0"></div>
              </div>
              {errors.fullName && <span className="text-error text-sm mt-1">{errors.fullName}</span>}
            </div>

            {/* Email Input */}
            <div
              className={`form-control space-y-2 transform transition-all duration-700 delay-200 ${
                mounted ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'
              }`}
            >
              <label className="label pb-2">
                <span className="label-text font-semibold text-base">Email</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-all duration-300 group-focus-within:scale-110 group-focus-within:text-primary">
                  <Mail className="size-5 text-base-content/50 transition-colors duration-300" />
                </div>
                <input
                  type="email"
                  autoComplete="email"
                  className={`input input-bordered w-full pl-12 pr-4 py-4 h-12
                  transition-all duration-300 border-2 bg-base-100/80 backdrop-blur-sm
                  focus:ring-2 focus:ring-primary/30 focus:border-primary
                  hover:border-base-content/40 rounded-xl
                  transform focus:translate-y-[-2px] focus:shadow-lg ${errors.email ? "input-error" : ""}`}
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-primary to-primary/70 transition-all duration-500 group-focus-within:w-full group-focus-within:left-0"></div>
              </div>
              {errors.email && <span className="text-error text-sm mt-1">{errors.email}</span>}
            </div>

            {/* Password Input */}
            <div
              className={`form-control space-y-2 transform transition-all duration-700 delay-300 ${
                mounted ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'
              }`}
            >
              <label className="label pb-2">
                <span className="label-text font-semibold text-base">Password</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-all duration-300 group-focus-within:scale-110 group-focus-within:text-primary">
                  <Lock className="size-5 text-base-content/50 transition-colors duration-300" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  className={`input input-bordered w-full pl-12 pr-12 py-4 h-12
                  transition-all duration-300 border-2 bg-base-100/80 backdrop-blur-sm
                  focus:ring-2 focus:ring-primary/30 focus:border-primary
                  hover:border-base-content/40 rounded-xl
                  transform focus:translate-y-[-2px] focus:shadow-lg ${errors.password ? "input-error" : ""}`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center
                  transition-all duration-300 hover:scale-110 active:scale-95
                  hover:text-primary"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="size-5 text-base-content/60 transition-all duration-300" />
                  ) : (
                    <Eye className="size-5 text-base-content/60 transition-all duration-300" />
                  )}
                </button>
                <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-primary to-primary/70 transition-all duration-500 group-focus-within:w-full group-focus-within:left-0"></div>
              </div>
              {errors.password && <span className="text-error text-sm mt-1">{errors.password}</span>}
            </div>

            {/* Submit Button */}
            <div
              className={`transform transition-all duration-700 delay-500 ${
                mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}
            >
              <button
                type="submit"
                className="btn w-full h-14 text-lg font-semibold rounded-xl
                transition-all duration-500 
                transform hover:scale-[1.02] active:scale-[0.98] 
                hover:shadow-2xl hover:shadow-primary/30
                bg-gradient-to-r from-primary to-primary/90
                border-none text-white
                disabled:hover:scale-100 disabled:active:scale-100
                group relative overflow-hidden"
                disabled={isSigningUp}
              >
                <span className="relative z-10 transition-all duration-300 group-hover:tracking-wide">
                  {isSigningUp ? (
                    <div className="flex items-center gap-3">
                      <Loader2 className="size-5 animate-spin" />
                      Creating Your Account...
                    </div>
                  ) : (
                    "Create Account"
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary transition-all duration-500 transform -translate-x-full group-hover:translate-x-0 opacity-90"></div>
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white/30 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              </button>
            </div>
          </form>

          {/* Sign In Link */}
          <div
            className={`text-center pt-8 border-t border-base-300/50 transform transition-all duration-700 delay-700 ${
              mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
          >
            <p className="text-base-content/70 transition-all duration-300">
              Already have an account?{" "}
              <Link
                to="/login"
                rel="noopener noreferrer"
                className="link link-primary font-semibold transition-all duration-300 
                hover:underline-offset-4 transform inline-block
                hover:translate-x-1 hover:tracking-wide bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent"
              >
                Sign in now
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* right side */}
      <AuthImagePattern
        title="Join our community"
        subtitle="Connect with friends, share moments, and stay in touch with your loved ones."
      />
    </div>
  );
};

export default SignUpPage;
