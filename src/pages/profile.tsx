import { ListPlus } from "lucide-react";
import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useElementSize } from "usehooks-ts";
import ScrollPagination from "~/components/scrollPagination";
import { Button } from "~/components/ui/button";
import SafeImage from "~/components/ui/safeImage";
import { Title } from "~/components/ui/typography/title";
import { ValueLabel } from "~/components/ui/typography/valueLabel";
import { api } from "~/utils/api";
import { paginationLimit } from "~/utils/constants";

const Profile: NextPage = ({}) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [container, { width }] = useElementSize();
  const [profileImageContainer, { height }] = useElementSize();
  const {
    data: products,
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

  return (
    <>
      <Head>
        <title>Bella - Your Profile</title>
      </Head>
      <main className="mt-2 flex flex-1 flex-col px-4">
        <Title className="mb-4">Profile</Title>
        <div ref={container} className="mb-8 flex gap-4">
          <div ref={profileImageContainer}>
            <SafeImage
              url={session?.user.image}
              alt={session?.user.username ?? "profile"}
              width={height}
              className="relative aspect-square overflow-hidden rounded-full"
            />
          </div>
          <div className="flex-1 text-center font-mono text-sm text-foreground">
            <div className="grid grid-cols-8">
              <div className="col-span-5 space-y-1 border-r border-input">
                <ValueLabel>Username</ValueLabel>
                <p>@{session?.user.username}</p>
              </div>
              <div className="col-span-3 space-y-1 pl-2">
                <ValueLabel>Products</ValueLabel>
                <p>0</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-8 border-t border-input pt-4">
              <div className="col-span-2 space-y-1 border-r border-input">
                <ValueLabel>Sales</ValueLabel>
                <p>0</p>
              </div>
              <Link
                href="/followers"
                className="col-span-3 space-y-1 border-r border-input pl-2"
              >
                <ValueLabel>Followers</ValueLabel>
                <p>0</p>
              </Link>
              <Link href="/following" className="col-span-3 space-y-1 pl-2">
                <ValueLabel>Following</ValueLabel>
                <p>0</p>
              </Link>
            </div>
          </div>
        </div>
        <div className="mb-4 grid grid-cols-3 gap-2">
          <Button variant="secondary" asChild className="col-span-2 h-12">
            <Link href="/settings">Edit Profile</Link>
          </Button>
          <Button variant="secondary" asChild className="h-12">
            <Link href="/products/create">
              New
              <ListPlus className="ml-2 h-5 w-5 flex-shrink-0" />
            </Link>
          </Button>
        </div>
        {products && (
          <ScrollPagination
            onClickNext={() => void fetchNextPage()}
            hasNext={!!hasNextPage}
            fetchingNext={fetchingNext}
          >
            <div className="grid w-full grid-flow-row grid-cols-3 gap-2">
              {products.pages
                .flatMap((page) => page.items)
                .map((product, index) => (
                  <button
                    key={index}
                    onClick={() => void router.push(`/products/${product.id}`)}
                  >
                    <SafeImage
                      url={product.images[0]}
                      alt="Product Image"
                      width={(width - 16) / 3}
                      square
                      className="relative h-full overflow-hidden rounded-2xl"
                    />
                  </button>
                ))}
              <SafeImage
                url={undefined}
                alt="Product Image"
                width={(width - 16) / 3}
                square
                className="relative h-full overflow-hidden rounded-2xl"
              />
              <SafeImage
                url={undefined}
                alt="Produage"
                width={(width - 16) / 3}
                square
                className="relative h-full overflow-hidden rounded-2xl"
              />
              <SafeImage
                url={undefined}
                alt="Prodaduage"
                width={(width - 16) / 3}
                square
                className="relative h-full overflow-hidden rounded-2xl"
              />
            </div>
          </ScrollPagination>
        )}
      </main>
    </>
  );
};
export default Profile;
