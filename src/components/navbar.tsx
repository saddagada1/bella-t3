import { Button } from "./ui/button";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Sheet, SheetTrigger, SheetContent } from "./ui/sheet";
import { ArrowRight } from "lucide-react";
import { useRef } from "react";

const MenuLink: React.FC<{ href: string; label: string }> = ({
  href,
  label,
}) => {
  return (
    <Link
      href={href}
      className="flex items-center justify-between border-b border-input pb-4 font-sans text-sm font-medium"
    >
      {label}
      <ArrowRight className="h-4 w-4" />
    </Link>
  );
};

const SideMenu: React.FC<{ container: HTMLElement }> = ({ container }) => {
  const { status: sessionStatus } = useSession();
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Menu</Button>
      </SheetTrigger>
      <SheetContent
        container={container}
        className="flex h-screen flex-col"
        side="left"
      >
        <Link href="/" className="font-display text-5xl">
          bella
        </Link>
        {sessionStatus === "authenticated" ? (
          <div className="my-4 flex gap-2 bg-background">
            <Button className="flex-1" asChild variant="outline">
              <Link href="/profile">Profile</Link>
            </Button>
            <Button className="flex-1" asChild variant="outline">
              <Link href="/store">Store</Link>
            </Button>
          </div>
        ) : (
          <div className="my-4 flex gap-2">
            <Button className="flex-1" asChild variant="outline">
              <Link href="/login">Login</Link>
            </Button>
            <Button className="flex-1" asChild variant="outline">
              <Link href="/sign-up">Sign Up</Link>
            </Button>
          </div>
        )}
        <div className="space-y-4 border-t border-input pt-6">
          <h2 className="mb-8 font-mono text-xl font-medium uppercase">
            Browse Inventory
          </h2>
          <MenuLink href="/profile" label="Designers" />
          <MenuLink href="/profile" label="Menswear" />
          <MenuLink href="/profile" label="Womenswear" />
          <MenuLink href="/profile" label="Footwear" />
          <MenuLink href="/profile" label="Accessories" />
          <MenuLink href="/profile" label="Jewelry" />
        </div>
        <div className="my-6 flex flex-col space-y-4 text-xs uppercase text-muted-foreground">
          <Link href="/profile">Help</Link>
          <Link href="/profile">FAQ</Link>
          <Link href="/profile">About</Link>
        </div>
        {sessionStatus === "authenticated" && (
          <Button
            onClick={() => void signOut()}
            className="w-fit"
            variant="link"
          >
            Sign Out
          </Button>
        )}
        <p className="mt-auto font-mono text-xs uppercase text-muted-foreground">
          Bella &copy; 2023
        </p>
      </SheetContent>
    </Sheet>
  );
};

const Navbar: React.FC = () => {
  const { status: sessionStatus } = useSession();
  const menuContainer = useRef<HTMLElement>(null!);
  return (
    <>
      <nav
        ref={menuContainer}
        className="fixed z-10 grid h-[73px] w-full grid-cols-4 bg-background/80 p-4 backdrop-blur-sm"
      >
        <div className="flex">
          <SideMenu container={menuContainer.current} />
        </div>
        <Link
          href="/"
          className="col-span-2 col-start-2 text-center font-display text-4xl"
        >
          bella
        </Link>
        <div className="flex justify-end">
          {sessionStatus === "loading" ? null : sessionStatus ===
            "unauthenticated" ? (
            <Button asChild variant="outline">
              <Link href="/login">Login</Link>
            </Button>
          ) : (
            <Button variant="outline">Bag(0)</Button>
          )}
        </div>
      </nav>
      <div className="pt-[73px]" />
    </>
  );
};

export default Navbar;
