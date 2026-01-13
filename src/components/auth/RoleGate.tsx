import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { AppRole, getCurrentRole, getRoleHomePath, setCurrentRole } from "@/utils/role";
import { getSessionState, getVendorOnboardingPath } from "@/utils/session";

const isDev = import.meta.env.MODE !== "production";

type RoleGateProps = {
  allowedRoles: AppRole[];
  children: React.ReactNode;
};

const RoleGate: React.FC<RoleGateProps> = ({ allowedRoles, children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const devRole = params.get("as");

    if (isDev && devRole === "admin") {
      setCurrentRole("admin");
      navigate("/admin", { replace: true });
      return;
    }

    const role = getCurrentRole();
    if (!role) {
      navigate("/appentry", { replace: true, state: { from: location.pathname } });
      return;
    }

    if (!allowedRoles.includes(role)) {
      toast.error("You don't have access to that dashboard.");
      navigate(getRoleHomePath(role), { replace: true });
      return;
    }

    if (role === "vendor") {
      const session = getSessionState();
      const onboardingPath = getVendorOnboardingPath(session.vendorType);
      const isOnboardingRoute = location.pathname.startsWith("/vendor/onboarding");
      const isProfileRoute = location.pathname.startsWith("/vendor/profile");
      const isSubmissionRoute = location.pathname.startsWith("/vendor/submission");

      if (!session.vendorType) {
        navigate("/vendor/onboarding/select", { replace: true });
        return;
      }

      if (
        session.vendorOnboardingStatus !== "approved" &&
        !isOnboardingRoute &&
        !isProfileRoute &&
        !isSubmissionRoute
      ) {
        navigate(onboardingPath, { replace: true });
        return;
      }
    }

    setIsReady(true);
  }, [allowedRoles, location.pathname, location.search, navigate]);

  if (!isReady) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand-dark/50" />
      </div>
    );
  }

  return <>{children}</>;
};

export default RoleGate;
