import { ListPlus } from "lucide-react";
import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useElementSize } from "usehooks-ts";
import { Button } from "~/components/ui/button";
import SafeImage from "~/components/ui/safeImage";
import { Title } from "~/components/ui/typography/title";

const Profile: NextPage = ({}) => {
  const { data: session } = useSession();
  const [imageContainerRef, { height }] = useElementSize();
  return (
    <>
      <Head>
        <title>Bella - Your Profile</title>
      </Head>
      <main className="mt-2 flex flex-1 flex-col px-4">
        <Title className="mb-4">Profile</Title>
        <div className="mb-4 flex gap-4">
          <div ref={imageContainerRef}>
            <SafeImage
              url={session?.user.image}
              alt={session?.user.username ?? "profile"}
              width={height}
              className="relative aspect-square overflow-hidden rounded-full"
            />
          </div>
          <div className="flex-1 font-mono text-xxs tracking-tighter text-muted-foreground">
            <div className="grid grid-cols-8">
              <div className="col-span-5 space-y-1 border-r border-input pb-2">
                <p>Username</p>
                <p className="text-center text-sm text-foreground">
                  @{session?.user.username}
                </p>
              </div>
              <div className="col-span-3 space-y-1 pb-2 pl-2">
                <p>Products</p>
                <p className="text-center text-sm text-foreground">0</p>
              </div>
            </div>
            <div className="grid grid-cols-8 border-t border-input">
              <div className="col-span-2 space-y-1 border-r border-input pt-2">
                <p>Sales</p>
                <p className="text-center text-sm text-foreground">0</p>
              </div>
              <Link
                href="/followers"
                className="col-span-3 space-y-1 border-r border-input pl-2 pt-2"
              >
                <p>Followers</p>
                <p className="text-center text-sm text-foreground">0</p>
              </Link>
              <Link
                href="/following"
                className="col-span-3 space-y-1 pl-2 pt-2"
              >
                <p>Following</p>
                <p className="text-center text-sm text-foreground">0</p>
              </Link>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Button variant="secondary" asChild className="col-span-2 h-12">
            <Link href="/settings">Edit Profile</Link>
          </Button>
          <Button variant="secondary" asChild className="h-12">
            <Link href="/store">
              New
              <ListPlus className="ml-2 h-5 w-5 flex-shrink-0" />
            </Link>
          </Button>
        </div>
      </main>
    </>
  );
};
export default Profile;
