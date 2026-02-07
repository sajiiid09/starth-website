import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { SpinnerGap, Users, Briefcase, ArrowRight, CheckCircle, Eye, EyeSlash } from "@phosphor-icons/react";
import { toast } from "sonner";
import { createPageUrl } from "@/utils";
import { AppRole, getRoleHomePath, setCurrentRole } from "@/utils/role";
import {
  getSessionState,
  getVendorOnboardingPath,
  resetVendorSession,
  setVendorOnboardingStatus,
  setVendorType,
  updateVendorProfileDraft,
  type VendorType
} from "@/utils/session";
import { User } from "@/api/entities";
import { authLogin, authRegister } from "@/api/functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  serviceAreaOptions,
  serviceCategoryOptions
} from "@/data/vendorOnboardingOptions";
import {
  clearPendingPlannerIntent,
  getPendingPlannerIntent
} from "@/utils/pendingIntent";

// --- Configuration ---
const roleOptions = [
  {
    id: "user",
    title: "I’m an Organizer",
    description: "Plan events, manage vendors, and launch faster.",
    icon: Users
  },
  {
    id: "vendor",
    title: "I’m a Vendor",
    description: "Showcase services, win leads, and manage bookings.",
    icon: Briefcase
  }
] as const;

type RoleOptionId = (typeof roleOptions)[number]["id"];
type AuthView = "role" | "signup" | "login";
const ORGANIZER_AI_PLANNER_ROUTE = "/dashboard/ai-planner";

function getPostAuthRedirectPath(role: AppRole): string {
  if (role === "user") return ORGANIZER_AI_PLANNER_ROUTE;
  return getRoleHomePath(role);
}

// --- Components ---

type SignUpFormProps = {
  selectedRole: RoleOptionId | null;
  vendorType: VendorType | null;
  onSignUpSuccess: () => void;
};

function SignUpForm({
  selectedRole,
  vendorType,
  onSignUpSuccess
}: SignUpFormProps): React.ReactElement {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const roleValue =
    selectedRole === "vendor" ? vendorType ?? "service_provider" : "organizer";
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: ""
  });
  const [venueDetails, setVenueDetails] = useState({
    sqft: "",
    location: ""
  });
  const [serviceCategories, setServiceCategories] = useState<string[]>([]);
  const [serviceAreas, setServiceAreas] = useState<string[]>([]);

  const isVenueOwner = selectedRole === "vendor" && vendorType === "venue_owner";
  const isServiceProvider =
    selectedRole === "vendor" && vendorType === "service_provider";

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleMultiValue = (values: string[], value: string) =>
    values.includes(value) ? values.filter((item) => item !== value) : [...values, value];

  const vendorFieldsValid = useMemo(() => {
    if (isVenueOwner) {
      return (
        venueDetails.location.trim().length > 0 &&
        Number(venueDetails.sqft) > 0
      );
    }
    if (isServiceProvider) {
      return serviceCategories.length > 0 && serviceAreas.length > 0;
    }
    return true;
  }, [
    isServiceProvider,
    isVenueOwner,
    serviceAreas.length,
    serviceCategories.length,
    venueDetails.location,
    venueDetails.sqft
  ]);

  const validateVendorFields = () => {
    const nextErrors: Record<string, string> = {};
    if (isVenueOwner) {
      if (!venueDetails.location.trim()) {
        nextErrors.venueLocation = "Venue location is required.";
      }
      if (!venueDetails.sqft || Number(venueDetails.sqft) <= 0) {
        nextErrors.venueSqft = "Square footage must be greater than 0.";
      }
    }
    if (isServiceProvider) {
      if (serviceCategories.length === 0) {
        nextErrors.serviceCategories = "Select at least one category.";
      }
      if (serviceAreas.length === 0) {
        nextErrors.serviceAreas = "Select at least one coverage area.";
      }
    }
    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if ((isVenueOwner || isServiceProvider) && !validateVendorFields()) {
      return;
    }
    setLoading(true);

    try {
      const { data } = await authRegister({
        email: formData.email,
        password: formData.password,
        full_name: formData.fullName,
        phone: formData.phone,
        role: roleValue
      });

      if (data.success) {
        toast.success("Account created! Please check your email to verify your account.", {
          duration: 5000
        });
        if (selectedRole === "vendor") {
          setCurrentRole("vendor");
          setVendorType(roleValue as VendorType);
          setVendorOnboardingStatus("draft");
          const existingDraft = getSessionState().vendorProfileDraft as Record<
            string,
            unknown
          >;
          const nextDraft = {
            ...existingDraft,
            vendorType: roleValue as VendorType
          } as Record<string, unknown>;

          if (roleValue === "venue_owner") {
            nextDraft.venueOwner = {
              ...(existingDraft as any)?.venueOwner,
              basics: {
                ...((existingDraft as any)?.venueOwner?.basics ?? {}),
                location: venueDetails.location.trim()
              },
              space: {
                ...((existingDraft as any)?.venueOwner?.space ?? {}),
                sqft: venueDetails.sqft
              }
            };
          }

          if (roleValue === "service_provider") {
            nextDraft.serviceProvider = {
              ...(existingDraft as any)?.serviceProvider,
              services: serviceCategories,
              identity: {
                ...((existingDraft as any)?.serviceProvider?.identity ?? {}),
                coverageAreas: serviceAreas
              }
            };
          }

          updateVendorProfileDraft(nextDraft);
        }
        onSignUpSuccess();
      }
    } catch (error: any) {
      console.error("Sign up error:", error);
      toast.error(error.response?.data?.error || "Registration failed. Please try again.");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="fullName" className="text-xs font-semibold uppercase tracking-wider text-brand-dark/60">Full Name</Label>
          <Input
            id="fullName"
            placeholder="Jane Doe"
            required
            className="h-12 border-brand-dark/10 bg-white/60 text-base focus:border-brand-teal focus:ring-brand-teal/20"
            value={formData.fullName}
            onChange={(e) => handleInputChange("fullName", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="signupEmail" className="text-xs font-semibold uppercase tracking-wider text-brand-dark/60">Email Address</Label>
          <Input
            id="signupEmail"
            type="email"
            placeholder="name@company.com"
            required
            className="h-12 border-brand-dark/10 bg-white/60 text-base focus:border-brand-teal focus:ring-brand-teal/20"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="signupPassword" className="text-xs font-semibold uppercase tracking-wider text-brand-dark/60">Password</Label>
          <div className="relative">
            <Input
              id="signupPassword"
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              className="h-12 border-brand-dark/10 bg-white/60 text-base focus:border-brand-teal focus:ring-brand-teal/20 pr-10"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-dark/40 hover:text-brand-dark transition-colors"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeSlash className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wider text-brand-dark/60">Phone</Label>
          <Input
            id="phone"
            type="tel"
            required
            placeholder="+1 (555) 000-0000"
            className="h-12 border-brand-dark/10 bg-white/60 text-base focus:border-brand-teal focus:ring-brand-teal/20"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
          />
        </div>
      </div>

      {(isVenueOwner || isServiceProvider) && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="overflow-hidden rounded-xl border border-brand-teal/20 bg-brand-teal/5 p-5"
        >
          <div className="mb-4">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand-teal">
              <SparklesIcon className="h-3 w-3" />
              Additional details
            </p>
            <p className="mt-1 text-sm text-brand-dark/70">
              {isVenueOwner
                ? "Help us match your venue to optimal blueprints."
                : "Help us match you to relevant event stacks."}
            </p>
          </div>
          {isVenueOwner && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="venueSqft" className="text-xs text-brand-dark/60">Square Footage</Label>
                <Input
                  id="venueSqft"
                  type="number"
                  min="1"
                  placeholder="e.g. 5000"
                  className="h-10 bg-white"
                  value={venueDetails.sqft}
                  onChange={(e) =>
                    setVenueDetails((prev) => ({ ...prev, sqft: e.target.value }))
                  }
                />
                {fieldErrors.venueSqft && (
                  <p className="text-xs font-medium text-red-500">{fieldErrors.venueSqft}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="venueLocation" className="text-xs text-brand-dark/60">Location</Label>
                <Input
                  id="venueLocation"
                  placeholder="e.g. Seaport District"
                  className="h-10 bg-white"
                  value={venueDetails.location}
                  onChange={(e) =>
                    setVenueDetails((prev) => ({ ...prev, location: e.target.value }))
                  }
                />
                {fieldErrors.venueLocation && (
                  <p className="text-xs font-medium text-red-500">{fieldErrors.venueLocation}</p>
                )}
              </div>
            </div>
          )}
          {isServiceProvider && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="text-xs text-brand-dark/60">Service Categories</Label>
                <div className="flex flex-wrap gap-2">
                  {serviceCategoryOptions.map((category) => {
                    const isSelected = serviceCategories.includes(category);
                    return (
                      <button
                        key={category}
                        type="button"
                        className={cn(
                          "rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all duration-200",
                          isSelected
                            ? "border-brand-dark bg-brand-dark text-white shadow-md"
                            : "border-brand-dark/10 bg-white text-brand-dark/60 hover:border-brand-dark/30"
                        )}
                        onClick={() =>
                          setServiceCategories((prev) => toggleMultiValue(prev, category))
                        }
                      >
                        {category}
                      </button>
                    );
                  })}
                </div>
                {fieldErrors.serviceCategories && (
                  <p className="text-xs font-medium text-red-500">
                    {fieldErrors.serviceCategories}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-brand-dark/60">Service Areas</Label>
                <div className="flex flex-wrap gap-2">
                  {serviceAreaOptions.map((area) => {
                    const isSelected = serviceAreas.includes(area);
                    return (
                      <button
                        key={area}
                        type="button"
                        className={cn(
                          "rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all duration-200",
                          isSelected
                            ? "border-brand-dark bg-brand-dark text-white shadow-md"
                            : "border-brand-dark/10 bg-white text-brand-dark/60 hover:border-brand-dark/30"
                        )}
                        onClick={() => setServiceAreas((prev) => toggleMultiValue(prev, area))}
                      >
                        {area}
                      </button>
                    );
                  })}
                </div>
                {fieldErrors.serviceAreas && (
                  <p className="text-xs font-medium text-red-500">{fieldErrors.serviceAreas}</p>
                )}
              </div>
            </div>
          )}
        </motion.div>
      )}
      <Button
        type="submit"
        className="group mt-2 w-full rounded-full bg-brand-teal py-6 text-base font-semibold text-white shadow-lg transition-all hover:bg-brand-dark hover:shadow-xl hover:translate-y-[-1px]"
        disabled={loading || (selectedRole === "vendor" && !vendorFieldsValid)}
      >
        {loading ? (
          <SpinnerGap className="h-5 w-5 animate-spin" />
        ) : (
          <span className="flex items-center gap-2">
            Create Account <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        )}
      </Button>
    </form>
  );
}

type LoginFormProps = {
  onLoginSuccess: (role: AppRole) => void;
};

function LoginForm({ onLoginSuccess }: LoginFormProps): React.ReactElement {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const { data } = await authLogin({
        email: formData.email,
        password: formData.password
      });

      if (data?.user) {
        sessionStorage.setItem("currentUser", JSON.stringify(data.user));
        const userRoles = data.user.roles || ["organizer"];
        let nextRole: AppRole = "user";
        if (userRoles.includes("admin")) {
          nextRole = "admin";
        } else if (userRoles.includes("service_provider") || userRoles.includes("venue_owner")) {
          nextRole = "vendor";
        }
        setCurrentRole(nextRole);
        if (nextRole === "vendor") {
          const derivedVendorType = userRoles.includes("venue_owner")
            ? "venue_owner"
            : "service_provider";
          setVendorType(derivedVendorType);
          setVendorOnboardingStatus(
            getSessionState().vendorOnboardingStatus ?? "draft"
          );
          const onboardingPath = getVendorOnboardingPath(derivedVendorType);
          const needsOnboarding =
            getSessionState().vendorOnboardingStatus !== "approved";
          window.location.href = needsOnboarding
            ? onboardingPath
            : getRoleHomePath(nextRole);
          return;
        }
        onLoginSuccess(nextRole);
        return;
      }

      toast.error("Login failed. Please try again.");
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.response?.data?.error || "Login failed. Please try again.");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="loginEmail" className="text-xs font-semibold uppercase tracking-wider text-brand-dark/60">Email</Label>
        <Input
          id="loginEmail"
          type="email"
          placeholder="name@company.com"
          required
          className="h-12 border-brand-dark/10 bg-white/60 text-base focus:border-brand-teal focus:ring-brand-teal/20"
          value={formData.email}
          onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
        />
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="loginPassword" className="text-xs font-semibold uppercase tracking-wider text-brand-dark/60">Password</Label>
          <button
            type="button"
            className="text-xs font-medium text-brand-teal hover:text-brand-dark transition-colors"
            onClick={() => navigate("/forgotpassword")}
          >
            Forgot?
          </button>
        </div>
        <div className="relative">
          <Input
            id="loginPassword"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            required
            className="h-12 border-brand-dark/10 bg-white/60 text-base focus:border-brand-teal focus:ring-brand-teal/20 pr-10"
            value={formData.password}
            onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-dark/40 hover:text-brand-dark transition-colors"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeSlash className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>
      <Button
        type="submit"
        className="group w-full rounded-full bg-brand-teal py-6 text-base font-semibold text-white shadow-lg transition-all hover:bg-brand-dark hover:shadow-xl hover:translate-y-[-1px]"
        disabled={loading}
      >
        {loading ? (
          <SpinnerGap className="h-5 w-5 animate-spin" />
        ) : (
          <span className="flex items-center gap-2">
            Log In <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        )}
      </Button>
    </form>
  );
}

// Simple Icon for decoration
function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  )
}

export default function AppEntryPage() {
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<AuthView>("role");
  const [selectedRole, setSelectedRole] = useState<RoleOptionId | null>(null);
  const [vendorType, setVendorTypeState] = useState<VendorType | null>(null);
  const navigate = useNavigate();

  const roleLabel = useMemo(() => {
    if (!selectedRole) return "";
    return selectedRole === "vendor" ? "Vendor" : "User";
  }, [selectedRole]);

  const handlePendingPlannerRedirect = (role: AppRole) => {
    if (role !== "user") {
      return false;
    }

    const pendingIntent = getPendingPlannerIntent();
    if (pendingIntent?.returnPath) {
      clearPendingPlannerIntent();
      navigate(pendingIntent.returnPath, { replace: true });
      return true;
    }

    return false;
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const user = await User.me() as { roles?: string[]; [key: string]: unknown } | null;
        if (user) {
          sessionStorage.setItem("currentUser", JSON.stringify(user));
          const userRoles = user.roles || ["organizer"];
          let nextRole: AppRole = "user";
          if (userRoles.includes("admin")) {
            nextRole = "admin";
          } else if (userRoles.includes("service_provider") || userRoles.includes("venue_owner")) {
            nextRole = "vendor";
          }
          setCurrentRole(nextRole);
          if (nextRole === "vendor") {
            const derivedVendorType = userRoles.includes("venue_owner")
              ? "venue_owner"
              : "service_provider";
            setVendorType(derivedVendorType);
            setVendorOnboardingStatus(
              getSessionState().vendorOnboardingStatus ?? "draft"
            );
            const onboardingPath = getVendorOnboardingPath(derivedVendorType);
            const needsOnboarding =
              getSessionState().vendorOnboardingStatus !== "approved";
            window.location.href = needsOnboarding
              ? onboardingPath
              : getRoleHomePath(nextRole);
            return;
          }
          if (!handlePendingPlannerRedirect(nextRole)) {
            navigate(getPostAuthRedirectPath(nextRole), { replace: true });
          }
          return;
        }
      } catch (error) {
        // Not logged in, show login screen
      }
      setLoading(false);
    };
    checkSession();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-brand-light">
        <SpinnerGap className="w-8 h-8 text-brand-dark/40 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-brand-dark">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-5 lg:px-12 backdrop-blur-sm bg-white/50 border-b border-brand-dark/5">
        <Link to={createPageUrl("Home")}>
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68d4e38c341adad3b24950ed/ddf404508_Elegant_Simple_Aesthetic_Real_Estate_Logo__1_-removebg-preview.png" 
            alt="Strathwell" 
            className="h-16 w-auto sm:h-20 md:h-[72px]"
          />
        </Link>
        <div className="hidden sm:flex items-center gap-3">
          <Button
            variant="ghost"
            className="rounded-full text-sm font-medium text-brand-dark/70 hover:text-brand-dark hover:bg-brand-dark/5"
            onClick={() => setActiveView("login")}
          >
            Log in
          </Button>
          <Button
            className="rounded-full bg-brand-dark px-6 py-2 text-sm font-semibold text-brand-light shadow-md transition-all hover:bg-brand-dark/90 hover:shadow-lg hover:translate-y-[-1px]"
            onClick={() => {
              if (!selectedRole) {
                setActiveView("role");
                return;
              }
              if (selectedRole === "vendor" && !vendorType) {
                setActiveView("role");
                return;
              }
              setActiveView("signup");
            }}
          >
            Create account
          </Button>
        </div>
      </header>

      {/* Main Layout */}
      {/* Main Layout */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#F8F7F4] pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        
        {/* Background "Strathwell" Text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <h1 className="font-serif text-[18vw] leading-none text-brand-teal opacity-[0.06] tracking-tighter whitespace-nowrap">Strathwell</h1>
        </div>

        {/* Form Container */}
        <div className="relative z-10 w-full max-w-[440px]">
            <AnimatePresence mode="wait">
              {activeView === "role" && (
                <motion.div
                  key="role"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="space-y-8"
                >
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-teal">
                      Get Started
                    </p>
                    <h2 className="text-4xl font-semibold tracking-tight text-brand-dark">
                      Choose your path
                    </h2>
                    <p className="text-base text-brand-dark/60">
                      Select your primary role to customize your workspace.
                    </p>
                  </div>
                  
                  <div className="grid gap-4">
                    {roleOptions.map((option) => {
                      const Icon = option.icon;
                      const isSelected = selectedRole === option.id;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          className={cn(
                            "group relative flex w-full items-start gap-5 rounded-2xl border bg-white p-5 text-left shadow-sm transition-all duration-300",
                            "hover:-translate-y-1 hover:shadow-md hover:border-brand-teal/50",
                            isSelected 
                              ? "border-brand-teal ring-1 ring-brand-teal bg-brand-teal/5" 
                              : "border-brand-dark/5"
                          )}
                          onClick={() => {
                            setSelectedRole(option.id);
                            setCurrentRole(option.id === "vendor" ? "vendor" : "user");
                            if (option.id === "vendor") {
                              setVendorTypeState(null);
                              resetVendorSession();
                              // Keep viewing role to show subtypes
                            } else {
                              setActiveView("signup");
                            }
                          }}
                        >
                          <span className={cn(
                            "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl transition-colors duration-300",
                            isSelected ? "bg-brand-teal text-white" : "bg-brand-dark/5 text-brand-dark group-hover:bg-brand-teal/10 group-hover:text-brand-teal"
                          )}>
                            <Icon className="h-6 w-6" />
                          </span>
                          <span className="flex-1 space-y-1">
                            <span className="flex items-center justify-between">
                              <span className="block text-base font-semibold text-brand-dark">
                                {option.title}
                              </span>
                              {isSelected && <CheckCircle className="h-5 w-5 text-brand-teal" />}
                            </span>
                            <span className="block text-sm text-brand-dark/60 leading-relaxed">
                              {option.description}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {selectedRole === "vendor" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="mt-6 space-y-4 overflow-hidden rounded-2xl border border-brand-teal/20 bg-white/50 p-6 backdrop-blur-sm"
                    >
                      <div className="space-y-1">
                        <h3 className="text-sm font-semibold text-brand-dark">
                          Select Vendor Type
                        </h3>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          {
                            id: "venue_owner",
                            title: "Venue Owner",
                            icon: Users
                          },
                          {
                            id: "service_provider",
                            title: "Service Provider",
                            icon: Briefcase
                          }
                        ].map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            className={cn(
                              "flex flex-col items-center justify-center gap-3 rounded-xl border p-4 text-center transition-all duration-200",
                              "hover:border-brand-teal/50 hover:bg-white hover:shadow-sm",
                              vendorType === option.id 
                                ? "border-brand-teal bg-white ring-1 ring-brand-teal" 
                                : "border-transparent bg-white/60"
                            )}
                            onClick={() => {
                              const chosenType = option.id as VendorType;
                              setVendorTypeState(chosenType);
                              setVendorType(chosenType);
                              setVendorOnboardingStatus("draft");
                              setActiveView("signup");
                            }}
                          >
                            <span className="text-sm font-medium text-brand-dark">{option.title}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {activeView !== "role" && (
                <motion.div
                  key="auth"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="space-y-8"
                >
                  <div className="space-y-2">
                    <button
                      type="button"
                      className="group flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand-dark/40 hover:text-brand-teal transition-colors"
                      onClick={() => {
                        if (activeView === "signup") setActiveView("role");
                        else setActiveView("signup"); // Back to sign up from login
                      }}
                    >
                      <ArrowRight className="h-3 w-3 rotate-180 group-hover:-translate-x-1 transition-transform" />
                      Back
                    </button>
                    <h2 className="text-3xl font-semibold tracking-tight text-brand-dark">
                      {activeView === "login" ? "Welcome back" : "Create your account"}
                    </h2>
                    {activeView === "signup" && selectedRole && (
                      <p className="text-sm text-brand-dark/60">
                        You are registering as a <span className="font-semibold text-brand-teal">{roleLabel}</span>
                        {selectedRole === "vendor" && vendorType
                          ? ` (${vendorType === "venue_owner" ? "Venue Owner" : "Service Provider"})`
                          : ""}.
                      </p>
                    )}
                  </div>

                  {/* Form Card */}
                  <div className="rounded-3xl border border-white/60 bg-white/80 p-1 shadow-2xl shadow-brand-dark/5 backdrop-blur-xl">
                    <div className="rounded-[20px] border border-brand-dark/5 bg-white/50 p-6 sm:p-8">
                      {activeView === "signup" ? (
                        <SignUpForm
                          selectedRole={selectedRole}
                          vendorType={vendorType}
                          onSignUpSuccess={() => {
                            toast.success("Account created! Check your email to verify.");
                            if (selectedRole === "vendor") {
                              navigate(getVendorOnboardingPath(vendorType));
                              return;
                            }
                            if (!handlePendingPlannerRedirect("user")) {
                              navigate(getPostAuthRedirectPath("user"));
                            }
                          }}
                        />
                      ) : (
                        <LoginForm
                          onLoginSuccess={(role) => {
                            if (!handlePendingPlannerRedirect(role)) {
                              navigate(getPostAuthRedirectPath(role));
                            }
                          }}
                        />
                      )}
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-brand-dark/60">
                      {activeView === "signup" ? "Already have an account?" : "Don't have an account?"}{" "}
                      <button
                        type="button"
                        className="font-semibold text-brand-teal hover:underline decoration-2 underline-offset-4"
                        onClick={() => setActiveView(activeView === "signup" ? "login" : "signup")}
                      >
                        {activeView === "signup" ? "Log in" : "Sign up"}
                      </button>
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-12 text-center">
              <p className="text-[10px] text-brand-dark/40">
                By continuing, you agree to our{" "}
                <Link to={createPageUrl("Terms")} className="hover:text-brand-dark transition-colors">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to={createPageUrl("Privacy")} className="hover:text-brand-dark transition-colors">
                  Privacy Policy
                </Link>.
              </p>
            </div>
        </div>
      </div>
    </div>
  );
}
