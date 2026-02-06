import React from "react";
import { ArrowLeft } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import PlanPreviewCanvas from "@/components/planner/PlanPreviewCanvas";
import { PlannerState } from "@/features/planner/types";

type CanvasFullscreenPreviewProps = {
  open: boolean;
  onClose: () => void;
  planData: PlannerState | null;
};

const CanvasFullscreenPreview: React.FC<CanvasFullscreenPreviewProps> = ({
  open,
  onClose,
  planData
}) => {
  const backButtonRef = React.useRef<HTMLButtonElement | null>(null);

  React.useEffect(() => {
    if (!open) return;

    const focusTimer = window.setTimeout(() => {
      backButtonRef.current?.focus();
    }, 0);

    return () => window.clearTimeout(focusTimer);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (!nextOpen ? onClose() : undefined)}>
      <DialogContent
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          backButtonRef.current?.focus();
        }}
        className="left-0 top-0 z-[100] h-screen w-screen max-w-none translate-x-0 translate-y-0 gap-0 border-0 bg-white p-0 sm:rounded-none"
      >
        <DialogTitle className="sr-only">Fullscreen Blueprint Preview</DialogTitle>
        <div className="flex h-full min-h-0 flex-col">
          <header className="flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
            <Button
              ref={backButtonRef}
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-9 rounded-lg border-slate-200"
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Back
            </Button>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Fullscreen Blueprint
            </p>
            <div className="w-[82px]" aria-hidden="true" />
          </header>
          <div className="min-h-0 flex-1 overflow-hidden">
            <PlanPreviewCanvas planData={planData} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CanvasFullscreenPreview;
