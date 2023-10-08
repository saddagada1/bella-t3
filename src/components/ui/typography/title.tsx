import { useRouter } from "next/router";
import * as React from "react";
import { cn } from "~/utils/shadcn/utils";

const Title = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const router = useRouter();
  return (
    <div
      ref={ref}
      {...props}
      className={cn("group flex border-b border-input pb-2", className)}
    >
      <button
        onClick={() => router.back()}
        className="arrow right-0 top-0 aspect-square h-full bg-foreground transition-transform will-change-transform group-hover:-scale-x-100"
      />
      <h1 className="flex scroll-m-20 text-4xl font-semibold tracking-tight lg:text-5xl">
        {children}
      </h1>
    </div>
  );
});

Title.displayName = "Title";

export { Title };
