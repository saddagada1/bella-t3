import { Button } from "./ui/button";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Sheet, SheetTrigger, SheetContent } from "./ui/sheet";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useRef } from "react";
import SearchInput from "./searchInput";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
import { departments, sources } from "~/utils/constants";
import { api } from "~/utils/api";
import { toast } from "sonner";

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
          <div className="my-4 grid grid-cols-2 grid-rows-3 gap-2">
            <Button asChild variant="outline">
              <Link href="/profile">Profile</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/store">Store</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/orders">Orders</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/settings">Settings</Link>
            </Button>
            <Button className="col-span-2" asChild variant="outline">
              <Link href="/notifications">Notifications</Link>
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
          <MenuLink href="/profile" label="Sources" />
          <MenuLink href="/profile" label="Menswear" />
          <MenuLink href="/profile" label="Womenswear" />
          <MenuLink href="/profile" label="Footwear" />
          <MenuLink href="/profile" label="Accessories" />
        </div>
        {/* <div className="my-6 flex flex-col space-y-4 text-xs uppercase text-muted-foreground">
          <Link href="/profile">Help</Link>
          <Link href="/profile">FAQ</Link>
          <Link href="/profile">About</Link>
        </div> */}
        {sessionStatus === "authenticated" && (
          <Button
            onClick={() => void signOut()}
            className="w-fit"
            variant="destructive"
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

const NavMenu = () => {
  return (
    <div className="fixed left-0 z-10 mt-[73px] hidden h-14 w-full border-y border-input bg-background/80 backdrop-blur-sm lg:block">
      <div className="container flex h-full items-center justify-between px-0">
        <Button variant="outline" asChild>
          <Link href="/designers">Designers</Link>
        </Button>
        <HoverCard openDelay={100} closeDelay={100}>
          <HoverCardTrigger asChild>
            <Button variant="outline" asChild>
              <Link href="/menswear">
                Sources
                <ChevronDown className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </HoverCardTrigger>
          <HoverCardContent className="grid w-fit auto-rows-fr grid-cols-2 gap-2">
            {sources.map((source, index) => (
              <Button
                asChild
                variant="ghost"
                className="justify-start"
                key={index}
              >
                <Link href="/menswear">{source}</Link>
              </Button>
            ))}
          </HoverCardContent>
        </HoverCard>
        <HoverCard openDelay={100} closeDelay={100}>
          <HoverCardTrigger asChild>
            <Button variant="outline" asChild>
              <Link href="/menswear">
                Menswear
                <ChevronDown className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </HoverCardTrigger>
          <HoverCardContent className="grid w-fit auto-rows-fr grid-cols-2 gap-2">
            {departments
              .find((department) => department.name === "Men")
              ?.categories.map((category, index) => (
                <Button
                  asChild
                  variant="ghost"
                  className="justify-start"
                  key={index}
                >
                  <Link href="/menswear">{category.name}</Link>
                </Button>
              ))}
          </HoverCardContent>
        </HoverCard>
        <HoverCard openDelay={100} closeDelay={100}>
          <HoverCardTrigger asChild>
            <Button variant="outline" asChild>
              <Link href="/menswear">
                Womenswear
                <ChevronDown className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </HoverCardTrigger>
          <HoverCardContent className="grid w-fit auto-rows-fr grid-cols-2 gap-2">
            {departments
              .find((department) => department.name === "Women")
              ?.categories.map((category, index) => (
                <Button
                  asChild
                  variant="ghost"
                  className="justify-start"
                  key={index}
                >
                  <Link href="/menswear">{category.name}</Link>
                </Button>
              ))}
          </HoverCardContent>
        </HoverCard>
        <Button variant="outline" asChild>
          <Link href="/menswear">Footwear</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/menswear">Accessories</Link>
        </Button>
      </div>
    </div>
  );
};

const Navbar: React.FC = () => {
  const { status: sessionStatus } = useSession();
  const menuContainer = useRef<HTMLElement>(null!);
  const { data: bagItemsCount, error: bagsItemsCountError } =
    api.bags.countBagItems.useQuery(undefined, {
      enabled: sessionStatus === "authenticated",
    });

  const { data: notifications, error: notificationsError } =
    api.notifications.getUserNotifications.useQuery(
      { limit: 10 },
      {
        enabled: sessionStatus === "authenticated",
      },
    );

  if (bagsItemsCountError ?? notificationsError) {
    toast.error("Could Not Fetch Some Data");
  }

  return (
    <>
      <nav
        ref={menuContainer}
        className="container fixed z-20 grid h-[73px] w-full grid-cols-4 bg-background/80 p-4 backdrop-blur-sm lg:grid-cols-6 lg:px-0"
      >
        <div className="flex lg:hidden">
          <SideMenu container={menuContainer.current} />
        </div>
        <div className="col-span-2 col-start-2 text-center font-display text-4xl lg:col-span-1 lg:col-start-1 lg:text-left">
          <Link href="/">bella</Link>
        </div>
        <SearchInput />
        <div className="flex justify-end gap-2 lg:col-start-6">
          {sessionStatus === "loading" ? null : sessionStatus ===
            "unauthenticated" ? (
            <>
              <Button className="hidden lg:flex" asChild variant="outline">
                <Link href="/sign-up">Sign Up</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/login">Login</Link>
              </Button>
            </>
          ) : (
            <>
              <HoverCard openDelay={100} closeDelay={100}>
                <HoverCardTrigger asChild>
                  <Button className="hidden lg:flex" asChild variant="outline">
                    <Link href="/notifications">
                      Notifications(0)
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent className="grid w-fit auto-rows-fr grid-cols-2 gap-2">
                  {notifications?.items.map((notification, index) => (
                    <p key={index}>{notification.message}</p>
                  ))}
                </HoverCardContent>
              </HoverCard>
              <HoverCard openDelay={100} closeDelay={100}>
                <HoverCardTrigger asChild>
                  <Button className="hidden lg:flex" asChild variant="outline">
                    <Link href="/profile">
                      Profile
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent className="flex w-fit flex-col">
                  <Button asChild variant="ghost" className="justify-start">
                    <Link href="/store">Store</Link>
                  </Button>
                  <Button asChild variant="ghost" className="justify-start">
                    <Link href="/orders">Orders</Link>
                  </Button>
                </HoverCardContent>
              </HoverCard>
              <Button variant="outline" asChild>
                <Link href="/bag">
                  Bag(
                  {bagItemsCount ?? 0})
                </Link>
              </Button>
            </>
          )}
        </div>
      </nav>
      <NavMenu />
      <div className="pt-[73px] lg:pt-[129px]" />
    </>
  );
};

export default Navbar;
