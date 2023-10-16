import Link from "next/link";
import { ValueLabel } from "~/components/ui/typography/valueLabel";

interface UserProfileStatsProps {
  products?: number;
  sales?: number;
  followers?: number;
  following?: number;
}

const UserProfileStats: React.FC<UserProfileStatsProps> = ({
  products,
  sales,
  followers,
  following,
}) => {
  return (
    <div className="flex w-full flex-col text-center text-sm font-medium lg:flex-row lg:items-start lg:text-xl">
      <div className="flex flex-1 lg:basis-3/5">
        <div className="flex-1 border-r">
          <ValueLabel className="ml-0 lg:ml-0">Products</ValueLabel>
          <p>{products ?? 0}</p>
        </div>
        <div className="flex-1 border-r">
          <ValueLabel>Sales</ValueLabel>
          <p>{sales ?? 0}</p>
        </div>
        <div className="flex-1">
          <ValueLabel>Rating</ValueLabel>
          <p>{5}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-1 border-t pt-4 lg:mt-0 lg:basis-2/5 lg:border-l lg:border-t-0 lg:pt-0">
        <div className="flex-1 border-r lg:col-span-4">
          <ValueLabel className="ml-0">Followers</ValueLabel>
          <p>{followers ?? 0}</p>
        </div>
        <Link href="/following" className="flex-1">
          <ValueLabel>Following</ValueLabel>
          <p>{following ?? 0}</p>
        </Link>
      </div>
    </div>
  );
};

export default UserProfileStats;
