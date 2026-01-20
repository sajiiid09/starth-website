import React from "react";
import { cn } from "@/lib/utils";
import { containerMaxWidth } from "../constants";

type ContainerProps = {
  className?: string;
  children: React.ReactNode;
};

const Container: React.FC<ContainerProps> = ({ className, children }) => {
  return (
    <div
      className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", className)}
      style={{ maxWidth: containerMaxWidth }}
    >
      {children}
    </div>
  );
};

export default Container;
