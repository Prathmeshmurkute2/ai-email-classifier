import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

const OAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { handleOAuthSuccess } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const name = params.get("name");
    const email = params.get("email");
    const error = params.get("error");

    if (error) {
      console.error("OAuth error redirect:", error);
      navigate("/auth?error=" + encodeURIComponent(error));
      return;
    }

    if (token && name && email) {
      handleOAuthSuccess(token, name, email);
      // Wait a moment for state to sync and navigate home
      setTimeout(() => {
        navigate("/");
      }, 500);
    } else {
      navigate("/auth?error=invalid_callback_params");
    }
  }, [location, navigate, handleOAuthSuccess]);

  return (
    <div className="min-h-screen bg-[#0b0f19] flex flex-col items-center justify-center text-white">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
        <h2 className="text-xl font-medium">Connecting your Gmail account...</h2>
        <p className="text-gray-400 text-sm">Please do not close this window.</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
