import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "~/components/ui/button";
import { designers } from "~/utils/constants";
import { cn } from "~/utils/shadcn/utils";
import { type Designer } from "~/utils/types";

const Designers: NextPage = ({}) => {
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  const [filter, setFilter] = useState("#");

  const data = useMemo(() => {
    const compare = (a: Designer, b: Designer) => {
      if (a.name < b.name) {
        return -1;
      }
      if (a.name > b.name) {
        return 1;
      }
      return 0;
    };
    if (filter === "#") {
      return designers
        .filter(
          (designer) =>
            !alphabet.includes(designer.name.slice(0, 1).toLowerCase()),
        )
        .sort(compare);
    } else {
      return designers
        .filter((designer) =>
          designer.name
            .slice(0, 1)
            .toLowerCase()
            .startsWith(filter.toLowerCase()),
        )
        .sort(compare);
    }
  }, [filter]);
  return (
    <>
      <Head>
        <title>Bella - Designers</title>
      </Head>
      <main className="flex flex-1 flex-col p-6 text-center lg:gap-8 lg:px-0">
        <div className="mb-8 flex flex-wrap justify-center gap-1 border-b pb-4 lg:mb-0">
          <Button
            className={cn("text-xl lg:text-2xl", filter === "#" && "underline")}
            onClick={() => setFilter("#")}
            variant="link"
          >
            #
          </Button>
          {alphabet.split("").map((letter, index) => (
            <Button
              onClick={() => setFilter(letter)}
              className={cn(
                "text-xl lg:text-2xl",
                filter === letter && "underline",
              )}
              key={index}
              variant="link"
            >
              {letter}
            </Button>
          ))}
        </div>
        <div className="grid grid-flow-row grid-cols-1 lg:grid-cols-4">
          {data.map((designer, index) => (
            <Button
              key={index}
              className="justify-start truncate"
              asChild
              variant="link"
            >
              <Link href={`/products?designer=${designer.slug}`}>
                {designer.name}
              </Link>
            </Button>
          ))}
        </div>
      </main>
    </>
  );
};

export default Designers;
