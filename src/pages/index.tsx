import Head from "next/head";
import Image from "next/image";
import { Disc3 } from "lucide-react";
import SearchInput from "~/components/searchInput";

const Home = () => {
  return (
    <>
      <Head>
        <title>Bella - Home</title>
      </Head>
      <main className="flex flex-1 flex-col px-4">
        <SearchInput />
        <section className="relative mt-2 flex aspect-video w-full items-end overflow-hidden rounded-3xl p-4 text-background will-change-transform">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute bottom-0 left-0 h-full w-full object-cover"
          >
            <source src="/media/videos/hero.mp4" />
          </video>
          <h1 className="z-10 font-mono text-3xl uppercase leading-none">
            embrace your own unique style.
          </h1>
          <Disc3 className="absolute right-4 top-4 h-8 w-8 animate-[spin_4s_linear_infinite]" />
        </section>
        <section className="mt-2 flex gap-2">
          <div className="relative aspect-video w-1/2 overflow-hidden rounded-3xl">
            <Image
              src="/media/images/hero1.jpeg"
              alt="hero-1"
              fill
              className="object-cover saturate-[.45]"
            />
          </div>
          <div className="flex flex-1 gap-2">
            <div className="relative w-1/2 overflow-hidden rounded-3xl">
              <Image
                src="/media/images/hero2.jpeg"
                alt="hero-2"
                fill
                className="object-cover saturate-[.45]"
              />
            </div>
            <div className="relative w-1/2 overflow-hidden rounded-3xl">
              <Image
                src="/media/images/hero3.jpeg"
                alt="hero-3"
                fill
                className="object-cover saturate-[.45]"
              />
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default Home;
