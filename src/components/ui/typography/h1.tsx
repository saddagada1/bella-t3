import * as React from "react";
import { cn } from "~/utils/shadcn/utils";

const H1 = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => {
  return (
    <h1
      ref={ref}
      {...props}
      className={cn(
        "font-mono text-3xl font-semibold leading-tight",
        className,
      )}
    >
      {children}
    </h1>
  );
});

H1.displayName = "H1";

export { H1 };
