import { Button } from "./ui/button";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Sheet, SheetTrigger, SheetContent } from "./ui/sheet";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";
import SearchInput from "./searchInput";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
import { departments, presetFilters, sources } from "~/utils/constants";
import { api } from "~/utils/api";
import { toast } from "sonner";
import NotificationCard from "./notificationCard";
import { NoContent } from "./ui/typography/noContent";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

const SideMenu: React.FC<{ container: HTMLElement }> = ({ container }) => {
  const { status: sessionStatus } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Sheet open={isOpen} onOpenChange={(o) => setIsOpen(o)}>
      <SheetTrigger asChild>
        <Button variant="outline">Menu</Button>
      </SheetTrigger>
      <SheetContent
        container={container}
        className="no-scrollbar flex h-screen flex-col overflow-y-scroll"
        side="left"
      >
        <h1 className="font-display text-5xl">bella</h1>
        {sessionStatus === "authenticated" ? (
          <div className="my-4 grid grid-cols-2 grid-rows-3 gap-2">
            <Button onClick={() => setIsOpen(false)} asChild variant="outline">
              <Link href="/profile">Profile</Link>
            </Button>
            <Button onClick={() => setIsOpen(false)} asChild variant="outline">
              <Link href="/store">Store</Link>
            </Button>
            <Button onClick={() => setIsOpen(false)} asChild variant="outline">
              <Link href="/orders">Orders</Link>
            </Button>
            <Button onClick={() => setIsOpen(false)} asChild variant="outline">
              <Link href="/settings">Settings</Link>
            </Button>
            <Button
              onClick={() => setIsOpen(false)}
              className="col-span-2"
              asChild
              variant="outline"
            >
              <Link href="/notifications">Notifications</Link>
            </Button>
          </div>
        ) : (
          <div className="my-4 flex gap-2">
            <Button
              onClick={() => setIsOpen(false)}
              className="flex-1"
              asChild
              variant="outline"
            >
              <Link href="/login">Login</Link>
            </Button>
            <Button
              onClick={() => setIsOpen(false)}
              className="flex-1"
              asChild
              variant="outline"
            >
              <Link href="/sign-up">Sign Up</Link>
            </Button>
          </div>
        )}
        <div className="space-y-4 border-t border-input pt-6">
          <h2 className="mb-8 font-mono text-xl font-medium uppercase">
            Browse Inventory
          </h2>
          <Accordion type="single" collapsible>
            <Link
              onClick={() => setIsOpen(false)}
              href="/designers"
              className="flex items-center justify-between border-b py-4 font-mono text-sm font-medium uppercase hover:underline lg:text-base"
            >
              Designers
              <ChevronRight className="h-4 w-4" />
            </Link>
            <AccordionItem value="sources">
              <AccordionTrigger className="!text-sm uppercase">
                Sources
              </AccordionTrigger>
              <AccordionContent>
                {sources.map((source, index) => (
                  <Button
                    onClick={() => setIsOpen(false)}
                    asChild
                    variant="link"
                    key={index}
                    className="pr-0"
                  >
                    <Link
                      className="w-full justify-between"
                      href={{
                        pathname: "/products",
                        query: {
                          filters: JSON.stringify(
                            presetFilters.sources[source.toLowerCase()],
                          ),
                        },
                      }}
                    >
                      {source}
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                ))}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="unisex">
              <AccordionTrigger className="!text-sm uppercase">
                Unisex
              </AccordionTrigger>
              <AccordionContent>
                {departments
                  .find((department) => department.name === "Unisex")
                  ?.categories.map((category, index) => (
                    <Button
                      onClick={() => setIsOpen(false)}
                      asChild
                      variant="link"
                      key={index}
                      className="pr-0"
                    >
                      <Link
                        className="w-full justify-between"
                        href={{
                          pathname: "/products",
                          query: {
                            filters: JSON.stringify(
                              presetFilters.unisex[category.name.toLowerCase()],
                            ),
                          },
                        }}
                      >
                        {category.name}
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  ))}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="menswear">
              <AccordionTrigger className="!text-sm uppercase">
                Menswear
              </AccordionTrigger>
              <AccordionContent>
                {departments
                  .find((department) => department.name === "Men")
                  ?.categories.map((category, index) => (
                    <Button
                      onClick={() => setIsOpen(false)}
                      asChild
                      variant="link"
                      key={index}
                      className="pr-0"
                    >
                      <Link
                        className="w-full justify-between"
                        href={{
                          pathname: "/products",
                          query: {
                            filters: JSON.stringify(
                              presetFilters.unisex[category.name.toLowerCase()],
                            ),
                          },
                        }}
                      >
                        {category.name}
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  ))}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="womenswear">
              <AccordionTrigger className="!text-sm uppercase">
                Womenswear
              </AccordionTrigger>
              <AccordionContent>
                {departments
                  .find((department) => department.name === "Women")
                  ?.categories.map((category, index) => (
                    <Button
                      onClick={() => setIsOpen(false)}
                      asChild
                      variant="link"
                      key={index}
                      className="pr-0"
                    >
                      <Link
                        className="w-full justify-between"
                        href={{
                          pathname: "/products",
                          query: {
                            filters: JSON.stringify(
                              presetFilters.unisex[category.name.toLowerCase()],
                            ),
                          },
                        }}
                      >
                        {category.name}
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  ))}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="footwear">
              <AccordionTrigger className="!text-sm uppercase">
                Footwear
              </AccordionTrigger>
              <AccordionContent>
                <Button
                  onClick={() => setIsOpen(false)}
                  asChild
                  variant="link"
                  className="pr-0"
                >
                  <Link
                    className="w-full justify-between"
                    href={{
                      pathname: "/products",
                      query: {
                        filters: JSON.stringify(presetFilters.footwear.unisex),
                      },
                    }}
                  >
                    Unisex
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  onClick={() => setIsOpen(false)}
                  asChild
                  variant="link"
                  className="pr-0"
                >
                  <Link
                    className="w-full justify-between"
                    href={{
                      pathname: "/products",
                      query: {
                        filters: JSON.stringify(presetFilters.footwear.men),
                      },
                    }}
                  >
                    Men
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  onClick={() => setIsOpen(false)}
                  asChild
                  variant="link"
                  className="pr-0"
                >
                  <Link
                    className="w-full justify-between"
                    href={{
                      pathname: "/products",
                      query: {
                        filters: JSON.stringify(presetFilters.footwear.women),
                      },
                    }}
                  >
                    Women
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        {sessionStatus === "authenticated" && (
          <Button
            onClick={() => {
              void signOut();
              setIsOpen(false);
            }}
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
              <p className="cursor-pointer">
                Sources
                <ChevronDown className="ml-2 h-4 w-4" />
              </p>
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
                <Link
                  href={{
                    pathname: "/products",
                    query: {
                      filters: JSON.stringify(
                        presetFilters.sources[source.toLowerCase()],
                      ),
                    },
                  }}
                >
                  {source}
                </Link>
              </Button>
            ))}
          </HoverCardContent>
        </HoverCard>
        <HoverCard openDelay={100} closeDelay={100}>
          <HoverCardTrigger asChild>
            <Button variant="outline" asChild>
              <p className="cursor-pointer">
                Unisex
                <ChevronDown className="ml-2 h-4 w-4" />
              </p>
            </Button>
          </HoverCardTrigger>
          <HoverCardContent className="grid w-fit auto-rows-fr grid-cols-2 gap-2">
            {departments
              .find((department) => department.name === "Unisex")
              ?.categories.map((category, index) => (
                <Button
                  asChild
                  variant="ghost"
                  className="justify-start"
                  key={index}
                >
                  <Link
                    href={{
                      pathname: "/products",
                      query: {
                        filters: JSON.stringify(
                          presetFilters.unisex[category.name.toLowerCase()],
                        ),
                      },
                    }}
                  >
                    {category.name}
                  </Link>
                </Button>
              ))}
          </HoverCardContent>
        </HoverCard>
        <HoverCard openDelay={100} closeDelay={100}>
          <HoverCardTrigger asChild>
            <Button variant="outline" asChild>
              <p className="cursor-pointer">
                Menswear
                <ChevronDown className="ml-2 h-4 w-4" />
              </p>
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
                  <Link
                    href={{
                      pathname: "/products",
                      query: {
                        filters: JSON.stringify(
                          presetFilters.men[category.name.toLowerCase()],
                        ),
                      },
                    }}
                  >
                    {category.name}
                  </Link>
                </Button>
              ))}
          </HoverCardContent>
        </HoverCard>
        <HoverCard openDelay={100} closeDelay={100}>
          <HoverCardTrigger asChild>
            <Button variant="outline" asChild>
              <p className="cursor-pointer">
                Womenswear
                <ChevronDown className="ml-2 h-4 w-4" />
              </p>
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
                  <Link
                    href={{
                      pathname: "/products",
                      query: {
                        filters: JSON.stringify(
                          presetFilters.women[category.name.toLowerCase()],
                        ),
                      },
                    }}
                  >
                    {category.name}
                  </Link>
                </Button>
              ))}
          </HoverCardContent>
        </HoverCard>
        <HoverCard openDelay={100} closeDelay={100}>
          <HoverCardTrigger asChild>
            <Button variant="outline" asChild>
              <p className="cursor-pointer">
                Footwear
                <ChevronDown className="ml-2 h-4 w-4" />
              </p>
            </Button>
          </HoverCardTrigger>
          <HoverCardContent className="grid w-fit auto-rows-fr grid-cols-2 gap-2">
            <Button asChild variant="ghost" className="justify-start">
              <Link
                href={{
                  pathname: "/products",
                  query: {
                    filters: JSON.stringify(presetFilters.footwear.unisex),
                  },
                }}
              >
                Unisex
              </Link>
            </Button>
            <Button asChild variant="ghost" className="justify-start">
              <Link
                href={{
                  pathname: "/products",
                  query: {
                    filters: JSON.stringify(presetFilters.footwear.men),
                  },
                }}
              >
                Men
              </Link>
            </Button>
            <Button asChild variant="ghost" className="justify-start">
              <Link
                href={{
                  pathname: "/products",
                  query: {
                    filters: JSON.stringify(presetFilters.footwear.women),
                  },
                }}
              >
                Women
              </Link>
            </Button>
          </HoverCardContent>
        </HoverCard>
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
                    <p className="cursor-pointer">
                      Notifications({notifications?.items.length ?? 0})
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </p>
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent className="flex w-[300px] flex-col gap-4">
                  {notifications && notifications.items.length > 0 ? (
                    notifications?.items.map((notification, index) => (
                      <NotificationCard
                        className={index !== 0 ? "border-t pt-4" : undefined}
                        key={index}
                        notification={notification}
                      />
                    ))
                  ) : (
                    <NoContent className="py-6 text-center">
                      No Recent Notifications
                    </NoContent>
                  )}
                  <Link
                    className="border-t pt-4 text-center text-sm font-medium hover:underline"
                    href="/notifications"
                  >
                    View All Notifications
                  </Link>
                </HoverCardContent>
              </HoverCard>
              <HoverCard openDelay={100} closeDelay={100}>
                <HoverCardTrigger asChild>
                  <Button className="hidden lg:flex" asChild variant="outline">
                    <p className="cursor-pointer">
                      Profile
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </p>
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent className="flex w-fit flex-col gap-4">
                  <Button asChild variant="ghost" className="justify-start">
                    <Link href="/store">Store</Link>
                  </Button>
                  <Button asChild variant="ghost" className="justify-start">
                    <Link href="/orders">Orders</Link>
                  </Button>
                  <Button asChild variant="ghost" className="justify-start">
                    <Link href="/profile">View Profile</Link>
                  </Button>
                  <Button
                    onClick={() => void signOut()}
                    variant="ghost"
                    className="justify-start hover:bg-destructive hover:text-background"
                  >
                    Sign Out
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
