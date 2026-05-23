import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, User, ShieldAlert, ArrowRight, Loader2, Sparkles } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, connectGoogle, token } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If user is already authenticated, redirect them to dashboard
    if (token) {
      navigate("/");
    }

    // Check for callback errors in query parameters
    const params = new URLSearchParams(location.search);
    const errorParam = params.get("error");
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }
  }, [token, navigate, location]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); // Clear error on edit
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!formData.email || !formData.password || (!isLogin && !formData.name)) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    let result;
    if (isLogin) {
      result = await login(formData.email, formData.password);
    } else {
      result = await register(formData.name, formData.email, formData.password);
    }

    if (result && result.success) {
      navigate("/");
    } else {
      setError(result?.message || "Authentication failed.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#070a13] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative ambient background gradients */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-blue-500/10 blur-[80px]"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-indigo-600/10 blur-[100px]"></div>

      <div className="w-full max-w-md bg-[#0f172a]/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-xs font-semibold tracking-wide mb-3 border border-blue-500/20">
            <Sparkles className="h-3 w-3" />
            <span>SmartMail AI</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            {isLogin ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-gray-400 mt-2 text-sm">
            {isLogin
              ? "Sign in to manage your AI email assistant"
              : "Start organizing your inbox automatically"}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm flex items-start space-x-2 animate-shake">
            <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name Field (Sign Up Only) */}
          {!isLogin && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                  <User className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full bg-[#1e293b]/40 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-gray-500 text-sm outline-none transition-all"
                  required
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full bg-[#1e293b]/40 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-gray-500 text-sm outline-none transition-all"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-[#1e293b]/40 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-gray-500 text-sm outline-none transition-all"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg py-2.5 flex items-center justify-center space-x-2 text-sm transition-all focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#070a13] disabled:opacity-50 cursor-pointer shadow-lg shadow-blue-600/10"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <span>{isLogin ? "Sign In" : "Sign Up"}</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#0f172a] px-3 text-gray-500 font-semibold tracking-wider">
              Or continue with
            </span>
          </div>
        </div>

        {/* Google OAuth Button */}
        <button
          onClick={connectGoogle}
          className="w-full bg-white hover:bg-gray-100 text-gray-900 font-medium rounded-lg py-2.5 flex items-center justify-center space-x-2 text-sm transition-all focus:ring-2 focus:ring-gray-300 cursor-pointer"
        >
          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <g transform="matrix(1, 0, 0, 1, 0, 0)">
              <path d="M21.35,11.1H12v2.7h5.38C16.88,15.22,14.73,16.5,12,16.5c-3.03,0-5.61-2.05-6.53-4.82C5.17,10.79,5,9.91,5,9c0-0.91,0.17-1.79,0.47-2.68c0.92-2.77,3.5-4.82,6.53-4.82c1.64,0,3.13,0.6,4.29,1.59L18.42,1.2C16.69,0.45,14.47,0,12,0C7.35,0,3.37,2.83,1.6,6.93C1.07,8.18,0.78,9.55,0.78,11c0,1.45,0.29,2.82,0.82,4.07c1.77,4.1,5.75,6.93,10.4,6.93c3.12,0,5.73-1.04,7.64-2.83c2.09-1.95,3.35-4.83,3.35-8.23C23,12.1,22.84,11.59,21.35,11.1z" fill="#4285F4" />
              <path d="M1.6,6.93c0.53,1.25,0.82,2.62,0.82,4.07c0,1.45-0.29,2.82-0.82,4.07L1.6,6.93z" fill="#FBBC05" />
              <path d="M12,22c-4.65,0-8.63-2.83-10.4-6.93l3.52-2.91C6.04,15.18,8.81,17,12,17c3.12,0,5.73-1.04,7.64-2.83l3.35,8.23C20.63,20.96,16.65,22,12,22z" fill="#34A853" />
              <path d="M21.35,11.1H12v2.7h5.38C16.88,15.22,14.73,16.5,12,16.5c-3.03,0-5.61-2.05-6.53-4.82l-3.52,2.91C3.37,19.17,7.35,22,12,22c4.65,0,8.63-2.83,10.4-6.93L21.35,11.1z" fill="#EA4335" />
            </g>
          </svg>
          <span>Sign In with Google</span>
        </button>

        {/* Toggle Mode */}
        <div className="mt-8 text-center text-sm">
          <p className="text-gray-400">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              className="text-blue-400 hover:text-blue-300 font-semibold transition-colors cursor-pointer"
            >
              {isLogin ? "Sign up now" : "Sign in here"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
