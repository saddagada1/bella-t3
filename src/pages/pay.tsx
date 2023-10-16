import { TRPCClientError } from "@trpc/client";
import { CircleDollarSign } from "lucide-react";
import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "sonner";
import ErrorView from "~/components/errorView";
import AddressForm from "~/components/forms/addressForm";
import LoadingView from "~/components/loadingView";
import ProductCard from "~/components/productCard";
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
import { NoContent } from "~/components/ui/typography/noContent";
import { Title } from "~/components/ui/typography/title";
import { ValueLabel } from "~/components/ui/typography/valueLabel";
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
    toast.error("Something Went Wrong");
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
        <div className="flex flex-col-reverse gap-4 lg:flex-row-reverse">
          <Card className="h-fit lg:basis-1/3">
            <CardHeader>
              <FormTitle className="mb-4">Shipping Address</FormTitle>
              {addresses.length > 0 ? (
                <RadioGroup
                  onValueChange={(value) => setSelectedAddress(value)}
                >
                  {addresses.map((address, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <RadioGroupItem
                        value={address.id}
                        id={`option-${index + 1}`}
                      />
                      <Label
                        className="font-sans text-sm font-medium normal-case leading-normal lg:text-base"
                        htmlFor={`option-${index + 1}`}
                      >{`${address.firstName} ${address.lastName}, ${
                        address.line1
                      }${address.line2 ? " " + address.line2 : ""}, ${
                        address.city
                      }, ${address.province}, ${address.country}, ${
                        address.zip
                      }`}</Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <NoContent>No Addresses Saved</NoContent>
              )}
            </CardHeader>
            <CardContent>
              <Accordion
                className="border-t border-input"
                type="single"
                collapsible
                defaultValue={addresses.length <= 0 ? "add address" : undefined}
              >
                <AccordionItem value="add address">
                  <AccordionTrigger className="pr-1 uppercase">
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
                    try {
                      void checkout({
                        bagId: bag.id,
                        addressId: selectedAddress,
                      });
                    } catch (error) {
                      return;
                    }
                  }}
                  size="form"
                >
                  <CircleDollarSign className="mr-2 h-6 w-6" /> Checkout with
                  Stripe
                </Button>
              )}
            </CardFooter>
          </Card>
          <Card className="h-fit lg:basis-2/3">
            <CardHeader className="space-y-0">
              <FormTitle className="mb-4">Summary</FormTitle>
              <div className="flex w-full flex-col text-center text-sm font-medium lg:flex-row lg:items-start lg:text-base">
                <div className="flex flex-1">
                  <div className="flex-1 border-r border-input">
                    <ValueLabel className="ml-0 lg:ml-0">Seller</ValueLabel>
                    <Link
                      className="hover:underline"
                      href={`/${bag.store.user.username}`}
                    >
                      @{bag.store.user.username}
                    </Link>
                  </div>
                  <div className="flex-1">
                    <ValueLabel>Total Items</ValueLabel>
                    <p>{bag.bagItems.length}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-1 border-t border-input pt-4 lg:mt-0 lg:border-l lg:border-t-0 lg:pt-0">
                  <div className="flex-1 border-r border-input">
                    <ValueLabel className="ml-0">Discounts</ValueLabel>
                    <p>None</p>
                  </div>
                  <div className="col-span-4 flex-1">
                    <ValueLabel>Bundles</ValueLabel>
                    <p>None</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <FormTitle className="mb-4">Item(s)</FormTitle>
              <div className="grid grid-flow-row grid-cols-1 gap-4 lg:grid-cols-2">
                {bag.bagItems.map((item, index) => (
                  <ProductCard key={index} item={item} />
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex w-full flex-col gap-4 text-sm font-semibold lg:text-base">
                <FormTitle>Payment</FormTitle>
                <div className="flex items-end justify-between border-b border-input pb-2">
                  <ValueLabel className="mb-0 ml-0 lg:mb-0 lg:ml-0">
                    Item(s)
                  </ValueLabel>
                  <p>${bag.subTotal / 100}</p>
                </div>
                <div className="flex items-end justify-between border-b border-input pb-2">
                  <ValueLabel className="mb-0 ml-0 lg:mb-0 lg:ml-0">
                    Shipping Total
                  </ValueLabel>
                  {bag.shippingTotal === 0 ? (
                    <p className="uppercase text-green-600">Free</p>
                  ) : (
                    <p>${bag.shippingTotal / 100}</p>
                  )}
                </div>
                <div className="flex items-end justify-between">
                  <ValueLabel className="mb-0 ml-0 lg:mb-0 lg:ml-0">
                    Grand Total
                  </ValueLabel>
                  <p>${bag.grandTotal / 100}</p>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>
    </>
  );
};
export default Pay;
