import React, { useState } from "react";
import { CaretDown, Question } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Container from "@/components/home-v2/primitives/Container";
import FadeIn from "@/components/animations/FadeIn";
import { Badge } from "@/components/ui/badge";

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqSectionProps {
  title?: string;
  subtitle?: string;
  items?: FaqItem[];
  compact?: boolean;
  className?: string;
}

const DEFAULT_FAQ_ITEMS: FaqItem[] = [
  {
    question: "What is Strathwell?",
    answer:
      "Strathwell is an AI Event Planning OS that turns your event goals into a complete blueprint and execution plan."
  },
  {
    question: "Do I have to plan everything from scratch?",
    answer:
      "No. You can start from ready-made templates and customize the layout, budget, timeline, and service stack."
  },
  {
    question: "How does vendor and venue booking work?",
    answer:
      "You request a booking, vendors confirm availability, and payments are tracked inside Strathwell."
  },
  {
    question: "Does Strathwell sell tickets or host events?",
    answer:
      "No. Strathwell does not resell events or tickets—it helps you plan and coordinate execution."
  }
];

const FaqSection: React.FC<FaqSectionProps> = ({
  title = "FAQ",
  subtitle = "Find answers to common questions about Strathwell",
  items = DEFAULT_FAQ_ITEMS,
  compact = false,
  className
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // Open first one by default for engagement

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className={cn("relative w-full overflow-hidden bg-white py-24", className)}>
      <Container>
        <div className="mx-auto max-w-3xl">
          <FadeIn direction="up" distance={30} className="text-center">
            <Badge className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-teal/20 bg-brand-teal/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-brand-teal">
              <Question className="h-4 w-4" />
              Support
            </Badge>
            <h2 className="text-3xl font-semibold tracking-tight text-brand-dark sm:text-4xl md:text-5xl">
              {title}
            </h2>
            {subtitle && (
              <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-brand-dark/60">
                {subtitle}
              </p>
            )}
          </FadeIn>

          <div className={cn("mt-12 space-y-4", compact && "space-y-3")}>
            {items.map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <FadeIn
                  key={index}
                  delay={index * 0.1}
                  direction="up"
                  distance={20}
                >
                  <div
                    className={cn(
                      "group overflow-hidden rounded-2xl border transition-all duration-300",
                      isOpen
                        ? "border-brand-teal/30 bg-white shadow-lg ring-1 ring-brand-teal/10"
                        : "border-brand-dark/5 bg-white/60 hover:border-brand-dark/10 hover:bg-white"
                    )}
                  >
                    <button
                      onClick={() => toggleAccordion(index)}
                      className="flex w-full items-center justify-between px-6 py-5 text-left focus:outline-none"
                    >
                      <span
                        className={cn(
                          "text-lg font-medium transition-colors duration-200",
                          isOpen ? "text-brand-teal" : "text-brand-dark group-hover:text-brand-dark/80"
                        )}
                      >
                        {item.question}
                      </span>
                      <span
                        className={cn(
                          "ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300",
                          isOpen
                            ? "border-brand-teal bg-brand-teal text-white rotate-180"
                            : "border-brand-dark/10 bg-transparent text-brand-dark/40 group-hover:border-brand-dark/20 group-hover:text-brand-dark/60"
                        )}
                      >
                        <CaretDown className="h-4 w-4" />
                      </span>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                        >
                          <div className="px-6 pb-6 pt-0">
                            <div className="border-t border-brand-teal/10 pt-4 text-base leading-relaxed text-brand-dark/70">
                              {item.answer}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
};

export default FaqSection;
