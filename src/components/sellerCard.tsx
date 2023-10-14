import { useRouter } from "next/router";
import { useElementSize } from "usehooks-ts";
import SafeImage from "./ui/safeImage";
import { type HTMLAttributes } from "react";
import { cn } from "~/utils/shadcn/utils";
import { type Seller } from "~/utils/types";

interface SellerCardProps extends HTMLAttributes<HTMLDivElement> {
  seller: Seller;
}

const SellerCard: React.FC<SellerCardProps> = ({ seller, ...rest }) => {
  const { className, ...props } = rest;
  const router = useRouter();
  const [container, { height }] = useElementSize();
  return (
    <div
      ref={container}
      {...props}
      className={cn("flex items-center gap-4 font-sans lg:w-1/2", className)}
      onClick={() => void router.push(`/${seller.username}`)}
    >
      <SafeImage
        url={seller.image}
        alt={seller.username}
        width={height * 0.9}
        className="aspect-square overflow-hidden rounded-full"
      />
      <div className="flex flex-col">
        <p className="font-semibold lg:text-lg">Seller</p>
        <div className="text-xs text-muted-foreground lg:text-sm">
          <p>{seller.name}</p>
          <p>@{seller.username}</p>
        </div>
      </div>
    </div>
  );
};

export default SellerCard;
