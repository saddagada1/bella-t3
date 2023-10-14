import { type HTMLAttributes } from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { cn } from "~/utils/shadcn/utils";
import { ValueLabel } from "./ui/typography/valueLabel";

interface StatsCardProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  data: string;
  deviation?: string;
  children?: React.ReactNode;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  data,
  deviation,
  children,
  ...rest
}) => {
  const { className, ...props } = rest;
  return (
    <Card className={cn(className)} {...props}>
      <CardHeader>
        <div className="flex justify-between">
          <ValueLabel className="mb-0 ml-0 lg:mb-0 lg:ml-0">{title}</ValueLabel>
          {children}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold lg:text-4xl">{data}</p>
        {deviation && (
          <p className="text-sm text-muted-foreground lg:text-base">
            {deviation}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsCard;
