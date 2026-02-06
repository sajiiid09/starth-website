
import React, { useState, useEffect, useCallback } from "react";
import { User } from "@/api/entities";
import ActivateRoleScreen from "./ActivateRoleScreen";
import { SpinnerGap } from "@phosphor-icons/react";

export default function RoleGuard({ children, requiredRole }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasRole, setHasRole] = useState(false);

  const checkUserRole = useCallback(async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      const userRoles = currentUser.roles || ['organizer'];
      const hasRequiredRole = userRoles.includes(requiredRole);
      setHasRole(hasRequiredRole);
      setLoading(false);
    } catch (error) {
      // Handle 401 (unauthorized) - user not logged in
      if (error.message?.includes('401') || error.response?.status === 401) {
        console.log("RoleGuard: User not authenticated, redirecting to login");
        // Store current URL for post-login redirect
        localStorage.setItem('postLoginRedirect', window.location.pathname + window.location.search);
        // Direct redirect to login endpoint
        window.location.href = '/api/auth/login';
        return;
      }
      
      console.error("RoleGuard auth check failed:", error);
      // For other errors, still try to redirect to login
      localStorage.setItem('postLoginRedirect', window.location.pathname + window.location.search);
      window.location.href = '/api/auth/login';
    }
  }, [requiredRole]);

  useEffect(() => {
    checkUserRole();
  }, [checkUserRole]);

  const handleRoleActivated = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      const userRoles = currentUser.roles || ['organizer'];
      const hasRequiredRole = userRoles.includes(requiredRole);
      setHasRole(hasRequiredRole);
    } catch (error) {
      console.error("Error refreshing user data:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <SpinnerGap className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!hasRole) {
    return (
      <ActivateRoleScreen 
        user={user} 
        requiredRole={requiredRole}
        onRoleActivated={handleRoleActivated}
      />
    );
  }

  return children;
}
