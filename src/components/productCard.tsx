import { useRouter } from "next/router";
import SafeImage from "./ui/safeImage";
import { env } from "~/env.mjs";
import { type HTMLAttributes } from "react";
import { cn } from "~/utils/shadcn/utils";
import { type Product, type BagItem, type OrderItem } from "@prisma/client";
import { lgBreakpoint } from "~/utils/constants";
import { useWindowSize } from "usehooks-ts";

interface ProductCardProps extends HTMLAttributes<HTMLDivElement> {
  item: OrderItem | BagItem | Product;
  children?: React.ReactNode;
}

const ProductCard: React.FC<ProductCardProps> = ({
  item,
  children,
  ...rest
}) => {
  const { className, ...props } = rest;
  const { width } = useWindowSize();
  const router = useRouter();
  return (
    <div
      {...props}
      className={cn(
        "flex items-center gap-4 rounded-2xl border p-2 lg:rounded-3xl",
        className,
      )}
    >
      <SafeImage
        url={env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN + item.images[0]}
        alt={item.name}
        width={width > lgBreakpoint ? 100 : 75}
        priority
        square
        onClick={() =>
          void router.push(
            `/products/${"productId" in item ? item.productId : item.id}`,
          )
        }
        className="cursor-pointer overflow-hidden rounded-xl pt-[100%] lg:rounded-2xl"
      />
      <div className="grid h-full flex-1 grid-cols-6 grid-rows-2 font-sans">
        <div className="col-span-6 leading-tight">
          <p className="truncate text-sm font-semibold lg:text-base">
            {item.name}
          </p>
          <p className="truncate text-xs font-medium text-muted-foreground lg:text-sm">
            {item.description}
          </p>
        </div>
        <p className="col-span-5 flex items-end text-sm font-semibold lg:text-base">
          ${item.price / 100}
        </p>
        {children}
      </div>
    </div>
  );
};

export default ProductCard;
