import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
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
import { useRouter } from "next/router";
import { env } from "~/env.mjs";
import { toast } from "sonner";
import { useMemo } from "react";
import UserTabs from "~/components/userTabs";
import { UserCheck, UserPlus } from "lucide-react";

const User: NextPage = ({}) => {
  const router = useRouter();
  const { data: session } = useSession();
  const { width } = useWindowSize();
  const t3 = api.useContext();
  const {
    data: user,
    isLoading: fetchingUser,
    error: userError,
  } = api.users.getUser.useQuery(
    { username: router.query.username as string },
    { enabled: typeof router.query.username === "string" },
  );
  const {
    data: products,
    isLoading: fetchingProducts,
    isFetching: fetchingNext,
    error: productsError,
    fetchNextPage,
    hasNextPage,
  } = api.products.getStoreProducts.useInfiniteQuery(
    {
      id: user ? user.id : "",
      limit: paginationLimit,
    },
    {
      getNextPageParam: (page) => page.next,
      enabled: !!user,
    },
  );
  const { mutateAsync: follow, isLoading: following } =
    api.users.follow.useMutation({
      onMutate: async () => {
        if (!session || !user) return;
        await t3.users.getUser.cancel({ username: user.username });
        const cachedUser = t3.users.getUser.getData({
          username: user.username,
        });
        t3.users.getUser.setData({ username: user.username }, (cachedData) => {
          if (!cachedData) return;
          return {
            ...cachedData,
            followersCount: cachedData.followersCount + 1,
            followers: [
              {
                followerId: session.user.id,
                followedId: user.id,
              },
            ],
          };
        });
        const cachedSessionUser = t3.users.getSessionUser.getData();
        t3.users.getSessionUser.setData(undefined, (cachedData) => {
          if (!cachedData) return;
          return {
            ...cachedData,
            followingCount: cachedData.followingCount + 1,
          };
        });
        return { cachedUser, cachedSessionUser };
      },
      onError: (err, _args, ctx) => {
        if (!user) return;
        t3.users.getUser.setData(
          { username: user?.username },
          () => ctx?.cachedUser,
        );
        t3.users.getSessionUser.setData(
          undefined,
          () => ctx?.cachedSessionUser,
        );
        toast.error(err.message);
      },
    });

  const { mutateAsync: unfollow, isLoading: unfollowing } =
    api.users.unfollow.useMutation({
      onMutate: async () => {
        if (!session || !user) return;
        await t3.users.getUser.cancel({ username: user.username });
        const cachedUser = t3.users.getUser.getData({
          username: user.username,
        });
        t3.users.getUser.setData({ username: user.username }, (cachedData) => {
          if (!cachedData) return;
          return {
            ...cachedData,
            followersCount: cachedData.followersCount - 1,
            followers: [],
          };
        });
        const cachedSessionUser = t3.users.getSessionUser.getData();
        t3.users.getSessionUser.setData(undefined, (cachedData) => {
          if (!cachedData) return;
          return {
            ...cachedData,
            followingCount: cachedData.followingCount - 1,
          };
        });
        return { cachedUser, cachedSessionUser };
      },
      onError: (err, _args, ctx) => {
        if (!user) return;
        t3.users.getUser.setData(
          { username: user?.username },
          () => ctx?.cachedUser,
        );
        t3.users.getSessionUser.setData(
          undefined,
          () => ctx?.cachedSessionUser,
        );
        toast.error(err.message);
      },
    });

  const followed = useMemo(() => {
    return user?.followers.some(
      (follow) => follow.followerId === session?.user.id,
    );
  }, [user, session?.user.id]);

  if (fetchingProducts || fetchingUser) {
    return <LoadingView />;
  }

  if ((!user || userError) ?? (!products || productsError)) {
    return <ErrorView />;
  }

  return (
    <>
      <Head>
        <title>Bella - {user.name ?? user.username}&apos;s Profile</title>
      </Head>
      <main className="flex-1 px-4 pt-2 lg:px-0 lg:py-8">
        <Title title={user.name ?? user.username} className="mb-4">
          <div className="flex w-fit justify-end gap-2">
            <Button
              onClick={() => {
                if (following || unfollowing) return;
                try {
                  if (followed) {
                    void unfollow({ id: user.id });
                  } else {
                    void follow({ id: user.id });
                  }
                } catch (error) {
                  return;
                }
              }}
              variant={followed ? "outline" : "default"}
            >
              {followed ? (
                <>
                  <p className="mr-2 hidden lg:block">Following</p>
                  <UserCheck className="h-5 w-5" />
                </>
              ) : (
                <>
                  <p className="mr-2 hidden lg:block">Follow</p>
                  <UserPlus className="h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        </Title>
        <div className="mb-4 flex gap-4 border-b border-input pb-4 lg:gap-8">
          <SafeImage
            url={
              user.image
                ? env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN + user.image
                : undefined
            }
            alt={user.username}
            width={width > lgBreakpoint ? 200 : 125}
            className="aspect-square shrink-0 overflow-hidden rounded-full"
          />
          <div className="flex flex-1 flex-col justify-center gap-10">
            <UserProfileStats
              products={user.store?.productsCount}
              sales={user.store?.ordersCount}
              followers={user.followersCount}
              following={user.followingCount}
            />
            <div className="hidden lg:block">
              <UserTabs />
            </div>
          </div>
        </div>
        {user.bio && (
          <div className="mb-4 border-b border-input pb-4">
            <ValueLabel className="ml-0 lg:ml-0">About</ValueLabel>
            <p className="text-sm font-medium lg:text-xl">{user.bio}</p>
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

export default User;
