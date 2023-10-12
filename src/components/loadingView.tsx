import { Loader2 } from "lucide-react";
import { type HTMLAttributes } from "react";
import { cn } from "~/utils/shadcn/utils";

type LoadingViewProps = HTMLAttributes<HTMLDivElement>;

const LoadingView: React.FC<LoadingViewProps> = ({ ...rest }) => {
  const { className, ...props } = rest;
  return (
    <div
      {...props}
      className={cn(
        "flex flex-1 flex-col items-center justify-center fill-destructive",
        className,
      )}
    >
      <Loader2 className="h-10 w-10 animate-spin" />
    </div>
  );
};

export default LoadingView;
