import { DollarSign } from "lucide-react";
import type { NextPage } from "next";
import Head from "next/head";
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
import { NoContent } from "~/components/ui/typography/noContent";
import { Title } from "~/components/ui/typography/title";
import { env } from "~/env.mjs";
import { api } from "~/utils/api";

const Orders: NextPage = ({}) => {
  const router = useRouter();
  const {
    data: orders,
    isLoading: fetchingOrders,
    error: ordersError,
  } = api.orders.getUserOrders.useQuery();

  if (fetchingOrders) {
    return <LoadingView />;
  }

  if (!orders || ordersError) {
    toast.error(ordersError?.message ?? "Something Went Wrong");
    return (
      <ErrorView
        code="500"
        message="We couldn't fetch your orders. This ones on us. Please refresh the page and try again."
      />
    );
  }
  return (
    <>
      <Head>
        <title>Bella - Orders</title>
      </Head>
      <main className="flex-1 px-6 py-4 lg:px-0 lg:py-8">
        <Title title="Orders" className="mb-4 w-full" />
        {orders.length > 0 ? (
          <>
            {orders.map((order, index) => (
              <Card key={index} className="mb-4 w-full font-mono lg:flex">
                <section className="flex-1">
                  <CardHeader
                    onClick={() => void router.push(`/${order.userId}`)}
                    className="flex-row items-center gap-4 space-y-0"
                  >
                    <SafeImage
                      url={order.store.user.image}
                      alt={order.store.user.username}
                      width={50}
                      className="aspect-square overflow-hidden rounded-full"
                    />
                    <div>
                      <p className="font-semibold">
                        {order.store.user.name ?? "Seller"}
                      </p>
                      <p className="text-sm">@{order.store.user.username}</p>
                    </div>
                  </CardHeader>
                  <CardContent className="grid grid-flow-row grid-cols-1 gap-4 lg:grid-cols-2 lg:grid-rows-2">
                    {order.orderItems.map((item, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <SafeImage
                          url={
                            env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN + item.images[0]
                          }
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
                            <p className="truncate font-semibold">
                              {item.name}
                            </p>
                            <p className="truncate text-sm">
                              {item.description}
                            </p>
                          </div>
                          <p className="col-span-5 flex items-center text-lg font-semibold">
                            <DollarSign className="h-5 w-5" />
                            {item.price / 100}
                          </p>
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
                      {order.subTotal / 100}
                    </p>
                  </div>
                  <div className="flex w-full items-end justify-between border-b border-input pb-2">
                    <p className="text-sm uppercase">Estimated Shipping</p>
                    <p className="flex items-center text-lg font-semibold">
                      <DollarSign className="h-5 w-5" />
                      {order.shippingTotal / 100}
                    </p>
                  </div>
                  <div className="flex w-full items-end justify-between border-b border-input pb-2">
                    <p className="text-sm uppercase">Grand Total</p>
                    <p className="flex items-center text-lg font-semibold">
                      <DollarSign className="h-5 w-5" />
                      {order.grandTotal / 100}
                    </p>
                  </div>
                  <Button className="mt-4" size="form">
                    Cancel
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </>
        ) : (
          <NoContent className="mt-12 text-center">
            You haven&apos;t placed any orders yet
          </NoContent>
        )}
      </main>
    </>
  );
};
export default Orders;
