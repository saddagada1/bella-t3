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
import { Skeleton } from "~/components/ui/skeleton";
import { CircleDollarSign } from "lucide-react";

const StoreSettings: NextPage = ({}) => {
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();
  const { data: store, error: storeError } = api.store.get.useQuery(undefined, {
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
  const { data: accountLink, error: accountLinkError } =
    api.store.getStripeLinkURL.useQuery(
      { id: store?.stripeAccountId },
      {
        enabled: !!store && store.stripeSetupStatus === "not_started",
      },
    );
  const { mutateAsync: createStore } = api.store.create.useMutation();

  if (storeError ?? accountLinkError) {
    return "Error";
  }

  return (
    <>
      <Head>
        <title>Bella - Store Settings</title>
      </Head>
      <main className="flex flex-1 flex-col px-6 py-4">
        <FormTitle>Payments</FormTitle>
        <div className="mb-8 mt-4">
          {!store ||
          (store.stripeSetupStatus === "not_started" && !accountLink) ? (
            <Skeleton className="h-12 w-full rounded-full" />
          ) : store.stripeSetupStatus === "not_started" ? (
            <Button asChild size="form">
              <a href={accountLink}>
                <CircleDollarSign className="mr-2 h-6 w-6" /> Connect with
                Stripe
              </a>
            </Button>
          ) : store.stripeSetupStatus === "in_progress" ? (
            <Button disabled size="form" className="disabled:opacity-100">
              <CircleDollarSign className="mr-2 h-6 w-6 animate-spin" />
              Connecting with Stripe
            </Button>
          ) : (
            <Button disabled size="form" className="disabled:opacity-100">
              <CircleDollarSign className="mr-2 h-6 w-6 text-green-500" />
              Connected with Stripe
            </Button>
          )}
        </div>
        <AddressForm
          title="Billing Address"
          onSubmit={async (values) => {
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
