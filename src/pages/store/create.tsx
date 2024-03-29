import type { NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import { TRPCClientError } from "@trpc/client";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import AddressForm from "~/components/forms/addressForm";

const CreateStore: NextPage = ({}) => {
  const { update: updateSession } = useSession();
  const { mutateAsync: createStore } = api.store.create.useMutation();
  const t3 = api.useContext();
  const router = useRouter();
  return (
    <>
      <Head>
        <title>Bella - Create Store</title>
      </Head>
      <main className="p flex flex-1 flex-col items-center justify-center">
        <AddressForm
          title="Create Store"
          buttonLabel="Create"
          className="w-full max-w-[600px]"
          onFormSubmit={async (values) => {
            try {
              const response = await createStore(values);
              t3.store.get.setData(undefined, () => {
                return response;
              });
              await updateSession();
              toast.success("Please link your account with Stripe to proceed.");
              void router.replace("/store/settings");
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

export default CreateStore;
