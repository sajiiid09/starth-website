import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Users, Briefcase } from "lucide-react";
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
import { base44 } from "@/api/base44Client";
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

type SignUpFormProps = {
  selectedRole: RoleOptionId | null;
  vendorType: VendorType | null;
  onSignUpSuccess: () => void;
};

const SignUpForm: React.FC<SignUpFormProps> = ({
  selectedRole,
  vendorType,
  onSignUpSuccess
}) => {
  const [loading, setLoading] = useState(false);
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          placeholder="John Doe"
          required
          value={formData.fullName}
          onChange={(e) => handleInputChange("fullName", e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="signupEmail">Email</Label>
        <Input
          id="signupEmail"
          type="email"
          placeholder="name@company.com"
          required
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="signupPassword">Password</Label>
        <Input
          id="signupPassword"
          type="password"
          placeholder="At least 8 characters"
          required
          value={formData.password}
          onChange={(e) => handleInputChange("password", e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="phone">Phone (Optional)</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+1 (555) 000-0000"
          value={formData.phone}
          onChange={(e) => handleInputChange("phone", e.target.value)}
        />
      </div>
      {(isVenueOwner || isServiceProvider) && (
        <div className="space-y-4 rounded-2xl border border-white/60 bg-brand-light/70 p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-teal">
              Additional details
            </p>
            <p className="mt-2 text-sm text-brand-dark/70">
              {isVenueOwner
                ? "Used to match your venue to optimal blueprints."
                : "Used to match you to relevant event stacks."}
            </p>
          </div>
          {isVenueOwner && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="venueSqft">Venue square feet</Label>
                <Input
                  id="venueSqft"
                  type="number"
                  min="1"
                  placeholder="8500"
                  value={venueDetails.sqft}
                  onChange={(e) =>
                    setVenueDetails((prev) => ({ ...prev, sqft: e.target.value }))
                  }
                />
                {fieldErrors.venueSqft && (
                  <p className="text-xs text-brand-coral">{fieldErrors.venueSqft}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="venueLocation">Venue location</Label>
                <Input
                  id="venueLocation"
                  placeholder="Seaport District"
                  value={venueDetails.location}
                  onChange={(e) =>
                    setVenueDetails((prev) => ({ ...prev, location: e.target.value }))
                  }
                />
                {fieldErrors.venueLocation && (
                  <p className="text-xs text-brand-coral">{fieldErrors.venueLocation}</p>
                )}
              </div>
            </div>
          )}
          {isServiceProvider && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Service categories</Label>
                <div className="flex flex-wrap gap-2">
                  {serviceCategoryOptions.map((category) => {
                    const isSelected = serviceCategories.includes(category);
                    return (
                      <button
                        key={category}
                        type="button"
                        className={cn(
                          "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em]",
                          isSelected
                            ? "border-brand-dark bg-brand-dark text-brand-light"
                            : "border-brand-dark/20 bg-white text-brand-dark/60"
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
                  <p className="text-xs text-brand-coral">
                    {fieldErrors.serviceCategories}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Service areas</Label>
                <div className="flex flex-wrap gap-2">
                  {serviceAreaOptions.map((area) => {
                    const isSelected = serviceAreas.includes(area);
                    return (
                      <button
                        key={area}
                        type="button"
                        className={cn(
                          "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em]",
                          isSelected
                            ? "border-brand-dark bg-brand-dark text-brand-light"
                            : "border-brand-dark/20 bg-white text-brand-dark/60"
                        )}
                        onClick={() => setServiceAreas((prev) => toggleMultiValue(prev, area))}
                      >
                        {area}
                      </button>
                    );
                  })}
                </div>
                {fieldErrors.serviceAreas && (
                  <p className="text-xs text-brand-coral">{fieldErrors.serviceAreas}</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      <Button
        type="submit"
        className="w-full rounded-full bg-brand-teal py-6 text-base text-brand-light hover:bg-brand-teal/90"
        disabled={loading || (selectedRole === "vendor" && !vendorFieldsValid)}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
      </Button>
    </form>
  );
};

type LoginFormProps = {
  onLoginSuccess: (role: AppRole) => void;
};

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

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
        const nextRole: AppRole = userRoles.includes("admin")
          ? "admin"
          : userRoles.includes("service_provider") || userRoles.includes("venue_owner")
            ? "vendor"
            : "user";
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="loginEmail">Email</Label>
        <Input
          id="loginEmail"
          type="email"
          placeholder="name@company.com"
          required
          value={formData.email}
          onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
        />
      </div>
      <div>
        <Label htmlFor="loginPassword">Password</Label>
        <Input
          id="loginPassword"
          type="password"
          placeholder="Your password"
          required
          value={formData.password}
          onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
        />
      </div>
      <Button
        type="submit"
        className="w-full rounded-full bg-brand-teal py-6 text-base text-brand-light hover:bg-brand-teal/90"
        disabled={loading}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Log in"}
      </Button>
    </form>
  );
};

export default function AppEntryPage() {
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<AuthView>("role");
  const [selectedRole, setSelectedRole] = useState<RoleOptionId | null>(null);
  const [vendorType, setVendorTypeState] = useState<VendorType | null>(null);
  const location = useLocation();
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
        const user = await base44.auth.me();
        if (user) {
          sessionStorage.setItem("currentUser", JSON.stringify(user));
          const userRoles = user.roles || ["organizer"];
          const nextRole: AppRole = userRoles.includes("admin")
            ? "admin"
            : userRoles.includes("service_provider") || userRoles.includes("venue_owner")
              ? "vendor"
              : "user";
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
            navigate(getRoleHomePath(nextRole), { replace: true });
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

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const devRole = params.get("as");
    if (import.meta.env.MODE !== "production" && devRole === "admin") {
      setCurrentRole("admin");
      navigate("/admin", { replace: true });
    }
  }, [location.search, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-brand-light">
        <Loader2 className="w-8 h-8 text-brand-dark/40 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-light text-brand-dark">
      <header className="flex items-center justify-between px-6 py-5 lg:px-12">
        <Link to={createPageUrl("Home")} className="text-lg font-semibold tracking-tight">
          Strathwell
        </Link>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            className="rounded-full text-sm text-brand-dark/70 hover:text-brand-dark"
            onClick={() => setActiveView("login")}
          >
            Log in
          </Button>
          <Button
            className="rounded-full bg-brand-dark px-5 text-brand-light hover:bg-brand-dark/90"
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

      <div className="grid min-h-[calc(100vh-80px)] grid-cols-1 lg:grid-cols-[70%_1fr]">
        <div className="relative hidden h-full lg:flex">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-dark/90 via-brand-dark/70 to-brand-teal/60" />
          <video
            className="h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            poster="/images/solutions/launch.svg"
          >
            <source src="/herovid.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute z-10 flex h-full w-full flex-col justify-end p-12 text-brand-light">
            <div className="max-w-md">
              <p className="text-sm uppercase tracking-[0.3em] text-brand-light/70">
                Strathwell Platform
              </p>
              <h1 className="mt-4 text-4xl font-semibold leading-tight">
                Event orchestration, beautifully streamlined.
              </h1>
              <p className="mt-4 text-base text-brand-light/80">
                AI-powered planning, a curated marketplace, and seamless execution tools
                built for modern teams.
              </p>
            </div>
          </div>
        </div>

        <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-6 py-8 lg:px-12">
          <div className="w-full max-w-md">
            <AnimatePresence mode="wait">
              {activeView === "role" && (
                <motion.div
                  key="role"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="space-y-8"
                >
                  <div className="space-y-4">
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-teal">
                      Choose your path
                    </p>
                    <h2 className="text-3xl font-semibold text-brand-dark">
                      How will you use Strathwell?
                    </h2>
                    <p className="text-sm text-brand-dark/70">
                      Select a role to personalize your onboarding experience.
                    </p>
                  </div>
                  <div className="grid gap-4">
                    {roleOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          className={cn(
                            "flex w-full items-center gap-4 rounded-2xl border border-white/60 bg-white/80 px-5 py-4 text-left shadow-card",
                            "transition duration-200 ease-smooth hover:-translate-y-0.5 hover:border-white",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal/40"
                          )}
                          onClick={() => {
                            setSelectedRole(option.id);
                            setCurrentRole(option.id === "vendor" ? "vendor" : "user");
                            if (option.id === "vendor") {
                              setVendorTypeState(null);
                              resetVendorSession();
                              setActiveView("role");
                            } else {
                              setActiveView("signup");
                            }
                          }}
                        >
                          <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-brand-light">
                            <Icon className="h-5 w-5 text-brand-teal" />
                          </span>
                          <span className="flex-1">
                            <span className="block text-base font-semibold text-brand-dark">
                              {option.title}
                            </span>
                            <span className="block text-sm text-brand-dark/70">
                              {option.description}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {selectedRole === "vendor" && (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="mt-6 space-y-4 rounded-3xl border border-white/40 bg-white/80 p-6 shadow-card"
                    >
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-teal">
                          Vendor type
                        </p>
                        <h3 className="text-xl font-semibold text-brand-dark">
                          Choose your vendor subtype
                        </h3>
                        <p className="text-sm text-brand-dark/60">
                          This sets your onboarding path and dashboard experience.
                        </p>
                      </div>
                      <div className="grid gap-4">
                        {[
                          {
                            id: "venue_owner",
                            title: "Venue Owner",
                            description: "Own or manage event spaces.",
                            icon: Users
                          },
                          {
                            id: "service_provider",
                            title: "Service Provider",
                            description: "Catering, AV, staffing, and more.",
                            icon: Briefcase
                          }
                        ].map((option) => {
                          const Icon = option.icon;
                          return (
                            <button
                              key={option.id}
                              type="button"
                              className={cn(
                                "flex w-full items-center gap-4 rounded-2xl border border-white/60 bg-white/90 px-5 py-4 text-left shadow-soft",
                                "transition duration-200 ease-smooth hover:-translate-y-0.5 hover:border-white",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal/40"
                              )}
                              onClick={() => {
                                const chosenType = option.id as VendorType;
                                setVendorTypeState(chosenType);
                                setVendorType(chosenType);
                                setVendorOnboardingStatus("draft");
                                setActiveView("signup");
                              }}
                            >
                              <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-brand-light">
                                <Icon className="h-5 w-5 text-brand-teal" />
                              </span>
                              <span className="flex-1">
                                <span className="block text-base font-semibold text-brand-dark">
                                  {option.title}
                                </span>
                                <span className="block text-sm text-brand-dark/70">
                                  {option.description}
                                </span>
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {activeView !== "role" && (
                <motion.div
                  key="auth"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="space-y-8 rounded-3xl border border-white/40 bg-white/80 p-8 shadow-card"
                >
                  <div className="space-y-6">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-teal">
                        {activeView === "login" ? "Welcome back" : "Create account"}
                      </p>
                      <h2 className="mt-3 text-2xl font-semibold text-brand-dark">
                        {activeView === "login" ? "Sign in to Strathwell" : "Start your event workspace"}
                      </h2>
                    </div>
                    {activeView === "signup" && selectedRole && (
                      <span className="inline-block rounded-full bg-brand-light px-3 py-1 text-xs font-semibold text-brand-teal">
                        Signing up as {roleLabel}
                        {selectedRole === "vendor" && vendorType
                          ? ` · ${vendorType === "venue_owner" ? "Venue Owner" : "Service Provider"}`
                          : ""}
                      </span>
                    )}
                  </div>

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
                          navigate(getRoleHomePath("user"));
                        }
                      }}
                    />
                  ) : (
                    <LoginForm
                      onLoginSuccess={(role) => {
                        if (!handlePendingPlannerRedirect(role)) {
                          navigate(getRoleHomePath(role));
                        }
                      }}
                    />
                  )}

                  <div className="space-y-4 border-t border-white/40 pt-6">
                    <div className="text-center text-sm text-brand-dark/70">
                      {activeView === "signup" ? (
                        <span>
                          Already a user?{" "}
                          <button
                            type="button"
                            className="font-semibold text-brand-teal hover:text-brand-teal/80"
                            onClick={() => setActiveView("login")}
                          >
                            Login
                          </button>
                        </span>
                      ) : (
                        <span>
                          New here?{" "}
                          <button
                            type="button"
                            className="font-semibold text-brand-teal hover:text-brand-teal/80"
                            onClick={() => setActiveView("signup")}
                          >
                            Create an account
                          </button>
                        </span>
                      )}
                    </div>

                    {activeView === "signup" && (
                      <div className="flex flex-col gap-3 text-center text-xs text-brand-dark/60 sm:flex-row sm:items-center sm:justify-between">
                        <button
                          type="button"
                          className="font-semibold text-brand-dark/60 hover:text-brand-dark"
                          onClick={() => {
                            setSelectedRole(null);
                            setVendorTypeState(null);
                            setActiveView("role");
                          }}
                        >
                          ← Change role
                        </button>
                        <Link to={createPageUrl("Home")} className="hover:text-brand-dark">
                          Return home
                        </Link>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-8 text-center text-xs text-brand-dark/60">
              <p>
                By continuing, you agree to our{" "}
                <Link to={createPageUrl("Terms")} className="underline hover:text-brand-dark">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to={createPageUrl("Privacy")} className="underline hover:text-brand-dark">
                  Privacy Policy
                </Link>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
