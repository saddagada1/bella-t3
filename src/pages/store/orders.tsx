import type { NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import { toast } from "sonner";
import ErrorView from "~/components/errorView";
import LoadingView from "~/components/loadingView";
import OrderCard from "~/components/orderCard";
import Pagination from "~/components/pagination";
import { NoContent } from "~/components/ui/typography/noContent";
import { Title } from "~/components/ui/typography/title";
import { api } from "~/utils/api";
import { paginationLimit } from "~/utils/constants";

const Orders: NextPage = ({}) => {
  const [page, setPage] = useState(0);
  const {
    data: orders,
    isLoading: fetchingOrders,
    error: ordersError,
    fetchNextPage,
  } = api.orders.getStoreOrders.useInfiniteQuery(
    {
      limit: paginationLimit,
    },
    {
      getNextPageParam: (page) => page.next,
    },
  );
  const data = orders?.pages[page];

  const handleNext = async () => {
    if (!orders?.pages[page + 1]) {
      await fetchNextPage();
    }
    setPage((prev) => prev + 1);
  };

  const handlePrevious = () => {
    setPage((prev) => prev - 1);
  };

  if (fetchingOrders) {
    return <LoadingView />;
  }

  if (!orders || ordersError) {
    toast.error("Something Went Wrong");
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
        {data && data.items.length > 0 ? (
          <Pagination
            page={page}
            hasNext={!!orders.pages[page]?.next}
            hasPrevious={!!orders.pages[page - 1]}
            onClickNext={() => void handleNext()}
            onClickPrevious={() => handlePrevious()}
          >
            <div className="w-full space-y-4">
              {data.items.map((order, index) => (
                <OrderCard key={index} order={order} />
              ))}
            </div>
          </Pagination>
        ) : (
          <NoContent className="mt-12 text-center">
            You haven&apos;t gotten any orders yet.
          </NoContent>
        )}
      </main>
    </>
  );
};

export default Orders;
