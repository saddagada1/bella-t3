import { type HTMLAttributes, useState } from "react";
import { cn } from "~/utils/shadcn/utils";
import { Skeleton } from "./ui/skeleton";
import Link from "next/link";
import SafeImage from "./ui/safeImage";
import { useElementSize } from "usehooks-ts";
import { env } from "~/env.mjs";
import { type SimplifiedProduct } from "~/utils/types";

interface ProductsGridProps extends HTMLAttributes<HTMLDivElement> {
  products?: SimplifiedProduct[];
  loading?: boolean;
}

const ProductsGrid: React.FC<ProductsGridProps> = ({
  products,
  loading,
  ...HTMLAttributes
}) => {
  const { className, ...props } = HTMLAttributes;
  const [imageContainer, { width }] = useElementSize();
  const [hover, setHover] = useState("");
  return (
    <div
      {...props}
      className={cn(
        "grid auto-rows-fr grid-cols-3 gap-2 lg:grid-cols-6 lg:gap-4",
        className,
      )}
    >
      {loading
        ? Array.from({ length: products?.length ?? 9 }).map((_, index) => (
            <Skeleton key={index} className="aspect-square rounded-2xl" />
          ))
        : products?.map((product, index) => (
            <Link
              ref={imageContainer}
              key={index}
              href={`/products/${product.id}`}
              className="relative font-semibold"
            >
              <SafeImage
                url={
                  env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN +
                  product.images[
                    hover === product.id
                      ? product.images[1] !== undefined
                        ? 1
                        : 0
                      : 0
                  ]
                }
                alt="Product Image"
                width={width}
                square
                onMouseEnter={() => setHover(product.id)}
                onMouseLeave={() => setHover("")}
                className="aspect-square overflow-hidden rounded-2xl lg:mb-2 lg:rounded-3xl"
              />
              {product.sold && (
                <p className="absolute left-6 top-4 rounded-full bg-destructive px-4 py-1 text-background">
                  SOLD
                </p>
              )}
              <p className="mb-1 hidden truncate text-lg leading-tight lg:block">
                {product.name}
              </p>
              <p className="hidden text-muted-foreground lg:block">
                ${product.price / 100}
              </p>
            </Link>
          ))}
    </div>
  );
};
export default ProductsGrid;
