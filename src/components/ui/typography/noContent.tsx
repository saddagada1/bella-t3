import * as React from "react";
import { cn } from "~/utils/shadcn/utils";

const NoContent = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  return (
    <p
      ref={ref}
      {...props}
      className={cn(
        "font-mono !text-xs uppercase tracking-tighter text-muted-foreground lg:!text-sm",
        className,
      )}
    >
      {children}
    </p>
  );
});

NoContent.displayName = "NoContent";

export { NoContent };
