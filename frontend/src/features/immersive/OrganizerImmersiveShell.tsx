import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

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

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col gap-4">
      {topBar}

      <div className="min-h-0 flex-1">
        <div className="hidden h-full min-h-0 rounded-2xl border border-slate-200 bg-white shadow-sm lg:grid lg:grid-cols-[clamp(22rem,25vw,26rem)_minmax(0,1fr)]">
          <div className="min-h-0 overflow-hidden border-r border-slate-200">{copilot}</div>
          {showCanvas && <div className="min-h-0 overflow-hidden">{canvas}</div>}
        </div>

        <div className="hidden h-full min-h-0 flex-col gap-4 md:flex lg:hidden">
          <div className="min-h-0 basis-[56%] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {copilot}
          </div>
          {showCanvas && (
            <div className="min-h-0 basis-[44%] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {canvas}
            </div>
          )}
        </div>

        <div className="flex h-full min-h-0 flex-col rounded-2xl border border-slate-200 bg-white shadow-sm md:hidden">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Co-pilot
            </p>
            {showCanvas && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 rounded-lg"
                onClick={() => setIsPreviewOpen(true)}
              >
                Preview
              </Button>
            )}
          </div>
          <div className="min-h-0 flex-1 overflow-hidden">{copilot}</div>
        </div>
      </div>

      {showCanvas && (
        <Sheet open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <SheetContent side="right" className="w-full p-0 sm:max-w-lg">
            <SheetHeader className="border-b border-slate-200 px-5 py-4">
              <SheetTitle>Canvas Preview</SheetTitle>
            </SheetHeader>
            <div className="h-[calc(100vh-4.5rem)] overflow-hidden">{canvas}</div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
};

export default OrganizerImmersiveShell;
