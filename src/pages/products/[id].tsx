import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import SafeImage from "~/components/ui/safeImage";
import { api } from "~/utils/api";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/react-splide/css";
import { useElementSize } from "usehooks-ts";
import { toast } from "sonner";
import { Form } from "~/components/ui/form";
import { Button, ButtonLoading } from "~/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Heart, Package } from "lucide-react";
import { ssg } from "~/utils/ssg";
import ErrorView from "~/components/errorView";
import { env } from "~/env.mjs";
import { useForm } from "react-hook-form";
import { calcCompactValue } from "~/utils/calc";
import { useMemo } from "react";
import { cn } from "~/utils/shadcn/utils";
import { useSession } from "next-auth/react";

const AddProductToBagForm: React.FC<{ id: string }> = ({ id }) => {
  const router = useRouter();
  const { status: sessionStatus } = useSession();
  const t3 = api.useContext();
  const { data: bags } = api.bags.getUserBags.useQuery();
  const { mutateAsync: addToBag } = api.bags.addToBag.useMutation({
    onMutate: async () => {
      await t3.bags.countBagItems.cancel();
      const previousCount = t3.bags.countBagItems.getData();
      t3.bags.countBagItems.setData(undefined, (cachedData) => {
        if (cachedData === undefined) return;
        return cachedData + 1;
      });
      return { previousCount };
    },
    onError: (err, _args, ctx) => {
      t3.bags.countBagItems.setData(undefined, () => ctx?.previousCount);
      toast.error(err.message);
    },
    onSuccess: (response) => {
      t3.bags.getUserBags.setData(undefined, (cachedData) => {
        if (!cachedData) return;
        const bagToUpdate = cachedData.find(
          (prevBag) => prevBag.id === response.id,
        );
        if (!bagToUpdate) {
          return [...cachedData, response];
        }
        return cachedData.map((cachedBag) => {
          if (cachedBag.id === bagToUpdate.id) {
            return response;
          }
          return cachedBag;
        });
      });
      toast.success("Added To Bag");
    },
  });

  const inBag = useMemo(() => {
    return bags?.some((bag) =>
      bag.bagItems.some((item) => item.productId === id),
    );
  }, [id, bags]);

  const form = useForm();

  const onSubmit = async () => {
    if (sessionStatus !== "authenticated") {
      void router.push(`/login?callbackUrl=/products/${id}`);
      return;
    }
    try {
      await addToBag({ id });
    } catch (error) {
      return;
    }
  };

  return (
    <Form {...form}>
      <form
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={form.handleSubmit(onSubmit)}
        className="mb-6 flex items-center justify-between gap-8 lg:w-3/4"
      >
        <div className="w-1/2 lg:w-1/3">
          {form.formState.isSubmitting ? (
            <ButtonLoading disabled size="form" />
          ) : inBag ? (
            <Button disabled type="submit" size="form">
              Added To Bag
            </Button>
          ) : (
            <Button type="submit" size="form">
              Add To Bag
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
};

const Product: NextPage = ({}) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [imageContainer, { width }] = useElementSize();
  const t3 = api.useContext();
  const { data: product, error: productError } = api.products.get.useQuery(
    {
      id: router.query.id as string,
    },
    { enabled: typeof router.query.id === "string" },
  );
  const { mutateAsync: like, isLoading: liking } =
    api.products.like.useMutation({
      onMutate: async () => {
        if (!session || !product) return;
        await t3.products.get.cancel({ id: product.id });
        const cachedProduct = t3.products.get.getData({
          id: product.id,
        });
        t3.products.get.setData({ id: product.id }, (cachedData) => {
          if (!cachedData) return;
          return {
            ...cachedData,
            likesCount: cachedData.likesCount + 1,
            likes: [
              {
                userId: session.user.id,
                productId: product.id,
              },
            ],
          };
        });
        return { cachedProduct };
      },
      onError: (err, _args, ctx) => {
        if (!product) return;
        t3.products.get.setData({ id: product.id }, () => ctx?.cachedProduct);
        toast.error(err.message);
      },
      // onSuccess: (response) => {
      //   t3.products.get.setData({id: router.query.id as string}, () => ctx?.product)
      // }
    });

  const { mutateAsync: unlike, isLoading: unliking } =
    api.products.unlike.useMutation({
      onMutate: async () => {
        if (!session || !product) return;
        await t3.products.get.cancel({ id: product.id });
        const cachedProduct = t3.products.get.getData({
          id: product.id,
        });
        t3.products.get.setData({ id: product.id }, (cachedData) => {
          if (!cachedData) return;
          return {
            ...cachedData,
            likesCount: cachedData.likesCount - 1,
            likes: [],
          };
        });
        return { cachedProduct };
      },
      onError: (err, _args, ctx) => {
        if (!product) return;
        t3.products.get.setData({ id: product.id }, () => ctx?.cachedProduct);
        toast.error(err.message);
      },
      // onSuccess: (response) => {
      //   t3.products.get.setData({id: router.query.id as string}, () => ctx?.product)
      // }
    });

  const liked = useMemo(() => {
    return product?.likes.some((like) => like.userId === session?.user.id);
  }, [product, session?.user.id]);

  if (productError) {
    toast.error(productError.message);
  }

  if (!product) {
    return <ErrorView />;
  }

  return (
    <>
      <Head>
        <title>Bella - {product.name ?? "Product"}</title>
      </Head>
      <main className="flex flex-1 flex-col lg:flex-row lg:gap-8 lg:pt-10">
        <div
          ref={imageContainer}
          className="relative aspect-square w-screen lg:w-1/2"
        >
          <Splide aria-label="Product Images">
            {product.images.map((image, index) => (
              <SplideSlide className="relative" key={index}>
                <SafeImage
                  url={env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN + image}
                  alt={`Product image ${index + 1}`}
                  width={width}
                  className="overflow-hidden pt-[100%]"
                  square
                  priority
                />
              </SplideSlide>
            ))}
          </Splide>
          {session && (
            <Button
              variant="outline"
              onClick={() => {
                if (liking || unliking) return;
                try {
                  if (liked) {
                    void unlike({ id: product.id });
                  } else {
                    void like({ id: product.id });
                  }
                } catch (error) {
                  return;
                }
              }}
              className="absolute bottom-4 right-4 z-10 flex items-center gap-2 shadow-lg lg:top-4"
            >
              <Heart
                className={cn(
                  "h-5 w-5",
                  liked ? "animate-like" : "animate-unlike",
                )}
                strokeWidth={1.5}
              />
              <p className="font-semibold">
                ({calcCompactValue(product.likesCount)})
              </p>
            </Button>
          )}
        </div>
        <div className="w-full p-6 font-bold lg:p-0">
          <h1 className="mb-4 text-2xl uppercase leading-tight lg:text-3xl">
            {product.name}
          </h1>
          <div className="mb-6 border-l-2 border-destructive pl-2 lg:w-2/3">
            <p className="border-l-2 border-destructive pl-2 text-sm font-medium uppercase text-muted-foreground lg:text-base">
              {`${product.department.name},  ${product.category.name}, ${product.subcategory}, Size ${product.size}, ${product.condition} Condition`}
            </p>
          </div>
          <div className="mb-10 flex items-center gap-4 text-lg lg:text-xl">
            <p className="flex items-center">${product.price / 100}</p>
            <p>/</p>
            <p className="flex items-center">
              <Package className="mr-2 h-6 w-6" />
              {product.shippingPrice === 0 ? (
                <span className="uppercase text-green-600">Free</span>
              ) : (
                <>${product.shippingPrice / 100}</>
              )}
            </p>
          </div>
          {product.sold ? (
            <div className="mb-6 lg:w-3/4">
              <Button
                className="w-1/2 lg:w-1/3"
                disabled
                type="submit"
                size="form"
              >
                Sold
              </Button>
            </div>
          ) : (
            <AddProductToBagForm id={product.id} />
          )}
          <Accordion
            className="border-t border-input"
            type="single"
            collapsible
          >
            <AccordionItem value="description">
              <AccordionTrigger>Description</AccordionTrigger>
              <AccordionContent>{product.description}</AccordionContent>
            </AccordionItem>
            {product.designers.length > 0 && (
              <AccordionItem value="designers">
                <AccordionTrigger>Designers</AccordionTrigger>
                <AccordionContent>
                  {product.designers
                    .map((designer) => designer.name)
                    .join(", ")}
                </AccordionContent>
              </AccordionItem>
            )}
            {product.sources.length > 0 && (
              <AccordionItem value="sources">
                <AccordionTrigger>Sources</AccordionTrigger>
                <AccordionContent>
                  {product.sources.map((source) => source.name).join(", ")}
                </AccordionContent>
              </AccordionItem>
            )}
            {product.styles.length > 0 && (
              <AccordionItem value="styles">
                <AccordionTrigger>Styles</AccordionTrigger>
                <AccordionContent>
                  {product.styles.map((style) => style).join(", ")}
                </AccordionContent>
              </AccordionItem>
            )}
            {product.eras.length > 0 && (
              <AccordionItem value="eras">
                <AccordionTrigger>Eras</AccordionTrigger>
                <AccordionContent>
                  {product.eras.map((era) => era).join(", ")}
                </AccordionContent>
              </AccordionItem>
            )}
            {product.colours.length > 0 && (
              <AccordionItem value="colours">
                <AccordionTrigger>colours</AccordionTrigger>
                <AccordionContent>
                  {product.colours.map((colour) => colour).join(", ")}
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </div>
      </main>
    </>
  );
};

export default Product;

export const getStaticProps: GetStaticProps = async (context) => {
  const id = context.params?.id;
  if (typeof id !== "string")
    return {
      notFound: true,
    };

  await ssg.products.get.prefetch({ id });
  return {
    props: {
      trpcState: ssg.dehydrate(),
    },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};
