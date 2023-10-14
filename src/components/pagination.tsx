import { ArrowLeft, ArrowRight } from "lucide-react";
import { type HTMLAttributes } from "react";
import { cn } from "~/utils/shadcn/utils";
import { Button } from "./ui/button";

interface PaginationProps extends HTMLAttributes<HTMLDivElement> {
  page: number;
  children: React.ReactNode;
  onClickNext: () => void;
  onClickPrevious: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  page,
  children,
  onClickNext,
  onClickPrevious,
  hasNext,
  hasPrevious,
  ...rest
}) => {
  const { className, ...props } = rest;
  return (
    <>
      {children}
      <div
        {...props}
        className={cn(
          "mt-4 flex w-full items-center gap-4 border-t pt-6 font-mono text-2xl font-semibold text-background sm:text-3xl",
          className,
        )}
      >
        <p className="flex-1 text-foreground">{page + 1}</p>
        <Button onClick={() => onClickPrevious()} disabled={!hasPrevious}>
          <ArrowLeft />
        </Button>
        <Button onClick={() => onClickNext()} disabled={!hasNext}>
          <ArrowRight />
        </Button>
      </div>
    </>
  );
};

export default Pagination;
