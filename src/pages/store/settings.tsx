import type { NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import { TRPCClientError } from "@trpc/client";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import AddressForm from "~/components/forms/addressForm";
import { FormTitle } from "~/components/ui/form";
import { Button } from "~/components/ui/button";
import { CircleDollarSign } from "lucide-react";
import ErrorView from "~/components/errorView";
import LoadingView from "~/components/loadingView";
import Link from "next/link";

const StoreSettings: NextPage = ({}) => {
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();
  const {
    data: store,
    isLoading: fetchingStore,
    error: storeError,
  } = api.store.get.useQuery(undefined, {
    onSuccess: (data) => {
      if (!session?.user.canSell && data.stripeSetupStatus === "complete") {
        void updateSession();
        if (
          router.query.redirect &&
          typeof router.query.redirect === "string"
        ) {
          void router.replace(router.query.redirect);
        }
      }
    },
  });
  const { data: accountLink } = api.store.getStripeLinkURL.useQuery(
    { id: store?.stripeAccountId },
    {
      enabled: !!store && store.stripeSetupStatus === "not_started",
      onError: () =>
        toast.error(
          "Could Not Connect To Stripe. Please Refresh And Try Again",
        ),
    },
  );
  const { mutateAsync: createStore } = api.store.create.useMutation();

  if (fetchingStore) {
    return <LoadingView />;
  }

  if (!store || storeError) {
    toast.error("Something Went Wrong");
    return (
      <ErrorView
        code="500"
        message="We couldn't fetch your store. This ones on us. Please refresh the page and try again."
      />
    );
  }

  return (
    <>
      <Head>
        <title>Bella - Store Settings</title>
      </Head>
      <main className="flex flex-1 flex-col px-6 py-4 lg:px-0 lg:py-8">
        <FormTitle>Payments</FormTitle>
        <div className="mb-8 mt-4 lg:w-1/4">
          {store.stripeSetupStatus === "not_started" ? (
            <Button asChild variant="secondary" size="form">
              <Link href={accountLink ?? "#"}>
                <CircleDollarSign className="mr-2 h-6 w-6" /> Connect with
                Stripe
              </Link>
            </Button>
          ) : store.stripeSetupStatus === "in_progress" ? (
            <Button
              disabled
              size="form"
              variant="secondary"
              className="disabled:opacity-100"
            >
              <CircleDollarSign className="mr-2 h-6 w-6 animate-spin" />
              Connecting with Stripe
            </Button>
          ) : (
            <Button
              disabled
              size="form"
              variant="secondary"
              className="disabled:opacity-100"
            >
              <CircleDollarSign className="mr-2 h-6 w-6 text-green-600" />
              Connected with Stripe
            </Button>
          )}
        </div>
        <AddressForm
          title="Billing Address"
          defaultValues={{
            firstName: store.firstName,
            lastName: store.lastName,
            line1: store.line1,
            line2: store.line2,
            city: store.city,
            province: store.province,
            zip: store.zip,
            country: store.country,
          }}
          onFormSubmit={async (values) => {
            try {
              await createStore(values);
              await updateSession();
              void router.replace("/store");
            } catch (error) {
              if (error instanceof TRPCClientError) {
                toast.error(`Error: ${error.message}`);
              }
              return;
            }
          }}
        />
      </main>
    </>
  );
};

export default StoreSettings;
