import Link from "next/link";
import { ValueLabel } from "~/components/ui/typography/valueLabel";

interface UserProfileCardProps {
  username?: string;
  products?: number;
  sales?: number;
  followers?: number;
  following?: number;
}

export const UserProfileCard: React.FC<UserProfileCardProps> = ({
  username,
  products,
  sales,
  followers,
  following,
}) => {
  return (
    <div className="flex w-full flex-col text-center font-mono text-sm lg:flex-row lg:items-start lg:text-xl">
      <div className="grid flex-1 grid-cols-8">
        <div className="col-span-5 border-r border-input">
          <ValueLabel className="ml-0 lg:ml-0">Username</ValueLabel>
          <p>@{username}</p>
        </div>
        <div className="col-span-3">
          <ValueLabel>Products</ValueLabel>
          <p>{products}</p>
        </div>
      </div>
      <div className="mt-4 grid flex-1 grid-cols-8 border-t border-input pt-4 lg:mt-0 lg:grid-cols-9 lg:border-l lg:border-t-0 lg:pt-0">
        <div className="col-span-2 border-r border-input lg:col-span-3">
          <ValueLabel className="ml-0">Sales</ValueLabel>
          <p>{sales}</p>
        </div>
        <Link href="/followers" className="col-span-3 border-r border-input">
          <ValueLabel>Followers</ValueLabel>
          <p>{followers}</p>
        </Link>
        <Link href="/following" className="col-span-3">
          <ValueLabel>Following</ValueLabel>
          <p>{following}</p>
        </Link>
      </div>
    </div>
  );
};
