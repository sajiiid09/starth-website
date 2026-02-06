import React, { useEffect, useState } from "react";
import { Check, ArrowRight, Calendar, Sparkle, House, Download } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { useNavigate, useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";

interface SuccessPageProps {
  type?: "payment" | "booking" | "task" | "general";
  title?: string;
  message?: string;
  details?: {
    label: string;
    value: string;
  }[];
  primaryAction?: {
    label: string;
    href: string;
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
}

const SuccessPage: React.FC<SuccessPageProps> = ({
  type = "general",
  title,
  message,
  details = [],
  primaryAction,
  secondaryAction
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showConfetti, setShowConfetti] = useState(false);

  // Get type from URL params if not provided as prop
  const successType = searchParams.get("type") || type;
  
  // Default content based on type
  const defaultContent = {
    payment: {
      title: "Payment Successful",
      message: "Your payment has been processed successfully. You will receive a confirmation email shortly.",
      primaryAction: { label: "View Events", href: "/dashboard/events" },
      secondaryAction: { label: "Back to Dashboard", href: "/dashboard/ai-planner" }
    },
    booking: {
      title: "Booking Confirmed",
      message: "Your booking has been confirmed. The venue will be notified and you'll receive a confirmation shortly.",
      primaryAction: { label: "View Booking", href: "/dashboard/events" },
      secondaryAction: { label: "Browse More", href: "/dashboard/marketplace" }
    },
    task: {
      title: "Task Completed",
      message: "Great job! Your task has been completed successfully.",
      primaryAction: { label: "Continue Planning", href: "/dashboard/ai-planner" },
      secondaryAction: { label: "View All Tasks", href: "/dashboard/events" }
    },
    general: {
      title: "Success!",
      message: "Your action was completed successfully.",
      primaryAction: { label: "Continue", href: "/dashboard/ai-planner" },
      secondaryAction: { label: "Go Home", href: "/dashboard" }
    }
  };

  const content = defaultContent[successType as keyof typeof defaultContent] || defaultContent.general;
  const displayTitle = title || content.title;
  const displayMessage = message || content.message;
  const displayPrimaryAction = primaryAction || content.primaryAction;
  const displaySecondaryAction = secondaryAction || content.secondaryAction;

  useEffect(() => {
    // Trigger confetti animation after mount
    const timer = setTimeout(() => setShowConfetti(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-white p-4">
      {/* Subtle confetti particles */}
      {showConfetti && (
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="animate-confetti absolute h-2 w-2 rounded-full"
              style={{
                left: `${10 + Math.random() * 80}%`,
                backgroundColor: ['#027F83', '#F2A07B', '#D9EDF0', '#221F1F'][i % 4],
                animationDelay: `${i * 0.1}s`,
                animationDuration: `${2 + Math.random()}s`
              }}
            />
          ))}
        </div>
      )}

      <div className="w-full max-w-md">
        {/* Success Animation */}
        <div className="flex justify-center">
          <div className="relative">
            {/* Outer ring pulse */}
            <div className="absolute inset-0 animate-ping rounded-full bg-brand-teal/20" style={{ animationDuration: '2s' }} />
            {/* Main circle */}
            <div className={cn(
              "relative flex h-24 w-24 items-center justify-center rounded-full bg-brand-teal transition-all duration-500",
              showConfetti ? "scale-100 opacity-100" : "scale-50 opacity-0"
            )}>
              <Check className="h-12 w-12 text-white" strokeWidth={3} />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className={cn(
          "mt-8 text-center transition-all duration-500 delay-200",
          showConfetti ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        )}>
          <h1 className="font-display text-3xl font-semibold text-brand-dark">
            {displayTitle}
          </h1>
          <p className="mt-3 text-brand-dark/60">
            {displayMessage}
          </p>
        </div>

        {/* Details Card */}
        {details.length > 0 && (
          <div className={cn(
            "mt-6 rounded-2xl border border-brand-dark/10 bg-white p-5 shadow-soft transition-all duration-500 delay-300",
            showConfetti ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          )}>
            <div className="space-y-3">
              {details.map((detail, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-brand-dark/60">{detail.label}</span>
                  <span className="font-medium text-brand-dark">{detail.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className={cn(
          "mt-8 flex flex-col gap-3 transition-all duration-500 delay-400",
          showConfetti ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        )}>
          <Button 
            onClick={() => navigate(displayPrimaryAction.href)}
            className="group h-12 w-full gap-2 bg-brand-teal text-white hover:bg-brand-teal/90"
          >
            {displayPrimaryAction.label}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
          
          <Button 
            variant="ghost"
            onClick={() => navigate(displaySecondaryAction.href)}
            className="h-12 w-full text-brand-dark/60 hover:text-brand-dark"
          >
            {displaySecondaryAction.label}
          </Button>
        </div>

        {/* Quick Actions */}
        <div className={cn(
          "mt-8 flex justify-center gap-6 transition-all duration-500 delay-500",
          showConfetti ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        )}>
          <button 
            onClick={() => navigate('/dashboard/ai-planner')}
            className="flex flex-col items-center gap-2 text-brand-dark/50 transition-colors hover:text-brand-teal"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-dark/5">
              <Sparkle className="h-5 w-5" />
            </div>
            <span className="text-xs font-medium">AI Planner</span>
          </button>
          
          <button 
            onClick={() => navigate('/dashboard/events')}
            className="flex flex-col items-center gap-2 text-brand-dark/50 transition-colors hover:text-brand-teal"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-dark/5">
              <Calendar className="h-5 w-5" />
            </div>
            <span className="text-xs font-medium">Events</span>
          </button>
          
          <button 
            onClick={() => window.print()}
            className="flex flex-col items-center gap-2 text-brand-dark/50 transition-colors hover:text-brand-teal"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-dark/5">
              <Download className="h-5 w-5" />
            </div>
            <span className="text-xs font-medium">Download</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;
