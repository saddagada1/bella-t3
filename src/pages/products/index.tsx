import type { NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import { toast } from "sonner";
import { type z } from "zod";
import ErrorView from "~/components/errorView";
import Filters from "~/components/filters";
import LoadingView from "~/components/loadingView";
import ProductsGrid from "~/components/productsGrid";
import ScrollPagination from "~/components/scrollPagination";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { api } from "~/utils/api";
import {
  paginationLimit,
  type productSort,
  type productFilters,
} from "~/utils/constants";
import { removeDuplicates } from "~/utils/helpers";
import { type ProductFilters } from "~/utils/types";

const Products: NextPage = ({}) => {
  const [queryFilters, setQueryFilters] = useState<
    z.infer<typeof productFilters>
  >({});
  const [querySort, setQuerySort] = useState<z.infer<typeof productSort>>({});
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
      filter: queryFilters,
      sort: querySort,
    },
    {
      getNextPageParam: (page) => page.next,
    },
  );

  const onFilter = (filters: ProductFilters, sort: string) => {
    const departments = filters.main.map((d) => d.name);
    const categories = removeDuplicates(
      filters.main.flatMap(({ categories }) => categories.map((c) => c.name)),
    );
    const subcategories = removeDuplicates(
      filters.main.flatMap(({ categories }) =>
        categories.flatMap((c) => c.subcategories.map((s) => s)),
      ),
    );
    const sizes = removeDuplicates(
      filters.size.flatMap(({ categories }) =>
        categories.flatMap((c) => c.sizes.map((s) => s)),
      ),
    );
    const normalFilters: Record<string, object | undefined> = {
      department:
        departments.length > 0
          ? {
              name: {
                in: departments,
              },
            }
          : undefined,
      category:
        categories.length > 0
          ? {
              name: {
                in: categories,
              },
            }
          : undefined,
      subcategory:
        subcategories.length > 0
          ? {
              in: subcategories,
            }
          : undefined,
      condition:
        filters.condition.length > 0
          ? {
              in: filters.condition,
            }
          : undefined,
      size:
        sizes.length > 0
          ? {
              in: sizes,
            }
          : undefined,
      designers:
        filters.designers.length > 0
          ? {
              some: {
                name: {
                  in: filters.designers,
                },
              },
            }
          : undefined,
      sources:
        filters.sources.length > 0
          ? {
              some: {
                name: {
                  in: filters.sources,
                },
              },
            }
          : undefined,
      colours:
        filters.colours.length > 0
          ? {
              hasSome: filters.colours,
            }
          : undefined,
      eras:
        filters.eras.length > 0
          ? {
              hasSome: filters.eras,
            }
          : undefined,
      styles:
        filters.styles.length > 0
          ? {
              hasSome: filters.styles,
            }
          : undefined,
      country:
        filters.country.length > 0
          ? {
              in: filters.country,
            }
          : undefined,
    };
    const passedFilters = Object.keys(normalFilters).filter(
      (key) => normalFilters[key] !== undefined,
    );
    setQueryFilters(
      passedFilters.reduce(
        (o, key) => Object.assign(o, { [key]: normalFilters[key] }),
        {},
      ),
    );
    setQuerySort(() => {
      if (sort === "lowPrice") {
        return {
          price: "asc",
        };
      }
      if (sort === "highPrice") {
        return {
          price: "desc",
        };
      }
      if (sort === "new") {
        return {
          updatedAt: "desc",
        };
      }
      return {};
    });
  };

  if (productsError) {
    toast.error("Something Went Wrong");
    return (
      <ErrorView
        code="500"
        message="We couldn't fetch our products. This ones on us. Please refresh the page and try again."
      />
    );
  }
  return (
    <>
      <Head>
        <title>Bella - Products</title>
      </Head>
      <main className="relative flex flex-1 flex-col gap-6 px-6 pb-6 lg:flex-row lg:gap-8 lg:px-0 lg:pt-6">
        <div className="hidden w-1/4 border-r pr-8 lg:block">
          <Filters onFilter={onFilter} isFiltering={fetchingProducts} />
        </div>
        <Accordion className="lg:hidden" type="single" collapsible>
          <AccordionItem value="filters">
            <AccordionTrigger className="!text-sm uppercase">
              Filters
            </AccordionTrigger>
            <AccordionContent>
              <Filters onFilter={onFilter} isFiltering={fetchingProducts} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <div className="h-full flex-1">
          {fetchingProducts ? (
            <LoadingView />
          ) : (
            <ScrollPagination
              onClickNext={() => void fetchNextPage()}
              hasNext={!!hasNextPage}
              fetchingNext={fetchingNext}
              className="h-full"
            >
              <ProductsGrid
                className="lg:grid-cols-4"
                products={products.pages.flatMap((page) => page.items)}
              />
            </ScrollPagination>
          )}
        </div>
      </main>
    </>
  );
};
export default Products;
