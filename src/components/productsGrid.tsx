import { type HTMLAttributes } from "react";
import { cn } from "~/utils/shadcn/utils";
import { Skeleton } from "./ui/skeleton";
import Link from "next/link";
import SafeImage from "./ui/safeImage";
import { useElementSize } from "usehooks-ts";
import { DollarSign } from "lucide-react";
import { env } from "~/env.mjs";

interface Product {
  id: string;
  images: string[];
  price: number;
}

interface ProductsGridProps extends HTMLAttributes<HTMLDivElement> {
  products?: Product[];
  loading?: boolean;
}

const ProductsGrid: React.FC<ProductsGridProps> = ({
  products,
  loading,
  ...HTMLAttributes
}) => {
  const { className, ...props } = HTMLAttributes;
  const [imageContainer, { width }] = useElementSize();
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
              className="relative"
            >
              <SafeImage
                url={env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN + product.images[0]}
                alt="Product Image"
                width={width}
                square
                className="aspect-square overflow-hidden rounded-2xl lg:rounded-3xl"
              />
              <p className="absolute left-0 top-0 flex h-full w-full items-center justify-center rounded-2xl font-mono text-xl font-bold text-background opacity-0 backdrop-blur-lg transition-opacity duration-500 hover:opacity-100 lg:rounded-3xl">
                <DollarSign className="h-5 w-5" />
                {product.price / 100}
              </p>
            </Link>
          ))}
    </div>
  );
};
export default ProductsGrid;
