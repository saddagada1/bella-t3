import { ListPlus, Settings } from "lucide-react";
import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { toast } from "sonner";
import ScrollPagination from "~/components/scrollPagination";
import { Button } from "~/components/ui/button";
import SafeImage from "~/components/ui/safeImage";
import { Title } from "~/components/ui/typography/title";
import { api } from "~/utils/api";
import { lgBreakpoint, paginationLimit } from "~/utils/constants";
import ProductsGrid from "~/components/productsGrid";
import { useWindowSize } from "usehooks-ts";
import { ValueLabel } from "~/components/ui/typography/valueLabel";
import ErrorView from "~/components/errorView";
import LoadingView from "~/components/loadingView";
import UserProfileStats from "~/components/userProfileStats";
import UserTabs from "~/components/userTabs";

const Profile: NextPage = ({}) => {
  const { width } = useWindowSize();
  const {
    data: profile,
    isLoading: fetchingProfile,
    error: profileError,
  } = api.users.getSessionUser.useQuery();
  const {
    data: products,
    isLoading: fetchingProducts,
    isFetching: fetchingNext,
    error: productsError,
    fetchNextPage,
    hasNextPage,
  } = api.products.getUserProducts.useInfiniteQuery(
    {
      limit: paginationLimit,
    },
    {
      getNextPageParam: (page) => page.next,
    },
  );

  if (fetchingProducts || fetchingProfile) {
    return <LoadingView />;
  }

  if ((!profile || profileError) ?? (!products || productsError)) {
    toast.error("Something Went Wrong");
    return (
      <ErrorView
        code="500"
        message="We couldn't fetch your profile. This ones on us. Please refresh the page and try again."
      />
    );
  }

  console.log(new Date(profile.updatedAt));

  return (
    <>
      <Head>
        <title>Bella - Your Profile</title>
      </Head>
      <main className="flex-1 px-4 pt-2 lg:px-0 lg:py-8">
        <Title title={profile.username ?? profile.name} className="mb-4">
          <div className="flex w-fit justify-end gap-2">
            <Button asChild variant="outline">
              <Link href="/products/create">
                <p className="mr-2 hidden lg:block">New Product</p>
                <ListPlus className="h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/profile/settings">
                <p className="mr-2 hidden lg:block">Edit Profile</p>
                <Settings className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </Title>
        <div className="mb-4 flex gap-4 border-b border-input pb-4 lg:gap-8">
          <SafeImage
            url={profile.image}
            alt={profile.username ?? "profile"}
            width={width > lgBreakpoint ? 200 : 125}
            className="aspect-square shrink-0 overflow-hidden rounded-full"
          />
          <div className="flex flex-1 flex-col justify-center gap-10">
            <UserProfileStats
              products={profile.store?.productsCount}
              sales={0}
              followers={profile.followersCount}
              following={profile.followingCount}
            />
            <div className="hidden lg:block">
              <UserTabs />
            </div>
          </div>
        </div>
        {profile.bio && (
          <div className="mb-4 border-b border-input pb-4">
            <ValueLabel className="ml-0 lg:ml-0">About</ValueLabel>
            <p className="text-sm font-medium lg:text-xl">{profile.bio}</p>
          </div>
        )}
        <div className="mb-4 lg:hidden">
          <UserTabs />
        </div>
        <ScrollPagination
          onClickNext={() => void fetchNextPage()}
          hasNext={!!hasNextPage}
          fetchingNext={fetchingNext}
          className="h-full"
        >
          <ProductsGrid
            products={products.pages.flatMap((page) => page.items)}
          />
        </ScrollPagination>
      </main>
    </>
  );
};

export default Profile;
