import { Loader2 } from "lucide-react";

export default function RouteLoader() {
  return (
    <div className="flex min-h-[50vh] w-full items-center justify-center px-4 py-12">
      <div className="flex items-center gap-3 rounded-2xl border border-brand-dark/10 bg-brand-light/90 px-5 py-4 text-sm text-brand-dark/70 shadow-soft">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        <span>Loading...</span>
      </div>
    </div>
  );
}
