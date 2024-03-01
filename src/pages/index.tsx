import Head from "next/head";
import { api } from "~/utils/api";
import { paginationLimit } from "~/utils/constants";
import ErrorView from "~/components/errorView";
import { toast } from "sonner";
import ScrollPagination from "~/components/scrollPagination";
import ProductsGrid from "~/components/productsGrid";
import LoadingView from "~/components/loadingView";

const Home = () => {
  const {
    data: products,
    isLoading: fetchingProducts,
    isFetching: fetchingNext,
    error: productsError,
    fetchNextPage,
    hasNextPage,
  } = api.products.getProducts.useInfiniteQuery(
    {
      limit: paginationLimit,
    },
    {
      getNextPageParam: (page) => page.next,
    },
  );

  if (fetchingProducts) {
    return <LoadingView />;
  }

  if (!products || productsError) {
    toast.error("Something Went Wrong");
    return <ErrorView />;
  }

  return (
    <>
      <Head>
        <title>Bella - Home</title>
      </Head>
      <main>
        <section className="relative">
          <video
            autoPlay
            loop
            muted
            playsInline
            src="/media/videos/hero.mp4"
            className="aspect-video w-full object-cover"
          />
          <h1 className="p absolute bottom-0 right-0 z-10 text-3xl font-bold uppercase text-background">
            embrace your own unique style.
          </h1>
        </section>
        <section className="mt-4 w-full flex-1">
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
        </section>
      </main>
    </>
  );
};

export default Home;
