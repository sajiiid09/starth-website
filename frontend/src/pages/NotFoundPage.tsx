import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Compass, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentRole, getRoleHomePath } from "@/utils/role";
import { isAuthenticated } from "@/utils/authSession";

export default function NotFoundPage() {
  const navigate = useNavigate();
  const role = getCurrentRole();
  const dashboardPath = role ? getRoleHomePath(role) : null;
  const showDashboardLink = isAuthenticated() && Boolean(dashboardPath);

  const handleGoBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/", { replace: true });
  };

  return (
    <section className="mx-auto flex min-h-[60vh] w-full max-w-4xl items-center px-4 py-10 sm:px-6">
      <div className="relative w-full overflow-hidden rounded-3xl border border-brand-dark/10 bg-gradient-to-br from-white via-brand-light to-brand-cream/60 p-8 shadow-soft sm:p-10">
        <div className="pointer-events-none absolute -top-16 right-0 h-44 w-44 rounded-full bg-brand-blue/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-brand-teal/10 blur-3xl" />

        <div className="relative space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-dark/10 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand-dark/70">
            <Compass className="h-3.5 w-3.5" />
            404 Error
          </div>

          <div className="space-y-2">
            <h1 className="font-display text-3xl font-semibold text-brand-dark sm:text-4xl">
              Page not found
            </h1>
            <p className="max-w-xl text-sm text-brand-dark/70 sm:text-base">
              The page you requested is unavailable or may have moved. Let&apos;s get you back to
              somewhere useful.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button asChild className="bg-brand-dark text-brand-light hover:bg-brand-dark/90">
              <Link to="/">
                <Home className="h-4 w-4" />
                Go Home
              </Link>
            </Button>
            <Button type="button" variant="outline" onClick={handleGoBack}>
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
            {showDashboardLink && dashboardPath ? (
              <Button asChild variant="ghost" className="text-brand-teal hover:text-brand-teal">
                <Link to={dashboardPath}>Go to Dashboard</Link>
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
