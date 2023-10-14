import { ListPlus, Settings } from "lucide-react";
import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { toast } from "sonner";
import ScrollPagination from "~/components/scrollPagination";
import { Button } from "~/components/ui/button";
import SafeImage from "~/components/ui/safeImage";
import { Title } from "~/components/ui/typography/title";
import { api } from "~/utils/api";
import { lgBreakpoint, paginationLimit } from "~/utils/constants";
import { UserProfileCard } from "../components/userProfileCard";
import ProductsGrid from "~/components/productsGrid";
import { useWindowSize } from "usehooks-ts";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { ValueLabel } from "~/components/ui/typography/valueLabel";
import ErrorView from "~/components/errorView";
import LoadingView from "~/components/loadingView";

const UserTabs = () => {
  return (
    <Tabs defaultValue="all">
      <TabsList>
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="selling">Selling</TabsTrigger>
        <TabsTrigger value="sold">Sold</TabsTrigger>
        <TabsTrigger value="reviews">Reviews</TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

const Profile: NextPage = ({}) => {
  const { data: session, status: sessionStatus } = useSession();
  const { width } = useWindowSize();
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

  if (fetchingProducts || sessionStatus === "loading") {
    return <LoadingView />;
  }

  if (!products || productsError) {
    toast.error(productsError?.message ?? "Something Went Wrong");
    return <ErrorView />;
  }

  return (
    <>
      <Head>
        <title>Bella - Your Profile</title>
      </Head>
      <main className="flex-1 px-4 pt-2 lg:px-0 lg:py-8">
        <Title title={session?.user.name ?? "Profile"} className="mb-4">
          <div className="flex w-fit justify-end gap-2">
            <Button asChild variant="outline">
              <Link href="/products/create">
                <p className="mr-2 hidden lg:block">New Product</p>
                <ListPlus className="h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/settings">
                <p className="mr-2 hidden lg:block">Edit Profile</p>
                <Settings className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </Title>
        <div className="mb-4 flex gap-4 border-b border-input pb-4 lg:gap-8">
          <SafeImage
            url={session?.user.image}
            alt={session?.user.username ?? "profile"}
            width={width > lgBreakpoint ? 200 : 125}
            className="aspect-square shrink-0 overflow-hidden rounded-full"
          />
          <div className="flex flex-1 flex-col justify-center gap-10">
            <UserProfileCard
              username={session?.user.username}
              products={0}
              sales={0}
              followers={0}
              following={0}
            />
            <div className="hidden lg:block">
              <UserTabs />
            </div>
          </div>
        </div>
        {session?.user.bio && (
          <div className="mb-4 border-b border-input pb-4">
            <ValueLabel className="ml-0 lg:ml-0">About</ValueLabel>
            <p className="font-mono text-sm lg:text-xl">{session.user.bio}</p>
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
