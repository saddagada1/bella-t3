import { TRPCClientError } from "@trpc/client";
import { CircleDollarSign, DollarSign } from "lucide-react";
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "sonner";
import ErrorView from "~/components/errorView";
import AddressForm from "~/components/forms/addressForm";
import LoadingView from "~/components/loadingView";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Button, ButtonLoading } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";
import { FormTitle } from "~/components/ui/form";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import SafeImage from "~/components/ui/safeImage";
import { NoContent } from "~/components/ui/typography/noContent";
import { Title } from "~/components/ui/typography/title";
import { env } from "~/env.mjs";
import { api } from "~/utils/api";

const Pay: NextPage = ({}) => {
  const router = useRouter();
  const t3 = api.useContext();
  const {
    data: bag,
    isLoading: fetchingBag,
    error: bagError,
  } = api.bags.getUserBag.useQuery(
    {
      id: router.query.bagId as string,
    },
    {
      enabled: typeof router.query.bagId === "string",
    },
  );
  const {
    data: addresses,
    isLoading: fetchingAddresses,
    error: addressesError,
  } = api.addresses.getUserAddresses.useQuery();
  const { mutateAsync: addAddress } = api.addresses.create.useMutation();
  const { mutateAsync: checkout, isLoading: checkingOut } =
    api.orders.createCheckoutSession.useMutation({
      onError: (err) => {
        toast.error(err.message);
      },
      onSuccess: (url) => {
        void router.push(url);
      },
    });
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);

  if (fetchingBag || fetchingAddresses) {
    return <LoadingView />;
  }

  if ((!bag || bagError) ?? (!addresses || addressesError)) {
    toast.error(bagError?.message ?? "Something Went Wrong");
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
        <title>Bella - Pay</title>
      </Head>
      <main className="flex-1 px-6 py-4 lg:px-0 lg:py-8">
        <Title title="Pay" className="mb-4 w-full" />
        <section className="flex flex-col-reverse gap-4 lg:flex-row">
          <Card className="h-fit lg:basis-1/3">
            <CardHeader>
              <FormTitle className="mb-4">Shipping Address</FormTitle>
              {addresses.length > 0 ? (
                <RadioGroup
                  onValueChange={(value) => setSelectedAddress(value)}
                >
                  {addresses.map((address, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 font-mono tracking-tighter"
                    >
                      <RadioGroupItem
                        value={address.id}
                        id={`option-${index + 1}`}
                      />
                      <Label htmlFor={`option-${index + 1}`}>{`${
                        address.firstName
                      } ${address.lastName}, ${address.line1}${
                        address.line2 ? " " + address.line2 : ""
                      }, ${address.city}, ${address.province}, ${
                        address.country
                      }, ${address.zip}`}</Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <NoContent>No Addresses Saved</NoContent>
              )}
            </CardHeader>
            <CardContent>
              <Accordion
                className="border-t border-input font-mono"
                type="single"
                collapsible
                defaultValue={addresses.length <= 0 ? "add address" : undefined}
              >
                <AccordionItem value="add address">
                  <AccordionTrigger className="uppercase">
                    Add New Address
                  </AccordionTrigger>
                  <AccordionContent className="overflow-visible pt-4">
                    <AddressForm
                      onFormSubmit={async (values, reset, resetState) => {
                        try {
                          const response = await addAddress(values);
                          t3.addresses.getUserAddresses.setData(
                            undefined,
                            (cachedData) => {
                              if (!cachedData) return;
                              return [...cachedData, response];
                            },
                          );
                          reset();
                          resetState();
                          toast.success("Address Saved");
                        } catch (error) {
                          if (error instanceof TRPCClientError) {
                            toast.error(error.message);
                          }
                        }
                      }}
                      buttonLabel="Save"
                      className="mb-2 font-sans lg:w-full"
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
            <CardFooter>
              {checkingOut ? (
                <ButtonLoading size="form" />
              ) : (
                <Button
                  onClick={() => {
                    if (!selectedAddress) {
                      toast.error("No Shipping Address Provided");
                      return;
                    }
                    void checkout({
                      bagId: bag.id,
                      addressId: selectedAddress,
                    });
                  }}
                  size="form"
                >
                  <CircleDollarSign className="mr-2 h-6 w-6" /> Checkout with
                  Stripe
                </Button>
              )}
            </CardFooter>
          </Card>
          <Card className="h-fit font-mono lg:basis-2/3">
            <CardHeader
              onClick={() => void router.push(`/${bag.userId}`)}
              className="flex-row items-center gap-4 space-y-0"
            >
              <SafeImage
                url={bag.store.user.image}
                alt={bag.store.user.username}
                width={50}
                className="aspect-square overflow-hidden rounded-full"
              />
              <div>
                <p className="font-semibold">
                  {bag.store.user.name ?? "Seller"}
                </p>
                <p className="text-sm">@{bag.store.user.username}</p>
              </div>
            </CardHeader>
            <CardContent className="grid grid-flow-row grid-cols-1 gap-4 lg:grid-cols-2">
              {bag.bagItems.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <SafeImage
                    url={env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN + item.images[0]}
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
                      <p className="truncate font-semibold">{item.name}</p>
                      <p className="truncate text-sm">{item.description}</p>
                    </div>
                    <p className="col-span-5 flex items-center text-lg font-semibold">
                      <DollarSign className="h-5 w-5" />
                      {item.price / 100}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter className="flex-col gap-4 ">
              <div className="flex w-full items-end justify-between border-b border-input pb-2">
                <p className="text-sm uppercase">Item(s)</p>
                <p className="flex items-center text-lg font-semibold">
                  <DollarSign className="h-5 w-5" />
                  {bag.subTotal / 100}
                </p>
              </div>
              <div className="flex w-full items-end justify-between border-b border-input pb-2">
                <p className="text-sm uppercase">Estimated Shipping</p>
                <p className="flex items-center text-lg font-semibold">
                  <DollarSign className="h-5 w-5" />
                  {bag.shippingTotal / 100}
                </p>
              </div>
              <div className="flex w-full items-end justify-between">
                <p className="text-sm uppercase">Grand Total</p>
                <p className="flex items-center text-lg font-semibold">
                  <DollarSign className="h-5 w-5" />
                  {bag.grandTotal / 100}
                </p>
              </div>
            </CardFooter>
          </Card>
        </section>
      </main>
    </>
  );
};
export default Pay;
