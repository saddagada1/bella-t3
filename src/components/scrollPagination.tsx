import { type DetailedHTMLProps, type HTMLAttributes } from "react";
import { Button, ButtonLoading } from "./ui/button";
import { cn } from "~/utils/shadcn/utils";

interface ScrollPaginationProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  children: React.ReactNode;
  onClickNext: () => void;
  hasNext: boolean;
  fetchingNext: boolean;
}

const ScrollPagination: React.FC<ScrollPaginationProps> = ({
  children,
  onClickNext,
  hasNext,
  fetchingNext,
  ...DetailedHTMLProps
}) => {
  const { className, ...props } = DetailedHTMLProps;
  return (
    <div {...props} className={cn("space-y-4", className)}>
      {children}
      {hasNext &&
        (fetchingNext ? (
          <ButtonLoading size="form" />
        ) : (
          <Button size="form" onClick={() => onClickNext()}>
            View More
          </Button>
        ))}
    </div>
  );
};

export default ScrollPagination;
