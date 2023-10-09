import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import SafeImage from "~/components/ui/safeImage";
import { api } from "~/utils/api";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/react-splide/css";
import { useWindowSize } from "usehooks-ts";
import { useState } from "react";
import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/utils/shadcn/utils";
import { H1 } from "~/components/ui/typography/h1";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/form";
import { Button, ButtonLoading } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { DollarSign, Truck } from "lucide-react";

const formSchema = z.object({
  quantity: z.number().min(1, "Required"),
});

const AddProductToBagForm: React.FC<{ quantity: number }> = ({ quantity }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantity: 1,
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values);
  };
  return (
    <Form {...form}>
      <form
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex items-center justify-between gap-8 border-b border-input pb-6"
      >
        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem className="w-1/4 shrink-0">
              <Select
                onValueChange={(value) => {
                  field.onChange(parseInt(value));
                }}
                defaultValue={field.value.toString()}
              >
                <FormControl>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                </FormControl>
                <FormMessage />
                <SelectContent>
                  {Array.from({ length: quantity }).map((_, index) => (
                    <SelectItem key={index} value={(index + 1).toString()}>
                      {index + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        <div className="w-1/2 shrink-0">
          {form.formState.isSubmitting ? (
            <ButtonLoading size="form" />
          ) : (
            <Button size="form" type="submit">
              Add To Bag
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
};

const Product: NextPage = ({}) => {
  const { width } = useWindowSize();
  const [imagesReady, setImagesReady] = useState(false);
  const router = useRouter();
  const { data: product, error: productError } = api.products.get.useQuery({
    id: router.query.id as string,
  });

  if (productError) {
    toast.error("Error: Something Went Wrong");
  }

  return (
    <>
      <Head>
        <title>Bella - {product?.name ?? "Product"}</title>
      </Head>
      <main className="flex flex-1 flex-col">
        <div className="relative aspect-square w-screen shrink-0">
          {product && (
            <Splide
              onVisible={() => setImagesReady(true)}
              aria-label="Product Images"
            >
              {product.images.map((image, index) => (
                <SplideSlide key={index}>
                  <SafeImage
                    url={image}
                    alt={`Product image ${index + 1}`}
                    width={width}
                    className="relative aspect-square"
                    square
                    priority
                  />
                </SplideSlide>
              ))}
            </Splide>
          )}
          <Skeleton
            className={cn(
              "absolute z-10 aspect-square w-screen",
              imagesReady && "hidden",
            )}
          />
        </div>
        <div className="p-6">
          {product ? (
            <>
              <H1 className="mb-2">{product.name}</H1>
              <div className="mb-6 border-l-2 border-destructive pl-2">
                <p className="border-l-2 border-destructive pl-2 font-mono text-sm font-semibold uppercase">
                  {`${product.department.name} • ${product.category.name} • ${product.subcategory} • Size ${product.size} • ${product.condition} Condition`}
                </p>
              </div>
              <div className="mb-10 flex items-center gap-4 font-mono text-lg font-semibold">
                <p className="flex items-center">
                  <DollarSign className="h-5 w-5" />
                  {product.price / 100}
                </p>
                <p>•</p>
                <p className="flex items-center">
                  <Truck className="mr-2 h-6 w-6" />
                  {product.shippingPrice === 0 ? (
                    <span className="uppercase text-green-600">Free</span>
                  ) : (
                    <>
                      <DollarSign className="h-5 w-5" />
                      {product.shippingPrice / 100}
                    </>
                  )}
                </p>
              </div>
              <AddProductToBagForm quantity={100} />
              <Accordion className="font-mono" type="single" collapsible>
                <AccordionItem value="description">
                  <AccordionTrigger className="uppercase">
                    Description
                  </AccordionTrigger>
                  <AccordionContent>{product.description}</AccordionContent>
                </AccordionItem>
                {product.designers.length && (
                  <AccordionItem value="designers">
                    <AccordionTrigger className="uppercase">
                      Designers
                    </AccordionTrigger>
                    <AccordionContent>
                      {product.designers
                        .map((designer) => designer.name)
                        .join(", ")}
                    </AccordionContent>
                  </AccordionItem>
                )}
                {product.sources.length && (
                  <AccordionItem value="sources">
                    <AccordionTrigger className="uppercase">
                      Sources
                    </AccordionTrigger>
                    <AccordionContent>
                      {product.sources.map((source) => source.name).join(", ")}
                    </AccordionContent>
                  </AccordionItem>
                )}
                {product.styles.length && (
                  <AccordionItem value="styles">
                    <AccordionTrigger className="uppercase">
                      Styles
                    </AccordionTrigger>
                    <AccordionContent>
                      {product.styles.map((style) => style).join(", ")}
                    </AccordionContent>
                  </AccordionItem>
                )}
                {product.eras.length && (
                  <AccordionItem value="eras">
                    <AccordionTrigger className="uppercase">
                      Eras
                    </AccordionTrigger>
                    <AccordionContent>
                      {product.eras.map((era) => era).join(", ")}
                    </AccordionContent>
                  </AccordionItem>
                )}
                {product.colours.length && (
                  <AccordionItem value="colours">
                    <AccordionTrigger className="uppercase">
                      colours
                    </AccordionTrigger>
                    <AccordionContent>
                      {product.colours.map((colour) => colour).join(", ")}
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
            </>
          ) : (
            <>
              <Skeleton className="mb-2 h-10 w-full rounded-full" />
              <Skeleton className="mb-6 h-10 w-5/6 rounded-full" />
              <Skeleton className="mb-10 h-8 w-4/6 rounded-full" />
              <div className="flex justify-between">
                <Skeleton className="h-12 w-1/4 rounded-full" />
                <Skeleton className="h-12 w-1/2 rounded-full" />
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
};
export default Product;
