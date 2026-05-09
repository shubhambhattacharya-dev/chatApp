import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare, User } from "lucide-react";
import { Link } from "react-router-dom";
import AuthImagePattern from "../components/AuthImagePattern";
import { motion } from "framer-motion";

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<any>({});

  const { signup, isSigningUp } = useAuthStore();

  const validateForm = () => {
    const newErrors: any = {};
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    signup(formData);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left Side */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12 bg-base-100">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md space-y-8"
        >
          {/* Logo */}
          <motion.div variants={itemVariants} className="text-center mb-12">
            <div className="flex flex-col items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.1, rotate: -5 }}
                className="size-16 rounded-2xl bg-primary/10 
                flex items-center justify-center shadow-lg shadow-primary/10
                transition-colors hover:bg-primary/20 cursor-pointer group"
              >
                <MessageSquare className="size-8 text-primary transition-transform group-hover:scale-110" />
              </motion.div>
              <h1 className="text-4xl font-extrabold mt-4 tracking-tight">Create Account</h1>
              <p className="text-base-content/60 text-lg font-medium">Get started with your free account</p>
            </div>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <motion.div variants={itemVariants} className="form-control">
              <label className="label">
                <span className="label-text font-bold">Full Name</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-all group-focus-within:text-primary group-focus-within:scale-110">
                  <User className="size-5 text-base-content/40" />
                </div>
                <input
                  type="text"
                  autoComplete="name"
                  className={`input input-bordered w-full pl-12 h-12 rounded-xl transition-all
                  focus:ring-2 focus:ring-primary/20 bg-base-100/50 backdrop-blur-sm
                  ${errors.fullName ? "input-error" : "hover:border-primary/50"}`}
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>
              {errors.fullName && <span className="text-error text-sm mt-1 ml-1">{errors.fullName}</span>}
            </motion.div>

            {/* Email */}
            <motion.div variants={itemVariants} className="form-control">
              <label className="label">
                <span className="label-text font-bold">Email Address</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-all group-focus-within:text-primary group-focus-within:scale-110">
                  <Mail className="size-5 text-base-content/40" />
                </div>
                <input
                  type="email"
                  autoComplete="email"
                  className={`input input-bordered w-full pl-12 h-12 rounded-xl transition-all
                  focus:ring-2 focus:ring-primary/20 bg-base-100/50 backdrop-blur-sm
                  ${errors.email ? "input-error" : "hover:border-primary/50"}`}
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              {errors.email && <span className="text-error text-sm mt-1 ml-1">{errors.email}</span>}
            </motion.div>

            {/* Password */}
            <motion.div variants={itemVariants} className="form-control">
              <label className="label">
                <span className="label-text font-bold">Password</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-all group-focus-within:text-primary group-focus-within:scale-110">
                  <Lock className="size-5 text-base-content/40" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  className={`input input-bordered w-full pl-12 pr-12 h-12 rounded-xl transition-all
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
                    <EyeOff className="size-5 text-base-content/40" />
                  ) : (
                    <Eye className="size-5 text-base-content/40" />
                  )}
                </button>
              </div>
              {errors.password && <span className="text-error text-sm mt-1 ml-1">{errors.password}</span>}
            </motion.div>

            {/* Submit */}
            <motion.div variants={itemVariants} className="pt-2">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                className="btn btn-primary w-full h-12 text-lg font-bold rounded-xl shadow-lg shadow-primary/20 border-none
                bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary"
                disabled={isSigningUp}
              >
                {isSigningUp ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="size-5 animate-spin" />
                    <span>Creating account...</span>
                  </div>
                ) : (
                  "Create Account"
                )}
              </motion.button>
            </motion.div>
          </form>

          {/* Footer */}
          <motion.div variants={itemVariants} className="text-center pt-6 border-t border-base-200">
            <p className="text-base-content/60">
              Already have an account?{" "}
              <Link
                to="/login"
                className="link link-primary font-bold no-underline hover:underline underline-offset-4 transition-all"
              >
                Sign in
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Right Side */}
      <AuthImagePattern
        title="Join our community"
        subtitle="Connect with friends, share moments, and stay in touch with your loved ones."
        variant="morphing"
        theme="ocean"
      />
    </div>
  );
};

export default SignUpPage;
