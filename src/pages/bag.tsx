import { Loader2, Trash2 } from "lucide-react";
import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { toast } from "sonner";
import ErrorView from "~/components/errorView";
import LoadingView from "~/components/loadingView";
import ProductCard from "~/components/productCard";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";
import { FormTitle } from "~/components/ui/form";
import { NoContent } from "~/components/ui/typography/noContent";
import { Title } from "~/components/ui/typography/title";
import { ValueLabel } from "~/components/ui/typography/valueLabel";
import { api } from "~/utils/api";

const Bag: NextPage = ({}) => {
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
    toast.error("Something Went Wrong");
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
        {bags.length > 0 ? (
          <div className="w-full space-y-4">
            {bags.map((bag, index) => (
              <Card key={index} className="lg:flex">
                <div className="flex-1">
                  <CardHeader className="space-y-0">
                    <FormTitle className="mb-4">Bag #{bag.id}</FormTitle>
                    <div className="flex w-full flex-col text-center text-sm font-medium lg:flex-row lg:items-start lg:text-base">
                      <div className="flex flex-1">
                        <div className="flex-1 border-r border-input">
                          <ValueLabel className="ml-0 lg:ml-0">
                            Seller
                          </ValueLabel>
                          <Link
                            className="hover:underline"
                            href={`/${bag.store.user.username}`}
                          >
                            @{bag.store.user.username}
                          </Link>
                        </div>
                        <div className="flex-1">
                          <ValueLabel>Total Items</ValueLabel>
                          <p>{bag.bagItems.length}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-1 border-t border-input pt-4 lg:mt-0 lg:border-l lg:border-t-0 lg:pt-0">
                        <div className="flex-1 border-r border-input">
                          <ValueLabel className="ml-0">Discounts</ValueLabel>
                          <p>None</p>
                        </div>
                        <div className="col-span-4 flex-1">
                          <ValueLabel>Bundles</ValueLabel>
                          <p>None</p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <FormTitle className="mb-4">Item(s)</FormTitle>
                    <div className="grid grid-flow-row grid-cols-1 gap-4 lg:grid-cols-2">
                      {bag.bagItems.map((item, index) => (
                        <ProductCard key={index} item={item}>
                          <button
                            disabled={removingFromBag}
                            onClick={() =>
                              void removeFromBag({
                                bagId: bag.id,
                                bagItemId: item.id,
                              })
                            }
                            className="flex items-end justify-center pb-1"
                          >
                            {removingFromBag &&
                            removingVars?.bagId === bag.id &&
                            removingVars.bagItemId === item.id ? (
                              <Loader2 className="h-5 w-5 animate-spin text-destructive" />
                            ) : (
                              <Trash2 className="h-5 w-5 text-destructive" />
                            )}
                          </button>
                        </ProductCard>
                      ))}
                    </div>
                  </CardContent>
                </div>
                <CardFooter className="flex-col gap-4 lg:basis-1/3 lg:pt-6">
                  <div className="flex w-full flex-col gap-4 text-sm font-semibold lg:text-base">
                    <FormTitle>Payment</FormTitle>
                    <div className="flex items-end justify-between border-b border-input pb-2">
                      <ValueLabel className="mb-0 ml-0 lg:mb-0 lg:ml-0">
                        Item(s)
                      </ValueLabel>
                      <p>${bag.subTotal / 100}</p>
                    </div>
                    <div className="flex items-end justify-between border-b border-input pb-2">
                      <ValueLabel className="mb-0 ml-0 lg:mb-0 lg:ml-0">
                        Shipping Total
                      </ValueLabel>
                      {bag.shippingTotal === 0 ? (
                        <p className="uppercase text-green-600">Free</p>
                      ) : (
                        <p>${bag.shippingTotal / 100}</p>
                      )}
                    </div>
                    <div className="flex items-end justify-between">
                      <ValueLabel className="mb-0 ml-0 lg:mb-0 lg:ml-0">
                        Grand Total
                      </ValueLabel>
                      <p>${bag.grandTotal / 100}</p>
                    </div>
                  </div>
                  <Button asChild size="form">
                    <Link href={`/pay?bagId=${bag.id}`}>Checkout</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <NoContent className="mt-12 text-center">
            You haven&apos;t added any items to your bag yet.
          </NoContent>
        )}
      </main>
    </>
  );
};
export default Bag;
