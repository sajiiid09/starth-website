import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type OrganizerImmersiveShellProps = {
  copilot: React.ReactNode;
  canvas: React.ReactNode;
  showCanvas?: boolean;
  topBar?: React.ReactNode;
};

const OrganizerImmersiveShell: React.FC<OrganizerImmersiveShellProps> = ({
  copilot,
  canvas,
  showCanvas = true,
  topBar
}) => {
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
  
  // Refined proportions with a cleaner sidebar width
  const desktopColumnsClass = showCanvas
    ? "lg:grid-cols-[400px_1fr]" 
    : "lg:grid-cols-1";

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col gap-6 animate-in fade-in duration-700">
      {topBar}

      <div className="min-h-0 flex-1">
        {/* Desktop Split View */}
        <div
          className={cn(
            "hidden h-full min-h-0 rounded-[24px] border border-slate-200/60 bg-white/50 shadow-xl backdrop-blur-sm lg:grid overflow-hidden transition-[grid-template-columns] duration-300 ease-out",
            desktopColumnsClass
          )}
        >
          <div className={cn(
            "min-h-0 overflow-hidden flex flex-col bg-white transition-all duration-300 ease-out",
            showCanvas ? "border-r border-slate-100 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.05)]" : ""
          )}>
            {copilot}
          </div>
          {showCanvas && (
            <div className="min-h-0 overflow-hidden bg-slate-50/30 animate-in fade-in-0 slide-in-from-right-2 duration-300">
              {canvas}
            </div>
          )}
        </div>

        {/* Tablet Stacking View */}
        <div className="hidden h-full min-h-0 flex-col gap-4 md:flex lg:hidden">
          <div className={cn(
            "min-h-0 overflow-hidden rounded-[24px] border border-slate-200/60 bg-white shadow-lg transition-all duration-300 ease-out",
            showCanvas ? "basis-[50%]" : "flex-1"
          )}>
            {copilot}
          </div>
          {showCanvas && (
            <div className="min-h-0 basis-[50%] overflow-hidden rounded-[24px] border border-slate-200/60 bg-white shadow-lg animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
              {canvas}
            </div>
          )}
        </div>

        {/* Mobile View */}
        <div className="flex h-full min-h-0 flex-col rounded-[24px] border border-slate-200/60 bg-white shadow-lg md:hidden overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 bg-white/80 px-4 py-3 backdrop-blur-md">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-teal/70">
              Co-pilot Studio
            </p>
            {showCanvas && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 rounded-full border-brand-teal/20 text-brand-teal hover:bg-brand-teal/5"
                onClick={() => setIsPreviewOpen(true)}
              >
                Preview Canvas
              </Button>
            )}
          </div>
          <div className="min-h-0 flex-1 overflow-hidden">{copilot}</div>
        </div>
      </div>

      {showCanvas && (
        <Sheet open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <SheetContent side="right" className="w-full p-0 sm:max-w-xl border-l-brand-teal/10">
            <SheetHeader className="border-b border-slate-100 px-6 py-4 bg-white/80 backdrop-blur-md">
              <SheetTitle className="text-sm font-semibold uppercase tracking-widest text-slate-500">
                Canvas Preview
              </SheetTitle>
            </SheetHeader>
            <div className="h-[calc(100vh-4.5rem)] overflow-hidden bg-slate-50/30">{canvas}</div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
};

export default OrganizerImmersiveShell;
