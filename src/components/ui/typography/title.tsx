import { useRouter } from "next/router";
import * as React from "react";
import { cn } from "~/utils/shadcn/utils";

interface TitleProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
}

const Title = React.forwardRef<HTMLDivElement, TitleProps>(
  ({ className, children, title, ...props }, ref) => {
    const router = useRouter();
    return (
      <div
        ref={ref}
        {...props}
        className={cn(
          "flex items-center border-b border-input pb-2",
          className,
        )}
      >
        <button
          onClick={() => router.back()}
          className="arrow aspect-square h-11 bg-foreground transition-transform will-change-transform hover:-scale-x-100"
        />
        <h1 className="h1 mr-4 w-full truncate font-semibold lg:text-4xl">
          {title}
        </h1>
        {children}
      </div>
    );
  },
);

Title.displayName = "Title";

export { Title };
