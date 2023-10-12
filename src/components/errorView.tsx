import { type HTMLAttributes } from "react";
import { cn } from "~/utils/shadcn/utils";
interface ErrorViewProps extends HTMLAttributes<HTMLDivElement> {
  code?: string;
  message?: string;
}

const ErrorView: React.FC<ErrorViewProps> = ({ code, message, ...rest }) => {
  const { className, ...props } = rest;
  return (
    <div
      {...props}
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-4",
        className,
      )}
    >
      <h1 className="font-display text-8xl lg:text-9xl">{code ?? "404"}</h1>
      <p className="mx-10 max-w-xl text-center font-mono text-base uppercase text-muted-foreground">
        {message ??
          "We couldn't find what you were looking for. If you are sure it exists please refresh the page and try again or check that the url is valid."}
      </p>
    </div>
  );
};

export default ErrorView;
