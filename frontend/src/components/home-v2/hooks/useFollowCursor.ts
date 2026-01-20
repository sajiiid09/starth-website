import React from "react";

type FollowCursorOptions = {
  enabled?: boolean;
};

export const useFollowCursor = ({ enabled = true }: FollowCursorOptions = {}) => {
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const cursorRef = React.useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = React.useState(false);

  React.useEffect(() => {
    if (!enabled) {
      return;
    }

    const wrapper = wrapperRef.current;
    const cursor = cursorRef.current;

    if (!wrapper || !cursor) {
      return;
    }

    let rafId = 0;

    const handleMove = (event: MouseEvent) => {
      const rect = wrapper.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        cursor.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      });
    };

    const handleEnter = () => setIsActive(true);
    const handleLeave = () => setIsActive(false);

    wrapper.addEventListener("mousemove", handleMove);
    wrapper.addEventListener("mouseenter", handleEnter);
    wrapper.addEventListener("mouseleave", handleLeave);

    return () => {
      cancelAnimationFrame(rafId);
      wrapper.removeEventListener("mousemove", handleMove);
      wrapper.removeEventListener("mouseenter", handleEnter);
      wrapper.removeEventListener("mouseleave", handleLeave);
    };
  }, [enabled]);

  return { wrapperRef, cursorRef, isActive };
};
