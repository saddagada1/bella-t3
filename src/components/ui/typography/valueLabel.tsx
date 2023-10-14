import * as React from "react";
import { cn } from "~/utils/shadcn/utils";

const ValueLabel = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  return (
    <p
      ref={ref}
      {...props}
      className={cn(
        "mb-1 ml-2 text-left font-mono !text-xxs font-normal uppercase tracking-tighter text-muted-foreground lg:mb-4 lg:ml-4 lg:!text-sm",
        className,
      )}
    >
      {children}
    </p>
  );
});

ValueLabel.displayName = "ValueLabel";

export { ValueLabel };
