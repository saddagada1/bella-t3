import {
  Activity,
  Store as StoreIcon,
  DollarSign,
  ListPlus,
  Package,
  PackageCheck,
  Settings,
} from "lucide-react";
import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { toast } from "sonner";
import ErrorView from "~/components/errorView";
import LoadingView from "~/components/loadingView";
import StatsCard from "~/components/statsCard";
import StoreOverview from "~/components/storeOverview";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Title } from "~/components/ui/typography/title";
import { ValueLabel } from "~/components/ui/typography/valueLabel";
import { api } from "~/utils/api";

const useStoreProducts = () => {
  const {
    data: products,
    isLoading: fetchingProducts,
    error: productsError,
  } = api.products.getStoreProducts.useQuery({
    limit: 10,
  });
  const {
    data: soldProducts,
    isLoading: fetchingSoldProducts,
    error: soldProductsError,
  } = api.products.getStoreProducts.useQuery({
    limit: 10,
    sold: true,
  });

  if (fetchingProducts || fetchingSoldProducts) {
    return { data: undefined, isLoading: true, error: undefined };
  }

  if ((!products || productsError) ?? (!soldProducts || soldProductsError)) {
    return {
      data: undefined,
      isLoading: false,
      error: "Error: Could Not Fetch Library Data",
    };
  }

  return {
    data: {
      products: products.items,
      soldProducts: soldProducts.items,
    },
    isLoading: false,
    error: undefined,
  };
};

const Store: NextPage = ({}) => {
  const { data: session, update: updateSession } = useSession();
  const {
    data: store,
    isFetching: fetchingStore,
    error: storeError,
  } = api.store.get.useQuery(undefined, {
    onSuccess: (data) => {
      if (!session?.user.canSell && data.stripeSetupStatus === "complete") {
        void updateSession();
      }
    },
  });
  const {
    data: products,
    isLoading: fetchingProducts,
    error: productsError,
  } = useStoreProducts();

  if (fetchingStore || fetchingProducts) {
    return <LoadingView />;
  }

  if ((!store || storeError) ?? (!products || productsError)) {
    toast.error("Something Went Wrong");
    return (
      <ErrorView
        code="500"
        message="We couldn't fetch your store. This ones on us. Please refresh the page and try again."
      />
    );
  }

  return (
    <>
      <Head>
        <title>Bella - Store</title>
      </Head>
      <main className="flex flex-1 flex-col gap-4 px-6 py-4 lg:px-0 lg:py-8">
        <Title title="Store">
          <div className="flex w-fit justify-end gap-2">
            <Button asChild variant="outline">
              <Link href="/products/create">
                <p className="mr-2 hidden lg:block">New Product</p>
                <ListPlus className="h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/store/orders">
                <p className="mr-2 hidden lg:block">View Orders</p>
                <StoreIcon className="h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/store/settings">
                <p className="mr-2 hidden lg:block">Edit Store</p>
                <Settings className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </Title>
        <div className="flex basis-1/4 gap-4">
          <StatsCard className="basis-1/3" title="Items Selling" data={`${0}`}>
            <Package className="h-6 w-6" />
          </StatsCard>
          <StatsCard className="basis-1/3" title="Items Sold" data={`${0}`}>
            <PackageCheck className="h-6 w-6" />
          </StatsCard>
          <StatsCard className="basis-1/3" title="Total Sales" data={`$${0}`}>
            <DollarSign className="h-6 w-6" />
          </StatsCard>
        </div>
        <div className="basis-3/4">
          <Card>
            <CardHeader>
              <div className="flex justify-between">
                <ValueLabel className="mb-0 ml-0 lg:mb-0 lg:ml-0">
                  Overview
                </ValueLabel>
                <Activity className="h-6 w-6" />
              </div>
            </CardHeader>
            <CardContent>
              <StoreOverview />
            </CardContent>
          </Card>
          {/* <Card className="basis-1/5">
            <CardHeader>
              <div className="flex justify-between">
                <ValueLabel className="mb-0 ml-0 lg:mb-0 lg:ml-0">
                  Manage
                </ValueLabel>
                <Command className="h-6 w-6" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button size="form">New Product</Button>
              <Button size="form">Your Orders</Button>
              <Button size="form">Edit Store</Button>
            </CardContent>
          </Card> */}
        </div>
      </main>
    </>
  );
};
export default Store;
