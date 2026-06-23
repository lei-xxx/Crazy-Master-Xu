import * as React from "react";
import { ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ButtonColorfulProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
}

function ButtonColorful({
  className,
  label = "View Project",
  ...props
}: ButtonColorfulProps) {
  return (
    <Button
      className={cn(
        "group relative h-10 overflow-hidden rounded-full border border-white bg-transparent px-12 transition-all duration-200 hover:bg-white",
        className,
      )}
      {...props}
    >
      <div className="relative flex items-center justify-center gap-2">
        <span className="text-white transition-colors duration-200 group-hover:text-black">{label}</span>
        <ArrowUpRight className="h-5 w-5 text-white transition-colors duration-200 group-hover:text-black" />
      </div>
    </Button>
  );
}

export { ButtonColorful };
