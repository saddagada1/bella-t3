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
        "text-left font-mono !text-xxs uppercase tracking-tighter text-muted-foreground",
        className,
      )}
    >
      {children}
    </p>
  );
});

ValueLabel.displayName = "ValueLabel";

export { ValueLabel };
