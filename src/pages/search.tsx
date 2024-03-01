import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { useElementSize } from "usehooks-ts";
import ErrorView from "~/components/errorView";
import LoadingView from "~/components/loadingView";
import ProductsGrid from "~/components/productsGrid";
import SearchInput from "~/components/searchInput";
import { FormTitle } from "~/components/ui/form";
import SafeImage from "~/components/ui/safeImage";
import { NoContent } from "~/components/ui/typography/noContent";
import { env } from "~/env.mjs";
import { api } from "~/utils/api";

const Search: NextPage = ({}) => {
  const [container, { width }] = useElementSize();
  const router = useRouter();
  const {
    data: search,
    isLoading: fetchingSearch,
    error: searchError,
  } = api.search.all.useQuery(
    {
      query: router.query.q as string,
    },
    {
      enabled: !!(router.query.q && typeof router.query.q === "string"),
    },
  );

  if (searchError) {
    toast.error("Something Went Wrong");
    return (
      <ErrorView
        code="500"
        message="We couldn't fetch your search results. This ones on us. Please refresh the page and try again."
      />
    );
  }
  return (
    <>
      <Head>
        <title>Bella - Search</title>
      </Head>
      <main className="relative flex flex-1 flex-col gap-6 px-6 pb-6 lg:px-0 lg:pt-6">
        <SearchInput className="my-2" />
        {fetchingSearch &&
        !!(router.query.q && typeof router.query.q === "string") ? (
          <LoadingView />
        ) : (
          <>
            <FormTitle>Users</FormTitle>
            {search && search.users.length > 0 ? (
              <div className="grid grid-cols-3 gap-2 lg:grid-cols-6 lg:gap-4">
                {search.users.map((user, index) => (
                  <div
                    key={index}
                    ref={container}
                    className="space-y-4 text-center"
                  >
                    <SafeImage
                      url={
                        user.image
                          ? env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN + user.image
                          : undefined
                      }
                      alt={user.username}
                      width={width}
                      className="aspect-square shrink-0 overflow-hidden rounded-full"
                    />
                    <p className="mb-1 truncate text-sm font-semibold leading-tight lg:text-lg">
                      {user.username}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <NoContent className="my-12 text-center">
                No Users Found
              </NoContent>
            )}
            <FormTitle>Products</FormTitle>
            {search && search.products.length > 0 ? (
              <ProductsGrid products={search.products} />
            ) : (
              <NoContent className="my-12 text-center">
                No Products Found
              </NoContent>
            )}
          </>
        )}
      </main>
    </>
  );
};

export default Search;
