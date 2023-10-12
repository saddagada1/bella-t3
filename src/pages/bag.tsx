import { DollarSign, Loader2, Trash2 } from "lucide-react";
import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { toast } from "sonner";
import ErrorView from "~/components/errorView";
import LoadingView from "~/components/loadingView";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";
import SafeImage from "~/components/ui/safeImage";
import { Title } from "~/components/ui/typography/title";
import { env } from "~/env.mjs";
import { api } from "~/utils/api";

const Bag: NextPage = ({}) => {
  const router = useRouter();
  const t3 = api.useContext();
  const {
    data: bags,
    isLoading: fetchingBags,
    error: bagsError,
  } = api.bags.getUserBags.useQuery();
  const {
    mutateAsync: removeFromBag,
    isLoading: removingFromBag,
    variables: removingVars,
  } = api.bags.removeFromBag.useMutation({
    onMutate: async () => {
      await t3.bags.countBagItems.cancel();
      const previousCount = t3.bags.countBagItems.getData();
      t3.bags.countBagItems.setData(undefined, (cachedData) => {
        if (cachedData === undefined) return;
        return cachedData - 1;
      });
      return { previousCount };
    },
    onError: (err, _args, ctx) => {
      t3.bags.countBagItems.setData(undefined, () => ctx?.previousCount);
      toast.error(err.message);
    },
    onSuccess: (response, args) => {
      t3.bags.getUserBags.setData(undefined, (cachedData) => {
        if (!cachedData) return;
        if (response.deleted === "bag") {
          return cachedData.filter((cachedBag) => cachedBag.id !== args.bagId);
        } else {
          return cachedData.map((cachedBag) => {
            if (cachedBag.id === args.bagId) {
              return {
                ...cachedBag,
                bagItems: cachedBag.bagItems.filter(
                  (item) => item.id !== args.bagItemId,
                ),
              };
            }
            return cachedBag;
          });
        }
      });
      toast.success("Removed From Bag");
    },
  });

  if (fetchingBags) {
    return <LoadingView />;
  }

  if (!bags || bagsError) {
    toast.error(bagsError?.message ?? "Something Went Wrong");
    return (
      <ErrorView
        code="500"
        message="We couldn't fetch your bag. This ones on us. Please refresh the page and try again."
      />
    );
  }
  return (
    <>
      <Head>
        <title>Bella - Bag</title>
      </Head>
      <main className="flex flex-1 flex-col px-6 py-4 lg:items-center lg:px-0 lg:py-8">
        <Title title="Bag" className="mb-4 w-full" />
        {bags.map((bag, index) => (
          <Card key={index} className="mb-4 w-full font-mono lg:flex">
            <section className="flex-1">
              <CardHeader
                onClick={() => void router.push(`/${bag.userId}`)}
                className="flex-row items-center gap-4 space-y-0"
              >
                <SafeImage
                  url={bag.store.user.image}
                  alt={bag.store.user.username}
                  width={50}
                  className="aspect-square overflow-hidden rounded-full"
                />
                <div>
                  <p className="font-semibold">
                    {bag.store.user.name ?? "Seller"}
                  </p>
                  <p className="text-sm">@{bag.store.user.username}</p>
                </div>
              </CardHeader>
              <CardContent className="grid grid-flow-row grid-cols-1 gap-4 lg:grid-cols-2 lg:grid-rows-2">
                {bag.bagItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <SafeImage
                      url={env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN + item.images[0]}
                      alt={item.name}
                      width={100}
                      priority
                      square
                      onClick={() =>
                        void router.push(`/products/${item.productId}`)
                      }
                      className="aspect-square shrink-0 overflow-hidden rounded-2xl"
                    />
                    <div className="grid h-[100px] w-full grid-cols-6 grid-rows-4">
                      <div className="col-span-6 row-span-3 leading-none">
                        <p className="truncate font-semibold">{item.name}</p>
                        <p className="truncate text-sm">{item.description}</p>
                      </div>
                      <p className="col-span-5 flex items-center text-lg font-semibold">
                        <DollarSign className="h-5 w-5" />
                        {item.price / 100}
                      </p>
                      <button
                        disabled={removingFromBag}
                        onClick={() =>
                          void removeFromBag({
                            bagId: bag.id,
                            bagItemId: item.id,
                          })
                        }
                        className="flex items-center justify-end"
                      >
                        {removingFromBag &&
                        removingVars?.bagId === bag.id &&
                        removingVars.bagItemId === item.id ? (
                          <Loader2 className="h-5 w-5 animate-spin text-destructive" />
                        ) : (
                          <Trash2 className="h-5 w-5 text-destructive" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </section>
            <CardFooter className="flex-col gap-4 lg:basis-1/3 lg:pt-6">
              <div className="flex w-full items-end justify-between border-b border-input pb-2">
                <p className="text-sm uppercase">Item(s)</p>
                <p className="flex items-center text-lg font-semibold">
                  <DollarSign className="h-5 w-5" />
                  {bag.subTotal / 100}
                </p>
              </div>
              <div className="flex w-full items-end justify-between border-b border-input pb-2">
                <p className="text-sm uppercase">Estimated Shipping</p>
                <p className="flex items-center text-lg font-semibold">
                  <DollarSign className="h-5 w-5" />
                  {bag.shippingTotal / 100}
                </p>
              </div>
              <div className="flex w-full items-end justify-between border-b border-input pb-2">
                <p className="text-sm uppercase">Grand Total</p>
                <p className="flex items-center text-lg font-semibold">
                  <DollarSign className="h-5 w-5" />
                  {bag.grandTotal / 100}
                </p>
              </div>
              <Button asChild className="mt-4" size="form">
                <Link href={`/pay?bagId=${bag.id}`}>Checkout</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </main>
    </>
  );
};
export default Bag;
