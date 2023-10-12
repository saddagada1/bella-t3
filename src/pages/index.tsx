import Head from "next/head";
import Image from "next/image";
import { Disc3 } from "lucide-react";
import SearchInput from "~/components/searchInput";
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
    toast.error(productsError?.message ?? "Something Went Wrong");
    return <ErrorView />;
  }

  return (
    <>
      <Head>
        <title>Bella - Home</title>
      </Head>
      <main className="flex flex-1 flex-col px-4 pb-4 lg:px-2 lg:py-8">
        <SearchInput className="my-2 block lg:hidden" />
        <section className="lg:flex lg:gap-4">
          <div className="relative mt-2 flex aspect-video w-full items-end overflow-hidden rounded-3xl p-4 text-background will-change-transform lg:flex-1">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute bottom-0 left-0 h-full w-full object-cover"
            >
              <source src="/media/videos/hero.mp4" />
            </video>
            <h1 className="z-10 font-mono text-3xl uppercase leading-none">
              embrace your own unique style.
            </h1>
            <Disc3 className="absolute right-4 top-4 h-8 w-8 animate-[spin_4s_linear_infinite]" />
          </div>
          <div className="mt-2 flex gap-2 lg:flex-1 lg:gap-4">
            <div className="relative aspect-video flex-1 overflow-hidden rounded-3xl">
              <Image
                src="/media/images/hero1.jpeg"
                alt="hero-1"
                fill
                className="object-cover saturate-[.45]"
              />
            </div>
            <div className="flex flex-1 gap-2 lg:flex-col lg:gap-4">
              <div className="relative basis-1/2 overflow-hidden rounded-3xl">
                <Image
                  src="/media/images/hero2.jpeg"
                  alt="hero-2"
                  fill
                  className="object-cover saturate-[.45]"
                />
              </div>
              <div className="relative basis-1/2 overflow-hidden rounded-3xl">
                <Image
                  src="/media/images/hero3.jpeg"
                  alt="hero-3"
                  fill
                  className="object-cover saturate-[.45]"
                />
              </div>
            </div>
          </div>
        </section>
        <section className="mt-2 w-full flex-1">
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
