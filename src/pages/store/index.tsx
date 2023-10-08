import { type NextPage } from "next";
import Head from "next/head";
import { Title } from "~/components/ui/typography/title";
import { api } from "~/utils/api";

const Store: NextPage = ({}) => {
  const {
    data: store,
    isFetching: fetchingStore,
    error: storeError,
  } = api.store.get.useQuery();

  return (
    <>
      <Head>
        <title>Bella - Store</title>
      </Head>
      <main className="flex flex-1 flex-col px-6 py-4">
        <Title className="mb-4">Store</Title>
      </main>
    </>
  );
};
export default Store;
