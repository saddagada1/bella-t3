import type { NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import { TRPCClientError } from "@trpc/client";
import { toast } from "sonner";
import AddressForm from "~/components/forms/addressForm";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Label } from "~/components/ui/label";
import LoadingView from "~/components/loadingView";
import ErrorView from "~/components/errorView";
import { useState } from "react";
import { FormTitle } from "~/components/ui/form";
import { Button, ButtonLoading } from "~/components/ui/button";

const UpdateOrder: NextPage = ({}) => {
  const router = useRouter();
  const t3 = api.useContext();
  const {
    data: order,
    isLoading: fetchingOrder,
    error: orderError,
  } = api.orders.getUserOrder.useQuery(
    {
      id: router.query.id as string,
    },
    {
      enabled: !!(router.query.id && typeof router.query.id === "string"),
    },
  );
  const {
    data: addresses,
    isLoading: fetchingAddresses,
    error: addressesError,
  } = api.addresses.getUserAddresses.useQuery();
  const { mutateAsync: addAddress } = api.addresses.create.useMutation();
  const { mutateAsync: updateOrder, isLoading: updatingOrder } =
    api.orders.updateUserOrder.useMutation({
      onError: (err) => {
        toast.error(err.message);
      },
      onSuccess: async () => {
        toast.success("Updated Your Order");
        await router.push("/orders");
        router.reload();
      },
    });
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);

  if (fetchingOrder || fetchingAddresses) {
    return <LoadingView />;
  }

  if ((!order || orderError) ?? (!addresses || addressesError)) {
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
        <title>Bella - Update Order</title>
      </Head>
      <main className="flex flex-1 flex-col px-6 py-4 lg:items-center lg:px-0 lg:py-8">
        <FormTitle className="mb-4 w-full">Update Order</FormTitle>
        <RadioGroup
          className="mb-4 w-full"
          onValueChange={(value) => setSelectedAddress(value)}
        >
          {addresses.map((address, index) => (
            <div key={index} className="flex items-center gap-2">
              <RadioGroupItem value={address.id} id={`option-${index + 1}`} />
              <Label
                className="font-sans text-sm font-medium normal-case leading-normal lg:text-base"
                htmlFor={`option-${index + 1}`}
              >{`${address.firstName} ${address.lastName}, ${address.line1}${
                address.line2 ? " " + address.line2 : ""
              }, ${address.city}, ${address.province}, ${address.country}, ${
                address.zip
              }`}</Label>
            </div>
          ))}
        </RadioGroup>
        <Accordion
          className="w-full border-t"
          type="single"
          collapsible
          defaultValue={addresses.length <= 0 ? "add address" : undefined}
        >
          <AccordionItem value="add address">
            <AccordionTrigger className="pr-1 uppercase">
              Add New Address
            </AccordionTrigger>
            <AccordionContent className="pt-4">
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
        <div className="w-full lg:flex lg:justify-end lg:pt-4">
          {updatingOrder ? (
            <ButtonLoading disabled size="form" className="lg:w-1/5" />
          ) : (
            <Button
              size="form"
              onClick={() => {
                if (!selectedAddress) {
                  toast.error("No Address Provided");
                  return;
                }
                try {
                  void updateOrder({
                    id: order.id,
                    addressId: selectedAddress,
                  });
                } catch (error) {
                  return;
                }
              }}
              className="lg:w-1/5"
            >
              Update
            </Button>
          )}
        </div>
      </main>
    </>
  );
};

export default UpdateOrder;
